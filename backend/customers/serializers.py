from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from .models import Customer, Note, Opportunity


class NoteSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Note
        fields = ("id", "customer", "content", "created_by", "created_by_name", "created_at")
        read_only_fields = ("id", "created_by", "created_at")

    def get_created_by_name(self, obj):
        return obj.created_by.get_full_name() or obj.created_by.username

    def create(self, validated_data):
        validated_data["created_by"] = self.context["request"].user
        return super().create(validated_data)


class OpportunitySerializer(serializers.ModelSerializer):
    customer_name = serializers.SerializerMethodField()

    class Meta:
        model = Opportunity
        fields = (
            "id", "customer", "customer_name", "title", "amount",
            "stage", "assigned_to", "expected_close", "created_at",
        )
        read_only_fields = ("id", "created_at")

    def get_customer_name(self, obj):
        return obj.customer.full_name

    def validate_amount(self, value):
        if value <= Decimal("0"):
            raise serializers.ValidationError("Tutar 0'dan büyük olmalıdır.")
        return value

    def validate(self, attrs):
        if self.instance and "stage" in attrs:
            old_stage = self.instance.stage
            new_stage = attrs["stage"]
            forbidden = Opportunity.INVALID_TRANSITIONS.get(old_stage, set())
            if new_stage in forbidden:
                raise serializers.ValidationError(
                    f"Bu aşama geçişine izin verilmemektedir: {old_stage} → {new_stage}"
                )
        return attrs


class CustomerListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ("id", "first_name", "last_name", "email", "company", "is_active", "created_at")
        read_only_fields = ("id", "created_at")


class CustomerDetailSerializer(CustomerListSerializer):
    notes = NoteSerializer(many=True, read_only=True)
    opportunities = OpportunitySerializer(many=True, read_only=True)

    class Meta(CustomerListSerializer.Meta):
        fields = (
            "id", "first_name", "last_name", "email", "phone", "company",
            "is_active", "created_at", "updated_at", "notes", "opportunities",
        )


class CustomerCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ("first_name", "last_name", "email", "phone", "company")

    def validate_email(self, value):
        qs = Customer.all_objects.filter(email=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Bu e-posta adresi zaten kayıtlı.")
        return value

    def validate_first_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Ad alanı boş bırakılamaz.")
        return value.strip()

    def validate_last_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Soyad alanı boş bırakılamaz.")
        return value.strip()


class DashboardSerializer(serializers.Serializer):
    total_customers = serializers.IntegerField()
    opportunities_by_stage = serializers.ListField(
        child=serializers.DictField()
    )
    new_customers_last_30_days = serializers.IntegerField()
    won_revenue_this_month = serializers.DecimalField(max_digits=14, decimal_places=2)
    recent_customers = CustomerListSerializer(many=True)

    @classmethod
    def build_data(cls):
        now = timezone.now()
        thirty_days_ago = now - timedelta(days=30)
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        from django.db.models import Count, Sum

        stages = (
            Opportunity.objects.values("stage")
            .annotate(count=Count("id"), total_amount=Sum("amount"))
            .order_by("stage")
        )
        opportunities_by_stage = [
            {
                "stage": s["stage"],
                "count": s["count"],
                "total_amount": str(s["total_amount"] or Decimal("0")),
            }
            for s in stages
        ]

        won_revenue = (
            Opportunity.objects.filter(stage="WON", created_at__gte=month_start)
            .aggregate(total=Sum("amount"))["total"]
            or Decimal("0")
        )

        return {
            "total_customers": Customer.objects.count(),
            "opportunities_by_stage": opportunities_by_stage,
            "new_customers_last_30_days": Customer.objects.filter(
                created_at__gte=thirty_days_ago
            ).count(),
            "won_revenue_this_month": won_revenue,
            "recent_customers": Customer.objects.order_by("-created_at")[:5],
        }
