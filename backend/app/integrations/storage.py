import boto3
from botocore.exceptions import ClientError
from typing import Optional
import uuid
from datetime import datetime
import requests
from app.config import get_settings

settings = get_settings()


class StorageService:
    """Handle media file uploads to S3"""
    
    def __init__(self):
        if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_REGION
            )
            self.bucket_name = settings.AWS_S3_BUCKET
            self.enabled = True
        else:
            self.s3_client = None
            self.enabled = False
    
    def upload_from_url(self, file_url: str, file_type: str = "image") -> Optional[str]:
        """Download file from URL and upload to S3"""
        if not self.enabled:
            # Return original URL if S3 not configured (for development)
            return file_url
        
        try:
            # Download file
            response = requests.get(file_url, timeout=30)
            response.raise_for_status()
            
            # Generate unique filename
            timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
            extension = self._get_extension_from_url(file_url)
            filename = f"{file_type}s/{timestamp}_{uuid.uuid4()}{extension}"
            
            # Upload to S3
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=filename,
                Body=response.content,
                ContentType=response.headers.get('Content-Type', 'application/octet-stream'),
                ACL='public-read'
            )
            
            # Return S3 URL
            s3_url = f"https://{self.bucket_name}.s3.{settings.AWS_REGION}.amazonaws.com/{filename}"
            return s3_url
            
        except Exception as e:
            print(f"Error uploading to S3: {e}")
            return file_url  # Return original URL on error
    
    def upload_file(self, file_data: bytes, filename: str, content_type: str) -> Optional[str]:
        """Upload file directly from bytes"""
        if not self.enabled:
            return None
        
        try:
            timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
            s3_filename = f"uploads/{timestamp}_{filename}"
            
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=s3_filename,
                Body=file_data,
                ContentType=content_type,
                ACL='public-read'
            )
            
            s3_url = f"https://{self.bucket_name}.s3.{settings.AWS_REGION}.amazonaws.com/{s3_filename}"
            return s3_url
            
        except ClientError as e:
            print(f"Error uploading file to S3: {e}")
            return None
    
    def delete_file(self, file_url: str) -> bool:
        """Delete file from S3"""
        if not self.enabled:
            return False
        
        try:
            # Extract key from URL
            key = file_url.split(f"{self.bucket_name}.s3.{settings.AWS_REGION}.amazonaws.com/")[1]
            
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=key
            )
            return True
            
        except Exception as e:
            print(f"Error deleting file from S3: {e}")
            return False
    
    @staticmethod
    def _get_extension_from_url(url: str) -> str:
        """Extract file extension from URL"""
        # Remove query parameters
        url = url.split('?')[0]
        
        if '.' in url:
            return f".{url.split('.')[-1]}"
        return ""


# Global instance
storage = StorageService()
