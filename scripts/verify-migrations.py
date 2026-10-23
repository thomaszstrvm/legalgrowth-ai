"""Reversible migration check on a disposable database, never on application data."""
import os
import subprocess
import sys
from pathlib import Path
from tempfile import TemporaryDirectory

with TemporaryDirectory(prefix='legalgrowth-migrations-') as folder:
    env=os.environ.copy()
    env['DATABASE_URL']='sqlite:///'+(Path(folder)/'test.db').as_posix()
    for args in [('upgrade','head'),('check',),('downgrade','base'),('upgrade','head'),('check',)]:
        subprocess.run([sys.executable,'-m','alembic',*args],env=env,check=True)
    env['DATABASE_URL']='postgresql+psycopg://localhost/legalgrowth'
    result=subprocess.run([sys.executable,'-m','alembic','upgrade','head','--sql'],env=env,check=True,capture_output=True,text=True)
    assert 'CREATE TABLE campaigns' in result.stdout
    print('SQLite upgrade/downgrade/upgrade OK; PostgreSQL DDL compilation OK (not a live PostgreSQL test).')
