import requests
from collections import defaultdict
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, AllowAny
from electoral.models import ParticipacionVotanteEleccion, JuradoMesa

class OrquestadorJuradoViewSet(viewsets.GenericViewSet):
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'], url_path='orquestar-jurados')
    def orquestar_jurados(self, request):
        # 1. Leer parámetros
        eleccion_id = request.query_params.get('eleccion')
        por_mesa = int(request.query_params.get('por_mesa', 1))

        if not eleccion_id:
            return Response(
                {"detail": "Debe indicar ?eleccion=<id>"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2. Obtener participaciones de esa elección
        parts = ParticipacionVotanteEleccion.objects.filter(
            eleccion_id=eleccion_id
        ).select_related('mesa').order_by('apellido_paterno')

        # 3. Agrupar por mesa
        mesas = defaultdict(list)
        for p in parts:
            if p.mesa:
                mesas[p.mesa.id].append(p)

        # 4. Seleccionar N candidatos por mesa y preparar payload bulk
        bulk = []
        mapping = {}  # para luego correlacionar
        for mesa_id, lista in mesas.items():
            seleccion = lista[:por_mesa]
            for p in seleccion:
                if not p.nombre_completo or len(p.nombre_completo.split()) == 0:
                    continue  # Ignorar registros sin nombre

                first = p.nombre_completo.split()[0]
                last = p.nombre_completo.split()[-1] if len(
                    p.nombre_completo.split()) > 1 else first  # Usar el nombre como apellido si no hay apellido

                base = f"{first.lower()}.{last.lower()}"
                payload = {
                    "participant_id": str(p.votante_id),
                    "base_username":  base,
                    "password":       "Pwd12345!",
                    "first_name":     first,
                    "last_name":      last,
                    "email":          f"jurado+{base}@example.com",
                    "role":           "JURADO"
                }
                bulk.append(payload)
                # guardo para correlacionar después
                mapping[str(p.votante_id)] = mesa_id

        if not bulk:
            return Response(
                {"detail": "No hay participantes para orquestar."},
                status=status.HTTP_200_OK
            )

        # 5. Llamar al bulk_create de Sistema 4
        url4 = f"http://127.0.0.1:8004/system4/api/admin/users/bulk_create/"
        headers = {
            "Authorization": request.headers.get("Authorization"),
            "Content-Type": "application/json"
        }
        resp = requests.post(url4, json=bulk, headers=headers)
        if resp.status_code not in (200, 201):
            return Response(
                {"detail": "Error al crear usuarios en Sistema 4", "error": resp.text},
                status=status.HTTP_502_BAD_GATEWAY
            )
        results = resp.json()  # lista de {participant_id, user_id, username}

        # 6. Guardar en JuradoMesa y armar respuesta
        output = []
        for r in results:
            pid   = r['participant_id']
            uid   = r['user_id']
            usr   = r['username']
            mesa  = mapping.get(pid)

            # comentado por desarrollo de Sistema 4
            jm, created = JuradoMesa.objects.update_or_create(
                participante_id=pid,
                mesa_id=mesa,
                defaults={"user4_id": uid, "username": usr}
            )
            output.append({
                "participante_id": pid,
                "mesa_id": mesa,
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
                {"detail": "Se requiere el parámetro ?eleccion=<id>"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Obtener todos los votante_ids de esa elección
        votante_ids = ParticipacionVotanteEleccion.objects \
            .filter(eleccion_id=ele_id) \
            .values_list('votante_id', flat=True)

        # Borrar las asignaciones cuya participante_id esté en esa lista
        deleted_count, _ = JuradoMesa.objects \
            .filter(participante_id__in=votante_ids) \
            .delete()

        return Response(
            {"detail": f"Eliminadas {deleted_count} asignaciones de jurado"},
            status=status.HTTP_204_NO_CONTENT
        )
