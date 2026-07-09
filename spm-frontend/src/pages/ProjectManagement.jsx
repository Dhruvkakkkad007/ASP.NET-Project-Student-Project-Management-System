import React, { useState, useContext } from 'react';
import { DatabaseContext } from '../context/DatabaseContext';
import { AuthContext } from '../context/AuthContext';
import GlassCard from '../components/common/GlassCard';
import CustomButton from '../components/common/CustomButton';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  ArrowLeft, 
  Save, 
  Users, 
  Calendar, 
  FileText,
  Briefcase
} from 'lucide-react';

const ProjectManagement = () => {
  const { 
    projects, 
    users, 
    statuses, 
    tasks,
    addProject, 
    updateProject, 
    deleteProject 
  } = useContext(DatabaseContext);
  
  const { currentUser, isAdmin, isFaculty } = useContext(AuthContext);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'add' | 'edit' | 'detail'
  const [selectedProject, setSelectedProject] = useState(null);

  // Form Fields
  const [projectTitle, setProjectTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [projectStatus, setProjectStatus] = useState('1'); // Not Started
  const [supervisingFacultyId, setSupervisingFacultyId] = useState('');
  const [assignedStudentIds, setAssignedStudentIds] = useState([]);
  const [error, setError] = useState('');

  // Extract student and faculty pools
  const studentPool = users.filter(u => u.RoleId === 3);
  const facultyPool = users.filter(u => u.RoleId === 2);

  // Filter project list based on user role and query
  const visibleProjects = projects.filter(p => {
    // Role-based visibility
    if (isFaculty) {
      if (p.FacultyId !== currentUser.UserId) return false;
    } else if (currentUser.RoleName === 'Student') {
      if (!p.StudentIds.includes(currentUser.UserId)) return false;
    }

    // Search query
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      p.ProjectTitle.toLowerCase().includes(query) ||
      (p.Description && p.Description.toLowerCase().includes(query));

    // Status filter
    let matchesStatus = true;
    if (statusFilter !== 'All') {
      matchesStatus = p.ProjectStatus === Number(statusFilter);
    }

    return matchesSearch && matchesStatus;
  });

  const handleAddNewClick = () => {
    setProjectTitle('');
    setDescription('');
    setStartDate(new Date().toISOString().split('T')[0]);
    
    // Set 6 months out as default end date
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 6);
    setEndDate(futureDate.toISOString().split('T')[0]);
    
    setProjectStatus('1'); // Not Started
    setSupervisingFacultyId(isFaculty ? currentUser.UserId.toString() : (facultyPool[0]?.UserId?.toString() || ''));
    setAssignedStudentIds([]);
    setError('');
    setViewMode('add');
  };

  const handleEditClick = (project) => {
    setSelectedProject(project);
    setProjectTitle(project.ProjectTitle);
    setDescription(project.Description || '');
    setStartDate(project.StartDate);
    setEndDate(project.EndDate);
    setProjectStatus(project.ProjectStatus.toString());
    setSupervisingFacultyId(project.FacultyId.toString());
    setAssignedStudentIds(project.StudentIds.map(String));
    setError('');
    setViewMode('edit');
  };

  const handleDetailClick = (project) => {
    setSelectedProject(project);
    setViewMode('detail');
  };

  const handleDeleteClick = (projectId) => {
    if (window.confirm('Are you sure you want to delete this project? Tasks will remain archived.')) {
      deleteProject(projectId);
    }
  };

  const handleStudentSelectToggle = (e) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    setAssignedStudentIds(selected);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!projectTitle.trim() || !startDate || !endDate || !supervisingFacultyId || assignedStudentIds.length === 0) {
      setError('Please fill in all fields and assign at least one student.');
      return;
    }

    const payload = {
      ProjectTitle: projectTitle.trim(),
      Description: description.trim(),
      StartDate: startDate,
      EndDate: endDate,
      ProjectStatus: Number(projectStatus),
      FacultyId: Number(supervisingFacultyId),
      StudentIds: assignedStudentIds.map(Number)
    };

    if (viewMode === 'add') {
      addProject(payload);
    } else {
      updateProject(selectedProject.ProjectId, payload);
    }

    setViewMode('list');
  };

  // Helper to count tasks for student in project
  const getStudentTaskCount = (projId, studId) => {
    const list = tasks.filter(t => t.ProjectId === projId && t.StudentId === studId && !t.IsDeleted);
    return list.length;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">
            Project Allocation & Portfolios
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            {currentUser.RoleName === 'Student' 
              ? 'Browse the details of your assigned academic project.' 
              : 'Allocate academic project titles, assign supervising faculty, and form student teams.'}
          </p>
        </div>
      </div>

      {viewMode === 'list' ? (
        <GlassCard>
          {/* Table Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex flex-col md:flex-row items-stretch gap-3 flex-1 max-w-2xl">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </span>
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-100 dark:bg-white/5 border border-transparent focus:bg-white focus:border-indigo-500/50 dark:focus:bg-[#12131a] dark:focus:border-indigo-500/50 rounded-xl focus:outline-none focus:ring-0 smooth-transition"
                />
              </div>
              <div className="relative w-full md:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-slate-100 dark:bg-white/5 border border-transparent focus:bg-white focus:border-indigo-500/50 dark:focus:bg-[#12131a] dark:focus:border-indigo-500/50 rounded-xl focus:outline-none smooth-transition cursor-pointer appearance-none"
                >
                  <option value="All">All Statuses</option>
                  {statuses.slice(0, 3).map(s => (
                    <option key={s.StatusID} value={s.StatusID}>{s.StatusName}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Only Admin and Faculty can add projects */}
            {(isAdmin || isFaculty) && (
              <CustomButton
                variant="primary"
                onClick={handleAddNewClick}
                icon={Plus}
                size="sm"
              >
                Add Project
              </CustomButton>
            )}
          </div>

          {/* Projects Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/50 dark:border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-2 w-12">#</th>
                  <th className="pb-3 w-72">Project Title</th>
                  <th className="pb-3">Supervisor</th>
                  <th className="pb-3">Assigned Students</th>
                  <th className="pb-3">Progress</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right pr-4 w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/30 dark:divide-white/5">
                {visibleProjects.map((p, index) => {
                  const statusObj = statuses.find(s => s.StatusID === p.ProjectStatus);
                  const supervisor = users.find(u => u.UserId === p.FacultyId);
                  const assignedStudents = users.filter(u => p.StudentIds.includes(u.UserId));

                  return (
                    <tr key={p.ProjectId} className="hover:bg-slate-100/30 dark:hover:bg-white/5 transition-colors">
                      <td className="py-4 pl-2 text-xs font-semibold text-slate-400">{index + 1}</td>
                      <td className="py-4">
                        <button
                          onClick={() => handleDetailClick(p)}
                          className="font-semibold text-sm text-slate-800 dark:text-slate-200 hover:text-indigo-500 dark:hover:text-indigo-400 text-left smooth-transition"
                        >
                          {p.ProjectTitle}
                        </button>
                        <p className="text-[10px] text-slate-400 mt-1 truncate max-w-xs">{p.Description || 'No description.'}</p>
                      </td>
                      <td className="py-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {supervisor ? supervisor.FullName : 'Not Supervised'}
                      </td>
                      <td className="py-4">
                        <div className="relative flex items-center">
                          {assignedStudents.map((s, idx) => (
                            <img
                              key={s.UserId}
                              src={s.ProfilePicturePath}
                              title={`${s.FullName} (${getStudentTaskCount(p.ProjectId, s.UserId)} Tasks)`}
                              className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-800 object-cover bg-slate-100 shadow-sm"
                              style={{ marginLeft: idx > 0 ? '-6px' : '0' }}
                            />
                          ))}
                          <span className="text-[10px] text-slate-400 font-bold ml-2">
                            ({assignedStudents.length} Students)
                          </span>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                            <div className="h-full bg-gradient-premium rounded-full" style={{ width: `${p.ProgressPercentage}%` }} />
                          </div>
                          <span className="text-xs font-bold text-indigo-500">{p.ProgressPercentage}%</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusObj?.StatusCssClass}`}>
                          {statusObj?.StatusName}
                        </span>
                      </td>
                      <td className="py-4 text-right pr-4">
                        <div className="flex justify-end items-center gap-1.5">
                          <button
                            onClick={() => handleDetailClick(p)}
                            className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg smooth-transition font-semibold"
                          >
                            Details
                          </button>
                          {(isAdmin || (isFaculty && p.FacultyId === currentUser.UserId)) && (
                            <>
                              <button
                                onClick={() => handleEditClick(p)}
                                className="p-1.5 text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg smooth-transition"
                                title="Edit Project Parameters"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(p.ProjectId)}
                                className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-lg smooth-transition"
                                title="Delete Project"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {visibleProjects.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-sm">
                      No projects allocated yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      ) : viewMode === 'detail' ? (
        /* PROJECT DETAIL VIEW SCREEN */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          <div className="lg:col-span-2 space-y-6">
            <GlassCard>
              <div className="flex items-center gap-2 mb-6">
                <button
                  onClick={() => setViewMode('list')}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-slate-400 uppercase">Project Dossier</span>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">
                {selectedProject.ProjectTitle}
              </h2>
              
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-4 leading-relaxed whitespace-pre-wrap">
                {selectedProject.Description || 'No detailed description provided for this academic project.'}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-slate-200/50 dark:border-white/5">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Start Date</span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{selectedProject.StartDate}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">End Deadline</span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{selectedProject.EndDate}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Allocated On</span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{new Date(selectedProject.AssignedDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* List Tasks for this project */}
            <GlassCard>
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-200 mb-6 font-heading uppercase tracking-wider">
                Project Milestone Tasks
              </h3>
              <div className="space-y-4">
                {tasks.filter(t => t.ProjectId === selectedProject.ProjectId && !t.IsDeleted).map(t => {
                  const student = users.find(u => u.UserId === t.StudentId);
                  const statusObj = statuses.find(s => s.StatusID === t.TaskStatus);
                  return (
                    <div key={t.TaskId} className="p-4 rounded-2xl bg-slate-100/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 flex items-center justify-between">
                      <div>
                        <h5 className="font-semibold text-sm text-slate-800 dark:text-slate-200">{t.TaskTitle}</h5>
                        <p className="text-xs text-slate-500 mt-1">Assignee: {student ? student.FullName : 'Unassigned'}</p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusObj?.StatusCssClass}`}>
                        {statusObj?.StatusName}
                      </span>
                    </div>
                  );
                })}
                {tasks.filter(t => t.ProjectId === selectedProject.ProjectId && !t.IsDeleted).length === 0 && (
                  <p className="text-center py-8 text-slate-400 text-xs">No tasks mapped to this project yet.</p>
                )}
              </div>
            </GlassCard>
          </div>

          {/* Supervisor and team side columns */}
          <div className="space-y-6">
            <GlassCard>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Supervising Faculty</span>
              {(() => {
                const f = users.find(u => u.UserId === selectedProject.FacultyId);
                if (!f) return <p className="text-xs text-slate-500 mt-2">Unassigned</p>;
                return (
                  <div className="flex items-center gap-3.5 mt-3">
                    <img src={f.ProfilePicturePath} className="w-11 h-11 rounded-xl object-cover bg-slate-100" />
                    <div>
                      <h5 className="font-semibold text-sm text-slate-800 dark:text-slate-200">{f.FullName}</h5>
                      <p className="text-[10px] text-slate-500 mt-0.5">{f.Email}</p>
                    </div>
                  </div>
                );
              })()}
            </GlassCard>

            <GlassCard>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-4">Assigned Students Team</span>
              <div className="space-y-4">
                {users.filter(u => selectedProject.StudentIds.includes(u.UserId)).map(s => {
                  const completed = tasks.filter(t => t.ProjectId === selectedProject.ProjectId && t.StudentId === s.UserId && t.TaskStatus === 3 && !t.IsDeleted).length;
                  const total = tasks.filter(t => t.ProjectId === selectedProject.ProjectId && t.StudentId === s.UserId && !t.IsDeleted).length;
                  return (
                    <div key={s.UserId} className="flex items-center justify-between border-b border-slate-200/30 dark:border-white/5 pb-3 last:border-b-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <img src={s.ProfilePicturePath} className="w-8.5 h-8.5 rounded-lg object-cover bg-slate-100" />
                        <div>
                          <h5 className="font-semibold text-xs text-slate-800 dark:text-slate-200">{s.FullName}</h5>
                          <p className="text-[9px] text-slate-400 mt-0.5">{s.Email}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded">
                        {completed}/{total} Tasks Done
                      </span>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </div>
        </div>
      ) : (
        /* ADD / EDIT PROJECT FORM SCREEN */
        <GlassCard className="max-w-4xl">
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={() => setViewMode('list')}
              className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-200 font-heading">
              {viewMode === 'add' ? 'Create New Project Record' : 'Modify Project Scoping'}
            </h3>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Title */}
              <div className="space-y-2 col-span-1 md:col-span-2">
                <label htmlFor="title" className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase pl-1">
                  Project Title
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  placeholder="e.g. E-Commerce Platform"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-white/5 border border-transparent focus:bg-white focus:border-indigo-500/50 dark:focus:bg-[#12131a] dark:focus:border-indigo-500/50 rounded-xl text-sm focus:outline-none placeholder-slate-400 dark:placeholder-slate-500 smooth-transition"
                />
              </div>

              {/* Description */}
              <div className="space-y-2 col-span-1 md:col-span-2">
                <label htmlFor="desc" className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase pl-1">
                  Description / Objectives
                </label>
                <textarea
                  id="desc"
                  rows="4"
                  placeholder="Outline the scopes, milestones, and expected outputs of this project..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-white/5 border border-transparent focus:bg-white focus:border-indigo-500/50 dark:focus:bg-[#12131a] dark:focus:border-indigo-500/50 rounded-xl text-sm focus:outline-none placeholder-slate-400 dark:placeholder-slate-500 smooth-transition resize-none"
                />
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <label htmlFor="start" className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase pl-1">
                  Start Date
                </label>
                <input
                  id="start"
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-white/5 border border-transparent focus:bg-white focus:border-indigo-500/50 dark:focus:bg-[#12131a] dark:focus:border-indigo-500/50 rounded-xl text-sm focus:outline-none smooth-transition"
                />
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <label htmlFor="end" className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase pl-1">
                  End Date
                </label>
                <input
                  id="end"
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-white/5 border border-transparent focus:bg-white focus:border-indigo-500/50 dark:focus:bg-[#12131a] dark:focus:border-indigo-500/50 rounded-xl text-sm focus:outline-none smooth-transition"
                />
              </div>

              {/* Project Status */}
              <div className="space-y-2">
                <label htmlFor="status" className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase pl-1">
                  Project Status
                </label>
                <select
                  id="status"
                  value={projectStatus}
                  onChange={(e) => setProjectStatus(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-white/5 border border-transparent focus:bg-white focus:border-indigo-500/50 dark:focus:bg-[#12131a] dark:focus:border-indigo-500/50 rounded-xl text-sm focus:outline-none smooth-transition cursor-pointer appearance-none"
                >
                  {statuses.slice(0, 3).map(s => (
                    <option key={s.StatusID} value={s.StatusID}>{s.StatusName}</option>
                  ))}
                </select>
              </div>

              {/* Supervising Faculty */}
              <div className="space-y-2">
                <label htmlFor="faculty" className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase pl-1">
                  Supervising Faculty Advisor
                </label>
                {isFaculty ? (
                  <div className="px-4 py-3.5 bg-indigo-500/5 border border-indigo-500/10 text-indigo-500 font-semibold rounded-xl text-sm">
                    {currentUser.FullName}
                  </div>
                ) : (
                  <select
                    id="faculty"
                    value={supervisingFacultyId}
                    onChange={(e) => setSupervisingFacultyId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-white/5 border border-transparent focus:bg-white focus:border-indigo-500/50 dark:focus:bg-[#12131a] dark:focus:border-indigo-500/50 rounded-xl text-sm focus:outline-none smooth-transition cursor-pointer appearance-none"
                  >
                    <option value="" disabled>-- Select Supervisor --</option>
                    {facultyPool.map(f => (
                      <option key={f.UserId} value={f.UserId}>{f.FullName}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Assigned Students Multi-Select */}
              <div className="space-y-2 col-span-1 md:col-span-2">
                <div className="flex justify-between items-center pl-1">
                  <label htmlFor="students" className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
                    Assigned Students (Hold Ctrl/Cmd to select multiple)
                  </label>
                  <span className="text-[10px] text-slate-500 font-bold">{assignedStudentIds.length} Selected</span>
                </div>
                <select
                  id="students"
                  multiple
                  value={assignedStudentIds}
                  onChange={handleStudentSelectToggle}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-white/5 border border-transparent focus:bg-white focus:border-indigo-500/50 dark:focus:bg-[#12131a] dark:focus:border-indigo-500/50 rounded-xl text-sm focus:outline-none smooth-transition cursor-pointer h-40 overflow-y-auto"
                >
                  {studentPool.map(s => (
                    <option key={s.UserId} value={s.UserId}>
                      {s.FullName} ({s.Email})
                    </option>
                  ))}
                </select>
              </div>

            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-200/50 dark:border-white/5">
              <CustomButton
                type="submit"
                variant="primary"
                icon={Save}
                size="sm"
              >
                Save Project
              </CustomButton>
              <CustomButton
                type="button"
                variant="secondary"
                onClick={() => setViewMode('list')}
                size="sm"
              >
                Cancel
              </CustomButton>
            </div>
          </form>
        </GlassCard>
      )}
    </div>
  );
};

export default ProjectManagement;
