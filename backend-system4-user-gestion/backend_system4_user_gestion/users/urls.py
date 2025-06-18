from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.routers import DefaultRouter
from .apis import UserViewSet
from .apis.me_viewset import MeView

router = DefaultRouter()
router.register(r'admin/usuarios', UserViewSet) #CRUD solo SUPER

urlpatterns = router.urls + [
    path("users/me/", MeView.as_view(), name="users-me"),
    path('users/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('users/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]