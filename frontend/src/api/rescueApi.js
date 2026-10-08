import client from './client';

export const rescueApi = {
  getRescues: async (status) => {
    const params = status ? { status } : {};
    const res = await client.get('/rescues', { params });
    return res.data;
  },

  getRescueById: async (id) => {
    const res = await client.get(`/rescues/${id}`);
    return res.data;
  },

  getByRescuer: async (rescuerId) => {
    const res = await client.get(`/rescues/rescuer/${rescuerId}`);
    return res.data;
  },

  createRescue: async (data, reportedById) => {
    const params = reportedById ? { reportedById } : {};
    const res = await client.post('/rescues', data, { params });
    return res.data;
  },

  updateStatus: async (id, status, rescuerId) => {
    const params = { status };
    if (rescuerId) params.rescuerId = rescuerId;
    const res = await client.put(`/rescues/${id}/status`, null, { params });
    return res.data;
  },

  getStats: async () => {
    const res = await client.get('/rescues/stats');
    return res.data;
  },
};
