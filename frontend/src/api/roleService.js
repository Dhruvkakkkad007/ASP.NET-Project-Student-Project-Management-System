import axiosClient from './axiosClient';

/**
 * Service for Roles module (Admin)
 */
export const roleService = {
  async getAll() {
    const res = await axiosClient.get('/Roles');
    return res.data || [];
  },

  async getById(id) {
    const res = await axiosClient.get(`/Roles/${id}`);
    return res.data;
  },

  async create(payload) {
    const res = await axiosClient.post('/Roles', payload);
    return res.data;
  },

  async update(id, payload) {
    const res = await axiosClient.put(`/Roles/${id}`, payload);
    return res.data;
  },

  async delete(id) {
    return await axiosClient.delete(`/Roles/${id}`);
  },
};

