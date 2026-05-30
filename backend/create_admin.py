import asyncio
import httpx
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from src.config import Config

async def register_and_verify():
    # 1. Register user via API (Port 8010)
    user_data = {
        "first_name": "Admin",
        "last_name": "User",
        "username": "admin",
        "email": "admin@example.com",
        "password": "password123"
    }
    
    print("Mendaftarkan user via API...")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post("http://localhost:8010/api/v1/auth/signup", json=user_data)
            print(f"Status Pendaftaran: {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"Gagal memanggil API: {e}. Pastikan server backend berjalan di port 8010.")

    # 2. Manual Verify in DB (karena kita tidak punya mail server yang aktif)
    print("\nMemverifikasi user di database...")
    engine = create_async_engine(Config.DATABASE_URL)
    async with engine.begin() as conn:
        await conn.execute(
            text("UPDATE users SET is_verified = True, is_active = True, is_superuser = True, role = 'admin' WHERE email = 'admin@example.com'")
        )
        print("User 'admin@example.com' sekarang sudah Verified dan menjadi Admin.")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(register_and_verify())
