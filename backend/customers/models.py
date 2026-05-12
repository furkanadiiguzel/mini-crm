from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError


class ActiveManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(is_active=True)


class Customer(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    company = models.CharField(max_length=200, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = ActiveManager()
    all_objects = models.Manager()

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    def soft_delete(self):
        self.is_active = False
        self.save()


class Note(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name="notes")
    content = models.TextField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notes")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Note for {self.customer} by {self.created_by}"


class Opportunity(models.Model):
    STAGE_CHOICES = [
        ("NEW", "New"),
        ("QUALIFIED", "Qualified"),
        ("PROPOSAL", "Proposal"),
        ("WON", "Won"),
        ("LOST", "Lost"),
    ]

    INVALID_TRANSITIONS = {
        "LOST": {"WON"},
        "WON": {"LOST"},
    }

    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name="opportunities")
    title = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    stage = models.CharField(max_length=20, choices=STAGE_CHOICES, default="NEW")
    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_opportunities",
    )
    expected_close = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} ({self.stage})"

    def clean(self):
        if not self.pk:
            return
        previous_stage = Opportunity.objects.get(pk=self.pk).stage
        forbidden = self.INVALID_TRANSITIONS.get(previous_stage, set())
        if self.stage in forbidden:
            raise ValidationError(
                f"Stage transition from '{previous_stage}' to '{self.stage}' is not allowed."
            )
