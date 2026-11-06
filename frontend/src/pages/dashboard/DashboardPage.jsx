import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  GitFork,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  Plus,
  Users,
  Star,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { projectService } from '../../api/projectService';
import { projectAllocationService } from '../../api/projectAllocationService';
import { projectTaskService } from '../../api/projectTaskService';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import ProjectEvaluationModal from '../../components/faculty/ProjectEvaluationModal';
import { formatDate, formatPercent, allocationProjectLabel } from '../../utils/formatters';
import { filterAllocationsForUser, filterTasksForAllocations } from '../../utils/identity';

export default function DashboardPage() {
  const { user, hasRole } = useAuth();
  const isFaculty = hasRole(['Faculty']);
  const isAdmin = hasRole(['Admin']);
  const isStudent = hasRole(['Student']);

  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    projectsCount: 0,
    allocationsCount: 0,
    tasksCount: 0,
    completedTasksCount: 0,
    avgProgress: 0,
    // Faculty specific metrics
    myStudentsCount: 0,
    myEvaluatedCount: 0,
    myPendingCount: 0,
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [recentAllocations, setRecentAllocations] = useState([]);
  const [myAllocations, setMyAllocations] = useState([]);

  // Modal for evaluation directly from dashboard
  const [evaluatingAllocation, setEvaluatingAllocation] = useState(null);
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [projects, allocations, tasks] = await Promise.allSettled([
        projectService.getAll(),
        projectAllocationService.getAll(),
        projectTaskService.getAll(),
      ]);

      const projectList = projects.status === 'fulfilled' ? projects.value || [] : [];
      const rawAllocList = allocations.status === 'fulfilled' ? allocations.value || [] : [];
      const taskList = tasks.status === 'fulfilled' ? tasks.value || [] : [];

      // Automatically sync each allocation's progress & counts from live tasks
      const allocList = rawAllocList.map((alloc) => {
        const allocTasks = taskList.filter(
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

      const scopedAllocs = filterAllocationsForUser(allocList, user, {
        isAdmin,
        isFaculty,
        isStudent,
      });
      const scopedTasks = isAdmin
        ? taskList
        : filterTasksForAllocations(taskList, scopedAllocs);

      const completed = scopedTasks.filter((t) =>
        t.taskStatusName?.toLowerCase()?.includes('complete')
      ).length;

      const totalProgress = scopedAllocs.reduce(
        (acc, curr) => acc + (Number(curr.progressPercentage) || 0),
        0
      );
      const avgProg = scopedAllocs.length > 0 ? totalProgress / scopedAllocs.length : 0;

      const evaluatedCount = scopedAllocs.filter((a) => !!a.overAllGrade).length;
      const pendingCount = scopedAllocs.length - evaluatedCount;

      setMetrics({
        projectsCount: isStudent ? scopedAllocs.length : projectList.length,
        allocationsCount: scopedAllocs.length,
        tasksCount: scopedTasks.length,
        completedTasksCount: completed,
        avgProgress: Math.round(avgProg),
        myStudentsCount: scopedAllocs.length,
        myEvaluatedCount: evaluatedCount,
        myPendingCount: pendingCount,
      });

      setRecentTasks(scopedTasks.slice(0, 5));
      setRecentAllocations(scopedAllocs.slice(0, 5));
      setMyAllocations(scopedAllocs);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEvaluation = (alloc) => {
    setEvaluatingAllocation(alloc);
    setIsEvalModalOpen(true);
  };

  const handleAllocationUpdated = (updatedAlloc) => {
    if (updatedAlloc && updatedAlloc.projectAllocationId) {
      setMyAllocations((prev) =>
        prev.map((item) =>
          item.projectAllocationId === updatedAlloc.projectAllocationId
            ? { ...item, ...updatedAlloc }
            : item
        )
      );
      setRecentAllocations((prev) =>
        prev.map((item) =>
          item.projectAllocationId === updatedAlloc.projectAllocationId
            ? { ...item, ...updatedAlloc }
            : item
        )
      );
    }
    fetchDashboardData();
  };

  if (loading) {
    return <Loader text="Loading your dashboard overview..." className="min-h-[50vh]" />;
  }

  // Cards layout depends on role
  const statCards = isFaculty
    ? [
        {
          title: 'My Assigned Students',
          value: metrics.myStudentsCount,
          icon: Users,
          color: 'bg-brand-600 text-white',
          link: '/faculty/students',
        },
        {
          title: 'Evaluated Projects',
          value: metrics.myEvaluatedCount,
          icon: CheckCircle2,
          color: 'bg-emerald-500 text-white',
          link: '/faculty/evaluate',
        },
        {
          title: 'Pending Evaluations',
          value: metrics.myPendingCount,
          icon: Clock,
          color: 'bg-amber-500 text-white',
          link: '/faculty/evaluate',
        },
        {
          title: 'Avg. Project Progress',
          value: `${metrics.avgProgress}%`,
          icon: TrendingUp,
          color: 'bg-purple-500 text-white',
          link: '/faculty/students',
        },
      ]
    : isStudent
      ? [
          {
            title: 'My Project',
            value: metrics.projectsCount,
            icon: FolderKanban,
            color: 'bg-blue-500 text-white',
            link: '/projects',
          },
          {
            title: 'My Allocations',
            value: metrics.allocationsCount,
            icon: GitFork,
            color: 'bg-emerald-500 text-white',
            link: '/allocations',
          },
          {
            title: 'My Tasks',
            value: metrics.tasksCount,
            icon: Clock,
            color: 'bg-amber-500 text-white',
            link: '/tasks',
          },
          {
            title: 'My Progress',
            value: `${metrics.avgProgress}%`,
            icon: TrendingUp,
            color: 'bg-purple-500 text-white',
            link: '/tasks',
          },
        ]
      : [
        {
          title: 'Total Projects',
          value: metrics.projectsCount,
          icon: FolderKanban,
          color: 'bg-blue-500 text-white',
          link: '/projects',
        },
        {
          title: 'Active Allocations',
          value: metrics.allocationsCount,
          icon: GitFork,
          color: 'bg-emerald-500 text-white',
          link: '/allocations',
        },
        {
          title: 'Total Tasks',
          value: metrics.tasksCount,
          icon: Clock,
          color: 'bg-amber-500 text-white',
          link: '/tasks',
        },
        {
          title: 'Avg. Progress',
          value: `${metrics.avgProgress}%`,
          icon: TrendingUp,
          color: 'bg-purple-500 text-white',
          link: '/allocations',
        },
      ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-brand-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold mb-2">
            Welcome Back
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {user?.fullName || (user?.email ? user.email.split('@')[0] : 'User')}
          </h1>
          <p className="text-brand-100 text-xs sm:text-sm mt-1 max-w-xl">
            Logged in as <span className="font-bold uppercase">{user?.role}</span>.{' '}
            {isFaculty
              ? 'Manage your assigned student project evaluations, milestone tasks, and grading.'
              : 'Here is your student project lifecycle status and latest milestone progress.'}
          </p>
        </div>

        {/* Action buttons based on Role */}
        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <>
              <Link to="/projects">
                <Button variant="inverse" size="sm" icon={Plus}>
                  New Project
                </Button>
              </Link>
              <Link to="/admin/allocations">
                <Button variant="banner" size="sm" icon={GitFork}>
                  Allocate Project
                </Button>
              </Link>
            </>
          )}

          {isFaculty && (
            <>
              <Link to="/faculty/students">
                <Button variant="inverse" size="sm" icon={Users}>
                  My Student List
                </Button>
              </Link>
              <Link to="/faculty/switch-requests">
                <Button variant="banner" size="sm" icon={GitFork}>
                  Switch Requests
                </Button>
              </Link>
              <Link to="/faculty/evaluate">
                <Button variant="inverse" size="sm" icon={Star}>
                  Evaluate Projects
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Link
              key={idx}
              to={stat.link}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all group flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-medium text-slate-500">{stat.title}</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
              </div>
              <div
                className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}
              >
                <Icon className="w-6 h-6" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* FACULTY VIEW: DEDICATED STUDENT LIST SECTION */}
      {isFaculty ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-600" />
                My Allocated Student List
              </h2>
              <p className="text-xs text-slate-500">
                Students assigned under your guidance. Track progress and perform 3-phase evaluations.
              </p>
            </div>
            <Link
              to="/faculty/students"
              className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1"
            >
              <span>View full list</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {myAllocations.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">
              No students allocated to your profile yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="pb-3">Student</th>
                    <th className="pb-3">Project Title</th>
                    <th className="pb-3">Timeline</th>
                    <th className="pb-3">Progress</th>
                    <th className="pb-3 text-center">Overall Grade</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myAllocations.map((alloc) => (
                    <tr key={alloc.projectAllocationId} className="hover:bg-slate-50/50">
                      <td className="py-3 font-semibold text-slate-800">
                        {alloc.studentFullName || `Student ID: ${alloc.studentId}`}
                      </td>
                      <td className="py-3 text-slate-700 font-medium">
                        {allocationProjectLabel(alloc)}
                      </td>
                      <td className="py-3 text-slate-500">
                        {formatDate(alloc.projectStartDate)} → {formatDate(alloc.projectEndDate)}
                      </td>
                      <td className="py-3">
                        <div className="w-24">
                          <div className="flex justify-between text-[10px] mb-1">
                            <span className="font-semibold text-slate-700">
                              {formatPercent(alloc.progressPercentage)}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-brand-600 h-full rounded-full"
                              style={{
                                width: `${Math.min(100, Number(alloc.progressPercentage) || 0)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-center">
                        {alloc.overAllGrade ? (
                          <Badge variant="purple" size="sm">
                            {alloc.overAllGrade}
                          </Badge>
                        ) : (
                          <Badge variant="warning" size="sm">
                            Pending
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <Button
                          size="sm"
                          variant="primary"
                          icon={Star}
                          onClick={() => handleOpenEvaluation(alloc)}
                        >
                          Evaluate
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* NON-FACULTY (ADMIN / STUDENT) VIEW: 2-Column Split */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Allocations Overview */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {isStudent ? 'My Project Allocation' : 'Active Project Allocations'}
                </h2>
                <p className="text-xs text-slate-500">
                  {isStudent
                    ? 'Your assigned project and faculty mentor'
                    : 'Student & faculty supervisor pairings'}
                </p>
              </div>
              <Link
                to="/allocations"
                className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentAllocations.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">
                {isStudent
                  ? 'No project has been allocated to your account yet.'
                  : 'No allocations recorded yet.'}
              </p>
            ) : (
              <div className="space-y-3">
                {recentAllocations.map((alloc) => (
                  <div
                    key={alloc.projectAllocationId}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                          {allocationProjectLabel(alloc)}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Student:{' '}
                          <span className="font-medium text-slate-700">
                            {alloc.studentFullName || `User #${alloc.studentId}`}
                          </span>{' '}
                          • Faculty:{' '}
                          <span className="font-medium text-slate-700">
                            {alloc.facultyFullName || `User #${alloc.facultyId}`}
                          </span>
                        </p>
                      </div>
                      {alloc.overAllGrade && (
                        <Badge variant="purple" size="sm">
                          Grade {alloc.overAllGrade}
                        </Badge>
                      )}
                    </div>

                    {/* Progress bar */}
                    <div className="mt-2.5">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                        <span>Progress</span>
                        <span className="font-semibold text-slate-700">
                          {formatPercent(alloc.progressPercentage)}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-brand-600 h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(
                              100,
                              Number(alloc.progressPercentage) || 0
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Tasks */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {isStudent ? 'My Project Tasks' : 'Recent Project Tasks'}
                </h2>
                <p className="text-xs text-slate-500">
                  {isStudent
                    ? 'Deliverables assigned to your project'
                    : 'Latest assigned deliverables and status'}
                </p>
              </div>
              <Link
                to="/tasks"
                className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentTasks.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">
                {isStudent ? 'No tasks have been assigned to your project yet.' : 'No tasks created yet.'}
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentTasks.map((t) => (
                  <div key={t.taskId} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {t.taskTitle}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Due: {formatDate(t.taskDueDate)} • Assigned:{' '}
                        {formatDate(t.taskAssignedDate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {t.taskPriorityName && (
                        <Badge size="sm" variant="warning">
                          {t.taskPriorityName}
                        </Badge>
                      )}
                      <Badge size="sm" variant="primary">
                        {t.taskStatusName || 'Pending'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3-Phase Evaluation Modal */}
      <ProjectEvaluationModal
        isOpen={isEvalModalOpen}
        onClose={() => setIsEvalModalOpen(false)}
        allocation={evaluatingAllocation}
        onUpdated={handleAllocationUpdated}
      />
    </div>
  );
}


