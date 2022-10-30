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

## Reset Database

```
sudo su - postgres
psql

REVOKE CONNECT ON DATABASE alu FROM public;
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'alu';
DROP DATABASE alu;
CREATE DATABASE alu;
GRANT ALL PRIVILEGES ON DATABASE alu TO aluadmin;

\q
exit

yarn prisma db push
```
