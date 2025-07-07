# electoral/serializers.py
from django.utils.decorators import method_decorator
from rest_framework import serializers
# electoral/apis/registrar_votante.py
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import GenericViewSet
from rest_framework_simplejwt.authentication import JWTAuthentication
from electoral.models.participacionVotanteEleccion import ParticipacionVotanteEleccion
from shapely.geometry import Point, Polygon
from electoral.models import Seccion, Eleccion, Recinto

class RegistrarVotanteSerializer(serializers.Serializer):
    votante_id = serializers.UUIDField()
    lat        = serializers.FloatField()
    lng        = serializers.FloatField()
    recinto_id = serializers.IntegerField(required=False)  # opcional


from shapely.geometry import Point, Polygon
from electoral.models import Seccion

def detectar_seccion(lat: float, lng: float) -> Seccion | None:
    # punto en x=longitud, y=latitud
    punto = Point(lng, lat)

    for seccion in Seccion.objects.exclude(poligono__isnull=True):
        coords = seccion.poligono  # ahora [[lng, lat], …]
        poligono = Polygon(coords)
        if poligono.contains(punto):
            return seccion

    return None

# electoral/apis/registrar_votante.py
from rest_framework.decorators import action
from rest_framework.viewsets import GenericViewSet
from rest_framework.response import Response
from rest_framework import status
from electoral.models import (
    ParticipacionVotanteEleccion, Eleccion,
    Seccion, Recinto, MesaElectoral
)

class VotanteViewSet(GenericViewSet):
    authentication_classes = []
    permission_classes     = []

    @action(detail=False, methods=['post'], url_path='registrar_votante')
    def registrar(self, request):
        ser = RegistrarVotanteSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        vid, lat, lng, rec_id = (
            ser.validated_data['votante_id'],
            ser.validated_data['lat'],
            ser.validated_data['lng'],
            ser.validated_data.get('recinto_id'),
        )

        # 1) Detección de sección y elección
        seccion    = detectar_seccion(lat, lng)
        elecciones = Eleccion.objects.filter(activa=True, secciones=seccion)
        if not seccion or not elecciones.exists():
            return Response({"detail": "Fuera de sección o sin elección."},
                            status=status.HTTP_400_BAD_REQUEST)

        # 2) Escoger recinto: el pasado o el más cercano
        recinto = Recinto.objects.filter(id=rec_id).first() \
               or Recinto.objects.filter(seccion=seccion).first()

        results = []
        for ele in elecciones:
            p, created = ParticipacionVotanteEleccion.objects.get_or_create(
                votante_id=vid,
                eleccion=ele,
                defaults={"seccion": seccion, "recinto": recinto}
            )

            # intentamos asignar mesa SOLO si la acabamos de crear
            if created:
                mesas = list(MesaElectoral.objects.filter(
                    recinto=recinto, eleccion=ele
                ).order_by('numero'))

                if mesas:
                    # round-robin basándonos en la posición alfabética o por ID
                    group = ParticipacionVotanteEleccion.objects.filter(
                        eleccion=ele, recinto=recinto
                    ).order_by('votante_id')
                    idx = list(group.values_list('votante_id', flat=True)).index(vid)
                    p.mesa = mesas[idx % len(mesas)]
                    p.save(update_fields=['mesa'])
                else:
                    p.mesa = None
                    return Response(
                        {"detail": "No hay mesas disponibles."},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            # devolvemos en el resultado el número de mesa (o null si no hay)
            results.append({
                "eleccion_id": ele.id,
                "recinto_id": recinto.id,
                "mesa_numero": p.mesa.numero if p.mesa else None,
            })

        return Response(results, status=status.HTTP_201_CREATED)
