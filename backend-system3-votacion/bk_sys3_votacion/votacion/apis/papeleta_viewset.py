from rest_framework import serializers

from votacion.apis.base import IsJuradoUser, JuradoBaseViewSet
from votacion.models import Papeleta
import requests
from django.utils.timezone import now
from rest_framework import viewsets, mixins, status
from rest_framework.decorators import action, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
import logging
logger = logging.getLogger(__name__)



class PapeletaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Papeleta
        fields = [
            'id', 'votante_id', 'mesa_id',
            'habilitada', 'habilitada_por', 'habilitada_en', 'votada_en'
        ]

class PapeletaViewSet(JuradoBaseViewSet):
    queryset = Papeleta.objects.all()
    serializer_class = PapeletaSerializer

    def get_permissions(self):
        return [IsJuradoUser()]

    @action(detail=False, methods=['post'], url_path='autentificar')
    def autentificar(self, request):
        return Response({"detail": "Hola, tienes autenticación con token xd. ¡Bien hecho!"})


    @action(detail=False, methods=['get'], url_path='estado')
    def estado(self, request): #es para verificar si una papeleta está habilitada para el id del votante y mesa
        vid = request.query_params.get('votante_id')
        mesa = request.query_params.get('mesa_id')
        if not vid or not mesa:
            return Response({"detail": "?votante_id y ?mesa_id requeridos"},
                            status=status.HTTP_400_BAD_REQUEST)

        pap = (Papeleta.objects
               .filter(votante_id=vid, mesa_id=mesa)
               .order_by('-habilitada_en')
               .first())
        return Response({"habilitada": bool(pap and pap.habilitada)})


    @action(detail=False, methods=['get'], url_path='jurado-estado')
    @permission_classes([IsJuradoUser])
    def jurado_estado(self, request):
        user4_id = request.user.id

        # 1. Obtener mesa y elección del jurado desde SIS2
        jurado_url = "http://127.0.0.1:8002/system2/api/admin/jurados/"
        jurado_resp = requests.get(jurado_url, params={"user4_id": user4_id})
        if jurado_resp.status_code != 200 or not jurado_resp.json():
            logger.warning(f"Usuario {user4_id} no tiene asignación como jurado.")
            return Response({"detail": "No tienes asignación como jurado."},
                            status=status.HTTP_403_FORBIDDEN)

        jurado_info = jurado_resp.json()[0]  # asumiendo uno por elección
        mesa_id = jurado_info['mesa']
        eleccion_id = jurado_info['eleccion_id']
        jurado_pid = jurado_info['participante_id']
        jurado_user = jurado_info['username']

        # 2. Obtener todos los votantes de la elección desde SIS2
        parts_url = "http://127.0.0.1:8002/system2/api/admin/participaciones/"
        parts_resp = requests.get(parts_url, params={"eleccion": eleccion_id})
        if parts_resp.status_code != 200:
            logger.warning(f"Error al obtener participaciones para elección {eleccion_id}")
            return Response({"detail": "Error al consultar votantes"}, status=502)

        all_parts = parts_resp.json()
        posibles = [
            p for p in all_parts
            if p['mesaNumero'] == mesa_id and str(p['uuid']) != str(jurado_pid)
        ]

        # 3. Filtrar los que ya tienen papeleta habilitada o votada
        ids = [p['uuid'] for p in posibles]
        papeletas = Papeleta.objects.filter(votante_id__in=ids, mesa_id=mesa_id)
        ids_habilitados = set(p.votante_id for p in papeletas)

        recinto_id = None
        if posibles:
            first = next((p for p in posibles if p['uuid'] not in ids_habilitados), None)
            if first:
                recinto_id = first.get('recintoId')

        disponibles = [
            {"votante_id": p['uuid'],
             "nombre_completo": p['nombreCompleto'],
             }
            for p in posibles if p['uuid'] not in ids_habilitados
        ]

        return Response({
            "mesa_id": mesa_id,
            "recinto_id": recinto_id,
            "eleccion_id": eleccion_id,
            "jurado": jurado_user,
            "total_papeletas": len(disponibles),
            "total_papeletas_habilitadas": len(ids_habilitados),
            "votantes": disponibles
        }, status=200)


    @action(detail=False, methods=['post'], url_path='habilitar')
    def habilitar(self, request):
        import logging
        logger = logging.getLogger(__name__)
        vid = request.data.get('votante_id')
        user4 = request.user.id

        # 1. Obtener asignación del jurado
        resp_jurado = requests.get(
            "http://127.0.0.1:8002/system2/api/admin/jurados/",
            params={"user4_id": user4}
        )
        if resp_jurado.status_code != 200 or not resp_jurado.json():
            logger.warning(f"Jurado {user4} no tiene asignación activa.")
            return Response({"detail": "No autorizado como jurado."}, status=403)

        jurado_data = resp_jurado.json()[0]
        mesa_id = jurado_data['mesa']
        jurado_pid = jurado_data['participante_id']

        # 2. Validar que el votante pertenece a esa mesa
        resp_part = requests.get(
            "http://127.0.0.1:8002/system2/api/admin/participaciones/",
            params={"mesa": mesa_id, "votante_id": vid}
        )
        if resp_part.status_code != 200 or not resp_part.json():
            logger.warning(f"Jurado {user4} intentó habilitar votante {vid} fuera de su mesa {mesa_id}")
            return Response({"detail": "El votante no pertenece a tu mesa."}, status=400)

        # 3. Evitar autohabilitación
        if str(jurado_pid) == str(vid):
            logger.warning(f"Jurado {user4} intentó habilitarse a sí mismo como votante.")
            return Response({"detail": "No puedes habilitar tu propia papeleta."}, status=403)

        # Comprobar si ya tiene papeleta habilitada
        # 3.5) Validar que no haya papeleta ya habilitada
        papeleta_existente = (Papeleta.objects
                              .filter(votante_id=vid, mesa_id=mesa_id)
                              .order_by('-habilitada_en')
                              .first())

        if papeleta_existente and papeleta_existente.habilitada:
            logger.warning(f"Jurado {user4} intentó volver a habilitar votante {vid} en mesa {mesa_id}")
            return Response(
                {"detail": "El votante ya tiene una papeleta habilitada."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 4. Crear papeleta
        pap = Papeleta.objects.create(
            votante_id=vid,
            mesa_id=mesa_id,
            habilitada=True,
            habilitada_por=user4,
            habilitada_en=now()
        )

        logger.info(f"Papeleta habilitada por jurado {user4} para votante {vid} en mesa {mesa_id}")
        return Response(PapeletaSerializer(pap).data, status=201)


    @action(detail=False, methods=['get'], url_path='buscar')
    def buscar(self, request):
        ci = request.query_params.get('ci')
        if not ci:
            return Response({"detail": "?ci es requerido"}, status=400)

        # Construyo la URL con path param
        url = f"https://localhost:7265/api/Votantes/publico/{ci}"
        try:
            resp = requests.get(url, verify=False, timeout=5)
        except requests.RequestException as e:
            return Response(
                {"detail": f"Error de conexión a SIS1: {e}"},
                status=502
            )

        if resp.status_code == 404:
            return Response({"detail": "Votante no encontrado"}, status=404)
        if resp.status_code != 200:
            return Response({"detail": "Error consultando SIS1"}, status=502)

        return Response(resp.json(), status=200)
