import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  Award,
  CheckCircle2,
  Clock,
  Calendar,
  FolderKanban,
  User,
  Star,
  RotateCw,
  Zap,
  Target,
  BarChart3,
  ChevronDown,
  Layers,
  Plus,
  Edit2,
  Trash2,
  MessageSquare,
  CheckSquare,
} from 'lucide-react';
import { projectAllocationService } from '../../api/projectAllocationService';
import { projectTaskService } from '../../api/projectTaskService';
import { taskStatusService } from '../../api/taskStatusService';
import { taskPriorityService } from '../../api/taskPriorityService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import { formatDate, toInputDate, formatScore, allocationProjectLabel } from '../../utils/formatters';
import { filterAllocationsForUser } from '../../utils/identity';

export default function TaskListPage() {
  const { user, hasRole } = useAuth();
  const toast = useToast();
  const isFaculty = hasRole(['Faculty']);
  const isStudent = hasRole(['Student']);
  const isAdmin = hasRole(['Admin']);
  const canManage = hasRole(['Admin', 'Faculty']);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [allocations, setAllocations] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [selectedAllocationId, setSelectedAllocationId] = useState('');
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [viewMode, setViewMode] = useState('charts'); // 'charts' or 'list'
  const [searchQuery, setSearchQuery] = useState('');

  // Task Create/Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    projectAllocationId: '',
    taskTitle: '',
    taskDescription: '',
    taskStatusId: '1',
    taskPriorityId: '2',
    assignedScore: 10,
    earnedScore: '',
    progressPercentage: 100,
    taskAssignedDate: toInputDate(new Date()),
    taskStartDate: toInputDate(new Date()),
    taskDueDate: toInputDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)),
    taskCompletedDate: '',
    facultyRemarks: '',
    studentRemarks: '',
  });

  // Remarks quick modal
  const [remarksModalTask, setRemarksModalTask] = useState(null);
  const [remarksData, setRemarksData] = useState({ facultyRemarks: '', studentRemarks: '' });

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    setRefreshing(true);
    try {
      const [allocRes, taskRes, statRes, prioRes] = await Promise.allSettled([
        projectAllocationService.getAll(),
        projectTaskService.getAll(),
        taskStatusService.getAll(),
        taskPriorityService.getAll(),
      ]);

      const allocList = allocRes.status === 'fulfilled' ? allocRes.value || [] : [];
      const taskList = taskRes.status === 'fulfilled' ? taskRes.value || [] : [];
      const statList = statRes.status === 'fulfilled' ? statRes.value || [] : [];
      const prioList = prioRes.status === 'fulfilled' ? prioRes.value || [] : [];

      setAllocations(allocList);
      setTasks(taskList);
      setStatuses(statList);
      setPriorities(prioList);

      const scopedAllocs = filterAllocationsForUser(allocList, user, {
        isAdmin,
        isFaculty,
        isStudent,
      });
      if (scopedAllocs.length > 0) {
        setSelectedAllocationId(String(scopedAllocs[0].projectAllocationId));
      } else {
        setSelectedAllocationId('');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load task and progress data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Allocations available to the current user
  const availableAllocations = useMemo(
    () =>
      filterAllocationsForUser(allocations, user, {
        isAdmin,
        isFaculty,
        isStudent,
      }),
    [allocations, user, isFaculty, isAdmin, isStudent]
  );

  // Selected Allocation
  const activeAllocation = useMemo(() => {
    if (!availableAllocations.length) return null;
    return (
      availableAllocations.find(
        (a) => String(a.projectAllocationId) === String(selectedAllocationId)
      ) || availableAllocations[0]
    );
  }, [selectedAllocationId, availableAllocations]);

  // Real tasks in database for this allocation
  const allocationTasks = useMemo(() => {
    if (!activeAllocation) return [];
    return tasks.filter(
      (t) => Number(t.projectAllocationId) === Number(activeAllocation.projectAllocationId)
    );
  }, [tasks, activeAllocation]);

  // Real Database Derived Metrics
  const metrics = useMemo(() => {
    const totalTasks = allocationTasks.length || activeAllocation?.totalTasksGiven || 0;
    const completedTasks = allocationTasks.filter(
      (t) => t.taskStatusName?.toLowerCase()?.includes('complete') || t.taskStatusId === 3
    ).length;
    const inProgressTasks = allocationTasks.filter(
      (t) => t.taskStatusName?.toLowerCase()?.includes('progress') || t.taskStatusId === 2
    ).length;
    const pendingTasks = allocationTasks.filter(
      (t) => t.taskStatusName?.toLowerCase()?.includes('pending') || t.taskStatusId === 1
    ).length;

    // Dynamically calculate progress from actual tasks:
    // When a new task is assigned/pending, the overall progress updates automatically from 100%
    let progress = 0;
    if (totalTasks > 0) {
      const sumTaskProgress = allocationTasks.reduce((sum, t) => {
        if (t.taskStatusName?.toLowerCase()?.includes('complete') || t.taskStatusId === 3) {
          return sum + 100;
        }
        if (Number(t.progressPercentage) > 0) {
          return sum + Number(t.progressPercentage);
        }
        if (t.taskStatusName?.toLowerCase()?.includes('progress') || t.taskStatusId === 2) {
          return sum + 50;
        }
        return sum;
      }, 0);
      progress = Math.min(100, Math.max(0, Math.round(sumTaskProgress / totalTasks)));
    } else if (activeAllocation?.progressPercentage != null) {
      progress = Math.min(100, Math.max(0, Number(activeAllocation.progressPercentage)));
    }

    const earnedSum = allocationTasks.reduce((sum, t) => sum + (Number(t.earnedScore) || 0), 0);
    const assignedSum = allocationTasks.reduce((sum, t) => sum + (Number(t.assignedScore) || 0), 0);
    const scorePct = assignedSum > 0 ? Math.round((earnedSum / assignedSum) * 100) : progress;

    const highTasks = allocationTasks.filter((t) => t.taskPriorityName?.toLowerCase()?.includes('high') || t.taskPriorityId === 3).length;
    const mediumTasks = allocationTasks.filter((t) => t.taskPriorityName?.toLowerCase()?.includes('medium') || t.taskPriorityId === 2).length;
    const lowTasks = allocationTasks.filter((t) => t.taskPriorityName?.toLowerCase()?.includes('low') || t.taskPriorityId === 1).length;

    return {
      progress,
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      earnedSum: earnedSum.toFixed(1),
      assignedSum: assignedSum.toFixed(1),
      scorePct,
      grade: activeAllocation?.overAllGrade || 'A+',
      highTasks,
      mediumTasks,
      lowTasks,
    };
  }, [activeAllocation, allocationTasks]);

  // Animated progress counter
  useEffect(() => {
    setAnimatedProgress(0);
    const timer = setTimeout(() => {
      setAnimatedProgress(metrics.progress);
    }, 120);
    return () => clearTimeout(timer);
  }, [metrics.progress]);

  // Radial chart dimensions
  const radius = 80;
  const stroke = 14;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;

  // Handlers for Faculty Task CRUD
  const handleOpenCreate = () => {
    setEditingTask(null);
    setFormData({
      projectAllocationId: activeAllocation?.projectAllocationId || availableAllocations[0]?.projectAllocationId || '',
      taskTitle: '',
      taskDescription: '',
      taskStatusId: statuses[0]?.taskStatusId || '1',
      taskPriorityId: priorities[1]?.taskPriorityId || '2',
      assignedScore: 10,
      earnedScore: '',
      progressPercentage: 0,
      taskAssignedDate: toInputDate(new Date()),
      taskStartDate: toInputDate(new Date()),
      taskDueDate: toInputDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)),
      taskCompletedDate: '',
      facultyRemarks: '',
      studentRemarks: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setFormData({
      projectAllocationId: task.projectAllocationId,
      taskTitle: task.taskTitle,
      taskDescription: task.taskDescription || '',
      taskStatusId: String(task.taskStatusId),
      taskPriorityId: String(task.taskPriorityId),
      assignedScore: task.assignedScore ?? 10,
      earnedScore: task.earnedScore ?? '',
      progressPercentage: task.progressPercentage ?? 0,
      taskAssignedDate: toInputDate(task.taskAssignedDate),
      taskStartDate: toInputDate(task.taskStartDate),
      taskDueDate: toInputDate(task.taskDueDate),
      taskCompletedDate: toInputDate(task.taskCompletedDate),
      facultyRemarks: task.facultyRemarks || '',
      studentRemarks: task.studentRemarks || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    if (!formData.taskTitle.trim()) {
      toast.error('Task title is required');
      return;
    }

    setSubmitting(true);
    try {
      const isEdit = Boolean(editingTask);
      const payload = {
        projectAllocationId: Number(formData.projectAllocationId),
        taskTitle: formData.taskTitle.trim(),
        taskDescription: formData.taskDescription?.trim() || null,
        taskPriorityId: Number(formData.taskPriorityId),
        taskAssignedDate: new Date(formData.taskAssignedDate).toISOString(),
        taskStartDate: formData.taskStartDate ? new Date(formData.taskStartDate).toISOString() : null,
        taskDueDate: new Date(formData.taskDueDate).toISOString(),
        // Evaluation fields: When creating new task, default to Pending (1), Max Score 10, 0% Progress.
        // Evaluation scores and remarks belong in the evaluation phase / editing mode.
        taskStatusId: isEdit ? Number(formData.taskStatusId) : 1,
        assignedScore: isEdit ? (Number(formData.assignedScore) || 10) : 10,
        earnedScore: isEdit && formData.earnedScore !== '' ? Number(formData.earnedScore) : null,
        progressPercentage: isEdit ? (Number(formData.progressPercentage) || 0) : 0,
        taskCompletedDate: isEdit && formData.taskCompletedDate ? new Date(formData.taskCompletedDate).toISOString() : null,
        nextFollowUpDate: null,
        facultyRemarks: isEdit && formData.facultyRemarks?.trim() ? formData.facultyRemarks.trim() : null,
        studentRemarks: isEdit && formData.studentRemarks?.trim() ? formData.studentRemarks.trim() : null,
      };

      if (editingTask) {
        await projectTaskService.update(editingTask.taskId, payload);
        toast.success('Task updated successfully');
      } else {
        await projectTaskService.create(payload);
        toast.success('New task assigned to student successfully');
      }

      setIsModalOpen(false);
      loadData(true);
    } catch (err) {
      toast.error(err.message || 'Failed to save task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await projectTaskService.delete(deleteTarget.taskId);
      toast.success('Task removed successfully');
      setDeleteTarget(null);
      loadData(true);
    } catch (err) {
      toast.error(err.message || 'Failed to delete task');
    } finally {
      setDeleting(false);
    }
  };

  const handleOpenRemarks = (task) => {
    setRemarksModalTask(task);
    setRemarksData({
      facultyRemarks: task.facultyRemarks || '',
      studentRemarks: task.studentRemarks || '',
    });
  };

  const handleSaveRemarks = async (e) => {
    e.preventDefault();
    if (!remarksModalTask) return;

    setSubmitting(true);
    try {
      const updated = {
        ...remarksModalTask,
        facultyRemarks: remarksData.facultyRemarks,
        studentRemarks: remarksData.studentRemarks,
      };
      await projectTaskService.update(remarksModalTask.taskId, updated);
      toast.success('Remarks updated successfully');
      setRemarksModalTask(null);
      loadData(true);
    } catch (err) {
      toast.error(err.message || 'Failed to update remarks');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader text="Loading progress charts from database..." className="min-h-[60vh]" />;
  }

  if (!activeAllocation) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-3xl border border-slate-200">
        <Activity className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">No Allocation Data Available</h3>
        <p className="text-xs text-slate-500 mt-1">
          {isStudent
            ? 'No project has been allocated to your student account yet.'
            : isFaculty
              ? 'You do not have any students allocated under your mentorship yet.'
              : 'There are no project allocations found in the database.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Student Selector */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 bg-brand-50 text-brand-700 font-bold rounded-full text-[11px] flex items-center gap-1.5 border border-brand-100">
              <Activity className="w-3.5 h-3.5 text-brand-600" />
              Live Project Progress Analytics
            </span>
            <Badge variant="purple" size="sm">
              Grade {metrics.grade}
            </Badge>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {allocationProjectLabel(activeAllocation)}
          </h1>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
            <span>
              Student:{' '}
              <strong className="text-slate-800">
                {activeAllocation.studentFullName || 'Student'}
              </strong>
            </span>
            <span>•</span>
            <span>
              Faculty Mentor:{' '}
              <strong className="text-slate-800">
                {activeAllocation.facultyFullName || 'Faculty Guide'}
              </strong>
            </span>
            <span>•</span>
            <span>
              Timeline: {formatDate(activeAllocation.projectStartDate)} → {formatDate(activeAllocation.projectEndDate)}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Dropdown for Faculty or Admin to switch between allocated students */}
          {availableAllocations.length > 1 && (
            <div className="relative">
              <select
                value={selectedAllocationId}
                onChange={(e) => setSelectedAllocationId(e.target.value)}
                className="appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-2xl pl-3 pr-8 py-2.5 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 transition shadow-sm cursor-pointer"
              >
                {availableAllocations.map((a) => (
                  <option key={a.projectAllocationId} value={a.projectAllocationId}>
                    {a.studentFullName || 'Student'} ({a.projectTitle})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2.5 top-3 pointer-events-none" />
            </div>
          )}

          <Button
            variant="outline"
            size="md"
            icon={RotateCw}
            loading={refreshing}
            onClick={() => loadData(true)}
            title="Refresh database metrics"
          >
            Refresh
          </Button>

          {canManage && (
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={handleOpenCreate}
            >
              Assign New Task
            </Button>
          )}
        </div>
      </div>

      {/* View Mode Toggle: Charts vs Tasks Table */}
      <div className="flex items-center justify-between bg-slate-100/90 border border-slate-200/60 p-1.5 rounded-2xl">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setViewMode('charts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              viewMode === 'charts'
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-4 h-4 text-brand-600" />
            <span>Animated Charts & Progress</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              viewMode === 'list'
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckSquare className="w-4 h-4 text-emerald-600" />
            <span>Task Deliverables Table ({allocationTasks.length})</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-500 font-medium px-3 hidden sm:inline">
          {viewMode === 'charts' ? 'Visual progress analytics' : `Managing ${allocationTasks.length} task deliverables`}
        </span>
      </div>

      {/* VIEW 1: ANIMATED CHARTS */}
      {viewMode === 'charts' && (
        <div className="space-y-6">
          {/* Row 1: 3 Real Database Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* CHART 1: Real Progress Percentage Radial Gauge */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-brand-950 rounded-3xl p-6 text-white shadow-xl border border-slate-700/60 flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between z-10">
                <div>
                  <span className="text-[11px] font-bold text-brand-300 uppercase tracking-wider block">
                    Database Progress
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">Allocation Progress</h3>
                </div>
                <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center">
                  <Zap className="w-4 h-4 text-yellow-300" />
                </div>
              </div>

              {/* SVG Animated Circular Gauge */}
              <div className="my-6 flex flex-col items-center justify-center relative z-10">
                <div className="relative w-48 h-48 flex items-center justify-center">
                  <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
                    <defs>
                      <linearGradient id="realProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="50%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                    <circle
                      stroke="rgba(255, 255, 255, 0.1)"
                      fill="transparent"
                      strokeWidth={stroke}
                      r={normalizedRadius}
                      cx={radius}
                      cy={radius}
                    />
                    <circle
                      stroke="url(#realProgressGrad)"
                      fill="transparent"
                      strokeWidth={stroke}
                      strokeDasharray={`${circumference} ${circumference}`}
                      style={{ strokeDashoffset }}
                      strokeLinecap="round"
                      r={normalizedRadius}
                      cx={radius}
                      cy={radius}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-4xl font-extrabold text-white tracking-tight">
                      {animatedProgress}%
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-400 mt-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30">
                      {animatedProgress >= 100 ? '100% Completed' : `${animatedProgress}% Reached`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-700/60 z-10 text-center">
                <div>
                  <span className="text-[11px] text-slate-400 block">Tasks Completed</span>
                  <strong className="text-sm font-bold text-white block mt-0.5">
                    {metrics.completedTasks} / {metrics.totalTasks}
                  </strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Overall Grade</span>
                  <strong className="text-sm font-bold text-yellow-300 block mt-0.5">
                    Grade {metrics.grade}
                  </strong>
                </div>
              </div>
            </div>

            {/* CHART 2: Real Database Task Status Distribution (Donut) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Status In Database
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">Task Status Breakdown</h3>
                </div>
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Target className="w-4 h-4 text-brand-600" />
                </div>
              </div>

              <div className="my-4 flex items-center justify-center">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg viewBox="0 0 36 36" className="w-36 h-36 transform -rotate-90">
                    <path
                      className="text-slate-100"
                      strokeWidth="4"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-emerald-500 transition-all duration-1000 ease-out"
                      strokeDasharray={`${(metrics.completedTasks / (metrics.totalTasks || 1)) * 100}, 100`}
                      strokeWidth="4"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-black text-slate-900">
                      {metrics.completedTasks}/{metrics.totalTasks}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">
                      Completed
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-slate-600 font-medium">Completed Tasks</span>
                  </div>
                  <span className="font-bold text-slate-900">{metrics.completedTasks}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span className="text-slate-600 font-medium">In Progress</span>
                  </div>
                  <span className="font-bold text-slate-900">{metrics.inProgressTasks}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="text-slate-600 font-medium">Pending Tasks</span>
                  </div>
                  <span className="font-bold text-slate-900">{metrics.pendingTasks}</span>
                </div>
              </div>
            </div>

            {/* CHART 3: Real Database Priority Distribution */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Database Priorities
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">Task Priority Breakdown</h3>
                </div>
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Layers className="w-4 h-4 text-purple-600" />
                </div>
              </div>

              <div className="space-y-4 my-3">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-rose-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      High Priority Tasks
                    </span>
                    <span className="text-slate-900">
                      {metrics.highTasks} Tasks ({metrics.totalTasks > 0 ? Math.round((metrics.highTasks / metrics.totalTasks) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-rose-500 h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${metrics.totalTasks > 0 ? (metrics.highTasks / metrics.totalTasks) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-amber-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Medium Priority Tasks
                    </span>
                    <span className="text-slate-900">
                      {metrics.mediumTasks} Tasks ({metrics.totalTasks > 0 ? Math.round((metrics.mediumTasks / metrics.totalTasks) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${metrics.totalTasks > 0 ? (metrics.mediumTasks / metrics.totalTasks) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-blue-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      Low Priority Tasks
                    </span>
                    <span className="text-slate-900">
                      {metrics.lowTasks} Tasks ({metrics.totalTasks > 0 ? Math.round((metrics.lowTasks / metrics.totalTasks) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${metrics.totalTasks > 0 ? (metrics.lowTasks / metrics.totalTasks) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Total Tasks Recorded</span>
                <span className="font-bold text-slate-800">{metrics.totalTasks} Tasks</span>
              </div>
            </div>
          </div>

          {/* Row 2: Actual Real Tasks in Database and their Real Earned Scores */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider block">
                    Actual Task Scores in Database
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                  <span className="text-xs text-slate-400">Earned Score vs Assigned Score</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Individual Task Performance Breakdown
                </h3>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5 bg-brand-50 text-brand-700 px-3 py-1.5 rounded-xl border border-brand-100">
                  <Award className="w-3.5 h-3.5 text-brand-600" />
                  Total Earned: {metrics.earnedSum} / {metrics.assignedSum} Marks ({metrics.scorePct}%)
                </span>
              </div>
            </div>

            {/* Real Task Score Bars from SPM_Task */}
            <div className="space-y-4">
              {allocationTasks.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  <p>No tasks assigned to this project yet.</p>
                  {canManage && (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Plus}
                      onClick={handleOpenCreate}
                      className="mt-3"
                    >
                      Assign First Task
                    </Button>
                  )}
                </div>
              ) : (
                allocationTasks.map((t, idx) => {
                  const assigned = Number(t.assignedScore) || 10;
                  const earned = Number(t.earnedScore) || 0;
                  const pct = Math.min(100, Math.round((earned / assigned) * 100));

                  return (
                    <div key={t.taskId || idx} className="space-y-1.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                        <span className="font-semibold text-slate-800 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 font-mono text-[10px] flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span>{t.taskTitle}</span>
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-slate-500">
                            Score: <strong className="text-slate-900">{earned}/{assigned}</strong>
                          </span>
                          <span className="font-bold text-emerald-600 w-10 text-right">{pct}%</span>
                          {canManage && (
                            <button
                              onClick={() => handleOpenEdit(t)}
                              className="p-1 rounded text-slate-400 hover:text-brand-600 transition"
                              title="Edit Task"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-brand-500 to-emerald-500 h-full rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      {t.facultyRemarks && (
                        <p className="text-[11px] text-brand-700 italic pl-7">
                          Faculty Note: "{t.facultyRemarks}"
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: TASK DELIVERABLES TABLE VIEW */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                All Project Tasks & Deliverables ({allocationTasks.length})
              </h3>
              <p className="text-xs text-slate-500">
                Showing database tasks for {allocationProjectLabel(activeAllocation)}
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Filter task deliverables..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {canManage && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={Plus}
                  onClick={handleOpenCreate}
                >
                  New Task
                </Button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="pb-3 w-12">#</th>
                  <th className="pb-3">Deliverable / Task Title</th>
                  <th className="pb-3">Priority</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Score</th>
                  <th className="pb-3">Progress</th>
                  <th className="pb-3">Faculty Note</th>
                  {canManage && <th className="pb-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allocationTasks.length === 0 ? (
                  <tr>
                    <td colSpan={canManage ? 8 : 7} className="py-8 text-center text-slate-400">
                      No tasks created for this project yet.
                    </td>
                  </tr>
                ) : (
                  allocationTasks
                    .filter((t) =>
                      searchQuery
                        ? t.taskTitle?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
                          t.facultyRemarks?.toLowerCase()?.includes(searchQuery.toLowerCase())
                        : true
                    )
                    .map((t, idx) => {
                      const isHigh = t.taskPriorityName?.toLowerCase()?.includes('high') || t.taskPriorityId === 3;
                      const isDone = t.taskStatusName?.toLowerCase()?.includes('complete') || t.taskStatusId === 3;
                      return (
                        <tr key={t.taskId || idx} className="hover:bg-slate-50/60 transition">
                          <td className="py-3 font-mono text-slate-400 text-[11px]">{idx + 1}</td>
                          <td className="py-3">
                            <span className="font-bold text-slate-900 block">{t.taskTitle}</span>
                            {t.taskDescription && (
                              <span className="text-[11px] text-slate-400 block line-clamp-1">
                                {t.taskDescription}
                              </span>
                            )}
                          </td>
                          <td className="py-3">
                            <Badge variant={isHigh ? 'danger' : 'warning'} size="sm">
                              {t.taskPriorityName || 'Medium'}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <Badge variant={isDone ? 'success' : 'primary'} size="sm">
                              {t.taskStatusName || 'Completed'}
                            </Badge>
                          </td>
                          <td className="py-3 font-bold text-slate-800">
                            {t.earnedScore ?? '—'} / {t.assignedScore || 10}
                          </td>
                          <td className="py-3">
                            <span className="font-semibold text-emerald-600">
                              {t.progressPercentage || 100}%
                            </span>
                          </td>
                          <td className="py-3 text-[11px] text-brand-700 italic max-w-xs">
                            <button
                              onClick={() => handleOpenRemarks(t)}
                              className="text-left hover:underline text-brand-600"
                            >
                              {t.facultyRemarks ? `"${t.facultyRemarks}"` : '+ Add Remark'}
                            </button>
                          </td>
                          {canManage && (
                            <td className="py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleOpenEdit(t)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition"
                                  title="Edit Task"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setDeleteTarget(t)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                  title="Delete Task"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Task Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? 'Edit Task Deliverable' : 'Assign New Task'}
        subtitle={`Project: ${allocationProjectLabel(activeAllocation)}`}
        size="lg"
      >
        <form onSubmit={handleSubmitTask} className="space-y-4">
          {/* Core Task Definition Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Project Allocation"
              required
              value={formData.projectAllocationId}
              onChange={(e) =>
                setFormData({ ...formData, projectAllocationId: e.target.value })
              }
              options={availableAllocations.map((a) => ({
                value: a.projectAllocationId,
                label: `${allocationProjectLabel(a)} (${a.studentFullName || 'Student'})`,
              }))}
            />

            <Select
              label="Priority"
              required
              value={formData.taskPriorityId}
              onChange={(e) =>
                setFormData({ ...formData, taskPriorityId: e.target.value })
              }
              options={
                priorities.length > 0
                  ? priorities.map((p) => ({ value: p.taskPriorityId, label: p.taskPriorityName }))
                  : [
                      { value: 1, label: 'Low' },
                      { value: 2, label: 'Medium' },
                      { value: 3, label: 'High' },
                    ]
              }
            />
          </div>

          <Input
            label="Task Deliverable Title *"
            required
            placeholder="e.g. Implement Deep Learning Classification Pipeline"
            value={formData.taskTitle}
            onChange={(e) => setFormData({ ...formData, taskTitle: e.target.value })}
          />

          <Textarea
            label="Task Description"
            rows={3}
            placeholder="Describe deliverables, requirements, and acceptance criteria..."
            value={formData.taskDescription}
            onChange={(e) => setFormData({ ...formData, taskDescription: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Assigned Date"
              type="date"
              required
              value={formData.taskAssignedDate}
              onChange={(e) => setFormData({ ...formData, taskAssignedDate: e.target.value })}
            />

            <Input
              label="Due Date"
              type="date"
              required
              value={formData.taskDueDate}
              onChange={(e) => setFormData({ ...formData, taskDueDate: e.target.value })}
            />
          </div>

          {/* Newly assigned tasks start in Pending state; Evaluation occurs in the Evaluation Phase */}
          {!editingTask && (
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span>
                  Initial Status: <strong className="text-amber-700 font-bold">Pending (0% Progress)</strong>
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Evaluation, scores & completion remarks are conducted in the Evaluation Phase.
              </span>
            </div>
          )}

          {/* Evaluation Phase Fields - Only shown when editing/evaluating an existing task */}
          {editingTask && (
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Task Evaluation & Progress Status
                </h4>
                <span className="text-[11px] text-brand-600 font-semibold bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-100">
                  Evaluation Phase
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Select
                  label="Status"
                  required
                  value={formData.taskStatusId}
                  onChange={(e) =>
                    setFormData({ ...formData, taskStatusId: e.target.value })
                  }
                  options={
                    statuses.length > 0
                      ? statuses.map((s) => ({ value: s.taskStatusId, label: s.taskStatusName }))
                      : [
                          { value: 1, label: 'Pending' },
                          { value: 2, label: 'In Progress' },
                          { value: 3, label: 'Completed' },
                        ]
                  }
                />

                <Input
                  label="Progress %"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.progressPercentage}
                  onChange={(e) => setFormData({ ...formData, progressPercentage: e.target.value })}
                />

                <Input
                  label="Completed Date"
                  type="date"
                  value={formData.taskCompletedDate}
                  onChange={(e) => setFormData({ ...formData, taskCompletedDate: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Assigned Max Score"
                  type="number"
                  min="1"
                  value={formData.assignedScore}
                  onChange={(e) => setFormData({ ...formData, assignedScore: e.target.value })}
                />

                <Input
                  label="Earned Score"
                  type="number"
                  step="0.5"
                  min="0"
                  max={formData.assignedScore}
                  placeholder="e.g. 9.5"
                  value={formData.earnedScore}
                  onChange={(e) => setFormData({ ...formData, earnedScore: e.target.value })}
                />
              </div>

              <Textarea
                label="Faculty Remarks / Feedback"
                rows={2}
                placeholder="Feedback from faculty mentor on task performance..."
                value={formData.facultyRemarks}
                onChange={(e) => setFormData({ ...formData, facultyRemarks: e.target.value })}
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {editingTask ? 'Update Task' : 'Assign Task'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Remarks Quick Modal */}
      <Modal
        isOpen={!!remarksModalTask}
        onClose={() => setRemarksModalTask(null)}
        title="Task Feedback & Remarks"
        subtitle={remarksModalTask?.taskTitle}
        size="md"
      >
        <form onSubmit={handleSaveRemarks} className="space-y-4">
          <Textarea
            label="Faculty Evaluation Remarks"
            rows={3}
            placeholder="Feedback or instructions for the student..."
            value={remarksData.facultyRemarks}
            onChange={(e) =>
              setRemarksData({ ...remarksData, facultyRemarks: e.target.value })
            }
          />

          <Textarea
            label="Student Submission Notes"
            rows={3}
            placeholder="Student's submission notes..."
            value={remarksData.studentRemarks}
            onChange={(e) =>
              setRemarksData({ ...remarksData, studentRemarks: e.target.value })
            }
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRemarksModalTask(null)}
              disabled={submitting}
            >
              Close
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Save Feedback
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteTask}
        loading={deleting}
        title="Delete Task?"
        message={`Are you sure you want to remove the task "${deleteTarget?.taskTitle}"?`}
      />
    </div>
  );
}
