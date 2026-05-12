import random
from datetime import date, timedelta

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand

from customers.models import Customer, Note, Opportunity

# ── Seed data ──────────────────────────────────────────────────────────────────

CUSTOMERS = [
    ("Ahmet",   "Yılmaz",  "ahmet.yilmaz@example.com",   "+90 532 111 0001", "TechSoft A.Ş."),
    ("Mehmet",  "Kaya",    "mehmet.kaya@example.com",     "+90 533 111 0002", "DataBridge Ltd."),
    ("Ayşe",    "Demir",   "ayse.demir@example.com",      "+90 534 111 0003", "CloudNet Bilişim"),
    ("Fatma",   "Çelik",   "fatma.celik@example.com",     "+90 535 111 0004", "MegaCode Yazılım"),
    ("Ali",     "Öztürk",  "ali.ozturk@example.com",      "+90 536 111 0005", "NovaSys Teknoloji"),
    ("Zeynep",  "Şahin",   "zeynep.sahin@example.com",    "+90 537 111 0006", "PixelCraft Studio"),
    ("Mustafa", "Yıldız",  "mustafa.yildiz@example.com",  "+90 538 111 0007", "TechSoft A.Ş."),
    ("Elif",    "Arslan",  "elif.arslan@example.com",     "+90 539 111 0008", "DataBridge Ltd."),
    ("İbrahim", "Koç",     "ibrahim.koc@example.com",     "+90 541 111 0009", "Bulut Sistemleri A.Ş."),
    ("Hatice",  "Kurt",    "hatice.kurt@example.com",     "+90 542 111 0010", "SmartApp Dijital"),
    ("Hüseyin", "Aydın",   "huseyin.aydin@example.com",   "+90 543 111 0011", "CloudNet Bilişim"),
    ("Emine",   "Özdemir", "emine.ozdemir@example.com",   "+90 544 111 0012", "MegaCode Yazılım"),
    ("Yusuf",   "Şimşek",  "yusuf.simsek@example.com",   "+90 545 111 0013", "InnoTech Çözümleri"),
    ("Hacer",   "Çetin",   "hacer.cetin@example.com",     "+90 546 111 0014", "NovaSys Teknoloji"),
    ("Murat",   "Doğan",   "murat.dogan@example.com",     "+90 547 111 0015", "PixelCraft Studio"),
    ("Selin",   "Kılıç",   "selin.kilic@example.com",     "+90 548 111 0016", "TechSoft A.Ş."),
    ("Emre",    "Avcı",    "emre.avci@example.com",       "+90 549 111 0017", "Bulut Sistemleri A.Ş."),
    ("Büşra",   "Polat",   "busra.polat@example.com",     "+90 551 111 0018", "SmartApp Dijital"),
    ("Serkan",  "Güneş",   "serkan.gunes@example.com",    "+90 552 111 0019", "InnoTech Çözümleri"),
    ("Cansu",   "Erdoğan", "cansu.erdogan@example.com",   "+90 553 111 0020", "DataBridge Ltd."),
]

NOTE_TEMPLATES = [
    "İlk görüşme yapıldı, ihtiyaçlar belirlendi.",
    "Teklif gönderildi, geri dönüş bekleniyor.",
    "Demo planlandı, {tarih} tarihinde gerçekleşecek.",
    "Müşteri teklifin bütçe kısmını onayladı.",
    "Teknik ekiple toplantı yapıldı.",
    "Sözleşme taslağı hazırlandı ve iletildi.",
    "Referans ziyareti organize edildi.",
    "Revize teklif gönderildi.",
    "Karar vericilerle görüşme ayarlandı.",
    "Pilot uygulama kapsamı netleştirildi.",
]

