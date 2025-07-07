# electoral/apis/participaciones.py
from rest_framework import viewsets, serializers
from rest_framework.permissions import AllowAny
from electoral.models import ParticipacionVotanteEleccion

class ParticipacionSerializer(serializers.ModelSerializer):
    seccionId  = serializers.IntegerField(source='seccion.id', read_only=True)
    recintoId  = serializers.IntegerField(source='recinto.id', read_only=True)
    recintoNombre = serializers.CharField(source='recinto.nombre', read_only=True)
    mesaNumero = serializers.SerializerMethodField()


    class Meta:
        model  = ParticipacionVotanteEleccion
        fields = ['seccionId', 'recintoId','recintoNombre', 'mesaNumero']

    def get_mesaNumero(self, obj):
        return obj.mesa.numero if obj.mesa else None


class ParticipacionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset         = ParticipacionVotanteEleccion.objects.all()
    serializer_class = ParticipacionSerializer
    permission_classes = [AllowAny]
    lookup_field       = 'votante_id'