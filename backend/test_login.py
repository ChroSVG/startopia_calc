import asyncio
import httpx

async def test_login():
    login_data = {
        "username": "admin@example.com",
        "password": "password123"
    }
    
    print("Mencoba login via API (Port 8010)...")
    try:
        async with httpx.AsyncClient() as client:
            # LoginAccessToken uses Form Data
            response = await client.post(
                "http://localhost:8010/api/v1/login/access-token", 
                data=login_data
            )
            print(f"Status Login: {response.status_code}")
            print(f"Response: {response.text}")
            if response.status_code == 200:
                print("✅ LOGIN BERHASIL!")
            else:
                print("❌ LOGIN GAGAL.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_login())
