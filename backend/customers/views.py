from datetime import timedelta
from decimal import Decimal

from django.contrib.auth.models import User
from django.db.models import Count, Q, Sum
from django.utils import timezone
from rest_framework import serializers as drf_serializers
from rest_framework import viewsets
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Customer, Note, Opportunity
from .serializers import (
    CustomerCreateUpdateSerializer,
    CustomerDetailSerializer,
    CustomerListSerializer,
    NoteSerializer,
    OpportunitySerializer,
)


class CustomerPagination(PageNumberPagination):
    page_size = 10


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    pagination_class = CustomerPagination

    def get_serializer_class(self):
        if self.action == "list":
            return CustomerListSerializer
        if self.action == "retrieve":
            return CustomerDetailSerializer
        return CustomerCreateUpdateSerializer

    def get_queryset(self):
        queryset = Customer.objects.all()

        if self.action == "retrieve":
            return queryset.prefetch_related(
                "notes__created_by",
                "opportunities__assigned_to",
            )

        if self.action == "list":
            search = self.request.query_params.get("search", "")
            if search:
                queryset = queryset.filter(
                    Q(first_name__icontains=search)
                    | Q(last_name__icontains=search)
                    | Q(email__icontains=search)
                    | Q(company__icontains=search)
                )

        return queryset

    def perform_destroy(self, instance):
        instance.soft_delete()


class NoteViewSet(viewsets.ModelViewSet):
    serializer_class = NoteSerializer

    def get_queryset(self):
        return Note.objects.filter(
            customer_id=self.kwargs["customer_pk"]
        ).select_related("created_by")

    def perform_create(self, serializer):
        customer = Customer.objects.get(pk=self.kwargs["customer_pk"])
        serializer.save(customer=customer, created_by=self.request.user)


class OpportunityViewSet(viewsets.ModelViewSet):
    serializer_class = OpportunitySerializer
    queryset = Opportunity.objects.select_related("customer", "assigned_to").all()

    def get_queryset(self):
        queryset = super().get_queryset()
        stage = self.request.query_params.get("stage")
        if stage:
            queryset = queryset.filter(stage=stage)
        return queryset


class CurrentUserView(APIView):
    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
        })


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        required = ("username", "email", "password")
        missing = [f for f in required if not data.get(f)]
        if missing:
            raise drf_serializers.ValidationError(
                {f: "Bu alan zorunludur." for f in missing}
            )

        if User.objects.filter(username=data["username"]).exists():
            raise drf_serializers.ValidationError(
                {"username": "Bu kullanıcı adı zaten alınmış."}
            )
        if User.objects.filter(email=data["email"]).exists():
            raise drf_serializers.ValidationError(
                {"email": "Bu e-posta adresi zaten kayıtlı."}
            )

        user = User.objects.create_user(
            username=data["username"],
            email=data["email"],
            password=data["password"],
            first_name=data.get("first_name", ""),
            last_name=data.get("last_name", ""),
        )

        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
            },
        }, status=201)


class DashboardView(APIView):
    def get(self, request):
        now = timezone.now()
        thirty_days_ago = now - timedelta(days=30)

        total_customers = Customer.objects.count()

        opportunities_by_stage = list(
            Opportunity.objects.values("stage")
            .annotate(count=Count("id"), total_amount=Sum("amount"))
            .order_by("stage")
        )

        new_customers_30d = Customer.objects.filter(
            created_at__gte=thirty_days_ago
        ).count()

        won_revenue = (
            Opportunity.objects.filter(
                stage="WON",
                created_at__year=now.year,
                created_at__month=now.month,
            ).aggregate(total=Sum("amount"))["total"]
            or Decimal("0.00")
        )

        recent_customers = Customer.objects.order_by("-created_at")[:5]

        data = {
            "total_customers": total_customers,
            "opportunities_by_stage": opportunities_by_stage,
            "new_customers_last_30_days": new_customers_30d,
            "won_revenue_this_month": str(won_revenue),
            "recent_customers": CustomerListSerializer(recent_customers, many=True).data,
        }
        return Response(data)
