import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  GitFork,
  User,
  Award,
  Calendar,
  RotateCw,
  Users,
} from 'lucide-react';
import { projectAllocationService } from '../../api/projectAllocationService';
import { projectService } from '../../api/projectService';
import { userService } from '../../api/userService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import { formatDate, toInputDate, formatPercent, allocationProjectLabel } from '../../utils/formatters';
import { filterAllocationsForUser } from '../../utils/identity';

export default function AllocationListPage({ adminView = false }) {
  const { user, hasRole } = useAuth();
  const toast = useToast();
  const canManage = hasRole(['Admin']);
  const isAdmin = hasRole(['Admin']);
  const isFaculty = hasRole(['Faculty']);
  const isStudent = hasRole(['Student']);

  const [allocations, setAllocations] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter toggle in modal
  const [showAllUsersForStudent, setShowAllUsersForStudent] = useState(false);
  const [showAllUsersForFaculty, setShowAllUsersForFaculty] = useState(false);

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState(null);
  const [formData, setFormData] = useState({
    projectId: '',
    studentId: '',
    facultyId: '',
    assignedDate: toInputDate(new Date()),
    projectStartDate: toInputDate(new Date()),
    projectEndDate: toInputDate(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)),
  });
  const [errors, setErrors] = useState({});

  // Delete dialog state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadAllData();
  }, [user?.userId, isAdmin, isFaculty, isStudent]);

  const loadAllData = async (silent = false) => {
    if (!silent) setLoading(true);
    setRefreshing(true);
    try {
      const [allocRes, projRes, userRes] = await Promise.allSettled([
        projectAllocationService.getAll(),
        projectService.getAll(),
        userService.getAll(),
      ]);

      if (allocRes.status === 'fulfilled') {
        const allAllocs = allocRes.value || [];
        setAllocations(
          filterAllocationsForUser(allAllocs, user, { isAdmin, isFaculty, isStudent })
        );
      }
      if (projRes.status === 'fulfilled') setProjects(projRes.value);
      if (userRes.status === 'fulfilled') setUsers(userRes.value);
    } catch (err) {
      toast.error(err.message || 'Failed to load allocation data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Open modal with fresh user and project lists
  const handleOpenCreate = async () => {
    setEditingAllocation(null);
    setErrors({});
    setIsModalOpen(true);

    // Refresh immediately to pick up any newly created users or roles
    await loadAllData(true);

    setFormData({
      projectId: '',
      studentId: '',
      facultyId: '',
      assignedDate: toInputDate(new Date()),
      projectStartDate: toInputDate(new Date()),
      projectEndDate: toInputDate(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)),
    });
  };

  const handleOpenEdit = async (alloc) => {
    setEditingAllocation(alloc);
    setErrors({});
    setIsModalOpen(true);

    await loadAllData(true);

    setFormData({
      projectId: alloc.projectId || '',
      studentId: alloc.studentId,
      facultyId: alloc.facultyId,
      assignedDate: toInputDate(alloc.assignedDate),
      projectStartDate: toInputDate(alloc.projectStartDate),
      projectEndDate: toInputDate(alloc.projectEndDate),
    });
  };

  const studentOptions = React.useMemo(() => {
    const list = (users || []).filter((u) =>
      (u.userTypeName || '').toLowerCase().includes('student')
    );
    const source = list.length > 0 ? list : users || [];
    return source.map((u) => ({
      value: u.userId,
      label: `${u.fullName} (${u.email})`,
    }));
  }, [users]);

  const facultyOptions = React.useMemo(() => {
    const list = (users || []).filter((u) => {
      const type = (u.userTypeName || '').toLowerCase();
      return type.includes('faculty') || type.includes('mentor') || type.includes('professor');
    });
    const source = list.length > 0 ? list : users || [];
    return source.map((u) => ({
      value: u.userId,
      label: `${u.fullName} (${u.email})`,
    }));
  }, [users]);

  const validate = () => {
    const errs = {};
    if (!formData.studentId) errs.studentId = 'Student selection is required';
    if (!formData.facultyId) errs.facultyId = 'Faculty supervisor is required';
    if (!formData.assignedDate) errs.assignedDate = 'Assigned date is required';
    if (!formData.projectStartDate) errs.projectStartDate = 'Start date is required';
    if (!formData.projectEndDate) {
      errs.projectEndDate = 'End date is required';
    } else if (new Date(formData.projectEndDate) < new Date(formData.projectStartDate)) {
      errs.projectEndDate = 'End date must be on or after start date';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const payload = {
      studentId: Number(formData.studentId),
      facultyId: Number(formData.facultyId),
      assignedDate: new Date(formData.assignedDate).toISOString(),
      projectStartDate: new Date(formData.projectStartDate).toISOString(),
      projectEndDate: new Date(formData.projectEndDate).toISOString(),
      totalTasksGiven: editingAllocation?.totalTasksGiven || 0,
      totalCompletedTasks: editingAllocation?.totalCompletedTasks || 0,
      progressPercentage: editingAllocation?.progressPercentage || 0,
      overAllGrade: editingAllocation?.overAllGrade || null,
    };

    if (formData.projectId) {
      payload.projectId = Number(formData.projectId);
    }

    try {
      if (editingAllocation) {
        await projectAllocationService.update(
          editingAllocation.projectAllocationId,
          payload
        );
        toast.success('Project allocation updated successfully');
      } else {
        await projectAllocationService.create(payload);
        toast.success(
          formData.projectId
            ? 'Student assigned to faculty and project successfully'
            : 'Student assigned to faculty. They can now select a project.'
        );
      }
      setIsModalOpen(false);
      loadAllData();
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
      await projectAllocationService.delete(deleteTarget.projectAllocationId);
      toast.success('Allocation deleted successfully');
      setDeleteTarget(null);
      loadAllData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete allocation');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      header: 'ID',
      accessor: 'projectAllocationId',
      className: 'w-16 font-mono text-xs text-slate-500',
    },
    {
      header: 'Project',
      accessor: 'projectTitle',
      render: (row) => (
        <span className="font-semibold text-slate-900 block">
          {allocationProjectLabel(row)}
        </span>
      ),
    },
    {
      header: 'Student',
      accessor: 'studentFullName',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-700">
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-medium">
            {row.studentFullName || `Student ID: ${row.studentId}`}
          </span>
        </div>
      ),
    },
    {
      header: 'Faculty Guide',
      accessor: 'facultyFullName',
      render: (row) => (
        <span className="text-xs text-slate-700 font-medium">
          {row.facultyFullName || `Faculty ID: ${row.facultyId}`}
        </span>
      ),
    },
    {
      header: 'Timeline',
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
      header: 'Grade',
      accessor: 'overAllGrade',
      className: 'w-20 text-center',
      render: (row) =>
        row.overAllGrade ? (
          <Badge variant="purple" size="sm">
            {row.overAllGrade}
          </Badge>
        ) : (
          <span className="text-slate-300 text-xs">—</span>
        ),
    },
    ...(canManage
      ? [
          {
            header: 'Actions',
            className: 'w-24 text-right',
            sortable: false,
            render: (row) => (
              <div className="flex items-center justify-end gap-1">
                <button
                  onClick={() => handleOpenEdit(row)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition"
                  title="Edit Allocation"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteTarget(row)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Delete Allocation"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <GitFork className="w-6 h-6 text-brand-600" />
            Project Allocations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pair a student with a faculty guide. Project topic can be chosen later by the student.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="md"
            icon={RotateCw}
            loading={refreshing}
            onClick={() => loadAllData()}
            title="Refresh allocations, projects, and users"
          >
            Refresh
          </Button>

          {canManage && (
            <Button
              variant="primary"
              icon={Plus}
              size="md"
              onClick={handleOpenCreate}
            >
              Allocate Project
            </Button>
          )}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={allocations}
        loading={loading}
        searchPlaceholder="Search allocations by project, student, or faculty..."
      />

      {/* Allocation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAllocation ? 'Edit Project Allocation' : 'New Project Allocation'}
        subtitle="Assign a student to a faculty guide. Project topic is optional — the student can select it later."
        size="lg"
      >
        <div className="mb-4 p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs text-slate-600">
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-brand-600" />
            <span>
              Available in Database:{' '}
              <strong className="text-slate-800">{users.length} Users</strong>,{' '}
              <strong className="text-slate-800">{projects.length} Projects</strong>
            </span>
          </span>
          <button
            type="button"
            onClick={() => loadAllData(true)}
            disabled={refreshing}
            className="text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1"
          >
            <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Sync Fresh Users</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Select Project"
              value={formData.projectId}
              onChange={(e) =>
                setFormData({ ...formData, projectId: e.target.value })
              }
              options={projects.map((p) => ({
                value: p.projectId,
                label: p.projectTitle,
              }))}
              placeholder="Optional — student can choose later"
              helperText="Leave empty if the student will pick their project."
              error={errors.projectId}
            />

            <Select
              label={`Student (${studentOptions.length} users)`}
              required
              value={formData.studentId}
              onChange={(e) =>
                setFormData({ ...formData, studentId: e.target.value })
              }
              options={studentOptions}
              placeholder="Select student"
              error={errors.studentId}
            />

            <Select
              label={`Faculty Guide (${facultyOptions.length} users)`}
              required
              value={formData.facultyId}
              onChange={(e) =>
                setFormData({ ...formData, facultyId: e.target.value })
              }
              options={facultyOptions}
              placeholder="Select faculty guide"
              error={errors.facultyId}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Assigned Date"
              type="date"
              required
              value={formData.assignedDate}
              onChange={(e) =>
                setFormData({ ...formData, assignedDate: e.target.value })
              }
              error={errors.assignedDate}
            />

            <Input
              label="Project Start Date"
              type="date"
              required
              value={formData.projectStartDate}
              onChange={(e) =>
                setFormData({ ...formData, projectStartDate: e.target.value })
              }
              error={errors.projectStartDate}
            />

            <Input
              label="Project End Date"
              type="date"
              required
              value={formData.projectEndDate}
              onChange={(e) =>
                setFormData({ ...formData, projectEndDate: e.target.value })
              }
              error={errors.projectEndDate}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {editingAllocation ? 'Update Allocation' : 'Create Allocation'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Allocation?"
        message="Are you sure you want to delete this allocation? This will remove the student assignment and associated task records."
      />
    </div>
  );
}
