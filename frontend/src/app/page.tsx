'use client';

import { useState, useEffect } from 'react';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import { Task, getAllTasks } from '../lib/api';
import React from 'react';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await getAllTasks();
      setTasks(response.tasks);
    } catch (err) {
      setError('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCreated = (newTask: Task) => {
    setTasks(prev => [newTask, ...prev]);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
        Atropos Task Service
      </h1>
      
      <TaskForm onTaskCreated={handleTaskCreated} />
      
      {error && (
        <div style={{ 
          color: 'red', 
          backgroundColor: '#f8d7da', 
          padding: '10px', 
          marginBottom: '20px',
          borderRadius: '5px'
        }}>
          {error}
        </div>
      )}
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          Loading tasks...
        </div>
      ) : (
        <TaskList tasks={tasks} onRefresh={fetchTasks} />
      )}
      
      <div style={{ 
        marginTop: '40px', 
        padding: '20px', 
        backgroundColor: '#e9ecef', 
        borderRadius: '5px',
        fontSize: '14px'
      }}>
        <h3>How to use:</h3>
        <ol>
          <li>Create a new task using the form above</li>
          <li>Use "Check Status" to see current task progress</li>
          <li>Use "Get Result" to view completed task results</li>
          <li>Click "Refresh" to update the task list</li>
        </ol>
        <p>
          <strong>API Documentation:</strong>{' '}
          <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer">
            http://localhost:8000/docs
          </a>
        </p>
      </div>
    </div>
  );
} 