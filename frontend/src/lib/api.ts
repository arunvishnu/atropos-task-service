const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Task {
  id: string;
  task_type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  parameters: Record<string, any>;
  result?: any;
  error?: string;
  created_at: string;
  completed_at?: string;
  deleted_at?: string;
}

export interface CreateTaskRequest {
  task_type: string;
  parameters: Record<string, any>;
}

export interface TaskListResponse {
  total_tasks: number;
  filters: {
    status: string;
    include_deleted: boolean;
  };
  tasks: Task[];
}

export async function createTask(data: CreateTaskRequest): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create task');
  }

  return response.json();
}

export async function getTaskStatus(taskId: string): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/status`);

  if (!response.ok) {
    throw new Error('Failed to get task status');
  }

  return response.json();
}

export async function getTaskResult(taskId: string): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/result`);

  if (!response.ok) {
    throw new Error('Failed to get task result');
  }

  return response.json();
}

export async function deleteTask(taskId: string): Promise<{ message: string; task_id: string }> {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to delete task');
  }

  return response.json();
}

export async function getAllTasks(
  status?: string,
  includeDeleted?: boolean
): Promise<TaskListResponse> {
  const params = new URLSearchParams();
  
  if (status && status !== 'all') {
    params.append('status', status);
  }
  
  if (includeDeleted) {
    params.append('include_deleted', 'true');
  }

  const url = `${API_BASE_URL}/tasks${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to get tasks');
  }

  return response.json();
} 