import client from './client';

export const userApi = {
  getAll: async () => {
    const res = await client.get('/users');
    return res.data;
  },
  getById: async (id) => {
    const res = await client.get(`/users/${id}`);
    return res.data;
  },
  update: async (id, data) => {
    const res = await client.put(`/users/${id}`, data);
    return res.data;
  },
};
