# Issues that have occured and needed serious debugging

## Template:
---
Title
---

Issue:


Occured Where (optional):


Solution:


Date and Programmer:

---



---
No such column after adding field
---

Issue:
`django.db.utils.OperationalError: no such column:`

Solution:
Removed field, ran `./manage.py makemigrations <app_name>`, `./manage.py migrate <app_name>`
Readded field, ran `./manage.py makemigrations <app_name>`, `./manage.py migrate <app_name>`
https://stackoverflow.com/a/36053139/13984903

Date and Programmer:
Sun Aug 16 2020, Sebastian Theiler

---
XHR Request Blocked by CORS
---
Issue:
`Access to XMLHttpRequest at 'http://127.0.0.1:8000/api/decks/decklist/?username=evolvedsquid' from origin 'http://localhost:3000' has been blocked by CORS policy: Request header field http_x_requested_with is not allowed by Access-Control-Allow-Headers in preflight response.`

Occured where:
React App Home Page

Solution:
Cleared browser cache (can also go incognito)
https://stackoverflow.com/questions/28046422/django-cors-headers-not-work

Removed the line `xhr.setRequestHeader('HTTP_X_REQUESTED_WITH', 'XMLHttpRequest');` from `alu-web/src/lookup/components.js`

Date and Programmer:
Tue Aug 04 2020, Sebastian Theiler
---