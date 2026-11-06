import axiosClient from './axiosClient';

/**
 * Service for Task Priorities module
 */
export const taskPriorityService = {
  async getAll() {
    const res = await axiosClient.get('/TaskPriorities');
    return res.data || [];
  },

  async getById(id) {
    const res = await axiosClient.get(`/TaskPriorities/${id}`);
    return res.data;
  },

  async create(payload) {
    const res = await axiosClient.post('/TaskPriorities', payload);
    return res.data;
  },

  async update(id, payload) {
    const res = await axiosClient.put(`/TaskPriorities/${id}`, payload);
    return res.data;
  },

  async delete(id) {
    return await axiosClient.delete(`/TaskPriorities/${id}`);
  },
};

