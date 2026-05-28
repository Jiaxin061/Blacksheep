import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { getAuthHeaders } from '../utils/auth';

export const animalService = {
  // UC05: Get all animal records
  getAllAnimals: async () => {
    try {
      // Use public endpoint for general listing
      const response = await axios.get(`${API_BASE_URL}/api/animals`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // UC05: Get single animal by ID
  getAnimalById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/animals/${id}`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // UC06: Search and filter animals
  searchAnimals: async (filters = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/animals/search/filter`, { params: filters });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // UC07: Create new animal
  createAnimal: async (animalData) => {
    try {
      const headers = await getAuthHeaders();
      const response = await axios.post(`${API_BASE_URL}/api/animals`, animalData, { headers });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // UC07: Update animal
  updateAnimal: async (id, animalData) => {
    try {
      const headers = await getAuthHeaders();
      const response = await axios.put(`${API_BASE_URL}/api/animals/${id}`, animalData, { headers });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // UC07: Delete animal
  deleteAnimal: async (id) => {
    try {
      const headers = await getAuthHeaders();
      const response = await axios.delete(`${API_BASE_URL}/api/animals/${id}`, { headers });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },
};

const handleError = (error) => {
  if (error.response?.data) {
    const errorData = error.response.data;
    if (typeof errorData === 'string') {
      throw new Error(errorData);
    } else if (errorData?.message) {
      throw new Error(errorData.message);
    } else {
      throw new Error(JSON.stringify(errorData));
    }
  } else {
    throw error instanceof Error ? error : new Error(error?.message || String(error) || 'Unknown error');
  }
};

export default animalService;







