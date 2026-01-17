import api from '../../../services/api';

export const adoptionService = {
  // UC016: Submit adoption request
  submitAdoption: async (animalId, requestData) => {
    try {
      const response = await api.post('/api/adoption', {
        animal_id: animalId,
        adoption_reason: requestData.reason,
        housing_type: requestData.housingType,
      });
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

  // Get authenticated user's requests
  getMyRequests: async () => {
    try {
      const response = await api.get('/api/adoption/my-requests');
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

  // UC017: Get all adoption requests
  getRequests: async (status = null) => {
    try {
      const params = status ? { status } : {};
      const response = await api.get('/api/adoption', { params });
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

  // Get single adoption request by ID
  getRequestById: async (id) => {
    try {
      const response = await api.get(`/api/adoption/${id}`);
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

  // UC017: Update adoption request status
  updateRequestStatus: async (id, status, rejectionReason = null) => {
    try {
      const payload = { status };
      if (rejectionReason) {
        payload.rejection_reason = rejectionReason;
      }
      const response = await api.patch(`/api/adoption/${id}/status`, payload);
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

  // Adoption Updates
  uploadAdoptionUpdate: async (formData) => {
    const response = await api.post('/api/adoption/updates', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      transformRequest: (data, headers) => {
        return data;
      },
    });
    return response.data;
  },

  getAdoptionUpdates: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/api/adoption/updates?${params}`);
    return response.data;
  },

  getMyAdoptionUpdates: async () => {
    const response = await api.get('/api/adoption/my-updates');
    return response.data;
  },

  reviewAdoptionUpdate: async (id, status, notes) => {
    const response = await api.patch(`/api/adoption/updates/${id}/review`, {
      review_status: status,
      admin_notes: notes
    });
    return response.data;
  },

  // Alias for compatibility
  getUserRequests: async () => {
    return adoptionService.getMyRequests();
  }
};

export default adoptionService;

