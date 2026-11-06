import React from 'react';
import { Link } from 'react-router-dom';
import { Home, HelpCircle } from 'lucide-react';
import Button from '../../components/common/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-500 mx-auto flex items-center justify-center mb-4">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">404</h1>
        <h2 className="text-lg font-semibold text-slate-800 mb-2">Page Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link to="/dashboard">
          <Button variant="primary" icon={Home} className="w-full">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}

