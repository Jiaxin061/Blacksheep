import axios from "axios";
import { API_BASE_URL } from "../config/api";
import { getAuthHeaders } from "../utils/auth";

axios.defaults.timeout = 30000;

export interface AnimalPayload {
  name: string;
  type: string;
  story: string;
  fundingGoal: number;
  photoURL?: string; // Optional now since we use file upload
  status: "Active" | "Funded" | "Adopted" | "Archived";
  amountRaised?: number;
}

export interface AnimalFormData {
  name: string;
  type: string;
  story: string;
  fundingGoal: number;
  status: "Active" | "Funded" | "Adopted" | "Archived";
  amountRaised?: number;
  photo?: {
    uri: string;
    type: string;
    name: string;
  } | null;
}

export const fetchUserAnimals = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/animals`);
  return response.data;
};

export const fetchAnimalDetails = async (id: string | number) => {
  const response = await axios.get(`${API_BASE_URL}/api/animals/${id}`);
  return response.data;
};

export const fetchAdminAnimals = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/admin/animals`);
  return response.data.data;
};

export const createAnimal = async (formData: AnimalFormData) => {
  try {
    const data = new FormData();

    // Append text fields
    data.append("name", formData.name);
    data.append("type", formData.type);
    data.append("story", formData.story);
    data.append("fundingGoal", formData.fundingGoal.toString());
    data.append("status", formData.status);
    data.append("adminID", "1"); // Hardcoded for now, as in your code

    // Append Image
    if (formData.photo && formData.photo.uri) {
      const uriParts = formData.photo.uri.split('.');
      const fileType = uriParts[uriParts.length - 1].toLowerCase();

      data.append("photo", {
        uri: formData.photo.uri,
        type: `image/${fileType === 'jpg' ? 'jpeg' : fileType}`,
        name: `photo-${Date.now()}.${fileType}`,
      } as any); // 'as any' is needed to silence TS warnings about FormData in RN
    } else {
      throw new Error("Photo is required");
    }

    console.log('🚀 Sending request via FETCH to:', `${API_BASE_URL}/api/admin/animals`);

    // ✅ USE FETCH INSTEAD OF AXIOS
    const response = await fetch(`${API_BASE_URL}/api/admin/animals`, {
      method: "POST",
      body: data,
      headers: {
        // ⚠️ CRITICAL: Do NOT set Content-Type header. 
        // fetch will automatically set 'multipart/form-data; boundary=...'
        "Accept": "application/json",
      },
    });

    // Parse the JSON response
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to create animal profile");
    }

    console.log('✅ Create animal success:', result);
    return result;

  } catch (error: any) {
    console.error('❌ Create animal error:', error);
    throw error;
  }
};

export const updateAnimal = async (id: number, formData: AnimalFormData) => {
  try {
    const data = new FormData();

    // Append standard fields
    data.append("name", formData.name);
    data.append("type", formData.type);
    data.append("story", formData.story);
    data.append("fundingGoal", formData.fundingGoal.toString());
    data.append("status", formData.status);

    if (formData.amountRaised !== undefined) {
      data.append("amountRaised", formData.amountRaised.toString());
    }

    // Append Photo ONLY if a new one is selected (it has a URI)
    if (formData.photo && formData.photo.uri) {
      const uriParts = formData.photo.uri.split('.');
      const fileType = uriParts[uriParts.length - 1].toLowerCase();

      data.append("photo", {
        uri: formData.photo.uri,
        type: `image/${fileType === 'jpg' ? 'jpeg' : fileType}`,
        name: `photo-${Date.now()}.${fileType}`,
      } as any);

      console.log('📸 Updating with new photo:', formData.photo.uri);
    }

    console.log('🔄 Updating animal via FETCH:', id);

    // ✅ USE FETCH INSTEAD OF AXIOS
    const response = await fetch(`${API_BASE_URL}/api/admin/animals/${id}`, {
      method: "PUT", // Using PUT for updates
      body: data,
      headers: {
        // ⚠️ CRITICAL: Do NOT set Content-Type header. 
        // fetch will automatically set 'multipart/form-data; boundary=...'
        "Accept": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to update animal profile");
    }

    console.log('✅ Update animal success:', result);
    return result;

  } catch (error: any) {
    console.error('❌ Update animal error:', error);
    throw error;
  }
};

export const deleteAnimal = async (id: number) => {
  const response = await axios.delete(
    `${API_BASE_URL}/api/admin/animals/${id}`,
  );
  return response.data;
};

export const archiveAnimal = async (id: number) => {
  const response = await axios.patch(
    `${API_BASE_URL}/api/admin/animals/${id}/archive`,
  );
  return response.data;
};

// ============================================
// User APIs (UC10: View Donation Impact)
// ============================================

export const getUserProfile = async () => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${API_BASE_URL}/api/user/profile`, {
    headers,
  });
  return response.data.data;
};

export const getDonationImpact = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_BASE_URL}/api/user/donations/impact`, {
      headers,
    });
    return response.data.data;
  } catch (error) {
    console.error("Fetch impact error:", error);
    throw error;
  }
};

