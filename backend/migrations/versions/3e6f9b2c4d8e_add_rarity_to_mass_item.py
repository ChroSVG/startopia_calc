"""add rarity to mass_item

Revision ID: 3e6f9b2c4d8e
Revises: 2e5f8a1b3c7d
Create Date: 2026-06-05 20:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = '3e6f9b2c4d8e'
down_revision: Union[str, None] = '2e5f8a1b3c7d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('mass_items', sa.Column('rarity', sa.String(), nullable=False, server_default=''))


def downgrade() -> None:
    op.drop_column('mass_items', 'rarity')
