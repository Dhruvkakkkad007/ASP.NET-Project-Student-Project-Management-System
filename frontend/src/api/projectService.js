import axiosClient from './axiosClient';

/**
 * Service for Projects (ProjectMaster) module
 */
export const projectService = {
  async getAll() {
    const res = await axiosClient.get('/ProjectMasters');
    return res.data || [];
  },

  async getById(id) {
    const res = await axiosClient.get(`/ProjectMasters/${id}`);
    return res.data;
  },

  async create(payload) {
    const res = await axiosClient.post('/ProjectMasters', payload);
    return res.data;
  },

  async update(id, payload) {
    const res = await axiosClient.put(`/ProjectMasters/${id}`, payload);
    return res.data;
  },

  async delete(id) {
    return await axiosClient.delete(`/ProjectMasters/${id}`);
  },
};

