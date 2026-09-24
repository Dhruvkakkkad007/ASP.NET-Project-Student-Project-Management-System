import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import { TaskDetailsDrawer } from './TaskDetailsDrawer';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  MessageSquare,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Award,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const KanbanBoard = () => {
  const { tasks, updateTaskStatus, selectedTask, setSelectedTask, currentUser, allocations, searchTerm } = useApp();

  // Filter tasks for current user's allocation
  const myAllocation = allocations.find(a =>
    (a.StudentID === currentUser?.UserID || a.studentId === currentUser?.UserID)
  ) || allocations.find(a => a.StudentID || a.studentId) || allocations[0];

  const myAllocId = myAllocation?.ProjectAllocationID || myAllocation?.projectAllocationId || myAllocation?.AllocationID;

  let myTasks = tasks.filter(t =>
    (t.ProjectAllocationID === myAllocId || t.projectAllocationId === myAllocId || t.AllocationID === myAllocId)
  );

  if (searchTerm) {
    myTasks = myTasks.filter(t =>
      t.TaskTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.TaskDescription.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  const columns = [
    { id: 1, name: 'Pending', icon: Clock, color: '#fbbf24', bg: 'badge-pending' },
    { id: 2, name: 'Ongoing', icon: AlertCircle, color: '#60a5fa', bg: 'badge-ongoing' },
    { id: 3, name: 'Completed', icon: CheckCircle2, color: '#34d399', bg: 'badge-completed' },
    { id: 4, name: 'Cancelled', icon: XCircle, color: '#f87171', bg: 'badge-cancelled' }
  ];

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleStatusMove = (taskID, newStatusID, e) => {
    e.stopPropagation();
    if (newStatusID === 3) {
      triggerCelebration();
    }
    updateTaskStatus(taskID, newStatusID);
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Sparkles size={24} style={{ color: 'var(--accent-primary)' }} />
            <span>Interactive Kanban Task Board</span>
          </h1>
          <p className="page-subtitle">Move tasks across SPM_TaskStatus columns — updates TaskStatusID, ProgressPercentage, TaskCompletedDate.</p>
        </div>
      </div>

      {/* Kanban Grid */}
      <div className="kanban-grid">
        {columns.map(col => {
          const colTasks = myTasks.filter(t => t.TaskStatusID === col.id);
          const ColIcon = col.icon;

          return (
            <div key={col.id} className="kanban-column">
              <div className="kanban-col-header">
                <div className="kanban-col-title" style={{ color: col.color }}>
                  <ColIcon size={18} />
                  <span>{col.name}</span>
                </div>
                <span className="count-pill">{colTasks.length}</span>
              </div>

              <div className="kanban-card-list">
                {colTasks.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                    No tasks in {col.name} status
                  </div>
                ) : (
                  colTasks.map(task => (
                    <div
                      key={task.TaskID}
                      className="glass-panel glass-panel-interactive task-card"
                      onClick={() => setSelectedTask(task)}
                    >
                      {/* Priority Tag & Score */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <Badge statusClass={task.TaskPriorityCssClass} text={task.TaskPriorityName} />
                        {task.EarnedScore > 0 ? (
                          <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <Award size={13} />
                            {task.EarnedScore}/{task.AssignedScore}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            Max: {task.AssignedScore} pts
                          </span>
                        )}
                      </div>

                      {/* Title & Description */}
                      <div className="task-card-title">{task.TaskTitle}</div>
                      <div className="task-card-desc">{task.TaskDescription}</div>

                      {/* Card Footer: Due Date & Remarks Count */}
                      <div className="task-card-footer">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Calendar size={13} />
                          <span>{task.TaskDueDate}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <MessageSquare size={13} />
                          <span>{task.RemarksHistory?.length || 0}</span>
                        </div>
                      </div>

                      {/* Status Transition Action Buttons */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-color)' }}>
                        {col.id > 1 && (
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '2px 8px', fontSize: '0.7rem' }}
                            onClick={(e) => handleStatusMove(task.TaskID, col.id - 1, e)}
                            title="Move to previous status"
                          >
                            <ChevronLeft size={12} />
                            <span>Back</span>
                          </button>
                        )}

                        <div style={{ flex: 1 }} />

                        {col.id < 4 && (
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ padding: '2px 8px', fontSize: '0.7rem' }}
                            onClick={(e) => handleStatusMove(task.TaskID, col.id === 3 ? 4 : col.id + 1, e)}
                            title="Move to next status"
                          >
                            <span>{col.id === 2 ? 'Mark Done' : 'Advance'}</span>
                            <ChevronRight size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Details Drawer */}
      {selectedTask && (
        <TaskDetailsDrawer task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </div>
  );
};
