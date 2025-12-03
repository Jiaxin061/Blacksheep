import axios from "axios";
import { API_BASE_URL } from "../config/api";

axios.defaults.timeout = 10000;

export interface AnimalPayload {
  name: string;
  type: string;
  story: string;
  fundingGoal: number;
  photoURL: string;
  status: "Active" | "Funded" | "Adopted" | "Archived";
  amountRaised?: number;
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

export const createAnimal = async (payload: AnimalPayload) => {
  const response = await axios.post(
    `${API_BASE_URL}/api/admin/animals`,
    payload,
  );
  return response.data;
};

export const updateAnimal = async (
  id: number,
  payload: Required<AnimalPayload>,
) => {
  const response = await axios.put(
    `${API_BASE_URL}/api/admin/animals/${id}`,
    payload,
  );
  return response.data;
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


