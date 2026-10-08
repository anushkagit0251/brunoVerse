import client from './client';

export const helpApi = {
  getAll: async () => {
    const res = await client.get('/nearby-help');
    return res.data;
  },
  create: async (data) => {
    const res = await client.post('/nearby-help', data);
    return res.data;
  },
};
