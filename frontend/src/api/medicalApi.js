import client from './client';

export const medicalApi = {
  getByAnimal: async (animalId) => {
    const res = await client.get(`/medical-records/animal/${animalId}`);
    return res.data;
  },

  getByOwner: async (ownerId) => {
    const res = await client.get(`/medical-records/owner/${ownerId}`);
    return res.data;
  },

  createRecord: async (recordData, animalId) => {
    const res = await client.post(`/medical-records?animalId=${animalId}`, recordData);
    return res.data;
  },
};
