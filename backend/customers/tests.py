from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Customer


class CustomerAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="testpass123")
        response = self.client.post(
            reverse("token_obtain_pair"),
            {"username": "testuser", "password": "testpass123"},
        )
        self.token = response.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")

        self.customer = Customer.objects.create(
            first_name="Jane",
            last_name="Doe",
            email="jane@example.com",
            company="Acme",
            status=Customer.Status.LEAD,
        )

    def test_list_customers(self):
        response = self.client.get(reverse("customer-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)

    def test_create_customer(self):
        payload = {
            "first_name": "John",
            "last_name": "Smith",
            "email": "john@example.com",
            "status": "prospect",
        }
        response = self.client.post(reverse("customer-list"), payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Customer.objects.count(), 2)

    def test_retrieve_customer(self):
        url = reverse("customer-detail", kwargs={"pk": self.customer.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], "jane@example.com")

    def test_update_customer_status(self):
        url = reverse("customer-detail", kwargs={"pk": self.customer.pk})
        response = self.client.patch(url, {"status": "customer"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.customer.refresh_from_db()
        self.assertEqual(self.customer.status, Customer.Status.CUSTOMER)

    def test_delete_customer(self):
        url = reverse("customer-detail", kwargs={"pk": self.customer.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Customer.objects.count(), 0)

    def test_stats_endpoint(self):
        response = self.client.get(reverse("customer-stats"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("total", response.data)
        self.assertIn("by_status", response.data)

    def test_unauthenticated_request(self):
        self.client.credentials()
        response = self.client.get(reverse("customer-list"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
