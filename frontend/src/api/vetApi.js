import client from './client';

export const vetApi = {
  /**
   * Get real nearby veterinary clinics using GPS coordinates
   */
  getNearbyVets: async (lat, lng, radius = 10000) => {
    const params = new URLSearchParams();
    if (lat != null && lng != null) {
      params.append('lat', lat);
      params.append('lng', lng);
    }
    if (radius) {
      params.append('radius', radius);
    }
    const res = await client.get(`/vets/nearby?${params.toString()}`);
    return res.data;
  },

  /**
   * Search veterinary clinics by city, area, PIN code, or clinic name
   */
  searchVets: async (query, lat = null, lng = null) => {
    const params = new URLSearchParams();
    params.append('query', query);
    if (lat != null && lng != null) {
      params.append('lat', lat);
      params.append('lng', lng);
    }
    const res = await client.get(`/vets/search?${params.toString()}`);
    return res.data;
  },

  /**
   * Dial the clinic's phone number directly
   */
  callClinic: (phone) => {
    if (phone) {
      window.location.href = `tel:${phone.replace(/\s+/g, '')}`;
    }
  },

  /**
   * Open Google Maps directions to the clinic
   */
  getDirectionsUrl: (clinic) => {
    if (!clinic) return '#';
    if (clinic.directionsUrl) return clinic.directionsUrl;
    if (clinic.latitude && clinic.longitude) {
      return `https://www.google.com/maps/dir/?api=1&destination=${clinic.latitude},${clinic.longitude}`;
    }
    if (clinic.address) {
      return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(clinic.name + ' ' + clinic.address)}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.name || 'Veterinary Clinic')}`;
  }
};

export default vetApi;
