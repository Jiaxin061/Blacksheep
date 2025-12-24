import { Platform } from 'react-native';
import { Config } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = Config.API_BASE_URL || 'http://192.168.1.100:3000/api';

class ApiService {
    
    // ==================== CONNECTION TEST ====================
    
    static async testConnection() {
        try {
            console.log('🔌 Testing connection to:', API_BASE_URL);
            const response = await fetch(`${API_BASE_URL.replace('/api', '')}/api/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Server is reachable:', data);
                return { success: true, message: 'Server is reachable', data };
            } else {
                console.error('❌ Server responded with error:', response.status);
                return { success: false, message: `Server error: ${response.status}` };
            }
        } catch (error) {
            console.error('❌ Connection test failed:', error);
            return { 
                success: false, 
                message: `Cannot connect to server. Make sure:\n1. Backend is running\n2. URL is correct: ${API_BASE_URL}\n3. Emulator can reach host` 
            };
        }
    }
    
    // ==================== PROTECTED FETCH HELPER ====================
    static async _protectedFetch(url, method = 'GET', data = null, contentType = 'application/json') {
        let token = null;
        try {
            token = await AsyncStorage.getItem('authToken'); 
        } catch (e) {
            console.error('Error retrieving token:', e);
        }

        const headers = {
            'Content-Type': contentType,
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`; 
        }

        const requestUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
        console.log(`🌐 Fetching: ${requestUrl} (${method})`);

        const config = {
            method,
            headers: headers,
            body: data ? (contentType === 'application/json' ? JSON.stringify(data) : data) : undefined,
        };

        try {
            const response = await fetch(requestUrl, config);
            
            if (response.status === 401) {
                 console.log('401 Unauthorized - Token missing/expired. Logging out user.');
            }
            
            return response;

        } catch (error) {
            throw new Error(`Network or Fetch error: ${error.message}`);
        }
    }

    // ==================== AUTHENTICATION ====================
    
    static async login(credentials) {
        try {
          console.log('🔐 Logging in with IC:', credentials.ic_number);
          
          const response = await fetch(`${API_BASE_URL}/auth/user/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
          });

          const data = await response.json();
          console.log('✅ Login response:', data);

          return data;
        } catch (error) {
          console.error('❌ Login error:', error);
          return { success: false, message: error.message };
        }
    }

    static async signup(userData) {
        try {
          console.log('🔐 Signing up user:', userData.ic_number);
          
          const response = await fetch(`${API_BASE_URL}/auth/user/signup`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
          });

          const data = await response.json();
          console.log('✅ Signup response:', data);

          return data;
        } catch (error) {
          console.error('❌ Signup error:', error);
          return { success: false, message: error.message };
        }
    }

    static async forgotPasswordRequest(data) {
        try {
          console.log('🔐 Forgot password request:', data);
          
          const response = await fetch(`${API_BASE_URL}/auth/user/forgot-password`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });

          const result = await response.json();
          console.log('✅ Forgot password response:', result);
          return result;
        } catch (error) {
          console.error('❌ Forgot password error:', error);
          return { success: false, message: error.message };
        }
    }

    static async resetPassword(data) {
        try {
          console.log('🔐 Resetting password for user:', data.user_id);
          
          const response = await fetch(`${API_BASE_URL}/auth/user/reset-password`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });

          const result = await response.json();
          console.log('✅ Reset password response:', result);
          return result;
        } catch (error) {
          console.error('❌ Reset password error:', error);
          return { success: false, message: error.message };
        }
    }

    static async adminLogin(credentials) {
        try {
          console.log('👨‍💼 Admin logging in:', credentials.email);
          
          const response = await fetch(`${API_BASE_URL}/auth/admin/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
          });

          const data = await response.json();
          console.log('✅ Admin login response:', data);

          return data;
        } catch (error) {
          console.error('❌ Admin login error:', error);
          return { success: false, message: error.message };
        }
    }

