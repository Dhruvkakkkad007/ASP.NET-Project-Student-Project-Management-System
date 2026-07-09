import React, { createContext, useState, useEffect } from 'react';

export const DatabaseContext = createContext();

// Mock Initial Data based on PDF specifications
const INITIAL_ROLES = [
  { RoleId: 1, RoleName: 'Admin', Description: 'Full access to all modules and settings.' },
  { RoleId: 2, RoleName: 'Faculty', Description: 'Can supervise students and manage project assignments.' },
  { RoleId: 3, RoleName: 'Student', Description: 'Can view and manage own projects and tasks.' }
];

const INITIAL_STATUSES = [
  { StatusID: 1, StatusName: 'Not Started', StatusCssClass: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
  { StatusID: 2, StatusName: 'In Progress', StatusCssClass: 'bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400' },
  { StatusID: 3, StatusName: 'Completed', StatusCssClass: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' },
  { StatusID: 4, StatusName: 'Rejected', StatusCssClass: 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400' }
];

const INITIAL_PRIORITIES = [
  { PriorityID: 1, PriorityName: 'Low', PriortyCssClass: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
  { PriorityID: 2, PriorityName: 'Medium', PriortyCssClass: 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400' },
  { PriorityID: 3, PriorityName: 'High', PriortyCssClass: 'bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400' },
  { PriorityID: 4, PriorityName: 'Critical', PriortyCssClass: 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400' }
];

const INITIAL_USERS = [
  {
    UserId: 1,
    FullName: 'Aarav Patel',
    Email: 'admin@spms.com',
    Password: 'admin123',
    MobileNumber: '9876543210',
    ProfilePicturePath: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150',
    RoleId: 1, // Admin
    IsActive: true,
    IsDeleted: false
  },
  {
    UserId: 2,
    FullName: 'Priya Sharma',
    Email: 'priya.sharma@spms.com',
    Password: 'faculty123',
    MobileNumber: '9876543211',
    ProfilePicturePath: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150',
    RoleId: 2, // Faculty
    IsActive: true,
    IsDeleted: false
  },
  {
    UserId: 3,
    FullName: 'Rohan Mehta',
    Email: 'rohan.mehta@spms.com',
    Password: 'student123',
    MobileNumber: '9876543212',
    ProfilePicturePath: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150',
    RoleId: 3, // Student
    IsActive: true,
    IsDeleted: false
  },
  {
    UserId: 4,
    FullName: 'Sneha Desai',
    Email: 'sneha.desai@spms.com',
    Password: 'student123',
    MobileNumber: '9876543213',
    ProfilePicturePath: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150',
    RoleId: 3, // Student
    IsActive: true,
    IsDeleted: false
  },
  {
    UserId: 5,
    FullName: 'Vikram Singh',
    Email: 'vikram.singh@spms.com',
    Password: 'faculty123',
    MobileNumber: '9876543214',
    ProfilePicturePath: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150',
    RoleId: 2, // Faculty
    IsActive: false, // Inactive as in PDF screen
    IsDeleted: false
  },
  {
    UserId: 6,
    FullName: 'Anita Joshi',
    Email: 'anita.joshi@spms.com',
    Password: 'student123',
    MobileNumber: '9876543215',
    ProfilePicturePath: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150',
    RoleId: 3, // Student
    IsActive: true,
    IsDeleted: false
  },
  {
    UserId: 7,
    FullName: 'Dr. Nisha Kapoor',
    Email: 'nisha.kapoor@spms.com',
    Password: 'faculty123',
    MobileNumber: '9876543216',
    ProfilePicturePath: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150',
    RoleId: 2, // Faculty
    IsActive: true,
    IsDeleted: false
  },
  {
    UserId: 8,
    FullName: 'Rahul Verma',
    Email: 'rahul.verma@spms.com',
    Password: 'student123',
    MobileNumber: '9876543217',
    ProfilePicturePath: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150',
    RoleId: 3, // Student
    IsActive: true,
    IsDeleted: false
  },
  {
    UserId: 9,
    FullName: 'Arjun Reddy',
    Email: 'arjun.reddy@spms.com',
    Password: 'student123',
    MobileNumber: '9876543218',
    ProfilePicturePath: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150',
    RoleId: 3, // Student
    IsActive: true,
    IsDeleted: false
  }
];

const INITIAL_PROJECTS = [
  {
    ProjectId: 1,
    ProjectTitle: 'E-Commerce Platform',
    Description: 'Build a full-stack e-commerce web application with standard payment gateways, catalog filters, and admin dashboards.',
    StudentIds: [3, 6, 9], // Rohan Mehta, Anita Joshi, Arjun Reddy
    FacultyId: 2, // Priya Sharma
    AssignedDate: '2024-09-01T00:00:00Z',
    IsDeleted: false,
    ProjectStatus: 2, // In Progress
    StartDate: '2024-09-01',
    EndDate: '2025-03-01',
    TotalTasks: 3,
    CompletedTasks: 1,
    ProgressPercentage: 33.33
  },
  {
    ProjectId: 2,
    ProjectTitle: 'Library Management System',
    Description: 'Develop a library management system with barcode scanning integration, fine calculation, and shelf placement helpers.',
    StudentIds: [3], // Rohan Mehta
    FacultyId: 2, // Priya Sharma
    AssignedDate: '2024-08-15T00:00:00Z',
    IsDeleted: false,
    ProjectStatus: 3, // Completed
    StartDate: '2024-08-15',
    EndDate: '2025-02-15',
    TotalTasks: 1,
    CompletedTasks: 1,
    ProgressPercentage: 100.00
  },
  {
    ProjectId: 3,
    ProjectTitle: 'AI Chatbot',
    Description: 'Create an AI-powered chatbot for resolving student academic queries and scheduling reminders.',
    StudentIds: [6, 8], // Anita Joshi, Rahul Verma
    FacultyId: 7, // Dr. Nisha Kapoor
    AssignedDate: '2025-01-01T00:00:00Z',
    IsDeleted: false,
    ProjectStatus: 2, // In Progress
    StartDate: '2025-01-01',
    EndDate: '2025-06-30',
    TotalTasks: 1,
    CompletedTasks: 0,
    ProgressPercentage: 0.00
  },
  {
    ProjectId: 4,
    ProjectTitle: 'IoT Weather Station',
    Description: 'Build an IoT-based weather monitoring station using Microcontrollers to report atmospheric pressure, temperature, and humidity.',
    StudentIds: [9, 8], // Arjun Reddy, Rahul Verma
    FacultyId: 7, // Dr. Nisha Kapoor
    AssignedDate: '2025-03-01T00:00:00Z',
    IsDeleted: false,
    ProjectStatus: 1, // Not Started
    StartDate: '2025-03-01',
    EndDate: '2025-09-01',
    TotalTasks: 0,
    CompletedTasks: 0,
    ProgressPercentage: 0.00
  }
];

const INITIAL_TASKS = [
  {
    TaskId: 1,
    ProjectId: 1,
    TaskTitle: 'Design Database Schema',
    TaskDescription: 'Draft relational database structure and foreign key constraints on paper and draw the ERD.',
    TaskStatus: 1, // Pending
    PriorityID: 3, // High
    AssignedScore: 10,
    EarnedScore: null,
    ProgressPercentage: 0,
    StartDate: '2024-09-05',
    DueDate: '2024-09-15',
    CompletedDate: null,
    FacultyRemarks: null,
    StudentRemarks: null,
    StudentId: 3, // Rohan Mehta
    IsDeleted: false
  },
  {
    TaskId: 2,
    ProjectId: 1,
    TaskTitle: 'Setup Project Structure',
    TaskDescription: 'Initialize clean react-vite scaffolding, configure routers, state, and test the starter code.',
    TaskStatus: 2, // In Progress
    PriorityID: 2, // Medium
    AssignedScore: 10,
    EarnedScore: null,
    ProgressPercentage: 50,
    StartDate: '2024-09-10',
    DueDate: '2024-09-20',
    CompletedDate: null,
    FacultyRemarks: null,
    StudentRemarks: 'Router has been configured. Creating subfolders.',
    StudentId: 3, // Rohan Mehta
    IsDeleted: false
  },
  {
    TaskId: 3,
    ProjectId: 1,
    TaskTitle: 'Implement User Authentication',
    TaskDescription: 'Set up JWT token decoding, context session storage, and protect user routes based on role permissions.',
    TaskStatus: 3, // Completed
    PriorityID: 3, // High
    AssignedScore: 15,
    EarnedScore: 15,
    ProgressPercentage: 100,
    StartDate: '2024-09-12',
    DueDate: '2024-10-01',
    CompletedDate: '2024-09-30',
    FacultyRemarks: 'Excellent security implementation. Nice validation handling.',
    StudentRemarks: 'Used secure cookies with LocalStorage fallback. Fully functional JWT.',
    StudentId: 3, // Rohan Mehta
    IsDeleted: false
  },
  {
    TaskId: 4,
    ProjectId: 2,
    TaskTitle: 'Create Book Catalog Module',
    TaskDescription: 'Implement list, search, category filters, and detailed view of books within the library.',
    TaskStatus: 3, // Completed
    PriorityID: 2, // Medium
    AssignedScore: 20,
    EarnedScore: 18,
    ProgressPercentage: 100,
    StartDate: '2024-08-20',
    DueDate: '2024-10-15',
    CompletedDate: '2024-10-12',
    FacultyRemarks: 'Very clean UI, and search works fast. Missing some edge case validations in filter.',
    StudentRemarks: 'Completed all catalog layouts. Basic tests passed.',
    StudentId: 3, // Rohan Mehta
    IsDeleted: false
  },
  {
    TaskId: 5,
    ProjectId: 3,
    TaskTitle: 'Integrate LLM API',
    TaskDescription: 'Connect to standard Gemini API via proxy backend and implement streaming text results.',
    TaskStatus: 1, // Pending
    PriorityID: 4, // Critical
    AssignedScore: 30,
    EarnedScore: null,
    ProgressPercentage: 0,
    StartDate: '2025-01-10',
    DueDate: '2025-02-10',
    CompletedDate: null,
    FacultyRemarks: null,
    StudentRemarks: null,
    StudentId: 6, // Anita Joshi
    IsDeleted: false
  }
];

export const DatabaseProvider = ({ children }) => {
  const [roles, setRoles] = useState(() => {
    const data = localStorage.getItem('SPM_Roles');
    return data ? JSON.parse(data) : INITIAL_ROLES;
  });

  const [users, setUsers] = useState(() => {
    const data = localStorage.getItem('SPM_Users');
    return data ? JSON.parse(data) : INITIAL_USERS;
  });

  const [projects, setProjects] = useState(() => {
    const data = localStorage.getItem('SPM_Projects');
    return data ? JSON.parse(data) : INITIAL_PROJECTS;
  });

  const [tasks, setTasks] = useState(() => {
    const data = localStorage.getItem('SPM_Tasks');
    return data ? JSON.parse(data) : INITIAL_TASKS;
  });

  const statuses = INITIAL_STATUSES;
  const priorities = INITIAL_PRIORITIES;

  // Persist data in localStorage
  useEffect(() => {
    localStorage.setItem('SPM_Roles', JSON.stringify(roles));
  }, [roles]);

  useEffect(() => {
    localStorage.setItem('SPM_Users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('SPM_Projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('SPM_Tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Recalculates Project Progress based on Tasks
  const recalculateProjectStats = (projId, currentTasks = tasks) => {
    const projectTasks = currentTasks.filter(t => t.ProjectId === Number(projId) && !t.IsDeleted);
    const total = projectTasks.length;
    const completed = projectTasks.filter(t => t.TaskStatus === 3).length;
    
    let progress = 0;
    if (total > 0) {
      const totalProgress = projectTasks.reduce((acc, t) => {
        if (t.TaskStatus === 3) return acc + 100; // Completed
        if (t.TaskStatus === 2) return acc + 50;  // In Progress
        return acc + 0; // Pending / Rejected
      }, 0);
      progress = Number((totalProgress / total).toFixed(2));
    }

    // Determine project status automatically
    let status = 1; // Not Started
    if (total > 0) {
      if (completed === total) {
        status = 3; // Completed
      } else {
        status = 2; // In Progress
      }
    }

    setProjects(prev =>
      prev.map(p =>
        p.ProjectId === Number(projId)
          ? {
              ...p,
              TotalTasks: total,
              CompletedTasks: completed,
              ProgressPercentage: progress,
              ProjectStatus: status
            }
          : p
      )
    );
  };

  // Roles CRUD
  const addRole = (role) => {
    const newId = roles.length > 0 ? Math.max(...roles.map(r => r.RoleId)) + 1 : 1;
    setRoles(prev => [...prev, { ...role, RoleId: newId }]);
  };

  const updateRole = (roleId, updatedRole) => {
    setRoles(prev =>
      prev.map(r => (r.RoleId === Number(roleId) ? { ...r, ...updatedRole } : r))
    );
  };

  const deleteRole = (roleId) => {
    setRoles(prev => prev.filter(r => r.RoleId !== Number(roleId)));
  };

  // Users CRUD
  const addUser = (user) => {
    const newId = users.length > 0 ? Math.max(...users.map(u => u.UserId)) + 1 : 1;
    const defaultAvatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.FullName)}`;
    setUsers(prev => [
      ...prev,
      {
        ...user,
        UserId: newId,
        ProfilePicturePath: user.ProfilePicturePath || defaultAvatar,
        IsActive: user.IsActive !== undefined ? user.IsActive : true,
        IsDeleted: false
      }
    ]);
  };

  const updateUser = (userId, updatedUser) => {
    setUsers(prev =>
      prev.map(u => (u.UserId === Number(userId) ? { ...u, ...updatedUser } : u))
    );
  };

  const deleteUser = (userId) => {
    // Soft Delete
    setUsers(prev =>
      prev.map(u => (u.UserId === Number(userId) ? { ...u, IsDeleted: true } : u))
    );
  };

  // Projects CRUD
  const addProject = (project) => {
    const newId = projects.length > 0 ? Math.max(...projects.map(p => p.ProjectId)) + 1 : 1;
    const newProj = {
      ...project,
      ProjectId: newId,
      AssignedDate: new Date().toISOString(),
      IsDeleted: false,
      ProjectStatus: 1, // Not Started
      TotalTasks: 0,
      CompletedTasks: 0,
      ProgressPercentage: 0
    };
    setProjects(prev => [...prev, newProj]);
  };

  const updateProject = (projectId, updatedProject) => {
    setProjects(prev =>
      prev.map(p => (p.ProjectId === Number(projectId) ? { ...p, ...updatedProject } : p))
    );
  };

  const deleteProject = (projectId) => {
    setProjects(prev =>
      prev.map(p => (p.ProjectId === Number(projectId) ? { ...p, IsDeleted: true } : p))
    );
  };

  // Tasks CRUD
  const addTask = (task) => {
    const newId = tasks.length > 0 ? Math.max(...tasks.map(t => t.TaskId)) + 1 : 1;
    const progress = task.TaskStatus === 3 ? 100 : task.TaskStatus === 2 ? 50 : 0;
    
    const newTask = {
      ...task,
      TaskId: newId,
      ProgressPercentage: progress,
      CompletedDate: task.TaskStatus === 3 ? new Date().toISOString().split('T')[0] : null,
      FacultyRemarks: null,
      StudentRemarks: null,
      IsDeleted: false
    };

    const newTasksList = [...tasks, newTask];
    setTasks(newTasksList);
    recalculateProjectStats(task.ProjectId, newTasksList);
  };

  const updateTask = (taskId, updatedFields) => {
    let targetProjectId = null;
    
    setTasks(prev => {
      const nextTasks = prev.map(t => {
        if (t.TaskId === Number(taskId)) {
          targetProjectId = t.ProjectId;
          
          let progress = t.ProgressPercentage;
          if (updatedFields.TaskStatus !== undefined) {
            progress = updatedFields.TaskStatus === 3 ? 100 : updatedFields.TaskStatus === 2 ? 50 : 0;
          }

          let compDate = t.CompletedDate;
          if (updatedFields.TaskStatus === 3 && t.TaskStatus !== 3) {
            compDate = new Date().toISOString().split('T')[0];
          } else if (updatedFields.TaskStatus !== undefined && updatedFields.TaskStatus !== 3) {
            compDate = null;
          }

          return {
            ...t,
            ...updatedFields,
            ProgressPercentage: progress,
            CompletedDate: compDate
          };
        }
        return t;
      });

      // Recalculate project stats after state update
      setTimeout(() => {
        if (targetProjectId) {
          recalculateProjectStats(targetProjectId, nextTasks);
        }
      }, 0);

      return nextTasks;
    });
  };

  const deleteTask = (taskId) => {
    let targetProjectId = null;
    setTasks(prev => {
      const nextTasks = prev.map(t => {
        if (t.TaskId === Number(taskId)) {
          targetProjectId = t.ProjectId;
          return { ...t, IsDeleted: true };
        }
        return t;
      });

      setTimeout(() => {
        if (targetProjectId) {
          recalculateProjectStats(targetProjectId, nextTasks);
        }
      }, 0);

      return nextTasks;
    });
  };

  return (
    <DatabaseContext.Provider value={{
      roles,
      users: users.filter(u => !u.IsDeleted),
      projects: projects.filter(p => !p.IsDeleted),
      tasks: tasks.filter(t => !t.IsDeleted),
      statuses,
      priorities,
      addRole,
      updateRole,
      deleteRole,
      addUser,
      updateUser,
      deleteUser,
      addProject,
      updateProject,
      deleteProject,
      addTask,
      updateTask,
      deleteTask
    }}>
      {children}
    </DatabaseContext.Provider>
  );
};
