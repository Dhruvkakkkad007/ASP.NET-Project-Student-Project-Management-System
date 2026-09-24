import React from 'react';
import { useApp } from '../../context/AppContext';
import { MetricCard } from '../common/MetricCard';
import { RadialProgress } from '../common/RadialProgress';
import { Badge } from '../common/Badge';
import {
  CheckCircle2, Clock, ListTodo, Award, ArrowRight, Calendar, UserCheck, Target, TrendingUp
} from 'lucide-react';

export const StudentDashboard = () => {
  const { currentUser, allocations, tasks, projects, setActiveTab, setSelectedTask } = useApp();

  // Find SPM_ProjectAllocation for the current student (StudentID / studentId)
  const myAllocation = allocations.find(a =>
    (a.StudentID === currentUser?.UserID || a.studentId === currentUser?.UserID)
  ) || allocations.find(a => a.StudentID || a.studentId) || allocations[0];

  const myAllocId = myAllocation?.ProjectAllocationID || myAllocation?.projectAllocationId || myAllocation?.AllocationID;

  // Find all SPM_Task entries linked to this student's ProjectAllocationID
  const myTasks = tasks.filter(t =>
    (t.ProjectAllocationID === myAllocId || t.projectAllocationId === myAllocId || t.AllocationID === myAllocId)
  );

  const pendingCount = myTasks.filter(t => t.TaskStatusID === 1).length;
  const ongoingCount = myTasks.filter(t => t.TaskStatusID === 2).length;
  const completedCount = myTasks.filter(t => t.TaskStatusID === 3).length;
  const totalTasks = myTasks.length;

  const earnedScoreTotal = myTasks.reduce((acc, t) => acc + (t.EarnedScore || 0), 0);
  const possibleScoreTotal = myTasks.reduce((acc, t) => acc + (t.AssignedScore || 0), 0);

  // Get the SPM_ProjectMaster data
  const myProject = projects.find(p => p.ProjectID === myAllocation?.ProjectID);

  return (
    <div>
      {/* Top Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Target size={24} style={{ color: 'var(--accent-primary)' }} />
            <span>Student Workspace</span>
            <span className="badge badge-ongoing" style={{ fontSize: '0.8rem' }}>
              Active Assignment
            </span>
          </h1>
          <p className="page-subtitle">
            Track SPM_ProjectAllocation progress, submit SPM_Task deliverables, and view FacultyRemarks.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setActiveTab('kanban')}>
          <ListTodo size={16} />
          <span>Open Task Board</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid">
        <MetricCard
          title="Overall Completion"
          value={`${myAllocation?.ProgressPercentage || 0}%`}
          subtitle={`${completedCount} of ${totalTasks} tasks finished`}
          icon={CheckCircle2}
          color="emerald"
        />
        <MetricCard
          title="Tasks In Progress"
          value={ongoingCount}
          subtitle={`${pendingCount} pending in backlog`}
          icon={Clock}
          color="amber"
        />
        <MetricCard
          title="Cumulative Score"
          value={`${earnedScoreTotal}/${possibleScoreTotal}`}
          subtitle="EarnedScore / AssignedScore"
          icon={Award}
          color="indigo"
        />
        <MetricCard
          title="Semester Grade"
          value={myAllocation?.OverAllGrade || 'Pending'}
          subtitle="SPM_ProjectAllocation.OverAllGrade"
          icon={UserCheck}
          color="purple"
        />
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Project Overview Card */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Assigned Project (SPM_ProjectMaster)
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginTop: '0.25rem', color: '#fff' }}>
                {myAllocation?.ProjectTitle}
              </h2>
            </div>
            <span className="badge badge-completed">
              {myAllocation?.Status}
            </span>
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--text-sub)', marginBottom: '1.25rem', lineHeight: '1.6' }}>
            {myProject?.Description || 'An interactive mobile-first application utilizing augmented reality and indoor positioning to guide students across campus facilities.'}
          </p>

          {/* Allocation Meta Info */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Assigned Mentor</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff', marginTop: '2px' }}>{myAllocation?.FacultyName}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ProjectStartDate</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={13} style={{ color: 'var(--accent-primary)' }} />
                {myAllocation?.ProjectStartDate}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ProjectEndDate</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={13} style={{ color: '#f87171' }} />
                {myAllocation?.ProjectEndDate}
              </div>
            </div>
          </div>

          {/* Tech Stack & View Tasks Link */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {(myProject?.TechStack || 'React, Node.js, TensorFlow, AR.js').split(',').map(tech => (
                <span key={tech} className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-sub)' }}>
                  {tech.trim()}
                </span>
              ))}
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('kanban')}>
              <span>View Tasks</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Radial Progress Widget */}
        <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', textAlign: 'center' }}>
            Milestone Execution Meter
          </h3>
          <RadialProgress
            percentage={myAllocation?.ProgressPercentage || 0}
            size={140}
            strokeWidth={10}
            label="Tasks Completed"
          />
          <div style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            <div style={{ fontWeight: 600, color: 'var(--text-sub)', marginBottom: '0.2rem' }}>
              {completedCount}/{totalTasks} tasks done
            </div>
            ProgressPercentage from SPM_ProjectAllocation
          </div>
        </div>
      </div>

      {/* Task Roadmap Preview */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} style={{ color: 'var(--accent-primary)' }} />
            Current Task Roadmap
            <span style={{ fontSize: '0.72rem', fontWeight: 400, color: 'var(--text-muted)' }}>(SPM_Task)</span>
          </h3>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('kanban')}>
            Kanban Board
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {myTasks.slice(0, 5).map(task => (
            <div
              key={task.TaskID}
              onClick={() => { setSelectedTask(task); setActiveTab('kanban'); }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.85rem 1rem',
                background: 'rgba(15, 23, 42, 0.5)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff', marginBottom: '0.2rem' }}>{task.TaskTitle}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <span>Due: {task.TaskDueDate}</span>
                  {task.NextFollowUpDate && <span>Follow-up: {task.NextFollowUpDate}</span>}
                  {task.FacultyRemarks && (
                    <span style={{ color: 'var(--accent-primary)' }}>Faculty Remark ✓</span>
                  )}
                </div>
              </div>

              {/* Progress Mini Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '0.75rem' }}>
                <div style={{ width: '50px', height: '5px', borderRadius: '3px', background: 'rgba(255,255,255,0.1)' }}>
                  <div style={{ width: `${task.ProgressPercentage || 0}%`, height: '100%', background: 'var(--accent-primary)', borderRadius: '3px' }} />
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{task.ProgressPercentage || 0}%</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Badge statusClass={task.TaskPriorityCssClass} text={task.TaskPriorityName} />
                <Badge statusClass={task.TaskStatusCssClass} text={task.TaskStatusName} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
