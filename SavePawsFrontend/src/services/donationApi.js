import axios from "axios";
import { getAuthHeaders } from "../utils/auth";
import { API_BASE_URL } from "../config/api";

axios.defaults.timeout = 30000;

// ============================================
// Animal APIs
// ============================================

export const fetchUserAnimals = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/animals`);
  return response.data;
};

export const fetchAnimalDetails = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/api/animals/${id}`);
  return response.data;
};

export const fetchAdminAnimals = async () => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${API_BASE_URL}/api/admin/animals`, { headers });
  return response.data.data;
};

export const createAnimal = async (formData) => {
  try {
    const data = new FormData();
    data.append("name", formData.name);
    data.append("type", formData.type);
    data.append("story", formData.story);
    data.append("fundingGoal", formData.fundingGoal.toString());
    data.append("status", formData.status);
    data.append("adminID", "1");

    if (formData.photo && formData.photo.uri) {
      const uriParts = formData.photo.uri.split('.');
      const fileType = uriParts[uriParts.length - 1].toLowerCase();
      data.append("photo", {
        uri: formData.photo.uri,
        type: `image/${fileType === 'jpg' ? 'jpeg' : fileType}`,
        name: `photo-${Date.now()}.${fileType}`,
      });
    } else {
      throw new Error("Photo is required");
    }

    // Get auth headers for fetch request
    const authHeaders = await getAuthHeaders();
    const headers = {
      "Accept": "application/json",
    };

    // Add Authorization header if token exists
    if (authHeaders["Authorization"]) {
      headers["Authorization"] = authHeaders["Authorization"];
    }

    // Add x-user-id header if exists
    if (authHeaders["x-user-id"]) {
      headers["x-user-id"] = authHeaders["x-user-id"];
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/animals`, {
      method: "POST",
      body: data,
      headers,
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Failed to create animal profile");
    }
    return result;
  } catch (error) {
    console.error('❌ Create animal error:', error);
    throw error;
  }
};

export const updateAnimal = async (id, formData) => {
  try {
    const data = new FormData();
    data.append("name", formData.name);
    data.append("type", formData.type);
    data.append("story", formData.story);
    data.append("fundingGoal", formData.fundingGoal.toString());
    data.append("status", formData.status);

    if (formData.amountRaised !== undefined) {
      data.append("amountRaised", formData.amountRaised.toString());
    }

    if (formData.photo && formData.photo.uri) {
      const uriParts = formData.photo.uri.split('.');
      const fileType = uriParts[uriParts.length - 1].toLowerCase();
      data.append("photo", {
        uri: formData.photo.uri,
        type: `image/${fileType === 'jpg' ? 'jpeg' : fileType}`,
        name: `photo-${Date.now()}.${fileType}`,
      });
    }

    // Get auth headers for fetch request
    const authHeaders = await getAuthHeaders();
    const headers = {
      "Accept": "application/json",
    };

    // Add Authorization header if token exists
    if (authHeaders["Authorization"]) {
      headers["Authorization"] = authHeaders["Authorization"];
    }

    // Add x-user-id header if exists
    if (authHeaders["x-user-id"]) {
      headers["x-user-id"] = authHeaders["x-user-id"];
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/animals/${id}`, {
      method: "PUT",
      body: data,
      headers,
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Failed to update animal profile");
    }
    return result;
  } catch (error) {
    console.error('❌ Update animal error:', error);
    throw error;
  }
};

export const deleteAnimal = async (id) => {
  const headers = await getAuthHeaders();
  const response = await axios.delete(`${API_BASE_URL}/api/admin/animals/${id}`, { headers });
  return response.data;
};

export const archiveAnimal = async (id) => {
  const headers = await getAuthHeaders();
  const response = await axios.patch(`${API_BASE_URL}/api/admin/animals/${id}/archive`, {}, { headers });
  return response.data;
};

// ============================================
// User APIs (UC10: View Donation Impact)
// ============================================

export const getUserProfile = async () => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${API_BASE_URL}/api/user/profile`, { headers });
  return response.data.data;
};

export const getDonationImpact = async () => {
  try {
    const headers = await getAuthHeaders();
    console.log("EMULATOR AUTH HEADERS:", JSON.stringify(headers, null, 2));
    console.log("🌐 Request URL:", `${API_BASE_URL}/api/user/donations/impact`);

    const response = await axios.get(`${API_BASE_URL}/api/user/donations/impact`, { headers });
    console.log("✅ Response status:", response.status);
    return response.data.data;
  } catch (error) {
    console.error("❌ Fetch impact error:", {
      status: error.response?.status,
      message: error.message,
      responseData: error.response?.data,
      headers: error.config?.headers
    });
    throw error;
  }
};

export const getDonationImpactDetail = async (transactionID) => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${API_BASE_URL}/api/user/donations/${transactionID}/impact`, { headers });
  return response.data.data;
};

export const downloadCertificate = async (transactionID) => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${API_BASE_URL}/api/user/donations/${transactionID}/certificate`, {
    headers,
    responseType: "blob",
  });
  return response.data;
};

