from dotenv import load_dotenv
from os import getenv
from openai import OpenAI

load_dotenv()

OPENAI_API_KEY = getenv("OPENAI_API_KEY")
openai_client = OpenAI(api_key=OPENAI_API_KEY)