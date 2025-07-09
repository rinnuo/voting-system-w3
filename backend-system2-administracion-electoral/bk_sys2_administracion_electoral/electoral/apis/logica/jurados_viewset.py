import requests
from rest_framework import viewsets, status, serializers
from rest_framework.decorators import action, permission_classes
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.response import Response

from electoral.apis.base import IsEleccionUser
from electoral.models import ParticipacionVotanteEleccion, JuradoMesa, MesaElectoral
import logging
logger = logging.getLogger(__name__)

class JuradoMesaSerializer(serializers.ModelSerializer):
    eleccion_id = serializers.IntegerField(source='mesa.eleccion.id', read_only=True)

    class Meta:
        model = JuradoMesa
        fields = ['id', 'eleccion_id', 'participante_id', 'mesa', 'user4_id', 'username']


class JuradoMesaViewSet(viewsets.ModelViewSet):
    queryset = JuradoMesa.objects.all()
    serializer_class = JuradoMesaSerializer

    def get_permissions(self):
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return [AllowAny()]
        return [IsEleccionUser()]

    def get_queryset(self): #con esto filtramos los jurados por la elección
        qs = JuradoMesa.objects.select_related('mesa__eleccion')
        ele = self.request.query_params.get('eleccion')
        if ele:
            qs = qs.filter(mesa__eleccion__id=ele)
        return qs

    @action(detail=False, methods=['post'], url_path='orquestar-jurados')
    def orquestar(self, request):
        eleccion_id = request.query_params.get('eleccion')
        por_mesa = int(request.query_params.get('por_mesa', 1))

        if not eleccion_id:
            return Response(
                {"detail": "Debe indicar ?eleccion=<id>"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 1) Traer TODAS las mesas de la elección
        mesas_qs = MesaElectoral.objects.filter(eleccion_id=eleccion_id)
        # Inicializar dict con lista vacía por cada mesa
        mesas = {m.id: [] for m in mesas_qs}

        # 2) Traer participaciones y poblar
        parts = (ParticipacionVotanteEleccion.objects
                 .filter(eleccion_id=eleccion_id)
                 .select_related('mesa')
                 .order_by('apellido_paterno'))
        for p in parts:
            if p.mesa_id in mesas:
                mesas[p.mesa_id].append(p)

        # ---- DEBUG aquí ----
        #logger.debug("DICT MESAS → %s", {mid: len(lst) for mid, lst in mesas.items()})
        ## opcionalmente:
        #return Response(
        #    {"mesas": {mid: len(lst) for mid, lst in mesas.items()}},
        #    status=status.HTTP_200_OK
        #)

        # 3) Validar: cada mesa debe tener al menos `por_mesa` participaciones
        insuf = []
        for mid, lista in mesas.items():
            if len(lista) < por_mesa:
                insuf.append(f"Mesa {mid} tiene {len(lista)}, requiere {por_mesa}")

        if insuf:
            return Response(
                {
                    "detail": f"Mesas con participantes insuficientes, total de mesas en todos los recintos: {len(mesas.items())}",
                    "errors": insuf
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        for mid, lista in mesas.items():
            mesas[mid] = [
                p for p in lista
                if p.nombre_completo and p.nombre_completo.strip()
            ]

        # 4) Si pasa validación, construyes el bulk para S4
        bulk, mapping = [], {}
        for mesa_id, lista in mesas.items():
            for p in lista[:por_mesa]:
                names = p.nombre_completo.split()
                first = names[0]
                last = names[-1] if len(names) > 1 else first
                base = f"{first.lower()}.{last.lower()}"

                bulk.append({
                    "participant_id": str(p.votante_id),
                    "base_username": base,
                    "password": "nur123",
                    "first_name": first,
                    "last_name": last,
                    "email": f"jurado+{base}@example.com",
                    "role": "JURADO"
                })
                mapping[str(p.votante_id)] = mesa_id

        # 6) Llamar a bulk_create en Sistema 4
        url4 = f"http://127.0.0.1:8004/system4/api/admin/users/bulk_create/"
        headers = {
            "Authorization": request.headers.get("Authorization"),
            "Content-Type":  "application/json"
        }
        resp = requests.post(url4, json=bulk, headers=headers)
        if resp.status_code not in (200, 201):
            return Response(
                {"detail": "Error al crear usuarios en Sistema 4", "error": resp.text},
                status=status.HTTP_502_BAD_GATEWAY
            )
        results = resp.json()

        # 6) Guardar en JuradoMesa y devolver
        output = []
        for r in results:
            pid, uid, usr = r['participant_id'], r['user_id'], r['username']
            ms = mapping.get(pid)
            jm, created = JuradoMesa.objects.update_or_create(
                participante_id=pid,
                mesa_id=ms,
                defaults={"user4_id": uid, "username": usr}
            )
            output.append({
                "id": jm.id,
                "participante_id": pid,
                "mesa_id": ms,
                "user4_id": uid,
                "username": usr,
                "created": created
            })

        return Response(output, status=status.HTTP_201_CREATED)


    @action(detail=False, methods=['delete'], url_path='clear-by-election')
    def clear_by_election(self, request):
        ele_id = request.query_params.get('eleccion')
        if not ele_id:
            return Response(
                {"detail": "Se requiere ?eleccion=<id>"},
                status=status.HTTP_400_BAD_REQUEST
            )

        vot_ids = (ParticipacionVotanteEleccion.objects
                   .filter(eleccion_id=ele_id)
                   .values_list('votante_id', flat=True))
        deleted, _ = (JuradoMesa.objects
                      .filter(participante_id__in=vot_ids)
                      .delete())

        return Response(
            {"detail": f"Eliminadas {deleted} asignaciones."},
            status=status.HTTP_204_NO_CONTENT
        )