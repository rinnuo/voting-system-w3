# electoral/apis/participaciones.py
from rest_framework import viewsets, serializers, mixins, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

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


class ParticipacionViewSet(mixins.DestroyModelMixin,viewsets.ReadOnlyModelViewSet):
    queryset         = ParticipacionVotanteEleccion.objects.all()
    serializer_class = ParticipacionSerializer
    permission_classes = [AllowAny]
    lookup_field       = 'votante_id'

    def destroy(self, request, votante_id=None):
        participaciones = self.get_queryset().filter(votante_id=votante_id)
        if not participaciones.exists():
            return Response(status=status.HTTP_404_NOT_FOUND)

        participaciones.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
