import React, { useState, useEffect } from 'react';
import {
  Star,
  Award,
  CheckCircle2,
  Clock,
  RotateCw,
  FolderKanban,
  User,
  ArrowRight,
  TrendingUp,
  CheckSquare,
  ListTodo,
  Search,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { projectAllocationService } from '../../api/projectAllocationService';
import { projectTaskService } from '../../api/projectTaskService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ProjectEvaluationModal, { getTaskPhaseNumber } from '../../components/faculty/ProjectEvaluationModal';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { formatDate, formatPercent, allocationProjectLabel } from '../../utils/formatters';
import { allocationBelongsToFaculty } from '../../utils/identity';

export function calculateTaskGrade(earnedScore, assignedScore = 10) {
  if (earnedScore == null || earnedScore === '') return null;
  const earned = parseFloat(earnedScore);
  const max = parseFloat(assignedScore) || 10;
  if (isNaN(earned)) return null;
  const pct = (earned / max) * 100;
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B+';
  if (pct >= 60) return 'B';
  if (pct >= 50) return 'C';
  return 'F';
}

export default function FacultyEvaluatePage() {
  const { user } = useAuth();
  const toast = useToast();

  const [allocations, setAllocations] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 3-Phase Evaluation Modal state
  const [selectedAllocation, setSelectedAllocation] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState('all'); // 'all', 'tasks', 'allocations', 'pending'
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAllocations();
  }, []);

  const loadAllocations = async (silent = false) => {
    if (!silent) setLoading(true);
    setRefreshing(true);
    try {
      const [allocData, taskData] = await Promise.allSettled([
        projectAllocationService.getAll(),
        projectTaskService.getAll(),
      ]);

      const rawAllocs = allocData.status === 'fulfilled' ? allocData.value || [] : [];
      const rawTasks = taskData.status === 'fulfilled' ? taskData.value || [] : [];

      setTasks(rawTasks);

      const syncedAllocs = rawAllocs.map((alloc) => {
        const allocTasks = rawTasks.filter(
          (t) => Number(t.projectAllocationId) === Number(alloc.projectAllocationId)
        );
        if (allocTasks.length === 0) return alloc;

        const completedCount = allocTasks.filter(
          (t) => t.taskStatusName?.toLowerCase()?.includes('complete') || t.taskStatusId === 3
        ).length;

        const sumProg = allocTasks.reduce((sum, t) => {
          if (t.taskStatusName?.toLowerCase()?.includes('complete') || t.taskStatusId === 3) return sum + 100;
          if (Number(t.progressPercentage) > 0) return sum + Number(t.progressPercentage);
          if (t.taskStatusName?.toLowerCase()?.includes('progress') || t.taskStatusId === 2) return sum + 50;
          return sum;
        }, 0);

        const liveProgress = Math.round(sumProg / allocTasks.length);

        return {
          ...alloc,
          totalTasksGiven: allocTasks.length,
          totalCompletedTasks: completedCount,
          progressPercentage: liveProgress,
        };
      });

      setAllocations(syncedAllocs);
    } catch (err) {
      toast.error(err.message || 'Failed to load evaluation items');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Filter allocations belonging to current faculty
  const myAllocations = React.useMemo(() => {
    return allocations.filter((alloc) => allocationBelongsToFaculty(alloc, user));
  }, [allocations, user]);

  // Tasks under this faculty mentor
  const myTasks = React.useMemo(() => {
    const myAllocIds = new Set(myAllocations.map((a) => Number(a.projectAllocationId)));
    const relevantTasks = tasks.filter((t) => myAllocIds.has(Number(t.projectAllocationId)));

    return relevantTasks.map((t) => {
      const alloc = allocations.find((a) => Number(a.projectAllocationId) === Number(t.projectAllocationId));
      return {
        ...t,
        studentFullName: alloc?.studentFullName || 'Student',
        projectTitle: alloc?.projectTitle || 'Project',
      };
    });
  }, [tasks, myAllocations, allocations]);

  // Tasks that are pending evaluation or newly assigned
  const pendingTasks = React.useMemo(() => {
    return myTasks.filter((t) => t.earnedScore == null || t.earnedScore === '');
  }, [myTasks]);

  // Open 3-Phase Evaluation Modal for Allocation
  const handleOpenAllocationEvaluation = (alloc) => {
    setSelectedAllocation(alloc);
    setSelectedTask(null);
    setIsEvaluationModalOpen(true);
  };

  // Open 3-Phase Evaluation Modal for a specific Assigned Task
  const handleOpenTaskEvaluation = (task) => {
    const parentAlloc = allocations.find((a) => Number(a.projectAllocationId) === Number(task.projectAllocationId));
    setSelectedAllocation(parentAlloc || null);
    setSelectedTask(task);
    setIsEvaluationModalOpen(true);
  };

  const handleEvaluationCompleted = () => {
    loadAllocations(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
            Project Evaluation & 3-Phase Grading Hub
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Task 1 is Phase 1, Task 2 is Phase 2, Task 3 is the final Phase 3. Grade one visit at a time, then set the next date and work.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="md"
            icon={RotateCw}
            loading={refreshing}
            onClick={() => loadAllocations(true)}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* 3-Phase Evaluation Explanation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 border border-blue-200/80 rounded-2xl shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-xs mb-2">
            1
          </div>
          <h3 className="text-xs font-bold text-blue-900">Phase 1 = Task 1</h3>
          <p className="text-[11px] text-blue-700 mt-1 leading-relaxed">
            First visit: grade Task 1 (1–10), then give the next date and work for Task 2.
          </p>
        </div>

        <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-2xl shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-amber-600 text-white font-bold flex items-center justify-center text-xs mb-2">
            2
          </div>
          <h3 className="text-xs font-bold text-amber-900">Phase 2 = Task 2</h3>
          <p className="text-[11px] text-amber-700 mt-1 leading-relaxed">
            Second visit: grade Task 2 (1–10), then give the next date and work for Task 3.
          </p>
        </div>

        <div className="p-4 bg-emerald-50 border border-emerald-200/80 rounded-2xl shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-xs mb-2">
            3
          </div>
          <h3 className="text-xs font-bold text-emerald-900">Phase 3 = Task 3 (Final)</h3>
          <p className="text-[11px] text-emerald-700 mt-1 leading-relaxed">
            Final visit: grade Task 3. Overall grade is calculated from all three tasks.
          </p>
        </div>
      </div>

      {/* Navigation Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'all'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Evaluation Cards ({myAllocations.length + myTasks.length})
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'tasks'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Assigned Task Deliverables ({myTasks.length})
          </button>

          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'pending'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Pending 3-Phase Review ({pendingTasks.length + myAllocations.filter((a) => !a.overAllGrade).length})
          </button>

          <button
            onClick={() => setActiveTab('allocations')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'allocations'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Project Allocations ({myAllocations.length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search tasks, student, or project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {loading ? (
        <Loader text="Loading 3-Phase evaluation cards..." className="min-h-[30vh]" />
      ) : (
        <div className="space-y-8">
          {/* ======================================================== */}
          {/* SECTION 1: ASSIGNED TASK CARDS (For next assigned tasks) */}
          {/* ======================================================== */}
          {(activeTab === 'all' || activeTab === 'tasks' || activeTab === 'pending') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-brand-600" />
                    <span>Assigned Task Cards (Individual Deliverables)</span>
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Evaluate the current task only. Completing it unlocks the next task in the cycle.
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  {myTasks.length} Deliverables
                </span>
              </div>

              {myTasks.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
                  No tasks assigned yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {myTasks
                    .filter((t) => {
                      if (activeTab === 'pending') {
                        return t.earnedScore == null || t.earnedScore === '';
                      }
                      if (searchQuery.trim()) {
                        const q = searchQuery.toLowerCase();
                        return (
                          t.taskTitle?.toLowerCase()?.includes(q) ||
                          t.studentFullName?.toLowerCase()?.includes(q) ||
                          t.projectTitle?.toLowerCase()?.includes(q)
                        );
                      }
                      return true;
                    })
                    // Un-evaluated/pending tasks appear first!
                    .sort((a, b) => {
                      const aGraded = a.earnedScore != null && a.earnedScore !== '';
                      const bGraded = b.earnedScore != null && b.earnedScore !== '';
                      if (!aGraded && bGraded) return -1;
                      if (aGraded && !bGraded) return 1;
                      return (b.taskId || 0) - (a.taskId || 0);
                    })
                    .map((task) => {
                      const taskGrade = calculateTaskGrade(task.earnedScore, task.assignedScore || 10);
                      const isGraded = task.earnedScore != null && task.earnedScore !== '';
                      const phaseNo = getTaskPhaseNumber(task, myTasks.filter((x) => Number(x.projectAllocationId) === Number(task.projectAllocationId)));
                      const isHigh = task.taskPriorityName?.toLowerCase()?.includes('high') || task.taskPriorityId === 3;
                      const isCompleted = task.taskStatusName?.toLowerCase()?.includes('complete') || task.taskStatusId === 3;

                      return (
                        <div
                          key={task.taskId}
                          className={`bg-white rounded-3xl border p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                            !isGraded
                              ? 'border-amber-300 ring-2 ring-amber-100 bg-amber-50/20'
                              : 'border-slate-200/80'
                          }`}
                        >
                          <div>
                            {/* Card Header */}
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-bold">
                                  Task {phaseNo} · Phase {phaseNo}
                                </span>
                                <Badge variant={isHigh ? 'danger' : 'warning'} size="sm">
                                  {task.taskPriorityName || 'Medium'}
                                </Badge>
                              </div>

                              {taskGrade ? (
                                <Badge variant="purple" size="sm">
                                  Grade {taskGrade} ({task.earnedScore}/{task.assignedScore || 10})
                                </Badge>
                              ) : (
                                <Badge variant="warning" size="sm">
                                  Pending Phase {phaseNo}
                                </Badge>
                              )}
                            </div>

                            {/* Task Title & Description */}
                            <h3 className="text-sm font-bold text-slate-900 line-clamp-2 mb-1.5 tracking-tight">
                              {task.taskTitle}
                            </h3>

                            {task.taskDescription && (
                              <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                                {task.taskDescription}
                              </p>
                            )}

                            {/* Student & Project Details */}
                            <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="font-bold text-slate-800 truncate">
                                {task.studentFullName}
                              </span>
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-500 truncate text-[11px]">
                                {task.projectTitle}
                              </span>
                            </div>

                            {/* Status & Due Date */}
                            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 mb-3 pt-2 border-t border-slate-100">
                              <div>
                                <span className="block text-slate-400 text-[10px] mb-0.5">Status</span>
                                <Badge
                                  variant={
                                    isCompleted
                                      ? 'success'
                                      : task.taskStatusName?.toLowerCase()?.includes('progress') || task.taskStatusId === 2
                                      ? 'primary'
                                      : 'warning'
                                  }
                                  size="sm"
                                >
                                  {task.taskStatusName || (task.taskStatusId === 3 ? 'Completed' : 'Pending')}
                                </Badge>
                              </div>
                              <div>
                                <span className="block text-slate-400 text-[10px] mb-0.5">Due Date</span>
                                <span className="font-semibold text-slate-700">
                                  {formatDate(task.taskDueDate)}
                                </span>
                              </div>
                            </div>

                            {/* Faculty Feedback Quote */}
                            {task.facultyRemarks && (
                              <div className="mb-4 text-[11px] text-brand-700 bg-brand-50/70 p-2.5 rounded-xl border border-brand-100/70 italic line-clamp-2">
                                "{task.facultyRemarks}"
                              </div>
                            )}
                          </div>

                          {/* Card Footer: 3-Phase Evaluation Trigger Button */}
                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-2">
                            <div className="text-xs">
                              {isGraded ? (
                                <span>
                                  Marks:{' '}
                                  <strong className="text-brand-600 font-extrabold text-sm">
                                    {task.earnedScore}
                                  </strong>{' '}
                                  / {task.assignedScore || 10}
                                </span>
                              ) : (
                                <span className="text-amber-600 font-bold flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                  Needs Evaluation
                                </span>
                              )}
                            </div>

                            <Button
                              size="sm"
                              variant={isGraded ? 'outline' : 'primary'}
                              icon={Star}
                              onClick={() => handleOpenTaskEvaluation(task)}
                            >
                              {isGraded ? `Re-grade Phase ${phaseNo}` : `Evaluate Phase ${phaseNo}`}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* SECTION 2: PROJECT ALLOCATION CARDS (Milestone Level)    */}
          {/* ======================================================== */}
          {(activeTab === 'all' || activeTab === 'allocations' || activeTab === 'pending') && (
            <div className="space-y-3 pt-4 border-t border-slate-200/80">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <FolderKanban className="w-4 h-4 text-brand-600" />
                    <span>Project Allocation Cards (Overall Milestone Grades)</span>
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Opens the current pending phase for that student (Task 1 → 2 → 3).
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  {myAllocations.length} Projects
                </span>
              </div>

              {myAllocations.length === 0 ? (
                <EmptyState
                  title="No Allocations Found"
                  description="There are currently no student project allocations allocated to your faculty mentorship."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {myAllocations
                    .filter((alloc) => {
                      if (activeTab === 'pending') {
                        return !alloc.overAllGrade || alloc.progressPercentage < 100;
                      }
                      if (searchQuery.trim()) {
                        const q = searchQuery.toLowerCase();
                        return (
                          alloc.projectTitle?.toLowerCase()?.includes(q) ||
                          alloc.studentFullName?.toLowerCase()?.includes(q)
                        );
                      }
                      return true;
                    })
                    .map((alloc) => (
                      <div
                        key={alloc.projectAllocationId}
                        className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md font-semibold">
                              Alloc #{alloc.projectAllocationId}
                            </span>
                            {alloc.overAllGrade ? (
                              <Badge variant="purple" size="sm">
                                Grade {alloc.overAllGrade}
                              </Badge>
                            ) : (
                              <Badge variant="warning" size="sm">
                                Pending Grade
                              </Badge>
                            )}
                          </div>

                          <h3 className="text-sm font-bold text-slate-900 line-clamp-1 mb-1">
                            {allocationProjectLabel(alloc)}
                          </h3>

                          <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="font-bold text-slate-800">
                              {alloc.studentFullName || `Student ID: ${alloc.studentId}`}
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="space-y-1 mb-4">
                            <div className="flex justify-between text-[11px] text-slate-500">
                              <span>Milestone Progress</span>
                              <span className="font-bold text-slate-700">
                                {formatPercent(alloc.progressPercentage)}
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-brand-600 h-full rounded-full transition-all"
                                style={{
                                  width: `${Math.min(100, Number(alloc.progressPercentage) || 0)}%`,
                                }}
                              />
                            </div>
                          </div>

                          <div className="text-[11px] text-slate-400 mb-4">
                            Timeline: {formatDate(alloc.projectStartDate)} → {formatDate(alloc.projectEndDate)}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-xs text-slate-500 font-medium">
                            {alloc.overAllGrade ? 'Evaluated' : 'Needs Review'}
                          </span>
                          <Button
                            size="sm"
                            variant={alloc.overAllGrade ? 'outline' : 'primary'}
                            icon={Star}
                            onClick={() => handleOpenAllocationEvaluation(alloc)}
                          >
                            {alloc.overAllGrade ? 'Review cycle' : 'Continue cycle'}
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* The ONE AND ONLY Three Phase Evaluation Modal */}
      <ProjectEvaluationModal
        isOpen={isEvaluationModalOpen}
        onClose={() => {
          setIsEvaluationModalOpen(false);
          setSelectedAllocation(null);
          setSelectedTask(null);
        }}
        allocation={selectedAllocation}
        task={selectedTask}
        onUpdated={handleEvaluationCompleted}
      />
    </div>
  );
}
