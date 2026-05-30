import asyncio
import redis.asyncio as aioredis
from src.config import Config

async def test_redis():
    print(f"Mencoba menyambung ke Redis di: {Config.REDIS_URL}")
    try:
        redis_conn = aioredis.from_url(Config.REDIS_URL)
        # Mencoba ping
        pong = await redis_conn.ping()
        if pong:
            print("✅ BERHASIL: Koneksi Redis lancar!")
        else:
            print("❌ GAGAL: Redis merespon tapi tidak memberikan PONG.")
    except Exception as e:
        print(f"❌ ERROR: Tidak bisa menyambung ke Redis. Pesan: {e}")
        print("\nSaran: Pastikan Redis sudah jalan (misal via Podman/Docker).")

if __name__ == "__main__":
    asyncio.run(test_redis())
