import os

from build_react_into_django import PYTHON_PATH, delete_react_files

if os.geteuid() != 0:
    print('Must be run as superuser')
    exit()

if input('Have you backed up the server on DigitalOcean? ') != 'y':
    print('Back up the server on DigitalOcean')
    exit()

if input('Have you pushed the latest code to master? ') != 'y':
    print('Push the latest code to master')
    exit()

PULL_GIT = input('Pull Git? ') == 'y'
MIGRATE = input('Make migrations and migrate? ') == 'y'
BUILD_REACT = input('Build React? ') == 'y'

os.system('sudo systemctl stop nginx gunicorn')
if PULL_GIT:
    os.system('sudo git pull')
if MIGRATE:
    os.system(f'sudo {PYTHON_PATH} manage.py makemigrations --no-input')
    os.system(f'sudo {PYTHON_PATH} manage.py migrate')
if BUILD_REACT:
    delete_react_files()
os.system('sudo systemctl start nginx gunicorn')
