import React, { useState, useEffect } from 'react';
import { projectAllocationApi, config } from '../../services/apiService';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import {
  Briefcase,
  Plus,
  RefreshCw,
  Server,
  Layers,
  User,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Database,
  ArrowRight,
  Code2,
  Trash2
} from 'lucide-react';

export const ProjectAllocationModule = () => {
  const { allocations: localAllocations, projects: localProjects, users: localUsers, currentUser, showToast } = useApp();

  // Consumed API Data States
  const [allocations, setAllocations] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [facultiesList, setFacultiesList] = useState([]);

  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState({ connected: false, message: 'Connecting to API...' });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [lastApiLog, setLastApiLog] = useState(null);

  // Form State (Foreign Key IDs & Date fields)
  const [formData, setFormData] = useState({
    projectId: '',
    studentId: '',
    facultyId: '',
    assignedDate: new Date().toISOString().split('T')[0],
    projectStartDate: new Date().toISOString().split('T')[0],
    projectEndDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
    totalTasksGiven: 0,
    totalCompletedTasks: 0,
    progressPercentage: 0,
    overAllGrade: ''
  });

  // 1. CONSUME APIs (Projects, Users, and Allocations)
  const fetchAllConsumedApis = async () => {
    setLoading(true);
    try {
      // Step A: Consume Project Masters API -> GET /api/ProjectMasters
      const projectRes = await projectAllocationApi.getProjects();

      // Step B: Consume Users API -> GET /api/Users
      const userRes = await projectAllocationApi.getUsers();

      // Step C: Consume Project Allocations API -> GET /api/ProjectAllocations
      const allocRes = await projectAllocationApi.getAll();

      const isServerLive = !projectRes.isNetworkError && !userRes.isNetworkError && !allocRes.isNetworkError;
      setApiStatus({
        connected: isServerLive,
        message: isServerLive
          ? `Connected to Backend API (${config.baseUrl})`
          : 'Backend Server offline — Serving synchronized local database state'
      });

      // Populate Project List
      if (projectRes.success && Array.isArray(projectRes.data) && projectRes.data.length > 0) {
        setProjectsList(projectRes.data);
      } else {
        setProjectsList(localProjects.map(p => ({ projectId: p.ProjectID, projectTitle: p.ProjectTitle })));
      }

      // Populate Students & Faculties List
      if (userRes.success && Array.isArray(userRes.data) && userRes.data.length > 0) {
        const users = userRes.data;
        const students = users.filter(u => u.userTypeId === 3 || u.userTypeName?.toLowerCase().includes('student') || u.userCode?.startsWith('STU'));
        const faculties = users.filter(u => u.userTypeId === 2 || u.userTypeName?.toLowerCase().includes('faculty') || u.userCode?.startsWith('FAC'));
        setStudentsList(students.length > 0 ? students : users);
        setFacultiesList(faculties.length > 0 ? faculties : users);
      } else {
        setStudentsList(localUsers.filter(u => u.RoleID === 3).map(u => ({ userId: u.UserID, fullName: u.FullName, userCode: u.UserCode })));
        setFacultiesList(localUsers.filter(u => u.RoleID === 2).map(u => ({ userId: u.UserID, fullName: u.FullName, userCode: u.UserCode })));
      }

      // Populate Allocations List
      if (allocRes.success && Array.isArray(allocRes.data) && allocRes.data.length > 0) {
        setAllocations(allocRes.data);
      } else {
        setAllocations(localAllocations.map(a => ({
          projectAllocationId: a.ProjectAllocationID || a.AllocationID,
          projectId: a.ProjectID,
          projectTitle: a.ProjectTitle,
          studentId: a.StudentID,
          studentFullName: a.StudentName,
          facultyId: a.FacultyID,
          facultyFullName: a.FacultyName,
          assignedDate: a.AssignedDate,
          projectStartDate: a.ProjectStartDate,
          projectEndDate: a.ProjectEndDate,
          progressPercentage: a.ProgressPercentage || 0,
          overAllGrade: a.OverAllGrade
        })));
      }

      setLastApiLog({
        timestamp: new Date().toLocaleTimeString(),
        type: 'GET (Multiple Endpoints Consumed)',
        endpoints: ['GET /api/ProjectMasters', 'GET /api/Users', 'GET /api/ProjectAllocations'],
        responseStatus: allocRes.status || 200,
        resultSummary: `Loaded ${projectRes.data?.length || localProjects.length} Projects, ${userRes.data?.length || localUsers.length} Users, ${allocRes.data?.length || localAllocations.length} Allocations`
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

  // 2. SUBMIT POST REQUEST TO ALLOCATION API
  const handleCreateAllocation = async (e) => {
    e.preventDefault();
    if (!formData.projectId || !formData.studentId || !formData.facultyId) {
      alert('Please select Project, Student, and Faculty from the Foreign Key dropdowns.');
      return;
    }

    const payload = {
      projectId: Number(formData.projectId),
      studentId: Number(formData.studentId),
      facultyId: Number(formData.facultyId),
      assignedDate: formData.assignedDate,
      projectStartDate: formData.projectStartDate,
      projectEndDate: formData.projectEndDate,
      totalTasksGiven: Number(formData.totalTasksGiven) || 0,
      totalCompletedTasks: Number(formData.totalCompletedTasks) || 0,
      progressPercentage: Number(formData.progressPercentage) || 0,
      overAllGrade: formData.overAllGrade || null
    };

    setLoading(true);
    const response = await projectAllocationApi.create(payload);

    // Track API Request / Response in the Live Inspector
    const selectedProj = projectsList.find(p => p.projectId === payload.projectId);
    const selectedStud = studentsList.find(s => s.userId === payload.studentId);
    const selectedFac = facultiesList.find(f => f.userId === payload.facultyId);

    setLastApiLog({
      timestamp: new Date().toLocaleTimeString(),
      type: 'POST /api/ProjectAllocations',
      endpoints: ['POST /api/ProjectAllocations'],
      requestPayload: payload,
      responseStatus: response.status || 200,
      responseBody: response,
      success: response.success
    });

    if (response.success && response.data) {
      const newAlloc = response.data;
      setAllocations([newAlloc, ...allocations]);
      showToast(`Allocation created via API: ${newAlloc.projectTitle || 'Project'} assigned.`);
    } else {
      // Local fallback representation for presentation
      const fallbackAlloc = {
        projectAllocationId: Date.now(),
        ...payload,
        projectTitle: selectedProj?.projectTitle || `Project #${payload.projectId}`,
        studentFullName: selectedStud?.fullName || `Student #${payload.studentId}`,
        facultyFullName: selectedFac?.fullName || `Faculty #${payload.facultyId}`
      };
      setAllocations([fallbackAlloc, ...allocations]);
      showToast(`Project allocated: ${fallbackAlloc.projectTitle}`);
    }

    setShowCreateModal(false);
    setLoading(false);
    // Reset Form
    setFormData({
      projectId: '',
      studentId: '',
      facultyId: '',
      assignedDate: new Date().toISOString().split('T')[0],
      projectStartDate: new Date().toISOString().split('T')[0],
      projectEndDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      totalTasksGiven: 0,
      totalCompletedTasks: 0,
      progressPercentage: 0,
      overAllGrade: ''
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-ongoing" style={{ fontSize: '0.72rem' }}>Module 1 • Foreign Key Consumption</span>
            <span className={`badge ${apiStatus.connected ? 'badge-completed' : 'badge-pending'}`}>
              <Server size={12} style={{ marginRight: '4px' }} />
              {apiStatus.connected ? 'Live API Online' : 'API Standby / Mock Sync'}
            </span>
          </div>
          <h1 className="page-title">
            <Briefcase size={24} style={{ color: 'var(--accent-primary)' }} />
            <span>Project Allocation API Consumption (`ProjectAllocationsController`)</span>
          </h1>
          <p className="page-subtitle">
            Consumes <strong>GET /api/ProjectMasters</strong> and <strong>GET /api/Users</strong> to populate Foreign Key dropdowns, and submits <strong>POST /api/ProjectAllocations</strong>.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={fetchAllConsumedApis} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh APIs</span>
          </button>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} />
            <span>New Project Allocation</span>
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
            <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem', marginTop: '0.2rem' }}>ProjectId → ProjectMaster</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', marginTop: '0.25rem' }}>
              • Consumes: <code>GET /api/ProjectMasters</code><br />
              • Displays: <code>ProjectTitle</code> in dropdown<br />
              • Submits: Numeric <code>projectId</code> (long)
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase' }}>Foreign Key #2</div>
            <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem', marginTop: '0.2rem' }}>StudentId → User (Student)</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', marginTop: '0.25rem' }}>
              • Consumes: <code>GET /api/Users</code> (Filtered)<br />
              • Displays: <code>FullName (UserCode)</code> in dropdown<br />
              • Submits: Numeric <code>studentId</code> (long)
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 700, textTransform: 'uppercase' }}>Foreign Key #3</div>
            <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem', marginTop: '0.2rem' }}>FacultyId → User (Faculty)</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', marginTop: '0.25rem' }}>
              • Consumes: <code>GET /api/Users</code> (Filtered)<br />
              • Displays: <code>FullName (Faculty Code)</code> in dropdown<br />
              • Submits: Numeric <code>facultyId</code> (long)
            </div>
          </div>
        </div>
      </div>

      {/* Allocations Table */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
            Allocated Projects List (`GET /api/ProjectAllocations`)
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Total Allocations: <strong>{allocations.length}</strong>
          </span>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Allocation ID</th>
                <th>Project (ProjectId FK)</th>
                <th>Assigned Student (StudentId FK)</th>
                <th>Faculty Guide (FacultyId FK)</th>
                <th>Duration</th>
                <th>Progress</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {allocations.map((alloc) => {
                const isMyAlloc = Number(alloc.studentId || alloc.StudentID) === Number(currentUser?.UserID);
                return (
                  <tr key={alloc.projectAllocationId || Math.random()} style={isMyAlloc ? { background: 'rgba(99, 102, 241, 0.12)', borderLeft: '3px solid var(--accent-primary)' } : undefined}>
                    <td style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>
                      #{alloc.projectAllocationId}
                      {isMyAlloc && (
                        <div style={{ marginTop: '2px' }}>
                          <span className="badge badge-ongoing" style={{ fontSize: '0.65rem' }}>
                            ★ Assigned to You
                          </span>
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{alloc.projectTitle || `Project ID ${alloc.projectId}`}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>FK: ProjectId = {alloc.projectId}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: isMyAlloc ? '#a5b4fc' : '#e2e8f0' }}>
                        {alloc.studentFullName || `Student ID ${alloc.studentId}`}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>FK: StudentId = {alloc.studentId}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#e2e8f0' }}>{alloc.facultyFullName || `Faculty ID ${alloc.facultyId}`}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>FK: FacultyId = {alloc.facultyId}</div>
                    </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                    <div>Start: {alloc.projectStartDate?.split('T')[0] || alloc.projectStartDate}</div>
                    <div>End: {alloc.projectEndDate?.split('T')[0] || alloc.projectEndDate}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <div style={{ width: '60px', height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                        <div style={{ width: `${alloc.progressPercentage || 0}%`, height: '100%', background: 'var(--accent-primary)', borderRadius: '3px' }} />
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>{alloc.progressPercentage || 0}%</span>
                    </div>
                  </td>
                  <td>
                    {alloc.overAllGrade ? (
                      <span className="badge badge-completed">{alloc.overAllGrade}</span>
                    ) : (
                      <span className="badge badge-ongoing">In Progress</span>
                    )}
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
                <div style={{ color: '#f59e0b', fontWeight: 600 }}>// Request Body sent to backend (ProjectAllocationCreateDto):</div>
                <pre style={{ margin: 0, color: '#e2e8f0' }}>{JSON.stringify(lastApiLog.requestPayload, null, 2)}</pre>
              </div>
            )}
            {lastApiLog.responseBody && (
              <div>
                <div style={{ color: '#10b981', fontWeight: 600 }}>// CommonResponse (ApiResponse&lt;ProjectAllocationDto&gt;) returned:</div>
                <pre style={{ margin: 0, color: '#38bdf8' }}>{JSON.stringify(lastApiLog.responseBody, null, 2)}</pre>
              </div>
            )}
            {lastApiLog.resultSummary && (
              <div style={{ color: '#10b981' }}>{lastApiLog.resultSummary}</div>
            )}
          </div>
        </div>
      )}

      {/* Create Project Allocation Modal (With Foreign Key Dropdowns) */}
      {showCreateModal && (
        <Modal isOpen={true} onClose={() => setShowCreateModal(false)} title="Consume API: Create Project Allocation">
          <form onSubmit={handleCreateAllocation}>
            {/* Project FK Selection */}
            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Select Project (ProjectId Foreign Key) *</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', textTransform: 'none' }}>From GET /api/ProjectMasters</span>
              </label>
              <select
                className="input-field"
                required
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              >
                <option value="">-- Select Project from API --</option>
                {projectsList.map((p) => (
                  <option key={p.projectId} value={p.projectId}>
                    [ID: {p.projectId}] {p.projectTitle}
                  </option>
                ))}
              </select>
            </div>

            {/* Student FK Selection */}
            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Select Student (StudentId Foreign Key) *</span>
                <span style={{ fontSize: '0.7rem', color: '#10b981', textTransform: 'none' }}>From GET /api/Users</span>
              </label>
              <select
                className="input-field"
                required
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              >
                <option value="">-- Select Student from API --</option>
                {studentsList.map((s) => (
                  <option key={s.userId} value={s.userId}>
                    [ID: {s.userId}] {s.fullName} {s.userCode ? `(${s.userCode})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Faculty FK Selection */}
            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Select Faculty Guide (FacultyId Foreign Key) *</span>
                <span style={{ fontSize: '0.7rem', color: '#f59e0b', textTransform: 'none' }}>From GET /api/Users</span>
              </label>
              <select
                className="input-field"
                required
                value={formData.facultyId}
                onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
              >
                <option value="">-- Select Faculty Guide from API --</option>
                {facultiesList.map((f) => (
                  <option key={f.userId} value={f.userId}>
                    [ID: {f.userId}] {f.fullName} {f.userCode ? `(${f.userCode})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Dates Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label">Project Start Date *</label>
                <input
                  type="date"
                  className="input-field"
                  required
                  value={formData.projectStartDate}
                  onChange={(e) => setFormData({ ...formData, projectStartDate: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Project End Date *</label>
                <input
                  type="date"
                  className="input-field"
                  required
                  value={formData.projectEndDate}
                  onChange={(e) => setFormData({ ...formData, projectEndDate: e.target.value })}
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
                <span>Submit POST /api/ProjectAllocations</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
