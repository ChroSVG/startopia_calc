"""update terakhir

Revision ID: 8b599c57bcd1
Revises: 69635336b409
Create Date: 2026-04-24 23:06:18.037243

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = '8b599c57bcd1'
down_revision: Union[str, None] = '69635336b409'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
