def test_health_check(client):
    """Test that the API is running"""
    response = client.get("/")
    assert response.status_code == 200
    assert "Atropos Task Service is running" in response.json()["message"]

def test_create_task(client):
    """Test creating a new task"""
    task_data = {
        "task_type": "data_processing",
        "parameters": {"processing_time": 5}
    }
    response = client.post("/tasks", json=task_data)
    assert response.status_code == 200
    data = response.json()
    assert data["task_type"] == "data_processing"
    assert data["status"] == "pending"

def test_list_tasks(client):
    """Test listing tasks"""
    response = client.get("/tasks")
    assert response.status_code == 200
    data = response.json()
    assert "tasks" in data
    assert "total_tasks" in data 