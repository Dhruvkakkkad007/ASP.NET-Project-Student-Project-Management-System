import React, { useState, useEffect, useMemo } from 'react';
import { Award, Clock, FileText, Save, Star } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import { projectAllocationService } from '../../api/projectAllocationService';
import { projectTaskService } from '../../api/projectTaskService';
import { useToast } from '../../context/ToastContext';
import { toInputDate } from '../../utils/formatters';

export function calculateGradeFromScores(p1, p2, p3 = 0) {
  const scores = [p1, p2, p3].map((v) => {
    const n = parseFloat(v);
    return isNaN(n) ? null : n;
  }).filter((n) => n != null);

  if (scores.length === 0) return '';

  const total = scores.reduce((sum, n) => sum + n, 0);
  const max = scores.length * 10;
  const pct = (total / max) * 100;

  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B+';
  if (pct >= 60) return 'B';
  if (pct >= 50) return 'C';
  return 'F';
}

function isGraded(task) {
  return task && task.earnedScore != null && task.earnedScore !== '';
}

function sortTasks(tasks) {
  return [...(tasks || [])].sort((a, b) => {
    const da = new Date(a.taskAssignedDate || 0).getTime();
    const db = new Date(b.taskAssignedDate || 0).getTime();
    if (da !== db) return da - db;
    return Number(a.taskId || 0) - Number(b.taskId || 0);
  });
}

export function getTaskPhaseNumber(task, siblingTasks = []) {
  if (!task) return 1;
  const title = (task.taskTitle || '').toLowerCase();
  if (/\b(task\s*3|phase\s*[-]?\s*3|final)\b/.test(title)) return 3;
  if (/\b(task\s*2|phase\s*[-]?\s*2)\b/.test(title)) return 2;
  if (/\b(task\s*1|phase\s*[-]?\s*1)\b/.test(title)) return 1;

  const idx = sortTasks(siblingTasks).findIndex((t) => Number(t.taskId) === Number(task.taskId));
  if (idx === 1) return 2;
  if (idx >= 2) return 3;
  return 1;
}

function findPhaseTask(siblings, phase) {
  return sortTasks(siblings).find((t) => getTaskPhaseNumber(t, siblings) === phase) || null;
}

const PHASE_META = {
  1: {
    label: 'Phase 1 · Task 1',
    title: 'Task 1 — Phase 1 Evaluation',
    nextTitle: 'Task 2 — Phase 2 Evaluation',
    color: 'blue',
    help: 'First meeting: grade Task 1, then assign the next date and work for Task 2.',
  },
  2: {
    label: 'Phase 2 · Task 2',
    title: 'Task 2 — Phase 2 Evaluation',
    nextTitle: 'Task 3 — Phase 3 Final Evaluation',
    color: 'amber',
    help: 'Second meeting: grade Task 2, then assign the next date and work for Task 3 (final).',
  },
  3: {
    label: 'Phase 3 · Task 3 (Final)',
    title: 'Task 3 — Phase 3 Final Evaluation',
    nextTitle: '',
    color: 'emerald',
    help: 'Final meeting: grade Task 3. Overall project grade is calculated from all three tasks.',
  },
};

