from datetime import datetime, timedelta
import re
from typing import Optional

def format_post_title(text: str) -> str:
    """
    Extracts a title from the first sentence of a text.
    Limits to 10 words and adds ellipsis if truncated.
    """
    if not text:
        return "Untitled Post"

    # Find the first sentence (ends with ., ?, !)
    first_sentence_match = re.match(r"^([^.!?]*[.!?])", text)
    if first_sentence_match:
        sentence = first_sentence_match.group(1)
    else:
        sentence = text # If no punctuation, take the whole text

    words = sentence.split()
    if len(words) > 10:
        return " ".join(words[:10]) + "..."
    return sentence.strip()


def format_time_ago(date_string: str) -> str:
    """
    Formats a date string to a "time ago" string (e.g., "5 hours ago").
    """
    try:
        dt = datetime.fromisoformat(date_string.replace('Z', '+00:00')) # Handle 'Z' for UTC
        now = datetime.now(dt.tzinfo) # Ensure 'now' is timezone-aware if dt is
        
        # If dt is naive, assume UTC if it was 'Z', otherwise assume local
        if dt.tzinfo is None:
            now = datetime.now()
            dt = datetime.fromisoformat(date_string)

        diff = now - dt

        if diff < timedelta(minutes=1):
            return "just now"
        elif diff < timedelta(hours=1):
            minutes = int(diff.total_seconds() / 60)
            return f"{minutes} minute{'s' if minutes != 1 else ''} ago"
        elif diff < timedelta(days=1):
            hours = int(diff.total_seconds() / 3600)
            return f"{hours} hour{'s' if hours != 1 else ''} ago"
        elif diff < timedelta(weeks=1):
            days = int(diff.total_seconds() / (3600 * 24))
            return f"{days} day{'s' if days != 1 else ''} ago"
        elif diff < timedelta(days=30): # Approximate a month
            weeks = int(diff.total_seconds() / (3600 * 24 * 7))
            return f"{weeks} week{'s' if weeks != 1 else ''} ago"
        elif diff < timedelta(days=365): # Approximate a year
            months = int(diff.total_seconds() / (3600 * 24 * 30.4))
            return f"{months} month{'s' if months != 1 else ''} ago"
        else:
            years = int(diff.total_seconds() / (3600 * 24 * 365.25))
            return f"{years} year{'s' if years != 1 else ''} ago"
    except ValueError:
        return "Unknown date"

def extract_name_from_url(url: str) -> str:
    """
    Extracts a name from a URL, typically a profile URL.
    Example: https://www.linkedin.com/in/john-doe-123456/ -> John Doe
    """
    if not url:
        return "Unknown Author"
    
    match = re.search(r"linkedin\.com/in/([^/]+)", url)
    if match:
        name_part = match.group(1)
        name_parts = name_part.split('-')
        # Capitalize first letter of each part and join
        return " ".join([part.capitalize() for part in name_parts if part])
    
    return "Unknown Author"