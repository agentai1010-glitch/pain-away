"""add_balance_to_paymenttype

Revision ID: 43c0340054d3
Revises: 05a5840bf1b5
Create Date: 2026-07-04 16:23:22.009903

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '43c0340054d3'
down_revision: Union[str, None] = '05a5840bf1b5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    with op.get_context().autocommit_block():
        op.execute("ALTER TYPE paymenttype ADD VALUE IF NOT EXISTS 'BALANCE'")

def downgrade() -> None:
    pass
