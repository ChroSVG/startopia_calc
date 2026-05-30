import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from src.config import Config

async def run():
    engine = create_async_engine(Config.DATABASE_URL)
    async with engine.begin() as conn:
        await conn.execute(text('DROP TABLE IF EXISTS alembic_version CASCADE'))
        # Also drop other tables to avoid conflicts if they exist from old backend
        await conn.execute(text('DROP TABLE IF EXISTS "item" CASCADE'))
        await conn.execute(text('DROP TABLE IF EXISTS "user" CASCADE'))
        print('Dropped alembic_version and old tables')
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(run())
