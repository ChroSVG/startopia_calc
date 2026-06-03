"""
Import growtopia items and links from SQLite into PostgreSQL (upsert).
Preserves existing inventory_items and activity_logs.
Usage: python scripts/import_growtopia.py
Requires: DATABASE_URL in .env pointing to PostgreSQL
"""

import asyncio
from datetime import datetime
import uuid
from sqlalchemy import create_engine, text
from sqlalchemy.dialects.postgresql import insert as pg_insert
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
    """Upsert items and links from SQLite to PostgreSQL"""
    items_data, links_data = read_sqlite_data()

    async_engine = create_async_engine(url=Config.DATABASE_URL, echo=False)
    async_session = async_sessionmaker(
        bind=async_engine, class_=AsyncSession, expire_on_commit=False
    )

    async with async_session() as session:
        # Build name -> UUID map from existing PG items
        existing = (await session.execute(select(Item))).scalars().all()
        name_to_uid: dict[str, uuid.UUID] = {item.name: item.uid for item in existing}
        sqlite_to_pg: dict[int, uuid.UUID] = {}

        print(f"  Existing items in PG: {len(existing)}")

        now = datetime.now()
        inserted = 0
        updated = 0

        for row in items_data:
            (
                sqlite_id, name, rarity, description, max_drop, scraped,
                item_type, chi, texture_type, collision_type, seed_color,
                grow_time, default_gems_drop, hits_with_hand,
                hits_with_pickaxe, restore_time_seconds
            ) = row

            if name in name_to_uid:
                uid = name_to_uid[name]
                sqlite_to_pg[sqlite_id] = uid
                stmt = (
                    pg_insert(Item)
                    .values(
                        uid=uid, name=name, rarity=rarity, description=description,
                        max_drop=max_drop, scraped=bool(scraped), type=item_type,
                        chi=chi, texture_type=texture_type, collision_type=collision_type,
                        seed_color=seed_color, grow_time=grow_time,
                        default_gems_drop=default_gems_drop, hits_with_hand=hits_with_hand,
                        hits_with_pickaxe=hits_with_pickaxe,
                        restore_time_seconds=restore_time_seconds,
                        update_at=now,
                    )
                    .on_conflict_do_update(
                        index_elements=["name"],
                        set_={
                            "rarity": rarity, "description": description,
                            "max_drop": max_drop, "scraped": bool(scraped),
                            "type": item_type, "chi": chi,
                            "texture_type": texture_type, "collision_type": collision_type,
                            "seed_color": seed_color, "grow_time": grow_time,
                            "default_gems_drop": default_gems_drop,
                            "hits_with_hand": hits_with_hand,
                            "hits_with_pickaxe": hits_with_pickaxe,
                            "restore_time_seconds": restore_time_seconds,
                            "update_at": now,
                        },
                    )
                )
                await session.execute(stmt)
                updated += 1
            else:
                uid = uuid.uuid4()
                name_to_uid[name] = uid
                sqlite_to_pg[sqlite_id] = uid
                item = Item(
                    uid=uid, name=name, rarity=rarity, description=description,
                    max_drop=max_drop, scraped=bool(scraped), type=item_type,
                    chi=chi, texture_type=texture_type, collision_type=collision_type,
                    seed_color=seed_color, grow_time=grow_time,
                    default_gems_drop=default_gems_drop, hits_with_hand=hits_with_hand,
                    hits_with_pickaxe=hits_with_pickaxe,
                    restore_time_seconds=restore_time_seconds,
                    created_at=now, update_at=now,
                )
                session.add(item)
                inserted += 1

        await session.commit()
        print(f"  Inserted {inserted} new items, updated {updated} existing items.")

        # Rebuild links: clear existing, re-insert
        await session.execute(text("DELETE FROM item_links"))
        await session.commit()

        print("  Importing links...")
        link_count = 0
        for source_id, target_id in links_data:
            if source_id in sqlite_to_pg and target_id in sqlite_to_pg:
                link = ItemLink(
                    uid=uuid.uuid4(),
                    source_uid=sqlite_to_pg[source_id],
                    target_uid=sqlite_to_pg[target_id],
                )
                session.add(link)
                link_count += 1

        await session.commit()
        print(f"  Imported {link_count} links.")

    await async_engine.dispose()
    print("  Done!")


if __name__ == "__main__":
    from sqlalchemy import select
    asyncio.run(import_data())
