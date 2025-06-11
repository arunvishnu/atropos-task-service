import os
from sqlalchemy import create_engine, Column, String, DateTime, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.sql import func
from typing import Optional, List
from datetime import datetime
from app.models import Task as TaskModel, TaskStatus

# Database URL from environment variable
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://atropos:atropos_dev@localhost:5432/atropos_tasks")

# SQLAlchemy setup
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database model
class TaskDB(Base):
    __tablename__ = "tasks"

    id = Column(String, primary_key=True, index=True)
    task_type = Column(String, nullable=False)
    status = Column(String, nullable=False, default="pending")
    parameters = Column(JSON, nullable=False, default={})
    result = Column(JSON, nullable=True)
    error = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    def to_task_model(self) -> TaskModel:
        """Convert database model to application model"""
        task = TaskModel(
            id=self.id,
            task_type=self.task_type,
            parameters=self.parameters or {}
        )
        task.status = TaskStatus(self.status)
        task.result = self.result
        task.error = self.error
        task.created_at = self.created_at
        task.completed_at = self.completed_at
        task.deleted_at = self.deleted_at
        return task

def create_tables():
    """Create database tables"""
    Base.metadata.create_all(bind=engine)

def get_db() -> Session:
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class TaskDatabase:
    def __init__(self):
        create_tables()
    
    def create_task(self, task: TaskModel) -> TaskModel:
        """Create a new task in database"""
        db = SessionLocal()
        try:
            db_task = TaskDB(
                id=task.id,
                task_type=task.task_type,
                status=task.status.value,
                parameters=task.parameters,
                result=task.result,
                error=task.error,
                created_at=task.created_at,
                completed_at=task.completed_at,
                deleted_at=task.deleted_at
            )
            db.add(db_task)
            db.commit()
            db.refresh(db_task)
            return db_task.to_task_model()
        finally:
            db.close()
    
    def get_task(self, task_id: str, include_deleted: bool = False) -> Optional[TaskModel]:
        """Get task by ID"""
        db = SessionLocal()
        try:
            query = db.query(TaskDB).filter(TaskDB.id == task_id)
            if not include_deleted:
                query = query.filter(TaskDB.deleted_at.is_(None))
            
            db_task = query.first()
            if db_task:
                return db_task.to_task_model()
            return None
        finally:
            db.close()
    
    def update_task(self, task: TaskModel) -> TaskModel:
        """Update existing task"""
        db = SessionLocal()
        try:
            db_task = db.query(TaskDB).filter(TaskDB.id == task.id).first()
            if db_task:
                db_task.status = task.status.value
                db_task.result = task.result
                db_task.error = task.error
                db_task.completed_at = task.completed_at
                db_task.deleted_at = task.deleted_at
                db.commit()
                db.refresh(db_task)
                return db_task.to_task_model()
            return task
        finally:
            db.close()
    
    def soft_delete_task(self, task_id: str) -> bool:
        """Soft delete a task by setting deleted_at timestamp"""
        db = SessionLocal()
        try:
            db_task = db.query(TaskDB).filter(TaskDB.id == task_id).filter(TaskDB.deleted_at.is_(None)).first()
            if db_task:
                # Only allow deletion of completed or failed tasks
                if db_task.status in ["completed", "failed"]:
                    db_task.deleted_at = datetime.utcnow()
                    db.commit()
                    return True
                else:
                    return False  # Cannot delete pending/processing tasks
            return False  # Task not found or already deleted
        finally:
            db.close()
    
    def get_all_tasks(self, include_deleted: bool = False, status_filter: Optional[str] = None) -> List[TaskModel]:
        """Get all tasks with optional filtering"""
        db = SessionLocal()
        try:
            query = db.query(TaskDB)
            
            # Filter deleted tasks
            if not include_deleted:
                query = query.filter(TaskDB.deleted_at.is_(None))
            
            # Filter by status
            if status_filter and status_filter != "all":
                if status_filter == "deleted":
                    query = query.filter(TaskDB.deleted_at.is_not(None))
                else:
                    query = query.filter(TaskDB.status == status_filter)
                    if not include_deleted:
                        query = query.filter(TaskDB.deleted_at.is_(None))
            
            db_tasks = query.order_by(TaskDB.created_at.desc()).all()
            return [db_task.to_task_model() for db_task in db_tasks]
        finally:
            db.close()

# Global database instance
db = TaskDatabase() 