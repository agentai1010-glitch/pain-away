import asyncio
import httpx

async def test():
    async with httpx.AsyncClient(base_url="http://127.0.0.1:8000") as client:
        # Test valid login
        r1 = await client.post("/api/v1/reception/login", json={"username": "admin", "password": "admin123"})
        print("Login status:", r1.status_code)
        if r1.status_code == 200:
            token = r1.json()["access_token"]
            
            # Test dashboard
            r2 = await client.get("/api/v1/reception/dashboard", headers={"Authorization": f"Bearer {token}"})
            print("Dashboard status:", r2.status_code)
            print("Dashboard content:", r2.json())
            
        # Test invalid login
        r3 = await client.post("/api/v1/reception/login", json={"username": "admin", "password": "wrong"})
        print("Invalid login status:", r3.status_code)

if __name__ == "__main__":
    asyncio.run(test())
