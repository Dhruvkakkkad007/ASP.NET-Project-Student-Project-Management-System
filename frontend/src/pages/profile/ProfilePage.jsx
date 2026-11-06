import React, { useEffect, useRef, useState } from 'react';
import { UserCircle, Lock, Shield, Camera } from 'lucide-react';
import { userService } from '../../api/userService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import { resolveProfileImage } from '../../utils/profileImage';

export default function ProfilePage() {
  const { user, applyToken } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    userCode: '',
    userTypeName: '',
    profilePicturePath: '',
  });
  const [profileErrors, setProfileErrors] = useState({});

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  useEffect(() => {
    loadProfile();
  }, []);

  const fillProfile = (me) => {
    setProfile({
      fullName: me?.fullName || user?.fullName || '',
      email: me?.email || user?.email || '',
      mobileNumber: me?.mobileNumber || '',
      userCode: me?.userCode || '',
      userTypeName: me?.userTypeName || user?.role || '',
      profilePicturePath: me?.profilePicturePath || user?.profilePicturePath || '',
    });
  };

  const loadProfile = async () => {
    setLoading(true);
    try {
      let me = null;
      try {
        me = await userService.getMe();
      } catch {
        const id = user?.userId;
        if (id) me = await userService.getById(id);
      }
      fillProfile(me);
    } catch (err) {
      fillProfile(null);
      toast.error(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const validateProfile = () => {
    const errs = {};
    if (!profile.fullName.trim()) {
      errs.fullName = 'Full name is required';
    } else if (/\d/.test(profile.fullName)) {
      errs.fullName = 'Full name cannot contain digits';
    }
    if (!profile.mobileNumber.trim()) {
      errs.mobileNumber = 'Mobile number is required';
    } else if (!/^[0-9+\-\s]{7,15}$/.test(profile.mobileNumber.trim())) {
      errs.mobileNumber = 'Mobile number is invalid';
    }
    setProfileErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!validateProfile()) return;

    setSavingProfile(true);
    try {
      const result = await userService.updateMe({
        fullName: profile.fullName.trim(),
        mobileNumber: profile.mobileNumber.trim(),
      });
      if (result?.token) {
        applyToken(result.token);
      }
      if (result?.user) {
        setProfile((prev) => ({
          ...prev,
          fullName: result.user.fullName || prev.fullName,
          mobileNumber: result.user.mobileNumber || prev.mobileNumber,
          profilePicturePath: result.user.profilePicturePath || prev.profilePicturePath,
        }));
      }
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const validatePassword = () => {
    const errs = {};
    if (!passwords.currentPassword) {
      errs.currentPassword = 'Current password is required';
    }
    if (!passwords.newPassword) {
      errs.newPassword = 'New password is required';
    } else if (passwords.newPassword.length < 6) {
      errs.newPassword = 'New password must be at least 6 characters';
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    if (
      passwords.currentPassword &&
      passwords.newPassword &&
      passwords.currentPassword === passwords.newPassword
    ) {
      errs.newPassword = 'New password must be different from the current password';
    }
    setPasswordErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePhotoSelected = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file (JPG, PNG, WEBP, or GIF).');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Profile image must be 2 MB or smaller.');
      return;
    }

    setUploadingPhoto(true);
    try {
      const result = await userService.uploadPhoto(file);
      if (result?.token) {
        applyToken(result.token);
      }
      if (result?.user?.profilePicturePath) {
        setProfile((prev) => ({
          ...prev,
          profilePicturePath: result.user.profilePicturePath,
        }));
      }
      toast.success('Profile photo updated');
    } catch (err) {
      toast.error(err.message || 'Failed to upload profile photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    setSavingPassword(true);
    try {
      await userService.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordErrors({});
      toast.success('Password changed successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return <Loader text="Loading profile..." className="min-h-[50vh]" />;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">My Profile</h1>
        <p className="text-xs text-slate-500 mt-1">
          Update your details and change your password. Email and role stay the same.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <UserCircle className="w-5 h-5 text-brand-600" />
            <h2 className="text-sm font-bold text-slate-900">Profile details</h2>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="flex items-center gap-4 pb-2">
              <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-brand-200 bg-brand-50 flex items-center justify-center shrink-0">
                {resolveProfileImage(profile.profilePicturePath) ? (
                  <img
                    src={resolveProfileImage(profile.profilePicturePath)}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(ev) => {
                      ev.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-xl font-bold text-brand-700">
                    {(profile.fullName || profile.email || 'U').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-slate-700">Profile photo</p>
                <p className="text-[11px] text-slate-500">JPG, PNG, WEBP or GIF. Max 2 MB.</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handlePhotoSelected}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  icon={Camera}
                  loading={uploadingPhoto}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {profile.profilePicturePath ? 'Change photo' : 'Upload photo'}
                </Button>
              </div>
            </div>
            <Input
              label="Full Name"
              required
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              error={profileErrors.fullName}
            />
            <Input label="Email" value={profile.email} disabled />
            <Input
              label="Mobile Number"
              required
              value={profile.mobileNumber}
              onChange={(e) => setProfile({ ...profile, mobileNumber: e.target.value })}
              error={profileErrors.mobileNumber}
            />
            <Input label="User Code / Roll ID" value={profile.userCode || '—'} disabled />
            <div className="flex items-center gap-2 text-xs text-brand-700 font-semibold">
              <Shield className="w-3.5 h-3.5" />
              <span>{profile.userTypeName || user?.role}</span>
            </div>
            <Button type="submit" variant="primary" loading={savingProfile} className="w-full">
              Save Profile
            </Button>
          </form>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-brand-600" />
            <h2 className="text-sm font-bold text-slate-900">Change password</h2>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              required
              value={passwords.currentPassword}
              onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
              error={passwordErrors.currentPassword}
              autoComplete="current-password"
            />
            <Input
              label="New Password"
              type="password"
              required
              value={passwords.newPassword}
              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              error={passwordErrors.newPassword}
              autoComplete="new-password"
            />
            <Input
              label="Confirm New Password"
              type="password"
              required
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
              error={passwordErrors.confirmPassword}
              autoComplete="new-password"
            />
            <Button type="submit" variant="secondary" loading={savingPassword} className="w-full">
              Change Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
