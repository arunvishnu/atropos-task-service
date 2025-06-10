'use client';

import React, { useState } from 'react';
import { createTask, Task } from '../lib/api';

interface TaskFormProps {
  onTaskCreated: (task: Task) => void;
}

export default function TaskForm({ onTaskCreated }: TaskFormProps) {
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
      
      // Reset form
      setProcessingTime(5);
      setCustomParams('{}');
    } catch (err) {
      setError('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', marginBottom: '20px' }}>
      <h2>Create New Task</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>
            Task Type:
            <select 
              value={taskType} 
              onChange={(e) => setTaskType(e.target.value)}
              style={{ marginLeft: '10px', padding: '5px' }}
            >
              <option value="data_processing">Data Processing</option>
              <option value="report_generation">Report Generation</option>
              <option value="video_processing">Video Processing</option>
              <option value="default">Default Task</option>
            </select>
          </label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>
            Processing Time (seconds):
            <input
              type="number"
              value={processingTime}
              onChange={(e) => setProcessingTime(Number(e.target.value))}
              min="1"
              max="60"
              style={{ marginLeft: '10px', padding: '5px' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>
            Custom Parameters (JSON):
            <br />
            <textarea
              value={customParams}
              onChange={(e) => setCustomParams(e.target.value)}
              placeholder='{"key": "value"}'
              rows={3}
              style={{ width: '100%', padding: '5px', marginTop: '5px' }}
            />
          </label>
        </div>

        {error && (
          <div style={{ color: 'red', marginBottom: '15px' }}>
            {error}
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Creating...' : 'Create Task'}
        </button>
      </form>
    </div>
  );
} 