import asyncio
from app.db.session import async_session_factory
from app.reception.service import ReceptionService
from app.billing.schemas import CheckoutRequest
import uuid

async def main():
    async with async_session_factory() as session:
        service = ReceptionService(session)
        # Use Pravin Tarde's appointment e4792102-ab58-44e1-8ff1-7f7a93d5c5b3
        req = CheckoutRequest(
            appointment_id="e4792102-ab58-44e1-8ff1-7f7a93d5c5b3",
            payment_method="Cash"
        )
        try:
            res = await service.process_checkout(req)
            await session.commit()
            print("Checkout success!", res)
        except Exception as e:
            print("Checkout failed:", e)
            import traceback
            traceback.print_exc()

if __name__ == '__main__':
    asyncio.run(main())
