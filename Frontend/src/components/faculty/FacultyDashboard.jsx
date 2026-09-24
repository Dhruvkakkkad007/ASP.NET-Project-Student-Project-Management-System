import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MetricCard } from '../common/MetricCard';
import { RadialProgress } from '../common/RadialProgress';
import { Badge } from '../common/Badge';
import { TaskAssignmentModal } from './TaskAssignmentModal';
import { EvaluationModal } from './EvaluationModal';
import {
  Briefcase, Users, CheckCircle2, Award, Plus, Edit3, Calendar, Target
} from 'lucide-react';

export const FacultyDashboard = () => {
  const { allocations, tasks, currentUser, searchTerm, setActiveTab } = useApp();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showEvalModal, setShowEvalModal] = useState(false);
  const [selectedAllocForTask, setSelectedAllocForTask] = useState(null);
  const [selectedTaskForEval, setSelectedTaskForEval] = useState(null);

  // Filter SPM_ProjectAllocation by current faculty (FacultyID)
  let facultyAllocations = allocations.filter(a => a.FacultyID === currentUser?.UserID);

  if (searchTerm) {
    facultyAllocations = facultyAllocations.filter(a =>
      a.ProjectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.StudentName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Get all SPM_Task records linked to this faculty's allocations
  const facultyTasks = tasks.filter(t =>
    facultyAllocations.some(a =>
      a.ProjectAllocationID === t.ProjectAllocationID || a.AllocationID === t.AllocationID
    )
  );
  const completedTasksCount = facultyTasks.filter(t => t.TaskStatusID === 3).length;
  const pendingTasksCount = facultyTasks.filter(t => t.TaskStatusID === 1).length;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Briefcase size={24} style={{ color: 'var(--accent-primary)' }} />
            <span>Faculty Mentorship & Allocation Portal</span>
          </h1>
          <p className="page-subtitle">
            Manage SPM_ProjectAllocation records, assign SPM_Task entries, and record SPM_ProjectAllocation.OverAllGrade.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setActiveTab('tasks-api')}
          >
            <Layers size={16} />
            <span>Project Tasks (FK API)</span>
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              setSelectedAllocForTask(facultyAllocations[0] || allocations[0]);
              setShowTaskModal(true);
            }}
          >
            <Plus size={16} />
            <span>Assign New Task</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid">
        <MetricCard
          title="Project Allocations"
          value={facultyAllocations.length}
          subtitle="SPM_ProjectAllocation records"
          icon={Briefcase}
          color="indigo"
        />
        <MetricCard
          title="Mentees Supervised"
          value={facultyAllocations.length}
          subtitle="Students under guidance"
          icon={Users}
          color="emerald"
        />
        <MetricCard
          title="Tasks Completed"
          value={`${completedTasksCount}/${facultyTasks.length}`}
          subtitle={`${pendingTasksCount} pending in SPM_Task`}
          icon={CheckCircle2}
          color="amber"
        />
        <MetricCard
          title="Grades Issued"
          value={facultyAllocations.filter(a => a.OverAllGrade).length}
          subtitle="OverAllGrade assigned"
          icon={Award}
          color="purple"
        />
      </div>

      {/* Allocation Cards Grid (SPM_ProjectAllocation) */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Target size={20} style={{ color: 'var(--accent-primary)' }} />
          Project Allocations
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>(SPM_ProjectAllocation)</span>
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem' }}>
          {facultyAllocations.map(alloc => {
            const allocTasks = tasks.filter(t =>
              t.ProjectAllocationID === alloc.ProjectAllocationID || t.AllocationID === alloc.AllocationID
            );

            return (
              <div key={alloc.ProjectAllocationID} className="glass-panel glass-panel-interactive" style={{ padding: '1.5rem' }}>
                {/* Allocation Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ flex: 1, paddingRight: '0.5rem' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      ProjectAllocationID #{alloc.ProjectAllocationID}
                    </div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginTop: '0.2rem', lineHeight: '1.3' }}>
                      {alloc.ProjectTitle}
                    </h3>
                  </div>
                  <RadialProgress percentage={alloc.ProgressPercentage} size={70} strokeWidth={6} />
                </div>

                {/* Student Info Box */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', background: 'rgba(15, 23, 42, 0.6)', padding: '0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
                  <img
                    src={alloc.StudentAvatar}
                    alt={alloc.StudentName}
                    style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-full)', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>{alloc.StudentName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{alloc.StudentEmail}</div>
                  </div>
                  {alloc.OverAllGrade ? (
                    <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>OverAllGrade</span>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: '#34d399' }}>{alloc.OverAllGrade}</span>
                    </div>
                  ) : (
                    <span className="badge badge-ongoing">Grade Pending</span>
                  )}
                </div>

                {/* Task Stats & Date Range */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', padding: '0.65rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.8rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', display: 'block' }}>Total Tasks</span>
                    <div style={{ fontWeight: 700, color: '#fff' }}>{alloc.TotalTasksGiven}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', display: 'block' }}>Completed</span>
                    <div style={{ fontWeight: 700, color: '#34d399' }}>{alloc.TotalCompletedTasks}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', display: 'block' }}>Start Date</span>
                    <div style={{ fontWeight: 600, color: 'var(--text-sub)', fontSize: '0.7rem' }}>{alloc.ProjectStartDate}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', display: 'block' }}>End Date</span>
                    <div style={{ fontWeight: 600, color: 'var(--text-sub)', fontSize: '0.7rem' }}>{alloc.ProjectEndDate}</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => { setSelectedAllocForTask(alloc); setShowTaskModal(true); }}
                  >
                    <Plus size={14} />
                    <span>Assign New Task</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Review Table (SPM_Task) */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>
          SPM_Task Records — Evaluation & Score Management
        </h3>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Task Title</th>
                <th>Student</th>
                <th>Priority</th>
                <th>Status</th>
                <th>AssignedScore</th>
                <th>EarnedScore</th>
                <th>Progress%</th>
                <th>DueDate</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {facultyTasks.map(task => {
                const targetAlloc = facultyAllocations.find(a =>
                  a.ProjectAllocationID === task.ProjectAllocationID || a.AllocationID === task.AllocationID
                );

                return (
                  <tr key={task.TaskID}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{task.TaskTitle}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{targetAlloc?.ProjectTitle}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <img src={targetAlloc?.StudentAvatar} alt="" style={{ width: '26px', height: '26px', borderRadius: '50%' }} />
                        <span style={{ fontSize: '0.83rem' }}>{targetAlloc?.StudentName}</span>
                      </div>
                    </td>
                    <td><Badge statusClass={task.TaskPriorityCssClass} text={task.TaskPriorityName} /></td>
                    <td><Badge statusClass={task.TaskStatusCssClass} text={task.TaskStatusName} /></td>
                    <td style={{ fontWeight: 600, color: '#fff' }}>{task.AssignedScore} pts</td>
                    <td>
                      <span style={{ fontWeight: 700, color: task.EarnedScore > 0 ? '#34d399' : 'var(--text-muted)' }}>
                        {task.EarnedScore || 0} pts
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <div style={{ width: '60px', height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                          <div style={{ width: `${task.ProgressPercentage || 0}%`, height: '100%', background: 'var(--accent-primary)', borderRadius: '3px' }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>{task.ProgressPercentage || 0}%</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                        <Calendar size={13} style={{ color: 'var(--accent-primary)' }} />
                        {task.TaskDueDate}
                      </div>
                    </td>
                    <td>
                      <button
                        className={task.EarnedScore > 0 ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm"}
                        onClick={() => { setSelectedTaskForEval(task); setShowEvalModal(true); }}
                      >
                        {task.EarnedScore > 0 ? 'Edit Evaluation' : 'Evaluate'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showTaskModal && (
        <TaskAssignmentModal
          allocation={selectedAllocForTask}
          onClose={() => setShowTaskModal(false)}
        />
      )}

      {showEvalModal && selectedTaskForEval && (
        <EvaluationModal
          task={selectedTaskForEval}
          onClose={() => setShowEvalModal(false)}
        />
      )}
    </div>
  );
};
