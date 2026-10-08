import client from './client';

export const authApi = {
  login: async (credentials) => {
    const res = await client.post('/auth/login', credentials);
    return res.data;
  },

  register: async (userData) => {
    const res = await client.post('/auth/register', userData);
    return res.data;
  },

  getCurrentUser: async () => {
    const res = await client.get('/auth/me');
    return res.data;
  },

  googleAuth: async (payload) => {
    const res = await client.post('/auth/google', payload);
    return res.data;
  },

  getGoogleConfig: async () => {
    const res = await client.get('/auth/google/config');
    return res.data;
  },

  getGoogleAuthUrl: async (redirectUri) => {
    const res = await client.get(`/auth/google/url?redirectUri=${encodeURIComponent(redirectUri)}`);
    return res.data;
  },

  handleGoogleCallback: async (payload) => {
    const res = await client.post('/auth/google/callback', payload);
    return res.data;
  },
};
