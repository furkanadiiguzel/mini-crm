# Mini CRM

Müşteri ilişkileri yönetim sistemi — Django REST Framework + React.

## Teknoloji Stack

| Katman     | Teknoloji                                |
|-----------|------------------------------------------|
| Backend   | Python 3.12, Django 5.x, DRF 3.15       |
| Frontend  | React 18, Vite 5, Tailwind CSS 3        |
| Veritabanı| MySQL 8.x                               |
| Auth      | JWT (SimpleJWT)                          |
| Grafikler | Recharts                                 |
| DevOps    | Docker, docker-compose                   |

---

## Hızlı Başlangıç (Docker — Önerilen)

Docker tüm platformlarda (macOS, Windows, Linux) aynı şekilde çalışır.
Tek gereksinim: [Docker Desktop](https://www.docker.com/products/docker-desktop/) kurulu olmalı.

```bash
# 1. Repoyu klonla
git clone https://github.com/<username>/mini-crm.git
cd mini-crm

# 2. Environment dosyalarını oluştur
cp backend/.env.example backend/.env

# 3. Tüm servisleri başlat (MySQL + Backend + Frontend)
docker-compose up --build

# 4. İlk çalıştırmada (ayrı terminalde):
docker-compose exec backend python manage.py createsuperuser
```

Uygulama açılacak adresler:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api/
- Django Admin: http://localhost:8000/admin/

Durdurmak: `Ctrl+C` veya `docker-compose down`
Veritabanını sıfırlamak: `docker-compose down -v` (volume silinir)

---

## Manuel Kurulum

Docker kullanmak istemiyorsan veya geliştirme sırasında hot-reload istiyorsan
bu adımları takip et. **Platform-spesifik adımlara dikkat et.**

### Gereksinimler

| Araç        | Minimum Versiyon | Kontrol Komutu          |
|-------------|-----------------|-------------------------|
| Python      | 3.10+           | `python3 --version`     |
| Node.js     | 18+             | `node --version`        |
| npm         | 9+              | `npm --version`         |
| MySQL       | 8.0+            | `mysql --version`       |
| Git         | 2.x             | `git --version`         |

---

### 1. MySQL Kurulumu

<details>
<summary><strong>🍎 macOS</strong></summary>

```bash
# Homebrew ile (önerilen)
brew install mysql
brew services start mysql

# Root şifre ayarla
mysql_secure_installation

# MySQL'e bağlan ve veritabanı oluştur
mysql -u root -p
```

```sql
CREATE DATABASE mini_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'crm_user'@'localhost' IDENTIFIED BY 'crm_password';
GRANT ALL PRIVILEGES ON mini_crm.* TO 'crm_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

> **Not:** macOS'te `mysqlclient` pip paketi için Homebrew'dan mysql-client gerekir:
> ```bash
> brew install mysql-client pkg-config
> export PKG_CONFIG_PATH="/opt/homebrew/opt/mysql-client/lib/pkgconfig"
> # ↑ Apple Silicon (M1/M2/M3). Intel Mac için:
> # export PKG_CONFIG_PATH="/usr/local/opt/mysql-client/lib/pkgconfig"
> ```
> Bu export'u `~/.zshrc`'ye eklemen önerilir.

</details>

<details>
<summary><strong>🪟 Windows</strong></summary>

1. [MySQL Installer](https://dev.mysql.com/downloads/installer/) indir (mysql-installer-community)
2. "Developer Default" veya "Server Only" seç
3. Root şifre belirle
4. MySQL Workbench veya komut satırı ile bağlan:

```cmd
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p
```

```sql
CREATE DATABASE mini_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'crm_user'@'localhost' IDENTIFIED BY 'crm_password';
GRANT ALL PRIVILEGES ON mini_crm.* TO 'crm_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

> **Not:** Windows'ta `mysqlclient` pip paketi bazen sorun çıkarır.
> Alternatif olarak `PyMySQL` kullanılabilir:
> ```cmd
> pip install PyMySQL
> ```
> Sonra `backend/crm_project/__init__.py`'ye ekle:
> ```python
> import pymysql
> pymysql.install_as_MySQLdb()
> ```

> **Not:** Windows'ta `python3` yerine `python` kullanılır.

</details>

<details>
<summary><strong>🐧 Linux (Ubuntu/Debian)</strong></summary>

```bash
sudo apt update
sudo apt install mysql-server mysql-client libmysqlclient-dev python3-dev build-essential pkg-config
sudo systemctl start mysql
sudo systemctl enable mysql

# Root şifre ayarla
sudo mysql_secure_installation

# MySQL'e bağlan
sudo mysql -u root -p
```

```sql
CREATE DATABASE mini_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'crm_user'@'localhost' IDENTIFIED BY 'crm_password';
GRANT ALL PRIVILEGES ON mini_crm.* TO 'crm_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

</details>

---

### 2. Backend Kurulumu

```bash
cd backend

# Virtual environment oluştur
python3 -m venv venv

# Virtual environment aktifleştir
# ┌─────────────────────────────────────────────────┐
# │ macOS / Linux:                                  │
# │   source venv/bin/activate                      │
# │                                                 │
# │ Windows (CMD):                                  │
# │   venv\Scripts\activate.bat                     │
# │                                                 │
# │ Windows (PowerShell):                           │
# │   venv\Scripts\Activate.ps1                     │
# │   (İlk seferde: Set-ExecutionPolicy             │
# │    -Scope CurrentUser RemoteSigned)             │
# └─────────────────────────────────────────────────┘

# Bağımlılıkları yükle
pip install -r requirements.txt

# macOS'te mysqlclient hatası alırsan yukarıdaki PKG_CONFIG_PATH notuna bak
# Windows'ta mysqlclient hatası alırsan yukarıdaki PyMySQL notuna bak

# Environment dosyasını oluştur ve düzenle
cp .env.example .env
# .env dosyasını aç ve veritabanı bilgilerini güncelle:
#   DB_NAME=mini_crm
#   DB_USER=crm_user
#   DB_PASSWORD=crm_password
#   DB_HOST=localhost
#   DB_PORT=3306
#   SECRET_KEY=buraya-guclu-rastgele-bir-key-yaz
#   DEBUG=True

# Veritabanı migration
python manage.py migrate

# Örnek veri yükle (opsiyonel ama önerilir)
python manage.py seed_data

# Admin kullanıcı oluştur
python manage.py createsuperuser

# Geliştirme sunucusunu başlat
python manage.py runserver
```

Backend çalışıyor: http://localhost:8000/api/

---

### 3. Frontend Kurulumu

Yeni bir terminal aç (backend çalışmaya devam etsin):

```bash
cd frontend

# Bağımlılıkları yükle
npm install

# Environment dosyasını oluştur
cp .env.example .env
# .env dosyası:
#   VITE_API_BASE_URL=http://localhost:8000/api

# Geliştirme sunucusunu başlat
npm run dev
```

Frontend çalışıyor: http://localhost:5173

---

### 4. Doğrulama Kontrol Listesi

Her şey doğru çalışıyor mu kontrol et:

- [ ] http://localhost:8000/api/ → DRF Browsable API açılıyor
- [ ] http://localhost:8000/admin/ → Django Admin giriş sayfası
- [ ] http://localhost:5173 → React uygulaması (login sayfası)
- [ ] Login yapılabiliyor (createsuperuser bilgileri ile)
- [ ] Dashboard'da KPI kartları ve grafik görünüyor
- [ ] Müşteri listesinde seed data görünüyor
- [ ] Yeni müşteri oluşturulabiliyor
- [ ] Müşteri silinebiliyor (soft delete)

---

## Proje Yapısı

```
mini-crm/
├── README.md
├── docker-compose.yml
├── .gitignore
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env.example
│   ├── manage.py
│   ├── crm_project/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   └── customers/
│       ├── models.py          # Customer, Note, Opportunity
│       ├── serializers.py     # DRF Serializer'lar
│       ├── views.py           # ViewSet'ler
│       ├── urls.py            # API routing
│       ├── admin.py           # Django Admin config
│       ├── tests.py           # Unit & API testleri
│       ├── filters.py         # django-filter FilterSet'ler
│       └── management/
│           └── commands/
│               └── seed_data.py
│
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── .env.example
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── styles/
        │   └── design-tokens.css
        ├── components/
        │   ├── ui/            # Button, Input, Badge, Modal, Skeleton...
        │   ├── layout/        # AppLayout, Sidebar, PageHeader
        │   └── features/      # KpiCard, CustomerTable, NoteList...
        ├── pages/             # Dashboard, CustomerList, CustomerForm...
        ├── hooks/             # useDebounce, useCountUp...
        ├── context/           # AuthContext
        ├── services/          # api.js (Axios instance), auth.js
        └── types/             # TypeScript interfaces (bonus)
```

---

## API Endpoint'leri

| Method | Endpoint                        | Açıklama                    | Auth |
|--------|---------------------------------|-----------------------------|------|
| POST   | /api/auth/login/                | JWT token al                | ✗    |
| POST   | /api/auth/refresh/              | Token yenile                | ✗    |
| GET    | /api/auth/me/                   | Giriş yapan kullanıcı       | ✓    |
| GET    | /api/customers/                 | Müşteri listesi (paginated) | ✓    |
| POST   | /api/customers/                 | Yeni müşteri                | ✓    |
| GET    | /api/customers/:id/             | Müşteri detay               | ✓    |
| PUT    | /api/customers/:id/             | Müşteri güncelle            | ✓    |
| DELETE | /api/customers/:id/             | Müşteri sil (soft delete)   | ✓    |
| GET    | /api/customers/:id/notes/       | Müşterinin notları          | ✓    |
| POST   | /api/customers/:id/notes/       | Not ekle                    | ✓    |
| GET    | /api/opportunities/             | Fırsat listesi              | ✓    |
| POST   | /api/opportunities/             | Yeni fırsat                 | ✓    |
| PATCH  | /api/opportunities/:id/         | Fırsat güncelle (stage vb.) | ✓    |
| GET    | /api/dashboard/summary/         | Dashboard istatistikleri    | ✓    |

Filtreleme: `?search=ahmet`, `?stage=WON`, `?ordering=-created_at`
Sayfalama: `?page=2` (sayfa başına 10 kayıt)

---

## Mimari Kararlar

| Karar | Neden | Alternatif |
|-------|-------|-----------|
| JWT Auth | Stateless, scalable | Session Auth (server-side state gerektirir) |
| Soft Delete | Veri bütünlüğü, geri alma imkanı | Hard delete (veri kaybolur) |
| Custom Manager | is_active filtresi unutulamaz | View-level filter (hata riski) |
| Debounce (400ms) | Gereksiz API çağrısını önler | Throttle (farklı davranış) |
| Context API | Basit auth state için yeterli | Redux (bu ölçekte gereksiz) |
| Recharts | Native React component'ler | Chart.js (canvas, wrapper gerekir) |
| Vite | Hızlı HMR, modern bundler | CRA (yavaş, deprecated yönelim) |

---

## Testler

```bash
# Backend testleri
cd backend
source venv/bin/activate     # Windows: venv\Scripts\activate
python manage.py test

# Belirli test dosyası
python manage.py test customers.tests.CustomerAPITest

# Coverage raporu
coverage run manage.py test
coverage report --show-missing
coverage html                 # htmlcov/index.html aç

# Frontend testleri
cd frontend
npm run test

# Tek seferlik çalıştırma (CI için)
npm run test -- --run
```

---

## Sık Karşılaşılan Sorunlar

<details>
<summary><strong>mysqlclient kurulumu başarısız oluyor</strong></summary>

**macOS (Apple Silicon):**
```bash
brew install mysql-client pkg-config
export PKG_CONFIG_PATH="/opt/homebrew/opt/mysql-client/lib/pkgconfig"
pip install mysqlclient
```

**macOS (Intel):**
```bash
export PKG_CONFIG_PATH="/usr/local/opt/mysql-client/lib/pkgconfig"
```

**Windows:**
mysqlclient yerine PyMySQL kullan (README'deki Windows notuna bak)

**Linux:**
```bash
sudo apt install libmysqlclient-dev python3-dev build-essential
```

</details>

<details>
<summary><strong>Port zaten kullanılıyor (Address already in use)</strong></summary>

```bash
# macOS / Linux — 8000 portunu kullanan process'i bul ve kapat
lsof -i :8000
kill -9 <PID>

# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

</details>

<details>
<summary><strong>CORS hatası (frontend → backend bağlantısı)</strong></summary>

backend/.env dosyasında `CORS_ALLOWED_ORIGINS` kontrol et:
```
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

</details>

<details>
<summary><strong>Docker'da MySQL bağlantı hatası</strong></summary>

MySQL container'ının healthcheck'i geçmesini bekle:
```bash
docker-compose ps   # db servisinin "healthy" olduğunu kontrol et
docker-compose logs db   # MySQL loglarını kontrol et
```

İlk başlatmada MySQL'in initialize olması 30-60 saniye sürebilir.

</details>

---

## Ekran Görüntüleri

(ekran görüntüleri ekle: Login, Dashboard, Müşteri Listesi, Müşteri Detay, Fırsatlar, Kanban Board)
