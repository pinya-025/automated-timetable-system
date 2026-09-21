# Installation & Production Deployment Guide

## Architecture Components
1. **PHP Laravel 11 / 10 Backend** (Port 8000)
2. **Python FastAPI + Google OR-Tools CP-SAT Microservice** (Port 8001)
3. **MySQL 8.0 Database** (Port 3306)
4. **Nginx Reverse Proxy & Frontend Dashboard** (Port 80/443)

---

## 1. Quick Start with Docker Compose
Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    restart: always
    environment:
      MYSQL_DATABASE: academic_timetable
      MYSQL_ROOT_PASSWORD: secret_root_pass
      MYSQL_USER: timetable_user
      MYSQL_PASSWORD: timetable_pass
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"

  scheduling-engine:
    build: ./scheduling-engine
    restart: always
    ports:
      - "8001:8001"
    environment:
      - WORKERS=4

  laravel-app:
    build: ./laravel-backend
    restart: always
    depends_on:
      - mysql
      - scheduling-engine
    ports:
      - "8000:8000"
    environment:
      DB_HOST: mysql
      DB_DATABASE: academic_timetable
      DB_USERNAME: timetable_user
      DB_PASSWORD: timetable_pass
      SCHEDULING_ENGINE_URL: http://scheduling-engine:8001

volumes:
  mysql_data:
```

---

## 2. Python Scheduling Engine Setup
```bash
cd scheduling-engine
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn api:app --host 0.0.0.0 --port 8001 --workers 4
```

---

## 3. Laravel Backend Setup
```bash
cd laravel-backend
composer install --optimize-autoloader --no-dev
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve --port=8000
```
