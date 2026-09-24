import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import { Clock, Calendar, Award, MessageSquare, CheckCircle2, User } from 'lucide-react';

export const TaskTimeline = () => {
  const { tasks, currentUser, allocations, updateTaskStatus } = useApp();

  const myAllocation = allocations.find(a =>
    (a.StudentID === currentUser?.UserID || a.studentId === currentUser?.UserID)
  ) || allocations.find(a => a.StudentID || a.studentId) || allocations[0];

  const myAllocId = myAllocation?.ProjectAllocationID || myAllocation?.projectAllocationId || myAllocation?.AllocationID;

  const myTasks = tasks.filter(t =>
    (t.ProjectAllocationID === myAllocId || t.projectAllocationId === myAllocId || t.AllocationID === myAllocId)
  );

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Clock size={24} style={{ color: 'var(--accent-primary)' }} />
            <span>Task Lifecycle Timeline</span>
          </h1>
          <p className="page-subtitle">
            All tasks from <strong style={{ color: '#fff' }}>SPM_Task</strong> table for your project allocation.
          </p>
        </div>
      </div>

      {/* Allocation Info Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '2rem',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={15} style={{ color: 'var(--accent-primary)' }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Faculty:</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>{myAllocation?.FacultyName}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={15} style={{ color: '#34d399' }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Project Start:</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>{myAllocation?.ProjectStartDate}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={15} style={{ color: '#f87171' }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Project End:</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>{myAllocation?.ProjectEndDate}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Award size={15} style={{ color: '#fbbf24' }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Grade:</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: myAllocation?.OverAllGrade ? '#34d399' : 'var(--text-muted)' }}>
            {myAllocation?.OverAllGrade || 'Pending'}
          </span>
        </div>
      </div>

      {/* Tasks List — One card per SPM_Task row */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {myTasks.map((task, index) => (
          <div
            key={task.TaskID}
            className="glass-panel"
            style={{ padding: '1.25rem 1.5rem' }}
          >
            {/* Task Top Row: Number, Title, Status, Priority */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#fff',
                  flexShrink: 0
                }}
              >
                {index + 1}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '0.2rem' }}>
                  {task.TaskTitle}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                  {task.TaskDescription}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
                <Badge statusClass={task.TaskPriorityCssClass} text={task.TaskPriorityName} />
                <Badge statusClass={task.TaskStatusCssClass} text={task.TaskStatusName} />
              </div>
            </div>

            {/* Date Fields Row — directly from SPM_Task columns */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '0.75rem',
                padding: '0.85rem',
                background: 'rgba(15, 23, 42, 0.5)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '0.85rem'
              }}
            >
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>TaskAssignedDate</div>
                <div style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--text-sub)' }}>
                  {task.TaskAssignedDate || '—'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>TaskStartDate</div>
                <div style={{ fontSize: '0.83rem', fontWeight: 600, color: task.TaskStartDate ? '#60a5fa' : 'var(--text-muted)' }}>
                  {task.TaskStartDate || 'Not Started'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>TaskDueDate</div>
                <div style={{ fontSize: '0.83rem', fontWeight: 600, color: '#fbbf24' }}>
                  {task.TaskDueDate || '—'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>TaskCompletedDate</div>
                <div style={{ fontSize: '0.83rem', fontWeight: 600, color: task.TaskCompletedDate ? '#34d399' : 'var(--text-muted)' }}>
                  {task.TaskCompletedDate || 'Pending'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>NextFollowUpDate</div>
                <div style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--text-sub)' }}>
                  {task.NextFollowUpDate || '—'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>AssignedScore</div>
                <div style={{ fontSize: '0.83rem', fontWeight: 600, color: '#fff' }}>{task.AssignedScore} pts</div>
              </div>

              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>EarnedScore</div>
                <div style={{ fontSize: '0.83rem', fontWeight: 700, color: task.EarnedScore > 0 ? '#34d399' : 'var(--text-muted)' }}>
                  {task.EarnedScore > 0 ? `${task.EarnedScore} pts` : '—'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>ProgressPercentage</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <div style={{ flex: 1, height: '5px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${task.ProgressPercentage || 0}%`, height: '100%', background: 'var(--accent-primary)', borderRadius: '3px' }} />
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-sub)', whiteSpace: 'nowrap' }}>
                    {task.ProgressPercentage || 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* FacultyRemarks & StudentRemarks */}
            {(task.FacultyRemarks || task.StudentRemarks) && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                {task.FacultyRemarks && (
                  <div
                    style={{
                      padding: '0.65rem 0.85rem',
                      background: 'rgba(99, 102, 241, 0.08)',
                      border: '1px solid rgba(99, 102, 241, 0.2)',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#818cf8', marginBottom: '0.25rem' }}>
                      FacultyRemarks
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)', lineHeight: '1.4' }}>
                      {task.FacultyRemarks}
                    </div>
                  </div>
                )}

                {task.StudentRemarks && (
                  <div
                    style={{
                      padding: '0.65rem 0.85rem',
                      background: 'rgba(245, 158, 11, 0.08)',
                      border: '1px solid rgba(245, 158, 11, 0.2)',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#fbbf24', marginBottom: '0.25rem' }}>
                      StudentRemarks
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)', lineHeight: '1.4' }}>
                      {task.StudentRemarks}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick Action: Mark Complete */}
            {task.TaskStatusID !== 3 && task.TaskStatusID !== 4 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => updateTaskStatus(task.TaskID, task.TaskStatusID === 1 ? 2 : 3)}
                >
                  <CheckCircle2 size={14} />
                  <span>{task.TaskStatusID === 1 ? 'Start Task' : 'Mark Complete'}</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
