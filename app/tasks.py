import time
import uuid
from datetime import datetime
from app.celery_app import celery_app
from app.models import TaskStatus
from app.database import db

@celery_app.task(bind=True)
def process_task(self, task_id: str):
    """
    Main Celery task that processes different types of tasks
    
    Args:
        task_id: The ID of the task to process
    """
    try:
        # Get task from database
        task = db.get_task(task_id)
        if not task:
            self.retry(countdown=60, max_retries=3)
            return
        
        # Update task status to processing
        task.status = TaskStatus.PROCESSING
        db.update_task(task)
        
        # Process based on task type
        if task.task_type == "data_processing":
            result = simulate_data_processing(task.parameters)
        elif task.task_type == "report_generation":
            result = simulate_report_generation(task.parameters)
        elif task.task_type == "video_processing":
            result = simulate_video_processing(task.parameters)
        else:
            # Default task processing
            result = simulate_default_task(task.parameters)
        
        # Mark task as completed
        task.status = TaskStatus.COMPLETED
        task.result = result
        task.completed_at = datetime.utcnow()
        db.update_task(task)
        
        return result
        
    except Exception as exc:
        # Mark task as failed
        task = db.get_task(task_id)
        if task:
            task.status = TaskStatus.FAILED
            task.error = str(exc)
            task.completed_at = datetime.utcnow()
            db.update_task(task)
        
        # Retry the task if retries are available
        if self.request.retries < self.max_retries:
            self.retry(countdown=60, exc=exc)
        else:
            raise exc

def simulate_data_processing(parameters: dict):
    """Simulate data processing task"""
    processing_time = parameters.get("processing_time", 10)  # Default 10 seconds
    time.sleep(processing_time)
    
    return {
        "processed_records": parameters.get("record_count", 1000),
        "processing_time": processing_time,
        "output_file": f"processed_data_{uuid.uuid4().hex[:8]}.csv"
    }

def simulate_report_generation(parameters: dict):
    """Simulate report generation task"""
    report_type = parameters.get("report_type", "monthly")
    processing_time = parameters.get("processing_time", 15)  # Default 15 seconds
    
    time.sleep(processing_time)
    
    return {
        "report_type": report_type,
        "pages": parameters.get("pages", 25),
        "generation_time": processing_time,
        "report_url": f"https://reports.example.com/{uuid.uuid4().hex[:8]}.pdf"
    }

def simulate_video_processing(parameters: dict):
    """Simulate video processing task"""
    video_length = parameters.get("video_length", 60)  # seconds
    processing_time = video_length * 0.5  # Simulate processing takes half the video length
    
    time.sleep(processing_time)
    
    return {
        "original_length": video_length,
        "processed_length": video_length,
        "processing_time": processing_time,
        "output_formats": ["mp4", "webm"],
        "video_url": f"https://videos.example.com/{uuid.uuid4().hex[:8]}.mp4"
    }

def simulate_default_task(parameters: dict):
    """Default task simulation"""
    processing_time = parameters.get("processing_time", 5)  # Default 5 seconds
    time.sleep(processing_time)
    
    return {
        "message": "Task completed successfully",
        "processing_time": processing_time,
        "timestamp": datetime.utcnow().isoformat()
    }

def start_background_task(task_id: str):
    """Start a background task using Celery"""
    return process_task.delay(task_id) 