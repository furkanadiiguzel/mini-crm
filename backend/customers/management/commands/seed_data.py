import random
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from customers.models import Customer

FIRST_NAMES = ["Alice", "Bob", "Carol", "David", "Eve", "Frank", "Grace", "Henry", "Iris", "Jack"]
LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Wilson", "Taylor"]
COMPANIES = ["Acme Corp", "Globex", "Initech", "Umbrella", "Hooli", "Pied Piper", "Dunder Mifflin", "Stark Industries"]
STATUSES = [s[0] for s in Customer.Status.choices]


class Command(BaseCommand):
    help = "Seed the database with sample customers and a default admin user"

    def add_arguments(self, parser):
        parser.add_argument("--count", type=int, default=30, help="Number of customers to create")

    def handle(self, *args, **options):
        if not User.objects.filter(username="admin").exists():
            User.objects.create_superuser("admin", "admin@example.com", "admin123")
            self.stdout.write(self.style.SUCCESS("Created superuser: admin / admin123"))

        count = options["count"]
        created = 0

        for i in range(count):
            first = random.choice(FIRST_NAMES)
            last = random.choice(LAST_NAMES)
            email = f"{first.lower()}.{last.lower()}{i}@example.com"

            if Customer.objects.filter(email=email).exists():
                continue

            Customer.objects.create(
                first_name=first,
                last_name=last,
                email=email,
                phone=f"+1-555-{random.randint(1000, 9999)}",
                company=random.choice(COMPANIES),
                status=random.choice(STATUSES),
                notes="Seeded sample customer.",
            )
            created += 1

        self.stdout.write(self.style.SUCCESS(f"Created {created} customers."))
