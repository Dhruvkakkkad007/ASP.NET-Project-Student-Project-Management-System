import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  projectApi,
  userApi,
  projectAllocationApi,
  projectTaskApi,
  lookupApi
} from '../services/apiService';
import {
  initialUsers,
  initialRoles,
  initialUserTypes,
  initialUserRoles,
  initialTaskStatuses,
  initialTaskPriorities,
  initialProjects,
  initialAllocations,
  initialTasks
} from '../data/mockData';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Authentication & Role State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentRoleID, setCurrentRoleID] = useState(3); // 1: Admin, 2: Faculty, 3: Student
  const [currentUser, setCurrentUser] = useState(null);

  // Master Database Data Arrays
  const [roles, setRoles] = useState(initialRoles);
  const [userTypes, setUserTypes] = useState(initialUserTypes);
  const [userRoles, setUserRoles] = useState(initialUserRoles);
  const [taskStatuses, setTaskStatuses] = useState(initialTaskStatuses);
  const [taskPriorities, setTaskPriorities] = useState(initialTaskPriorities);

  const [users, setUsers] = useState(initialUsers);
  const [projects, setProjects] = useState(initialProjects);
  const [allocations, setAllocations] = useState(initialAllocations);
  const [tasks, setTasks] = useState(initialTasks);

  const [selectedTask, setSelectedTask] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  // Toast Notification helper
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Helper normalizer for users
  const normalizeUser = (u) => ({
    UserID: u.userId ?? u.UserID,
    UserTypeID: u.userTypeId ?? u.UserTypeID ?? u.roleId ?? u.RoleID ?? 3,
    UserCode: u.userCode ?? u.UserCode ?? `USR-${u.userId ?? u.UserID}`,
    FullName: u.fullName ?? u.FullName ?? 'User',
    Email: u.email ?? u.Email ?? '',
    Password: u.password ?? u.Password ?? 'password123',
    MobileNumber: u.mobileNumber ?? u.MobileNumber ?? '+1 555-010-0000',
    RoleID: u.userTypeId ?? u.roleId ?? u.RoleID ?? 3,
    RoleName: u.userTypeName ?? u.roleName ?? u.RoleName ?? (u.userTypeId === 1 ? 'Admin' : u.userTypeId === 2 ? 'Faculty' : 'Student'),
    ProfilePicturePath: u.profilePicturePath ?? u.ProfilePicturePath ?? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
    IsActive: u.isActive ?? u.IsActive ?? true,
    IsDeleted: u.isDeleted ?? u.IsDeleted ?? false,
    Department: u.department ?? u.Department ?? 'Computer Science'
  });

  // Helper normalizer for projects
  const normalizeProject = (p) => ({
    ProjectID: p.projectId ?? p.ProjectID,
    ProjectTitle: p.projectTitle ?? p.ProjectTitle,
    Description: p.description ?? p.Description ?? '',
    Department: p.department ?? p.Department ?? 'Computer Science',
    TechStack: p.techStack ?? p.TechStack ?? 'ASP.NET Core, React',
    IsActive: p.isActive ?? p.IsActive ?? true,
    CreatedAt: p.createdAt ?? p.CreatedAt ?? new Date().toISOString().split('T')[0]
  });

  // Helper normalizer for allocations
  const normalizeAllocation = (a) => ({
    ProjectAllocationID: a.projectAllocationId ?? a.ProjectAllocationID ?? a.AllocationID,
    AllocationID: a.projectAllocationId ?? a.ProjectAllocationID ?? a.AllocationID,
    ProjectID: a.projectId ?? a.ProjectID,
    ProjectTitle: a.projectTitle ?? a.ProjectTitle ?? `Project #${a.projectId ?? a.ProjectID}`,
    FacultyID: a.facultyId ?? a.FacultyID,
    FacultyName: a.facultyFullName ?? a.FacultyName ?? 'Faculty Guide',
    StudentID: a.studentId ?? a.StudentID,
    StudentName: a.studentFullName ?? a.StudentName ?? 'Student',
    StudentEmail: a.studentEmail ?? a.StudentEmail ?? '',
    StudentAvatar: a.studentAvatar ?? a.StudentAvatar ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    ProgressPercentage: a.progressPercentage ?? a.ProgressPercentage ?? 0,
    TotalTasksGiven: a.totalTasksGiven ?? a.TotalTasksGiven ?? 0,
    TotalCompletedTasks: a.totalCompletedTasks ?? a.TotalCompletedTasks ?? 0,
    OverAllGrade: a.overAllGrade ?? a.OverAllGrade ?? null,
    AssignedDate: a.assignedDate ?? a.AssignedDate ?? new Date().toISOString().split('T')[0],
    ProjectStartDate: a.projectStartDate ?? a.ProjectStartDate ?? new Date().toISOString().split('T')[0],
    ProjectEndDate: a.projectEndDate ?? a.ProjectEndDate ?? '2026-11-30',
    Status: a.status ?? a.Status ?? 'Active'
  });

  // Helper normalizer for tasks
  const normalizeTask = (t) => {
    const statusMap = {
      1: { name: 'Pending', css: 'badge-pending' },
      2: { name: 'Ongoing', css: 'badge-ongoing' },
      3: { name: 'Completed', css: 'badge-completed' },
      4: { name: 'Cancelled', css: 'badge-cancelled' }
    };
    const priorityMap = {
      1: { name: 'Low', css: 'priority-low' },
      2: { name: 'Moderate', css: 'priority-medium' },
      3: { name: 'High', css: 'priority-high' },
      4: { name: 'Critical', css: 'priority-critical' }
    };

    const sId = t.taskStatusId ?? t.TaskStatusID ?? 1;
    const pId = t.taskPriorityId ?? t.TaskPriorityID ?? 2;

    return {
      TaskID: t.taskId ?? t.TaskID,
      ProjectAllocationID: t.projectAllocationId ?? t.ProjectAllocationID ?? t.AllocationID,
      AllocationID: t.projectAllocationId ?? t.ProjectAllocationID ?? t.AllocationID,
      ProjectID: t.projectId ?? t.ProjectID,
      TaskTitle: t.taskTitle ?? t.TaskTitle,
      TaskDescription: t.taskDescription ?? t.TaskDescription ?? '',
      TaskStatusID: sId,
      TaskStatusName: t.taskStatusName ?? t.TaskStatusName ?? statusMap[sId]?.name ?? 'Pending',
      TaskStatusCssClass: t.taskStatusCssClass ?? t.TaskStatusCssClass ?? statusMap[sId]?.css ?? 'badge-pending',
      TaskPriorityID: pId,
      TaskPriorityName: t.taskPriorityName ?? t.TaskPriorityName ?? priorityMap[pId]?.name ?? 'Moderate',
      TaskPriorityCssClass: t.taskPriorityCssClass ?? t.TaskPriorityCssClass ?? priorityMap[pId]?.css ?? 'priority-medium',
      AssignedScore: t.assignedScore ?? t.AssignedScore ?? 100,
      EarnedScore: t.earnedScore ?? t.EarnedScore ?? 0,
      ProgressPercentage: t.progressPercentage ?? t.ProgressPercentage ?? 0,
      TaskAssignedDate: t.taskAssignedDate ?? t.TaskAssignedDate ?? new Date().toISOString().split('T')[0],
      TaskStartDate: t.taskStartDate ?? t.TaskStartDate ?? null,
      TaskDueDate: t.taskDueDate ?? t.TaskDueDate ?? '2026-09-30',
      TaskCompletedDate: t.taskCompletedDate ?? t.TaskCompletedDate ?? null,
      NextFollowUpDate: t.nextFollowUpDate ?? t.NextFollowUpDate ?? null,
      FacultyRemarks: t.facultyRemarks ?? t.FacultyRemarks ?? null,
      StudentRemarks: t.studentRemarks ?? t.StudentRemarks ?? null,
      RemarksHistory: t.remarksHistory ?? t.RemarksHistory ?? []
    };
  };

  // -------------------------------------------------------------
  // INITIAL API CONSUMPTION & SYNCHRONIZATION
  // -------------------------------------------------------------
  const fetchAllFromBackendApis = async () => {
    try {
      const [usersRes, projRes, allocRes, taskRes, statusRes, prioRes, roleRes] = await Promise.all([
        userApi.getAll(),
        projectApi.getAll(),
        projectAllocationApi.getAll(),
        projectTaskApi.getAll(),
        lookupApi.getTaskStatuses(),
        lookupApi.getTaskPriorities(),
        lookupApi.getRoles()
      ]);

      const connected = !usersRes.isNetworkError && !projRes.isNetworkError;
      setIsBackendConnected(connected);

      if (connected) {
        console.log('[SPMS API] Connected to live ASP.NET Core Backend!');
      }

      if (usersRes.success && Array.isArray(usersRes.data) && usersRes.data.length > 0) {
        setUsers(usersRes.data.map(normalizeUser));
      }
      if (projRes.success && Array.isArray(projRes.data) && projRes.data.length > 0) {
        setProjects(projRes.data.map(normalizeProject));
      }
      if (allocRes.success && Array.isArray(allocRes.data) && allocRes.data.length > 0) {
        setAllocations(allocRes.data.map(normalizeAllocation));
      }
      if (taskRes.success && Array.isArray(taskRes.data) && taskRes.data.length > 0) {
        setTasks(taskRes.data.map(normalizeTask));
      }
      if (statusRes.success && Array.isArray(statusRes.data) && statusRes.data.length > 0) {
        setTaskStatuses(statusRes.data.map(s => ({
          TaskStatusID: s.taskStatusId,
          StatusName: s.taskStatusName,
          BadgeClass: s.taskStatusCssClass
        })));
      }
      if (prioRes.success && Array.isArray(prioRes.data) && prioRes.data.length > 0) {
        setTaskPriorities(prioRes.data.map(p => ({
          TaskPriorityID: p.taskPriorityId,
          PriorityName: p.taskPriorityName,
          BadgeClass: p.taskPriorityCssClass
        })));
      }
      if (roleRes.success && Array.isArray(roleRes.data) && roleRes.data.length > 0) {
        setRoles(roleRes.data.map(r => ({
          RoleID: r.roleId,
          RoleName: r.roleName,
          Description: r.description
        })));
      }
    } catch (err) {
      console.warn('[SPMS API Initialization Warning]:', err.message);
    }
  };

  useEffect(() => {
    fetchAllFromBackendApis();
  }, []);

  // Authentication: Login Handler
  const login = (emailOrCode, password, targetRoleID) => {
    if (!emailOrCode || !emailOrCode.trim()) {
      return { success: false, message: 'Please enter your email address or user code.' };
    }

    const cleanInput = emailOrCode.trim().toLowerCase();

    // Find matching user from Users list
    const matchedUser = users.find(u =>
      (u.Email && u.Email.toLowerCase() === cleanInput) ||
      (u.UserCode && u.UserCode.toLowerCase() === cleanInput)
    );

    if (!matchedUser) {
      return { success: false, message: 'Invalid credentials. User email or code not found.' };
    }

    if (targetRoleID && matchedUser.RoleID !== Number(targetRoleID)) {
      return {
        success: false,
        message: `Account found, but it belongs to role "${matchedUser.RoleName}". Please select the ${matchedUser.RoleName} tab.`
      };
    }

    if (matchedUser.IsDeleted) {
      return { success: false, message: 'This user account has been soft-deleted from the SPM system.' };
    }

    if (!matchedUser.IsActive) {
      return { success: false, message: 'Account disabled. Please contact system administrator.' };
    }

    // Authenticate user session
    setCurrentUser(matchedUser);
    setCurrentRoleID(matchedUser.RoleID);
    setIsAuthenticated(true);
    setActiveTab('dashboard');

    showToast(`Welcome back, ${matchedUser.FullName}! Access granted to ${matchedUser.RoleName} Portal.`);
    return { success: true };
  };

  // Authentication: Logout Handler
  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setSelectedTask(null);
    showToast('Signed out of SPM System successfully');
  };

  // Persona switching
  const switchRole = (roleID) => {
    const targetRole = Number(roleID);
    setCurrentRoleID(targetRole);

    let personaUser;
    if (targetRole === 1) {
      personaUser = users.find(u => u.RoleID === 1 && !u.IsDeleted) || users[0];
    } else if (targetRole === 2) {
      personaUser = users.find(u => u.RoleID === 2 && !u.IsDeleted) || users[1];
    } else {
      personaUser = users.find(u => u.RoleID === 3 && !u.IsDeleted) || users[3];
    }

    if (personaUser) {
      setCurrentUser(personaUser);
      setActiveTab('dashboard');
      showToast(`Switched view to ${personaUser.RoleName} (${personaUser.FullName})`);
    }
  };

  // Recalculate allocation metrics
  const updateAllocationProgress = (allocationID, currentTasks) => {
    const allocTasks = currentTasks.filter(t => t.ProjectAllocationID === allocationID || t.AllocationID === allocationID);
    const totalGiven = allocTasks.length;
    const completed = allocTasks.filter(t => t.TaskStatusID === 3).length;
    const progress = totalGiven > 0 ? Math.round((completed / totalGiven) * 100) : 0;

    setAllocations(prevAllocations =>
      prevAllocations.map(alloc => {
        if (alloc.ProjectAllocationID === allocationID || alloc.AllocationID === allocationID) {
          return {
            ...alloc,
            TotalTasksGiven: totalGiven,
            TotalCompletedTasks: completed,
            ProgressPercentage: progress
          };
        }
        return alloc;
      })
    );
  };

  // -------------------------------------------------------------
  // API CONSUMPTION: CREATE PROJECT MASTER (`POST /api/ProjectMasters`)
  // -------------------------------------------------------------
  const createNewProject = async (projectData) => {
    const payload = {
      projectTitle: projectData.ProjectTitle || projectData.projectTitle,
      description: projectData.Description || projectData.description || ''
    };

    const res = await projectApi.create(payload);

    if (res.success && res.data) {
      const created = normalizeProject(res.data);
      setProjects([created, ...projects]);
      showToast(`Project "${created.ProjectTitle}" published to catalog via API`);
    } else {
      const newID = Math.max(...projects.map(p => p.ProjectID), 100) + 1;
      const fallback = {
        ProjectID: newID,
        ProjectTitle: payload.projectTitle,
        Description: payload.description,
        Department: projectData.Department || 'Computer Science',
        TechStack: projectData.TechStack || 'React, ASP.NET',
        IsActive: true,
        CreatedAt: new Date().toISOString().split('T')[0]
      };
      setProjects([fallback, ...projects]);
      showToast(`Project "${fallback.ProjectTitle}" created in catalog`);
    }
  };

  // -------------------------------------------------------------
  // API CONSUMPTION: CREATE PROJECT ALLOCATION (`POST /api/ProjectAllocations`)
  // -------------------------------------------------------------
  const createNewAllocation = async (allocData) => {
    const payload = {
      projectId: Number(allocData.ProjectId || allocData.ProjectID),
      studentId: Number(allocData.StudentId || allocData.StudentID),
      facultyId: Number(allocData.FacultyId || allocData.FacultyID),
      assignedDate: allocData.AssignedDate || new Date().toISOString().split('T')[0],
      projectStartDate: allocData.ProjectStartDate || new Date().toISOString().split('T')[0],
      projectEndDate: allocData.ProjectEndDate || '2026-11-30',
      totalTasksGiven: 0,
      totalCompletedTasks: 0,
      progressPercentage: 0,
      overAllGrade: null
    };

    const res = await projectAllocationApi.create(payload);

    if (res.success && res.data) {
      const created = normalizeAllocation(res.data);
      setAllocations([created, ...allocations]);
      showToast(`Allocation created via API: ${created.ProjectTitle}`);
    } else {
      const project = projects.find(p => p.ProjectID === payload.projectId);
      const student = users.find(u => u.UserID === payload.studentId);
      const faculty = users.find(u => u.UserID === payload.facultyId);
      const newID = Math.max(...allocations.map(a => a.ProjectAllocationID || a.AllocationID), 0) + 1;
      const fallback = {
        ProjectAllocationID: newID,
        AllocationID: newID,
        ProjectID: payload.projectId,
        ProjectTitle: project?.ProjectTitle || `Project #${payload.projectId}`,
        FacultyID: payload.facultyId,
        FacultyName: faculty?.FullName || `Faculty #${payload.facultyId}`,
        StudentID: payload.studentId,
        StudentName: student?.FullName || `Student #${payload.studentId}`,
        StudentEmail: student?.Email || '',
        StudentAvatar: student?.ProfilePicturePath || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        ProgressPercentage: 0,
        TotalTasksGiven: 0,
        TotalCompletedTasks: 0,
        OverAllGrade: null,
        AssignedDate: payload.assignedDate,
        ProjectStartDate: payload.projectStartDate,
        ProjectEndDate: payload.projectEndDate,
        Status: 'Active'
      };
      setAllocations([fallback, ...allocations]);
      showToast(`Project allocated to ${fallback.StudentName}`);
    }
  };

  // -------------------------------------------------------------
  // API CONSUMPTION: CREATE PROJECT TASK (`POST /api/ProjectTasks`)
  // -------------------------------------------------------------
  const createNewTask = async (newTaskData) => {
    const allocID = Number(newTaskData.AllocationID || newTaskData.ProjectAllocationID);
    const payload = {
      projectAllocationId: allocID,
      taskTitle: newTaskData.TaskTitle || newTaskData.taskTitle,
      taskDescription: newTaskData.TaskDescription || newTaskData.taskDescription || '',
      taskStatusId: Number(newTaskData.TaskStatusID || newTaskData.taskStatusId || 1),
      taskPriorityId: Number(newTaskData.TaskPriorityID || newTaskData.taskPriorityId || 2),
      assignedScore: Number(newTaskData.AssignedScore || newTaskData.assignedScore) || 100,
      earnedScore: 0,
      progressPercentage: 0,
      taskAssignedDate: newTaskData.TaskStartDate || new Date().toISOString().split('T')[0],
      taskStartDate: newTaskData.TaskStartDate || null,
      taskDueDate: newTaskData.TaskDueDate || newTaskData.taskDueDate,
      nextFollowUpDate: newTaskData.NextFollowUpDate || newTaskData.nextFollowUpDate || null,
      facultyRemarks: null,
      studentRemarks: null
    };

    const res = await projectTaskApi.create(payload);

    if (res.success && res.data) {
      const created = normalizeTask(res.data);
      const newTasks = [created, ...tasks];
      setTasks(newTasks);
      updateAllocationProgress(allocID, newTasks);
      showToast(`Task "${created.TaskTitle}" created via API`);
    } else {
      const createdTask = normalizeTask({
        TaskId: Date.now(),
        ...payload,
        ProjectId: Number(newTaskData.ProjectID)
      });
      const newTasks = [createdTask, ...tasks];
      setTasks(newTasks);
      updateAllocationProgress(allocID, newTasks);
      showToast(`New task "${createdTask.TaskTitle}" assigned`);
    }
  };

  // -------------------------------------------------------------
  // API CONSUMPTION: UPDATE TASK STATUS (`PUT /api/ProjectTasks/{id}`)
  // -------------------------------------------------------------
  const updateTaskStatus = async (taskID, newStatusID) => {
    const targetTask = tasks.find(t => t.TaskID === taskID);
    if (!targetTask) return;

    const isNowCompleted = newStatusID === 3;
    const progress = isNowCompleted ? 100 : newStatusID === 2 ? 50 : 0;
    const today = new Date().toISOString().split('T')[0];

    const updatedTaskPayload = {
      projectAllocationId: targetTask.ProjectAllocationID || targetTask.AllocationID,
      taskTitle: targetTask.TaskTitle,
      taskDescription: targetTask.TaskDescription,
      taskStatusId: newStatusID,
      taskPriorityId: targetTask.TaskPriorityID,
      assignedScore: targetTask.AssignedScore,
      earnedScore: targetTask.EarnedScore,
      progressPercentage: progress,
      taskAssignedDate: targetTask.TaskAssignedDate,
      taskStartDate: targetTask.TaskStartDate || (newStatusID === 2 ? today : null),
      taskDueDate: targetTask.TaskDueDate,
      taskCompletedDate: isNowCompleted ? today : targetTask.TaskCompletedDate,
      nextFollowUpDate: targetTask.NextFollowUpDate,
      facultyRemarks: targetTask.FacultyRemarks,
      studentRemarks: targetTask.StudentRemarks
    };

    // Consume PUT /api/ProjectTasks/{id}
    await projectTaskApi.update(taskID, updatedTaskPayload);

    const statusMap = {
      1: { name: 'Pending', css: 'badge-pending' },
      2: { name: 'Ongoing', css: 'badge-ongoing' },
      3: { name: 'Completed', css: 'badge-completed' },
      4: { name: 'Cancelled', css: 'badge-cancelled' }
    };
    const statusInfo = statusMap[newStatusID] || statusMap[1];

    const updatedTasks = tasks.map(task => {
      if (task.TaskID === taskID) {
        const updated = {
          ...task,
          TaskStatusID: newStatusID,
          TaskStatusName: statusInfo.name,
          TaskStatusCssClass: statusInfo.css,
          ProgressPercentage: progress,
          TaskCompletedDate: isNowCompleted ? today : task.TaskCompletedDate,
          TaskStartDate: task.TaskStartDate || (newStatusID === 2 ? today : null)
        };
        if (selectedTask && selectedTask.TaskID === taskID) setSelectedTask(updated);
        return updated;
      }
      return task;
    });

    setTasks(updatedTasks);
    updateAllocationProgress(targetTask.ProjectAllocationID || targetTask.AllocationID, updatedTasks);
    showToast(`Task status updated to "${statusInfo.name}" via API`);
  };

  // Evaluate task score
  const evaluateTaskScore = async (taskID, earnedScore, facultyRemark) => {
    const numericScore = Number(earnedScore);
    const targetTask = tasks.find(t => t.TaskID === taskID);
    if (!targetTask) return;

    const isCompleted = targetTask.TaskStatusID === 3 || numericScore > 0;
    const today = new Date().toISOString().split('T')[0];

    const updatedPayload = {
      projectAllocationId: targetTask.ProjectAllocationID || targetTask.AllocationID,
      taskTitle: targetTask.TaskTitle,
      taskDescription: targetTask.TaskDescription,
      taskStatusId: isCompleted ? 3 : targetTask.TaskStatusID,
      taskPriorityId: targetTask.TaskPriorityID,
      assignedScore: targetTask.AssignedScore,
      earnedScore: numericScore,
      progressPercentage: isCompleted ? 100 : targetTask.ProgressPercentage,
      taskAssignedDate: targetTask.TaskAssignedDate,
      taskStartDate: targetTask.TaskStartDate,
      taskDueDate: targetTask.TaskDueDate,
      taskCompletedDate: isCompleted ? today : targetTask.TaskCompletedDate,
      nextFollowUpDate: targetTask.NextFollowUpDate,
      facultyRemarks: facultyRemark || targetTask.FacultyRemarks,
      studentRemarks: targetTask.StudentRemarks
    };

    // Consume PUT /api/ProjectTasks/{id}
    await projectTaskApi.update(taskID, updatedPayload);

    const updatedTasks = tasks.map(task => {
      if (task.TaskID === taskID) {
        const updated = {
          ...task,
          EarnedScore: numericScore,
          FacultyRemarks: facultyRemark || task.FacultyRemarks,
          TaskStatusID: isCompleted ? 3 : task.TaskStatusID,
          TaskStatusName: isCompleted ? 'Completed' : task.TaskStatusName,
          TaskStatusCssClass: isCompleted ? 'badge-completed' : task.TaskStatusCssClass,
          ProgressPercentage: isCompleted ? 100 : task.ProgressPercentage,
          TaskCompletedDate: task.TaskCompletedDate || (isCompleted ? today : null)
        };
        if (selectedTask && selectedTask.TaskID === taskID) setSelectedTask(updated);
        return updated;
      }
      return task;
    });

    setTasks(updatedTasks);
    updateAllocationProgress(targetTask.ProjectAllocationID || targetTask.AllocationID, updatedTasks);
    showToast(`Task score updated via API: ${numericScore} pts`);
  };

  // Student remarks
  const addRemarkToTask = (taskID, remarkText) => {
    if (!remarkText.trim()) return;

    const newRemark = {
      id: Date.now(),
      senderRole: currentUser?.RoleName || 'Student',
      senderName: currentUser?.FullName || 'User',
      senderAvatar: currentUser?.ProfilePicturePath,
      text: remarkText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })
    };

    setTasks(prev => prev.map(t => {
      if (t.TaskID === taskID) {
        const updated = {
          ...t,
          RemarksHistory: [...(t.RemarksHistory || []), newRemark]
        };
        if (selectedTask && selectedTask.TaskID === taskID) setSelectedTask(updated);
        return updated;
      }
      return t;
    }));
    showToast('Remark posted to task communication thread');
  };

  // Follow-up date
  const updateFollowUpDate = (taskID, newDate) => {
    setTasks(prev => prev.map(t => {
      if (t.TaskID === taskID) {
        const updated = { ...t, NextFollowUpDate: newDate };
        if (selectedTask && selectedTask.TaskID === taskID) setSelectedTask(updated);
        return updated;
      }
      return t;
    }));
    showToast(`Next follow-up date scheduled for ${newDate}`);
  };

  // Grade update
  const updateOverallGrade = async (allocationID, grade) => {
    const targetAlloc = allocations.find(a => (a.ProjectAllocationID === allocationID || a.AllocationID === allocationID));
    if (targetAlloc) {
      const payload = {
        projectId: targetAlloc.ProjectID,
        studentId: targetAlloc.StudentID,
        facultyId: targetAlloc.FacultyID,
        assignedDate: targetAlloc.AssignedDate,
        projectStartDate: targetAlloc.ProjectStartDate,
        projectEndDate: targetAlloc.ProjectEndDate,
        totalTasksGiven: targetAlloc.TotalTasksGiven,
        totalCompletedTasks: targetAlloc.TotalCompletedTasks,
        progressPercentage: targetAlloc.ProgressPercentage,
        overAllGrade: grade
      };
      await projectAllocationApi.update(allocationID, payload);
    }

    setAllocations(prev => prev.map(a =>
      (a.ProjectAllocationID === allocationID || a.AllocationID === allocationID)
        ? { ...a, OverAllGrade: grade }
        : a
    ));
    showToast(`Semester grade updated to '${grade}' via API`);
  };

  // User management
  const toggleUserActiveStatus = async (userID) => {
    const target = users.find(u => u.UserID === userID);
    if (target) {
      await userApi.update(userID, {
        userTypeId: target.UserTypeID,
        fullName: target.FullName,
        userCode: target.UserCode,
        email: target.Email,
        password: target.Password,
        mobileNumber: target.MobileNumber,
        profilePicturePath: target.ProfilePicturePath,
        isActive: !target.IsActive,
        isDeleted: target.IsDeleted
      });
    }

    setUsers(prev => prev.map(u => {
      if (u.UserID === userID) {
        const newStatus = !u.IsActive;
        showToast(`User ${u.FullName} is now ${newStatus ? 'Active' : 'Disabled'}`);
        return { ...u, IsActive: newStatus };
      }
      return u;
    }));
  };

  const softDeleteUser = async (userID) => {
    await userApi.delete(userID);
    setUsers(prev => prev.map(u => {
      if (u.UserID === userID) {
        showToast(`User ${u.FullName} deleted via API`);
        return { ...u, IsDeleted: true, IsActive: false };
      }
      return u;
    }));
  };

  const createNewUser = async (userData) => {
    const roleObj = roles.find(r => r.RoleID === Number(userData.RoleID)) || roles[2];
    const prefix = roleObj.RoleName === 'Admin' ? 'ADM' : roleObj.RoleName === 'Faculty' ? 'FAC' : 'STU';
    const userCode = `${prefix}-${Math.floor(100 + Math.random() * 900)}`;

    const payload = {
      userTypeId: Number(userData.RoleID),
      fullName: userData.FullName,
      userCode: userCode,
      email: userData.Email,
      password: userData.Password || 'password123',
      mobileNumber: userData.MobileNumber || '+1 555-010-9900',
      profilePicturePath: userData.ProfilePicturePath || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
      isActive: true,
      isDeleted: false
    };

    const res = await userApi.create(payload);

    if (res.success && res.data) {
      const created = normalizeUser(res.data);
      setUsers([...users, created]);
      showToast(`New user ${created.FullName} registered via API`);
    } else {
      const newID = Math.max(...users.map(u => u.UserID), 0) + 1;
      const newUser = {
        UserID: newID,
        ...payload,
        RoleID: Number(userData.RoleID),
        RoleName: roleObj.RoleName,
        Department: userData.Department || 'Computer Science',
        CreatedAt: new Date().toISOString().split('T')[0]
      };
      setUsers([...users, newUser]);
      showToast(`User ${newUser.FullName} registered`);
    }
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        currentRoleID,
        currentUser,
        switchRole,
        roles,
        userTypes,
        userRoles,
        taskStatuses,
        taskPriorities,
        users,
        projects,
        allocations,
        tasks,
        selectedTask,
        setSelectedTask,
        activeTab,
        setActiveTab,
        searchTerm,
        setSearchTerm,
        toastMessage,
        showToast,
        isBackendConnected,
        fetchAllFromBackendApis,
        updateTaskStatus,
        addRemarkToTask,
        updateFollowUpDate,
        createNewTask,
        evaluateTaskScore,
        updateOverallGrade,
        toggleUserActiveStatus,
        softDeleteUser,
        createNewUser,
        createNewProject,
        createNewAllocation
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
