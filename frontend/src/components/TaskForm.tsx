'use client';

import React, { useState } from 'react';
import { createTask, Task } from '../lib/api';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: (task: Task) => void;
}

export default function TaskForm({ isOpen, onClose, onTaskCreated }: TaskFormProps) {
  const [taskType, setTaskType] = useState('data_processing');
  const [processingTime, setProcessingTime] = useState(5);
  const [customParams, setCustomParams] = useState('{}');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let parameters: Record<string, any> = { processing_time: processingTime };
      
      // Try to parse custom parameters if provided
      if (customParams.trim() && customParams.trim() !== '{}') {
        try {
          const parsed = JSON.parse(customParams);
          parameters = { ...parameters, ...parsed };
        } catch {
          setError('Invalid JSON in custom parameters');
          setLoading(false);
          return;
        }
      }

      const task = await createTask({
        task_type: taskType,
        parameters,
      });

      onTaskCreated(task);
      
      // Reset form and close dialog
      setProcessingTime(5);
      setCustomParams('{}');
      setError('');
      onClose();
    } catch (err) {
      setError('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal Overlay */}
      <div 
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onClick={handleClose}
      />
      
      {/* Modal Content */}
      <div style={{ 
        position: 'fixed', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'white', 
        border: '2px solid #ccc', 
        padding: '30px', 
        borderRadius: '8px',
        zIndex: 1001,
        minWidth: '500px',
        maxWidth: '90vw',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>Create New Task</h2>
          <button 
            onClick={handleClose}
            disabled={loading}
            style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '24px', 
              cursor: loading ? 'not-allowed' : 'pointer',
              color: '#6c757d'
            }}
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Task Type:
            </label>
            <select 
              value={taskType} 
              onChange={(e) => setTaskType(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '8px', 
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            >
              <option value="data_processing">Data Processing</option>
              <option value="report_generation">Report Generation</option>
              <option value="video_processing">Video Processing</option>
              <option value="default">Default Task</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Processing Time (seconds):
            </label>
            <input
              type="number"
              value={processingTime}
              onChange={(e) => setProcessingTime(Number(e.target.value))}
              min="1"
              max="60"
              style={{ 
                width: '100%', 
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Custom Parameters (JSON):
            </label>
            <textarea
              value={customParams}
              onChange={(e) => setCustomParams(e.target.value)}
              placeholder='{"key": "value"}'
              rows={4}
              style={{ 
                width: '100%', 
                padding: '8px', 
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '14px'
              }}
            />
          </div>

          {error && (
            <div style={{ 
              color: '#721c24',
              backgroundColor: '#f8d7da',
              padding: '12px',
              marginBottom: '20px',
              borderRadius: '4px',
              border: '1px solid #f5c6cb'
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button 
              type="button"
              onClick={handleClose}
              disabled={loading}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: loading ? '#ccc' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
} 