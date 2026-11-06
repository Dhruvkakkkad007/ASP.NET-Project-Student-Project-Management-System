import axiosClient from './axiosClient';

/**
 * Service for User Roles assignment module (Admin)
 */
export const userRoleService = {
  async getAll() {
    const res = await axiosClient.get('/UserRoles');
    return res.data || [];
  },

  async getById(id) {
    const res = await axiosClient.get(`/UserRoles/${id}`);
    return res.data;
  },

  async create(payload) {
    const res = await axiosClient.post('/UserRoles', payload);
    return res.data;
  },

  async update(id, payload) {
    const res = await axiosClient.put(`/UserRoles/${id}`, payload);
    return res.data;
  },

  async delete(id) {
    return await axiosClient.delete(`/UserRoles/${id}`);
  },
};

