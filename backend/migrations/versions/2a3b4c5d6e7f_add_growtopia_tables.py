"""add growtopia tables

Revision ID: 2a3b4c5d6e7f
Revises: 5de7e47c6a75
Create Date: 2026-05-30 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '2a3b4c5d6e7f'
down_revision: Union[str, None] = '5de7e47c6a75'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop foreign keys on old items table
    op.drop_constraint('items_category_uid_fkey', 'items', type_='foreignkey')
    op.drop_constraint('items_user_uid_fkey', 'items', type_='foreignkey')

    # Drop old items table
    op.drop_table('items')

    # Create new items table with growtopia fields
    op.create_table('items',
        sa.Column('uid', sa.Uuid(), nullable=False),
        sa.Column('name', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('rarity', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('description', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('max_drop', sa.Integer(), nullable=True),
        sa.Column('type', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('chi', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('texture_type', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('collision_type', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('seed_color', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('grow_time', sa.Integer(), nullable=True),
        sa.Column('default_gems_drop', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('hits_with_hand', sa.Integer(), nullable=True),
        sa.Column('hits_with_pickaxe', sa.Integer(), nullable=True),
        sa.Column('restore_time_seconds', sa.Integer(), nullable=True),
        sa.Column('scraped', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('created_by_uid', sa.Uuid(), nullable=True),
        sa.Column('created_at', postgresql.TIMESTAMP(), nullable=False, server_default=sa.func.now()),
        sa.Column('update_at', postgresql.TIMESTAMP(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['created_by_uid'], ['users.uid'], ),
        sa.PrimaryKeyConstraint('uid'),
        sa.UniqueConstraint('name'),
    )
    op.create_index(op.f('ix_items_name'), 'items', ['name'], unique=True)

    # Create inventory_items table
    op.create_table('inventory_items',
        sa.Column('uid', sa.Uuid(), nullable=False),
        sa.Column('user_uid', sa.Uuid(), nullable=False),
        sa.Column('item_uid', sa.Uuid(), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False, server_default=sa.text('1')),
        sa.Column('created_at', postgresql.TIMESTAMP(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['user_uid'], ['users.uid'], ),
        sa.ForeignKeyConstraint(['item_uid'], ['items.uid'], ),
        sa.PrimaryKeyConstraint('uid'),
    )

    # Create activity_logs table
    op.create_table('activity_logs',
        sa.Column('uid', sa.Uuid(), nullable=False),
        sa.Column('user_uid', sa.Uuid(), nullable=False),
        sa.Column('action', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('reference_type', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('reference_uid', sa.Uuid(), nullable=True),
        sa.Column('message', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('data', postgresql.JSON(), nullable=True),
        sa.Column('created_at', postgresql.TIMESTAMP(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['user_uid'], ['users.uid'], ),
        sa.PrimaryKeyConstraint('uid'),
    )

    # Create item_links table
    op.create_table('item_links',
        sa.Column('uid', sa.Uuid(), nullable=False),
        sa.Column('source_uid', sa.Uuid(), nullable=False),
        sa.Column('target_uid', sa.Uuid(), nullable=False),
        sa.ForeignKeyConstraint(['source_uid'], ['items.uid'], ),
        sa.ForeignKeyConstraint(['target_uid'], ['items.uid'], ),
        sa.PrimaryKeyConstraint('uid'),
    )


def downgrade() -> None:
    op.drop_table('item_links')
    op.drop_table('activity_logs')
    op.drop_table('inventory_items')
    op.drop_index(op.f('ix_items_name'), table_name='items')
    op.drop_table('items')

    # Recreate old items table
    op.create_table('items',
        sa.Column('uid', sa.Uuid(), nullable=False),
        sa.Column('title', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('description', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('user_uid', sa.Uuid(), nullable=True),
        sa.Column('created_at', postgresql.TIMESTAMP(), nullable=True),
        sa.Column('update_at', postgresql.TIMESTAMP(), nullable=True),
        sa.ForeignKeyConstraint(['user_uid'], ['users.uid'], ),
        sa.PrimaryKeyConstraint('uid'),
    )
    op.add_column('items', sa.Column('category_uid', sa.Uuid(), nullable=True))
    op.create_foreign_key('items_category_uid_fkey', 'items', 'categories', ['category_uid'], ['uid'])
