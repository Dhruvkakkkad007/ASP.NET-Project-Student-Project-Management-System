import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, Clock, RotateCw, X } from 'lucide-react';
import { projectSwitchRequestService } from '../../api/projectSwitchRequestService';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import Textarea from '../../components/common/Textarea';
import { formatDate } from '../../utils/formatters';

const statusVariant = {
  Pending: 'warning',
  Accepted: 'success',
  Declined: 'danger',
};

export default function FacultySwitchRequestsPage() {
  const toast = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reviewing, setReviewing] = useState(null);
  const [decision, setDecision] = useState('accept');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async (silent = false) => {
    if (!silent) setLoading(true);
    setRefreshing(true);
    try {
      const data = await projectSwitchRequestService.getAll();
      setRequests(data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load switch requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const pending = useMemo(
    () => requests.filter((r) => r.status === 'Pending'),
    [requests]
  );
  const reviewed = useMemo(
    () => requests.filter((r) => r.status !== 'Pending'),
    [requests]
  );

  const openReview = (req, action) => {
    setReviewing(req);
    setDecision(action);
    setRemarks('');
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!reviewing) return;
    setSubmitting(true);
    try {
      if (decision === 'accept') {
        await projectSwitchRequestService.accept(reviewing.projectSwitchRequestId, remarks);
        toast.success('Request accepted. The student project is now updated for student, faculty, and admin.');
      } else {
        await projectSwitchRequestService.decline(reviewing.projectSwitchRequestId, remarks);
        toast.success('Request declined. The student stays on the current project.');
      }
      setReviewing(null);
      loadRequests(true);
    } catch (err) {
      toast.error(err.message || 'Could not update the request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader text="Loading project switch requests..." className="min-h-[50vh]" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Project Switch Requests</h1>
          <p className="text-xs text-slate-500 mt-1">
            Students cannot change projects themselves. Accept or decline each request from your mentees.
          </p>
        </div>
        <Button variant="outline" icon={RotateCw} loading={refreshing} onClick={() => loadRequests(true)}>
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Pending</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{pending.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Accepted</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {requests.filter((r) => r.status === 'Accepted').length}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Declined</p>
          <p className="text-2xl font-bold text-rose-600 mt-1">
            {requests.filter((r) => r.status === 'Declined').length}
          </p>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500" />
          Awaiting your decision
        </h2>
        {pending.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-sm text-slate-500">
            No pending project switch requests.
          </div>
        ) : (
          pending.map((req) => (
            <div
              key={req.projectSwitchRequestId}
              className="bg-white rounded-2xl border border-amber-200 p-5 shadow-sm"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="warning" size="sm">Pending</Badge>
                    <span className="text-[11px] text-slate-400">{formatDate(req.requestedAt)}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900">
                    {req.studentFullName || 'Student'}
                    <span className="font-medium text-slate-500"> wants to switch project</span>
                  </p>
                  <p className="text-xs text-slate-600 mt-2 flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{req.currentProjectTitle || 'Current project'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold text-brand-700">{req.requestedProjectTitle}</span>
                  </p>
                  {req.reason && (
                    <p className="text-xs text-slate-500 mt-2 bg-slate-50 rounded-xl p-2.5">
                      Reason: {req.reason}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button size="sm" variant="outline" icon={X} onClick={() => openReview(req, 'decline')}>
                    Decline
                  </Button>
                  <Button size="sm" variant="primary" icon={Check} onClick={() => openReview(req, 'accept')}>
                    Accept
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      {reviewed.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-800">Reviewed requests</h2>
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
            {reviewed.map((req) => (
              <div key={req.projectSwitchRequestId} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {req.studentFullName} · {req.currentProjectTitle || '—'} → {req.requestedProjectTitle}
                  </p>
                  {req.facultyRemarks && (
                    <p className="text-xs text-slate-500 mt-1">Remarks: {req.facultyRemarks}</p>
                  )}
                </div>
                <Badge variant={statusVariant[req.status] || 'default'} size="sm">
                  {req.status}
                </Badge>
              </div>
            ))}
          </div>
        </section>
      )}

      <Modal
        isOpen={!!reviewing}
        onClose={() => setReviewing(null)}
        title={decision === 'accept' ? 'Accept project switch' : 'Decline project switch'}
        subtitle={reviewing ? `${reviewing.studentFullName} · ${reviewing.requestedProjectTitle}` : ''}
      >
        <form onSubmit={handleReview} className="space-y-4">
          <p className="text-xs text-slate-600">
            {decision === 'accept'
              ? 'Accepting will change the student project immediately. Faculty, admin, and student views will all show the new topic.'
              : 'Declining keeps the student on their current project.'}
          </p>
          <Textarea
            label="Remarks (optional)"
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Add a short note for the student..."
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setReviewing(null)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant={decision === 'accept' ? 'primary' : 'danger'} loading={submitting}>
              {decision === 'accept' ? 'Accept switch' : 'Decline request'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
