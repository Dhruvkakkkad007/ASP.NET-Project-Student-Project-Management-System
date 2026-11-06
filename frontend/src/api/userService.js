import axiosClient from './axiosClient';

/**
 * Service for Users module
 */
export const userService = {
  /**
   * Fetch all users
   */
  async getAll() {
    const res = await axiosClient.get('/Users');
    return res.data || [];
  },

  /**
   * Fetch a single user by ID
   * @param {number|string} id
   */
  async getById(id) {
    const res = await axiosClient.get(`/Users/${id}`);
    return res.data;
  },

  /**
   * Create a new user
   * @param {object} payload - UserCreateDto
   */
  async create(payload) {
    const res = await axiosClient.post('/Users', payload);
    return res.data;
  },

  /**
   * Update an existing user
   * @param {number|string} id
   * @param {object} payload - UserUpdateDto
   */
  async update(id, payload) {
    const res = await axiosClient.put(`/Users/${id}`, payload);
    return res.data;
  },

  /**
   * Delete a user
   * @param {number|string} id
   */
  async delete(id) {
    const res = await axiosClient.delete(`/Users/${id}`);
    return res;
  },

  /**
   * Admin-only user list
   */
  async getAdminOnly() {
    return await axiosClient.get('/Users/admin-only');
  },

  async getMe() {
    const res = await axiosClient.get('/Users/me');
    return res.data;
  },

  async updateMe(payload) {
    const res = await axiosClient.put('/Users/me', payload);
    return res.data;
  },

  async changePassword(payload) {
    const res = await axiosClient.post('/Users/me/change-password', payload);
    return res;
  },

  async uploadPhoto(file) {
    const form = new FormData();
    form.append('file', file);
    const res = await axiosClient.post('/Users/me/photo', form);
    return res.data;
  },
};

