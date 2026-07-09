import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { KeyRound, Mail, Eye, EyeOff, Shield, Users, GraduationCap, ArrowRight } from 'lucide-react';
import CustomButton from '../components/common/CustomButton';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      login(email, password);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (roleEmail, rolePassword) => {
    setEmail(roleEmail);
    setPassword(rolePassword);
    setError('');
    
    // Auto submit after a brief delay for a clean UX
    setIsLoading(true);
    setTimeout(() => {
      try {
        login(roleEmail, rolePassword);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden px-4">
      {/* Decorative Blur Spheres for Glassmorphism Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-indigo-600/20 blur-[120px] animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-purple-600/20 blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />

      <div className="w-full max-w-lg z-10 my-8">
        
        {/* Logo and Branding Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-premium shadow-lg shadow-indigo-500/30 text-white font-bold text-3xl mb-4 animate-bounce-slow">
            SP
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-heading">
            SPMS Portal
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Student Project Management System
          </p>
        </div>

        {/* Login Panel */}
        <div className="glass-panel border-white/10 shadow-2xl rounded-3xl p-8 md:p-10 bg-slate-950/60 backdrop-blur-2xl">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white font-heading">Login to Your Account</h2>
            <p className="text-slate-400 text-xs mt-1">Enter your credentials to access the system</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2.5 animate-shake">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Address Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-bold text-slate-300 tracking-wider uppercase pl-1">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-500" />
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white text-sm focus:border-indigo-500/50 focus:bg-slate-900/60 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 placeholder-slate-500 smooth-transition"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label htmlFor="password" className="text-xs font-bold text-slate-300 tracking-wider uppercase">
                  Password
                </label>
                <a href="#forgot" className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <KeyRound className="h-4 w-4 text-slate-500" />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white text-sm focus:border-indigo-500/50 focus:bg-slate-900/60 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 placeholder-slate-500 smooth-transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-500 bg-slate-900 border-white/10 focus:ring-0 focus:ring-offset-0"
              />
              <label htmlFor="remember" className="ml-2.5 text-xs text-slate-400 cursor-pointer">
                Remember Me
              </label>
            </div>

            {/* Sign In Button */}
            <CustomButton
              type="submit"
              disabled={isLoading}
              variant="primary"
              className="w-full py-4 text-sm font-bold tracking-wide gap-2.5"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </CustomButton>

          </form>

          {/* Quick Demo Credentials Panel */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <h4 className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-4 text-center">
              Demo Credentials Shortcuts
            </h4>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@spms.com', 'admin123')}
                className="flex flex-col items-center gap-1 p-2.5 rounded-2xl bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 transition-all active:scale-95 text-center"
              >
                <Shield className="w-4 h-4" />
                <span className="text-[10px] font-bold">Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('priya.sharma@spms.com', 'faculty123')}
                className="flex flex-col items-center gap-1 p-2.5 rounded-2xl bg-purple-500/5 hover:bg-purple-500/10 border border-purple-500/20 text-purple-400 transition-all active:scale-95 text-center"
              >
                <Users className="w-4 h-4" />
                <span className="text-[10px] font-bold">Faculty</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('rohan.mehta@spms.com', 'student123')}
                className="flex flex-col items-center gap-1 p-2.5 rounded-2xl bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 transition-all active:scale-95 text-center"
              >
                <GraduationCap className="w-4 h-4" />
                <span className="text-[10px] font-bold">Student</span>
              </button>
            </div>
          </div>

        </div>
        
      </div>
    </div>
  );
};

export default Login;
