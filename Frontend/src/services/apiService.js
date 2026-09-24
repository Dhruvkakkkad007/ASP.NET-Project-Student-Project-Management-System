/**
 * SPMS Full API Service Layer
 * Consumes ASP.NET Core Web API endpoints with CommonResponse (ApiResponse<T>) handling
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5109/api';

/**
 * Common HTTP client helper with standard ApiResponse<T> unwrapping
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  try {
    const res = await fetch(url, config);
    const result = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMessage = result?.message || result?.errors?.join(', ') || `HTTP Error ${res.status}`;
      return {
        success: false,
        status: res.status,
        message: errorMessage,
        data: null,
        errors: result?.errors || [errorMessage],
        isNetworkError: false
      };
    }

    return {
      success: result?.success ?? true,
      status: res.status,
      message: result?.message || 'Operation successful',
      data: result?.data !== undefined ? result.data : result,
      errors: result?.errors || null,
      isNetworkError: false
    };
  } catch (err) {
    console.warn(`[SPMS API Warning] Fetch failed for ${url}:`, err.message);
    return {
      success: false,
      status: 0,
      message: err.message || 'Network error / API server offline',
      data: null,
      errors: [err.message],
      isNetworkError: true
    };
  }
}

// -------------------------------------------------------------
// 1. PROJECT MASTERS API (`ProjectMastersController`)
// -------------------------------------------------------------
export const projectApi = {
  getAll: () => request('/ProjectMasters'),
  getById: (id) => request(`/ProjectMasters/${id}`),
  create: (projectDto) => request('/ProjectMasters', {
    method: 'POST',
    body: JSON.stringify(projectDto)
  }),
  update: (id, projectDto) => request(`/ProjectMasters/${id}`, {
    method: 'PUT',
    body: JSON.stringify(projectDto)
  }),
  delete: (id) => request(`/ProjectMasters/${id}`, {
    method: 'DELETE'
  })
};

// -------------------------------------------------------------
// 2. USERS API (`UsersController`)
// -------------------------------------------------------------
export const userApi = {
  getAll: () => request('/Users'),
  getById: (id) => request(`/Users/${id}`),
  create: (userDto) => request('/Users', {
    method: 'POST',
    body: JSON.stringify(userDto)
  }),
  update: (id, userDto) => request(`/Users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userDto)
  }),
  delete: (id) => request(`/Users/${id}`, {
    method: 'DELETE'
  })
};

// -------------------------------------------------------------
// 3. PROJECT ALLOCATION API (`ProjectAllocationsController`)
// -------------------------------------------------------------
export const projectAllocationApi = {
  getProjects: () => request('/ProjectMasters'),
  getUsers: () => request('/Users'),
  getAll: () => request('/ProjectAllocations'),
  getById: (id) => request(`/ProjectAllocations/${id}`),
  create: (allocationDto) => request('/ProjectAllocations', {
    method: 'POST',
    body: JSON.stringify(allocationDto)
  }),
  update: (id, allocationDto) => request(`/ProjectAllocations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(allocationDto)
  }),
  delete: (id) => request(`/ProjectAllocations/${id}`, {
    method: 'DELETE'
  })
};

// -------------------------------------------------------------
// 4. PROJECT TASK API (`ProjectTasksController`)
// -------------------------------------------------------------
export const projectTaskApi = {
  getAllocations: () => request('/ProjectAllocations'),
  getStatuses: () => request('/TaskStatuses'),
  getPriorities: () => request('/TaskPriorities'),
  getAll: () => request('/ProjectTasks'),
  getById: (id) => request(`/ProjectTasks/${id}`),
  create: (taskDto) => request('/ProjectTasks', {
    method: 'POST',
    body: JSON.stringify(taskDto)
  }),
  update: (id, taskDto) => request(`/ProjectTasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(taskDto)
  }),
  delete: (id) => request(`/ProjectTasks/${id}`, {
    method: 'DELETE'
  })
};

// -------------------------------------------------------------
// 5. MASTER LOOKUPS APIs (Roles, UserTypes, Statuses, Priorities)
// -------------------------------------------------------------
export const lookupApi = {
  getRoles: () => request('/Roles'),
  getUserTypes: () => request('/UserTypes'),
  getTaskStatuses: () => request('/TaskStatuses'),
  getTaskPriorities: () => request('/TaskPriorities')
};

export const config = {
  baseUrl: API_BASE_URL
};
