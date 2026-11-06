import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from '../components/layout/AppLayout';

// Pages
import LoginPage from '../pages/auth/LoginPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import ProjectListPage from '../pages/projects/ProjectListPage';
import AllocationListPage from '../pages/allocations/AllocationListPage';
import TaskListPage from '../pages/tasks/TaskListPage';
import UserListPage from '../pages/users/UserListPage';
import UserTypeListPage from '../pages/admin/UserTypeListPage';
import RoleListPage from '../pages/admin/RoleListPage';
import UserRoleListPage from '../pages/admin/UserRoleListPage';
import TaskStatusListPage from '../pages/admin/TaskStatusListPage';
import TaskPriorityListPage from '../pages/admin/TaskPriorityListPage';
import NotFoundPage from '../pages/common/NotFoundPage';
import UnauthorizedPage from '../pages/common/UnauthorizedPage';
import ProfilePage from '../pages/profile/ProfilePage';

// Faculty pages
import FacultyStudentsPage from '../pages/faculty/FacultyStudentsPage';
import FacultyEvaluatePage from '../pages/faculty/FacultyEvaluatePage';
import FacultySwitchRequestsPage from '../pages/faculty/FacultySwitchRequestsPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Authenticated Application Shell */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="projects" element={<ProjectListPage />} />

        {/* Allocations — Admin only for full CRUD; students see read-only */}
        <Route path="allocations" element={<AllocationListPage />} />

        <Route path="tasks" element={<TaskListPage />} />

        {/* Admin only: Users Directory */}
        <Route
          path="users"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <UserListPage />
            </ProtectedRoute>
          }
        />

        {/* Faculty only routes */}
        <Route
          path="faculty/students"
          element={
            <ProtectedRoute allowedRoles={['Faculty']}>
              <FacultyStudentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="faculty/evaluate"
          element={
            <ProtectedRoute allowedRoles={['Faculty']}>
              <FacultyEvaluatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="faculty/switch-requests"
          element={
            <ProtectedRoute allowedRoles={['Faculty']}>
              <FacultySwitchRequestsPage />
            </ProtectedRoute>
          }
        />

        {/* Admin only allocations management (same component, full access) */}
        <Route
          path="admin/allocations"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AllocationListPage adminView />
            </ProtectedRoute>
          }
        />

        {/* Admin only routes */}
        <Route
          path="admin/user-types"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <UserTypeListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/roles"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <RoleListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/user-roles"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <UserRoleListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/task-statuses"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <TaskStatusListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/task-priorities"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <TaskPriorityListPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 404 Catch All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

