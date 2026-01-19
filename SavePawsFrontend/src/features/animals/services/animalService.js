import api from '../../../services/apiClient';

export const animalService = {
  // UC05: Get all animal records
  getAllAnimals: async () => {
    try {
      const response = await api.get('/api/animals');
      return response.data;
    } catch (error) {
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
    }
  },

  // UC05: Get single animal by ID
  getAnimalById: async (id) => {
    try {
      const response = await api.get(`/api/animals/adoption/${id}`);
      return response.data;
    } catch (error) {
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
    }
  },

  // UC06: Search and filter animals
  searchAnimals: async (filters = {}) => {
    try {
      const response = await api.get('/api/animals/search/filter', { params: filters });
      return response.data;
    } catch (error) {
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
    }
  },

  // UC07: Create new animal
  createAnimal: async (animalData) => {
    try {
      const response = await api.post('/api/animals', animalData);
      return response.data;
    } catch (error) {
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
    }
  },

  // UC07: Update animal
  updateAnimal: async (id, animalData) => {
    try {
      const response = await api.put(`/api/animals/${id}`, animalData);
      return response.data;
    } catch (error) {
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
    }
  },

  // UC07: Delete animal
  deleteAnimal: async (id) => {
    try {
      const response = await api.delete(`/api/animals/${id}`);
      return response.data;
    } catch (error) {
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
    }
  },
};

export default animalService;





