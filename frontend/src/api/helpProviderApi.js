import client from './client';

export const helpProviderApi = {
  /**
   * Get all help providers, optionally filtered by type (Veterinarian, NGO, Shelter, etc.)
   */
  getAll: async (type = null) => {
    const url = type ? `/help-providers?type=${encodeURIComponent(type)}` : '/help-providers';
    const res = await client.get(url);
    return res.data;
  },

  /**
   * Get real nearby verified veterinary clinics and hospitals
   */
  getNearbyVets: async () => {
    const res = await client.get('/help-providers/vets');
    return res.data;
  },

  /**
   * Get real nearby verified animal welfare NGOs
   */
  getNearbyNGOs: async () => {
    const res = await client.get('/help-providers/ngos');
    return res.data;
  },

  /**
   * Get nearby animal shelters and rescue sanctuaries
   */
  getNearbyShelters: async () => {
    const res = await client.get('/help-providers/shelters');
    return res.data;
  },

  /**
   * Search providers across name, address, and specialty
   */
  searchProviders: async (query = '') => {
    const res = await client.get(`/help-providers/search?q=${encodeURIComponent(query)}`);
    return res.data;
  },

  /**
   * Get single provider details by ID
   */
  getProviderDetails: async (id) => {
    const res = await client.get(`/help-providers/${id}`);
    return res.data;
  },

  /**
   * Register a new help provider
   */
  create: async (data) => {
    const res = await client.post('/help-providers', data);
    return res.data;
  },

  /**
   * Initiates direct phone call to the provider
   */
  callProvider: (providerOrPhone) => {
    const phone = typeof providerOrPhone === 'string' 
      ? providerOrPhone 
      : providerOrPhone?.phone;
    if (phone) {
      window.location.href = `tel:${phone.replace(/\s+/g, '')}`;
    }
  },

  /**
   * Get Google Maps directions link for the provider
   */
  getDirections: (provider) => {
    if (!provider) return '#';
    if (provider.directionsUrl) return provider.directionsUrl;
    if (provider.latitude && provider.longitude) {
      return `https://www.google.com/maps/dir/?api=1&destination=${provider.latitude},${provider.longitude}`;
    }
    if (provider.address) {
      return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(provider.name + ' ' + provider.address)}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(provider.name || 'Vet')}`;
  }
};

export default helpProviderApi;
