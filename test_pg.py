import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def main():
    engine = create_async_engine('postgresql+asyncpg://postgres:Lenovo%4014@localhost:5432/postgres')
    conn = await engine.connect()
    
    print("Appointments for July 6th:")
    result = await conn.execute(text("SELECT start_time, status FROM appointments WHERE date = '2026-07-06' ORDER BY start_time"))
    for r in result.fetchall():
        print(r)
        
    print("\nAppointments for July 7th:")
    result2 = await conn.execute(text("SELECT start_time, status FROM appointments WHERE date = '2026-07-07' ORDER BY start_time"))
    for r in result2.fetchall():
        print(r)
        
    await conn.close()

if __name__ == "__main__":
    asyncio.run(main())
