from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .apis import RecintoViewSet, CargoViewSet, PartidoPoliticoViewSet, CandidaturaViewSet, SeccionViewSet, MesaElectoralViewSet, EleccionViewSet
from .apis.logica import ParticipacionViewSet
from .apis.logica.papeletas import PapeletaViewSet
#from .apis.logica import RegistrarVotanteAPIView
from .apis.logica.registroVotante import VotanteViewSet

router = DefaultRouter()
router.register(r'admin/recintos', RecintoViewSet)
router.register(r'admin/cargos', CargoViewSet)
router.register(r'admin/partidos', PartidoPoliticoViewSet)
router.register(r'admin/secciones', SeccionViewSet)
router.register(r'admin/candidatura', CandidaturaViewSet)
router.register(r'admin/mesas', MesaElectoralViewSet)
router.register(r'admin/elecciones', EleccionViewSet)
router.register(r'admin/registrar_votante', VotanteViewSet, basename='registrar_votante')
router.register(r'admin/papeletas', PapeletaViewSet, basename='papeletas')
router.register(r'admin/participaciones', ParticipacionViewSet, basename='participaciones')

urlpatterns = [
    path('', include(router.urls)),
    #path('admin/registrar_votante/', RegistrarVotanteAPIView.as_view(), name='registrar_votante'),
]
