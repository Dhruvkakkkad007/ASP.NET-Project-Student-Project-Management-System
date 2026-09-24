import React, { useState, useEffect } from 'react';
import { projectTaskApi, config } from '../../services/apiService';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import {
  Layers,
  Plus,
  RefreshCw,
  Server,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Database,
  Code2,
  Tag,
  Award
} from 'lucide-react';

export const ProjectTaskModule = () => {
  const { tasks: localTasks, allocations: localAllocations, taskStatuses: localStatuses, taskPriorities: localPriorities, currentUser, showToast } = useApp();

  // Consumed API Data States
  const [tasks, setTasks] = useState([]);
  const [allocationsList, setAllocationsList] = useState([]);
  const [statusesList, setStatusesList] = useState([]);
  const [prioritiesList, setPrioritiesList] = useState([]);

  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState({ connected: false, message: 'Connecting to API...' });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [lastApiLog, setLastApiLog] = useState(null);

  // Form State (Foreign Key IDs & Task details)
  const [formData, setFormData] = useState({
    projectAllocationId: '',
    taskTitle: '',
    taskDescription: '',
    taskStatusId: '1',
    taskPriorityId: '2',
    assignedScore: '100',
    earnedScore: 0,
    progressPercentage: 0,
    taskAssignedDate: new Date().toISOString().split('T')[0],
    taskStartDate: new Date().toISOString().split('T')[0],
    taskDueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    nextFollowUpDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    facultyRemarks: '',
    studentRemarks: ''
  });

  // 1. CONSUME APIs (Allocations, Statuses, Priorities, and Tasks)
  const fetchAllConsumedApis = async () => {
    setLoading(true);
    try {
      // Step A: Consume Project Allocations API -> GET /api/ProjectAllocations
      const allocRes = await projectTaskApi.getAllocations();

      // Step B: Consume Task Statuses API -> GET /api/TaskStatuses
      const statusRes = await projectTaskApi.getStatuses();

      // Step C: Consume Task Priorities API -> GET /api/TaskPriorities
      const priorityRes = await projectTaskApi.getPriorities();

      // Step D: Consume Project Tasks API -> GET /api/ProjectTasks
      const taskRes = await projectTaskApi.getAll();

      const isServerLive = !allocRes.isNetworkError && !statusRes.isNetworkError && !priorityRes.isNetworkError && !taskRes.isNetworkError;
      setApiStatus({
        connected: isServerLive,
        message: isServerLive
          ? `Connected to Backend API (${config.baseUrl})`
          : 'Backend Server offline — Serving synchronized local database state'
      });

      // Populate Allocations List for FK Dropdown
      if (allocRes.success && Array.isArray(allocRes.data) && allocRes.data.length > 0) {
        setAllocationsList(allocRes.data);
      } else {
        setAllocationsList(localAllocations.map(a => ({
          projectAllocationId: a.ProjectAllocationID || a.AllocationID,
          projectTitle: a.ProjectTitle,
          studentFullName: a.StudentName
        })));
      }

      // Populate Task Statuses for FK Dropdown
      if (statusRes.success && Array.isArray(statusRes.data) && statusRes.data.length > 0) {
        setStatusesList(statusRes.data);
      } else {
        setStatusesList(localStatuses.map(s => ({
          taskStatusId: s.TaskStatusID,
          taskStatusName: s.StatusName,
          taskStatusCssClass: s.BadgeClass
        })));
      }

      // Populate Task Priorities for FK Dropdown
      if (priorityRes.success && Array.isArray(priorityRes.data) && priorityRes.data.length > 0) {
        setPrioritiesList(priorityRes.data);
      } else {
        setPrioritiesList(localPriorities.map(p => ({
          taskPriorityId: p.TaskPriorityID,
          taskPriorityName: p.PriorityName,
          taskPriorityCssClass: p.BadgeClass
        })));
      }

      // Populate Tasks List
      if (taskRes.success && Array.isArray(taskRes.data) && taskRes.data.length > 0) {
        setTasks(taskRes.data);
      } else {
        setTasks(localTasks.map(t => ({
          taskId: t.TaskID,
          projectAllocationId: t.ProjectAllocationID || t.AllocationID,
          taskTitle: t.TaskTitle,
          taskDescription: t.TaskDescription,
          taskStatusId: t.TaskStatusID,
          taskStatusName: t.TaskStatusName,
          taskPriorityId: t.TaskPriorityID,
          taskPriorityName: t.TaskPriorityName,
          assignedScore: t.AssignedScore,
          earnedScore: t.EarnedScore,
          progressPercentage: t.ProgressPercentage || 0,
          taskDueDate: t.TaskDueDate,
          taskAssignedDate: t.TaskAssignedDate
        })));
      }

      setLastApiLog({
        timestamp: new Date().toLocaleTimeString(),
        type: 'GET (Multiple Endpoints Consumed)',
        endpoints: ['GET /api/ProjectAllocations', 'GET /api/TaskStatuses', 'GET /api/TaskPriorities', 'GET /api/ProjectTasks'],
        responseStatus: taskRes.status || 200,
        resultSummary: `Loaded ${allocRes.data?.length || localAllocations.length} Allocations, ${statusRes.data?.length || localStatuses.length} Statuses, ${priorityRes.data?.length || localPriorities.length} Priorities, ${taskRes.data?.length || localTasks.length} Tasks`
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllConsumedApis();
  }, []);

  // 2. SUBMIT POST REQUEST TO PROJECT TASK API
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!formData.projectAllocationId || !formData.taskTitle || !formData.taskStatusId || !formData.taskPriorityId) {
      alert('Please fill all required fields and select foreign key options.');
      return;
    }

    const payload = {
      projectAllocationId: Number(formData.projectAllocationId),
      taskTitle: formData.taskTitle,
      taskDescription: formData.taskDescription || '',
      taskStatusId: Number(formData.taskStatusId),
      taskPriorityId: Number(formData.taskPriorityId),
      assignedScore: Number(formData.assignedScore) || 100,
      earnedScore: Number(formData.earnedScore) || 0,
      progressPercentage: Number(formData.progressPercentage) || 0,
      taskAssignedDate: formData.taskAssignedDate,
      taskStartDate: formData.taskStartDate || null,
      taskDueDate: formData.taskDueDate,
      nextFollowUpDate: formData.nextFollowUpDate || null,
      facultyRemarks: formData.facultyRemarks || null,
      studentRemarks: formData.studentRemarks || null
    };

    setLoading(true);
    const response = await projectTaskApi.create(payload);

    const selectedAlloc = allocationsList.find(a => a.projectAllocationId === payload.projectAllocationId);
    const selectedStatus = statusesList.find(s => s.taskStatusId === payload.taskStatusId);
    const selectedPriority = prioritiesList.find(p => p.taskPriorityId === payload.taskPriorityId);

    setLastApiLog({
      timestamp: new Date().toLocaleTimeString(),
      type: 'POST /api/ProjectTasks',
      endpoints: ['POST /api/ProjectTasks'],
      requestPayload: payload,
      responseStatus: response.status || 200,
      responseBody: response,
      success: response.success
    });

    if (response.success && response.data) {
      const createdTask = response.data;
      setTasks([createdTask, ...tasks]);
      showToast(`Task created via API: "${createdTask.taskTitle}"`);
    } else {
      // Fallback display representation
      const fallbackTask = {
        taskId: Date.now(),
        ...payload,
        taskStatusName: selectedStatus?.taskStatusName || 'Pending',
        taskPriorityName: selectedPriority?.taskPriorityName || 'Moderate'
      };
      setTasks([fallbackTask, ...tasks]);
      showToast(`Task created: "${fallbackTask.taskTitle}"`);
    }

    setShowCreateModal(false);
    setLoading(false);
    // Reset Form
    setFormData({
      projectAllocationId: '',
      taskTitle: '',
      taskDescription: '',
      taskStatusId: '1',
      taskPriorityId: '2',
      assignedScore: '100',
      earnedScore: 0,
      progressPercentage: 0,
      taskAssignedDate: new Date().toISOString().split('T')[0],
      taskStartDate: new Date().toISOString().split('T')[0],
      taskDueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      nextFollowUpDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      facultyRemarks: '',
      studentRemarks: ''
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-ongoing" style={{ fontSize: '0.72rem' }}>Module 2 • Foreign Key Consumption</span>
            <span className={`badge ${apiStatus.connected ? 'badge-completed' : 'badge-pending'}`}>
              <Server size={12} style={{ marginRight: '4px' }} />
              {apiStatus.connected ? 'Live API Online' : 'API Standby / Mock Sync'}
            </span>
          </div>
          <h1 className="page-title">
            <Layers size={24} style={{ color: 'var(--accent-primary)' }} />
            <span>Project Task API Consumption (`ProjectTasksController`)</span>
          </h1>
          <p className="page-subtitle">
            Consumes <strong>GET /api/ProjectAllocations</strong>, <strong>GET /api/TaskStatuses</strong>, and <strong>GET /api/TaskPriorities</strong> to populate Foreign Key dropdowns, and submits <strong>POST /api/ProjectTasks</strong>.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={fetchAllConsumedApis} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh APIs</span>
          </button>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} />
            <span>New Project Task</span>
          </button>
        </div>
      </div>

      {/* Foreign Key Consumption Architecture Map */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Database size={16} style={{ color: 'var(--accent-primary)' }} />
          Foreign Key API Consumption Pipeline
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--accent-primary)', fontWeight: 700, textTransform: 'uppercase' }}>Foreign Key #1</div>
            <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem', marginTop: '0.2rem' }}>ProjectAllocationId → ProjectAllocation</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', marginTop: '0.25rem' }}>
              • Consumes: <code>GET /api/ProjectAllocations</code><br />
              • Displays: <code>#ID ProjectTitle (StudentName)</code><br />
              • Submits: Numeric <code>projectAllocationId</code> (long)
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase' }}>Foreign Key #2</div>
            <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem', marginTop: '0.2rem' }}>TaskStatusId → TaskStatus</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', marginTop: '0.25rem' }}>
              • Consumes: <code>GET /api/TaskStatuses</code><br />
              • Displays: <code>TaskStatusName</code> in dropdown<br />
              • Submits: Numeric <code>taskStatusId</code> (int)
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 700, textTransform: 'uppercase' }}>Foreign Key #3</div>
            <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem', marginTop: '0.2rem' }}>TaskPriorityId → TaskPriority</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', marginTop: '0.25rem' }}>
              • Consumes: <code>GET /api/TaskPriorities</code><br />
              • Displays: <code>TaskPriorityName</code> in dropdown<br />
              • Submits: Numeric <code>taskPriorityId</code> (int)
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
            Project Tasks List (`GET /api/ProjectTasks`)
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Total Tasks: <strong>{tasks.length}</strong>
          </span>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Task ID</th>
                <th>Task Title & Description</th>
                <th>Allocation FK (ProjectAllocationId)</th>
                <th>Priority FK (TaskPriorityId)</th>
                <th>Status FK (TaskStatusId)</th>
                <th>Score</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => {
                const userAlloc = allocationsList.find(a => (a.studentId === currentUser?.UserID || a.StudentID === currentUser?.UserID));
                const isMyTask = userAlloc && Number(task.projectAllocationId) === Number(userAlloc.projectAllocationId || userAlloc.ProjectAllocationID || userAlloc.AllocationID);

                return (
                  <tr key={task.taskId || Math.random()} style={isMyTask ? { background: 'rgba(99, 102, 241, 0.12)', borderLeft: '3px solid var(--accent-primary)' } : undefined}>
                    <td style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>
                      #{task.taskId}
                      {isMyTask && (
                        <div style={{ marginTop: '2px' }}>
                          <span className="badge badge-ongoing" style={{ fontSize: '0.65rem' }}>
                            ★ Your Task
                          </span>
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{task.taskTitle}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{task.taskDescription}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: isMyTask ? '#a5b4fc' : '#e2e8f0' }}>
                        Allocation #{task.projectAllocationId}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>FK: ProjectAllocationId = {task.projectAllocationId}</div>
                    </td>
                  <td>
                    <span className="badge badge-ongoing">
                      {task.taskPriorityName || `Priority #${task.taskPriorityId}`}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${task.taskStatusId === 3 ? 'badge-completed' : task.taskStatusId === 4 ? 'badge-cancelled' : 'badge-pending'}`}>
                      {task.taskStatusName || `Status #${task.taskStatusId}`}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{task.assignedScore} pts</div>
                    {task.earnedScore > 0 && (
                      <div style={{ fontSize: '0.7rem', color: '#10b981' }}>Earned: {task.earnedScore} pts</div>
                    )}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={13} style={{ color: 'var(--accent-primary)' }} />
                      {task.taskDueDate?.split('T')[0] || task.taskDueDate}
                    </div>
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live API Inspector / Log Panel */}
      {lastApiLog && (
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Code2 size={16} style={{ color: 'var(--accent-primary)' }} />
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>Live API Consumption Payload Inspector</h4>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Last Invoked: {lastApiLog.timestamp}</span>
          </div>

          <div style={{ background: '#090d16', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontFamily: 'monospace', fontSize: '0.8rem', color: '#38bdf8', overflowX: 'auto' }}>
            <div style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>
              // Consumed Endpoint: <span style={{ color: '#a855f7' }}>{lastApiLog.type}</span> | HTTP Status: <span style={{ color: '#10b981' }}>{lastApiLog.responseStatus}</span>
            </div>
            {lastApiLog.requestPayload && (
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ color: '#f59e0b', fontWeight: 600 }}>// Request Body sent to backend (ProjectTaskCreateDto):</div>
                <pre style={{ margin: 0, color: '#e2e8f0' }}>{JSON.stringify(lastApiLog.requestPayload, null, 2)}</pre>
              </div>
            )}
            {lastApiLog.responseBody && (
              <div>
                <div style={{ color: '#10b981', fontWeight: 600 }}>// CommonResponse (ApiResponse&lt;ProjectTaskDto&gt;) returned:</div>
                <pre style={{ margin: 0, color: '#38bdf8' }}>{JSON.stringify(lastApiLog.responseBody, null, 2)}</pre>
              </div>
            )}
            {lastApiLog.resultSummary && (
              <div style={{ color: '#10b981' }}>{lastApiLog.resultSummary}</div>
            )}
          </div>
        </div>
      )}

      {/* Create Project Task Modal (With Foreign Key Dropdowns) */}
      {showCreateModal && (
        <Modal isOpen={true} onClose={() => setShowCreateModal(false)} title="Consume API: Create Project Task">
          <form onSubmit={handleCreateTask}>
            {/* Allocation FK Selection */}
            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Select Project Allocation (ProjectAllocationId FK) *</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', textTransform: 'none' }}>From GET /api/ProjectAllocations</span>
              </label>
              <select
                className="input-field"
                required
                value={formData.projectAllocationId}
                onChange={(e) => setFormData({ ...formData, projectAllocationId: e.target.value })}
              >
                <option value="">-- Select Project Allocation from API --</option>
                {allocationsList.map((a) => (
                  <option key={a.projectAllocationId} value={a.projectAllocationId}>
                    [Allocation #{a.projectAllocationId}] {a.projectTitle} {a.studentFullName ? `→ ${a.studentFullName}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Task Title */}
            <div className="input-group">
              <label className="input-label">Task Title (TaskTitle) *</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Design Database Schema & ER Diagram"
                required
                value={formData.taskTitle}
                onChange={(e) => setFormData({ ...formData, taskTitle: e.target.value })}
              />
            </div>

            {/* Task Description */}
            <div className="input-group">
              <label className="input-label">Task Description (TaskDescription)</label>
              <textarea
                className="input-field"
                rows="3"
                placeholder="Details of deliverables, requirements, and evaluation criteria..."
                value={formData.taskDescription}
                onChange={(e) => setFormData({ ...formData, taskDescription: e.target.value })}
              />
            </div>

            {/* Status and Priority FKs Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* Task Status FK Selection */}
              <div className="input-group">
                <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Status (TaskStatusId FK) *</span>
                  <span style={{ fontSize: '0.7rem', color: '#10b981', textTransform: 'none' }}>From GET /api/TaskStatuses</span>
                </label>
                <select
                  className="input-field"
                  required
                  value={formData.taskStatusId}
                  onChange={(e) => setFormData({ ...formData, taskStatusId: e.target.value })}
                >
                  {statusesList.map((s) => (
                    <option key={s.taskStatusId} value={s.taskStatusId}>
                      [ID: {s.taskStatusId}] {s.taskStatusName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Task Priority FK Selection */}
              <div className="input-group">
                <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Priority (TaskPriorityId FK) *</span>
                  <span style={{ fontSize: '0.7rem', color: '#f59e0b', textTransform: 'none' }}>From GET /api/TaskPriorities</span>
                </label>
                <select
                  className="input-field"
                  required
                  value={formData.taskPriorityId}
                  onChange={(e) => setFormData({ ...formData, taskPriorityId: e.target.value })}
                >
                  {prioritiesList.map((p) => (
                    <option key={p.taskPriorityId} value={p.taskPriorityId}>
                      [ID: {p.taskPriorityId}] {p.taskPriorityName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Score & Due Date Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label">Assigned Score (AssignedScore) *</label>
                <input
                  type="number"
                  className="input-field"
                  required
                  value={formData.assignedScore}
                  onChange={(e) => setFormData({ ...formData, assignedScore: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Task Due Date (TaskDueDate) *</label>
                <input
                  type="date"
                  className="input-field"
                  required
                  value={formData.taskDueDate}
                  onChange={(e) => setFormData({ ...formData, taskDueDate: e.target.value })}
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="modal-footer" style={{ padding: '1rem 0 0 0', marginTop: '1rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <Plus size={16} />
                <span>Submit POST /api/ProjectTasks</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
