# Atropos Task Service

A robust API for managing long-running tasks with distributed processing using Celery, Redis, and PostgreSQL.

## Features

- **Create Tasks**: Submit long-running tasks for background processing
- **Check Status**: Monitor task progress and current state
- **Retrieve Results**: Get completed task results or error information
- **Distributed Processing**: Celery workers handle tasks in the background
- **Persistent Storage**: PostgreSQL for task metadata, Redis for task queue
- **Auto-retry**: Failed tasks are automatically retried up to 3 times
- **API Documentation**: Built-in API documentation at `/docs`

## Architecture

![Atropos Architecture](atropos-architecture.png)

## Supported Task Types

- `data_processing`: Simulates data processing operations
- `report_generation`: Simulates report generation
- `video_processing`: Simulates video processing
- `default`: Generic task processing

## Configuration

This project uses environment variables for configuration. Create a `.env` file in the root directory:

1. **Copy the example file:**

   ```bash
   cp .env.example .env
   ```

2. **Update the values as needed for your environment:**

   ```env
   # Database Configuration
   DATABASE_URL=postgresql://atropos:atropos_dev@postgres:5432/atropos_tasks
   
   # Redis Configuration  
   REDIS_URL=redis://redis:6379/0
   
   # Celery Configuration
   CELERY_BROKER_URL=redis://redis:6379/0
   CELERY_RESULT_BACKEND=redis://redis:6379/0
   
   # Application Configuration
   DEBUG=true
   
   # Frontend Configuration
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

## Quick Start

### Docker (Full Stack) - Recommended

1. **Setup Environment**

   ```bash
   cp .env.example .env
   # Edit .env with your preferred values (defaults work for development)
   ```

2. **Build and Run**

   ```bash
   docker-compose up --build
   ```

3. **Access the Services**
   - **Frontend**: http://localhost:3000
   - **API**: http://localhost:8000
   - **API Docs**: http://localhost:8000/docs
   - **Health Check**: http://localhost:8000/health

### Local Development

1. **Setup Environment**

   ```bash
   cp .env.example .env
   # Edit .env and update URLs to use localhost instead of service names
   # Example: DATABASE_URL=postgresql://atropos:atropos_dev@localhost:5432/atropos_tasks
   ```

2. **Install Dependencies**

   ```bash
   pip install -r requirements.txt
   ```

3. **Start Services**

   ```bash
   # Start PostgreSQL and Redis (via Docker)
   docker-compose up postgres redis -d

   # Start API
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

   # Start Celery Worker (in another terminal)
   celery -A app.worker worker --loglevel=info
   ```

4. **Access the API**
   - API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Frontend Only

1. **Setup Environment**

   ```bash
   cp .env.example .env
   # Ensure NEXT_PUBLIC_API_URL points to your API server
   ```

2. **Install Dependencies**

   ```bash
   cd frontend
   npm install
   ```

3. **Run Development Server**

   ```bash
   npm run dev
   ```

4. **Access Frontend**
   - http://localhost:3000

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

### 5. Health Check

```http
GET /health
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

4. **Check system health:**
   ```bash
   curl "http://localhost:8000/health"
   ```

## Task States

- `pending`: Task created but not yet started
- `processing`: Task is currently running
- `completed`: Task finished successfully
- `failed`: Task encountered an error

## Services

- **PostgreSQL**: Persistent task storage and metadata
- **Redis**: Message broker for task queue and result backend
- **FastAPI**: REST API server
- **Celery Workers**: Background task processors (2 workers by default)
- **Next.js Frontend**: Simple web interface

## Monitoring

- **Health endpoint**: `/health` shows system status and active workers
- **Celery monitoring**: Built-in task monitoring and statistics
- **Database**: All tasks are logged with timestamps and results

## Scaling

To scale the system:

1. **Add more workers**:

   ```bash
   docker-compose up --scale worker=4
   ```

2. **Increase worker concurrency**:
   ```yaml
   command: celery -A app.worker worker --loglevel=info --concurrency=4
   ```

## Production Considerations

- **Security**: Add authentication and authorization
- **Environment variables**: Use proper secrets management
- **Monitoring**: Add Prometheus/Grafana for metrics
- **Load balancing**: Add nginx for API load balancing
- **Database**: Use managed PostgreSQL service
- **Redis**: Use managed Redis service with clustering
- **Logging**: Centralized logging with ELK stack
- **Backups**: Regular database backups
