import asyncio
from app.db.session import async_session_factory
from sqlalchemy import text
import os

async def main():
    async with async_session_factory() as s:
        r = await s.execute(text("SELECT id, document_path FROM billing_documents"))
        for row in r.fetchall():
            doc_id, doc_path = row
            exists = os.path.exists(doc_path)
            print(f"  id={doc_id}, path={doc_path}, exists={exists}")

if __name__ == '__main__':
    asyncio.run(main())
