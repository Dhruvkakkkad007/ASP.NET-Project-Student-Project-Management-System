import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ShieldAlert } from 'lucide-react';
import { userRoleService } from '../../api/userRoleService';
import { userService } from '../../api/userService';
import { roleService } from '../../api/roleService';
import { useToast } from '../../context/ToastContext';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';

export default function UserRoleListPage() {
  const toast = useToast();
  const [userRoles, setUserRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingMapping, setEditingMapping] = useState(null);
  const [formData, setFormData] = useState({ userId: '', roleId: '' });
  const [errors, setErrors] = useState({});

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [urRes, uRes, rRes] = await Promise.allSettled([
        userRoleService.getAll(),
        userService.getAll(),
        roleService.getAll(),
      ]);

      if (urRes.status === 'fulfilled') setUserRoles(urRes.value);
      if (uRes.status === 'fulfilled') setUsers(uRes.value);
      if (rRes.status === 'fulfilled') setRoles(rRes.value);
    } catch (err) {
      toast.error(err.message || 'Failed to load user-role mappings');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingMapping(null);
    setFormData({
      userId: users[0]?.userId || '',
      roleId: roles[0]?.roleId || '',
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ur) => {
    setEditingMapping(ur);
    setFormData({
      userId: ur.userId,
      roleId: ur.roleId,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!formData.userId) errs.userId = 'User selection is required';
    if (!formData.roleId) errs.roleId = 'Role selection is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const payload = {
      userId: Number(formData.userId),
      roleId: Number(formData.roleId),
    };

    try {
      if (editingMapping) {
        await userRoleService.update(editingMapping.userRoleId, payload);
        toast.success('User role mapping updated');
      } else {
        await userRoleService.create(payload);
        toast.success('Role assigned to user');
      }
      setIsModalOpen(false);
      loadAll();
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
      await userRoleService.delete(deleteTarget.userRoleId);
      toast.success('User role mapping removed');
      setDeleteTarget(null);
      loadAll();
    } catch (err) {
      toast.error(err.message || 'Failed to remove role mapping');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      header: 'ID',
      accessor: 'userRoleId',
      className: 'w-16 font-mono text-xs text-slate-500',
    },
    {
      header: 'User Full Name',
      accessor: 'userFullName',
      render: (row) => (
        <span className="font-semibold text-slate-900">
          {row.userFullName || `User #${row.userId}`}
        </span>
      ),
    },
    {
      header: 'Assigned Role',
      accessor: 'roleName',
      render: (row) => (
        <Badge variant="purple" size="sm">
          {row.roleName || `Role #${row.roleId}`}
        </Badge>
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
            title="Edit Mapping"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
            title="Delete Mapping"
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
            <ShieldAlert className="w-6 h-6 text-brand-600" />
            User Role Mappings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Assign security roles and permissions to specific user accounts
          </p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          size="md"
          onClick={handleOpenCreate}
        >
          Assign Role
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={userRoles}
        loading={loading}
        searchPlaceholder="Search mappings by user or role..."
      />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMapping ? 'Edit Role Mapping' : 'Assign Role to User'}
        subtitle="Associate a security role with a user account"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="User"
            required
            value={formData.userId}
            onChange={(e) =>
              setFormData({ ...formData, userId: e.target.value })
            }
            options={users.map((u) => ({
              value: u.userId,
              label: `${u.fullName} (${u.email})`,
            }))}
            error={errors.userId}
          />

          <Select
            label="Role"
            required
            value={formData.roleId}
            onChange={(e) =>
              setFormData({ ...formData, roleId: e.target.value })
            }
            options={roles.map((r) => ({
              value: r.roleId,
              label: r.roleName,
            }))}
            error={errors.roleId}
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
              {editingMapping ? 'Update Mapping' : 'Assign Role'}
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
        title="Remove Role Assignment?"
        message="Are you sure you want to revoke this role mapping from the user?"
      />
    </div>
  );
}

