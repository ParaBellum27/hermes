from sqlalchemy.dialects.postgresql import insert, JSONB
import sqlalchemy as sa
from sqlalchemy import func, exists, column, literal
from datetime import datetime
from app.models import DoppioProfile
from sqlmodel import Session, SQLModel, create_engine, select
from typing import Dict, List
from dotenv import load_dotenv
from os import getenv
from rapidfuzz import process
from rapidfuzz import fuzz
import copy
from collections import Counter
import numpy as np
import itertools
import re

load_dotenv()

DB_PASS = getenv("DB_PASS")

DATABASE_URL = f'cockroachdb://doppio-api:{DB_PASS}@doppio-zero-16972.j77.aws-us-east-1.cockroachlabs.cloud:26257/profiles?sslmode=require'

class DatabaseManager:
    def __init__(self, database_url:str = None):

        if database_url:
            self.database_url = database_url
        else:
            self.database_url = DATABASE_URL


        self.engine = create_engine(self.database_url, echo=True)

        with open("res/obj_store/clean_companies.txt") as file:
            self.companies = file.readlines()

    def create_tables(self):
        """Create all tables in the database."""
        SQLModel.metadata.create_all(self.engine)

    def get_session(self):
        with Session(self.engine) as session:
            yield session

    def build_sequential_regex(self, experience_steps: List[Dict[str, List[str]]]) -> str:
        """
        Builds a case-insensitive regex pattern for sequential company matching.
        Each company entry in the history string must contain all required keywords 
        for that step, in the order specified.

        Example input: [{'company': ['goldman', 'sachs']}, {'company': ['google']}]
        Expected output pattern logic:
            1. Find a substring containing 'goldman.*sachs'.
            2. Followed by a comma and space (', ').
            3. Followed by a gap (.*) allowing other companies.
            4. Followed by a substring containing 'google'.
        """
    
        # Start with the case-insensitive flag
        pattern_parts = ["(?i)"] 
        
        # Iterate through the required experience steps in order
        for i, step in enumerate(experience_steps):
            keywords: List[str] = step.get('company', [])
            if not keywords:
                continue
                
            # 1. Build the INNER pattern (Keywords within a single company name)
            #    Example: ['goldman', 'sachs'] -> 'goldman.*sachs'
            #    Escape keywords and join them with '.*' (allowing any characters between them)
            inner_keyword_pattern = '.*'.join(re.escape(k) for k in keywords)

            # 2. Build the FULL pattern for this step
            #    The pattern for a single company entry in the history string
            #    must start and end with '.*' to account for text before/after the keywords.
            #    Example: '.*goldman.*sachs.*'
            full_step_pattern = f".*{inner_keyword_pattern}.*"
            
            # 3. Append the pattern, including the sequential linkage/gap
            if i < len(experience_steps) - 1:
                # Match the required company, followed by the gap (which includes separators)
                # We use '.*?' to make the match non-greedy before the next required company
                # to be slightly more efficient.
                pattern_parts.append(full_step_pattern + '.*')
            else:
                # Last item only needs the company pattern followed by any remaining text
                pattern_parts.append(full_step_pattern + '.*')

            # Join all parts to form the final regex string.
        return ''.join(pattern_parts)

    def normalize_profile(self, profile: Dict) -> Dict:
        """
        Turn company names into keywords that are likely to be substrings in an appropriate company id

        Args:
           profile: The profile you would like to normalize
        """
        output = copy.deepcopy(profile)


        experiences = output.get('experience',"")
        

        #FOR EACH EXPERIENCE MAKE SURE THAT THE COMPANY TITLE MATCHES AN ACTUAL COMPANY ID
        if experiences:
            for experience in experiences:
                best_candidates = np.array(process.extract(experience.get("company"), choices=self.companies, scorer=fuzz.token_set_ratio))

                #splits each name match into these keywords e.g mckinesy
                best_companies = np.char.split(np.char.strip(best_candidates[:,0].copy()), '_')
                best_companies = list(itertools.chain.from_iterable(best_companies))
                print(best_companies)

                #counts each keywords, and if matches more than one that you are probably an important keyword
                counts = Counter(best_companies)
                
                #if really unique or not a lot of duplicates, fallback on most similar keyword
                results = [item for item, count in counts.items() if (count >= 2)]
                if len(results) == 0:
                    results = [best_companies[0]]

                experience['company'] = results

        #return a dictionary with normalize ids
        return output
    
    #totally vibecoded lol, fix later Tyler
    def create_query_from_ideal_profile(self, profile: Dict) -> Dict:
        """
        Create a sql query based on an idea profile

        Args:
           profile: the thing that comes out of create profile or resume.
        """
        normalized = self.normalize_profile(profile)
        experiences = normalized.get('experience', [])


        regex_pattern = self.build_sequential_regex(experiences)

            # 2. Get the field to query against
        # We access the property by its name and use func.lower() for robustness, 
        # although our pattern includes (?i) for case-insensitivity.
        history_field = DoppioProfile.company_history

        # 3. Construct the query
        
        # --- PostgreSQL Example ---
        # PostgreSQL uses the '~' operator for case-sensitive regex, and '~*' for case-insensitive.
        # Since we built a pattern with '(?i)', using '~' (or its func equivalent) is simpler.
        # func.regexp_match() is often a good portable choice.
        
        # Using the standard SQLAlchemy way for string matching with a custom operator:
        # Use the `op()` method to call the database's regex operator (e.g., '~*' for case-insensitive match in Postgres)
        query = select(DoppioProfile)

        if experiences:
            for step in experiences:
                keywords = step.get('company', [])
                for keyword in keywords:
                    # This generates: AND company_history ILIKE '%keyword%'
                    # It drastically reduces the search space for the subsequent regex.
                    query = query.where(history_field.ilike(f"%{keyword}%"))

        #force ordering            
        query = query.where(
            history_field.op('~*')(regex_pattern) 
        )

        # --- 2. Title Logic (Unnest / EXISTS) ---
        # "Do the same for titles": Check if the title from the first experience entry
        # exists anywhere in the candidate's experience list.
        if experiences and len(experiences) > 0:
            target_title = experiences[0].get('title')
            
            if target_title:
                # Unnest the experience array
                unnested_experience = func.jsonb_array_elements(DoppioProfile.experience).alias('exp_element')
                
                # Check if ANY row in the unnested experience has the matching title
                title_filter = exists(
                    select(literal(1))
                    .select_from(unnested_experience)
                    .where(
                        func.similarity(
                            column('exp_element', type_=JSONB)['title'].astext,
                            target_title
                        ) >= 0.5
                    )
                )
                query = query.where(title_filter)

        education_query = normalized.get('education', [])
        
        if education_query and len(education_query) > 0:
            # Get the search term (e.g., "stanford")
            target_institution = education_query[0].get('institution')
            
            if target_institution:
                # We alias the unnested array element so we can reference it
                # jsonb_array_elements explodes the list into rows
                unnested_education = func.jsonb_array_elements(DoppioProfile.education).alias('edu_element')
                
                # We want to find if EXISTS a row in the unnested education
                # where the 'institution' field contains our target string
                education_filter = exists(
                    select(literal(1))
                    .select_from(unnested_education)
                    .where(
                        # Access the 'institution' key as text and apply ILIKE
                        column('edu_element', type_=JSONB)['institution'].astext.ilike(f"%{target_institution}%")
                    )
                )
                
                # Append the AND condition
                query = query.where(education_filter)

        return query
        # The `~*` operator in PostgreSQL performs a case-insensitive regular expression match.

        # --- Alternative for other backends (e.g., SQLite/MySQL) ---
        # query = select(DoppioProfile).where(
        #     history_field.regexp_match(regex_pattern)
        # )
        
        # 4. Execute and return

       

    
    def search_db_for_profiles(self, session, profile: Dict) -> List[DoppioProfile]:
        # 1. Build the query object (Select statement)
        query = self.create_query_from_ideal_profile(profile)
        query = query.limit(30)
        results = session.exec(query).all()
        for row in results:
            print(row)
            print("==========================================================================================================================")
            
        return results
 

    @staticmethod
    def upsert(session: Session, data: Dict) -> None:
        """
        Upsert (insert or update) a profile record based on user_id.

        Args:
            session: SQLModel database session
            data: a dictionary where the keys represent the column name
        """
        # Ensure metadata field is properly named as profile_metadata
        if 'metadata' in data:
            data['profile_metadata'] = data.pop('metadata')

        # Create the insert statement
        stmt = insert(DoppioProfile).values(**data)

        # Define the update behavior on conflict (when user_id already exists)
        # Update all fields except id and user_id
        update_dict = {
            key: stmt.excluded[key]
            for key in data.keys()
            if key not in ['id', 'user_id']
        }

        # Add updated_at timestamp
        update_dict['updated_at'] = datetime.utcnow()

        # Create upsert statement with conflict resolution
        upsert_stmt = stmt.on_conflict_do_update(
            index_elements=['user_id'],  # Conflict on user_id unique constraint
            set_=update_dict
        )

        # Execute and commit
        session.execute(upsert_stmt)
        session.commit()

engine = create_engine(DATABASE_URL, echo=True)

if __name__ == "__main__":
    test_profile = {
        'experience' : [
            {
                'company' : "mckinsey",
                'title' : 'manager'
            },
            {
                'company' : "mckinsey",
                'title' : 'intern'
            },
        ],
        'education' : [
            {
                'institution': 'Stanford'
            }
        ]
    }
    manager = DatabaseManager()

    # 2. Manage session scope
    with Session(engine) as session:
        # Optional: Insert dummy data to test
        # manager.upsert(session, {"user_id": "u123", "experience": [{"company": "Goldman Sachs Group"}]})
        
        output = manager.search_db_for_profiles(session,test_profile)
        print(f"Found {len(output)} profiles")

db_manager = DatabaseManager(DATABASE_URL)