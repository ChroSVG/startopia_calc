"""
Import growtopia items and links from SQLite into PostgreSQL.
Usage: python scripts/import_growtopia.py
Requires: DATABASE_URL in .env pointing to PostgreSQL
"""

import asyncio
from datetime import datetime
import uuid
from sqlalchemy import create_engine, text, select
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

from src.config import Config
from src.items.models import Item, ItemLink

GROWTOOPIA_DB = "/home/sellgo/Dokumen/growtopia_item/growtopia.db"


def read_sqlite_data():
    """Read all items and links from SQLite growtopia.db"""
    sqlite_engine = create_engine(f"sqlite:///{GROWTOOPIA_DB}")

    with sqlite_engine.connect() as conn:
        items_result = conn.execute(text(
            "SELECT id, name, rarity, description, max_drop, scraped, "
            "type, chi, texture_type, collision_type, seed_color, grow_time, "
            "default_gems_drop, hits_with_hand, hits_with_pickaxe, restore_time_seconds "
            "FROM items ORDER BY id"
        ))
        items = items_result.fetchall()

        links_result = conn.execute(text(
            "SELECT possibilities_id, recipes_id FROM item_links"
        ))
        links = links_result.fetchall()

    print(f"  Found {len(items)} items, {len(links)} links")
    return items, links


async def import_data():
    """Import data from SQLite to PostgreSQL"""
    items_data, links_data = read_sqlite_data()

    async_engine = create_async_engine(url=Config.DATABASE_URL, echo=False)
    async_session = async_sessionmaker(
        bind=async_engine, class_=AsyncSession, expire_on_commit=False
    )

    id_map = {}  # SQLite id -> PostgreSQL UUID

    async with async_session() as session:
        await session.execute(text("DELETE FROM item_links"))
        await session.execute(text("DELETE FROM inventory_items"))
        await session.execute(text("DELETE FROM activity_logs"))
        await session.execute(text("DELETE FROM items"))
        await session.commit()
        print("  Cleared existing data.")

        print("  Importing items...")
        for row in items_data:
            (
                sqlite_id, name, rarity, description, max_drop, scraped,
                item_type, chi, texture_type, collision_type, seed_color,
                grow_time, default_gems_drop, hits_with_hand,
                hits_with_pickaxe, restore_time_seconds
            ) = row

            new_uid = uuid.uuid4()
            id_map[sqlite_id] = new_uid

            now = datetime.now()
            item = Item(
                uid=new_uid,
                name=name,
                rarity=rarity,
                description=description,
                max_drop=max_drop,
                scraped=bool(scraped),
                type=item_type,
                chi=chi,
                texture_type=texture_type,
                collision_type=collision_type,
                seed_color=seed_color,
                grow_time=grow_time,
                default_gems_drop=default_gems_drop,
                hits_with_hand=hits_with_hand,
                hits_with_pickaxe=hits_with_pickaxe,
                restore_time_seconds=restore_time_seconds,
                created_at=now,
                update_at=now,
            )
            session.add(item)

        await session.commit()
        print(f"  Imported {len(items_data)} items.")

        print("  Importing links...")
        link_count = 0
        for source_id, target_id in links_data:
            if source_id in id_map and target_id in id_map:
                link = ItemLink(
                    uid=uuid.uuid4(),
                    source_uid=id_map[source_id],
                    target_uid=id_map[target_id],
                )
                session.add(link)
                link_count += 1

        await session.commit()
        print(f"  Imported {link_count} links.")

    await async_engine.dispose()
    print("  Done!")


if __name__ == "__main__":
    asyncio.run(import_data())
