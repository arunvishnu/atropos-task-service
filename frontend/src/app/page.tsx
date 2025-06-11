'use client';

import { useState, useEffect, useRef } from 'react';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import StatusFilter from '../components/StatusFilter';
import { Task, getAllTasks } from '../lib/api';
import React from 'react';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-refresh interval in milliseconds (5 seconds)
  const REFRESH_INTERVAL = 5000;

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await getAllTasks(statusFilter, includeDeleted);
      setTasks(response.tasks);
      setLastRefresh(new Date());
    } catch (err) {
      setError('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTasksForCounts = async () => {
    try {
      const response = await getAllTasks('all', true); // Get all tasks including deleted
      setAllTasks(response.tasks);
    } catch (err) {
      console.error('Failed to fetch tasks for counts');
    }
  };

  const handleTaskCreated = (newTask: Task) => {
    setTasks(prev => [newTask, ...prev]);
    // Refresh counts when a new task is created
    fetchAllTasksForCounts();
  };

  const taskCounts = {
    all: allTasks.filter(t => !t.deleted_at).length,
    pending: allTasks.filter(t => t.status === 'pending' && !t.deleted_at).length,
    processing: allTasks.filter(t => t.status === 'processing' && !t.deleted_at).length,
    completed: allTasks.filter(t => t.status === 'completed' && !t.deleted_at).length,
    failed: allTasks.filter(t => t.status === 'failed' && !t.deleted_at).length,
    deleted: allTasks.filter(t => t.deleted_at).length
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
  };

  const handleIncludeDeletedChange = (include: boolean) => {
    setIncludeDeleted(include);
  };

  const handleRefresh = () => {
    fetchTasks();
    fetchAllTasksForCounts();
  };

  const handleTaskFormClose = () => {
    setIsTaskFormOpen(false);
    // Refresh the task list to ensure it's up-to-date
    handleRefresh();
  };

  const toggleAutoRefresh = () => {
    setAutoRefreshEnabled(prev => !prev);
  };

  // Setup auto-refresh
  useEffect(() => {
    if (autoRefreshEnabled && !isTaskFormOpen) {
      intervalRef.current = setInterval(() => {
        handleRefresh();
      }, REFRESH_INTERVAL);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // Cleanup on unmount or dependency change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefreshEnabled, isTaskFormOpen, statusFilter, includeDeleted]);

  useEffect(() => {
    fetchTasks();
    fetchAllTasksForCounts();
  }, [statusFilter, includeDeleted]); // Refetch when filters change

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ textAlign: 'center', margin: 0 }}>
          Atropos Task Service
        </h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={toggleAutoRefresh}
            style={{
              padding: '8px 16px',
              backgroundColor: autoRefreshEnabled ? '#28a745' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {autoRefreshEnabled ? '🔄 Auto-refresh ON' : '⏸️ Auto-refresh OFF'}
          </button>
          <button
            onClick={() => setIsTaskFormOpen(true)}
            style={{
              padding: '12px 24px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            + Create New Task
          </button>
        </div>
      </div>
      
      <TaskForm 
        isOpen={isTaskFormOpen}
        onClose={handleTaskFormClose}
        onTaskCreated={handleTaskCreated} 
      />
      
      <StatusFilter
        currentStatus={statusFilter}
        includeDeleted={includeDeleted}
        onStatusChange={handleStatusChange}
        onIncludeDeletedChange={handleIncludeDeletedChange}
        taskCounts={taskCounts}
      />

      {/* Auto-refresh status indicator */}
      {autoRefreshEnabled && lastRefresh && (
        <div style={{
          fontSize: '12px',
          color: '#6c757d',
          marginBottom: '15px',
          textAlign: 'right'
        }}>
          Last updated: {lastRefresh.toLocaleTimeString()}
          {!isTaskFormOpen && ' • Auto-refreshing every 5s'}
          {isTaskFormOpen && ' • Auto-refresh paused'}
        </div>
      )}
      
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
        <TaskList tasks={tasks} onRefresh={handleRefresh} />
      )}
      
      <div style={{ 
        marginTop: '40px', 
        padding: '20px', 
        backgroundColor: '#e9ecef', 
        borderRadius: '5px',
        fontSize: '14px'
      }}>
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