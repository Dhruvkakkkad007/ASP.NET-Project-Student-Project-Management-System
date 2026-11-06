import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Shield,
  Briefcase,
  UserCheck,
  User,
  Phone,
  Hash,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { userService } from '../../api/userService';
import { userTypeService } from '../../api/userTypeService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ThemeToggle from '../../components/common/ThemeToggle';

export default function LoginPage() {
  // Mode: 'login' (Existing Account) or 'register' (New Account)
  const [mode, setMode] = useState('login');

  // Selected Role for Login / Register ('Student' | 'Faculty' | 'Admin')
  const [selectedRole, setSelectedRole] = useState('Student');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regUserCode, setRegUserCode] = useState('');

  // Form errors & loading
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');

  // Loaded user types from backend
  const [userTypes, setUserTypes] = useState([]);

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  // Load available user types from backend on mount
  useEffect(() => {
    async function fetchUserTypes() {
      try {
        const types = await userTypeService.getAll();
        if (Array.isArray(types) && types.length > 0) {
          setUserTypes(types);
        }
      } catch (err) {
        console.warn('Could not load user types from backend', err);
      }
    }
    fetchUserTypes();
  }, []);

  const handleSelectRoleLogin = (role) => {
    setSelectedRole(role);
    setApiError('');
    setApiSuccess('');
    setErrors({});
    // Clear fields so user enters their own registered credentials
    setLoginEmail('');
    setLoginPassword('');
  };

  const handleSelectRoleRegister = (role) => {
    setSelectedRole(role);
    setApiError('');
    setApiSuccess('');
    setErrors({});
  };

  // Find userTypeId matching selected role name
  const getSelectedUserTypeId = (roleName) => {
    if (Array.isArray(userTypes) && userTypes.length > 0) {
      const matched = userTypes.find((ut) =>
        ut.userTypeName?.toLowerCase()?.trim() === roleName.toLowerCase()?.trim()
      );
      if (matched) return matched.userTypeId;

      const partial = userTypes.find((ut) =>
        ut.userTypeName?.toLowerCase()?.includes(roleName.toLowerCase())
      );
      if (partial) return partial.userTypeId;
    }

    return 0; // Let backend auto-resolve via UserTypeName
  };

  // Validation for Login
  const validateLogin = () => {
    const errs = {};
    if (!loginEmail.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(loginEmail)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!loginPassword) {
      errs.password = 'Password is required';
    } else if (loginPassword.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Validation for Registration
  const validateRegister = () => {
    const errs = {};
    if (!regFullName.trim()) {
      errs.fullName = 'Full Name is required';
    } else if (/\d/.test(regFullName)) {
      errs.fullName = 'Full Name cannot contain numbers';
    } else if (regFullName.length > 100) {
      errs.fullName = 'Full Name cannot exceed 100 characters';
    }

    if (!regEmail.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(regEmail)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!regPassword) {
      errs.password = 'Password is required';
    } else if (regPassword.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (!regMobile.trim()) {
      errs.mobile = 'Mobile number is required';
    } else if (!/^[0-9+\-\s]{7,15}$/.test(regMobile)) {
      errs.mobile = 'Invalid mobile number format (7 to 15 digits)';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Handle Sign In (Existing Account)
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setApiSuccess('');
    if (!validateLogin()) return;

    setLoading(true);
    try {
      const user = await login({ email: loginEmail.trim(), password: loginPassword });
      toast.success(`Welcome back! Signed in as ${user?.role || selectedRole}`);
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      const rawMsg = err.message || 'Invalid email or password';
      // Check if it's a "not found" / credentials error
      const isCredentialError =
        rawMsg.toLowerCase().includes('invalid') ||
        rawMsg.toLowerCase().includes('unauthorized') ||
        rawMsg.toLowerCase().includes('not found') ||
        err.status === 401;
      const msg = isCredentialError
        ? `Invalid email or password. If you haven't registered as ${selectedRole} yet, click "Create New Account" below.`
        : rawMsg;
      setApiError(msg);
      toast.error(rawMsg);
    } finally {
      setLoading(false);
    }
  };

  // Handle Account Creation (New Account)
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setApiSuccess('');
    if (!validateRegister()) return;

    setLoading(true);
    const targetUserTypeId = getSelectedUserTypeId(selectedRole);

    const payload = {
      userTypeId: Number(targetUserTypeId) || 0,
      userTypeName: selectedRole, // Explicitly pass role name so backend resolves Admin/Faculty/Student precisely
      fullName: regFullName.trim(),
      userCode: regUserCode.trim() || `${selectedRole.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-4)}`,
      email: regEmail.trim(),
      password: regPassword,
      mobileNumber: regMobile.trim(),
      profilePicturePath: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
      isActive: true,
      isDeleted: false,
    };

    try {
      await userService.create(payload);
      toast.success(`New ${selectedRole} account created successfully!`);
      setApiSuccess(`Your ${selectedRole} account was created! Logging you in...`);

      // Immediately log in with the newly created credentials
      try {
        const loggedUser = await login({ email: payload.email, password: payload.password });
        toast.success(`Signed in as ${loggedUser?.role || selectedRole}`);
        navigate(from, { replace: true });
      } catch (loginErr) {
        // Fallback: switch to login mode with prefilled credentials
        setMode('login');
        setLoginEmail(payload.email);
        setLoginPassword(payload.password);
        toast.info('Please enter your password to complete login.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      const msg = err.message || 'Failed to create account. Email may already be in use.';
      setApiError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const rolesConfig = [
    {
      id: 'Student',
      label: 'Student',
      icon: GraduationCap,
      color: 'border-emerald-500 bg-emerald-50/70 text-emerald-800',
      activeColor: 'bg-emerald-600 text-white shadow-emerald-600/30 ring-2 ring-emerald-500',
      badge: 'Student Portal',
      desc: 'Project milestones & submission',
    },
    {
      id: 'Faculty',
      label: 'Faculty',
      icon: Briefcase,
      color: 'border-blue-500 bg-blue-50/70 text-blue-800',
      activeColor: 'bg-blue-600 text-white shadow-blue-600/30 ring-2 ring-blue-500',
      badge: 'Mentor & Guide',
      desc: 'Task assignment & grading',
    },
    {
      id: 'Admin',
      label: 'Admin',
      icon: Shield,
      color: 'border-purple-500 bg-purple-50/70 text-purple-800',
      activeColor: 'bg-purple-600 text-white shadow-purple-600/30 ring-2 ring-purple-500',
      badge: 'System Admin',
      desc: 'Full configuration & user control',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-brand-950 flex flex-col justify-center py-10 sm:px-6 lg:px-8 text-slate-800 relative">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center px-4">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center text-white shadow-xl shadow-brand-500/30">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            SPMS Portal
          </h2>
        </div>
        <p className="mt-2 text-xs sm:text-sm text-slate-300">
          Student Project Management & Evaluation System
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl px-4">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-slate-100">
          
          {/* Main Mode Switcher: Sign In vs Create Account */}
          <div className="flex rounded-xl bg-slate-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setApiError('');
                setApiSuccess('');
                setErrors({});
              }}
              className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                mode === 'login'
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In (Existing Account)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setApiError('');
                setApiSuccess('');
                setErrors({});
              }}
              className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                mode === 'register'
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>Create New Account</span>
            </button>
          </div>

          {/* Feedback Alerts */}
          {apiError && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{apiError}</span>
            </div>
          )}

          {apiSuccess && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{apiSuccess}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 1: EXISTING ACCOUNT (LOGIN)                           */}
          {/* ======================================================== */}
          {mode === 'login' && (
            <div>
              <div className="mb-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  1. Select Login Role for Existing Account:
                </p>
                <div className="grid grid-cols-3 gap-2.5">
                  {rolesConfig.map((r) => {
                    const Icon = r.icon;
                    const isSelected = selectedRole === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => handleSelectRoleLogin(r.id)}
                        className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? r.activeColor
                            : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <Icon className="w-4 h-4" />
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-slate-200/70 text-slate-600'
                            }`}
                          >
                            {r.id}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-bold leading-tight">
                            {r.label}
                          </p>
                          <p
                            className={`text-[10px] mt-0.5 line-clamp-1 ${
                              isSelected ? 'text-white/80' : 'text-slate-400'
                            }`}
                          >
                            {r.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Admin account tip */}
              {selectedRole === 'Admin' && (
                <div className="mt-3 p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-xs flex items-start gap-2">
                  <Shield className="w-4 h-4 shrink-0 text-purple-500 mt-0.5" />
                  <span>
                    <strong>Admin account required.</strong> If you haven't created an Admin account yet, go to{' '}
                    <button
                      type="button"
                      className="underline font-bold text-purple-700 hover:text-purple-900"
                      onClick={() => { setMode('register'); setErrors({}); }}
                    >
                      Create New Account →
                    </button>
                  </span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4 mt-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  2. Enter Your Credentials:
                </p>

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@spms.edu"
                  icon={Mail}
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  error={errors.email}
                  required
                  autoComplete="email"
                />

                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  icon={Lock}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  error={errors.password}
                  required
                  autoComplete="current-password"
                />

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                    className="w-full justify-center py-2.5 text-sm"
                  >
                    <span>Login as {selectedRole}</span>
                    {!loading && <ArrowRight className="w-4 h-4 ml-1" />}
                  </Button>
                </div>
              </form>

              {/* Quick Switch to Register prompt */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Need a brand new account?</span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrors({});
                  }}
                  className="font-bold text-brand-600 hover:text-brand-700"
                >
                  Create {selectedRole} Account &rarr;
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: CREATE NEW ACCOUNT (REGISTER)                     */}
          {/* ======================================================== */}
          {mode === 'register' && (
            <div>
              <div className="mb-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  1. Choose Account Role to Create:
                </p>
                <div className="grid grid-cols-3 gap-2.5">
                  {rolesConfig.map((r) => {
                    const Icon = r.icon;
                    const isSelected = selectedRole === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => handleSelectRoleRegister(r.id)}
                        className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? r.activeColor
                            : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <Icon className="w-4 h-4" />
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-slate-200/70 text-slate-600'
                            }`}
                          >
                            New
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-bold leading-tight">
                            {r.label}
                          </p>
                          <p
                            className={`text-[10px] mt-0.5 line-clamp-1 ${
                              isSelected ? 'text-white/80' : 'text-slate-400'
                            }`}
                          >
                            Register
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Register Form */}
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5 mt-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    2. New {selectedRole} Details:
                  </p>
                  <Badge variant="primary" size="sm">
                    Creating: {selectedRole} Account
                  </Badge>
                </div>

                <Input
                  label="Full Name"
                  type="text"
                  placeholder="e.g. Alex Johnson"
                  icon={User}
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  error={errors.fullName}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="alex@spms.edu"
                    icon={Mail}
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    error={errors.email}
                    required
                  />

                  <Input
                    label="Password"
                    type="password"
                    placeholder="Min 6 characters"
                    icon={Lock}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    error={errors.password}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Mobile Number"
                    type="tel"
                    placeholder="+1 555-0199"
                    icon={Phone}
                    value={regMobile}
                    onChange={(e) => setRegMobile(e.target.value)}
                    error={errors.mobile}
                    required
                  />

                  <Input
                    label={`${selectedRole} Code / Roll ID`}
                    type="text"
                    placeholder={`e.g. ${
                      selectedRole === 'Student'
                        ? 'STU-2026-01'
                        : selectedRole === 'Faculty'
                        ? 'FAC-101'
                        : 'ADM-01'
                    }`}
                    icon={Hash}
                    value={regUserCode}
                    onChange={(e) => setRegUserCode(e.target.value)}
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="success"
                    loading={loading}
                    className="w-full justify-center py-2.5 text-sm"
                  >
                    <UserCheck className="w-4 h-4 mr-1.5" />
                    <span>Create {selectedRole} Account & Sign In</span>
                  </Button>
                </div>
              </form>

              {/* Quick Switch to Login prompt */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Already have an account?</span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrors({});
                  }}
                  className="font-bold text-brand-600 hover:text-brand-700"
                >
                  Sign In to Existing Account &rarr;
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