export const getDonationImpactDetail = async (transactionID: number) => {
  const headers = await getAuthHeaders();
  const response = await axios.get(
    `${API_BASE_URL}/api/user/donations/${transactionID}/impact`,
    { headers }
  );
  return response.data.data;
};

export const downloadCertificate = async (transactionID: number): Promise<Blob> => {
  const headers = await getAuthHeaders();
  const response = await axios.get(
    `${API_BASE_URL}/api/user/donations/${transactionID}/certificate`,
    {
      headers,
      responseType: "blob",
    }
  );
  return response.data;
};

// ============================================
// Admin Fund Allocation APIs (UC11)
// ============================================

export interface FundAllocation {
  allocationID?: number;
  transactionID: number;
  animalID: number;
  category: "Vet" | "Medication" | "Food" | "Shelter" | "Other";
  amount: number;
  description?: string;
  allocationDate: string;
}

export interface GetAllocationsParams {
  animalID?: number;
  transactionID?: number;
  category?: string;
  page?: number;
  limit?: number;
}

export const getAllocations = async (params?: GetAllocationsParams) => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${API_BASE_URL}/api/admin/allocations`, {
    headers,
    params,
  });
  return response.data.data;
};

export const createAllocation = async (allocation: FundAllocation) => {
  const headers = await getAuthHeaders();
  const response = await axios.post(
    `${API_BASE_URL}/api/admin/allocations`,
    allocation,
    { headers }
  );
  return response.data;
};

export const updateAllocation = async (
  allocationID: number,
  payload: any
) => {
  // If payload is FormData, use fetch
  if (payload instanceof FormData) {
    const authHeaders = await getAuthHeaders();
    const headers: Record<string, string> = {
      "Accept": "application/json",
    };
    if (authHeaders["x-user-id"]) {
      headers["x-user-id"] = authHeaders["x-user-id"];
    }

    const response = await fetch(
      `${API_BASE_URL}/api/admin/allocations/${allocationID}`,
      {
        method: "PUT",
        body: payload,
        headers,
      }
    );

    const result = await response.json();
    if (!response.ok) {
      const error = new Error(result.message || "Failed to update allocation");
      (error as any).response = { data: result, status: response.status };
      throw error;
    }
    return result;
  }

  // Fallback to JSON via Axios
  const headers = await getAuthHeaders();
  const response = await axios.put(
    `${API_BASE_URL}/api/admin/allocations/${allocationID}`,
    payload,
    { headers }
  );
  return response.data;
};

export const deleteAllocation = async (allocationID: number) => {
  const headers = await getAuthHeaders();
  const response = await axios.delete(
    `${API_BASE_URL}/api/admin/allocations/${allocationID}`,
    { headers }
  );
  return response.data;
};

// --------------------------------------------
// New UC11 endpoints (animal-first allocation)
// --------------------------------------------
export const fetchAllocationAnimals = async () => {
  const headers = await getAuthHeaders();
  const response = await axios.get(
    `${API_BASE_URL}/api/admin/fund-allocation/animals`,
    { headers },
  );
  return response.data.data;
};

export const fetchAllocationByAnimal = async (animalID: string | number) => {
  const headers = await getAuthHeaders();
  const response = await axios.get(
    `${API_BASE_URL}/api/admin/fund-allocation/${animalID}`,
    { headers },
  );
  return response.data.data;
};

export const fetchAllocationDetail = async (allocationID: string | number) => {
  const headers = await getAuthHeaders();
  const response = await axios.get(
    `${API_BASE_URL}/api/admin/fund-allocation/detail/${allocationID}`,
    { headers },
  );
  return response.data.data;
};

export const createAllocationForAnimal = async (
  animalID: string | number,
  payload: FormData | {
    category: string;
    allocationType?: string;
    serviceProvider?: string;
    allocationDate?: string;
    status?: "Draft" | "Verified" | "Published";
    amount: number;
    // Enhanced funding fields
    totalCost?: number;
    donationCoveredAmount?: number;
    externalCoveredAmount?: number;
    externalFundingSource?: string;
    externalFundingNotes?: string;
    fundingStatus?: "Fully Funded" | "Partially Funded";
    // Existing fields
    publicDescription?: string;
    internalNotes?: string;
    conditionUpdate?: string;
    receiptImage?: string;
    treatmentPhoto?: string;
  },
) => {
  // If payload is already FormData, use it directly
  if (payload instanceof FormData) {
    // Get auth headers for fetch request
    const authHeaders = await getAuthHeaders();
    // Build headers - don't set Content-Type, fetch will set it automatically with boundary for FormData
    const headers: Record<string, string> = {
      "Accept": "application/json",
    };
    // Add auth headers if they exist
    if (authHeaders["x-user-id"]) {
      headers["x-user-id"] = authHeaders["x-user-id"];
    }

    const response = await fetch(
      `${API_BASE_URL}/api/admin/fund-allocation/${animalID}`,
      {
        method: "POST",
        body: payload,
        headers,
      }
    );
    const result = await response.json();
    if (!response.ok) {
      const error = new Error(result.message || "Failed to create allocation");
      (error as any).response = { data: result, status: response.status };
      throw error;
    }
    return result;
  }

  const headers = await getAuthHeaders();

  // If images are provided, use FormData for multipart upload
  if (payload.receiptImage || payload.treatmentPhoto) {
    const formData = new FormData();
    formData.append("category", payload.category);
    formData.append("amount", payload.amount.toString());

    if (payload.allocationType) formData.append("allocationType", payload.allocationType);
    if (payload.serviceProvider) formData.append("serviceProvider", payload.serviceProvider);
    if (payload.allocationDate) formData.append("allocationDate", payload.allocationDate);
    if (payload.status) formData.append("status", payload.status);
    // Enhanced funding fields
    if (payload.totalCost !== undefined) formData.append("totalCost", payload.totalCost.toString());
    if (payload.donationCoveredAmount !== undefined) formData.append("donationCoveredAmount", payload.donationCoveredAmount.toString());
    if (payload.externalCoveredAmount !== undefined) formData.append("externalCoveredAmount", payload.externalCoveredAmount.toString());
    if (payload.externalFundingSource) formData.append("externalFundingSource", payload.externalFundingSource);
    if (payload.externalFundingNotes) formData.append("externalFundingNotes", payload.externalFundingNotes);
    if (payload.fundingStatus) formData.append("fundingStatus", payload.fundingStatus);
    // Existing fields
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
      } as any);
    }

    if (payload.treatmentPhoto) {
      const uriParts = payload.treatmentPhoto.split('.');
      const fileType = uriParts[uriParts.length - 1].toLowerCase();
      formData.append("treatmentPhoto", {
        uri: payload.treatmentPhoto,
        type: `image/${fileType === 'jpg' ? 'jpeg' : fileType}`,
        name: `treatment-${Date.now()}.${fileType}`,
      } as any);
    }

    // Use fetch for FormData
    const response = await fetch(
      `${API_BASE_URL}/api/admin/fund-allocation/${animalID}`,
      {
        method: "POST",
        body: formData,
        headers: {
          "Accept": "application/json",
        },
      }
    );
    return await response.json();
  } else {
    // Regular JSON request for non-image uploads
    // Ensure amount is sent as totalCost for consistency
    const jsonPayload = {
      ...payload,
      totalCost: payload.totalCost || payload.amount,
    };
    const response = await axios.post(
      `${API_BASE_URL}/api/admin/fund-allocation/${animalID}`,
      jsonPayload,
      { headers },
    );
    return response.data;
  }
};

export interface ProgressUpdate {
  updateID?: number;
  allocationID?: number;
  title: string;
  description: string;
  medicalCondition?: string;
  recoveryStatus: "Under Treatment" | "Recovering" | "Fully Recovered" | "Adopted" | "Other";
  updateDate: string;
}

export const getProgressUpdates = async (animalID: number) => {
  const headers = await getAuthHeaders();
  const response = await axios.get(
    `${API_BASE_URL}/api/admin/animals/${animalID}/progress`,
    { headers }
  );
  return response.data.data;
};

export const createProgressUpdate = async (
  animalID: number,
  update: ProgressUpdate
) => {
  const headers = await getAuthHeaders();
  const response = await axios.post(
    `${API_BASE_URL}/api/admin/animals/${animalID}/progress`,
    update,
    { headers }
  );
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
  return response.data.data; // assuming controller returns { success: true, data: [...] }
};

export const getRewardDetail = async (rewardID: string) => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${API_BASE_URL}/api/rewards/${rewardID}`, { headers });
  return response.data.data;
};

export const redeemReward = async (rewardID: string) => {
  const headers = await getAuthHeaders();
  const response = await axios.post(
    `${API_BASE_URL}/api/rewards/redeem`,
    { rewardID },
    { headers }
  );
  return response.data;
};

// ... existing methods ...

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
  return response.data; // Expecting { success: true, data: [...] }
};

export const createAdminReward = async (payload: any) => {
  const headers = await getAuthHeaders();
  const response = await axios.post(`${API_BASE_URL}/api/admin/rewards`, payload, { headers });
  return response.data;
};

export const updateAdminReward = async (rewardID: string, payload: any) => {
  const headers = await getAuthHeaders();
  const response = await axios.put(`${API_BASE_URL}/api/admin/rewards/${rewardID}`, payload, { headers });
  return response.data;
};

export const deleteAdminReward = async (rewardID: string) => {
  const headers = await getAuthHeaders();
  const response = await axios.delete(`${API_BASE_URL}/api/admin/rewards/${rewardID}`, { headers });
  return response.data;
};
