// File: app/services/ApiService.js

const API_URL = 'http://10.0.2.2:3000';

const fetchWithTimeout = async (resource, options = {}) => {
    const { timeout = 15000 } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(resource, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
};

export const ApiService = {
    get: async (endpoint) => {
        const response = await fetchWithTimeout(`${API_URL}${endpoint}`);
        if (!response.ok) throw new Error(`GET ${endpoint} failed`);
        return await response.json();
    },
    post: async (endpoint, data) => {
        const response = await fetchWithTimeout(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(`POST ${endpoint} failed`);
        return await response.json();
    },
    put: async (endpoint, data) => {
        const response = await fetchWithTimeout(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(`PUT ${endpoint} failed`);
        return await response.json();
    },
    delete: async (endpoint) => {
        const response = await fetchWithTimeout(`${API_URL}${endpoint}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error(`DELETE ${endpoint} failed`);
        return await response.json();
    }
};