export default function ProjectEvaluationModal({
  isOpen,
  onClose,
  allocation,
  task = null,
  onUpdated,
}) {
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [siblingTasks, setSiblingTasks] = useState([]);

  const [score, setScore] = useState('');
  const [workNotes, setWorkNotes] = useState('');
  const [remarks, setRemarks] = useState('');
  const [nextDueDate, setNextDueDate] = useState(toInputDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)));
  const [nextTaskTitle, setNextTaskTitle] = useState('');
  const [nextTaskWork, setNextTaskWork] = useState('');

  const allocId = task?.projectAllocationId || allocation?.projectAllocationId;

  useEffect(() => {
    if (!isOpen || !allocId) return;
    let cancelled = false;
    (async () => {
      setLoadingTasks(true);
      try {
        const all = await projectTaskService.getAll();
        const mine = (all || []).filter((t) => Number(t.projectAllocationId) === Number(allocId));
        if (!cancelled) setSiblingTasks(mine);
      } catch {
        if (!cancelled) setSiblingTasks([]);
      } finally {
        if (!cancelled) setLoadingTasks(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen, allocId, task?.taskId]);

  const cycle = useMemo(() => {
    const siblings = siblingTasks;
    if (task) {
      const phase = getTaskPhaseNumber(task, siblings);
      const p1 = findPhaseTask(siblings, 1);
      if (phase > 1 && p1 && !isGraded(p1)) {
        return { phase: 1, evaluatingTask: p1, blocked: false };
      }
      const p2 = findPhaseTask(siblings, 2);
      if (phase === 3 && p2 && !isGraded(p2)) {
        return { phase: 2, evaluatingTask: p2, blocked: false };
      }
      return { phase, evaluatingTask: task, blocked: false };
    }

    const p1 = findPhaseTask(siblings, 1);
    if (!p1 || !isGraded(p1)) return { phase: 1, evaluatingTask: p1, blocked: false };
    const p2 = findPhaseTask(siblings, 2);
    if (!p2 || !isGraded(p2)) return { phase: 2, evaluatingTask: p2, blocked: false };
    const p3 = findPhaseTask(siblings, 3);
    return { phase: 3, evaluatingTask: p3, blocked: false };
  }, [task, siblingTasks]);

  const phase = cycle.phase;
  const evaluatingTask = cycle.evaluatingTask;
  const meta = PHASE_META[phase];
  const needsNextTask = phase < 3;

  useEffect(() => {
    if (!isOpen) return;
    const current = cycle.evaluatingTask;
    setScore(current?.earnedScore != null ? String(current.earnedScore) : '');
    setWorkNotes(current?.taskDescription || '');
    setRemarks(current?.facultyRemarks || '');
    setNextDueDate(
      toInputDate(current?.nextFollowUpDate) ||
        toInputDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000))
    );
    setNextTaskTitle(PHASE_META[cycle.phase]?.nextTitle || '');
    setNextTaskWork('');
  }, [isOpen, cycle.phase, cycle.evaluatingTask?.taskId]);

  const phaseScores = useMemo(() => {
    const p1 = findPhaseTask(siblingTasks, 1);
    const p2 = findPhaseTask(siblingTasks, 2);
    const p3 = findPhaseTask(siblingTasks, 3);
    return {
      1: p1?.earnedScore,
      2: p2?.earnedScore,
      3: p3?.earnedScore,
    };
  }, [siblingTasks]);

  const saveCurrentTask = async (earned, completedDate, followUp) => {
    const title = evaluatingTask?.taskTitle || meta.title;
    const payload = {
      projectAllocationId: Number(allocId),
      taskTitle: title,
      taskDescription: workNotes.trim() || evaluatingTask?.taskDescription || null,
      taskPriorityId: evaluatingTask?.taskPriorityId || 2,
      taskAssignedDate: evaluatingTask?.taskAssignedDate || new Date().toISOString(),
      taskStartDate: evaluatingTask?.taskStartDate || new Date().toISOString(),
      taskDueDate: evaluatingTask?.taskDueDate || new Date().toISOString(),
      taskStatusId: 3,
      assignedScore: evaluatingTask?.assignedScore || 10,
      earnedScore: earned,
      progressPercentage: 100,
      taskCompletedDate: completedDate,
      nextFollowUpDate: followUp,
      facultyRemarks: `[Phase ${phase} · Task ${phase}: ${earned}/10] ${remarks.trim() || 'Evaluated.'}`,
      studentRemarks: evaluatingTask?.studentRemarks || null,
    };

    if (evaluatingTask?.taskId) {
      await projectTaskService.update(evaluatingTask.taskId, payload);
    } else {
      await projectTaskService.create(payload);
    }
  };

  const createNextTaskIfNeeded = async () => {
    if (!needsNextTask) return;
    const nextPhase = phase + 1;
    const existingNext = findPhaseTask(siblingTasks, nextPhase);
    if (existingNext) {
      const due = new Date(nextDueDate).toISOString();
      await projectTaskService.update(existingNext.taskId, {
        projectAllocationId: Number(allocId),
        taskTitle: nextTaskTitle.trim() || existingNext.taskTitle,
        taskDescription: nextTaskWork.trim() || existingNext.taskDescription,
        taskPriorityId: existingNext.taskPriorityId || 2,
        taskAssignedDate: existingNext.taskAssignedDate || new Date().toISOString(),
        taskStartDate: due,
        taskDueDate: due,
        taskStatusId: existingNext.taskStatusId || 1,
        assignedScore: existingNext.assignedScore || 10,
        earnedScore: existingNext.earnedScore ?? null,
        progressPercentage: existingNext.progressPercentage || 0,
        taskCompletedDate: existingNext.taskCompletedDate || null,
        nextFollowUpDate: due,
        facultyRemarks: existingNext.facultyRemarks || `Assigned after Phase ${phase} evaluation.`,
        studentRemarks: existingNext.studentRemarks || null,
      });
      return;
    }

    const due = new Date(nextDueDate).toISOString();
    await projectTaskService.create({
      projectAllocationId: Number(allocId),
      taskTitle: nextTaskTitle.trim() || PHASE_META[nextPhase].title,
      taskDescription: nextTaskWork.trim() || `Work assigned after Phase ${phase} evaluation.`,
      taskStatusId: 1,
      taskPriorityId: 2,
      assignedScore: 10,
      earnedScore: null,
      progressPercentage: 0,
      taskAssignedDate: new Date().toISOString(),
      taskStartDate: due,
      taskDueDate: due,
      taskCompletedDate: null,
      nextFollowUpDate: due,
      facultyRemarks: `Assigned after Phase ${phase} evaluation. Next meeting: ${nextDueDate}.`,
      studentRemarks: null,
    });
  };

  const updateAllocationProgress = async (earned) => {
    if (!allocation) return;
    const progress = phase === 1 ? 33 : phase === 2 ? 66 : 100;
    const s1 = phase === 1 ? earned : Number(phaseScores[1] || 0);
    const s2 = phase === 2 ? earned : Number(phaseScores[2] || 0);
    const s3 = phase === 3 ? earned : Number(phaseScores[3] || 0);
    const overall = phase === 3 ? calculateGradeFromScores(s1, s2, s3) : allocation.overAllGrade || null;

    await projectAllocationService.update(allocation.projectAllocationId, {
      projectId: allocation.projectId || null,
      studentId: allocation.studentId,
      facultyId: allocation.facultyId,
      assignedDate: allocation.assignedDate,
      projectStartDate: allocation.projectStartDate,
      projectEndDate: allocation.projectEndDate,
      totalTasksGiven: Math.max(allocation.totalTasksGiven || 0, phase),
      totalCompletedTasks: phase,
      progressPercentage: progress,
      overAllGrade: overall,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const earned = parseFloat(score);
    if (isNaN(earned) || earned < 0 || earned > 10) {
      toast.error('Enter marks between 0 and 10 for this phase');
      return;
    }
    if (needsNextTask) {
      if (!nextDueDate) {
        toast.error('Give the student the next evaluation date for the following task');
        return;
      }
      if (!nextTaskTitle.trim()) {
        toast.error('Enter the work / title for the next task');
        return;
      }
    }

    setSubmitting(true);
    try {
      const completedDate = new Date().toISOString();
      const followUp = needsNextTask ? new Date(nextDueDate).toISOString() : null;
      await saveCurrentTask(earned, completedDate, followUp);
      if (needsNextTask) await createNextTaskIfNeeded();
      await updateAllocationProgress(earned);

      if (phase === 1) {
        toast.success(`Phase 1 complete (${earned}/10). Task 2 is scheduled for ${nextDueDate}.`);
      } else if (phase === 2) {
        toast.success(`Phase 2 complete (${earned}/10). Task 3 (final) is scheduled for ${nextDueDate}.`);
      } else {
        const grade = calculateGradeFromScores(phaseScores[1], phaseScores[2], earned);
        toast.success(`Phase 3 complete. Overall project grade: ${grade}`);
      }

      if (onUpdated) onUpdated();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save this phase evaluation');
    } finally {
      setSubmitting(false);
    }
  };

  if (!allocation && !task) return null;

  const banner =
    phase === 1
      ? 'bg-blue-50 border-blue-200/80 text-blue-800'
      : phase === 2
        ? 'bg-amber-50 border-amber-200/80 text-amber-900'
        : 'bg-emerald-50 border-emerald-200/80 text-emerald-900';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${meta.label}`}
      subtitle={`Student: ${allocation?.studentFullName || task?.studentFullName || 'Student'} • ${allocation?.projectTitle || task?.projectTitle || 'Project'}`}
      size="lg"
    >
      <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-xl mb-5">
        {[1, 2, 3].map((step) => {
          const done = isGraded(findPhaseTask(siblingTasks, step)) && step !== phase;
          const active = step === phase;
          return (
            <div
              key={step}
              className={`flex items-center justify-center gap-2 py-2 px-2 rounded-lg text-[11px] font-semibold ${
                active ? 'bg-white text-brand-700 shadow-sm' : done ? 'text-emerald-700' : 'text-slate-500'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  active ? 'bg-brand-100 text-brand-700' : done ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {done ? '✓' : step}
              </span>
              <span>Task {step}</span>
            </div>
          );
        })}
      </div>

      {loadingTasks ? (
        <p className="text-xs text-slate-500 py-8 text-center">Loading this student&apos;s evaluation cycle...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className={`p-3 border rounded-xl text-xs flex items-start gap-2 ${banner}`}>
            {phase === 1 ? <FileText className="w-4 h-4 shrink-0 mt-0.5" /> : phase === 2 ? <Clock className="w-4 h-4 shrink-0 mt-0.5" /> : <Award className="w-4 h-4 shrink-0 mt-0.5" />}
            <div>
              <p className="font-bold">{meta.label}</p>
              <p className="mt-0.5 opacity-90">{meta.help}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="block text-slate-500">Task 1</span>
              <strong>{phase === 1 ? (score || '—') : phaseScores[1] ?? '—'}/10</strong>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="block text-slate-500">Task 2</span>
              <strong>{phase === 2 ? (score || '—') : phaseScores[2] ?? '—'}/10</strong>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="block text-slate-500">Task 3</span>
              <strong>{phase === 3 ? (score || '—') : phaseScores[3] ?? '—'}/10</strong>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Work completed in {meta.label} *
            </label>
            <textarea
              required
              rows={3}
              value={workNotes}
              onChange={(e) => setWorkNotes(e.target.value)}
              placeholder="What did the student complete in this meeting / task?"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={`Task ${phase} marks (0 to 10) *`}
              type="number"
              step="0.5"
              min="0"
              max="10"
              required
              value={score}
              onChange={(e) => setScore(e.target.value)}
              helperText="Grade only this phase. Other phases stay as they are."
            />
            <Input
              label="Faculty remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Feedback for this visit"
            />
          </div>

          {needsNextTask && (
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <p className="text-xs font-bold text-slate-800">
                Finish this visit — give next date and Task {phase + 1} work
              </p>
              <Input
                label={`Next evaluation date (Task ${phase + 1}) *`}
                type="date"
                required
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
              />
              <Input
                label={`Task ${phase + 1} title *`}
                required
                value={nextTaskTitle}
                onChange={(e) => setNextTaskTitle(e.target.value)}
              />
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Work for Task {phase + 1}
                </label>
                <textarea
                  rows={2}
                  value={nextTaskWork}
                  onChange={(e) => setNextTaskWork(e.target.value)}
                  placeholder={`What should the student complete before Task ${phase + 1}?`}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          )}

          {phase === 3 && (
            <div className="p-4 bg-gradient-to-r from-brand-600 to-indigo-700 rounded-2xl text-white">
              <span className="text-xs uppercase font-bold tracking-wider text-brand-200">
                Overall grade from Task 1 + Task 2 + Task 3
              </span>
              <h2 className="text-3xl font-extrabold mt-0.5 flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-300 fill-yellow-300" />
                {calculateGradeFromScores(phaseScores[1], phaseScores[2], score) || '—'}
              </h2>
              <p className="text-xs text-brand-100 mt-1">
                {(Number(phaseScores[1] || 0) + Number(phaseScores[2] || 0) + Number(score || 0)).toFixed(1)} / 30 marks
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-400">
              {evaluatingTask ? evaluatingTask.taskTitle : meta.title}
            </span>
            <Button type="submit" variant="primary" icon={phase === 3 ? Award : Save} loading={submitting}>
              {phase === 3 ? 'Finish final evaluation' : `Complete Phase ${phase} & assign Task ${phase + 1}`}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
