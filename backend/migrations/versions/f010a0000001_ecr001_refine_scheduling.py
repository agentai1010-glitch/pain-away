"""ecr001_refine_scheduling

Revision ID: f010a0000001
Revises: eff1420a55eb
Create Date: 2026-07-07 17:35:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f010a0000001'
down_revision: Union[str, None] = 'eff1420a55eb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('patients', sa.Column('gender', sa.String(length=10), nullable=False, server_default='Male'))
    op.add_column('appointments', sa.Column('patient_gender', sa.String(length=10), nullable=True, server_default='Male'))
    op.add_column('holidays', sa.Column('holiday_type', sa.String(length=20), nullable=False, server_default='FULL'))
    op.add_column('holidays', sa.Column('disabled_slots', sa.String(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column('holidays', 'disabled_slots')
    op.drop_column('holidays', 'holiday_type')
    op.drop_column('appointments', 'patient_gender')
    op.drop_column('patients', 'gender')
