def filter_match(match):
    current_company = None
    for exp in match.get('experience', []):
        if exp.get('active_experience') == 1:
            current_company = exp.get('company_name')
            break
    if not current_company:
        current_company = "unknown"

    # Filter experience to only include company and title
    filtered_experiences = []
    for exp in match.get('experience', []):
        filtered_exp = {
            'company': exp.get('company'),
            'title': exp.get('title')
        }
        filtered_experiences.append(filtered_exp)

    # Filter education to only include institution and field
    filtered_education = []
    for edu in match.get('education', []):
        filtered_edu = {
            'institution': edu.get('institution'),
            'field': edu.get('field')
        }
        filtered_education.append(filtered_edu)

    # Create filtered match with only useful fields
    filtered_match = {
        'full_name': match.get('full_name'),
        'first_name': match.get('first_name'),
        'last_name': match.get('last_name'),
        'user_id': match.get('user_id'),
        'company_id': current_company,
        'experience': filtered_experiences,
        'summary': match.get('summary'),
        'education': filtered_education,
        'skills': match.get('skills', []),
        'interests': match.get('interests', []),
        'hobbies': match.get('hobbies', []),
        'languages': match.get('languages', []),
        'locations': match.get('locations', []),
        'cities': match.get('cities', []),
        'hybrid_score': match.get('hybrid_score'),
        'linkedin': match.get('social_links', {}).get("linkedin") if match.get('social_links') else None
    }
    return filtered_match