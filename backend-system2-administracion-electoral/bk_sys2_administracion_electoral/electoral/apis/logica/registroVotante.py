import string

from django.db.models.functions import math
from rest_framework import serializers
from rest_framework.decorators import action
from rest_framework.viewsets import GenericViewSet
from rest_framework.response import Response
from rest_framework import status
from electoral.models import (
    ParticipacionVotanteEleccion, Eleccion,
    Seccion, Recinto, MesaElectoral
)
from shapely.geometry import Point, Polygon
from electoral.models import Seccion

class RegistrarVotanteSerializer(serializers.Serializer):
    votante_id = serializers.UUIDField()
    lat        = serializers.FloatField()
    lng        = serializers.FloatField()
    nombre_completo = serializers.CharField()
    recinto_id = serializers.IntegerField(required=False)  # opcional


def detectar_seccion(lat: float, lng: float) -> Seccion | None:
    punto = Point(lng, lat)
    candidatos = []

    for seccion in Seccion.objects.exclude(poligono__isnull=True):
        poly = Polygon(seccion.poligono)
        if poly.contains(punto):
            # almacena el área para comparar niveles
            candidatos.append((poly.area, seccion))

    if not candidatos:
        return None

    # retorna la sección de menor área (nivel más granular)
    _, seccion_min = min(candidatos, key=lambda x: x[0])
    return seccion_min


def secciones_cubren(lat, lng):
    punto = Point(lng, lat)
    out = []
    for sec in Seccion.objects.exclude(poligono__isnull=True):
        poly = Polygon(sec.poligono)
        if poly.contains(punto):
            out.append((poly.area, sec))
    # ordena de menor a mayor área (distrital primero, luego municipal…)
    return [sec for _, sec in sorted(out, key=lambda x: x[0])]

# helper para extraer apellido paterno del campo NombreCompleto xddddd
def apellido_paterno(nombre_completo: str) -> str:
    partes = nombre_completo.strip().split()
    return partes[-1].lower()  # siempre tomo la última palabra

class VotanteViewSet(GenericViewSet):
    authentication_classes = []
    permission_classes     = []

    @action(detail=False, methods=['post'], url_path='registrar_votante')
    def registrar(self, request):
        # 1) valida input
        ser = RegistrarVotanteSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        vid, lat, lng, nombre, rec_id = (
            ser.validated_data['votante_id'],
            ser.validated_data['lat'],
            ser.validated_data['lng'],
            ser.validated_data['nombre_completo'],
            ser.validated_data.get('recinto_id')
        )

        # 2) detecta todas las secciones que cubren el punto
        secs = secciones_cubren(lat, lng)
        if not secs:
            return Response({"detail": "Fuera de sección."},
                            status=status.HTTP_400_BAD_REQUEST)

        # 3) encuentra elecciones activas en cualquiera de esas secciones
        elecciones = Eleccion.objects.filter(
            activa=True,
            secciones__in=secs
        ).distinct()
        if not elecciones:
            return Response({"detail": "Sin elección activa en esta zona."},
                            status=status.HTTP_400_BAD_REQUEST)

        # 4) elige recinto (enviado o por proximidad en secs[0])
        if rec_id:
            recinto = Recinto.objects.filter(id=rec_id).first()
        else:
            candidatos = Recinto.objects.filter(seccion=secs[0])
            if not candidatos:
                return Response({"detail": "No hay recintos en esta sección."},
                                status=status.HTTP_400_BAD_REQUEST)
            recinto = min(
                candidatos,
                key=lambda r: (float(r.lat) - lat) ** 2 + (float(r.lng) - lng) ** 2
            )

        results = []
        for ele in elecciones:
            # 5a) Crear o recuperar la participación, guardando nombre y apellido
            defaults = {
                "seccion":        secs[0],
                "recinto":        recinto,
                "nombre_completo": nombre,
                "apellido_paterno": apellido_paterno(nombre),
            }
            p, created = ParticipacionVotanteEleccion.objects.get_or_create(
                votante_id=vid,
                eleccion=ele,
                defaults=defaults
            )

            # 5b) Si ya existía, actualizamos nombre/apellido si cambian
            if not created:
                nuevos_ap = apellido_paterno(nombre)
                campos = []
                if p.nombre_completo != nombre:
                    p.nombre_completo = nombre
                    campos.append("nombre_completo")
                if p.apellido_paterno != nuevos_ap:
                    p.apellido_paterno = nuevos_ap
                    campos.append("apellido_paterno")
                if campos:
                    p.save(update_fields=campos)

            # 5c) Si es nuevo, asignar mesa por orden alfabético de apellido_paterno
            if created:
                mesas = list(
                    MesaElectoral.objects
                      .filter(recinto=recinto, eleccion=ele)
                      .order_by("numero")
                )
                # —— DEBUG ——
                print(">>> Mesas disponibles en registro:", [m.numero for m in mesas])
                print(">>> Count mesas:", len(mesas))
                # ——————————
                import string
                from math import ceil

                # 1) número de mesas
                num_mesas = len(mesas)

                # 2) dividimos el alfabeto en trozos iguales
                alf = list(string.ascii_uppercase)
                chunk = ceil(len(alf) / num_mesas)
                rangos = [alf[i * chunk:(i + 1) * chunk] for i in range(num_mesas)]

                for i, r in enumerate(rangos): #imprimemos para que se vea el rango de letras por mesa
                    print(f"Mesa {i + 1}: {r}")

                # 3) inicial de apellido en mayúscula
                ini = p.apellido_paterno.strip()[0].upper() if p.apellido_paterno else None

                # 4) buscamos en qué rango cae
                pos = next(
                    (i for i, letras in enumerate(rangos) if ini in letras),
                    num_mesas - 1
                )

                # 5) asignamos esa mesa
                p.mesa = mesas[pos]
                p.save(update_fields=["mesa"])

            # 6) Preparamos la respuesta
            results.append({
                "eleccion_id": ele.id,
                "recinto_id":  recinto.id,
                "mesa_numero": p.mesa.numero if p.mesa else None
            })

        return Response(results, status=status.HTTP_201_CREATED)
