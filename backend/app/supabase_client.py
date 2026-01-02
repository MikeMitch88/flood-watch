"""
Supabase Client Module (Optional)

This module provides optional Supabase features:
- Authentication (alternative to custom JWT)
- Storage (alternative to AWS S3)
- Realtime subscriptions (for live updates)

Usage is controlled by environment variables:
- USE_SUPABASE_AUTH
- USE_SUPABASE_STORAGE
- USE_SUPABASE_REALTIME
"""

from typing import Optional
from supabase import create_client, Client
from app.config import get_settings

settings = get_settings()

# Global Supabase client instance
_supabase_client: Optional[Client] = None


def get_supabase_client() -> Optional[Client]:
    """
    Get or create Supabase client instance.
    
    Returns:
        Supabase client if configured, None otherwise
    """
    global _supabase_client
    
    if _supabase_client is not None:
        return _supabase_client
    
    # Only initialize if Supabase credentials are provided
    if settings.SUPABASE_URL and settings.SUPABASE_ANON_KEY:
        _supabase_client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_ANON_KEY
        )
        return _supabase_client
    
    return None


def get_supabase_admin_client() -> Optional[Client]:
    """
    Get Supabase client with service role key (admin privileges).
    
    Use this for server-side operations that bypass RLS.
    
    Returns:
        Supabase admin client if configured, None otherwise
    """
    if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_KEY:
        return create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_KEY
        )
    
    return None


# Storage helpers
async def upload_to_supabase_storage(
    bucket: str,
    file_path: str,
    file_data: bytes,
    content_type: str = "application/octet-stream"
) -> Optional[str]:
    """
    Upload file to Supabase Storage.
    
    Args:
        bucket: Storage bucket name
        file_path: Path within bucket (e.g., "reports/image123.jpg")
        file_data: File binary data
        content_type: MIME type of the file
    
    Returns:
        Public URL of uploaded file, or None if upload fails
    """
    if not settings.USE_SUPABASE_STORAGE:
        return None
    
    client = get_supabase_admin_client()
    if client is None:
        return None
    
    try:
        # Upload file
        response = client.storage.from_(bucket).upload(
            file_path,
            file_data,
            {"content-type": content_type}
        )
        
        # Get public URL
        public_url = client.storage.from_(bucket).get_public_url(file_path)
        return public_url
    
    except Exception as e:
        print(f"Error uploading to Supabase Storage: {e}")
        return None


async def delete_from_supabase_storage(bucket: str, file_path: str) -> bool:
    """
    Delete file from Supabase Storage.
    
    Args:
        bucket: Storage bucket name
        file_path: Path within bucket
    
    Returns:
        True if successful, False otherwise
    """
    if not settings.USE_SUPABASE_STORAGE:
        return False
    
    client = get_supabase_admin_client()
    if client is None:
        return False
    
    try:
        client.storage.from_(bucket).remove([file_path])
        return True
    except Exception as e:
        print(f"Error deleting from Supabase Storage: {e}")
        return False


# Realtime helpers
def subscribe_to_changes(table: str, callback):
    """
    Subscribe to realtime changes on a table.
    
    Args:
        table: Table name to subscribe to
        callback: Function to call when changes occur
    
    Example:
        def on_new_report(payload):
            print(f"New report: {payload}")
        
        subscribe_to_changes("reports", on_new_report)
    """
    if not settings.USE_SUPABASE_REALTIME:
        return None
    
    client = get_supabase_client()
    if client is None:
        return None
    
    return client.table(table).on("INSERT", callback).subscribe()
