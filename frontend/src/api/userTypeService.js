import axiosClient from './axiosClient';

/**
 * Service for User Types module
 */
export const userTypeService = {
  async getAll() {
    const res = await axiosClient.get('/UserTypes');
    return res.data || [];
  },

  async getById(id) {
    const res = await axiosClient.get(`/UserTypes/${id}`);
    return res.data;
  },

  async create(payload) {
    const res = await axiosClient.post('/UserTypes', payload);
    return res.data;
  },

  async update(id, payload) {
    const res = await axiosClient.put(`/UserTypes/${id}`, payload);
    return res.data;
  },

  async delete(id) {
    return await axiosClient.delete(`/UserTypes/${id}`);
  },
};