    static async getUserById(userId) {
        try {
          console.log('🔍 Getting user by ID:', userId);
          console.log('🌐 Full URL:', `${API_BASE_URL}/auth/users/${userId}`);
          
          const response = await fetch(`${API_BASE_URL}/auth/users/${userId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Response not OK:', response.status, errorText);
            return { 
              success: false, 
              message: `Server error: ${response.status} - ${errorText}` 
            };
          }

          const data = await response.json();
          console.log('✅ User data:', data);

          return data;
        } catch (error) {
          console.error('❌ Get user error:', error);
          console.error('❌ Error details:', {
            message: error.message,
            name: error.name,
            stack: error.stack
          });
          
          // More helpful error message
          let errorMsg = error.message;
          if (error.message === 'Network request failed' || error.message.includes('Network')) {
            errorMsg = `Cannot connect to server at ${API_BASE_URL}. Make sure:\n1. Backend server is running\n2. Server is accessible from emulator\n3. Check firewall settings`;
          }
          
          return { success: false, message: errorMsg };
        }
    }

    // ==================== REPORTS ====================
    
    static async getAllReports(filters = {}) {
        try {
            const queryParams = new URLSearchParams();
            
            if (filters.urgency) queryParams.append('urgency', filters.urgency);
            if (filters.status) queryParams.append('status', filters.status);
            if (filters.area) queryParams.append('area', filters.area);
            
            const queryString = queryParams.toString();
            const url = `${API_BASE_URL}/reports${queryString ? `?${queryString}` : ''}`;
            
            console.log('📊 Fetching ALL reports from:', url);
            
            const response = await ApiService._protectedFetch(url, 'GET'); 
            
            const data = await response.json();
            console.log('📊 API Response:', data);

            // Handle different response formats
            if (Array.isArray(data)) {
              return { success: true, reports: data };
            }
            
            if (data.success) {
              return data;
            }
            
            if (data.reports) {
              return { success: true, reports: data.reports };
            }

            return { success: true, reports: data };
        } catch (error) {
            console.error('❌ getAllReports error:', error);
            return { success: false, reports: [], message: error.message }; 
        }
    }

    static async getUserReports() {
        try {
            console.log('👤 Fetching user reports');
            
            const userId = await AsyncStorage.getItem('userId');
            const url = userId ? `/reports/my-reports?user_id=${userId}` : '/reports/my-reports';

            const response = await ApiService._protectedFetch(url, 'GET');
            const data = await response.json();
            
            console.log('👤 User reports response:', data);
            
            if (data.success) {
                return data; // { success: true, reports: [...] }
            }
            
            // Handle array response
            if (Array.isArray(data)) {
                return { success: true, reports: data };
            }
            
            return { success: false, reports: [], message: data.message || 'Failed to fetch reports' };
            
        } catch (error) {
            console.error('❌ getUserReports error:', error);
            return { success: false, reports: [], message: error.message };
        }
    }

    static async getReportById(id) {
    try {
        console.log('🔍 Fetching report by ID:', id);
        
        // _protectedFetch already returns parsed JSON
        const data = await ApiService._protectedFetch(`/reports/${id}`);
        
        console.log('🔍 Report details:', data);
        
        return data; // Already parsed JSON
        
    } catch (error) {
        console.error('❌ getReportById error:', error);
        return { success: false, message: error.message };
    }
}

    static async submitReport(reportData) {
        try {
            console.log('📝 Submitting report:', reportData);
            
            const url = `${API_BASE_URL}/reports`;
            
            const response = await ApiService._protectedFetch(url, 'POST', reportData);

            const data = await response.json();
            console.log('✅ Submit response:', data);

            return data;
        } catch (error) {
            console.error('❌ submitReport error:', error);
            return { success: false, message: error.message };
        }
    }

    static async updateReport(id, updates) {
        try {
            console.log('🔄 Updating report:', id, updates);
            
            const url = `${API_BASE_URL}/reports/${id}`;

            const response = await ApiService._protectedFetch(url, 'PUT', updates);

            const data = await response.json();

            console.log('✅ Update response:', data);

            return data; 

        } catch (error) {
            console.error('❌ updateReport error:', error);
            return { success: false, message: error.message };
        }
    }

    static async updateReportStatus(id, status) {
        try {
            console.log('🔄 Updating status:', id, status);
            
            const url = `${API_BASE_URL}/reports/${id}/status`;

            const response = await ApiService._protectedFetch(url, 'PATCH', { status });

            const data = await response.json();
            console.log('✅ Status update response:', data);

            return data;
        } catch (error) {
            console.error('❌ updateReportStatus error:', error);
            return { success: false, message: error.message };
        }
    }

    static async deleteReport(id) {
        try {
            console.log('🗑️ Deleting report:', id);
            
            const url = `${API_BASE_URL}/reports/${id}`;

            const response = await ApiService._protectedFetch(url, 'DELETE');

            const data = await response.json();
            console.log('✅ Delete response:', data);

            return data;
        } catch (error) {
            console.error('❌ deleteReport error:', error);
            return { success: false, message: error.message };
        }
    }

    // ==================== RESCUE TASKS ====================

    static async getRescueTasks(allTasks = false) {
        try {
            const queryParam = allTasks ? '?all=true' : '';
            console.log('🚑 Fetching rescue tasks', allTasks ? '(all tasks)' : '(available only)');
            const response = await ApiService._protectedFetch(`/rescue-tasks${queryParam}`, 'GET');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('❌ getRescueTasks error:', error);
            return { success: false, tasks: [], message: error.message };
        }
    }

    static async getMyRescueTasks() {
        try {
            console.log('🚑 Fetching my rescue tasks');
            const userId = await AsyncStorage.getItem('userId');
            const queryParam = userId ? `?user_id=${userId}` : '';
            const response = await ApiService._protectedFetch(`/rescue-tasks/my-tasks${queryParam}`, 'GET');
            const data = await response.json();
            console.log('🚑 My tasks response:', data);
            return data;
        } catch (error) {
            console.error('❌ getMyRescueTasks error:', error);
            return { success: false, tasks: [], message: error.message };
        }
    }

    static async getRescueTaskById(taskId) {
        try {
            console.log('🔍 Fetching rescue task by ID:', taskId);
            const userId = await AsyncStorage.getItem('userId');
            const queryParam = userId ? `?user_id=${userId}` : '';
            const response = await ApiService._protectedFetch(`/rescue-tasks/${taskId}${queryParam}`, 'GET');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('❌ getRescueTaskById error:', error);
            return { success: false, message: error.message };
        }
    }

    static async acceptRescueTask(taskId) {
        try {
            console.log('🚑 Accepting rescue task:', taskId);
            const userId = await AsyncStorage.getItem('userId');
            const response = await ApiService._protectedFetch(
                `/rescue-tasks/${taskId}/accept`,
                'POST',
                userId ? { user_id: Number(userId) } : {}
            );
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('❌ acceptRescueTask error:', error);
            return { success: false, message: error.message };
        }
    }

    static async updateRescueTaskStatus(taskId, status) {
        try {
            console.log('🚑 Updating rescue task status:', taskId, status);
            const response = await ApiService._protectedFetch(
                `/rescue-tasks/${taskId}/status`,
                'PATCH',
                { status }
            );
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('❌ updateRescueTaskStatus error:', error);
            return { success: false, message: error.message };
        }
    }

    static async updateRescueTask(taskId, updateData) {
        try {
            console.log('📝 Updating rescue task:', taskId, updateData);
            const response = await ApiService._protectedFetch(
                `/rescue-tasks/${taskId}`,
                'PATCH',
                updateData
            );
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('❌ updateRescueTask error:', error);
            return { success: false, message: error.message };
        }
    }

    static async deleteRescueTask(taskId) {
        try {
            console.log('🚑 Deleting rescue task:', taskId);
            const response = await ApiService._protectedFetch(`/rescue-tasks/${taskId}`, 'DELETE');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('❌ deleteRescueTask error:', error);
            return { success: false, message: error.message };
        }
    }

    static async createRescueTask(taskData) {
        try {
            console.log('🚑 Creating rescue task:', taskData);
            const response = await ApiService._protectedFetch(
                '/rescue-tasks',
                'POST',
                taskData
            );
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('❌ createRescueTask error:', error);
            return { success: false, message: error.message };
        }
    }

    static async uploadImage(imageUri) {
        try {
            console.log('📤 Uploading image:', imageUri);
            
            const formData = new FormData();
            const filename = imageUri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';

            formData.append('image', {
                uri: imageUri,
                name: filename,
                type,
            });

            const url = `${API_BASE_URL}/upload`;
            
            let token = await AsyncStorage.getItem('authToken');
            
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': token ? `Bearer ${token}` : undefined,
                },
            });

            const data = await response.json();
            console.log('✅ Upload response:', data);

            // Fix image URL for Android emulator
            if (data.success && data.imageUrl) {
                // Replace localhost/127.0.0.1 with 10.0.2.2 for Android emulator
                if (Platform.OS === 'android' && (data.imageUrl.includes('localhost') || data.imageUrl.includes('127.0.0.1'))) {
                    data.imageUrl = data.imageUrl.replace(/http:\/\/(localhost|127\.0\.0\.1):(\d+)/, 'http://10.0.2.2:$2');
                    console.log('📱 Fixed image URL for emulator:', data.imageUrl);
                }
            }

            return data;
        } catch (error) {
            console.error('❌ uploadImage error:', error);
            return { success: false, message: error.message };
        }
    }
}

// ==================== EXPORTS ====================

// Default export (for: import ApiService from './api')
export default ApiService;

// Named exports (for: import { getAllReports } from './api')
export const login = ApiService.login.bind(ApiService);
export const signup = ApiService.signup.bind(ApiService);
export const adminLogin = ApiService.adminLogin.bind(ApiService);
export const getUserById = ApiService.getUserById.bind(ApiService);
export const getAllReports = ApiService.getAllReports.bind(ApiService);
export const getUserReports = ApiService.getUserReports.bind(ApiService);
export const getReportById = ApiService.getReportById.bind(ApiService);
export const submitReport = ApiService.submitReport.bind(ApiService);
export const updateReport = ApiService.updateReport.bind(ApiService);
export const updateReportStatus = ApiService.updateReportStatus.bind(ApiService);
export const deleteReport = ApiService.deleteReport.bind(ApiService);
export const uploadImage = ApiService.uploadImage.bind(ApiService);
export const getRescueTasks = ApiService.getRescueTasks.bind(ApiService);
export const getMyRescueTasks = ApiService.getMyRescueTasks.bind(ApiService);
export const getRescueTaskById = ApiService.getRescueTaskById.bind(ApiService);
export const acceptRescueTask = ApiService.acceptRescueTask.bind(ApiService);
export const updateRescueTaskStatus = ApiService.updateRescueTaskStatus.bind(ApiService);
export const updateRescueTask = ApiService.updateRescueTask.bind(ApiService);
export const deleteRescueTask = ApiService.deleteRescueTask.bind(ApiService);
export const createRescueTask = ApiService.createRescueTask.bind(ApiService);