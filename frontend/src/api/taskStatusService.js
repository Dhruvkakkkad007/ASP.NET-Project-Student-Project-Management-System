import axiosClient from './axiosClient';

/**
 * Service for Task Statuses module
 */
export const taskStatusService = {
  async getAll() {
    const res = await axiosClient.get('/TaskStatuses');
    return res.data || [];
  },

  async getById(id) {
    const res = await axiosClient.get(`/TaskStatuses/${id}`);
    return res.data;
  },

  async create(payload) {
    const res = await axiosClient.post('/TaskStatuses', payload);
    return res.data;
  },

  async update(id, payload) {
    const res = await axiosClient.put(`/TaskStatuses/${id}`, payload);
    return res.data;
  },

  async delete(id) {
    return await axiosClient.delete(`/TaskStatuses/${id}`);
  },
};

