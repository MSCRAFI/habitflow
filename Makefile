.PHONY: help install dev test lint format migrate clean docker-build docker-up docker-down

# Backend commands
help:
	@echo "HabitFlow Backend Development Commands"
	@echo "======================================="
	@echo "make install          - Install dependencies with Poetry"
	@echo "make dev              - Run development server"
	@echo "make test             - Run tests with pytest"
	@echo "make lint             - Lint code with pylint and flake8"
	@echo "make format           - Format code with black and isort"
	@echo "make migrate          - Run Django migrations"
	@echo "make makemigrations   - Create new migrations"
	@echo "make clean            - Clean up cache and build files"
	@echo "make shell            - Open Django shell"
	@echo "make docker-build     - Build Docker images"
	@echo "make docker-up        - Start Docker containers"
	@echo "make docker-down      - Stop Docker containers"
	@echo "make docker-logs      - View Docker logs"

# Installation and dependencies
install:
	pip install poetry
	poetry install

install-dev:
	pip install poetry
	poetry install

# Development
dev:
	python manage.py runserver

# Database
migrate:
	python manage.py migrate

makemigrations:
	python manage.py makemigrations

# Testing
test:
	pytest

test-coverage:
	pytest --cov=. --cov-report=html --cov-report=term-missing

# Code Quality
lint:
	flake8 --max-line-length=100 --exclude=migrations,venv
	pylint --disable=all --enable=E,F $(find . -name '*.py' -not -path './migrations/*' -not -path './venv/*')

format:
	black --line-length=100 .
	isort --profile=black --line-length=100 .

# Cleanup
clean:
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name '*.pyc' -delete
	find . -type d -name '.pytest_cache' -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name '.coverage' -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name 'htmlcov' -exec rm -rf {} + 2>/dev/null || true

# Django shell
shell:
	python manage.py shell

# Docker commands
docker-build:
	docker-compose build

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f

docker-logs-api:
	docker-compose logs -f api

docker-restart:
	docker-compose restart

# Database in Docker
docker-migrate:
	docker-compose exec api python manage.py migrate

docker-makemigrations:
	docker-compose exec api python manage.py makemigrations

# Fresh setup
setup-docker:
	docker-compose up -d
	docker-compose exec api python manage.py migrate
	docker-compose exec api python manage.py createsuperuser

setup-local:
	poetry install
	python manage.py migrate
	python manage.py createsuperuser

# Run all checks
check: lint test

# Development with auto-reload
dev-watch:
	poetry run watchmedo shell-command \
		--patterns="*.py" \
		--recursive \
		--command='python manage.py runserver' \
		.

# Create superuser
superuser:
	python manage.py createsuperuser

# Static files
collectstatic:
	python manage.py collectstatic --noinput
