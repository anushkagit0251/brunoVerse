import client from './client';

export const activityApi = {
  getAll: async () => {
    const res = await client.get('/activities');
    return res.data;
  },
  create: async (data) => {
    const res = await client.post('/activities', data);
    return res.data;
  },
};
