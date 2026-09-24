import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { projectAllocationApi, projectTaskApi } from '../../services/apiService';
import { Modal } from '../common/Modal';
import { Plus, Layers, FolderGit2, User, Tag, CheckCircle2 } from 'lucide-react';

export const TaskAssignmentModal = ({ allocation, onClose }) => {
  const { createNewTask, projects: contextProjects, users: contextUsers, allocations: contextAllocations, currentUser } = useApp();

  // Dynamic Lists loaded from APIs
  const [projectsList, setProjectsList] = useState(contextProjects || []);
  const [studentsList, setStudentsList] = useState(
    contextUsers ? contextUsers.filter(u => u.RoleID === 3 || u.userTypeId === 3 || u.userCode?.startsWith('STU')) : []
  );
  const [prioritiesList, setPrioritiesList] = useState([
    { taskPriorityId: 1, taskPriorityName: 'Low' },
    { taskPriorityId: 2, taskPriorityName: 'Moderate' },
    { taskPriorityId: 3, taskPriorityName: 'High' },
    { taskPriorityId: 4, taskPriorityName: 'Critical' }
  ]);
  const [statusesList, setStatusesList] = useState([
    { taskStatusId: 1, taskStatusName: 'Pending' },
    { taskStatusId: 2, taskStatusName: 'Ongoing' },
    { taskStatusId: 3, taskStatusName: 'Completed' }
  ]);

  // Initial selected values
  const defaultProjId = allocation?.ProjectID || allocation?.projectId || (contextProjects?.[0]?.ProjectID || contextProjects?.[0]?.projectId) || 1;
  const defaultStudentId = allocation?.StudentID || allocation?.studentId || (contextUsers?.find(u => u.RoleID === 3)?.UserID) || 4;

  const [formData, setFormData] = useState({
    ProjectID: defaultProjId,
    StudentID: defaultStudentId,
    TaskTitle: '',
    TaskDescription: '',
    TaskStatusID: 1,
    TaskPriorityID: 3, // Default High
    AssignedScore: 100,
    TaskStartDate: new Date().toISOString().split('T')[0],
    TaskDueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    NextFollowUpDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  });

  // Load all lookup data from APIs
  useEffect(() => {
    const loadAllApis = async () => {
      try {
        const [projRes, userRes, prioRes, statusRes] = await Promise.all([
          projectAllocationApi.getProjects(),
          projectAllocationApi.getUsers(),
          projectTaskApi.getPriorities(),
          projectTaskApi.getStatuses()
        ]);

        if (projRes.success && Array.isArray(projRes.data) && projRes.data.length > 0) {
          setProjectsList(projRes.data);
        }
        if (userRes.success && Array.isArray(userRes.data) && userRes.data.length > 0) {
          const students = userRes.data.filter(u => u.userTypeId === 3 || u.userTypeName?.toLowerCase().includes('student') || u.userCode?.startsWith('STU'));
          setStudentsList(students.length > 0 ? students : userRes.data);
        }
        if (prioRes.success && Array.isArray(prioRes.data) && prioRes.data.length > 0) {
          setPrioritiesList(prioRes.data);
        }
        if (statusRes.success && Array.isArray(statusRes.data) && statusRes.data.length > 0) {
          setStatusesList(statusRes.data);
        }
      } catch (err) {
        console.warn('API lookup fetch notice:', err.message);
      }
    };
    loadAllApis();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.TaskTitle || !formData.TaskDueDate) {
      alert('Please enter a Task Title and Due Date.');
      return;
    }

    // Find matching allocation or default to active allocation ID
    const matchedAlloc = contextAllocations.find(a =>
      (a.ProjectID === Number(formData.ProjectID) || a.projectId === Number(formData.ProjectID)) &&
      (a.StudentID === Number(formData.StudentID) || a.studentId === Number(formData.StudentID))
    );

    const allocId = matchedAlloc?.ProjectAllocationID || matchedAlloc?.AllocationID || allocation?.ProjectAllocationID || 1;

    const payload = {
      projectAllocationId: Number(allocId),
      taskTitle: formData.TaskTitle,
      taskDescription: formData.TaskDescription || '',
      taskStatusId: Number(formData.TaskStatusID || 1),
      taskPriorityId: Number(formData.TaskPriorityID || 3),
      assignedScore: Number(formData.AssignedScore) || 100,
      earnedScore: 0,
      progressPercentage: 0,
      taskAssignedDate: formData.TaskStartDate || new Date().toISOString().split('T')[0],
      taskStartDate: formData.TaskStartDate || null,
      taskDueDate: formData.TaskDueDate,
      nextFollowUpDate: formData.NextFollowUpDate || null,
      facultyRemarks: null,
      studentRemarks: null
    };

    // 1. Consume POST /api/ProjectTasks API
    await projectTaskApi.create(payload);

    // 2. Update local state
    createNewTask({
      ...formData,
      AllocationID: allocId,
      ProjectAllocationID: allocId,
      ProjectID: Number(formData.ProjectID)
    });

    onClose();
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Assign New Task (SPM_Task)">
      <form onSubmit={handleSubmit}>
        {/* Project Master Catalog Selection Dropdown */}
        <div className="input-group">
          <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <FolderGit2 size={14} style={{ color: 'var(--accent-primary)' }} />
              Select Published Project (ProjectMaster Catalog) *
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--accent-primary)' }}>From GET /api/ProjectMasters</span>
          </label>
          <select
            className="input-field"
            required
            value={formData.ProjectID}
            onChange={(e) => setFormData(prev => ({ ...prev, ProjectID: Number(e.target.value) }))}
          >
            {projectsList.map((p) => {
              const pId = p.projectId || p.ProjectID;
              const pTitle = p.projectTitle || p.ProjectTitle;
              const pDept = p.department || p.Department;
              return (
                <option key={pId} value={pId}>
                  [Project #{pId}] {pTitle} {pDept ? `(${pDept})` : ''}
                </option>
              );
            })}
          </select>
        </div>

        {/* Student Selection Dropdown */}
        <div className="input-group">
          <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <User size={14} style={{ color: '#10b981' }} />
              Select Assigned Student (SPM_User) *
            </span>
            <span style={{ fontSize: '0.7rem', color: '#10b981' }}>From GET /api/Users</span>
          </label>
          <select
            className="input-field"
            required
            value={formData.StudentID}
            onChange={(e) => setFormData(prev => ({ ...prev, StudentID: Number(e.target.value) }))}
          >
            {studentsList.map((s) => {
              const uId = s.userId || s.UserID;
              const uName = s.fullName || s.FullName;
              const uCode = s.userCode || s.UserCode;
              return (
                <option key={uId} value={uId}>
                  [Student ID: {uId}] {uName} {uCode ? `(${uCode})` : ''}
                </option>
              );
            })}
          </select>
        </div>

        {/* Task Title */}
        <div className="input-group">
          <label className="input-label">Task Title (TaskTitle) *</label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. Implement OAuth2 Login API & JWT Middleware"
            required
            autoFocus
            value={formData.TaskTitle || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, TaskTitle: e.target.value }))}
          />
        </div>

        {/* Task Description */}
        <div className="input-group">
          <label className="input-label">Task Description (TaskDescription)</label>
          <textarea
            className="input-field"
            rows="3"
            placeholder="Specify deliverables, API endpoints to build, and submission criteria..."
            value={formData.TaskDescription || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, TaskDescription: e.target.value }))}
          />
        </div>

        {/* Priority & Status Dropdowns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="input-group">
            <label className="input-label">Priority (TaskPriorityID FK)</label>
            <select
              className="input-field"
              value={formData.TaskPriorityID}
              onChange={(e) => setFormData(prev => ({ ...prev, TaskPriorityID: Number(e.target.value) }))}
            >
              {prioritiesList.map((p) => {
                const prioId = p.taskPriorityId || p.TaskPriorityID;
                const prioName = p.taskPriorityName || p.TaskPriorityName || p.PriorityName;
                return (
                  <option key={prioId} value={prioId}>
                    {prioName}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Status (TaskStatusID FK)</label>
            <select
              className="input-field"
              value={formData.TaskStatusID}
              onChange={(e) => setFormData(prev => ({ ...prev, TaskStatusID: Number(e.target.value) }))}
            >
              {statusesList.map((s) => {
                const stId = s.taskStatusId || s.TaskStatusID;
                const stName = s.taskStatusName || s.TaskStatusName || s.StatusName;
                return (
                  <option key={stId} value={stId}>
                    {stName}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Score */}
        <div className="input-group">
          <label className="input-label">Assigned Score (AssignedScore)</label>
          <input
            type="number"
            className="input-field"
            value={formData.AssignedScore}
            onChange={(e) => setFormData(prev => ({ ...prev, AssignedScore: e.target.value }))}
          />
        </div>

        {/* Dates */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          <div className="input-group">
            <label className="input-label">Start Date</label>
            <input
              type="date"
              className="input-field"
              value={formData.TaskStartDate}
              onChange={(e) => setFormData(prev => ({ ...prev, TaskStartDate: e.target.value }))}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Due Date *</label>
            <input
              type="date"
              className="input-field"
              required
              value={formData.TaskDueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, TaskDueDate: e.target.value }))}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Follow-Up Date</label>
            <input
              type="date"
              className="input-field"
              value={formData.NextFollowUpDate}
              onChange={(e) => setFormData(prev => ({ ...prev, NextFollowUpDate: e.target.value }))}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="modal-footer" style={{ padding: '1rem 0 0 0', marginTop: '1rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            <Plus size={16} />
            <span>Create & Assign Task</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
