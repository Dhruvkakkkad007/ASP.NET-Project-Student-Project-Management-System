import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  FolderKanban,
  FileText,
  CheckCircle,
  CheckCircle2,
  Star,
  Users,
  Calendar,
  Sparkles,
  ArrowRight,
  BookOpen,
  LayoutGrid,
  List,
  Search,
  Check,
  UserCheck,
  ArrowRightLeft,
} from 'lucide-react';
import { projectService } from '../../api/projectService';
import { projectAllocationService } from '../../api/projectAllocationService';
import { projectSwitchRequestService } from '../../api/projectSwitchRequestService';
import { userService } from '../../api/userService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import { formatDate, toInputDate, formatPercent, allocationProjectLabel, hasAssignedProject } from '../../utils/formatters';
import { allocationBelongsToStudent, getCurrentUserId } from '../../utils/identity';
import { useNavigate } from 'react-router-dom';

export default function ProjectListPage() {
  const { user, hasRole } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const isStudent = hasRole('Student');
  const canManage = hasRole(['Admin', 'Faculty']);

  const [projects, setProjects] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [users, setUsers] = useState([]);
  const [switchRequests, setSwitchRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [switchReason, setSwitchReason] = useState('');

  // View mode: 'cards' or 'table'
  const [viewMode, setViewMode] = useState(isStudent ? 'cards' : 'table');
  const [searchQuery, setSearchQuery] = useState('');

  // Admin Create/Edit Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({ projectTitle: '', description: '' });
  const [errors, setErrors] = useState({});

  // Student Project Selection Modal states
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [selectedProjectToEnroll, setSelectedProjectToEnroll] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollForm, setEnrollForm] = useState({
    facultyId: '',
    projectStartDate: toInputDate(new Date()),
    projectEndDate: toInputDate(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)),
  });

  // Admin Delete dialog state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projData, allocData, userData, switchData] = await Promise.allSettled([
        projectService.getAll(),
        projectAllocationService.getAll(),
        userService.getAll(),
        isStudent ? projectSwitchRequestService.getAll() : Promise.resolve([]),
      ]);

      if (projData.status === 'fulfilled') setProjects(projData.value || []);
      if (allocData.status === 'fulfilled') setAllocations(allocData.value || []);
      if (userData.status === 'fulfilled') setUsers(userData.value || []);
      if (switchData.status === 'fulfilled') setSwitchRequests(switchData.value || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load project data');
    } finally {
      setLoading(false);
    }
  };

  // Find the logged-in student's active allocation (if any)
  const myAllocation = React.useMemo(() => {
    if (!user) return null;
    return allocations.find((a) => allocationBelongsToStudent(a, user)) || null;
  }, [allocations, user]);

  // List of faculty members available to mentor students
  const facultyList = React.useMemo(() => {
    const mentors = users.filter((u) => {
      const type = (u.userTypeName || '').toLowerCase();
      return type.includes('faculty') || type.includes('mentor') || type.includes('professor') || type.includes('teacher');
    });

    const finalMentors = mentors.length > 0 ? mentors : users.filter((u) => u.userId !== user?.userId);

    return finalMentors.map((f) => ({
      value: String(f.userId),
      label: `${f.fullName || f.email} (Faculty Mentor)`,
    }));
  }, [users, user]);

  // Student action: Open selection confirmation modal
  const pendingSwitch = React.useMemo(
    () => switchRequests.find((r) => r.status === 'Pending') || null,
    [switchRequests]
  );

  const switchHistory = React.useMemo(
    () =>
      [...switchRequests].sort(
        (a, b) => new Date(b.requestedAt || 0) - new Date(a.requestedAt || 0)
      ),
    [switchRequests]
  );

  const latestSwitchForProject = (projectId) =>
    switchHistory.find((r) => Number(r.requestedProjectId) === Number(projectId));

  const switchStatusStyle = (status) => {
    const value = String(status || '').toLowerCase();
    if (value === 'accepted') return { variant: 'success', label: 'Accepted' };
    if (value === 'declined') return { variant: 'danger', label: 'Declined' };
    if (value === 'cancelled') return { variant: 'default', label: 'Cancelled' };
    return { variant: 'warning', label: 'Pending' };
  };

  const handleOpenSelectProject = (project) => {
    setSelectedProjectToEnroll(project);
    setSwitchReason('');
    setEnrollForm({
      facultyId: facultyList[0]?.value || (myAllocation?.facultyId ? String(myAllocation.facultyId) : ''),
      projectStartDate: toInputDate(new Date()),
      projectEndDate: toInputDate(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)),
    });
    setIsSelectModalOpen(true);
  };

  const handleCancelPendingSwitch = async () => {
    if (!pendingSwitch) return;
    try {
      await projectSwitchRequestService.cancel(pendingSwitch.projectSwitchRequestId);
      toast.success('Switch request cancelled.');
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Could not cancel the request');
    }
  };

  // Student action: Confirm & Enroll in project
  const handleConfirmSelectProject = async (e) => {
    e.preventDefault();
    if (!selectedProjectToEnroll) return;

    setEnrolling(true);
    try {
      const studentId = getCurrentUserId(user);
      if (!studentId) {
        toast.error('Your student account could not be identified. Please sign out and sign in again.');
        return;
      }
      const facultyId = myAllocation?.facultyId
        ? Number(myAllocation.facultyId)
        : Number(enrollForm.facultyId);
      if (!facultyId) {
        toast.error('A faculty guide is required. Ask admin to allocate you first, or select a faculty mentor.');
        return;
      }

      const payload = {
        projectId: Number(selectedProjectToEnroll.projectId),
        studentId,
        facultyId,
        assignedDate: myAllocation?.assignedDate || new Date().toISOString(),
        projectStartDate: myAllocation?.projectStartDate || new Date(enrollForm.projectStartDate).toISOString(),
        projectEndDate: myAllocation?.projectEndDate || new Date(enrollForm.projectEndDate).toISOString(),
        totalTasksGiven: myAllocation?.totalTasksGiven || 0,
        totalCompletedTasks: myAllocation?.totalCompletedTasks || 0,
        progressPercentage: myAllocation?.progressPercentage || 0,
        overAllGrade: myAllocation?.overAllGrade || null,
      };

      if (hasAssignedProject(myAllocation)) {
        await projectSwitchRequestService.create({
          requestedProjectId: Number(selectedProjectToEnroll.projectId),
          reason: switchReason.trim() || null,
        });
        toast.success(
          `Switch request sent to ${myAllocation.facultyFullName || 'your faculty guide'}. They will accept or decline it.`
        );
      } else if (myAllocation) {
        await projectAllocationService.update(myAllocation.projectAllocationId, payload);
        toast.success(
          `Project saved. "${selectedProjectToEnroll.projectTitle}" is now visible to your faculty guide and admin.`
        );
      } else {
        await projectAllocationService.create(payload);
        toast.success(
          `Congratulations! You selected "${selectedProjectToEnroll.projectTitle}". Faculty and admin can now see it.`
        );
      }

      setIsSelectModalOpen(false);
      setSelectedProjectToEnroll(null);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to select project');
    } finally {
      setEnrolling(false);
    }
  };

  // Admin Handlers
  const handleOpenCreate = () => {
    setEditingProject(null);
    setFormData({ projectTitle: '', description: '' });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (project) => {
    setEditingProject(project);
    setFormData({
      projectTitle: project.projectTitle || '',
      description: project.description || '',
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!formData.projectTitle.trim()) {
      errs.projectTitle = 'Project title is required';
    } else if (formData.projectTitle.trim().length < 3) {
      errs.projectTitle = 'Title must be at least 3 characters long';
    } else if (formData.projectTitle.length > 150) {
      errs.projectTitle = 'Title cannot exceed 150 characters';
    }

    if (formData.description && formData.description.length > 1000) {
      errs.description = 'Description cannot exceed 1000 characters';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (editingProject) {
        await projectService.update(editingProject.projectId, formData);
        toast.success('Project updated successfully');
      } else {
        await projectService.create(formData);
        toast.success('Project created successfully');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await projectService.delete(deleteTarget.projectId);
      toast.success('Project deleted successfully');
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete project');
    } finally {
      setDeleting(false);
    }
  };

  // Filtered projects
  const filteredProjects = React.useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const q = searchQuery.toLowerCase();
    return projects.filter(
      (p) =>
        p.projectTitle?.toLowerCase()?.includes(q) ||
        p.description?.toLowerCase()?.includes(q)
    );
  }, [projects, searchQuery]);

  // Data table columns
  const columns = [
    {
      header: 'ID',
      accessor: 'projectId',
      className: 'w-16 font-mono text-xs text-slate-500',
    },
    {
      header: 'Project Title',
      accessor: 'projectTitle',
      render: (row) => {
        const isSelected = myAllocation && Number(myAllocation.projectId) === Number(row.projectId);
        return (
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">{row.projectTitle}</span>
              {isSelected && (
                <Badge variant="success" size="sm">
                  Active Enrollment
                </Badge>
              )}
            </div>
            {row.description && (
              <span className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                {row.description}
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Description',
      accessor: 'description',
      className: 'hidden md:table-cell max-w-xs',
      render: (row) => (
        <span className="text-xs text-slate-600 line-clamp-2">
          {row.description || '—'}
        </span>
      ),
    },
    {
      header: 'Actions',
      className: 'w-36 text-right',
      sortable: false,
      render: (row) => {
        const isSelected = myAllocation && Number(myAllocation.projectId) === Number(row.projectId);

        if (isStudent) {
          return (
            <div className="flex items-center justify-end">
              {isSelected ? (
                <Button
                  size="sm"
                  variant="outline"
                  icon={CheckCircle}
                  onClick={() => navigate('/tasks')}
                >
                  My Project
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="primary"
                  icon={Sparkles}
                  onClick={() => handleOpenSelectProject(row)}
                >
                  {hasAssignedProject(myAllocation) ? 'Request Switch' : 'Select Project'}
                </Button>
              )}
            </div>
          );
        }

        if (canManage) {
          return (
            <div className="flex items-center justify-end gap-1">
              <button
                onClick={() => handleOpenEdit(row)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition"
                title="Edit Project"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeleteTarget(row)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                title="Delete Project"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        }

        return null;
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-brand-600" />
            {isStudent ? 'Student Project Selection' : 'Projects Master'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isStudent
              ? 'Explore available project topics and select the one you wish to build for your semester.'
              : 'Browse, manage, and create project topics available for student assignment.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle: Cards vs Table */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'cards'
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'table'
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {canManage && (
            <Button
              variant="primary"
              icon={Plus}
              size="md"
              onClick={handleOpenCreate}
            >
              Create Project
            </Button>
          )}
        </div>
      </div>

      {/* STUDENT ENROLLMENT STATUS BANNER */}
      {isStudent && (
        <div className="bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[11px] font-bold text-brand-200 flex items-center gap-1 border border-white/10">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  Student Project Hub
                </span>
                {hasAssignedProject(myAllocation) ? (
                  <Badge variant="success" size="sm">
                    Enrolled
                  </Badge>
                ) : myAllocation ? (
                  <Badge variant="warning" size="sm">
                    Select a project
                  </Badge>
                ) : null}
              </div>

              {hasAssignedProject(myAllocation) ? (
                <>
                  <h2 className="text-xl font-black text-white tracking-tight">
                    Your Active Project: {allocationProjectLabel(myAllocation)}
                  </h2>
                  <p className="text-xs text-brand-200 mt-1 flex items-center gap-3 flex-wrap">
                    <span>
                      Faculty Guide: <strong className="text-white">{myAllocation.facultyFullName || 'Assigned Mentor'}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Milestone Progress: <strong className="text-emerald-400">{formatPercent(myAllocation.progressPercentage)}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Timeline: {formatDate(myAllocation.projectStartDate)} → {formatDate(myAllocation.projectEndDate)}
                    </span>
                  </p>
                </>
              ) : myAllocation ? (
                <>
                  <h2 className="text-xl font-black text-white tracking-tight">
                    Faculty assigned — now choose your project
                  </h2>
                  <p className="text-xs text-brand-200 mt-1">
                    Guide: <strong className="text-white">{myAllocation.facultyFullName || 'Faculty'}</strong>.
                    Select a topic below. It will appear immediately on the faculty and admin panels.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-black text-white tracking-tight">
                    You have not selected a project yet
                  </h2>
                  <p className="text-xs text-brand-200 mt-1">
                    Select a project topic from the catalog below. Admin and faculty will see your choice automatically.
                  </p>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {hasAssignedProject(myAllocation) && (
                <Button
                  variant="inverse"
                  size="md"
                  icon={ArrowRight}
                  onClick={() => navigate('/tasks')}
                >
                  View Tasks & Progress
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {isStudent && (pendingSwitch || switchHistory.length > 0) && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-brand-600" />
                Project switch requests
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Faculty will Accept or Decline. Status updates here for you, faculty, and admin.
              </p>
            </div>
            {pendingSwitch && (
              <Badge variant="warning" size="sm">
                Pending approval
              </Badge>
            )}
          </div>

          {pendingSwitch && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-amber-900">Waiting for faculty</p>
                <p className="text-xs text-amber-800 mt-1">
                  You asked to move from <strong>{pendingSwitch.currentProjectTitle || 'your current project'}</strong> to{' '}
                  <strong>{pendingSwitch.requestedProjectTitle}</strong>. Waiting for{' '}
                  {pendingSwitch.facultyFullName || 'your faculty guide'}.
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={handleCancelPendingSwitch}>
                Cancel request
              </Button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="pb-2 pr-3">From</th>
                  <th className="pb-2 pr-3">To</th>
                  <th className="pb-2 pr-3">Requested</th>
                  <th className="pb-2 pr-3">Status</th>
                  <th className="pb-2">Faculty note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {switchHistory.map((req) => {
                  const style = switchStatusStyle(req.status);
                  return (
                    <tr key={req.projectSwitchRequestId}>
                      <td className="py-2.5 pr-3 text-slate-700">
                        {req.currentProjectTitle || '—'}
                      </td>
                      <td className="py-2.5 pr-3 font-semibold text-slate-900">
                        {req.requestedProjectTitle || '—'}
                      </td>
                      <td className="py-2.5 pr-3 text-slate-500 whitespace-nowrap">
                        {formatDate(req.requestedAt)}
                      </td>
                      <td className="py-2.5 pr-3">
                        <Badge variant={style.variant} size="sm">
                          {style.label}
                        </Badge>
                      </td>
                      <td className="py-2.5 text-slate-500">
                        {req.facultyRemarks || (String(req.status).toLowerCase() === 'pending' ? 'Awaiting review' : '—')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
        <input
          type="text"
          placeholder="Search project topics or keywords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {loading ? (
        <Loader text="Loading available projects..." className="min-h-[40vh]" />
      ) : viewMode === 'cards' ? (
        /* ======================== VIEW 1: INTERACTIVE PROJECT SELECTION CARDS ======================== */
        filteredProjects.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-400">
            No projects found matching your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((proj) => {
              const isSelected = myAllocation && Number(myAllocation.projectId) === Number(proj.projectId);
              const enrolledCount = allocations.filter(
                (a) => Number(a.projectId) === Number(proj.projectId)
              ).length;
              const projectSwitch = isStudent ? latestSwitchForProject(proj.projectId) : null;

              return (
                <div
                  key={proj.projectId}
                  className={`bg-white rounded-3xl border p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden ${
                    isSelected
                      ? 'border-emerald-400 ring-2 ring-emerald-100 bg-emerald-50/10'
                      : 'border-slate-200/80 hover:border-brand-200'
                  }`}
                >
                  <div>
                    {/* Header Badges */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md font-semibold">
                        #{proj.projectId}
                      </span>

                      {isSelected ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Your Project
                        </span>
                      ) : projectSwitch && String(projectSwitch.status).toLowerCase() === 'pending' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Pending
                        </span>
                      ) : projectSwitch && String(projectSwitch.status).toLowerCase() === 'declined' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          Declined
                        </span>
                      ) : projectSwitch && String(projectSwitch.status).toLowerCase() === 'accepted' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Accepted
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                          {enrolledCount > 0 ? `${enrolledCount} Enrolled` : 'Available'}
                        </span>
                      )}
                    </div>

                    {/* Project Title */}
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight mb-2">
                      {proj.projectTitle}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                      {proj.description || 'No detailed scope provided. Project topic available for assignment.'}
                    </p>
                  </div>

                  {/* Card Action Footer */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-2">
                    {isStudent ? (
                      isSelected ? (
                        <Button
                          size="sm"
                          variant="success"
                          icon={Check}
                          onClick={() => navigate('/tasks')}
                          className="w-full"
                        >
                          Enrolled (Go to Tasks)
                        </Button>
                      ) : projectSwitch && String(projectSwitch.status).toLowerCase() === 'pending' ? (
                        <Button size="sm" variant="outline" className="w-full" disabled>
                          Pending — waiting for faculty
                        </Button>
                      ) : projectSwitch && String(projectSwitch.status).toLowerCase() === 'declined' ? (
                        <Button
                          size="sm"
                          variant="primary"
                          icon={Sparkles}
                          onClick={() => handleOpenSelectProject(proj)}
                          className="w-full"
                        >
                          Request again
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="primary"
                          icon={Sparkles}
                          onClick={() => handleOpenSelectProject(proj)}
                          className="w-full"
                        >
                          {hasAssignedProject(myAllocation) ? 'Request to Switch' : 'Select This Project'}
                        </Button>
                      )
                    ) : canManage ? (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs text-slate-400">
                          {enrolledCount} active student(s)
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(proj)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition"
                            title="Edit Project"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(proj)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete Project"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* ======================== VIEW 2: TABLE VIEW ======================== */
        <DataTable
          columns={columns}
          data={filteredProjects}
          loading={loading}
          searchPlaceholder="Filter project titles or descriptions..."
        />
      )}

      {/* STUDENT PROJECT SELECTION / ENROLLMENT MODAL */}
      <Modal
        isOpen={isSelectModalOpen}
        onClose={() => {
          setIsSelectModalOpen(false);
          setSelectedProjectToEnroll(null);
        }}
        title={hasAssignedProject(myAllocation) ? 'Request project switch' : 'Select & Enroll in Project'}
        subtitle={selectedProjectToEnroll?.projectTitle || 'Project Topic Selection'}
        size="md"
      >
        {selectedProjectToEnroll && (
          <form onSubmit={handleConfirmSelectProject} className="space-y-4">
            {/* Project Overview Card */}
            <div className="bg-brand-50/70 border border-brand-100 rounded-2xl p-4">
              <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider block mb-1">
                Selected Topic
              </span>
              <h4 className="text-base font-extrabold text-brand-950 mb-1">
                {selectedProjectToEnroll.projectTitle}
              </h4>
              {selectedProjectToEnroll.description && (
                <p className="text-xs text-brand-800/80 leading-relaxed mt-1">
                  {selectedProjectToEnroll.description}
                </p>
              )}
            </div>

            {/* Warning if switching projects */}
            {hasAssignedProject(myAllocation) && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-800 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  You cannot switch projects yourself. This request goes to{' '}
                  <strong>{myAllocation.facultyFullName || 'your faculty guide'}</strong>.
                  If they accept, student, faculty, and admin records will show{' '}
                  <strong>"{selectedProjectToEnroll.projectTitle}"</strong>.
                </div>
              </div>
            )}

            {hasAssignedProject(myAllocation) && (
              <Textarea
                label="Reason for switch"
                rows={3}
                value={switchReason}
                onChange={(e) => setSwitchReason(e.target.value)}
                placeholder="Tell your faculty guide why you want to change projects..."
              />
            )}

            {myAllocation ? (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-600">
                Faculty Guide:{' '}
                <strong className="text-slate-900">{myAllocation.facultyFullName || 'Assigned mentor'}</strong>
                <span className="block mt-1 text-slate-500">
                  Timeline: {formatDate(myAllocation.projectStartDate)} → {formatDate(myAllocation.projectEndDate)}
                </span>
              </div>
            ) : (
              <>
                <Select
                  label="Choose Your Faculty Guide / Supervisor"
                  required
                  value={enrollForm.facultyId}
                  onChange={(e) =>
                    setEnrollForm({ ...enrollForm, facultyId: e.target.value })
                  }
                  options={facultyList}
                  helperText="Select the faculty mentor who will guide and evaluate your project."
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Project Start Date"
                    type="date"
                    required
                    value={enrollForm.projectStartDate}
                    onChange={(e) =>
                      setEnrollForm({ ...enrollForm, projectStartDate: e.target.value })
                    }
                  />

                  <Input
                    label="Project End Date"
                    type="date"
                    required
                    value={enrollForm.projectEndDate}
                    onChange={(e) =>
                      setEnrollForm({ ...enrollForm, projectEndDate: e.target.value })
                    }
                  />
                </div>
              </>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsSelectModalOpen(false);
                  setSelectedProjectToEnroll(null);
                }}
                disabled={enrolling}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                icon={CheckCircle2}
                loading={enrolling}
              >
                {hasAssignedProject(myAllocation) ? 'Send request to faculty' : 'Confirm & Select Project'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* ADMIN CREATE / EDIT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? 'Edit Project Master' : 'Create New Project'}
        subtitle="Specify the project title and outline of deliverables"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Project Title"
            required
            placeholder="e.g. AI-Powered Healthcare Diagnostic Portal"
            value={formData.projectTitle}
            onChange={(e) =>
              setFormData({ ...formData, projectTitle: e.target.value })
            }
            error={errors.projectTitle}
          />

          <Textarea
            label="Description & Scope"
            rows={4}
            placeholder="Brief overview of project requirements, objectives, and technology stack..."
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            error={errors.description}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {editingProject ? 'Save Changes' : 'Create Project'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ADMIN DELETE CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Project?"
        message={`Are you sure you want to delete "${deleteTarget?.projectTitle}"? Any linked allocations may be affected.`}
      />
    </div>
  );
}
