from pydantic import BaseModel
from typing import Optional, Any
from enum import Enum
from datetime import datetime

class TaskStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class TaskCreate(BaseModel):
    task_type: str
    parameters: dict = {}

class TaskResponse(BaseModel):
    id: str
    task_type: str
    status: TaskStatus
    parameters: dict
    result: Optional[Any] = None
    error: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None

class Task:
    def __init__(self, id: str, task_type: str, parameters: dict):
        self.id = id
        self.task_type = task_type
        self.status = TaskStatus.PENDING
        self.parameters = parameters
        self.result = None
        self.error = None
        self.created_at = datetime.utcnow()
        self.completed_at = None
        self.deleted_at = None

    def to_response(self) -> TaskResponse:
        return TaskResponse(
            id=self.id,
            task_type=self.task_type,
            status=self.status,
            parameters=self.parameters,
            result=self.result,
            error=self.error,
            created_at=self.created_at,
            completed_at=self.completed_at,
            deleted_at=self.deleted_at
        ) 