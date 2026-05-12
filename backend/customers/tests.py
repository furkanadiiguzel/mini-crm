from decimal import Decimal

from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Customer, Note, Opportunity


# ── Helpers ────────────────────────────────────────────────────────────────────

def make_customer(**kwargs) -> Customer:
    defaults = {
        "first_name": "Ahmet",
        "last_name":  "Yılmaz",
        "email":      "ahmet@example.com",
    }
    defaults.update(kwargs)
    return Customer.objects.create(**defaults)


def make_opportunity(customer: Customer, **kwargs) -> Opportunity:
    defaults = {
        "title":  "Test Fırsatı",
        "amount": Decimal("5000.00"),
        "stage":  "NEW",
    }
    defaults.update(kwargs)
    return Opportunity.objects.create(customer=customer, **defaults)


# ── Model Tests ────────────────────────────────────────────────────────────────

class CustomerModelTests(TestCase):

    def test_customer_creation(self):
        # Arrange & Act
        customer = make_customer(first_name="Fatma", last_name="Kaya", email="fatma@example.com")

        # Assert
        self.assertEqual(str(customer), "Fatma Kaya")
        self.assertEqual(customer.full_name, "Fatma Kaya")
        self.assertTrue(customer.is_active)
        self.assertIsNotNone(customer.created_at)

    def test_customer_soft_delete(self):
        # Arrange
        customer = make_customer()
        customer_pk = customer.pk

        # Act
        customer.soft_delete()

        # Assert — is_active=False in DB, record still exists
        customer.refresh_from_db()
        self.assertFalse(customer.is_active)
        self.assertTrue(Customer.all_objects.filter(pk=customer_pk).exists())

    def test_active_manager_returns_only_active(self):
        # Arrange
        active = make_customer(email="active@example.com")
        inactive = make_customer(email="inactive@example.com")
        inactive.soft_delete()

        # Act
        qs = Customer.objects.all()

        # Assert
        self.assertIn(active, qs)
        self.assertNotIn(inactive, qs)

    def test_active_manager_count_excludes_soft_deleted(self):
        # Arrange
        make_customer(email="c1@example.com")
        c2 = make_customer(email="c2@example.com")
        c2.soft_delete()

        # Act & Assert
        self.assertEqual(Customer.objects.count(), 1)
        self.assertEqual(Customer.all_objects.count(), 2)

    def test_opportunity_lost_to_won_raises_validation_error(self):
        # Arrange
        customer = make_customer()
        opp = make_opportunity(customer, stage="LOST")

        # Act
        opp.stage = "WON"

        # Assert
        with self.assertRaises(ValidationError):
            opp.full_clean()

    def test_opportunity_won_to_lost_raises_validation_error(self):
        # Arrange
        customer = make_customer()
        opp = make_opportunity(customer, stage="WON")

        # Act
        opp.stage = "LOST"

        # Assert
        with self.assertRaises(ValidationError):
            opp.full_clean()

    def test_opportunity_valid_stage_transition_does_not_raise(self):
        # Arrange
        customer = make_customer()
        opp = make_opportunity(customer, stage="NEW")

        # Act — NEW → QUALIFIED is valid
        opp.stage = "QUALIFIED"

        # Assert
        try:
            opp.full_clean()
        except ValidationError:
            self.fail("full_clean() raised ValidationError for a valid transition")

    def test_opportunity_str(self):
        # Arrange & Act
        customer = make_customer()
        opp = make_opportunity(customer, title="Büyük Satış", stage="NEW")

        # Assert
        self.assertEqual(str(opp), "Büyük Satış (NEW)")


# ── API Tests ──────────────────────────────────────────────────────────────────