// ============================================
// Admin Fund Allocation APIs (UC11)
// ============================================

export const getAllocations = async (params) => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${API_BASE_URL}/api/admin/allocations`, {
    headers,
    params,
  });
  return response.data.data;
};

export const createAllocation = async (allocation) => {
  const headers = await getAuthHeaders();
  const response = await axios.post(`${API_BASE_URL}/api/admin/allocations`, allocation, { headers });
  return response.data;
};

export const updateAllocation = async (allocationID, payload) => {
  if (payload instanceof FormData) {
    const authHeaders = await getAuthHeaders();
    const headers = {
      "Accept": "application/json",
    };
    // Add Authorization header if token exists
    if (authHeaders["Authorization"]) {
      headers["Authorization"] = authHeaders["Authorization"];
    }
    if (authHeaders["x-user-id"]) {
      headers["x-user-id"] = authHeaders["x-user-id"];
    }
    const response = await fetch(`${API_BASE_URL}/api/admin/allocations/${allocationID}`, {
      method: "PUT",
      body: payload,
      headers,
    });
    const result = await response.json();
    if (!response.ok) {
      const error = new Error(result.message || "Failed to update allocation");
      error.response = { data: result, status: response.status };
      throw error;
    }
    return result;
  }
  const headers = await getAuthHeaders();
  const response = await axios.put(`${API_BASE_URL}/api/admin/allocations/${allocationID}`, payload, { headers });
  return response.data;
};

export const deleteAllocation = async (allocationID) => {
  const headers = await getAuthHeaders();
  const response = await axios.delete(`${API_BASE_URL}/api/admin/allocations/${allocationID}`, { headers });
  return response.data;
};

export const fetchAllocationAnimals = async () => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${API_BASE_URL}/api/admin/fund-allocation/animals`, { headers });
  return response.data.data;
};

export const fetchAllocationByAnimal = async (animalID) => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${API_BASE_URL}/api/admin/fund-allocation/${animalID}`, { headers });
  return response.data.data;
};

export const fetchAllocationDetail = async (allocationID) => {
  const headers = await getAuthHeaders();
  console.log(`[API] Fetching allocation: ${API_BASE_URL}/api/admin/fund-allocation/detail/${allocationID}`);
  try {
    const response = await axios.get(`${API_BASE_URL}/api/admin/fund-allocation/detail/${allocationID}`, { headers });
    console.log("[API] Response status:", response.status);
    console.log("[API] Response Data:", JSON.stringify(response.data));
    return response.data.data;
  } catch (error) {
    console.error("[API] Error fetching allocation:", error.message);
    if (error.response) console.error("[API] Error Status:", error.response.status, error.response.data);
    throw error;
  }
};

export const createAllocationForAnimal = async (animalID, payload) => {
  if (payload instanceof FormData) {
    const authHeaders = await getAuthHeaders();
    const headers = {
      "Accept": "application/json",
    };
    // Add Authorization header if token exists
    if (authHeaders["Authorization"]) {
      headers["Authorization"] = authHeaders["Authorization"];
    }
    if (authHeaders["x-user-id"]) {
      headers["x-user-id"] = authHeaders["x-user-id"];
    }
    const response = await fetch(`${API_BASE_URL}/api/admin/fund-allocation/${animalID}`, {
      method: "POST",
      body: payload,
      headers,
    });
    const result = await response.json();
    if (!response.ok) {
      const error = new Error(result.message || "Failed to create allocation");
      error.response = { data: result, status: response.status };
      throw error;
    }
    return result;
  }

  const headers = await getAuthHeaders();
  if (payload.receiptImage || payload.treatmentPhoto) {
    const formData = new FormData();
    formData.append("category", payload.category);
    formData.append("amount", payload.amount.toString());
    if (payload.allocationType) formData.append("allocationType", payload.allocationType);
    if (payload.serviceProvider) formData.append("serviceProvider", payload.serviceProvider);
    if (payload.allocationDate) formData.append("allocationDate", payload.allocationDate);
    if (payload.status) formData.append("status", payload.status);
    if (payload.totalCost !== undefined) formData.append("totalCost", payload.totalCost.toString());
    if (payload.donationCoveredAmount !== undefined) formData.append("donationCoveredAmount", payload.donationCoveredAmount.toString());
    if (payload.externalCoveredAmount !== undefined) formData.append("externalCoveredAmount", payload.externalCoveredAmount.toString());
    if (payload.externalFundingSource) formData.append("externalFundingSource", payload.externalFundingSource);
    if (payload.externalFundingNotes) formData.append("externalFundingNotes", payload.externalFundingNotes);
    if (payload.fundingStatus) formData.append("fundingStatus", payload.fundingStatus);
    if (payload.publicDescription) formData.append("publicDescription", payload.publicDescription);
    if (payload.internalNotes) formData.append("internalNotes", payload.internalNotes);
    if (payload.conditionUpdate) formData.append("conditionUpdate", payload.conditionUpdate);

    if (payload.receiptImage) {
      const uriParts = payload.receiptImage.split('.');
      const fileType = uriParts[uriParts.length - 1].toLowerCase();
      formData.append("receiptImage", {
        uri: payload.receiptImage,
        type: `image/${fileType === 'jpg' ? 'jpeg' : fileType}`,
        name: `receipt-${Date.now()}.${fileType}`,
      });
    }

    if (payload.treatmentPhoto) {
      const uriParts = payload.treatmentPhoto.split('.');
      const fileType = uriParts[uriParts.length - 1].toLowerCase();
      formData.append("treatmentPhoto", {
        uri: payload.treatmentPhoto,
        type: `image/${fileType === 'jpg' ? 'jpeg' : fileType}`,
        name: `treatment-${Date.now()}.${fileType}`,
      });
    }

    // Get auth headers for fetch request
    const authHeadersForFetch = await getAuthHeaders();
    const fetchHeaders = {
      "Accept": "application/json",
    };

    // Add Authorization header if token exists
    if (authHeadersForFetch["Authorization"]) {
      fetchHeaders["Authorization"] = authHeadersForFetch["Authorization"];
    }

    // Add x-user-id header if exists
    if (authHeadersForFetch["x-user-id"]) {
      fetchHeaders["x-user-id"] = authHeadersForFetch["x-user-id"];
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/fund-allocation/${animalID}`, {
      method: "POST",
      body: formData,
      headers: fetchHeaders,
    });
    return await response.json();
  } else {
    const jsonPayload = {
      ...payload,
      totalCost: payload.totalCost || payload.amount,
    };
    const response = await axios.post(`${API_BASE_URL}/api/admin/fund-allocation/${animalID}`, jsonPayload, { headers });
    return response.data;
  }
};

