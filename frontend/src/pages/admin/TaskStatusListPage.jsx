import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';
import { taskStatusService } from '../../api/taskStatusService';
import { useToast } from '../../context/ToastContext';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';

export default function TaskStatusListPage() {
  const toast = useToast();
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingStatus, setEditingStatus] = useState(null);
  const [formData, setFormData] = useState({
    taskStatusName: '',
    taskStatusCssClass: 'badge-primary',
  });
  const [errors, setErrors] = useState({});

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchStatuses();
  }, []);

  const fetchStatuses = async () => {
    setLoading(true);
    try {
      const data = await taskStatusService.getAll();
      setStatuses(data);
    } catch (err) {
      toast.error(err.message || 'Failed to load task statuses');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingStatus(null);
    setFormData({ taskStatusName: '', taskStatusCssClass: 'badge-primary' });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s) => {
    setEditingStatus(s);
    setFormData({
      taskStatusName: s.taskStatusName,
      taskStatusCssClass: s.taskStatusCssClass || '',
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!formData.taskStatusName.trim()) {
      errs.taskStatusName = 'Status name is required';
    } else if (formData.taskStatusName.length > 50) {
      errs.taskStatusName = 'Status name cannot exceed 50 characters';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const payload = {
      taskStatusName: formData.taskStatusName.trim(),
      taskStatusCssClass: formData.taskStatusCssClass ? formData.taskStatusCssClass.trim() : null,
    };

    try {
      if (editingStatus) {
        await taskStatusService.update(editingStatus.taskStatusId, payload);
        toast.success('Task status updated successfully');
      } else {
        await taskStatusService.create(payload);
        toast.success('Task status created successfully');
      }
      setIsModalOpen(false);
      fetchStatuses();
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
      await taskStatusService.delete(deleteTarget.taskStatusId);
      toast.success('Task status deleted successfully');
      setDeleteTarget(null);
      fetchStatuses();
    } catch (err) {
      toast.error(err.message || 'Failed to delete task status');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      header: 'ID',
      accessor: 'taskStatusId',
      className: 'w-16 font-mono text-xs text-slate-500',
    },
    {
      header: 'Status Name',
      accessor: 'taskStatusName',
      render: (row) => (
        <span className="font-semibold text-slate-900">{row.taskStatusName}</span>
      ),
    },
    {
      header: 'Badge Preview',
      render: (row) => <Badge variant="primary">{row.taskStatusName}</Badge>,
    },
    {
      header: 'CSS Class Tag',
      accessor: 'taskStatusCssClass',
      render: (row) => (
        <code className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-mono">
          {row.taskStatusCssClass || '—'}
        </code>
      ),
    },
    {
      header: 'Actions',
      className: 'w-24 text-right',
      sortable: false,
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition"
            title="Edit Status"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
            title="Delete Status"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Tag className="w-6 h-6 text-brand-600" />
            Task Statuses
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage workflow stage names (e.g., Pending, In Progress, Submitted, Completed)
          </p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          size="md"
          onClick={handleOpenCreate}
        >
          Add Status
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={statuses}
        loading={loading}
        searchPlaceholder="Search task statuses..."
      />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStatus ? 'Edit Task Status' : 'Create Task Status'}
        subtitle="Configure status name and style class"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Status Name"
            required
            placeholder="e.g. In Progress, Completed, Under Review"
            value={formData.taskStatusName}
            onChange={(e) =>
              setFormData({ ...formData, taskStatusName: e.target.value })
            }
            error={errors.taskStatusName}
          />

          <Input
            label="Badge CSS Class (optional)"
            placeholder="e.g. badge-success, badge-warning"
            value={formData.taskStatusCssClass}
            onChange={(e) =>
              setFormData({ ...formData, taskStatusCssClass: e.target.value })
            }
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
              {editingStatus ? 'Update Status' : 'Create Status'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Status?"
        message={`Are you sure you want to remove status "${deleteTarget?.taskStatusName}"?`}
      />
    </div>
  );
}

