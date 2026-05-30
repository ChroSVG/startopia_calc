"""update update user

Revision ID: 9cbeaf0d5d26
Revises: 8b599c57bcd1
Create Date: 2026-04-24 23:41:37.312446

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = '9cbeaf0d5d26'
down_revision: Union[str, None] = '8b599c57bcd1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
