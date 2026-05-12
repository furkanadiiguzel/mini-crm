# Mini CRM

A monorepo CRM application with Django REST Framework backend and React frontend.

## Stack

- **Backend**: Django 5.x, DRF, JWT auth, MySQL
- **Frontend**: Vite + React 18, Tailwind CSS, Recharts

## Quick Start

```bash
# Start all services
docker-compose up -d

# Backend setup
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # fill in values
python manage.py migrate
python manage.py seed_data
python manage.py runserver

# Frontend setup
cd frontend
npm install
cp .env.example .env
npm run dev
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/token/` | Obtain JWT token |
| POST | `/api/token/refresh/` | Refresh JWT token |
| GET/POST | `/api/customers/` | List / Create customers |
| GET/PUT/PATCH/DELETE | `/api/customers/{id}/` | Retrieve / Update / Delete |
| GET | `/api/customers/stats/` | Dashboard statistics |
