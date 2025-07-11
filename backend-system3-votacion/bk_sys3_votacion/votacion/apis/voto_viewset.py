from rest_framework import serializers

from votacion.apis.base import JuradoBaseViewSet
from votacion.models import Voto, Papeleta
import requests
from django.utils.timezone import now
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import models
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

class VotoSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Voto
        fields = ['papeleta', 'candidatura_id', 'timestamp']
        read_only_fields = ['timestamp']


class VotoViewSet(JuradoBaseViewSet):
    queryset = Voto.objects.all()
    serializer_class = VotoSerializer

    @action(detail=False, methods=['post'], url_path='votar')
    def votar(self, request):
        pap_id = request.data.get('papeleta')
        cand   = request.data.get('candidatura_id')
        print(f"[DEBUG] Votar: papeleta={pap_id}, candidatura={cand}")

        try:
            pap = Papeleta.objects.get(id=pap_id)
            print(f"[DEBUG] Papeleta encontrada: habilitada={pap.habilitada}, votada_en={pap.votada_en}")
        except Papeleta.DoesNotExist:
            print("[DEBUG] Papeleta no encontrada")
            return Response({"detail": "Papeleta no encontrada"}, status=404)

        if not pap.habilitada or pap.votada_en:
            print("[DEBUG] Papeleta inválida para votar")
            return Response({"detail": "Papeleta no válida"}, status=400)

        voto = Voto.objects.create(papeleta=pap, candidatura_id=cand)
        print(f"[DEBUG] Voto creado: {voto.id}")
        pap.votada_en = now()
        pap.save(update_fields=['votada_en'])
        print(f"[DEBUG] Papeleta actualizada con fecha de votación")

        # Notificar a los consumidores de WebSocket
        print("[DEBUG] Enviando notificación a WebSocket")
        notificarAWebSocket(pap, voto, cand)


        return Response(VotoSerializer(voto).data, status=201)


    @action(detail=False, methods=['get'], url_path='resultados')
    def resultados(self, request):
        ele = request.query_params.get('eleccion')
        seccion = request.query_params.get('seccion')
        print(f"[DEBUG] Resultados: eleccion={ele}, seccion={seccion}")

        if not ele:
            print("[DEBUG] Falta parámetro eleccion")
            return Response({"detail": "?eleccion requerido"}, status=400)

        try:
            resp = requests.get(
                "http://127.0.0.1:8002/system2/api/admin/papeletas/",
                params={"eleccion": ele, "seccion": seccion}
            )
            print(f"[DEBUG] Llamada a SIS2: status={resp.status_code}")
        except Exception as e:
            print(f"[DEBUG] Error al contactar SIS2: {e}")
            return Response({"detail": "Error consultando SIS2"}, status=502)

        if resp.status_code != 200:
            return Response({"detail": "Error consultando SIS2"}, status=502)

        cargos = resp.json().get('papeletas', [])
        print(f"[DEBUG] Cargos recibidos: {len(cargos)}")

        agg = (Voto.objects
               .values('candidatura_id')
               .annotate(total=models.Count('id')))
        conteos = {x['candidatura_id']: x['total'] for x in agg}
        print(f"[DEBUG] Conteo de votos: {conteos}")

        salida = []
        total_votos = sum(conteos.values())
        for cargo in cargos:
            for cand in cargo['candidatura_list']:
                total_cand = conteos.get(cand['id'], 0)
                salida.append({
                    "candidatura_id": cand['id'],
                    "nombres": cand['nombres'],
                    "total": total_cand,
                    "porcentaje": round((total_cand / total_votos * 100), 2) if total_votos else 0
                })

        return Response(salida)



def notificarAWebSocket(pap, voto, cand):
    channel_layer = get_channel_layer()  # Obtiene el canal de comunicación
    async_to_sync(channel_layer.group_send)(  # Envia el mensaje al grupo de votación
        "conteo_votos",
        {
            "type": "voto_emitido",
            "data": {
                "candidatura_id": cand,
                "mesa_id": pap.mesa_id,
                "timestamp": voto.timestamp.isoformat()
            }
        }
    )