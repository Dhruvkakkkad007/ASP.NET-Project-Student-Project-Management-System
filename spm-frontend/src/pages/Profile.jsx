import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { DatabaseContext } from '../context/DatabaseContext';
import GlassCard from '../components/common/GlassCard';
import CustomButton from '../components/common/CustomButton';
import { Save, User, Mail, Phone, Shield, CheckCircle } from 'lucide-react';

const Profile = () => {
  const { currentUser, updateProfile } = useContext(AuthContext);
  const { updateUser } = useContext(DatabaseContext);

  const [fullName, setFullName] = useState(currentUser?.FullName || '');
  const [email, setEmail] = useState(currentUser?.Email || '');
  const [mobileNumber, setMobileNumber] = useState(currentUser?.MobileNumber || '');
  const [avatarSeed, setAvatarSeed] = useState(() => {
    // If it's a dicebear url, extract seed, otherwise use name
    if (currentUser?.ProfilePicturePath?.includes('dicebear')) {
      const match = currentUser.ProfilePicturePath.match(/seed=([^&]+)/);
      return match ? decodeURIComponent(match[1]) : currentUser.FullName;
    }
    return currentUser?.FullName || '';
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const avatarOptions = [
    'Charlie', 'Daisy', 'Bailey', 'Oliver', 'Lucy', 'Max', 'Milo', 'Leo', 'Buster'
  ];

  const handleSave = (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!fullName.trim() || !email.trim() || !mobileNumber.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(avatarSeed || fullName)}`;

    const updatedFields = {
      FullName: fullName.trim(),
      Email: email.trim(),
      MobileNumber: mobileNumber.trim(),
      ProfilePicturePath: avatarUrl
    };

    try {
      // 1. Update master list in DatabaseContext
      updateUser(currentUser.UserId, updatedFields);
      
      // 2. Update current session in AuthContext
      updateProfile(updatedFields);

      setMessage('Profile settings updated successfully.');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Failed to update profile settings.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">
            My Account Settings
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Update your personal contact details, select avatars, and verify permissions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Side: Avatar Panel */}
        <div className="space-y-4">
          <GlassCard className="flex flex-col items-center text-center">
            <img
              src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(avatarSeed || fullName)}`}
              alt={fullName}
              className="w-24 h-24 rounded-3xl object-cover border-4 border-indigo-500/20 bg-slate-100 dark:bg-white/5 p-1 shadow-md shadow-indigo-500/10"
            />
            <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 mt-4">{fullName}</h4>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800 mt-1.5">
              {currentUser?.RoleName}
            </span>

            <div className="w-full pt-6 mt-6 border-t border-slate-200/50 dark:border-white/5 space-y-3.5 text-left">
              <div className="flex items-center gap-2.5 text-xs text-slate-500">
                <Shield className="w-4 h-4 text-indigo-500" />
                <span>ID: {currentUser?.UserId}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-500">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Account Status: Active</span>
              </div>
            </div>
          </GlassCard>

          {/* Quick Avatar Seeds */}
          <GlassCard>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3">Choose Profile Avatar</span>
            <div className="grid grid-cols-3 gap-2">
              {avatarOptions.map(seed => (
                <button
                  key={seed}
                  type="button"
                  onClick={() => setAvatarSeed(seed)}
                  className={`p-1 border rounded-xl overflow-hidden hover:scale-105 active:scale-95 transition-all bg-slate-100/50 dark:bg-white/5 ${
                    avatarSeed === seed ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-200/50 dark:border-white/5'
                  }`}
                >
                  <img
                    src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`}
                    alt={seed}
                    className="w-full h-8 object-cover bg-slate-200"
                  />
                </button>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right Side: Account Form */}
        <GlassCard className="md:col-span-2">
          <h3 className="font-heading font-bold text-base text-slate-800 dark:text-slate-200 mb-6 uppercase tracking-wider pl-1">
            Personal Information
          </h3>

          {message && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Full Name */}
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase pl-1">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-400" />
                </span>
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-white/5 border border-transparent focus:bg-white focus:border-indigo-500/50 dark:focus:bg-[#12131a] dark:focus:border-indigo-500/50 rounded-xl text-sm focus:outline-none smooth-transition"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase pl-1">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-white/5 border border-transparent focus:bg-white focus:border-indigo-500/50 dark:focus:bg-[#12131a] dark:focus:border-indigo-500/50 rounded-xl text-sm focus:outline-none smooth-transition"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div className="space-y-2">
              <label htmlFor="mobile" className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase pl-1">
                Mobile Phone Number
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-slate-400" />
                </span>
                <input
                  id="mobile"
                  type="text"
                  required
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-white/5 border border-transparent focus:bg-white focus:border-indigo-500/50 dark:focus:bg-[#12131a] dark:focus:border-indigo-500/50 rounded-xl text-sm focus:outline-none smooth-transition"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200/50 dark:border-white/5">
              <CustomButton
                type="submit"
                variant="primary"
                icon={Save}
                size="sm"
              >
                Save Profile Changes
              </CustomButton>
            </div>
          </form>
        </GlassCard>

      </div>
    </div>
  );
};

export default Profile;
