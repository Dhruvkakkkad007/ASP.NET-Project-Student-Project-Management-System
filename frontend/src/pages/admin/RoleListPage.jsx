import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Shield } from 'lucide-react';
import { roleService } from '../../api/roleService';
import { useToast } from '../../context/ToastContext';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';

export default function RoleListPage() {
  const toast = useToast();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({ roleName: '', description: '' });
  const [errors, setErrors] = useState({});

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const data = await roleService.getAll();
      setRoles(data);
    } catch (err) {
      toast.error(err.message || 'Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingRole(null);
    setFormData({ roleName: '', description: '' });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (r) => {
    setEditingRole(r);
    setFormData({
      roleName: r.roleName,
      description: r.description || '',
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!formData.roleName.trim()) {
      errs.roleName = 'Role name is required';
    } else if (formData.roleName.length > 50) {
      errs.roleName = 'Role name cannot exceed 50 characters';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const payload = {
      roleName: formData.roleName.trim(),
      description: formData.description ? formData.description.trim() : null,
    };

    try {
      if (editingRole) {
        await roleService.update(editingRole.roleId, payload);
        toast.success('Role updated successfully');
      } else {
        await roleService.create(payload);
        toast.success('Role created successfully');
      }
      setIsModalOpen(false);
      fetchRoles();
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
      await roleService.delete(deleteTarget.roleId);
      toast.success('Role deleted successfully');
      setDeleteTarget(null);
      fetchRoles();
    } catch (err) {
      toast.error(err.message || 'Failed to delete role');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      header: 'ID',
      accessor: 'roleId',
      className: 'w-16 font-mono text-xs text-slate-500',
    },
    {
      header: 'Role Name',
      accessor: 'roleName',
      render: (row) => (
        <span className="font-semibold text-slate-900">{row.roleName}</span>
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
            title="Edit Role"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
            title="Delete Role"
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
            <Shield className="w-6 h-6 text-brand-600" />
            Security Roles
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Define system roles for access policy enforcement
          </p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          size="md"
          onClick={handleOpenCreate}
        >
          Add Role
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={roles}
        loading={loading}
        searchPlaceholder="Search roles..."
      />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRole ? 'Edit Role' : 'Create New Role'}
        subtitle="Configure role identifier and scope description"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Role Name"
            required
            placeholder="e.g. Admin, Faculty, Reviewer"
            value={formData.roleName}
            onChange={(e) =>
              setFormData({ ...formData, roleName: e.target.value })
            }
            error={errors.roleName}
          />

          <Textarea
            label="Description"
            rows={3}
            placeholder="Scope of permissions granted to this role..."
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
              {editingRole ? 'Update Role' : 'Create Role'}
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
        title="Delete Role?"
        message={`Are you sure you want to remove role "${deleteTarget?.roleName}"?`}
      />
    </div>
  );
}

