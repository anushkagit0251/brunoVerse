import client from './client';

export const communityApi = {
  getAll: async () => {
    const res = await client.get('/community');
    return res.data;
  },
  create: async (data) => {
    const res = await client.post('/community', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await client.put(`/community/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await client.delete(`/community/${id}`);
    return res.data;
  },
  like: async (id) => {
    const res = await client.post(`/community/${id}/like`);
    return res.data;
  },
  getComments: async (id) => {
    const res = await client.get(`/community/${id}/comments`);
    return res.data;
  },
  addComment: async (id, comment) => {
    const res = await client.post(`/community/${id}/comments`, comment);
    return res.data;
  },
};
