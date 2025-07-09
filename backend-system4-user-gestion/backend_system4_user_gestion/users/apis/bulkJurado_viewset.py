from rest_framework import serializers
from rest_framework.permissions import BasePermission, AllowAny

from users.models import CustomUser
from django.db import transaction
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from users.models import CustomUser

class BulkJuradoSerializer(serializers.Serializer):
    participant_id = serializers.UUIDField()
    base_username  = serializers.CharField(max_length=150)
    password       = serializers.CharField(write_only=True)
    first_name     = serializers.CharField(max_length=30)
    last_name      = serializers.CharField(max_length=150)
    email          = serializers.EmailField()
    role           = serializers.ChoiceField(choices=CustomUser.ROLE_CHOICES)

class BulkJuradoResultSerializer(serializers.Serializer):
    participant_id = serializers.UUIDField()
    user_id        = serializers.IntegerField()
    username       = serializers.CharField(max_length=150)

class IsElectoralUser(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and getattr(request.user, "role", None) == "ELECCION"
        )

class UserBulkCreateViewSet(viewsets.GenericViewSet):
    serializer_class = BulkJuradoSerializer
    permission_classes = [IsElectoralUser]  # Define your permissions here

    @action(detail=False, methods=['post'], url_path='bulk_create')
    @transaction.atomic
    def bulk_create(self, request):
        serializer = self.get_serializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        results = []

        for entry in serializer.validated_data:
            part_id    = entry['participant_id']
            base       = entry['base_username']
            pwd        = entry['password']
            first_name = entry['first_name']
            last_name  = entry['last_name']
            email      = entry['email']
            role       = entry['role']

            # 1) Determinar username único
            candidate = base
            counter   = 0
            while CustomUser.objects.filter(username=candidate).exists():
                counter += 1
                candidate = f"{base}{counter}"

            # 2) Crear el usuario
            user = CustomUser.objects.create_user(
                 username=candidate,
                 password=pwd,
                 first_name=first_name,
                 last_name=last_name,
                 email=email,
                 role=role
             )

            # 3) Acumular resultado
            results.append({
                'participant_id': part_id,
                'user_id':        user.id,  # Simulación de ID
                'username':       user.username
            })

        # 4) Devolver listado de resultados
        out_ser = BulkJuradoResultSerializer(results, many=True)
        return Response(out_ser.data, status=status.HTTP_201_CREATED)