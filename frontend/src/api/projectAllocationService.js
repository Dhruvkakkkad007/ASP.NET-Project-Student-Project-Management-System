import axiosClient from './axiosClient';

/**
 * Service for Project Allocations module
 */
export const projectAllocationService = {
  async getAll() {
    const res = await axiosClient.get('/ProjectAllocations');
    return res.data || [];
  },

  async getById(id) {
    const res = await axiosClient.get(`/ProjectAllocations/${id}`);
    return res.data;
  },

  async create(payload) {
    const res = await axiosClient.post('/ProjectAllocations', payload);
    return res.data;
  },

  async update(id, payload) {
    const res = await axiosClient.put(`/ProjectAllocations/${id}`, payload);
    return res.data;
  },

  async delete(id) {
    return await axiosClient.delete(`/ProjectAllocations/${id}`);
  },
};

