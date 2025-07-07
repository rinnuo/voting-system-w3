from django.core.management import call_command
from rest_framework import serializers, viewsets
from rest_framework.permissions import AllowAny
from electoral.models import Papeleta
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from electoral.models import Papeleta, Eleccion, Seccion

class PapeletaSerializer(serializers.ModelSerializer):
    cargo_id         = serializers.IntegerField(source='cargo.id', read_only=True)
    cargo_nombre     = serializers.CharField(source='cargo.nombre', read_only=True)
    candidatura_list = serializers.SerializerMethodField()

    class Meta:
        model  = Papeleta
        fields = [
            'cargo_id',
            'cargo_nombre',
            'candidatura_list'
        ]

    def get_candidatura_list(self, obj):
        return [
            {
                "id":    cand.id,
                "nombres": cand.nombres,
                "ci":      cand.ci,
                "foto":    cand.foto.url if cand.foto else None
            }
            for cand in obj.candidaturas.all()
        ]

class PapeletaViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class   = PapeletaSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        ele = self.request.query_params.get('eleccion')
        sec = self.request.query_params.get('seccion')
        if not ele or not sec:
            return Papeleta.objects.none()

        return (Papeleta.objects
                    .filter(eleccion__id=ele, seccion__id=sec)
                    .select_related('cargo')
                    .prefetch_related('candidaturas'))

    def list(self, request, *args, **kwargs):
        ele_id = request.query_params.get('eleccion')
        sec_id = request.query_params.get('seccion')

        try: #llamamos a generar la papeleta commando
            call_command('generar_papeletas')
        except Exception as e:
            print("Error regenerando papeletas:", e)

        # Obtener metadatos
        try:
            ele = Eleccion.objects.get(id=ele_id)
            se  = Seccion.objects.get(id=sec_id)
        except (Eleccion.DoesNotExist, Seccion.DoesNotExist):
            return Response([], status=status.HTTP_200_OK)

        qs = self.get_queryset()
        serializer = self.get_serializer(qs, many=True)

        payload = {
            "eleccion": {
                "id": ele.id,
                "nombre": ele.nombre,
                "fecha": ele.fecha,
                "activa": ele.activa
            },
            "seccion": {
                "id": se.id,
                "nombre": se.nombre
            },
            "papeletas": serializer.data
        }
        return Response(payload, status=status.HTTP_200_OK)