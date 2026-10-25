"""Coordinate identical insight requests without holding a transaction over HTTP."""
from alembic import op
import sqlalchemy as sa

revision = 'b142d583cc21'
down_revision = 'a031c472bb10'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('insight_claims',
        sa.Column('fingerprint', sa.String(64), primary_key=True),
        sa.Column('owner', sa.String(32), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False))


def downgrade():
    op.drop_table('insight_claims')
