# Alu Flashcards

## Development-Build Setup instructions
```
git clone https://github.com/EvolvedSquid/Alu.git
./manage.py migrate --run-syncdb
cd alu-web
npm install
cd ..
python build-react-into-django.py
```
