import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import { X, Send, Calendar, Clock, Award, MessageSquare, CheckCircle2, TrendingUp } from 'lucide-react';

export const TaskDetailsDrawer = ({ task, onClose }) => {
  const { addRemarkToTask, updateFollowUpDate, currentUser, updateTaskStatus } = useApp();
  const [remarkInput, setRemarkInput] = useState('');
  const [followUpDateInput, setFollowUpDateInput] = useState(task.NextFollowUpDate || '');

  const handleSendRemark = (e) => {
    e.preventDefault();
    if (!remarkInput.trim()) return;
    addRemarkToTask(task.TaskID, remarkInput);
    setRemarkInput('');
  };

  const handleDateChange = (e) => {
    const val = e.target.value;
    setFollowUpDateInput(val);
    updateFollowUpDate(task.TaskID, val);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content glass-panel"
        style={{ maxWidth: '680px', width: '100%', height: '88vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <Badge statusClass={task.TaskPriorityCssClass} text={task.TaskPriorityName} />
              <Badge statusClass={task.TaskStatusCssClass} text={task.TaskStatusName} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>{task.TaskTitle}</h2>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: '0.25rem' }}>
            <X size={22} />
          </button>
        </div>

        {/* Drawer Body Scrollable Content */}
        <div className="modal-body" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Description & Score Grid */}
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Task Instructions</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-sub)', lineHeight: '1.6' }}>{task.TaskDescription}</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <div>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>AssignedScore</span>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>{task.AssignedScore} pts</div>
              </div>
              <div>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>EarnedScore</span>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: task.EarnedScore > 0 ? '#34d399' : '#94a3b8' }}>
                  {task.EarnedScore || 0} pts
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Progress%</span>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#6366f1', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <TrendingUp size={13} />
                  {task.ProgressPercentage || 0}%
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>DueDate</span>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={13} style={{ color: 'var(--accent-primary)' }} />
                  {task.TaskDueDate}
                </div>
              </div>
            </div>
          </div>

          {/* Follow Up Date Picker */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(99, 102, 241, 0.08)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={16} style={{ color: 'var(--accent-primary)' }} />
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff' }}>Next Follow-Up Schedule</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Sets `NextFollowUpDate` field</div>
              </div>
            </div>
            <input
              type="date"
              className="input-field"
              style={{ width: '160px', padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
              value={followUpDateInput}
              onChange={handleDateChange}
            />
          </div>

          {/* Chat-Style Remarks Thread */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <MessageSquare size={16} style={{ color: 'var(--accent-primary)' }} />
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>Remarks Thread (FacultyRemarks & StudentRemarks)</h4>
            </div>

            {/* FacultyRemarks from SPM_Task */}
            {task.FacultyRemarks && (
              <div style={{ padding: '0.75rem', background: 'rgba(99,102,241,0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(99,102,241,0.2)', marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#818cf8', marginBottom: '0.25rem' }}>SPM_Task.FacultyRemarks</div>
                <p style={{ fontSize: '0.83rem', color: 'var(--text-sub)' }}>{task.FacultyRemarks}</p>
              </div>
            )}

            <div className="remarks-feed" style={{ flex: 1 }}>
              {(!task.RemarksHistory || task.RemarksHistory.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No remarks posted yet. Start the conversation thread below!
                </div>
              ) : (
                task.RemarksHistory.map(remark => (
                  <div
                    key={remark.id}
                    className={`remark-bubble ${remark.senderRole === 'Faculty' ? 'faculty-bubble' : ''}`}
                  >
                    <img src={remark.senderAvatar} alt={remark.senderName} className="remark-avatar" />
                    <div style={{ flex: 1 }}>
                      <div className="remark-header">
                        <span className="remark-author">
                          {remark.senderName} ({remark.senderRole})
                        </span>
                        <span className="remark-time">{remark.timestamp}</span>
                      </div>
                      <div className="remark-text">{remark.text}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input Box to Post Remarks */}
            <form onSubmit={handleSendRemark} style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="input-field"
                placeholder={`Post remark as ${currentUser.FullName} (${currentUser.RoleName})...`}
                value={remarkInput}
                onChange={(e) => setRemarkInput(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="modal-footer">
          {task.TaskStatusID !== 3 && (
            <button
              className="btn btn-primary"
              onClick={() => {
                updateTaskStatus(task.TaskID, 3);
                onClose();
              }}
            >
              <CheckCircle2 size={16} />
              <span>Mark Task Complete</span>
            </button>
          )}
          <button className="btn btn-secondary" onClick={onClose}>
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
