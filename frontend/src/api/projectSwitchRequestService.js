import axiosClient from './axiosClient';

export const projectSwitchRequestService = {
  async getAll() {
    const res = await axiosClient.get('/ProjectSwitchRequests');
    return res.data || [];
  },

  async create(payload) {
    const res = await axiosClient.post('/ProjectSwitchRequests', payload);
    return res.data;
  },

  async accept(id, facultyRemarks = '') {
    const res = await axiosClient.post(`/ProjectSwitchRequests/${id}/accept`, {
      facultyRemarks: facultyRemarks || null,
    });
    return res.data;
  },

  async decline(id, facultyRemarks = '') {
    const res = await axiosClient.post(`/ProjectSwitchRequests/${id}/decline`, {
      facultyRemarks: facultyRemarks || null,
    });
    return res.data;
  },

  async cancel(id) {
    return await axiosClient.post(`/ProjectSwitchRequests/${id}/cancel`);
  },
};
