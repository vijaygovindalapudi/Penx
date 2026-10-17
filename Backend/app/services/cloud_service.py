"""
Cloud storage service for PenX.
"""

import uuid
from pathlib import Path

from app.core.config import settings
from app.core.supabase_client import supabase


class CloudService:
    """
    Handles PenX Cloud Storage operations.
    """

    # ==================================================
    # Upload File
    # ==================================================

    @staticmethod
    def upload_file(
        *,
        user_id: str,
        file_content: bytes,
        original_name: str,
        mime_type: str | None = None,
    ) -> dict:
        """
        Upload a file to Supabase Storage.

        Files are organized per user:

            user_id/
                unique-file-name

        Returns:
            Storage information.
        """

        # ------------------------------------------------
        # Generate unique storage filename
        # ------------------------------------------------

        file_extension = Path(
            original_name
        ).suffix

        encrypted_name = (
            f"{uuid.uuid4().hex}{file_extension}"
        )

        # ------------------------------------------------
        # Create user-specific storage path
        # ------------------------------------------------

        storage_path = (
            f"{user_id}/{encrypted_name}"
        )

        # ------------------------------------------------
        # Upload to Supabase Storage
        # ------------------------------------------------

        file_options = {
            "cache-control": "3600",
            "upsert": "false",
        }

        if mime_type:
            file_options["content-type"] = mime_type

        response = (
            supabase.storage
            .from_(settings.SUPABASE_BUCKET)
            .upload(
                path=storage_path,
                file=file_content,
                file_options=file_options,
            )
        )

        # ------------------------------------------------
        # Return storage information
        # ------------------------------------------------

        return {
            "original_name": original_name,
            "encrypted_name": encrypted_name,
            "storage_path": storage_path,
            "size": len(file_content),
            "mime_type": mime_type,
        }