'use client';

import React from 'react';

interface StatusFilterProps {
  currentStatus: string;
  includeDeleted: boolean;
  onStatusChange: (status: string) => void;
  onIncludeDeletedChange: (include: boolean) => void;
  taskCounts: {
    all: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    deleted: number;
  };
}

export default function StatusFilter({
  currentStatus,
  includeDeleted,
  onStatusChange,
  onIncludeDeletedChange,
  taskCounts
}: StatusFilterProps) {
  const statuses = [
    { value: 'all', label: 'All', count: taskCounts.all },
    { value: 'pending', label: 'Pending', count: taskCounts.pending },
    { value: 'processing', label: 'Processing', count: taskCounts.processing },
    { value: 'completed', label: 'Completed', count: taskCounts.completed },
    { value: 'failed', label: 'Failed', count: taskCounts.failed },
    { value: 'deleted', label: 'Deleted', count: taskCounts.deleted }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'processing': return '#007bff';
      case 'completed': return '#28a745';
      case 'failed': return '#dc3545';
      case 'deleted': return '#6c757d';
      default: return '#6c757d';
    }
  };

  return (
    <div style={{ 
      backgroundColor: '#f8f9fa', 
      padding: '20px', 
      borderRadius: '5px', 
      marginBottom: '20px' 
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Filter Tasks</h3>
      
      {/* Status Filters */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          Status:
        </label>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {statuses.map((status) => (
            <button
              key={status.value}
              onClick={() => onStatusChange(status.value)}
              style={{
                padding: '8px 12px',
                border: '2px solid',
                borderColor: currentStatus === status.value ? getStatusColor(status.value) : '#ddd',
                backgroundColor: currentStatus === status.value ? getStatusColor(status.value) : 'white',
                color: currentStatus === status.value ? 'white' : '#333',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: currentStatus === status.value ? 'bold' : 'normal',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              {status.label}
              <span style={{
                backgroundColor: currentStatus === status.value ? 'rgba(255,255,255,0.3)' : '#f8f9fa',
                padding: '2px 6px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 'bold',
                color: currentStatus === status.value ? 'white' : '#6c757d'
              }}>
                {status.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Include Deleted Checkbox */}
      <div>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={includeDeleted}
            onChange={(e) => onIncludeDeletedChange(e.target.checked)}
            style={{ marginRight: '8px' }}
          />
          <span>Include deleted tasks in results</span>
        </label>
      </div>
    </div>
  );
} 