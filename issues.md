# Issues that have occured and needed serious debugging

## Template:
---
Title
---

Issue:


Occured Where:


Solution:


Date and Programmer:

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

Date and Programmer:
Tue Aug 04 2020, Sebastian Theiler
---