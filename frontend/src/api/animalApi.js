import client from './client';

export const animalApi = {
  getAnimalsByOwner: async (ownerId) => {
    const res = await client.get(`/animals/owner/${ownerId}`);
    return res.data;
  },

  getAnimalById: async (id) => {
    const res = await client.get(`/animals/${id}`);
    return res.data;
  },

  getAllAnimals: async () => {
    const res = await client.get('/animals');
    return res.data;
  },

  createAnimal: async (animalData, ownerId) => {
    const res = await client.post(`/animals?ownerId=${ownerId}`, animalData);
    return res.data;
  },

  updateAnimal: async (id, data) => {
    const res = await client.put(`/animals/${id}`, data);
    return res.data;
  },

  deleteAnimal: async (id) => {
    const res = await client.delete(`/animals/${id}`);
    return res.data;
  },
};
