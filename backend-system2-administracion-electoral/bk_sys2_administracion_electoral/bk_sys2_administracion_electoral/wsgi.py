"""
WSGI config for bk_sys2_administracion_electoral project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bk_sys2_administracion_electoral.settings')

application = get_wsgi_application()
