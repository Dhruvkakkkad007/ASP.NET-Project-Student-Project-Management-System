import axiosClient from './axiosClient';

/**
 * Service for Project Tasks module
 */
export const projectTaskService = {
  async getAll() {
    const res = await axiosClient.get('/ProjectTasks');
    return res.data || [];
  },

  async getById(id) {
    const res = await axiosClient.get(`/ProjectTasks/${id}`);
    return res.data;
  },

  async create(payload) {
    const res = await axiosClient.post('/ProjectTasks', payload);
    return res.data;
  },

  async update(id, payload) {
    const res = await axiosClient.put(`/ProjectTasks/${id}`, payload);
    return res.data;
  },

  async delete(id) {
    return await axiosClient.delete(`/ProjectTasks/${id}`);
  },
};

