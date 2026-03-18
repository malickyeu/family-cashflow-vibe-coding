# Family CashFlow

A Docker-based family finance management application built with **Laravel 11**, **React 18 + TypeScript**, **Inertia.js**, and **Bootstrap 5**.

## Features

- **Cash Flow Dashboard** — Monthly income/expense/balance stats and 6-month chart
- **Transactions** — Log income and expenses with categories, filters, and pagination
- **Recurring Payments** — Auto-generate transactions for monthly/yearly bills
- **Family Todos** — Shared task list with priorities, due dates, and assignments
- **Shopping Lists** — Multiple lists with item check-off and progress tracking
- **Multi-user** — Each family member has their own login

## Tech Stack

| Layer        | Technology |
|-------------|------------|
| Backend      | Laravel 11 / PHP 8.3 |
| Frontend     | React 18 + TypeScript + Inertia.js v2 |
| Styling      | Bootstrap 5 + Bootstrap Icons |
| Database     | PostgreSQL 15 |
| Cache/Queue  | Redis 7 |
| Web server   | Nginx 1.25 |
| Build tool   | Vite 5 |
| Containers   | Docker + Docker Compose |

---

## Quick Start

### Prerequisites
- Docker Desktop installed and running
- Git

### 1. Clone and setup environment

```bash
git clone <repo-url> family-cashflow
cd family-cashflow
cp .env.example .env
```

### 2. Build and start containers

```bash
docker-compose up -d --build
```

This starts 5 containers:
- `cashflow_app` — PHP-FPM (Laravel)
- `cashflow_nginx` — Nginx web server (port 8080)
- `cashflow_postgres` — PostgreSQL 15
- `cashflow_redis` — Redis 7
- `cashflow_queue` — Laravel queue worker + scheduler

### 3. Initialize the application

```bash
# Generate app key
docker exec cashflow_app php artisan key:generate

# Run migrations and seed predefined categories
docker exec cashflow_app php artisan migrate --seed

# Create storage symlink
docker exec cashflow_app php artisan storage:link
```

### 4. Open the app

Visit **http://localhost:8080** and register your account.

---

## Development (with hot reload)

For local development with Vite HMR, run the app without Docker for the frontend:

```bash
# Install dependencies locally
npm install

# Start Vite dev server
npm run dev

# Start Laravel (or use Docker containers)
php artisan serve
```

Or with Docker, rebuild the JS assets:

```bash
docker exec cashflow_app npm run build
```

---

## Recurring Payments

The scheduler runs inside the `cashflow_queue` container daily at 00:05 and:
1. Finds all active recurring payments with `next_due_date <= today`
2. Auto-creates an expense transaction for each
3. Advances the `next_due_date` by the payment's frequency
4. Dispatches reminders for upcoming payments

**Manual trigger:**
```bash
docker exec cashflow_app php artisan payments:process-recurring
```

---

## Environment Variables

| Variable | Default | Description |
|---------|---------|-------------|
| `APP_CURRENCY` | `PLN` | Currency code for display (ISO 4217) |
| `DB_DATABASE` | `cashflow` | PostgreSQL database name |
| `DB_USERNAME` | `cashflow` | PostgreSQL username |
| `DB_PASSWORD` | `secret` | PostgreSQL password |
| `QUEUE_CONNECTION` | `redis` | Queue driver |

---

## Project Structure

```
family-cashflow/
├── app/
│   ├── Console/Commands/ProcessRecurringPayments.php
│   ├── Http/Controllers/          # Dashboard, Transactions, Todos, Shopping...
│   ├── Http/Middleware/HandleInertiaRequests.php
│   ├── Jobs/SendRecurringPaymentReminder.php
│   └── Models/                    # User, Transaction, RecurringPayment, Todo...
├── database/
│   ├── migrations/                # 7 migration files
│   └── seeders/CategorySeeder.php # 15 predefined categories
├── docker/
│   ├── nginx/default.conf
│   └── php/Dockerfile
├── resources/
│   ├── css/app.css
│   ├── js/
│   │   ├── Layouts/               # AppLayout, GuestLayout
│   │   ├── Pages/                 # Dashboard, Transactions, Todos, Shopping, Auth
│   │   └── types/                 # TypeScript model interfaces
│   └── views/app.blade.php
├── routes/
│   ├── web.php
│   ├── auth.php
│   └── console.php
└── docker-compose.yml
```

---

## Useful Commands

```bash
# View logs
docker-compose logs -f

# Access PHP container shell
docker exec -it cashflow_app bash

# Run artisan commands
docker exec cashflow_app php artisan <command>

# Run queue manually
docker exec cashflow_app php artisan queue:work

# Stop all containers
docker-compose down

# Stop and remove volumes (DELETES DATABASE)
docker-compose down -v
```
