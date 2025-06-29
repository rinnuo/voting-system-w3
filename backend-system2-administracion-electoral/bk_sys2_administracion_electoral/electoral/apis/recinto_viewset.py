from rest_framework import serializers
from rest_framework.permissions import AllowAny
from electoral.apis.base.permission_serializer import IsEleccionUser, EleccionBaseViewSet
from electoral.models import Recinto

class RecintoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recinto
        fields = ["id", "nombre", "lat", "lng"]

class RecintoViewSet(EleccionBaseViewSet):
    serializer_class = RecintoSerializer
    queryset = Recinto.objects.all()

    def get_permissions(self):
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return [AllowAny()]
        return [IsEleccionUser()]