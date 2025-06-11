import os
from celery import Celery

# Get configuration from environment variables
CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")

# Create Celery instance
celery_app = Celery(
    "atropos_tasks",
    broker=CELERY_BROKER_URL,
    backend=CELERY_RESULT_BACKEND,
    include=["app.tasks"]  # Auto-discover tasks in app.tasks module
)

# Celery configuration
celery_app.conf.update(
    # Task settings
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    
    # Worker settings
    worker_prefetch_multiplier=1,  # One task at a time per worker
    task_acks_late=True,  # Acknowledge task after completion
    worker_max_tasks_per_child=1000,  # Restart worker after 1000 tasks
    
    # Task result settings
    result_expires=3600,  # Results expire after 1 hour
    task_ignore_result=False,  # Store task results
    
    # Retry settings
    task_default_retry_delay=60,  # 60 seconds retry delay
    task_max_retries=3,  # Maximum 3 retries
    
    # Monitoring
    worker_send_task_events=True,
    task_send_sent_event=True,
)

# Optional: Configure logging
celery_app.conf.update(
    worker_log_format="[%(asctime)s: %(levelname)s/%(processName)s] %(message)s",
    worker_task_log_format="[%(asctime)s: %(levelname)s/%(processName)s][%(task_name)s(%(task_id)s)] %(message)s",
) 