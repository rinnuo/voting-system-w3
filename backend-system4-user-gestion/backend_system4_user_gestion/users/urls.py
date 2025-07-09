from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.routers import DefaultRouter
from .apis import UserViewSet, UserBulkCreateViewSet
from .apis.me_viewset import MeView
from .apis.tokens_serializer import MyTokenObtainPairView # token personalizado con rol ;3

router = DefaultRouter()
router.register(r'admin/usuarios', UserViewSet) #CRUD solo SUPER
router.register(r'admin/users', UserBulkCreateViewSet, basename='users')


urlpatterns = router.urls + [
    path("users/me/", MeView.as_view(), name="users-me"),
    path('users/login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('users/refresh/', MyTokenObtainPairView.as_view(), name='token_refresh'),
]