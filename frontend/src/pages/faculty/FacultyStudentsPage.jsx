import React, { useState, useEffect } from 'react';
import {
  Users,
  Award,
  Clock,
  CheckCircle2,
  FolderKanban,
  RotateCw,
  Search,
  Star,
  ExternalLink,
} from 'lucide-react';
import { projectAllocationService } from '../../api/projectAllocationService';
import { projectTaskService } from '../../api/projectTaskService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ProjectEvaluationModal from '../../components/faculty/ProjectEvaluationModal';
import { formatDate, formatPercent, allocationProjectLabel } from '../../utils/formatters';
import { allocationBelongsToFaculty } from '../../utils/identity';

export default function FacultyStudentsPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState(null);
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
  const [showAllAllocations, setShowAllAllocations] = useState(false);

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
      toast.error(err.message || 'Failed to load allocated students');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Filter allocations to only those belonging to this faculty
  const myAllocations = React.useMemo(() => {
    if (showAllAllocations) return allocations;

    return allocations.filter((alloc) => allocationBelongsToFaculty(alloc, user));
  }, [allocations, user, showAllAllocations]);

  // Statistics
  const stats = React.useMemo(() => {
    const total = myAllocations.length;
    const graded = myAllocations.filter((a) => !!a.overAllGrade).length;
    const pending = total - graded;
    const totalProgress = myAllocations.reduce(
      (acc, curr) => acc + (Number(curr.progressPercentage) || 0),
      0
    );
    const avgProg = total > 0 ? Math.round(totalProgress / total) : 0;

    return { total, graded, pending, avgProg };
  }, [myAllocations]);

  const handleOpenEvaluation = (alloc) => {
    setSelectedAllocation(alloc);
    setIsEvaluationModalOpen(true);
  };

  const handleAllocationUpdated = (updatedAlloc) => {
    if (updatedAlloc && updatedAlloc.projectAllocationId) {
      setAllocations((prev) =>
        prev.map((item) =>
          item.projectAllocationId === updatedAlloc.projectAllocationId
            ? { ...item, ...updatedAlloc }
            : item
        )
      );
    }
    loadAllocations(true);
  };

  const columns = [
    {
      header: 'Student Name',
      accessor: 'studentFullName',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 block text-xs">
            {row.studentFullName || `Student ID #${row.studentId}`}
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            ID: {row.studentId}
          </span>
        </div>
      ),
    },
    {
      header: 'Assigned Project',
      accessor: 'projectTitle',
      render: (row) => (
        <span className="font-semibold text-slate-800 text-xs block">
          {allocationProjectLabel(row)}
        </span>
      ),
    },
    {
      header: 'Project Timeline',
      accessor: 'projectStartDate',
      render: (row) => (
        <span className="text-xs text-slate-500">
          {formatDate(row.projectStartDate)} → {formatDate(row.projectEndDate)}
        </span>
      ),
    },
    {
      header: 'Progress',
      accessor: 'progressPercentage',
      render: (row) => (
        <div className="w-28">
          <div className="flex justify-between text-[11px] mb-1">
            <span className="font-semibold text-slate-700">
              {formatPercent(row.progressPercentage)}
            </span>
            <span className="text-slate-400">
              {`${row.totalCompletedTasks || 0}/${row.totalTasksGiven || 0}`}
            </span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-brand-600 h-full rounded-full"
              style={{
                width: `${Math.min(100, Number(row.progressPercentage) || 0)}%`,
              }}
            />
          </div>
        </div>
      ),
    },
    {
      header: 'Overall Grade',
      accessor: 'overAllGrade',
      className: 'w-24 text-center',
      render: (row) =>
        row.overAllGrade ? (
          <Badge variant="purple" size="sm">
            {row.overAllGrade}
          </Badge>
        ) : (
          <Badge variant="warning" size="sm">
            Pending
          </Badge>
        ),
    },
    {
      header: 'Action',
      className: 'w-32 text-right',
      sortable: false,
      render: (row) => (
        <Button
          size="sm"
          variant="primary"
          icon={Star}
          onClick={() => handleOpenEvaluation(row)}
        >
          Evaluate
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-600" />
            My Allocated Students
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            View students assigned under your mentorship, track milestone tasks, and grade projects
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAllAllocations(!showAllAllocations)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
          >
            {showAllAllocations ? 'Show Only My Students' : 'Show All System Students'}
          </button>

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

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Allocated Students</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Evaluated Projects</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.graded}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Pending Evaluation</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.pending}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Avg. Project Progress</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.avgProg}%</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500 text-white flex items-center justify-center">
            <FolderKanban className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Students Table */}
      <DataTable
        columns={columns}
        data={myAllocations}
        loading={loading}
        searchPlaceholder="Search allocated student or project title..."
      />

      {/* 3-Phase Evaluation Modal */}
      <ProjectEvaluationModal
        isOpen={isEvaluationModalOpen}
        onClose={() => setIsEvaluationModalOpen(false)}
        allocation={selectedAllocation}
        onUpdated={handleAllocationUpdated}
      />
    </div>
  );
}

