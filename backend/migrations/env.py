"""Alembic environment configuration for async SQLAlchemy."""

import asyncio
import sys
from logging.config import fileConfig
from pathlib import Path

from alembic import context
from sqlalchemy import pool
from sqlalchemy.ext.asyncio import async_engine_from_config

# ---------------------------------------------------------------------------
# Ensure the backend source is on sys.path so `app.*` imports work
# when running `alembic` from the backend/ directory.
# ---------------------------------------------------------------------------
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from app.config.settings import settings  # noqa: E402
from app.db.base import Base  # noqa: E402

# Import all models here for Alembic autogenerate support
from app.catalog.models import CatalogItemModel  # noqa: E402, F401
from app.scheduling.models import AppointmentModel  # noqa: E402, F401
from app.patient.models import PatientModel  # noqa: E402, F401
from app.billing.models import PaymentModel, BookingReceiptModel  # noqa: E402, F401
from app.product.models import ProductModel # noqa: E402, F401
from app.category.models import CategoryModel # noqa: E402, F401
from app.brand.models import BrandModel # noqa: E402, F401
from app.supplier.models import SupplierModel # noqa: E402, F401
from app.warehouse.models import WarehouseModel # noqa: E402, F401
from app.inventory.models import InventoryModel # noqa: E402, F401
from app.stock_movement.models import StockMovementModel # noqa: E402, F401
from app.purchase_order.models import PurchaseOrderModel, PurchaseOrderItemModel # noqa: E402, F401
from app.goods_receiving.models import GoodsReceiptModel, GoodsReceiptItemModel # noqa: E402, F401
from app.customer_order.models import CustomerOrderModel, CustomerOrderItemModel # noqa: E402, F401
from app.auth.models import User # noqa: E402, F401

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# target_metadata is defined below
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = settings.DATABASE_URL
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection) -> None:  # noqa: ANN001
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """Run migrations in 'online' mode with an async engine."""
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
        url=settings.DATABASE_URL,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
