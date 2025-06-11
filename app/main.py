from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uuid
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

@app.get("/tasks")
async def list_tasks():
    """
    List all tasks (for debugging/monitoring)
    """
    all_tasks = db.get_all_tasks()
    return {
        "total_tasks": len(all_tasks),
        "tasks": [task.to_response() for task in all_tasks]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 