class CustomerAPITests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            password="testpass123",
            first_name="Test",
            last_name="User",
        )
        self.client.force_authenticate(user=self.user)

        self.customer = make_customer(
            first_name="Mehmet",
            last_name="Demir",
            email="mehmet@example.com",
            company="Demir A.Ş.",
        )

    # ── Customer list ──────────────────────────────────────────────────────────

    def test_customer_list_returns_200_with_pagination(self):
        # Act
        response = self.client.get(reverse("customer-list"))

        # Assert
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("count", response.data)
        self.assertIn("results", response.data)
        self.assertEqual(response.data["count"], 1)

    def test_customer_create_returns_201(self):
        # Arrange
        payload = {
            "first_name": "Ayşe",
            "last_name":  "Çelik",
            "email":      "ayse@example.com",
        }

        # Act
        response = self.client.post(reverse("customer-list"), payload)

        # Assert
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Customer.objects.filter(email="ayse@example.com").exists())

    def test_customer_create_duplicate_email_returns_400(self):
        # Arrange — same email as setUp customer
        payload = {
            "first_name": "Başka",
            "last_name":  "Kişi",
            "email":      "mehmet@example.com",
        }

        # Act
        response = self.client.post(reverse("customer-list"), payload)

        # Assert
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_customer_search_returns_matching_results(self):
        # Arrange
        make_customer(first_name="Ahmet", last_name="Kara", email="ahmetkara@example.com")
        make_customer(first_name="Zeynep", last_name="Ak", email="zeynep@example.com")

        # Act
        response = self.client.get(reverse("customer-list"), {"search": "ahmet"})

        # Assert
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["first_name"], "Ahmet")

    def test_customer_search_by_company(self):
        # Arrange — customer from setUp has company "Demir A.Ş."
        make_customer(email="other@example.com", company="Başka Şirket")

        # Act
        response = self.client.get(reverse("customer-list"), {"search": "Demir"})

        # Assert
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["email"], "mehmet@example.com")

    def test_customer_delete_is_soft_delete(self):
        # Arrange
        url = reverse("customer-detail", kwargs={"pk": self.customer.pk})

        # Act
        response = self.client.delete(url)

        # Assert — 204 returned but record persists as inactive
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Customer.objects.count(), 0)
        self.assertTrue(Customer.all_objects.filter(pk=self.customer.pk).exists())
        self.customer.refresh_from_db()
        self.assertFalse(self.customer.is_active)

    # ── Notes ──────────────────────────────────────────────────────────────────

    def test_note_create_returns_201_and_assigns_created_by(self):
        # Arrange
        url = reverse("customer-notes", kwargs={"customer_pk": self.customer.pk})
        # NoteSerializer requires `customer` in the request body even though
        # perform_create also injects it from the URL kwarg.
        payload = {"content": "İlk görüşme yapıldı.", "customer": self.customer.pk}

        # Act
        response = self.client.post(url, payload)

        # Assert
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        note = Note.objects.get(pk=response.data["id"])
        self.assertEqual(note.created_by, self.user)
        self.assertEqual(note.customer, self.customer)

    def test_note_list_returns_notes_for_correct_customer(self):
        # Arrange
        other_customer = make_customer(email="other@example.com")
        Note.objects.create(customer=self.customer, content="Not 1", created_by=self.user)
        Note.objects.create(customer=other_customer, content="Not 2", created_by=self.user)
        url = reverse("customer-notes", kwargs={"customer_pk": self.customer.pk})

        # Act
        response = self.client.get(url)

        # Assert — only the note for self.customer is returned
        # Response is paginated: {"count": N, "results": [...]}
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(len(response.data["results"]), 1)

    # ── Opportunities ──────────────────────────────────────────────────────────

    def test_opportunity_create_returns_201(self):
        # Arrange
        payload = {
            "customer": self.customer.pk,
            "title":    "Yeni Yazılım Projesi",
            "amount":   "12000.00",
            "stage":    "NEW",
        }

        # Act
        response = self.client.post(reverse("opportunity-list"), payload)

        # Assert
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["customer_name"], "Mehmet Demir")

    def test_opportunity_filter_by_stage(self):
        # Arrange
        make_opportunity(self.customer, stage="NEW", title="Fırsat 1")
        make_opportunity(self.customer, stage="WON", title="Fırsat 2")
        make_opportunity(self.customer, stage="WON", title="Fırsat 3")

        # Act
        response = self.client.get(reverse("opportunity-list"), {"stage": "WON"})

        # Assert — response is paginated: {"count": N, "results": [...]}
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 2)
        for item in response.data["results"]:
            self.assertEqual(item["stage"], "WON")

    def test_opportunity_invalid_stage_transition_returns_400(self):
        # Arrange
        opp = make_opportunity(self.customer, stage="LOST")
        url = reverse("opportunity-detail", kwargs={"pk": opp.pk})

        # Act
        response = self.client.patch(url, {"stage": "WON"})

        # Assert
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        opp.refresh_from_db()
        self.assertEqual(opp.stage, "LOST")  # stage unchanged

    def test_opportunity_amount_must_be_positive(self):
        # Arrange
        payload = {
            "customer": self.customer.pk,
            "title":    "Negatif Tutar",
            "amount":   "-100.00",
            "stage":    "NEW",
        }

        # Act
        response = self.client.post(reverse("opportunity-list"), payload)

        # Assert
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # ── Dashboard ──────────────────────────────────────────────────────────────

    def test_dashboard_summary_returns_200_with_required_fields(self):
        # Act
        response = self.client.get(reverse("dashboard-summary"))

        # Assert
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for field in ("total_customers", "new_customers_last_30_days",
                      "won_revenue_this_month", "opportunities_by_stage",
                      "recent_customers"):
            self.assertIn(field, response.data)

    def test_dashboard_total_customers_matches_active_count(self):
        # Arrange — add another customer and soft-delete one
        make_opportunity(self.customer, stage="WON", title="Kazanılan")
        extra = make_customer(email="extra@example.com")
        extra.soft_delete()

        # Act
        response = self.client.get(reverse("dashboard-summary"))

        # Assert — only active customers counted
        self.assertEqual(response.data["total_customers"], 1)

    def test_dashboard_recent_customers_max_five(self):
        # Arrange — create 6 more customers (7 total with setUp)
        for i in range(6):
            make_customer(email=f"customer{i}@example.com")

        # Act
        response = self.client.get(reverse("dashboard-summary"))

        # Assert
        self.assertLessEqual(len(response.data["recent_customers"]), 5)

    # ── Authentication ─────────────────────────────────────────────────────────

    def test_unauthenticated_access_returns_401(self):
        # Arrange
        self.client.force_authenticate(user=None)

        # Act
        response = self.client.get(reverse("customer-list"))

        # Assert
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
