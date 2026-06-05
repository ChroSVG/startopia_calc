"""add price_buy price_sell, drop price

Revision ID: 2e5f8a1b3c7d
Revises: 4cf8d3b66d46
Create Date: 2026-06-05 19:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = '2e5f8a1b3c7d'
down_revision: Union[str, None] = '4cf8d3b66d46'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('mass_items', sa.Column('price_buy', sa.Integer(), nullable=True))
    op.add_column('mass_items', sa.Column('price_sell', sa.Integer(), nullable=True))
    op.execute("UPDATE mass_items SET price_buy = 0 WHERE price_buy IS NULL")
    op.execute("UPDATE mass_items SET price_sell = price WHERE price_sell IS NULL")
    op.alter_column('mass_items', 'price_buy', nullable=False)
    op.alter_column('mass_items', 'price_sell', nullable=False)
    op.drop_column('mass_items', 'price')


def downgrade() -> None:
    op.add_column('mass_items', sa.Column('price', sa.Integer(), nullable=True))
    op.execute("UPDATE mass_items SET price = price_sell WHERE price IS NULL")
    op.alter_column('mass_items', 'price', nullable=False)
    op.drop_column('mass_items', 'price_sell')
    op.drop_column('mass_items', 'price_buy')
