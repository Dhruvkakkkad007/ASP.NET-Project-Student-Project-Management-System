import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Flag } from 'lucide-react';
import { taskPriorityService } from '../../api/taskPriorityService';
import { useToast } from '../../context/ToastContext';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';

export default function TaskPriorityListPage() {
  const toast = useToast();
  const [priorities, setPriorities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingPriority, setEditingPriority] = useState(null);
  const [formData, setFormData] = useState({
    taskPriorityName: '',
    taskPriorityCssClass: 'badge-danger',
  });
  const [errors, setErrors] = useState({});

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchPriorities();
  }, []);

  const fetchPriorities = async () => {
    setLoading(true);
    try {
      const data = await taskPriorityService.getAll();
      setPriorities(data);
    } catch (err) {
      toast.error(err.message || 'Failed to load task priorities');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingPriority(null);
    setFormData({ taskPriorityName: '', taskPriorityCssClass: 'badge-danger' });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingPriority(p);
    setFormData({
      taskPriorityName: p.taskPriorityName,
      taskPriorityCssClass: p.taskPriorityCssClass || '',
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!formData.taskPriorityName.trim()) {
      errs.taskPriorityName = 'Priority name is required';
    } else if (formData.taskPriorityName.length > 50) {
      errs.taskPriorityName = 'Name cannot exceed 50 characters';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const payload = {
      taskPriorityName: formData.taskPriorityName.trim(),
      taskPriorityCssClass: formData.taskPriorityCssClass ? formData.taskPriorityCssClass.trim() : null,
    };

    try {
      if (editingPriority) {
        await taskPriorityService.update(editingPriority.taskPriorityId, payload);
        toast.success('Task priority updated successfully');
      } else {
        await taskPriorityService.create(payload);
        toast.success('Task priority created successfully');
      }
      setIsModalOpen(false);
      fetchPriorities();
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
      await taskPriorityService.delete(deleteTarget.taskPriorityId);
      toast.success('Task priority deleted successfully');
      setDeleteTarget(null);
      fetchPriorities();
    } catch (err) {
      toast.error(err.message || 'Failed to delete priority');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      header: 'ID',
      accessor: 'taskPriorityId',
      className: 'w-16 font-mono text-xs text-slate-500',
    },
    {
      header: 'Priority Name',
      accessor: 'taskPriorityName',
      render: (row) => (
        <span className="font-semibold text-slate-900">{row.taskPriorityName}</span>
      ),
    },
    {
      header: 'Badge Preview',
      render: (row) => {
        const isHigh = row.taskPriorityName?.toLowerCase().includes('high');
        return (
          <Badge variant={isHigh ? 'danger' : 'warning'}>
            {row.taskPriorityName}
          </Badge>
        );
      },
    },
    {
      header: 'CSS Class Tag',
      accessor: 'taskPriorityCssClass',
      render: (row) => (
        <code className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-mono">
          {row.taskPriorityCssClass || '—'}
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
            title="Edit Priority"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
            title="Delete Priority"
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
            <Flag className="w-6 h-6 text-brand-600" />
            Task Priorities
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage urgency levels for project milestone assignments (e.g. Critical, High, Medium, Low)
          </p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          size="md"
          onClick={handleOpenCreate}
        >
          Add Priority
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={priorities}
        loading={loading}
        searchPlaceholder="Search task priorities..."
      />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPriority ? 'Edit Task Priority' : 'Create Task Priority'}
        subtitle="Configure priority urgency and CSS tag"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Priority Name"
            required
            placeholder="e.g. Critical, High, Medium, Low"
            value={formData.taskPriorityName}
            onChange={(e) =>
              setFormData({ ...formData, taskPriorityName: e.target.value })
            }
            error={errors.taskPriorityName}
          />

          <Input
            label="Badge CSS Class (optional)"
            placeholder="e.g. badge-danger, badge-warning"
            value={formData.taskPriorityCssClass}
            onChange={(e) =>
              setFormData({ ...formData, taskPriorityCssClass: e.target.value })
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
              {editingPriority ? 'Update Priority' : 'Create Priority'}
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
        title="Delete Priority?"
        message={`Are you sure you want to remove priority "${deleteTarget?.taskPriorityName}"?`}
      />
    </div>
  );
}

