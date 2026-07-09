import React, { useState, useContext, useEffect } from 'react';
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
  Calendar, 
  Clock, 
  FileText,
  AlertTriangle,
  Award
} from 'lucide-react';

const TaskManagement = () => {
  const { 
    tasks, 
    projects, 
    users, 
    statuses, 
    priorities,
    addTask, 
    updateTask, 
    deleteTask 
  } = useContext(DatabaseContext);
  
  const { currentUser, isAdmin, isFaculty, isStudent } = useContext(AuthContext);

  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'add' | 'edit' | 'student-update' | 'detail'
  const [selectedTask, setSelectedTask] = useState(null);

  // Form Fields (Faculty / Admin CRUD)
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [taskStatusId, setTaskStatusId] = useState('1'); // Pending
  const [priorityId, setPriorityId] = useState('2'); // Medium
  const [assignedStudentId, setAssignedStudentId] = useState('');
  const [assignedScore, setAssignedScore] = useState('10');
  const [earnedScore, setEarnedScore] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [facultyRemarks, setFacultyRemarks] = useState('');

  // Form Fields (Student Status Updates)
  const [studentStatusId, setStudentStatusId] = useState('1');
  const [studentRemarks, setStudentRemarks] = useState('');

  const [error, setError] = useState('');

  // Filter projects depending on roles
  const activeProjects = projects.filter(p => {
    if (isFaculty) return p.FacultyId === currentUser.UserId;
    if (isStudent) return p.StudentIds.includes(currentUser.UserId);
    return true; // Admin
  });

  const activeProjectIds = activeProjects.map(p => p.ProjectId);

  // Filter task list
  const visibleTasks = tasks.filter(t => {
    // Project-based scope
    if (!activeProjectIds.includes(t.ProjectId)) return false;

    // Student scope
    if (isStudent && t.StudentId !== currentUser.UserId) return false;

    // Search query
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      t.TaskTitle.toLowerCase().includes(query) ||
      (t.TaskDescription && t.TaskDescription.toLowerCase().includes(query));

    // Project filter dropdown
    let matchesProject = true;
    if (projectFilter !== 'All') {
      matchesProject = t.ProjectId === Number(projectFilter);
    }

    // Status filter dropdown
    let matchesStatus = true;
    if (statusFilter !== 'All') {
      matchesStatus = t.TaskStatus === Number(statusFilter);
    }

    return matchesSearch && matchesProject && matchesStatus;
  });

  const handleAddNewClick = () => {
    setTaskTitle('');
    setTaskDescription('');
    setProjectId(activeProjects[0]?.ProjectId?.toString() || '');
    setTaskStatusId('1');
    setPriorityId('2');
    setAssignedStudentId('');
    setAssignedScore('10');
    setEarnedScore('');
    setFacultyRemarks('');
    
    // Set 7 days out as default due date
    const d = new Date();
    d.setDate(d.getDate() + 7);
    setDueDate(d.toISOString().split('T')[0]);

    setError('');
    setViewMode('add');
  };

  const handleEditClick = (task) => {
    setSelectedTask(task);
    setTaskTitle(task.TaskTitle);
    setTaskDescription(task.TaskDescription || '');
    setProjectId(task.ProjectId.toString());
    setTaskStatusId(task.TaskStatus.toString());
    setPriorityId(task.PriorityID.toString());
    setAssignedStudentId(task.StudentId.toString());
    setAssignedScore(task.AssignedScore.toString());
    setEarnedScore(task.EarnedScore !== null ? task.EarnedScore.toString() : '');
    setDueDate(task.DueDate || '');
    setFacultyRemarks(task.FacultyRemarks || '');
    setError('');
    setViewMode('edit');
  };

  const handleStudentUpdateClick = (task) => {
    setSelectedTask(task);
    setStudentStatusId(task.TaskStatus.toString());
    setStudentRemarks(task.StudentRemarks || '');
    setError('');
    setViewMode('student-update');
  };

  const handleDetailClick = (task) => {
    setSelectedTask(task);
    setViewMode('detail');
  };

  const handleDeleteClick = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(taskId);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!taskTitle.trim() || !projectId || !assignedStudentId || !dueDate || !assignedScore) {
      setError('Please fill in all required fields.');
      return;
    }

    const payload = {
      TaskTitle: taskTitle.trim(),
      TaskDescription: taskDescription.trim(),
      ProjectId: Number(projectId),
      TaskStatus: Number(taskStatusId),
      PriorityID: Number(priorityId),
      StudentId: Number(assignedStudentId),
      AssignedScore: Number(assignedScore),
      EarnedScore: earnedScore !== '' ? Number(earnedScore) : null,
      DueDate: dueDate,
      FacultyRemarks: facultyRemarks.trim() || null
    };

    // Validate score logic
    if (payload.EarnedScore !== null && payload.EarnedScore > payload.AssignedScore) {
      setError(`Earned score cannot exceed the assigned task points limit (${payload.AssignedScore}).`);
      return;
    }

    if (viewMode === 'add') {
      addTask(payload);
    } else {
      updateTask(selectedTask.TaskId, payload);
    }

    setViewMode('list');
  };

  const handleStudentStatusSubmit = (e) => {
    e.preventDefault();
    
    updateTask(selectedTask.TaskId, {
      TaskStatus: Number(studentStatusId),
      StudentRemarks: studentRemarks.trim() || null
    });

    setViewMode('list');
  };

  // Get project student list dynamically for dropdown
  const getProjectStudents = () => {
    const selectedProjId = Number(projectId);
    if (!selectedProjId) return [];
    const proj = projects.find(p => p.ProjectId === selectedProjId);
    if (!proj) return [];
    return users.filter(u => proj.StudentIds.includes(u.UserId));
  };

  // Sync default student when project changes in the form
  useEffect(() => {
    const projStudents = getProjectStudents();
    if (projStudents.length > 0 && !projStudents.some(s => s.UserId.toString() === assignedStudentId)) {
      setAssignedStudentId(projStudents[0].UserId.toString());
    }
  }, [projectId]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">
            Task Management & Grading
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            {isStudent 
              ? 'Update the status of your assigned tasks and submit remarks.' 
              : 'Create task milestones, allocate to students, and evaluate performance scores.'}
          </p>
        </div>
      </div>

      {viewMode === 'list' ? (
        <GlassCard>
          {/* Table Toolbar */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1 max-w-4xl">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </span>
                <input
                  type="text"
                  placeholder="Search task title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-100 dark:bg-white/5 border border-transparent focus:bg-white focus:border-indigo-500/50 dark:focus:bg-[#12131a] dark:focus:border-indigo-500/50 rounded-xl focus:outline-none focus:ring-0 smooth-transition"
                />
              </div>

              <div className="relative">
                <select
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-slate-100 dark:bg-white/5 border border-transparent focus:bg-white focus:border-indigo-500/50 dark:focus:bg-[#12131a] dark:focus:border-indigo-500/50 rounded-xl focus:outline-none smooth-transition cursor-pointer appearance-none"
                >
                  <option value="All">All Projects</option>
                  {activeProjects.map(p => (
                    <option key={p.ProjectId} value={p.ProjectId}>{p.ProjectTitle}</option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-slate-100 dark:bg-white/5 border border-transparent focus:bg-white focus:border-indigo-500/50 dark:focus:bg-[#12131a] dark:focus:border-indigo-500/50 rounded-xl focus:outline-none smooth-transition cursor-pointer appearance-none"
                >
                  <option value="All">All Statuses</option>
                  {statuses.map(s => (
                    <option key={s.StatusID} value={s.StatusID}>{s.StatusName}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Only Faculty and Admin can add tasks */}
            {(isAdmin || isFaculty) && (
              <CustomButton
                variant="primary"
                onClick={handleAddNewClick}
                icon={Plus}
                size="sm"
              >
                Add Task
              </CustomButton>
            )}
          </div>

          {/* Tasks Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/50 dark:border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-2 w-10">#</th>
                  <th className="pb-3 w-56">Task Title</th>
                  <th className="pb-3">Project</th>
                  <th className="pb-3">Assignee</th>
                  <th className="pb-3">Priority</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Score</th>
                  <th className="pb-3 text-right pr-4 w-36">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/30 dark:divide-white/5">
                {visibleTasks.map((t, index) => {
                  const proj = projects.find(p => p.ProjectId === t.ProjectId);
                  const student = users.find(u => u.UserId === t.StudentId);
                  const statusObj = statuses.find(s => s.StatusID === t.TaskStatus);
                  const priorityObj = priorities.find(p => p.PriorityID === t.PriorityID);

                  return (
                    <tr key={t.TaskId} className="hover:bg-slate-100/30 dark:hover:bg-white/5 transition-colors">
                      <td className="py-4 pl-2 text-xs font-semibold text-slate-400">{index + 1}</td>
                      <td className="py-4 font-semibold text-sm text-slate-800 dark:text-slate-200">
                        <button onClick={() => handleDetailClick(t)} className="hover:text-indigo-500 text-left smooth-transition">
                          {t.TaskTitle}
                        </button>
                      </td>
                      <td className="py-4 text-xs font-medium text-slate-500">
                        {proj ? proj.ProjectTitle : 'Unknown'}
                      </td>
                      <td className="py-4">
                        {student ? (
                          <div className="flex items-center gap-2">
                            <img src={student.ProfilePicturePath} className="w-6 h-6 rounded-md object-cover bg-slate-100" />
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{student.FullName}</span>
                          </div>
                        ) : 'Unassigned'}
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${priorityObj?.PriortyCssClass}`}>
                          {priorityObj?.PriorityName}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusObj?.StatusCssClass}`}>
                          {statusObj?.StatusName}
                        </span>
                      </td>
                      <td className="py-4 text-xs font-bold text-slate-700 dark:text-slate-300">
                        {t.EarnedScore !== null ? (
                          <span className="text-emerald-500">{t.EarnedScore}</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                        <span className="text-slate-400 font-normal"> / {t.AssignedScore}</span>
                      </td>
                      <td className="py-4 text-right pr-4">
                        <div className="flex justify-end items-center gap-1.5">
                          <button
                            onClick={() => handleDetailClick(t)}
                            className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg smooth-transition font-semibold"
                          >
                            Details
                          </button>

                          {/* Student view: status update button */}
                          {isStudent && (
                            <button
                              onClick={() => handleStudentUpdateClick(t)}
                              className="px-2.5 py-1.5 text-xs bg-indigo-500/10 hover:bg-indigo-500 text-indigo-500 hover:text-white rounded-lg smooth-transition font-semibold"
                            >
                              Update
                            </button>
                          )}

                          {/* Faculty/Admin view: full edit and delete */}
                          {(isAdmin || isFaculty) && (
                            <>
                              <button
                                onClick={() => handleEditClick(t)}
                                className="p-1.5 text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg smooth-transition"
                                title="Edit Task details"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(t.TaskId)}
                                className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-lg smooth-transition"
                                title="Delete Task"
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
                {visibleTasks.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 text-sm">
                      No tasks found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      ) : viewMode === 'detail' ? (
        /* TASK DETAILED DOSSIER VIEW SCREEN */
        <GlassCard className="max-w-3xl animate-fade-in">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-200/50 dark:border-white/5 pb-4">
            <button
              onClick={() => setViewMode('list')}
              className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-400 uppercase">Task Detail Summary</span>
          </div>

          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
                {projects.find(p => p.ProjectId === selectedTask.ProjectId)?.ProjectTitle}
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white font-heading mt-1">
                {selectedTask.TaskTitle}
              </h2>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statuses.find(s => s.StatusID === selectedTask.TaskStatus)?.StatusCssClass}`}>
                  Status: {statuses.find(s => s.StatusID === selectedTask.TaskStatus)?.StatusName}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${priorities.find(p => p.PriorityID === selectedTask.PriorityID)?.PriortyCssClass}`}>
                  {priorities.find(p => p.PriorityID === selectedTask.PriorityID)?.PriorityName} Priority
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Due Date: {formatDate(selectedTask.DueDate)}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Description</h4>
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 leading-relaxed bg-slate-100/50 dark:bg-white/5 p-4 rounded-2xl border border-slate-200/50 dark:border-white/5">
                {selectedTask.TaskDescription || 'No detailed instructions provided.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <GlassCard className="bg-slate-100/30 border border-slate-200/50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Student</span>
                {(() => {
                  const s = users.find(u => u.UserId === selectedTask.StudentId);
                  return (
                    <div className="flex items-center gap-3 mt-3">
                      <img src={s?.ProfilePicturePath} className="w-9 h-9 rounded-lg object-cover bg-slate-200" />
                      <div>
                        <h5 className="font-semibold text-xs text-slate-800 dark:text-slate-200">{s?.FullName}</h5>
                        <p className="text-[9px] text-slate-400 mt-0.5">{s?.Email}</p>
                      </div>
                    </div>
                  );
                })()}
              </GlassCard>

              <GlassCard className="bg-slate-100/30 border border-slate-200/50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Academic Score Metrics</span>
                <div className="flex items-center gap-4 mt-3">
                  <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-bold text-base text-slate-800 dark:text-slate-200">
                      {selectedTask.EarnedScore !== null ? (
                        <span className="text-emerald-500">{selectedTask.EarnedScore}</span>
                      ) : (
                        <span className="text-slate-400">Not Evaluated</span>
                      )}
                      <span className="text-slate-400 font-normal text-xs"> / {selectedTask.AssignedScore} pts</span>
                    </h5>
                    <p className="text-[9px] text-slate-400 mt-0.5">Assigned weight limits</p>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Remarks Section */}
            <div className="space-y-4 pt-4 border-t border-slate-200/50 dark:border-white/5">
              {selectedTask.StudentRemarks && (
                <div>
                  <h4 className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Student Submission Comments</h4>
                  <p className="text-xs italic text-slate-600 dark:text-slate-300 mt-2 bg-emerald-500/5 p-3.5 rounded-xl border-l-2 border-emerald-500">
                    "{selectedTask.StudentRemarks}"
                  </p>
                </div>
              )}

              {selectedTask.FacultyRemarks && (
                <div>
                  <h4 className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Faculty Evaluation Remarks</h4>
                  <p className="text-xs italic text-slate-600 dark:text-slate-300 mt-2 bg-indigo-500/5 p-3.5 rounded-xl border-l-2 border-indigo-500">
                    "{selectedTask.FacultyRemarks}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      ) : viewMode === 'student-update' ? (
        /* STUDENT UPDATE FORM (ONLY STATUS AND COMMENTS) */
        <GlassCard className="max-w-2xl animate-fade-in">
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={() => setViewMode('list')}
              className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-200 font-heading">
              Update Task Status: <span className="text-indigo-500">{selectedTask.TaskTitle}</span>
            </h3>
          </div>

          <form onSubmit={handleStudentStatusSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="studentStatus" className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase pl-1">
                Current Status
              </label>
              <select
                id="studentStatus"
                value={studentStatusId}
                onChange={(e) => setStudentStatusId(e.target.value)}
                className="w-full px-4 py-3 bg-slate-100 dark:bg-white/5 border border-transparent focus:bg-white focus:border-indigo-500/50 dark:focus:bg-[#12131a] dark:focus:border-indigo-500/50 rounded-xl text-sm focus:outline-none smooth-transition cursor-pointer"
              >
                {/* Students can set to Pending, In Progress, Completed */}
                {statuses.slice(0, 3).map(s => (
                  <option key={s.StatusID} value={s.StatusID}>{s.StatusName}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="studentRemarks" className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase pl-1">
                Submission Notes / Remarks
              </label>
              <textarea
                id="studentRemarks"
                rows="4"
                placeholder="Leave feedback on what was achieved, links to repositories, or questions for your advisor..."
                value={studentRemarks}
                onChange={(e) => setStudentRemarks(e.target.value)}
                className="w-full px-4 py-3 bg-slate-100 dark:bg-white/5 border border-transparent focus:bg-white focus:border-indigo-500/50 dark:focus:bg-[#12131a] dark:focus:border-indigo-500/50 rounded-xl text-sm focus:outline-none placeholder-slate-400 dark:placeholder-slate-500 smooth-transition resize-none"
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-200/50 dark:border-white/5">
              <CustomButton
                type="submit"
                variant="primary"
                icon={Save}
                size="sm"
              >
                Submit Update
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
      ) : (
        /* FACULTY / ADMIN ADD AND EDIT FORM SCREEN */
        <GlassCard className="max-w-4xl">
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={() => setViewMode('list')}
              className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-200 font-heading">
              {viewMode === 'add' ? 'Initiate Project Milestone Task' : 'Modify Milestone Parameters'}
            </h3>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Task Title */}
              <div className="space-y-2 col-span-1 md:col-span-2">
                <label htmlFor="title" className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase pl-1">
                  Task Title
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  placeholder="e.g. Design Database Schema"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-white/5 border border-transparent focus:bg-white focus:border-indigo-500/50 dark:focus:bg-[#12131a] dark:focus:border-indigo-500/50 rounded-xl text-sm focus:outline-none placeholder-slate-400 dark:placeholder-slate-500 smooth-transition"
                />
              </div>

              {/* Task Description */}
              <div className="space-y-2 col-span-1 md:col-span-2">
                <label htmlFor="desc" className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase pl-1">
                  Task Instructions / Details
                </label>
                <textarea
                  id="desc"
                  rows="4"
                  placeholder="Provide explicit instructions for the student..."
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-white/5 border border-transparent focus:bg-white focus:border-indigo-500/50 dark:focus:bg-[#12131a] dark:focus:border-indigo-500/50 rounded-xl text-sm focus:outline-none placeholder-slate-400 dark:placeholder-slate-500 smooth-transition resize-none"
                />
              </div>

              {/* Project Select */}
              <div className="space-y-2">
                <label htmlFor="project" className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase pl-1">
                  Parent Project
                </label>
                <select
                  id="project"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-white/5 border border-transparent focus:bg-white focus:border-indigo-500/50 dark:focus:bg-[#12131a] dark:focus:border-indigo-500/50 rounded-xl text-sm focus:outline-none smooth-transition cursor-pointer appearance-none"
                >
                  {activeProjects.map(p => (
                    <option key={p.ProjectId} value={p.ProjectId}>{p.ProjectTitle}</option>
                  ))}
                </select>
              </div>

              {/* Assignee Student Select */}
              <div className="space-y-2">
                <label htmlFor="assignee" className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase pl-1">
                  Assigned Team Member
                </label>
                <select
                  id="assignee"
                  value={assignedStudentId}
                  onChange={(e) => setAssignedStudentId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-white/5 border border-transparent focus:bg-white focus:border-indigo-500/50 dark:focus:bg-[#12131a] dark:focus:border-indigo-500/50 rounded-xl text-sm focus:outline-none smooth-transition cursor-pointer appearance-none"
                >
                  <option value="" disabled>-- Select Student --</option>
                  {getProjectStudents().map(s => (
                    <option key={s.UserId} value={s.UserId}>{s.FullName} ({s.Email})</option>
                  ))}
                  {getProjectStudents().length === 0 && (
                    <option value="" disabled>No students assigned to selected project</option>
                  )}
                </select>
              </div>

              {/* Task Due Date */}
              <div className="space-y-2">
                <label htmlFor="due" className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase pl-1">
                  Due Date
                </label>
                <input
                  id="due"
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-white/5 border border-transparent focus:bg-white focus:border-indigo-500/50 dark:focus:bg-[#12131a] dark:focus:border-indigo-500/50 rounded-xl text-sm focus:outline-none smooth-transition"
                />
              </div>

              {/* Priority Select */}
              <div className="space-y-2">
                <label htmlFor="priority" className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase pl-1">
                  Priority level
                </label>
                <select
                  id="priority"
                  value={priorityId}
                  onChange={(e) => setPriorityId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-white/5 border border-transparent focus:bg-white focus:border-indigo-500/50 dark:focus:bg-[#12131a] dark:focus:border-indigo-500/50 rounded-xl text-sm focus:outline-none smooth-transition cursor-pointer appearance-none"
                >
                  {priorities.map(p => (
                    <option key={p.PriorityID} value={p.PriorityID}>{p.PriorityName}</option>
                  ))}
                </select>
              </div>

              {/* Status Select */}
              <div className="space-y-2">
                <label htmlFor="status" className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase pl-1">
                  Task Status
                </label>
                <select
                  id="status"
                  value={taskStatusId}
                  onChange={(e) => setTaskStatusId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-white/5 border border-transparent focus:bg-white focus:border-indigo-500/50 dark:focus:bg-[#12131a] dark:focus:border-indigo-500/50 rounded-xl text-sm focus:outline-none smooth-transition cursor-pointer appearance-none"
                >
                  {statuses.map(s => (
                    <option key={s.StatusID} value={s.StatusID}>{s.StatusName}</option>
                  ))}
                </select>
              </div>

              {/* Score Settings */}
              <div className="space-y-2">
                <label htmlFor="score" className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase pl-1">
                  Assigned Score Limit
                </label>
                <input
                  id="score"
                  type="number"
                  required
                  min="1"
                  value={assignedScore}
                  onChange={(e) => setAssignedScore(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-white/5 border border-transparent focus:bg-white focus:border-indigo-500/50 dark:focus:bg-[#12131a] dark:focus:border-indigo-500/50 rounded-xl text-sm focus:outline-none smooth-transition"
                />
              </div>

            </div>

            {/* GRADING SECTION (Only visible on Edit when task is Completed or In Evaluation) */}
            {(viewMode === 'edit' && (taskStatusId === '3' || taskStatusId === '4' || selectedTask?.EarnedScore !== null)) && (
              <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 space-y-6">
                <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4" /> Academic Evaluation & Score Card
                </h4>
                
                {selectedTask?.StudentRemarks && (
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold block">Student Final Submission Comments:</span>
                    <p className="text-xs italic text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5 p-3 rounded-lg border-l-2 border-slate-300">
                      "{selectedTask.StudentRemarks}"
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="earned" className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase pl-1">
                      Earned Score (max {assignedScore} pts)
                    </label>
                    <input
                      id="earned"
                      type="number"
                      min="0"
                      max={assignedScore}
                      placeholder="Enter earned points"
                      value={earnedScore}
                      onChange={(e) => setEarnedScore(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-100 dark:bg-white/5 border border-transparent focus:bg-white focus:border-indigo-500/50 dark:focus:bg-[#12131a] dark:focus:border-indigo-500/50 rounded-xl text-sm focus:outline-none smooth-transition"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="remarks" className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase pl-1">
                      Faculty Remarks / Feedback
                    </label>
                    <input
                      id="remarks"
                      type="text"
                      placeholder="e.g. Excellent database scoping."
                      value={facultyRemarks}
                      onChange={(e) => setFacultyRemarks(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-100 dark:bg-white/5 border border-transparent focus:bg-white focus:border-indigo-500/50 dark:focus:bg-[#12131a] dark:focus:border-indigo-500/50 rounded-xl text-sm focus:outline-none smooth-transition"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-slate-200/50 dark:border-white/5">
              <CustomButton
                type="submit"
                variant="primary"
                icon={Save}
                size="sm"
              >
                Save Task
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

export default TaskManagement;
