import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Users,
  Mail,
  Phone,
  Shield,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { userService } from '../../api/userService';
import { userTypeService } from '../../api/userTypeService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';

export default function UserListPage() {
  const { hasRole } = useAuth();
  const toast = useToast();
  const isAdmin = hasRole(['Admin']);

  const [users, setUsers] = useState([]);
  const [userTypes, setUserTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    userTypeId: '',
    fullName: '',
    userCode: '',
    email: '',
    password: '',
    mobileNumber: '',
    profilePicturePath: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    isActive: true,
    isDeleted: false,
  });
  const [errors, setErrors] = useState({});

  // Delete dialog state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [uRes, utRes] = await Promise.allSettled([
        userService.getAll(),
        userTypeService.getAll(),
      ]);

      if (uRes.status === 'fulfilled') setUsers(uRes.value);
      if (utRes.status === 'fulfilled') setUserTypes(utRes.value);
    } catch (err) {
      toast.error(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({
      userTypeId: userTypes[0]?.userTypeId || '',
      fullName: '',
      userCode: '',
      email: '',
      password: '',
      mobileNumber: '',
      profilePicturePath: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
      isActive: true,
      isDeleted: false,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u) => {
    setEditingUser(u);
    setFormData({
      userTypeId: u.userTypeId,
      fullName: u.fullName,
      userCode: u.userCode || '',
      email: u.email,
      password: '', // Kept empty unless changed
      mobileNumber: u.mobileNumber || '',
      profilePicturePath: u.profilePicturePath || '',
      isActive: u.isActive,
      isDeleted: u.isDeleted || false,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!formData.userTypeId) errs.userTypeId = 'User Type is required';

    if (!formData.fullName.trim()) {
      errs.fullName = 'Full Name is required';
    } else if (/\d/.test(formData.fullName)) {
      errs.fullName = 'Full Name cannot contain numbers';
    } else if (formData.fullName.length > 100) {
      errs.fullName = 'Full Name cannot exceed 100 characters';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Valid email is required';
    }

    // Password validation
    if (!editingUser) {
      if (!formData.password) {
        errs.password = 'Password is required';
      } else if (formData.password.length < 6) {
        errs.password = 'Password must be at least 6 characters';
      }
    } else if (formData.password && formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (!formData.mobileNumber.trim()) {
      errs.mobileNumber = 'Mobile number is required';
    } else if (!/^[0-9+\-\s]{7,15}$/.test(formData.mobileNumber)) {
      errs.mobileNumber = 'Invalid phone number format';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const payload = {
      userTypeId: Number(formData.userTypeId),
      fullName: formData.fullName.trim(),
      userCode: formData.userCode ? formData.userCode.trim() : null,
      email: formData.email.trim(),
      password: formData.password || (editingUser ? 'Default123!' : ''),
      mobileNumber: formData.mobileNumber.trim(),
      profilePicturePath: formData.profilePicturePath || 'default.png',
      isActive: Boolean(formData.isActive),
      isDeleted: Boolean(formData.isDeleted),
    };

    try {
      if (editingUser) {
        await userService.update(editingUser.userId, payload);
        toast.success('User updated successfully');
      } else {
        await userService.create(payload);
        toast.success('User registered successfully');
      }
      setIsModalOpen(false);
      loadData();
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
      await userService.delete(deleteTarget.userId);
      toast.success('User deleted successfully');
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      header: 'User',
      accessor: 'fullName',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
            {row.fullName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <span className="font-semibold text-slate-900 block leading-tight">
              {row.fullName}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {row.userCode || `ID: ${row.userId}`}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Role / Type',
      accessor: 'userTypeName',
      render: (row) => {
        const type = row.userTypeName || 'User';
        const isAdm = type.toLowerCase().includes('admin');
        const isFac = type.toLowerCase().includes('faculty');
        return (
          <Badge variant={isAdm ? 'danger' : isFac ? 'purple' : 'primary'} size="sm">
            {type}
          </Badge>
        );
      },
    },
    {
      header: 'Contact Info',
      accessor: 'email',
      render: (row) => (
        <div className="text-xs space-y-0.5">
          <div className="flex items-center gap-1.5 text-slate-600">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span>{row.email}</span>
          </div>
          {row.mobileNumber && (
            <div className="flex items-center gap-1.5 text-slate-500">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{row.mobileNumber}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'isActive',
      className: 'w-24 text-center',
      render: (row) =>
        row.isActive ? (
          <Badge variant="success" size="sm">
            Active
          </Badge>
        ) : (
          <Badge variant="default" size="sm">
            Inactive
          </Badge>
        ),
    },
    ...(isAdmin
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
                  title="Edit User"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteTarget(row)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Delete User"
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
            <Users className="w-6 h-6 text-brand-600" />
            Users Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage student, faculty guide, and administrative system accounts
          </p>
        </div>

        {isAdmin && (
          <Button
            variant="primary"
            icon={Plus}
            size="md"
            onClick={handleOpenCreate}
          >
            Add New User
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        searchPlaceholder="Search users by name, email, or code..."
      />

      {/* User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Edit User Details' : 'Create New User Account'}
        subtitle="Manage credentials, assigned user category, and profile details"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              required
              placeholder="e.g. John Doe"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              error={errors.fullName}
            />

            <Select
              label="User Category / Type"
              required
              value={formData.userTypeId}
              onChange={(e) =>
                setFormData({ ...formData, userTypeId: e.target.value })
              }
              options={userTypes.map((ut) => ({
                value: ut.userTypeId,
                label: ut.userTypeName,
              }))}
              error={errors.userTypeId}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              required
              placeholder="john@spms.edu"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              error={errors.email}
            />

            <Input
              label={editingUser ? 'Password (leave blank to keep current)' : 'Password'}
              type="password"
              required={!editingUser}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              error={errors.password}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Mobile Number"
              required
              placeholder="+1-555-0199"
              value={formData.mobileNumber}
              onChange={(e) =>
                setFormData({ ...formData, mobileNumber: e.target.value })
              }
              error={errors.mobileNumber}
            />

            <Input
              label="User / Student Code"
              placeholder="e.g. STU-2026-001"
              value={formData.userCode}
              onChange={(e) =>
                setFormData({ ...formData, userCode: e.target.value })
              }
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-4 h-4"
              />
              <span>Account Active</span>
            </label>
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
              {editingUser ? 'Save User' : 'Create User'}
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
        title="Delete User Account?"
        message={`Are you sure you want to delete "${deleteTarget?.fullName}"? This action cannot be undone.`}
      />
    </div>
  );
}

