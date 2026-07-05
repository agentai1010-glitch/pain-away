import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def main():
    engine = create_async_engine('sqlite+aiosqlite:///d:/PAIN_AWAY_1/backend/painaway.db')
    conn = await engine.connect()
    result = await conn.execute(text('SELECT date, start_time, status FROM appointments'))
    print(result.fetchall())
    await conn.close()

if __name__ == "__main__":
    asyncio.run(main())
