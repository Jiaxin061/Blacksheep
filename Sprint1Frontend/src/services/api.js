import { API_BASE_URL, API_ENDPOINTS } from '../utils/constants';

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Get all reports
export const getAllReports = async () => {
  return await apiCall(API_ENDPOINTS.REPORTS);
};

// Get report by ID
export const getReportById = async (id) => {
  return await apiCall(API_ENDPOINTS.REPORT_BY_ID(id));
};

// Create new report
export const createReport = async (reportData) => {
  return await apiCall(API_ENDPOINTS.REPORTS, {
    method: 'POST',
    body: JSON.stringify(reportData),
  });
};

// Update report status
export const updateReportStatus = async (id, status) => {
  return await apiCall(API_ENDPOINTS.UPDATE_STATUS(id), {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
};

// Delete report
export const deleteReport = async (id) => {
  return await apiCall(API_ENDPOINTS.DELETE_REPORT(id), {
    method: 'DELETE',
  });
};

// Get statistics
export const getStats = async () => {
  return await apiCall(API_ENDPOINTS.STATS);
};

// Upload image (multipart/form-data)
export const uploadImage = async (imageUri) => {
  try {
    const formData = new FormData();
    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('image', {
      uri: imageUri,
      name: filename,
      type,
    });

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) {
      throw new Error('Image upload failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Upload Error:', error);
    throw error;
  }
};

export default {
  getAllReports,
  getReportById,
  createReport,
  updateReportStatus,
  deleteReport,
  getStats,
  uploadImage,
};