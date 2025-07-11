from rest_framework.routers import DefaultRouter
from django.urls import path, include

from votacion.apis import PapeletaViewSet, VotoViewSet

router = DefaultRouter()
router.register(r'admin/papeleta', PapeletaViewSet, basename='papeleta')
router.register(r'admin/voto', VotoViewSet, basename='voto')

urlpatterns = [
    path('', include(router.urls)),
]
