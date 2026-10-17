"""add username and penx id to users

Revision ID: add_username_penx_id
Revises: 86415ef3b846
Create Date: 2026-08-11
"""

from typing import Sequence, Union
import re
import uuid

from alembic import op
import sqlalchemy as sa


# ======================================================
# Revision identifiers
# ======================================================

revision: str = "cfdd2c34295b"

down_revision: Union[str, Sequence[str], None] = "1aed1e0d4e03"

branch_labels: Union[str, Sequence[str], None] = None

depends_on: Union[str, Sequence[str], None] = None


# ======================================================
# Upgrade
# ======================================================

def upgrade() -> None:
    """
    Add username and PenX ID to existing users.
    """

    # --------------------------------------------------
    # Step 1: Add columns temporarily nullable
    # --------------------------------------------------

    op.add_column(
        "users",
        sa.Column(
            "penx_id",
            sa.String(length=32),
            nullable=True,
        ),
    )

    op.add_column(
        "users",
        sa.Column(
            "username",
            sa.String(length=30),
            nullable=True,
        ),
    )

    # --------------------------------------------------
    # Step 2: Read existing users
    # --------------------------------------------------

    connection = op.get_bind()

    users = connection.execute(
        sa.text(
            """
            SELECT id, email
            FROM users
            ORDER BY created_at, id
            """
        )
    ).fetchall()

    # --------------------------------------------------
    # Step 3: Generate values for existing users
    # --------------------------------------------------

    used_usernames = set()

    for user in users:

        user_id = user.id
        email = user.email

        # ----------------------------------------------
        # Generate username from email
        # ----------------------------------------------

        email_prefix = email.split("@")[0]

        username = re.sub(
            r"[^a-zA-Z0-9._-]",
            "",
            email_prefix,
        )

        username = username[:30]

        if len(username) < 3:
            username = "user"

        base_username = username
        counter = 1

        while username.lower() in used_usernames:

            suffix = f"_{counter}"

            username = (
                base_username[:30 - len(suffix)]
                + suffix
            )

            counter += 1

        used_usernames.add(
            username.lower()
        )

        # ----------------------------------------------
        # Generate PenX ID
        # ----------------------------------------------

        penx_id = (
            "PX-"
            + uuid.uuid4().hex[:20].upper()
        )

        # ----------------------------------------------
        # Update existing user
        # ----------------------------------------------

        connection.execute(
            sa.text(
                """
                UPDATE users
                SET
                    username = :username,
                    penx_id = :penx_id
                WHERE id = :user_id
                """
            ),
            {
                "username": username,
                "penx_id": penx_id,
                "user_id": user_id,
            },
        )

    # --------------------------------------------------
    # Step 4: Make fields mandatory
    # --------------------------------------------------

    op.alter_column(
        "users",
        "username",
        existing_type=sa.String(length=30),
        nullable=False,
    )

    op.alter_column(
        "users",
        "penx_id",
        existing_type=sa.String(length=32),
        nullable=False,
    )

    # --------------------------------------------------
    # Step 5: Unique indexes
    # --------------------------------------------------

    op.create_index(
        "ix_users_username",
        "users",
        ["username"],
        unique=True,
    )

    op.create_index(
        "ix_users_penx_id",
        "users",
        ["penx_id"],
        unique=True,
    )


# ======================================================
# Downgrade
# ======================================================

def downgrade() -> None:
    """
    Remove username and PenX ID.
    """

    op.drop_index(
        "ix_users_penx_id",
        table_name="users",
    )

    op.drop_index(
        "ix_users_username",
        table_name="users",
    )

    op.drop_column(
        "users",
        "penx_id",
    )

    op.drop_column(
        "users",
        "username",
    )