# Atropos Task Service

A simple API for managing long-running tasks with async processing.

## Features

- **Create Tasks**: Submit long-running tasks for background processing
- **Check Status**: Monitor task progress and current state
- **Retrieve Results**: Get completed task results or error information
- **Swagger Documentation**: Built-in API documentation at `/docs`

## Supported Task Types

- `data_processing`: Simulates data processing operations
- `report_generation`: Simulates report generation
- `video_processing`: Simulates video processing
- `default`: Generic task processing

## Quick Start

### Docker (Full Stack)

1. **Build and Run**

   ```bash
   docker-compose up --build
   ```

2. **Access the Services**
   - **Frontend**: http://localhost:3000
   - **API**: http://localhost:8000
   - **API Docs**: http://localhost:8000/docs

## API Endpoints

### 1. Create Task

```http
POST /tasks
Content-Type: application/json

{
  "task_type": "data_processing",
  "parameters": {
    "processing_time": 10,
    "record_count": 1000
  }
}
```

### 2. Check Task Status

```http
GET /tasks/{task_id}/status
```

### 3. Get Task Result

```http
GET /tasks/{task_id}/result
```

### 4. List All Tasks (Debug)

```http
GET /tasks
```

## Example Usage

1. **Create a task:**

   ```bash
   curl -X POST "http://localhost:8000/tasks" \
        -H "Content-Type: application/json" \
        -d '{
          "task_type": "data_processing",
          "parameters": {"processing_time": 5}
        }'
   ```

2. **Check status:**

   ```bash
   curl "http://localhost:8000/tasks/{task_id}/status"
   ```

3. **Get result:**
   ```bash
   curl "http://localhost:8000/tasks/{task_id}/result"
   ```

## Task States

- `pending`: Task created but not yet started
- `processing`: Task is currently running
- `completed`: Task finished successfully
- `failed`: Task encountered an error

## Development

The service uses postgreSQL for persistent storage.

## Production Considerations

For production deployment, consider:

- Implementing proper task queuing (Celery/RQ)
- Adding authentication and authorization
- Setting up proper logging and monitoring
- Configuring CORS appropriately
- Adding rate limiting
- Health checks and readiness probes
