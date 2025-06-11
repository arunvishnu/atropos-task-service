#!/usr/bin/env python3
"""
Celery worker entry point.
Run with: celery -A app.worker worker --loglevel=info
"""

from app.celery_app import celery_app

if __name__ == "__main__":
    celery_app.start() 