# Pain Away — Backend

Backend service for the Pain Away Clinic Operating System.

## Tech Stack

- Python 3.12
- FastAPI
- SQLAlchemy 2.x (async)
- Alembic
- PostgreSQL (via AsyncPG)
- Pydantic v2
- Structlog

## Architecture

Modular monolith organized by business domain.

```
backend/
├── src/
│   └── app/
│       │
│       │  # ── Business Modules ──
│       ├── catalog/          # Services & packages management
│       ├── patient/          # Patient records & history
│       ├── scheduling/       # Appointment booking & slot management
│       ├── billing/          # Payments, receipts & invoices
│       ├── notification/     # WhatsApp & communication
│       ├── orchestration/    # Cross-module workflow coordination
│       │
│       │  # ── Infrastructure ──
│       ├── shared/           # Common utilities, constants, middleware
│       ├── config/           # Application settings
│       ├── core/             # Core dependencies & base classes
│       └── db/               # Database session & base model
│
├── migrations/               # Alembic migrations
│   └── versions/
├── tests/
│   ├── unit/
│   └── integration/
├── pyproject.toml
├── alembic.ini
└── Dockerfile
```

### Module Internal Structure

Each business module follows the same internal layout:

```
module/
├── __init__.py           # Module init
├── api.py                # Route handlers
├── service.py            # Business logic
├── repository.py         # Data access layer
├── schemas.py            # Pydantic request/response schemas
├── models.py             # SQLAlchemy ORM models
├── domain.py             # Domain rules & value objects
└── exceptions.py         # Module-specific exceptions
```

## Setup

> Setup instructions will be added when Milestone 1 implementation begins.
