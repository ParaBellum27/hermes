from .filter_match import filter_match
from .normalizer_helpers import extract_latest_title
from .enhance_matches_with_llm import enhance_matches_with_llm
from app.handlers.pinecone_handler import pc_handler
from app.handlers.jina_handler import jina_handler
from app.handlers.database_manager import db_manager
from .similarity_helpers import *
from .score_helpers import *
import logging

logger = logging.getLogger(__name__)

def generate_rag_matches(profile, company_id, query:str):
    logger.info(f"=== Starting RAG Match Generation ===")
    logger.info(f"Company ID: {company_id}, Query: {query}")

    '''
    embedding = jina_handler.get_embeddings(profile)
    # Query Pinecone for similar profiles
    limit = 100
    print("Querying pinecone ...")
    if company_id and company_id != "":
        processed = company_id.lower().replace(' ', "_")
    else:
        processed = ""


    # Build filter if company_id is provided
    if processed != "":
        query_filter = {"company_id": {"$eq": processed}}
        print(f"Filter: {query_filter}")
        raw_matches = pc_handler.query_pinecone(embedding, top_k=limit, filter=query_filter)
    else:
        raw_matches = pc_handler.query_pinecone(embedding, top_k=limit)

    if len(raw_matches) == 0:
        raw_matches = pc_handler.query_pinecone(embedding, limit)
    '''
    raw_matches = []

    logger.info("Querying SQL database for profiles")

    session_gen = db_manager.get_session()
    session = next(session_gen)

    try:
        logger.debug("Searching database for matching profiles")
        sql_results = db_manager.search_db_for_profiles(session, profile)
        sql_matches_dicts = []
        for row in sql_results:
            # Convert using your model's .to_dict() method
            row_dict = row.to_dict()
            #shoots up sql over rag
            row_dict["similarity_score"] = 0.7

            sql_matches_dicts.append(row_dict)

        logger.info(f"[STEP 1] SQL query complete: {len(sql_matches_dicts)} matches found")
        logger.debug(f"[STEP 1] Match IDs: {[m.get('user_id', 'unknown') for m in sql_matches_dicts[:10]]}... (showing first 10)")
    finally:
        session.close()


    combined_matches = {m.get("user_id"): m for m in raw_matches}
    
    # Add SQL matches (they will overwrite Pinecone matches if user_id collides, 
    # or you can reverse the order if you prefer Pinecone data)
    for m in sql_matches_dicts:
        user_id = m.get("user_id")
        # Only add if not already present (or update if you prefer)
        if user_id not in combined_matches:
            combined_matches[user_id] = m
            
    # Convert back to list for the scoring loop
    raw_matches = list(combined_matches.values())
    logger.info(f"[STEP 1] Total combined matches (Vector + SQL): {len(raw_matches)}")

    print(f"Num of raw_matches: {len(raw_matches)}")
    logger.info(f"[STEP 1] Raw Matches Retrieved: {len(raw_matches)}")

    print("Sorting Raw Vector matches...")
    logger.info(f"[STEP 2] Starting Hybrid Scoring and Reranking")
    reranked = []
    resume_skills = set(profile.get("skills", []))
    resume_location = profile.get("locations", [None])[0]
    resume_title = extract_latest_title(profile.get("experience", []))
    resume_edu = profile.get("education", [])
    resume_company = company_id  # Used for bias if passed

    for idx, match in enumerate(raw_matches):
        match_skills = set(match.get("skills", []))
        skill_score = jaccard_similarity(resume_skills, match_skills)

        match_locations = match.get("locations", [None])
        if len(match_locations) != 0:
            match_location = match_locations[0]
        else:
            match_location = "none"
        location_bonus = 1.0 if resume_location and resume_location == match_location else 0.0

        match_title = extract_latest_title(match.get("experience", []))
        title_score = title_similarity(resume_title, match_title)

        company_bonus = 0.0
        if resume_company:
            for job in match.get("experience", []):
                if not job:
                    break
                if resume_company.lower() in (job.get("company", "").lower()):
                    company_bonus = 1.0
                    break

        completeness = profile_completeness(match)
        school_score = shared_school_score(resume_edu, match.get("education", []))
        degree_score = degree_field_similarity(resume_edu, match.get("education", []))

        vector_score = match["similarity_score"]  # from Pinecone

        # Final weighted score
        final_score = (
            0.4 * vector_score +
            0.2 * skill_score +
            0.1 * title_score +
            0.1 * location_bonus +
            0.05 * company_bonus +
            0.05 * completeness +
            0.05 * school_score +
            0.05 * degree_score
        )

        match["hybrid_score"] = round(final_score, 4)
        reranked.append(match)
        logger.debug(f"[STEP 2] Match {idx + 1}/{len(raw_matches)}: ID={match.get('user_id', 'unknown')}, hybrid_score={match['hybrid_score']}, vector_score={vector_score}")

    print(f"Raw Match Sorting Complete, Reranked length: {len(reranked)}")
    logger.info(f"[STEP 2] Hybrid Scoring Complete: {len(reranked)} matches reranked")
    logger.debug(f"[STEP 2] Sample scores: {[(m.get('user_id', 'unknown'), m['hybrid_score']) for m in reranked[:5]]}")

    # Sort and select top 20
    reranked.sort(key=lambda x: x["hybrid_score"], reverse=True)
    logger.info(f"[STEP 3] Matches Sorted by hybrid_score")
    logger.debug(f"[STEP 3] Top 10 after sorting: {[(m.get('user_id', 'unknown'), m['hybrid_score']) for m in reranked[:10]]}")


    # Filter matches to only include useful fields
    filtered_matches = [filter_match(m) for m in reranked]
    logger.info(f"[STEP 4] Matches Filtered: {len(filtered_matches)} matches")

    top_matches = filtered_matches[:30]
    logger.info(f"[STEP 5] Top 30 Matches Selected: {len(top_matches)} matches")
    logger.debug(f"[STEP 5] Top 30 match IDs: {[m.get('user_id', 'unknown') for m in top_matches]}")

    

    # Enhance matches with LLM (shorten summaries and add similarity explanations)
    print(f"sending to LLM... {len(top_matches)}")
    #enhanced_matches = enhance_matches_with_llm(top_matches, profile, query, ideal_candidate=False)


    # Return final response
    final_response = {
        'profile': filter_match(profile),
        'matches': top_matches,
        'total_matches': len(top_matches),
        'message': 'Profile processed and matches found'
    }

    logger.info(f"[STEP 6] Final Response Generated: {len(final_response['matches'])} matches in response")
    logger.info(f"=== RAG Match Generation Complete ===")

    return final_response