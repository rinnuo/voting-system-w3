from django.urls import path
from votacion.consumers import ConteoConsumer

websocket_urlpatterns = [
    path('ws/conteo/', ConteoConsumer.as_asgi()),
]