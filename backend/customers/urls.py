from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    CustomerViewSet,
    CurrentUserView,
    DashboardView,
    NoteViewSet,
    OpportunityViewSet,
    RegisterView,
)

router = DefaultRouter()
router.register(r"customers", CustomerViewSet, basename="customer")
router.register(r"opportunities", OpportunityViewSet, basename="opportunity")

urlpatterns = [
    path("", include(router.urls)),
    path(
        "customers/<int:customer_pk>/notes/",
        NoteViewSet.as_view({"get": "list", "post": "create"}),
        name="customer-notes",
    ),
    path(
        "customers/<int:customer_pk>/notes/<int:pk>/",
        NoteViewSet.as_view({
            "get": "retrieve",
            "put": "update",
            "patch": "partial_update",
            "delete": "destroy",
        }),
        name="customer-note-detail",
    ),
    path("dashboard/summary/", DashboardView.as_view(), name="dashboard-summary"),
    path("auth/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/me/", CurrentUserView.as_view(), name="current_user"),
    path("auth/register/", RegisterView.as_view(), name="register"),
]
