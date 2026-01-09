import api from '../../../services/apiClient';

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
};

export default adoptionService;

