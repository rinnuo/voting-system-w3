from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .apis import RecintoViewSet, CargoViewSet, PartidoPoliticoViewSet, CandidaturaViewSet, SeccionViewSet, MesaElectoralViewSet, EleccionViewSet

router = DefaultRouter()
router.register(r'admin/recintos', RecintoViewSet)
router.register(r'admin/cargos', CargoViewSet)
router.register(r'admin/partidos', PartidoPoliticoViewSet)
router.register(r'admin/secciones', SeccionViewSet)
router.register(r'admin/candidatura', CandidaturaViewSet)
router.register(r'admin/mesas', MesaElectoralViewSet)
router.register(r'admin/elecciones', EleccionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
