import React, { useState, useContext } from 'react';
import { DatabaseContext } from '../context/DatabaseContext';
import { AuthContext } from '../context/AuthContext';
import GlassCard from '../components/common/GlassCard';
import { 
  Award, 
  BookOpen, 
  BarChart2, 
  CheckCircle,
  Clock,
  MessageSquare,
  TrendingUp,
  User
} from 'lucide-react';

const ScoresRemarks = () => {
  const { tasks, projects, users, statuses } = useContext(DatabaseContext);
  const { currentUser, isAdmin, isFaculty, isStudent } = useContext(AuthContext);

  const [selectedProjectId, setSelectedProjectId] = useState(() => {
    // Default to first active project
    const active = projects.filter(p => {
      if (isFaculty) return p.FacultyId === currentUser.UserId;
      return true;
    });
    return active[0]?.ProjectId || '';
  });

  const activeProjects = projects.filter(p => {
    if (isFaculty) return p.FacultyId === currentUser.UserId;
    return true;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // 1. STUDENT VIEW
  const renderStudentView = () => {
    const myTasks = tasks.filter(t => t.StudentId === currentUser.UserId && !t.IsDeleted);
    const gradedTasks = myTasks.filter(t => t.TaskStatus === 3 && t.EarnedScore !== null);
    
    const totalEarned = gradedTasks.reduce((sum, t) => sum + t.EarnedScore, 0);
    const totalAssigned = myTasks.reduce((sum, t) => sum + t.AssignedScore, 0);
    const classAvg = 84.5; // Mock comparative stat

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Points Card */}
          <GlassCard className="flex items-center gap-4 bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-500">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Points Earned</span>
              <h3 className="text-2xl font-bold font-heading text-slate-800 dark:text-white mt-1">
                {totalEarned} <span className="text-sm font-normal text-slate-400">/ {totalAssigned} pts</span>
              </h3>
            </div>
          </GlassCard>

          {/* Grade Percentage Card */}
          <GlassCard className="flex items-center gap-4 bg-gradient-to-br from-emerald-500/5 to-teal-500/5">
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-500">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Grade Percentage</span>
              <h3 className="text-2xl font-bold font-heading text-emerald-500 mt-1">
                {totalAssigned > 0 ? ((totalEarned / totalAssigned) * 100).toFixed(1) : 0}%
              </h3>
            </div>
          </GlassCard>

          {/* Peer Standing Card */}
          <GlassCard className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-sky-500/10 text-sky-500">
              <BarChart2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Course Average Standing</span>
              <h3 className="text-2xl font-bold font-heading text-slate-800 dark:text-white mt-1">
                {classAvg}%
              </h3>
            </div>
          </GlassCard>
        </div>

        {/* Scorecard Table */}
        <GlassCard>
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-200 mb-6 font-heading uppercase tracking-wider">
            My Individual Task Grades & Feedback
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/50 dark:border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-2 w-72">Task Description</th>
                  <th className="pb-3">Completion Date</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Points</th>
                  <th className="pb-3 pl-4">Instructor Feedback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/30 dark:divide-white/5">
                {myTasks.map(t => {
                  const statusObj = statuses.find(s => s.StatusID === t.TaskStatus);
                  return (
                    <tr key={t.TaskId} className="hover:bg-slate-100/30 dark:hover:bg-white/5 transition-colors">
                      <td className="py-4 pl-2">
                        <span className="font-semibold text-sm text-slate-800 dark:text-slate-200 block">{t.TaskTitle}</span>
                        <span className="text-[10px] text-slate-400 mt-1 block max-w-xs truncate">{t.TaskDescription}</span>
                      </td>
                      <td className="py-4 text-xs text-slate-500">{formatDate(t.CompletedDate)}</td>
                      <td className="py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusObj?.StatusCssClass}`}>
                          {statusObj?.StatusName}
                        </span>
                      </td>
                      <td className="py-4 text-xs font-bold text-slate-800 dark:text-slate-200">
                        {t.EarnedScore !== null ? (
                          <span className="text-emerald-500">{t.EarnedScore}</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                        <span className="text-slate-400 font-normal"> / {t.AssignedScore}</span>
                      </td>
                      <td className="py-4 pl-4 text-xs text-slate-500 italic max-w-sm">
                        {t.FacultyRemarks ? `"${t.FacultyRemarks}"` : 'No remarks provided.'}
                      </td>
                    </tr>
                  );
                })}
                {myTasks.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 text-sm">
                      No tasks assigned.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    );
  };

  // 2. FACULTY VIEW
  const renderFacultyView = () => {
    const selectedProject = projects.find(p => p.ProjectId === Number(selectedProjectId));
    if (!selectedProject) {
      return (
        <div className="py-12 text-center text-slate-400 text-sm">
          Please select a supervised project portfolio to review student scores.
        </div>
      );
    }

    const assignedStudents = users.filter(u => selectedProject.StudentIds.includes(u.UserId));

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Project Selector toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            <span className="text-sm font-semibold">Supervised Portfolios:</span>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="px-3 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-xl text-sm focus:outline-none cursor-pointer"
            >
              {activeProjects.map(p => (
                <option key={p.ProjectId} value={p.ProjectId}>{p.ProjectTitle}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Project Class Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <GlassCard className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-500">
              <User className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Team Size</span>
              <h4 className="text-xl font-heading font-bold text-slate-800 dark:text-white mt-1">{assignedStudents.length} Students</h4>
            </div>
          </GlassCard>
          
          <GlassCard className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Project Completion</span>
              <h4 className="text-xl font-heading font-bold text-emerald-500 mt-1">{selectedProject.ProgressPercentage}% Average</h4>
            </div>
          </GlassCard>
        </div>

        {/* Student Leaderboard for selected project */}
        <GlassCard>
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-200 mb-6 font-heading uppercase tracking-wider">
            Student Class Evaluation Ledger
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/50 dark:border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-2">Student</th>
                  <th className="pb-3">Completed Tasks</th>
                  <th className="pb-3">Accumulated Points</th>
                  <th className="pb-3">Overall Performance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/30 dark:divide-white/5">
                {assignedStudents.map(student => {
                  const studentTasks = tasks.filter(t => t.ProjectId === selectedProject.ProjectId && t.StudentId === student.UserId && !t.IsDeleted);
                  const completed = studentTasks.filter(t => t.TaskStatus === 3);
                  
                  const pointsEarned = completed.reduce((sum, t) => sum + (t.EarnedScore || 0), 0);
                  const pointsPossible = studentTasks.reduce((sum, t) => sum + (t.AssignedScore || 0), 0);

                  const ratio = pointsPossible > 0 ? pointsEarned / pointsPossible : 0;
                  let performance = 'Needs Review';
                  let performanceColor = 'bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400';
                  
                  if (ratio >= 0.90) {
                    performance = 'Outstanding';
                    performanceColor = 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400';
                  } else if (ratio >= 0.75) {
                    performance = 'Satisfactory';
                    performanceColor = 'bg-sky-100 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400';
                  } else if (ratio > 0) {
                    performance = 'In Evaluation';
                    performanceColor = 'bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400';
                  }

                  return (
                    <tr key={student.UserId} className="hover:bg-slate-100/30 dark:hover:bg-white/5 transition-colors">
                      <td className="py-4 pl-2">
                        <div className="flex items-center gap-3">
                          <img src={student.ProfilePicturePath} className="w-8.5 h-8.5 rounded-lg object-cover bg-slate-100" />
                          <div>
                            <h5 className="font-semibold text-sm text-slate-800 dark:text-slate-200">{student.FullName}</h5>
                            <p className="text-[10px] text-slate-400">{student.Email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-xs font-semibold text-slate-500">
                        {completed.length} / {studentTasks.length} tasks
                      </td>
                      <td className="py-4 text-xs font-bold text-slate-800 dark:text-slate-200">
                        <span className="text-emerald-500">{pointsEarned}</span>
                        <span className="text-slate-400 font-normal"> / {pointsPossible} pts</span>
                      </td>
                      <td className="py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${performanceColor}`}>
                          {performance}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    );
  };

  // 3. ADMIN VIEW
  const renderAdminView = () => {
    // Generate leaderboard based on points ratios across all tasks
    const students = users.filter(u => u.RoleId === 3);
    const scoreboard = students.map(student => {
      const studentTasks = tasks.filter(t => t.StudentId === student.UserId && !t.IsDeleted);
      const completed = studentTasks.filter(t => t.TaskStatus === 3);
      const earned = completed.reduce((sum, t) => sum + (t.EarnedScore || 0), 0);
      const possible = studentTasks.reduce((sum, t) => sum + t.AssignedScore, 0);
      const ratio = possible > 0 ? (earned / possible) * 100 : 0;
      return {
        student,
        completedCount: completed.length,
        totalCount: studentTasks.length,
        earned,
        possible,
        ratio: Number(ratio.toFixed(1))
      };
    }).sort((a, b) => b.ratio - a.ratio);

    return (
      <div className="space-y-6 animate-fade-in">
        <GlassCard>
          <div className="flex items-center gap-2 mb-6">
            <Award className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-200 font-heading uppercase tracking-wider">
              System Student Grades Leaderboard
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/50 dark:border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-2 w-12">Rank</th>
                  <th className="pb-3">Student Name</th>
                  <th className="pb-3">Task Completion</th>
                  <th className="pb-3">Total Grades</th>
                  <th className="pb-3">Overall Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/30 dark:divide-white/5">
                {scoreboard.map((row, index) => (
                  <tr key={row.student.UserId} className="hover:bg-slate-100/30 dark:hover:bg-white/5 transition-colors">
                    <td className="py-4 pl-2 text-sm font-bold text-indigo-500">#{index + 1}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <img src={row.student.ProfilePicturePath} className="w-8.5 h-8.5 rounded-lg object-cover bg-slate-100" />
                        <div>
                          <h5 className="font-semibold text-sm text-slate-800 dark:text-slate-200">{row.student.FullName}</h5>
                          <p className="text-[10px] text-slate-400">{row.student.Email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-xs font-semibold text-slate-500">
                      {row.completedCount} / {row.totalCount} tasks
                    </td>
                    <td className="py-4 text-xs font-bold text-slate-800 dark:text-slate-200">
                      <span className="text-emerald-500">{row.earned}</span>
                      <span className="text-slate-400 font-normal"> / {row.possible} pts</span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-3 w-40">
                        <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                          <div className="h-full bg-gradient-premium rounded-full" style={{ width: `${row.ratio}%` }} />
                        </div>
                        <span className="text-xs font-bold text-indigo-500">{row.ratio}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">
            Academic Performance Evaluation Reports
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Grade logs, faculty evaluations, and cumulative score metrics.
          </p>
        </div>
      </div>

      {isStudent && renderStudentView()}
      {isFaculty && renderFacultyView()}
      {isAdmin && renderAdminView()}
    </div>
  );
};

export default ScoresRemarks;
