import React, { useContext } from 'react';
import { DatabaseContext } from '../context/DatabaseContext';
import { AuthContext } from '../context/AuthContext';
import GlassCard from '../components/common/GlassCard';
import { 
  Users, 
  GraduationCap, 
  UserCheck, 
  FolderGit, 
  CheckSquare, 
  Award, 
  Clock, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';

const Dashboard = ({ setActiveTab }) => {
  const { users, projects, tasks, statuses, priorities } = useContext(DatabaseContext);
  const { currentUser, isAdmin, isFaculty, isStudent } = useContext(AuthContext);

  // Colors for charts
  const CHART_COLORS = {
    primary: '#6366f1',   // Indigo
    secondary: '#a855f7', // Purple
    accent: '#10b981',    // Emerald
    warning: '#f59e0b',   // Amber
    danger: '#f43f5e',    // Rose
    info: '#0ea5e9',      // Sky
    slate: '#64748b'      // Slate
  };

  // Helper: Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // RENDER ADMIN DASHBOARD
  const renderAdminDashboard = () => {
    const totalUsers = users.length;
    const totalStudents = users.filter(u => u.RoleId === 3).length;
    const totalFaculty = users.filter(u => u.RoleId === 2).length;
    const totalProj = projects.length;
    const totalTsk = tasks.length;

    // Stat cards data
    const stats = [
      { label: 'Total Users', value: totalUsers, subtext: 'registered users', icon: Users, color: 'text-indigo-500 bg-indigo-500/10' },
      { label: 'Total Students', value: totalStudents, subtext: 'enrolled students', icon: GraduationCap, color: 'text-emerald-500 bg-emerald-500/10' },
      { label: 'Total Faculty', value: totalFaculty, subtext: 'supervisors', icon: UserCheck, color: 'text-purple-500 bg-purple-500/10' },
      { label: 'Total Projects', value: totalProj, subtext: 'active systems', icon: FolderGit, color: 'text-sky-500 bg-sky-500/10' },
      { label: 'Total Tasks', value: totalTsk, subtext: 'assigned items', icon: CheckSquare, color: 'text-amber-500 bg-amber-500/10' }
    ];

    // Project Status Pie Data
    const projectStatusCounts = projects.reduce((acc, p) => {
      const statusObj = statuses.find(s => s.StatusID === p.ProjectStatus);
      const name = statusObj ? statusObj.StatusName : 'Unknown';
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});

    const pieData = Object.keys(projectStatusCounts).map(name => ({
      name,
      value: projectStatusCounts[name]
    }));

    const COLORS = [CHART_COLORS.info, CHART_COLORS.accent, CHART_COLORS.slate];

    // Task Priority Bar Data
    const taskPriorityCounts = tasks.reduce((acc, t) => {
      const priObj = priorities.find(p => p.PriorityID === t.PriorityID);
      const name = priObj ? priObj.PriorityName : 'Unknown';
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});

    const barData = Object.keys(taskPriorityCounts).map(name => ({
      name,
      tasks: taskPriorityCounts[name]
    }));

    return (
      <div className="space-y-8 animate-fade-in">
        {/* Stat Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <GlassCard key={i} className="flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {stat.label}
                  </span>
                  <div className={`p-2.5 rounded-xl ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-3xl font-bold font-heading">{stat.value}</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">{stat.subtext}</p>
                </div>
              </GlassCard>
            );
          })}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Project Status Pie Chart */}
          <GlassCard>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-6 uppercase tracking-wider font-heading">
              Project Status Distribution
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(9, 10, 15, 0.8)', 
                      borderColor: 'rgba(255,255,255,0.1)', 
                      borderRadius: '12px',
                      color: '#fff' 
                    }} 
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Task Priority Bar Chart */}
          <GlassCard>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-6 uppercase tracking-wider font-heading">
              Task Priority Distribution
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ 
                      background: 'rgba(9, 10, 15, 0.8)', 
                      borderColor: 'rgba(255,255,255,0.1)', 
                      borderRadius: '12px',
                      color: '#fff' 
                    }}
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  />
                  <Bar dataKey="tasks" fill={CHART_COLORS.primary} radius={[6, 6, 0, 0]}>
                    {barData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={
                          entry.name === 'Critical' ? CHART_COLORS.danger :
                          entry.name === 'High' ? CHART_COLORS.warning :
                          entry.name === 'Medium' ? CHART_COLORS.primary :
                          CHART_COLORS.slate
                        } 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* Recent Activities Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Project Allocations */}
          <GlassCard>
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-heading">
                Active Projects
              </h4>
              <button 
                onClick={() => setActiveTab('projects')}
                className="text-xs text-indigo-500 hover:text-indigo-400 font-semibold"
              >
                Manage Projects
              </button>
            </div>
            <div className="space-y-4">
              {projects.slice(0, 3).map(p => {
                const statusObj = statuses.find(s => s.StatusID === p.ProjectStatus);
                return (
                  <div key={p.ProjectId} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-100/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5">
                    <div className="overflow-hidden mr-4">
                      <h5 className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate">{p.ProjectTitle}</h5>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Start: {p.StartDate} | End: {p.EndDate}</span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusObj?.StatusCssClass}`}>
                      {statusObj?.StatusName}
                    </span>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          {/* System Users List */}
          <GlassCard>
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-heading">
                System Faculty & Students
              </h4>
              <button 
                onClick={() => setActiveTab('users')}
                className="text-xs text-indigo-500 hover:text-indigo-400 font-semibold"
              >
                Manage Users
              </button>
            </div>
            <div className="space-y-4">
              {users.slice(1, 5).map(u => {
                return (
                  <div key={u.UserId} className="flex items-center justify-between p-3 rounded-2xl bg-slate-100/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5">
                    <div className="flex items-center gap-3">
                      <img src={u.ProfilePicturePath} alt={u.FullName} className="w-9 h-9 rounded-xl object-cover bg-slate-200" />
                      <div>
                        <h5 className="font-semibold text-sm text-slate-800 dark:text-slate-200">{u.FullName}</h5>
                        <p className="text-[10px] text-slate-400">{u.Email}</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                      {u.RoleId === 2 ? 'Faculty' : 'Student'}
                    </span>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>
      </div>
    );
  };

  // RENDER FACULTY DASHBOARD
  const renderFacultyDashboard = () => {
    const supervisedProjects = projects.filter(p => p.FacultyId === currentUser.UserId);
    const projIds = supervisedProjects.map(p => p.ProjectId);
    const supervisedTasks = tasks.filter(t => projIds.includes(t.ProjectId));
    
    // Tasks that need evaluation (Status = Completed, but no EarnedScore assigned yet)
    const needsEvaluation = supervisedTasks.filter(t => t.TaskStatus === 3 && t.EarnedScore === null);

    return (
      <div className="space-y-8 animate-fade-in">
        {/* Statistics Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <GlassCard className="flex items-center gap-5">
            <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-500">
              <FolderGit className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Projects Supervised</span>
              <h3 className="text-3xl font-bold font-heading mt-1">{supervisedProjects.length}</h3>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center gap-5">
            <div className="p-4 rounded-2xl bg-purple-500/10 text-purple-500">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Tasks Managed</span>
              <h3 className="text-3xl font-bold font-heading mt-1">{supervisedTasks.length}</h3>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center gap-5 border-amber-500/20 dark:border-amber-500/20 bg-amber-500/5">
            <div className="p-4 rounded-2xl bg-amber-500/15 text-amber-500">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block text-amber-600 dark:text-amber-500">Needs Evaluation</span>
              <h3 className="text-3xl font-bold font-heading text-amber-600 dark:text-amber-500 mt-1">{needsEvaluation.length}</h3>
            </div>
          </GlassCard>
        </div>

        {/* Needs Evaluation Action Queue */}
        {needsEvaluation.length > 0 && (
          <GlassCard className="border-amber-500/30">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider font-heading">
                Pending Student Evaluations Queue
              </h4>
            </div>
            <div className="divide-y divide-slate-200/50 dark:divide-white/5 space-y-3.5">
              {needsEvaluation.map(t => {
                const proj = projects.find(p => p.ProjectId === t.ProjectId);
                const stud = users.find(u => u.UserId === t.StudentId);
                return (
                  <div key={t.TaskId} className="flex flex-col md:flex-row md:items-center justify-between pt-3.5 first:pt-0 gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-500 uppercase">{proj?.ProjectTitle}</span>
                      <h5 className="font-semibold text-sm text-slate-800 dark:text-slate-200 mt-0.5">{t.TaskTitle}</h5>
                      <p className="text-xs text-slate-500 mt-1">Submitted by: <strong className="text-slate-400">{stud?.FullName}</strong></p>
                      {t.StudentRemarks && (
                        <p className="text-xs italic text-slate-400 mt-1 bg-slate-100 dark:bg-white/5 p-2 rounded-lg border-l-2 border-indigo-500">
                          "{t.StudentRemarks}"
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setActiveTab('tasks')}
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 text-white hover:bg-amber-600 shadow-md shadow-amber-500/20 active:scale-95 transition-all self-start md:self-auto"
                    >
                      Evaluate Task
                    </button>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        )}

        {/* Projects Under Supervision Table */}
        <GlassCard>
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-heading">
              Supervised Project Portfolios
            </h4>
            <button
              onClick={() => setActiveTab('projects')}
              className="text-xs text-indigo-500 hover:text-indigo-400 font-semibold"
            >
              View All Projects
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/50 dark:border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-2">Project Name</th>
                  <th className="pb-3">Assigned Students</th>
                  <th className="pb-3">Completed Tasks</th>
                  <th className="pb-3">Project Progress</th>
                  <th className="pb-3">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/30 dark:divide-white/5">
                {supervisedProjects.map(p => {
                  const assignedStuds = users.filter(u => p.StudentIds.includes(u.UserId));
                  return (
                    <tr key={p.ProjectId} className="hover:bg-slate-100/30 dark:hover:bg-white/5 transition-colors">
                      <td className="py-4 pl-2 font-medium text-sm text-slate-800 dark:text-slate-200">{p.ProjectTitle}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-1.5">
                          {assignedStuds.map(s => (
                            <img
                              key={s.UserId}
                              src={s.ProfilePicturePath}
                              title={s.FullName}
                              className="w-7 h-7 rounded-lg border border-slate-200 object-cover bg-slate-100"
                            />
                          ))}
                        </div>
                      </td>
                      <td className="py-4 text-xs font-semibold text-slate-500">
                        {p.CompletedTasks} / {p.TotalTasks} tasks
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-3 w-40">
                          <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                            <div 
                              className="h-full bg-gradient-premium rounded-full" 
                              style={{ width: `${p.ProgressPercentage}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-indigo-500">{p.ProgressPercentage}%</span>
                        </div>
                      </td>
                      <td className="py-4 text-xs text-slate-500">{formatDate(p.EndDate)}</td>
                    </tr>
                  );
                })}
                {supervisedProjects.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 text-sm">
                      No active projects are allocated to your supervision.
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

  // RENDER STUDENT DASHBOARD
  const renderStudentDashboard = () => {
    const myProjects = projects.filter(p => p.StudentIds.includes(currentUser.UserId));
    const myProjIds = myProjects.map(p => p.ProjectId);
    const myTasks = tasks.filter(t => t.StudentId === currentUser.UserId);
    
    const completedTasks = myTasks.filter(t => t.TaskStatus === 3);
    const pendingTasks = myTasks.filter(t => t.TaskStatus !== 3);

    // Calculate score
    const earnedScoreSum = completedTasks.reduce((sum, t) => sum + (t.EarnedScore || 0), 0);
    const potentialScoreSum = myTasks.reduce((sum, t) => sum + (t.AssignedScore || 0), 0);

    return (
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-premium text-white shadow-xl shadow-indigo-500/10">
          <div>
            <h2 className="text-2xl font-bold font-heading">Welcome Back, {currentUser.FullName}!</h2>
            <p className="text-white/80 text-sm mt-1">
              You are assigned to {myProjects.length} academic project{myProjects.length === 1 ? '' : 's'}. Keep track of your tasks below.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10 self-start md:self-auto">
            <Calendar className="w-5 h-5 text-white/80" />
            <div>
              <p className="text-[10px] text-white/60 uppercase font-bold tracking-wider">Current Time</p>
              <p className="text-sm font-semibold">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
            </div>
          </div>
        </div>

        {/* Dashboard Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <GlassCard className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-500">
              <FolderGit className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">My Projects</span>
              <h4 className="text-xl font-bold font-heading mt-0.5">{myProjects.length}</h4>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-purple-500/10 text-purple-500">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending Tasks</span>
              <h4 className="text-xl font-bold font-heading mt-0.5">{pendingTasks.length}</h4>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-500">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Completed Tasks</span>
              <h4 className="text-xl font-bold font-heading mt-0.5">{completedTasks.length} / {myTasks.length}</h4>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-sky-500/10 text-sky-500">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Academic Score</span>
              <h4 className="text-xl font-bold font-heading mt-0.5 text-sky-600 dark:text-sky-400">
                {earnedScoreSum} / {potentialScoreSum} pts
              </h4>
            </div>
          </GlassCard>
        </div>

        {/* Main Content Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Active Tasks Checklist */}
          <GlassCard className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-heading">
                My Active Tasks Queue
              </h4>
              <button
                onClick={() => setActiveTab('tasks')}
                className="text-xs text-indigo-500 hover:text-indigo-400 font-semibold"
              >
                Go to Tasks Page
              </button>
            </div>

            <div className="space-y-4">
              {pendingTasks.slice(0, 4).map(t => {
                const proj = projects.find(p => p.ProjectId === t.ProjectId);
                const pri = priorities.find(p => p.PriorityID === t.PriorityID);
                return (
                  <div key={t.TaskId} className="p-4 rounded-2xl bg-slate-100/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{proj?.ProjectTitle}</span>
                      <h5 className="font-semibold text-sm text-slate-800 dark:text-slate-200 mt-0.5">{t.TaskTitle}</h5>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${pri?.PriortyCssClass}`}>
                          {pri?.PriorityName} Priority
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Due: {formatDate(t.DueDate)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('tasks')}
                      className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-slate-800 dark:text-white active:scale-95 transition-all self-start md:self-auto"
                    >
                      Update Task
                    </button>
                  </div>
                );
              })}
              {pendingTasks.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-sm">
                  🎉 Good job! You have no pending tasks to complete.
                </div>
              )}
            </div>
          </GlassCard>

          {/* Project Details Sidebar */}
          <div className="space-y-6">
            {myProjects.map(p => {
              const faculty = users.find(u => u.UserId === p.FacultyId);
              return (
                <GlassCard key={p.ProjectId}>
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block">Supervised Project</span>
                  <h4 className="font-bold text-base text-slate-800 dark:text-slate-200 mt-1 font-heading">{p.ProjectTitle}</h4>
                  
                  {/* Progress Ring / Percentage */}
                  <div className="my-6 flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-full border-4 border-slate-200 dark:border-slate-800 flex items-center justify-center font-bold text-sm text-indigo-500">
                      {p.ProgressPercentage}%
                      <div className="absolute inset-[-4px] rounded-full border-4 border-indigo-500/20" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Project Completion</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                        {p.CompletedTasks} of {p.TotalTasks} tasks done
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200/50 dark:border-white/5 space-y-3.5">
                    {faculty && (
                      <div className="flex items-center gap-3">
                        <img src={faculty.ProfilePicturePath} className="w-8 h-8 rounded-lg object-cover bg-slate-200" />
                        <div>
                          <p className="text-[10px] text-slate-400">Supervisor</p>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{faculty.FullName}</p>
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] text-slate-400">Assigned Deadline</p>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{formatDate(p.EndDate)}</p>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>

        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">
            {currentUser?.RoleName} Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            SPM System status, performance summaries, and task indicators.
          </p>
        </div>
      </div>

      {isAdmin && renderAdminDashboard()}
      {isFaculty && renderFacultyDashboard()}
      {isStudent && renderStudentDashboard()}
    </div>
  );
};

export default Dashboard;
