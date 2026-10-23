"""Preserve regional news for each configured geography and week."""
import hashlib
import json
import unicodedata
from alembic import op
import sqlalchemy as sa

revision = '9b27d3e1a102'
down_revision = '73b7e91c89f9'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('news_digests', sa.Column('geography_key', sa.String(64), nullable=True))
    connection = op.get_bind()
    table = sa.table('news_digests', sa.column('id', sa.Integer), sa.column('payload', sa.JSON), sa.column('geography_key', sa.String))
    for row in connection.execute(sa.select(table.c.id, table.c.payload)).mappings():
        # Frozen normalization: migration behavior must not depend on future app code.
        cities = row['payload'].get('cities', []) if isinstance(row['payload'], dict) else []
        canonical = []
        for city in cities:
            name, _, state = unicodedata.normalize('NFC', city).strip().rpartition('-')
            canonical.append(f"{' '.join(name.split())}-{state.strip().upper()}".casefold())
        key = hashlib.sha256(json.dumps(sorted(set(canonical)), ensure_ascii=False, separators=(',', ':')).encode()).hexdigest()
        connection.execute(table.update().where(table.c.id == row['id']).values(geography_key=key))
    # Naming convention lets SQLite's unnamed legacy UNIQUE constraint be addressed.
    with op.batch_alter_table('news_digests', naming_convention={'uq': 'uq_%(table_name)s_%(column_0_name)s'}) as batch:
        batch.drop_constraint('uq_news_digests_week_start', type_='unique')
        batch.alter_column('geography_key', existing_type=sa.String(64), nullable=False)
        batch.create_unique_constraint('uq_news_week_geography', ['week_start', 'geography_key'])


def downgrade():
    connection = op.get_bind()
    duplicates = connection.execute(sa.text('SELECT week_start FROM news_digests GROUP BY week_start HAVING COUNT(*) > 1')).first()
    if duplicates:
        raise RuntimeError('Downgrade bloqueado: há geografias distintas na mesma semana; preserve o histórico antes de reduzir o esquema.')
    with op.batch_alter_table('news_digests') as batch:
        batch.drop_constraint('uq_news_week_geography', type_='unique')
        batch.create_unique_constraint('uq_news_digests_week_start', ['week_start'])
        batch.drop_column('geography_key')
