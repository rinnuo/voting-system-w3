from rest_framework import serializers
from electoral.models import PartidoPolitico
from electoral.apis.base.permission_serializer import EleccionBaseViewSet, IsEleccionUser
from rest_framework.permissions import AllowAny

class PartidoPoliticoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PartidoPolitico
        fields = ['id', 'nombre', 'sigla', 'color']

class PartidoPoliticoViewSet(EleccionBaseViewSet):
    serializer_class = PartidoPoliticoSerializer
    queryset = PartidoPolitico.objects.all()

    def get_permissions(self):
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return [AllowAny()]
        return [IsEleccionUser()]