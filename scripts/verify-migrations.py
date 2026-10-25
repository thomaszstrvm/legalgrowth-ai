"""Reversible migration check on a disposable database, never on application data."""
import os
import argparse
import subprocess
import sys
from pathlib import Path
from tempfile import TemporaryDirectory

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--sqlite-only', action='store_true',
    help='Explicitly select the disposable SQLite check; no PostgreSQL coverage claimed.')
options = parser.parse_args()

with TemporaryDirectory(prefix='legalgrowth-migrations-') as folder:
    env=os.environ.copy()
    env['DATABASE_URL']='sqlite:///'+(Path(folder)/'test.db').as_posix()
    for args in [('upgrade','head'),('check',),('downgrade','base'),('upgrade','head'),('check',)]:
        subprocess.run([sys.executable,'-m','alembic',*args],env=env,check=True)
    print('SQLite upgrade/check/downgrade/upgrade/check OK.', flush=True)
    # The full historical check remains available and is deliberately not hidden:
    # 9b27d3e1a102 needs live data, and cannot currently compile in offline mode.
    if options.sqlite_only:
        print('PostgreSQL NOT checked (--sqlite-only explicitly selected).')
        sys.exit(0)
    env['DATABASE_URL']='postgresql+psycopg://localhost/legalgrowth'
    result=subprocess.run([sys.executable,'-m','alembic','upgrade','head','--sql'],env=env,capture_output=True,text=True)
    if result.returncode:
        print(result.stderr, file=sys.stderr)
        result.check_returncode()
    assert 'CREATE TABLE campaigns' in result.stdout
    print('SQLite upgrade/downgrade/upgrade OK; PostgreSQL DDL compilation OK (not a live PostgreSQL test).')
