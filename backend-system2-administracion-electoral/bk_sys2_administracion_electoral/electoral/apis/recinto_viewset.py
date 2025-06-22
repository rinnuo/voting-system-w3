from rest_framework import serializers
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from electoral.apis.permission_serializer import IsEleccionUser
from electoral.authentication import ExternalJWTAuthentication
from electoral.models import Recinto
from rest_framework_simplejwt.models import TokenUser

class RecintoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recinto
        fields = ["id", "nombre", "lat", "lng"]


class RecintoViewSet(viewsets.ModelViewSet):
    authentication_classes = [ExternalJWTAuthentication]
    serializer_class = RecintoSerializer
    queryset = Recinto.objects.all()

    def initialize_request(self, request, *args, **kwargs):
        req = super().initialize_request(request, *args, **kwargs)
        # Si tiene un token válido pero no queremos user real:
        if hasattr(req, 'auth') and req.auth and not hasattr(req, 'user'):
            req.user = TokenUser(req.auth)
        return req

    def get_permissions(self):
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return [AllowAny()]
        return [IsEleccionUser()]



