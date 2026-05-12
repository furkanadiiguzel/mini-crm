from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import Customer
from .serializers import (
    CustomerListSerializer,
    CustomerDetailSerializer,
    CustomerCreateUpdateSerializer,
    DashboardSerializer,
)


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["is_active", "company"]
    search_fields = ["first_name", "last_name", "email", "company"]
    ordering_fields = ["created_at", "last_name", "company"]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        if self.action == "list":
            return CustomerListSerializer
        if self.action in ("create", "update", "partial_update"):
            return CustomerCreateUpdateSerializer
        return CustomerDetailSerializer

    @action(detail=False, methods=["get"])
    def dashboard(self, request):
        data = DashboardSerializer.build_data()
        serializer = DashboardSerializer(data)
        return Response(serializer.data)
