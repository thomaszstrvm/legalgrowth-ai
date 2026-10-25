"""Add bounded provider usage observations without storing content."""
from alembic import op
import sqlalchemy as sa

revision = 'a031c472bb10'
down_revision = '9b27d3e1a102'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('ai_calls',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('scope', sa.String(4), nullable=True),
        sa.Column('provider', sa.String(30), nullable=False),
        sa.Column('model', sa.String(80), nullable=False),
        sa.Column('operation', sa.String(40), nullable=False),
        sa.Column('status', sa.String(20), nullable=False),
        sa.Column('attempted', sa.Boolean(), nullable=False),
        sa.Column('latency_ms', sa.BigInteger(), nullable=False),
        sa.Column('input_tokens', sa.BigInteger(), nullable=True),
        sa.Column('output_tokens', sa.BigInteger(), nullable=True),
        sa.Column('total_tokens', sa.BigInteger(), nullable=True),
        sa.Column('cache_read_tokens', sa.BigInteger(), nullable=True),
        sa.Column('cache_creation_tokens', sa.BigInteger(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False))


def downgrade():
    op.drop_table('ai_calls')
