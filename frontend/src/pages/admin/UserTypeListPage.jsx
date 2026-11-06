import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, UserCheck } from 'lucide-react';
import { userTypeService } from '../../api/userTypeService';
import { useToast } from '../../context/ToastContext';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';

export default function UserTypeListPage() {
  const toast = useToast();
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [formData, setFormData] = useState({ userTypeName: '', description: '' });
  const [errors, setErrors] = useState({});

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    setLoading(true);
    try {
      const data = await userTypeService.getAll();
      setTypes(data);
    } catch (err) {
      toast.error(err.message || 'Failed to load user types');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingType(null);
    setFormData({ userTypeName: '', description: '' });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t) => {
    setEditingType(t);
    setFormData({
      userTypeName: t.userTypeName,
      description: t.description || '',
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!formData.userTypeName.trim()) {
      errs.userTypeName = 'User type name is required';
    } else if (formData.userTypeName.length > 50) {
      errs.userTypeName = 'Name cannot exceed 50 characters';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const payload = {
      userTypeName: formData.userTypeName.trim(),
      description: formData.description ? formData.description.trim() : null,
    };

    try {
      if (editingType) {
        await userTypeService.update(editingType.userTypeId, payload);
        toast.success('User type updated successfully');
      } else {
        await userTypeService.create(payload);
        toast.success('User type created successfully');
      }
      setIsModalOpen(false);
      fetchTypes();
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
      await userTypeService.delete(deleteTarget.userTypeId);
      toast.success('User type deleted successfully');
      setDeleteTarget(null);
      fetchTypes();
    } catch (err) {
      toast.error(err.message || 'Failed to delete user type');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      header: 'ID',
      accessor: 'userTypeId',
      className: 'w-16 font-mono text-xs text-slate-500',
    },
    {
      header: 'User Type Name',
      accessor: 'userTypeName',
      render: (row) => (
        <span className="font-semibold text-slate-900">{row.userTypeName}</span>
      ),
    },
    {
      header: 'Description',
      accessor: 'description',
      render: (row) => (
        <span className="text-xs text-slate-600">{row.description || '—'}</span>
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
            title="Edit User Type"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
            title="Delete User Type"
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
            <UserCheck className="w-6 h-6 text-brand-600" />
            User Types
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure system user categorizations (e.g., Student, Faculty, Admin)
          </p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          size="md"
          onClick={handleOpenCreate}
        >
          Add User Type
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={types}
        loading={loading}
        searchPlaceholder="Search user types..."
      />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingType ? 'Edit User Type' : 'Create User Type'}
        subtitle="Manage user classification in SPMS"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Type Name"
            required
            placeholder="e.g. Student, Faculty, Admin, Evaluator"
            value={formData.userTypeName}
            onChange={(e) =>
              setFormData({ ...formData, userTypeName: e.target.value })
            }
            error={errors.userTypeName}
          />

          <Textarea
            label="Description"
            rows={3}
            placeholder="Describe permissions and role associated with this type..."
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
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
              {editingType ? 'Update Type' : 'Create Type'}
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
        title="Delete User Type?"
        message={`Are you sure you want to remove "${deleteTarget?.userTypeName}"?`}
      />
    </div>
  );
}

