from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import uuid
from typing import Optional
from app.models import TaskCreate, TaskResponse, Task
from app.database import db
from app.tasks import start_background_task
from app.celery_app import celery_app

app = FastAPI(
    title="Atropos Task Service",
    description="API for managing long-running tasks",
    version="1.0.0",
    docs_url=None,  # Disable Swagger UI
    redoc_url="/docs"  # ReDoc at /docs
)

# Add CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Atropos Task Service is running",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """Detailed health check including Celery status"""
    try:
        # Check Celery workers
        stats = celery_app.control.inspect().stats()
        active_workers = len(stats) if stats else 0
        
        # Check database connection
        db_status = "connected"
        try:
            db.get_all_tasks()
        except Exception:
            db_status = "error"
        
        return {
            "status": "healthy",
            "database": db_status,
            "celery_workers": active_workers,
            "message": f"API running with {active_workers} Celery workers"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }

@app.post("/tasks", response_model=TaskResponse)
async def create_task(task_data: TaskCreate):
    """
    Create a new long-running task
    
    Supported task types:
    - data_processing: Simulates data processing with configurable time
    - report_generation: Simulates report generation
    - video_processing: Simulates video processing
    - default: Generic task processing
    
    Parameters can include:
    - processing_time: Time in seconds for the task to complete
    - Any other task-specific parameters
    """
    # Generate unique task ID
    task_id = str(uuid.uuid4())
    
    # Create task
    task = Task(
        id=task_id,
        task_type=task_data.task_type,
        parameters=task_data.parameters
    )
    
    # Store task in database
    db.create_task(task)
    
    # Start background processing with Celery
    start_background_task(task.id)
    
    return task.to_response()

@app.get("/tasks/{task_id}/status", response_model=TaskResponse)
async def get_task_status(task_id: str):
    """
    Check the status of a task
    
    Returns the current status and basic task information
    """
    task = db.get_task(task_id)
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return task.to_response()

@app.get("/tasks/{task_id}/result", response_model=TaskResponse)
async def get_task_result(task_id: str):
    """
    Retrieve the result of a completed task
    
    Returns the full task information including results if completed,
    or error information if failed
    """
    task = db.get_task(task_id)
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return task.to_response()

@app.delete("/tasks/{task_id}")
async def delete_task(task_id: str):
    """
    Soft delete a task
    
    Only completed or failed tasks can be deleted.
    Tasks are soft deleted (marked as deleted, not physically removed).
    """
    # Check if task exists and is not already deleted
    task = db.get_task(task_id, include_deleted=False)
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Check if task can be deleted (only completed or failed tasks)
    if task.status not in ["completed", "failed"]:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot delete task with status '{task.status}'. Only completed or failed tasks can be deleted."
        )
    
    # Perform soft delete
    success = db.soft_delete_task(task_id)
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete task")
    
    return {
        "message": "Task deleted successfully",
        "task_id": task_id
    }

@app.get("/tasks")
async def list_tasks(
    status: Optional[str] = Query(None, description="Filter by status: all, pending, processing, completed, failed, deleted"),
    include_deleted: bool = Query(False, description="Include deleted tasks in results")
):
    """
    List tasks with optional filtering
    
    Query parameters:
    - status: Filter by task status (all, pending, processing, completed, failed, deleted)
    - include_deleted: Include soft-deleted tasks in results (default: false)
    """
    all_tasks = db.get_all_tasks(include_deleted=include_deleted, status_filter=status)
    return {
        "total_tasks": len(all_tasks),
        "filters": {
            "status": status or "all",
            "include_deleted": include_deleted
        },
        "tasks": [task.to_response() for task in all_tasks]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 