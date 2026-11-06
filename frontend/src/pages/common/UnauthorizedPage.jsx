import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home } from 'lucide-react';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';

export default function UnauthorizedPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Access Denied</h1>
        <p className="text-sm text-slate-600 mb-2">
          Your current account role (<span className="font-bold text-rose-600">{user?.role || 'Guest'}</span>) does not have sufficient permissions to view this section.
        </p>
        <p className="text-xs text-slate-400 mb-6">
          Contact your SPMS Administrator if you believe this is an error.
        </p>
        <Link to="/dashboard">
          <Button variant="primary" icon={Home} className="w-full">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}

