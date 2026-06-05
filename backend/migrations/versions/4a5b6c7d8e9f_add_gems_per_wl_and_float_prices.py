"""add gems_per_wl to masses, change price to float

Revision ID: 4a5b6c7d8e9f
Revises: 3e6f9b2c4d8e
Create Date: 2026-06-05 21:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = '4a5b6c7d8e9f'
down_revision: Union[str, None] = '3e6f9b2c4d8e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('masses', sa.Column('gems_per_wl', sa.Integer(), nullable=False, server_default='100'))
    op.alter_column('mass_items', 'price_buy', type_=sa.Float(), existing_type=sa.Integer())
    op.alter_column('mass_items', 'price_sell', type_=sa.Float(), existing_type=sa.Integer())


def downgrade() -> None:
    op.alter_column('mass_items', 'price_sell', type_=sa.Integer(), existing_type=sa.Float())
    op.alter_column('mass_items', 'price_buy', type_=sa.Integer(), existing_type=sa.Float())
    op.drop_column('masses', 'gems_per_wl')
