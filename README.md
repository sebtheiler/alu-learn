# Alu Learn

## Development-Build Setup instructions

```
sudo su - postgres
psql

CREATE DATABASE alu;
CREATE USER aluadmin WITH PASSWORD 'temppassword';
ALTER ROLE aluadmin SET client_encoding TO 'utf8';
ALTER ROLE aluadmin SET default_transaction_isolation TO 'read committed';
ALTER ROLE aluadmin SET timezone TO 'UTC';
ALTER USER aluadmin CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE alu TO aluadmin;

\q
exit

yarn
yarn prisma db push
```
