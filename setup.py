import os
import time
from alu.settings import INTERNAL_APPS, THIRD_PARTY_APPS

import environ


if os.geteuid() != 0:
    print('Run as sudo.')
    exit()


print('Checking if `alu/.env` exists...')


def env_exists() -> bool:
    return os.path.exists('alu/.env')


if not env_exists():
    print('Please manually set up `alu/.env` file')
    while not env_exists():
        time.sleep(3)

print('Reading environment variables...')
env = environ.Env()
environ.Env.read_env('alu/.env')

DB_USER = env('DB_USER')
DB_PASSWORD = env('DB_PASSWORD')
GSUITE_CREDENTIALS_FILE = env('GSUITE_CREDENTIALS_FILE')
DB_NAME = 'alu'

print('Installing system deps...')
os.system('sudo apt-get install postgresql postgresql-contrib -y')
os.system('sudo apt install libpq-dev python3-dev -y')
os.system('sudo apt install npm -y')

print('Setting up venv...')
os.system('''
python3 -m venv aluenv
aluenv/bin/pip install psycopg2-binary
aluenv/bin/pip install -r requirements.txt
aluenv/bin/pip install selenium Pillow django-environ
''')

print('Creating blank JSON files...')
os.system('echo "[]" > editor_deck_ids.json')
os.system(f'echo "{{}}" > {GSUITE_CREDENTIALS_FILE}')

print('Setting up DB...')
PSQL_COMMANDS = f'''
CREATE DATABASE {DB_NAME}
CREATE USER {DB_USER} WITH PASSWORD '{DB_PASSWORD}'
ALTER ROLE {DB_USER} SET client_encoding TO 'utf8'
ALTER ROLE {DB_USER} SET default_transaction_isolation TO 'read committed'
ALTER ROLE {DB_USER} SET timezone TO 'UTC'
ALTER USER {DB_USER} CREATEDB
GRANT ALL PRIVILEGES ON DATABASE {DB_NAME} TO {DB_USER}
'''
for COMMAND in PSQL_COMMANDS.strip().split('\n'):
    os.system(f'sudo -u postgres psql -c "{COMMAND};"')

print('Migrating DB...')
APPS = ' '.join(INTERNAL_APPS + THIRD_PARTY_APPS)
os.system(f'''
aluenv/bin/python manage.py makemigrations {APPS}
aluenv/bin/python manage.py migrate
aluenv/bin/python manage.py migrate --run-syncdb
''')

print('Build React...')
os.system('''
cd alu-web
npm install --force
cd ..
aluenv/bin/python build_react_into_django.py
''')
