"""
WSGI config for alu project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.0/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application
from whitenoise import WhiteNoise
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'alu.settings')

application = get_wsgi_application()

# WhiteNoise serves the uploaded files in production
application = WhiteNoise(application, root=settings.STATIC_ROOT)
application.add_files(settings.UPLOADED_FILES_FILEPATH, prefix='uploads/')
