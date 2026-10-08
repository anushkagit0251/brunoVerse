import client from './client';

export const messageApi = {
  getAll: async () => {
    const res = await client.get('/messages');
    return res.data;
  },
  send: async (data) => {
    const res = await client.post('/messages', data);
    return res.data;
  },
};
