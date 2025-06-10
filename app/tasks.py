import asyncio
import time
import uuid
from datetime import datetime
from app.models import Task, TaskStatus
from app.database import db

async def process_task_async(task: Task):
    """Process a task asynchronously in the background"""
    try:
        # Update task status to processing
        task.status = TaskStatus.PROCESSING
        db.update_task(task)
        
        # Simulate different types of long-running tasks
        if task.task_type == "data_processing":
            result = await simulate_data_processing(task.parameters)
        elif task.task_type == "report_generation":
            result = await simulate_report_generation(task.parameters)
        elif task.task_type == "video_processing":
            result = await simulate_video_processing(task.parameters)
        else:
            # Default task processing
            result = await simulate_default_task(task.parameters)
        
        # Mark task as completed
        task.status = TaskStatus.COMPLETED
        task.result = result
        task.completed_at = datetime.utcnow()
        
    except Exception as e:
        # Mark task as failed
        task.status = TaskStatus.FAILED
        task.error = str(e)
        task.completed_at = datetime.utcnow()
    
    finally:
        db.update_task(task)

async def simulate_data_processing(parameters: dict):
    """Simulate data processing task"""
    processing_time = parameters.get("processing_time", 10)  # Default 10 seconds
    await asyncio.sleep(processing_time)
    
    return {
        "processed_records": parameters.get("record_count", 1000),
        "processing_time": processing_time,
        "output_file": f"processed_data_{uuid.uuid4().hex[:8]}.csv"
    }

async def simulate_report_generation(parameters: dict):
    """Simulate report generation task"""
    report_type = parameters.get("report_type", "monthly")
    processing_time = parameters.get("processing_time", 15)  # Default 15 seconds
    
    await asyncio.sleep(processing_time)
    
    return {
        "report_type": report_type,
        "pages": parameters.get("pages", 25),
        "generation_time": processing_time,
        "report_url": f"https://reports.example.com/{uuid.uuid4().hex[:8]}.pdf"
    }

async def simulate_video_processing(parameters: dict):
    """Simulate video processing task"""
    video_length = parameters.get("video_length", 60)  # seconds
    processing_time = video_length * 0.5  # Simulate processing takes half the video length
    
    await asyncio.sleep(processing_time)
    
    return {
        "original_length": video_length,
        "processed_length": video_length,
        "processing_time": processing_time,
        "output_formats": ["mp4", "webm"],
        "video_url": f"https://videos.example.com/{uuid.uuid4().hex[:8]}.mp4"
    }

async def simulate_default_task(parameters: dict):
    """Default task simulation"""
    processing_time = parameters.get("processing_time", 5)  # Default 5 seconds
    await asyncio.sleep(processing_time)
    
    return {
        "message": "Task completed successfully",
        "processing_time": processing_time,
        "timestamp": datetime.utcnow().isoformat()
    }

def start_background_task(task: Task):
    """Start a background task"""
    asyncio.create_task(process_task_async(task)) 