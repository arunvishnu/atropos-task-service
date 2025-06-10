from typing import Optional, Dict
from app.models import Task

class TaskDatabase:
    def __init__(self):
        self._tasks: Dict[str, Task] = {}
    
    def create_task(self, task: Task) -> Task:
        self._tasks[task.id] = task
        return task
    
    def get_task(self, task_id: str) -> Optional[Task]:
        return self._tasks.get(task_id)
    
    def update_task(self, task: Task) -> Task:
        self._tasks[task.id] = task
        return task
    
    def get_all_tasks(self) -> Dict[str, Task]:
        return self._tasks

# Global database instance
db = TaskDatabase() 