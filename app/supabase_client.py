import os
from supabase import create_client, Client

def get_supabase_client() -> Client:
    url: str = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    key: str = os.getenv("SUPABASE_SECRET_KEY")

    if not url:
        raise ValueError("Environment variable NEXT_PUBLIC_SUPABASE_URL is not set.")
    if not key:
        raise ValueError("Environment variable SUPABASE_SECRET_KEY is not set.")

    # Supabase client with service role key bypasses RLS
    # auth options like autoRefreshToken and persistSession are not applicable for service key
    supabase_client: Client = create_client(url, key)
    return supabase_client

# Singleton instance
supabase_service_client = get_supabase_client()