export const getProgressUpdates = async (animalID) => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${API_BASE_URL}/api/admin/animals/${animalID}/progress`, { headers });
  return response.data.data;
};

export const createProgressUpdate = async (animalID, update) => {
  const headers = await getAuthHeaders();
  const response = await axios.post(`${API_BASE_URL}/api/admin/animals/${animalID}/progress`, update, { headers });
  return response.data;
};

// ============================================
// Reward System APIs
// ============================================

export const getRewardBalance = async () => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${API_BASE_URL}/api/rewards/balance`, { headers });
  return response.data;
};

export const getRewardCatalogue = async () => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${API_BASE_URL}/api/rewards/catalogue`, { headers });
  return response.data.data;
};

export const getRewardDetail = async (rewardID) => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${API_BASE_URL}/api/rewards/${rewardID}`, { headers });
  return response.data.data;
};

export const redeemReward = async (rewardID) => {
  const headers = await getAuthHeaders();
  const response = await axios.post(`${API_BASE_URL}/api/rewards/redeem`, { rewardID }, { headers });
  return response.data;
};

export const getRewardHistory = async () => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${API_BASE_URL}/api/rewards/history`, { headers });
  return response.data.data;
};

// ============================================
// Admin Reward Management APIs
// ============================================

export const fetchAdminRewards = async () => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${API_BASE_URL}/api/admin/rewards`, { headers });
  return response.data;
};

export const createAdminReward = async (payload) => {
  const headers = await getAuthHeaders();
  const response = await axios.post(`${API_BASE_URL}/api/admin/rewards`, payload, { headers });
  return response.data;
};

export const updateAdminReward = async (rewardID, payload) => {
  // If payload is FormData, use fetch instead of axios
  if (payload instanceof FormData) {
    const authHeaders = await getAuthHeaders();
    const headers = {
      "Accept": "application/json",
    };
    // Add Authorization header if token exists
    if (authHeaders["Authorization"]) {
      headers["Authorization"] = authHeaders["Authorization"];
    }
    if (authHeaders["x-user-id"]) {
      headers["x-user-id"] = authHeaders["x-user-id"];
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/rewards/${rewardID}`, {
      method: "PUT",
      body: payload,
      headers,
    });

    const result = await response.json();
    if (!response.ok) {
      const error = new Error(result.message || "Failed to update reward");
      error.response = { data: result, status: response.status };
      throw error;
    }
    return result;
  }

  // Otherwise use axios
  const headers = await getAuthHeaders();
  const response = await axios.put(`${API_BASE_URL}/api/admin/rewards/${rewardID}`, payload, { headers });
  return response.data;
};

export const deleteAdminReward = async (rewardID) => {
  const headers = await getAuthHeaders();
  const response = await axios.delete(`${API_BASE_URL}/api/admin/rewards/${rewardID}`, { headers });
  return response.data;
};

