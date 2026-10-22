import client from './client';

export const uploadApi = {
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await client.post('/upload', formData, {
      headers: {
        'Content-Type': undefined,
      },
    });
    return res.data;
  },
};
