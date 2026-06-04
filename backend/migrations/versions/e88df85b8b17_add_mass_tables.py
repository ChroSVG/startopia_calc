"""add mass tables

Revision ID: e88df85b8b17
Revises: 2a3b4c5d6e7f
Create Date: 2026-06-04 07:44:42.488886

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


revision: str = 'e88df85b8b17'
down_revision: Union[str, None] = '2a3b4c5d6e7f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('masses',
        sa.Column('uid', sa.Uuid(), nullable=False),
        sa.Column('name', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('description', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('mode', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('user_uid', sa.Uuid(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('update_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_uid'], ['users.uid'], ),
        sa.PrimaryKeyConstraint('uid')
    )
    op.create_table('mass_items',
        sa.Column('uid', sa.Uuid(), nullable=False),
        sa.Column('mass_uid', sa.Uuid(), nullable=False),
        sa.Column('item_uid', sa.Uuid(), nullable=True),
        sa.Column('item_name', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('tree_rarity', sa.Integer(), nullable=False),
        sa.Column('max_blocks', sa.Integer(), nullable=False),
        sa.Column('jumlah_pohon', sa.Integer(), nullable=False),
        sa.Column('blok_yielded', sa.Integer(), nullable=False),
        sa.Column('total_smash_efektif', sa.Integer(), nullable=False),
        sa.Column('seeds_fallen', sa.Integer(), nullable=False),
        sa.Column('seeds_from_smash', sa.Integer(), nullable=False),
        sa.Column('total_seeds_return', sa.Integer(), nullable=False),
        sa.Column('seed_return_rate', sa.Float(), nullable=False),
        sa.Column('gem_blocks', sa.Integer(), nullable=False),
        sa.Column('avg_gems_per_block', sa.Float(), nullable=False),
        sa.Column('harvest_gems', sa.Integer(), nullable=False),
        sa.Column('total_gems_didapat', sa.Integer(), nullable=False),
        sa.Column('grow_time_seconds', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['item_uid'], ['items.uid'], ),
        sa.ForeignKeyConstraint(['mass_uid'], ['masses.uid'], ),
        sa.PrimaryKeyConstraint('uid')
    )


def downgrade() -> None:
    op.drop_table('mass_items')
    op.drop_table('masses')
