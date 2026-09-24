import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { Award, CheckCircle2, Star, MessageSquare } from 'lucide-react';

export const EvaluationModal = ({ task, onClose }) => {
  const { evaluateTaskScore, updateOverallGrade, allocations } = useApp();

  // Resolve SPM_ProjectAllocation record
  const currentAlloc = allocations.find(a =>
    a.ProjectAllocationID === task.ProjectAllocationID || a.AllocationID === task.AllocationID
  ) || allocations[0];

  const isEditing = task.EarnedScore > 0;
  const [earnedScoreInput, setEarnedScoreInput] = useState(
    task.EarnedScore !== undefined && task.EarnedScore !== null ? task.EarnedScore : task.AssignedScore
  );
  const [facultyRemarksInput, setFacultyRemarksInput] = useState(task.FacultyRemarks || '');
  const [overallGradeInput, setOverallGradeInput] = useState(currentAlloc?.OverAllGrade || 'A');

  const handleEvaluateTask = (e) => {
    e.preventDefault();
    evaluateTaskScore(task.TaskID, earnedScoreInput, facultyRemarksInput);
    if (overallGradeInput !== currentAlloc?.OverAllGrade) {
      updateOverallGrade(task.ProjectAllocationID || task.AllocationID, overallGradeInput);
    }
    onClose();
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={isEditing ? "Edit Task Evaluation & Semester Grading (SPM_Task)" : "Task Evaluation & Semester Grading (SPM_Task)"}>
      <form onSubmit={handleEvaluateTask}>
        {/* Task Summary */}
        <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
            Reviewing Deliverable • ProjectAllocationID #{task.ProjectAllocationID || task.AllocationID}
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginTop: '0.2rem' }}>{task.TaskTitle}</h3>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-sub)', marginTop: '0.35rem' }}>{task.TaskDescription}</p>

          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span>Student: <strong style={{ color: '#fff' }}>{currentAlloc?.StudentName}</strong></span>
            <span>Max Score: <strong style={{ color: '#fff' }}>{task.AssignedScore} Pts</strong></span>
            <span>Progress: <strong style={{ color: '#6366f1' }}>{task.ProgressPercentage || 0}%</strong></span>
          </div>
        </div>

        {/* Student Remarks Preview (StudentRemarks from SPM_Task) */}
        {task.StudentRemarks && (
          <div style={{ background: 'rgba(245, 158, 11, 0.08)', padding: '0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', border: '1px solid rgba(245,158,11,0.2)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#fbbf24', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <MessageSquare size={13} />
              Student Remarks (SPM_Task.StudentRemarks)
            </div>
            <p style={{ fontSize: '0.83rem', color: 'var(--text-sub)', lineHeight: '1.4' }}>{task.StudentRemarks}</p>
          </div>
        )}

        {/* Earned Score */}
        <div className="input-group">
          <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Award size={15} style={{ color: '#34d399' }} />
            Awarded Score (SPM_Task.EarnedScore)
          </label>
          <input
            type="number"
            className="input-field"
            min="0"
            max={task.AssignedScore}
            required
            value={earnedScoreInput}
            onChange={(e) => setEarnedScoreInput(e.target.value)}
          />
        </div>

        {/* Faculty Remarks (FacultyRemarks) */}
        <div className="input-group">
          <label className="input-label">Faculty Remarks (SPM_Task.FacultyRemarks)</label>
          <textarea
            className="input-field"
            rows="3"
            placeholder="Enter constructive feedback, praise, or improvement areas..."
            value={facultyRemarksInput}
            onChange={(e) => setFacultyRemarksInput(e.target.value)}
          />
        </div>

        {/* Overall Grade (OverAllGrade from SPM_ProjectAllocation) */}
        <div className="input-group" style={{ background: 'rgba(99, 102, 241, 0.08)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
          <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#fff' }}>
            <Star size={15} style={{ color: '#fbbf24' }} />
            Final Semester Grade (SPM_ProjectAllocation.OverAllGrade)
          </label>
          <select
            className="input-field"
            style={{ marginTop: '0.4rem' }}
            value={overallGradeInput}
            onChange={(e) => setOverallGradeInput(e.target.value)}
          >
            <option value="O">Grade O (Outstanding)</option>
            <option value="A+">Grade A+ (Excellent)</option>
            <option value="A">Grade A (Very Good)</option>
            <option value="B+">Grade B+ (Good)</option>
            <option value="B">Grade B (Above Average)</option>
            <option value="C">Grade C (Satisfactory)</option>
            <option value="D">Grade D (Pass)</option>
            <option value="F">Grade F (Fail)</option>
          </select>
        </div>

        <div className="modal-footer" style={{ padding: '1rem 0 0 0', marginTop: '1rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            <CheckCircle2 size={16} />
            <span>Save Evaluation & Grade</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
