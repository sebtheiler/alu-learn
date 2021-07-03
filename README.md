# Alu Learn

## Development-Build Setup instructions
```
git clone https://github.com/EvolvedSquid/Alu.git
cd Alu/
python3 -m venv aluenv
aluenv/bin/pip install -r requirements.txt
echo "{\"ALU_DEBUG\": true, \"ALU_PRODUCTION\": false, \"PYTHON_PATH\": \"$PWD/aluenv/bin/python\", \"DRIVER_EXECUTABLE_PATH\": \"$PWD/chromedriver\"}" > alu/env-vars.json
echo "[\"test@fakedomain123.edu\"]" > alu/allowed-emails.json
echo "[]" > editor_deck_ids.json
echo "[]" > top_deck_ids.json
sudo su - postgres
psql
CREATE DATABASE alu;
CREATE USER evolvedsquid WITH PASSWORD 'temppassword';
ALTER ROLE evolvedsquid SET client_encoding TO 'utf8';
ALTER ROLE evolvedsquid SET default_transaction_isolation TO 'read committed';
ALTER ROLE evolvedsquid SET timezone TO 'UTC';
ALTER USER evolvedsquid CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE alu TO evolvedsquid;
\q
exit
aluenv/bin/python manage.py makemigrations
aluenv/bin/python manage.py migrate
aluenv/bin/python manage.py migrate --run-syncdb
cd alu-web
npm install
cd ..
aluenv/bin/python build-react-into-django.py
```