OPPORTUNITIES = [
    ("ERP Projesi",             "NEW",       85_000),
    ("Web Sitesi Yenileme",     "QUALIFIED", 18_500),
    ("Mobil Uygulama",          "PROPOSAL",  42_000),
    ("Bulut Göçü",              "WON",       120_000),
    ("Siber Güvenlik Danışmanlığı", "LOST",  30_000),
    ("CRM Entegrasyonu",        "NEW",       55_000),
    ("Veri Ambarı Kurulumu",    "QUALIFIED", 95_000),
    ("E-Ticaret Platformu",     "PROPOSAL",  67_500),
    ("Kurumsal Portal",         "WON",       48_000),
    ("API Geliştirme",          "NEW",       22_000),
    ("DevOps Otomasyonu",       "QUALIFIED", 38_000),
    ("BI Raporlama Sistemi",    "PROPOSAL",  74_000),
    ("Yapay Zeka Entegrasyonu", "WON",       150_000),
    ("Ağ Altyapısı Yükseltme",  "LOST",      60_000),
    ("HR Yazılımı",             "NEW",       35_000),
]


class Command(BaseCommand):
    help = "Seed the database with Turkish sample data (idempotent)"

    def handle(self, *args, **options):
        admin = self._ensure_admin()
        customers = self._seed_customers()
        self._seed_notes(customers, admin)
        self._seed_opportunities(customers)
        self.stdout.write(self.style.SUCCESS("Seed tamamlandı."))

    # ── Helpers ────────────────────────────────────────────────────────────────

    def _ensure_admin(self) -> User:
        if not User.objects.filter(username="admin").exists():
            user = User.objects.create_superuser(
                username="admin",
                email="admin@example.com",
                password="admin123",
                first_name="Admin",
                last_name="Kullanıcı",
            )
            self.stdout.write(self.style.SUCCESS("  [+] Süper kullanıcı oluşturuldu: admin / admin123"))
        else:
            user = User.objects.get(username="admin")
            self.stdout.write("  [=] Admin zaten mevcut, atlandı.")
        return user

    def _seed_customers(self) -> list[Customer]:
        created = 0
        customers: list[Customer] = []

        for first, last, email, phone, company in CUSTOMERS:
            customer, new = Customer.all_objects.get_or_create(
                email=email,
                defaults={
                    "first_name": first,
                    "last_name":  last,
                    "phone":      phone,
                    "company":    company,
                },
            )
            customers.append(customer)
            if new:
                created += 1

        self.stdout.write(f"  [+] {created} yeni müşteri oluşturuldu, "
                          f"{len(CUSTOMERS) - created} zaten mevcuttu.")
        return customers

    def _seed_notes(self, customers: list[Customer], author: User) -> None:
        created = 0
        today = date.today()

        for i, customer in enumerate(customers):
            if customer.notes.exists():
                continue

            # 2 or 3 notes per customer, deterministic based on index
            note_count = 2 + (i % 2)
            pool = NOTE_TEMPLATES[i % len(NOTE_TEMPLATES):]
            pool += NOTE_TEMPLATES[:i % len(NOTE_TEMPLATES)]

            for j in range(note_count):
                content = pool[j].format(
                    tarih=(today + timedelta(days=7 + j * 3)).strftime("%d.%m.%Y")
                )
                Note.objects.create(
                    customer=customer,
                    content=content,
                    created_by=author,
                )
                created += 1

        self.stdout.write(f"  [+] {created} yeni not oluşturuldu.")

    def _seed_opportunities(self, customers: list[Customer]) -> None:
        created = 0
        today = date.today()

        # Distribute 15 opportunities across customers (roughly 1 per customer)
        for i, (title, stage, amount) in enumerate(OPPORTUNITIES):
            customer = customers[i % len(customers)]

            if Opportunity.objects.filter(title=title, customer=customer).exists():
                continue

            close_offset = 30 + (i * 11) % 120
            Opportunity.objects.create(
                customer=customer,
                title=title,
                amount=amount,
                stage=stage,
                expected_close=today + timedelta(days=close_offset),
            )
            created += 1

        self.stdout.write(f"  [+] {created} yeni fırsat oluşturuldu.")
