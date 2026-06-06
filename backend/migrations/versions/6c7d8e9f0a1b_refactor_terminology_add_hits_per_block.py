"""refactor terminology: rename columns, add hits_per_block

Revision ID: 6c7d8e9f0a1b
Revises: 5b6c7d8e9f0a
Create Date: 2026-06-06 09:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = '6c7d8e9f0a1b'
down_revision: Union[str, None] = '5b6c7d8e9f0a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column('mass_items', 'blok_yielded', new_column_name='blocks_produced')
    op.alter_column('mass_items', 'total_smash_efektif', new_column_name='total_blocks_broken')
    op.alter_column('mass_items', 'seeds_fallen', new_column_name='seeds_from_tree')
    op.alter_column('mass_items', 'seeds_from_smash', new_column_name='seeds_from_break')
    op.alter_column('mass_items', 'gem_blocks', new_column_name='gem_producing_blocks')
    op.alter_column('mass_items', 'harvest_gems', new_column_name='gems_from_tree')
    op.alter_column('mass_items', 'total_gems_didapat', new_column_name='total_gems')
    op.alter_column('mass_items', 'jumlah_pohon', new_column_name='tree_count')
    op.add_column('mass_items', sa.Column('hits_per_block', sa.Integer(), nullable=False, server_default='3'))


def downgrade() -> None:
    op.drop_column('mass_items', 'hits_per_block')
    op.alter_column('mass_items', 'tree_count', new_column_name='jumlah_pohon')
    op.alter_column('mass_items', 'total_gems', new_column_name='total_gems_didapat')
    op.alter_column('mass_items', 'gems_from_tree', new_column_name='harvest_gems')
    op.alter_column('mass_items', 'gem_producing_blocks', new_column_name='gem_blocks')
    op.alter_column('mass_items', 'seeds_from_break', new_column_name='seeds_from_smash')
    op.alter_column('mass_items', 'seeds_from_tree', new_column_name='seeds_fallen')
    op.alter_column('mass_items', 'total_blocks_broken', new_column_name='total_smash_efektif')
    op.alter_column('mass_items', 'blocks_produced', new_column_name='blok_yielded')
