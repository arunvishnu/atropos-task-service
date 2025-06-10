'use client';

import { useState, useEffect } from 'react';
import { Task, getTaskStatus, getTaskResult } from '../lib/api';
import React from 'react';

interface TaskListProps {
  tasks: Task[];
  onRefresh: () => void;
}

export default function TaskList({ tasks, onRefresh }: TaskListProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckStatus = async (taskId: string) => {
    setLoading(true);
    setError('');
    
    try {
      const task = await getTaskStatus(taskId);
      setSelectedTask(task);
    } catch (err) {
      setError('Failed to get task status');
    } finally {
      setLoading(false);
    }
  };

  const handleGetResult = async (taskId: string) => {
    setLoading(true);
    setError('');
    
    try {
      const task = await getTaskResult(taskId);
      setSelectedTask(task);
    } catch (err) {
      setError('Failed to get task result');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'processing': return '#007bff';
      case 'completed': return '#28a745';
      case 'failed': return '#dc3545';
      default: return '#6c757d';
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Tasks ({tasks.length})</h2>
        <button 
          onClick={onRefresh}
          style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          Refresh
        </button>
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: '15px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gap: '15px' }}>
        {tasks.map((task) => (
          <div key={task.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
            <div style={{ marginBottom: '10px' }}>
              <strong>ID:</strong> {task.id}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Type:</strong> {task.task_type}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Status:</strong>{' '}
              <span style={{ 
                color: getStatusColor(task.status), 
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}>
                {task.status}
              </span>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>Created:</strong> {new Date(task.created_at).toLocaleString()}
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => handleCheckStatus(task.id)}
                disabled={loading}
                style={{ 
                  padding: '5px 10px', 
                  backgroundColor: '#007bff', 
                  color: 'white', 
                  border: 'none', 
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                Check Status
              </button>
              <button
                onClick={() => handleGetResult(task.id)}
                disabled={loading}
                style={{ 
                  padding: '5px 10px', 
                  backgroundColor: '#28a745', 
                  color: 'white', 
                  border: 'none', 
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                Get Result
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedTask && (
        <div style={{ 
          position: 'fixed', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white', 
          border: '2px solid #ccc', 
          padding: '20px', 
          maxWidth: '500px', 
          maxHeight: '80vh', 
          overflow: 'auto',
          zIndex: 1000
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3>Task Details</h3>
            <button 
              onClick={() => setSelectedTask(null)}
              style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}
            >
              ×
            </button>
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <strong>ID:</strong> {selectedTask.id}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Type:</strong> {selectedTask.task_type}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Status:</strong>{' '}
            <span style={{ color: getStatusColor(selectedTask.status), fontWeight: 'bold' }}>
              {selectedTask.status}
            </span>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Created:</strong> {new Date(selectedTask.created_at).toLocaleString()}
          </div>
          {selectedTask.completed_at && (
            <div style={{ marginBottom: '10px' }}>
              <strong>Completed:</strong> {new Date(selectedTask.completed_at).toLocaleString()}
            </div>
          )}
          
          <div style={{ marginBottom: '10px' }}>
            <strong>Parameters:</strong>
            <pre style={{ backgroundColor: '#f8f9fa', padding: '10px', marginTop: '5px', fontSize: '12px' }}>
              {JSON.stringify(selectedTask.parameters, null, 2)}
            </pre>
          </div>
          
          {selectedTask.result && (
            <div style={{ marginBottom: '10px' }}>
              <strong>Result:</strong>
              <pre style={{ backgroundColor: '#d4edda', padding: '10px', marginTop: '5px', fontSize: '12px' }}>
                {JSON.stringify(selectedTask.result, null, 2)}
              </pre>
            </div>
          )}
          
          {selectedTask.error && (
            <div style={{ marginBottom: '10px' }}>
              <strong>Error:</strong>
              <pre style={{ backgroundColor: '#f8d7da', padding: '10px', marginTop: '5px', fontSize: '12px', color: '#721c24' }}>
                {selectedTask.error}
              </pre>
            </div>
          )}
        </div>
      )}

      {selectedTask && (
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            zIndex: 999 
          }}
          onClick={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
} 