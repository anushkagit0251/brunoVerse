import client from './client';

export const aiApi = {
  // Check AI Vision configuration status
  getStatus: async () => {
    const res = await client.get('/ai/status');
    return res.data;
  },

  // Analyze uploaded animal photo via multipart form data
  analyzeAnimalImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await client.post('/ai/analyze-animal-image', formData, {
      headers: {
        'Content-Type': undefined, // Let Axios auto-generate boundary
      },
      timeout: 60000,
    });
    return res.data;
  },

  // Analyze already-stored or preview image URL
  analyzeImageUrl: async (imageUrl) => {
    const res = await client.post('/ai/analyze-image-url', { imageUrl }, {
      timeout: 60000,
    });
    return res.data;
  },
};
