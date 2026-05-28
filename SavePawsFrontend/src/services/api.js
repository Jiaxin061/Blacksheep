import { Platform } from 'react-native';
import { Config } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = Config.API_BASE_URL || 'http://192.168.1.100:3000/api';

class ApiService {
<<<<<<< HEAD
    
    // ==================== CONNECTION TEST ====================
    
=======
    static BASE_URL = API_BASE_URL;

    // ==================== CONNECTION TEST ====================

>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
    static async testConnection() {
        try {
            console.log('🔌 Testing connection to:', API_BASE_URL);
            const response = await fetch(`${API_BASE_URL.replace('/api', '')}/api/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
<<<<<<< HEAD
            
=======

>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
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
<<<<<<< HEAD
            return { 
                success: false, 
                message: `Cannot connect to server. Make sure:\n1. Backend is running\n2. URL is correct: ${API_BASE_URL}\n3. Emulator can reach host` 
            };
        }
    }
    
=======
            return {
                success: false,
                message: `Cannot connect to server. Make sure:\n1. Backend is running\n2. URL is correct: ${API_BASE_URL}\n3. Emulator can reach host`
            };
        }
    }

>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
    // ==================== PROTECTED FETCH HELPER ====================
    static async _protectedFetch(url, method = 'GET', data = null, contentType = 'application/json') {
        let token = null;
        try {
<<<<<<< HEAD
            token = await AsyncStorage.getItem('authToken'); 
=======
            token = await AsyncStorage.getItem('authToken');
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
        } catch (e) {
            console.error('Error retrieving token:', e);
        }

        const headers = {
            'Content-Type': contentType,
        };
<<<<<<< HEAD
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`; 
=======

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
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
<<<<<<< HEAD
            
            if (response.status === 401) {
                 console.log('401 Unauthorized - Token missing/expired. Logging out user.');
            }
            
=======

            if (response.status === 401) {
                console.log('401 Unauthorized - Token missing/expired. Logging out user.');
            }

>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
            return response;

        } catch (error) {
            throw new Error(`Network or Fetch error: ${error.message}`);
        }
    }

    // ==================== AUTHENTICATION ====================
<<<<<<< HEAD
    
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
=======

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
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
        }
    }

    static async signup(userData) {
        try {
<<<<<<< HEAD
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
=======
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
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
        }
    }

    static async forgotPasswordRequest(data) {
        try {
<<<<<<< HEAD
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
=======
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
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
        }
    }

    static async resetPassword(data) {
        try {
<<<<<<< HEAD
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
=======
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
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
        }
    }

    static async adminLogin(credentials) {
        try {
<<<<<<< HEAD
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
=======
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
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
        }
    }

    static async getUserById(userId) {
<<<<<<< HEAD
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
=======
        // userId is ignored because we fetch based on the token for security/simplicity
        try {
            console.log('🔍 Getting current user profile');
            const response = await ApiService._protectedFetch('/auth/user/me', 'GET');

            if (!response.ok) {
                const errorText = await response.text();
                return {
                    success: false,
                    message: `Server error: ${response.status}`
                };
            }

            const data = await response.json();
            return data; // returns { success: true, user: {...} }
        } catch (error) {
            console.error('❌ Get user error:', error);
            return { success: false, message: error.message };
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
        }
    }

    // ==================== REPORTS ====================
<<<<<<< HEAD
    
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
            
=======

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

>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
            const data = await response.json();
            console.log('📊 API Response:', data);

            // Handle different response formats
            if (Array.isArray(data)) {
<<<<<<< HEAD
              return { success: true, reports: data };
            }
            
            if (data.success) {
              return data;
            }
            
            if (data.reports) {
              return { success: true, reports: data.reports };
=======
                return { success: true, reports: data };
            }

            if (data.success) {
                return data;
            }

            if (data.reports) {
                return { success: true, reports: data.reports };
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
            }

            return { success: true, reports: data };
        } catch (error) {
            console.error('❌ getAllReports error:', error);
<<<<<<< HEAD
            return { success: false, reports: [], message: error.message }; 
=======
            return { success: false, reports: [], message: error.message };
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
        }
    }

    static async getUserReports() {
        try {
            console.log('👤 Fetching user reports');
<<<<<<< HEAD
            
=======

>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
            const userId = await AsyncStorage.getItem('userId');
            const url = userId ? `/reports/my-reports?user_id=${userId}` : '/reports/my-reports';

            const response = await ApiService._protectedFetch(url, 'GET');
            const data = await response.json();
<<<<<<< HEAD
            
            console.log('👤 User reports response:', data);
            
            if (data.success) {
                return data; // { success: true, reports: [...] }
            }
            
=======

            console.log('👤 User reports response:', data);

            if (data.success) {
                return data; // { success: true, reports: [...] }
            }

>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
            // Handle array response
            if (Array.isArray(data)) {
                return { success: true, reports: data };
            }
<<<<<<< HEAD
            
            return { success: false, reports: [], message: data.message || 'Failed to fetch reports' };
            
=======

            return { success: false, reports: [], message: data.message || 'Failed to fetch reports' };

>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
        } catch (error) {
            console.error('❌ getUserReports error:', error);
            return { success: false, reports: [], message: error.message };
        }
    }

    static async getReportById(id) {
<<<<<<< HEAD
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
=======
        try {
            console.log('🔍 Fetching report by ID:', id);

            // _protectedFetch returns the raw Response object
            const response = await ApiService._protectedFetch(`/reports/${id}`);
            const data = await response.json();

            console.log('🔍 Report details:', data);

            return data; // Already parsed JSON

        } catch (error) {
            console.error('❌ getReportById error:', error);
            return { success: false, message: error.message };
        }
    }
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0

    static async submitReport(reportData) {
        try {
            console.log('📝 Submitting report:', reportData);
<<<<<<< HEAD
            
            const url = `${API_BASE_URL}/reports`;
            
=======

            const url = `${API_BASE_URL}/reports`;

>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
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
<<<<<<< HEAD
            
=======

>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
            const url = `${API_BASE_URL}/reports/${id}`;

            const response = await ApiService._protectedFetch(url, 'PUT', updates);

            const data = await response.json();

            console.log('✅ Update response:', data);

<<<<<<< HEAD
            return data; 
=======
            return data;
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0

        } catch (error) {
            console.error('❌ updateReport error:', error);
            return { success: false, message: error.message };
        }
    }

    static async updateReportStatus(id, status) {
        try {
            console.log('🔄 Updating status:', id, status);
<<<<<<< HEAD
            
=======

>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
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
<<<<<<< HEAD
            
=======

>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
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
<<<<<<< HEAD
            
=======

>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
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
<<<<<<< HEAD
            
            let token = await AsyncStorage.getItem('authToken');
            
=======

            let token = await AsyncStorage.getItem('authToken');

>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
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

    // ==================== MODULE 3: TASK VERIFICATION ====================

    // UC01: Get Task Evidence (Admin)
    static async getTaskEvidence(taskId) {
        try {
            const response = await this._protectedFetch(
                `/rescue-tasks/${taskId}/evidence`,
                'GET'
            );
<<<<<<< HEAD
            
=======

>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
            // Check if response is ok
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to fetch task evidence' }));
                return { success: false, message: errorData.message || 'Failed to fetch task evidence' };
            }
<<<<<<< HEAD
            
=======

>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('❌ getTaskEvidence error:', error);
            return { success: false, message: error.message || 'Network error' };
        }
    }

    // UC02: Verify Task & Blacklist User (Admin)
    static async verifyTask(taskId, verificationData) {
        try {
            const response = await this._protectedFetch(
                `/rescue-tasks/${taskId}/verify`,
                'POST',
                verificationData
            );
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('❌ verifyTask error:', error);
            return { success: false, message: error.message };
        }
    }

    // UC02: Blacklist User (Admin)
    static async blacklistUser(userId) {
        try {
            const response = await this._protectedFetch(
                `/users/${userId}/blacklist`,
                'POST'
            );
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('❌ blacklistUser error:', error);
            return { success: false, message: error.message };
        }
    }

    // Toggle User Status (Block/Unblock) (Admin)
    static async toggleUserStatus(userId) {
        try {
            const response = await this._protectedFetch(
                `/users/${userId}/toggle-status`,
                'POST'
            );
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('❌ toggleUserStatus error:', error);
            return { success: false, message: error.message };
        }
    }

    // Get all blacklisted users (Admin)
    static async getBlacklistedUsers() {
        try {
            const response = await this._protectedFetch(
                '/users/blacklisted',
                'GET'
            );
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('❌ getBlacklistedUsers error:', error);
            return { success: false, message: error.message };
        }
    }

    // UC03: Get My Task Outcomes (User)
    static async getMyTaskOutcomes() {
        try {
            console.log('📋 Fetching my task outcomes');
            const userId = await AsyncStorage.getItem('userId');
            const queryParam = userId ? `?user_id=${userId}` : '';
            const response = await ApiService._protectedFetch(`/rescue-tasks/my-tasks/outcomes${queryParam}`, 'GET');
<<<<<<< HEAD
            
=======

>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
            // Check if response is ok
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to fetch task outcomes' }));
                console.log('📋 My task outcomes response:', errorData);
                return { success: false, message: errorData.message || 'Failed to fetch task outcomes' };
            }
<<<<<<< HEAD
            
=======

>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
            const data = await response.json();
            console.log('📋 My task outcomes response:', data);
            return data;
        } catch (error) {
            console.error('❌ getMyTaskOutcomes error:', error);
            return { success: false, message: error.message || 'Network error' };
        }
    }
<<<<<<< HEAD
=======
    // ==================== COMMUNITY ====================

    static async getCommunityFeed() {
        try {
            console.log('👥 Fetching community feed');
            const response = await ApiService._protectedFetch('/community/feed', 'GET');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('❌ getCommunityFeed error:', error);
            return [];
        }
    }

    static async getCommunityPostDetails(postId) {
        try {
            console.log('🔍 Fetching post details:', postId);
            const response = await ApiService._protectedFetch(`/community/posts/${postId}`, 'GET');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('❌ getCommunityPostDetails error:', error);
            return null;
        }
    }

    static async createCommunityPost(userId, text, imageUri, isEdit = false, postId = null) {
        try {
            console.log(isEdit ? '📝 Updating post:' : '📝 Creating post:', text);
            const formData = new FormData();
            formData.append('userId', userId);
            formData.append('text', text);

            if (imageUri) {
                // Check if it's a new image (file URI) or existing (http/filename)
                if (imageUri.startsWith('file://')) {
                    const filename = imageUri.split('/').pop();
                    const match = /\.(\w+)$/.exec(filename);
                    const type = match ? `image/${match[1]}` : 'image/jpeg';
                    formData.append('image', {
                        uri: imageUri,
                        name: filename,
                        type,
                    });
                } else {
                    // Existing image
                    formData.append('existingImage', imageUri);
                }
            }

            const url = isEdit ? `/community/update/${postId}` : '/community/create';
            let token = await AsyncStorage.getItem('authToken');

            const response = await fetch(`${API_BASE_URL}${url}`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': token ? `Bearer ${token}` : undefined,
                },
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('❌ createCommunityPost error:', error);
            return { success: false, message: error.message };
        }
    }

    static async deleteCommunityPost(postId) {
        try {
            console.log('🗑️ Deleting post:', postId);
            const response = await ApiService._protectedFetch(`/community/delete/${postId}`, 'DELETE');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('❌ deleteCommunityPost error:', error);
            return { success: false, message: error.message };
        }
    }

    static async deleteCommunityComment(commentId) {
        try {
            console.log('🗑️ Deleting comment:', commentId);
            const response = await ApiService._protectedFetch(`/community/comments/${commentId}`, 'DELETE');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('❌ deleteCommunityComment error:', error);
            return { success: false, message: error.message };
        }
    }

    static async addCommunityComment(postId, userId, text) {
        try {
            console.log('💬 Adding comment:', text);
            const response = await ApiService._protectedFetch('/community/comments', 'POST', {
                postId,
                userId,
                text
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('❌ addCommunityComment error:', error);
            return { success: false, message: error.message };
        }
    }

    // ==================== AI ASSISTANT API ====================

    static async askAI(userId, userQuery) {
        try {
            console.log('🤖 Asking AI:', userQuery);
            const response = await ApiService._protectedFetch('/ai/chat', 'POST', {
                userID: userId,
                user_query: userQuery
            }); // Default content type is application/json

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || 'AI Request Failed');
            }
            return await response.json();
        } catch (error) {
            console.error('❌ askAI error:', error);
            return { error: error.message };
        }
    }

    static async getAIHistory(userId) {
        try {
            const response = await ApiService._protectedFetch(`/ai/history/${userId}`);
            return await response.json();
        } catch (error) {
            console.error('❌ getAIHistory error:', error);
            return [];
        }
    }

    // ==================== VOLUNTEER MODULE ====================

    // Submit Volunteer Registration
    static async submitVolunteerRegistration(registrationData) {
        try {
            console.log('🤝 Submitting volunteer registration:', registrationData);
            const response = await ApiService._protectedFetch('/volunteer/register', 'POST', registrationData);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('❌ submitVolunteerRegistration error:', error);
            return { success: false, message: error.message };
        }
    }

    // Check Volunteer Status
    static async getVolunteerStatus(userId) {
        try {
            console.log('🤝 Checking volunteer status for:', userId);
            const response = await ApiService._protectedFetch(`/volunteer/status/${userId}`, 'GET');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('❌ getVolunteerStatus error:', error);
            return { hasRegistration: false, status: null, error: true };
        }
    }

    // Get Registration Details
    static async getRegistrationDetails(userId) {
        try {
            const response = await ApiService._protectedFetch(`/volunteer/registration/${userId}`, 'GET');
            if (response.status === 404) return null;
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('❌ getRegistrationDetails error:', error);
            return null;
        }
    }

    // Get Volunteer Contributions
    static async getContributions(userId) {
        try {
            const response = await ApiService._protectedFetch(`/volunteer/contributions/${userId}`, 'GET');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('❌ getContributions error:', error);
            return [];
        }
    }

    // Get All Available Events
    static async getAvailableEvents() {
        try {
            const response = await ApiService._protectedFetch('/events', 'GET');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('❌ getAvailableEvents error:', error);
            return [];
        }
    }

    // Get Event Details
    static async getEventDetails(eventId) {
        try {
            const response = await ApiService._protectedFetch(`/events/${eventId}`, 'GET');
            if (response.status === 404) return null;
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('❌ getEventDetails error:', error);
            return null;
        }
    }

    // Register for Event
    static async registerForEvent(userId, eventId) {
        try {
            console.log(`🤝 Registering user ${userId} for event ${eventId}`);
            const response = await ApiService._protectedFetch('/events/register', 'POST', { userID: userId, eventID: eventId });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('❌ registerForEvent error:', error);
            return { success: false, message: error.message };
        }
    }

    // Get User's Registered Events
    static async getUserEvents(userId) {
        try {
            const response = await ApiService._protectedFetch(`/events/user/${userId}`, 'GET');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('❌ getUserEvents error:', error);
            return [];
        }
    }


    static async getFullAIHistory(userId) {
        try {
            const response = await ApiService._protectedFetch(`/ai/history/all/${userId}`);
            return await response.json();
        } catch (error) {
            console.error('❌ getFullAIHistory error:', error);
            return [];
        }
    }

    static async clearAIHistory(userId) {
        try {
            const response = await ApiService._protectedFetch(`/ai/history/${userId}`, 'DELETE');
            return await response.json();
        } catch (error) {
            console.error('❌ clearAIHistory error:', error);
            return { success: false };
        }
    }

    // ==================== ADMIN COMMUNITY ====================
    static async getAdminCommunityPosts(status = 'Active') {
        const response = await ApiService._protectedFetch(`/community/admin/posts?status=${status}`);
        if (!response.ok) throw new Error('Failed to fetch admin posts');
        return await response.json();
    }

    static async restoreCommunityPost(postId) {
        const response = await ApiService._protectedFetch(`/community/admin/posts/${postId}/restore`, 'POST');
        if (!response.ok) throw new Error('Failed to restore post');
        return await response.json();
    }

    static async adminDeleteCommunityPost(postId) {
        const response = await ApiService._protectedFetch(`/community/admin/posts/${postId}`, 'DELETE');
        if (!response.ok) throw new Error('Failed to delete post');
        return await response.json();
    }

    // ==================== ADMIN EVENTS ====================
    static async getAdminEvents() {
        const response = await ApiService._protectedFetch('/admin/events');
        if (!response.ok) throw new Error('Failed to fetch events');
        return await response.json();
    }

    static async createAdminEvent(eventData) {
        const response = await ApiService._protectedFetch('/admin/events', 'POST', eventData);
        return await response.json();
    }

    static async updateAdminEvent(id, eventData) {
        const response = await ApiService._protectedFetch(`/admin/events/${id}`, 'PUT', eventData);
        return await response.json();
    }

    static async deleteAdminEvent(id) {
        const response = await ApiService._protectedFetch(`/admin/events/${id}`, 'DELETE');
        return await response.json();
    }

    // ==================== ADMIN REGISTRATIONS ====================
    static async getAdminRegistrations() {
        const response = await ApiService._protectedFetch('/admin/registrations');
        if (!response.ok) throw new Error('Failed to fetch registrations');
        return await response.json();
    }

    static async approveRegistration(id) {
        const response = await ApiService._protectedFetch(`/admin/registrations/${id}/approve`, 'POST', { adminID: 1 });
        return await response.json();
    }

    static async rejectRegistration(id, reason) {
        const response = await ApiService._protectedFetch(`/admin/registrations/${id}/reject`, 'POST', { adminID: 1, reason });
        return await response.json();
    }
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
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

<<<<<<< HEAD
=======
// Community
export const getCommunityFeed = ApiService.getCommunityFeed.bind(ApiService);
export const getCommunityPostDetails = ApiService.getCommunityPostDetails.bind(ApiService);
export const createCommunityPost = ApiService.createCommunityPost.bind(ApiService);
export const deleteCommunityPost = ApiService.deleteCommunityPost.bind(ApiService);
export const deleteCommunityComment = ApiService.deleteCommunityComment.bind(ApiService);
export const addCommunityComment = ApiService.addCommunityComment.bind(ApiService);

export const askAI = ApiService.askAI.bind(ApiService);
export const getAIHistory = ApiService.getAIHistory.bind(ApiService);
export const getFullAIHistory = ApiService.getFullAIHistory.bind(ApiService);
export const clearAIHistory = ApiService.clearAIHistory.bind(ApiService);

// Volunteer
export const submitVolunteerRegistration = ApiService.submitVolunteerRegistration.bind(ApiService);
export const getVolunteerStatus = ApiService.getVolunteerStatus.bind(ApiService);
export const getRegistrationDetails = ApiService.getRegistrationDetails.bind(ApiService);
export const getContributions = ApiService.getContributions.bind(ApiService);
export const getAvailableEvents = ApiService.getAvailableEvents.bind(ApiService);
export const getEventDetails = ApiService.getEventDetails.bind(ApiService);
export const registerForEvent = ApiService.registerForEvent.bind(ApiService);
export const getUserEvents = ApiService.getUserEvents.bind(ApiService);

// Admin Community
export const getAdminCommunityPosts = ApiService.getAdminCommunityPosts.bind(ApiService);
export const restoreCommunityPost = ApiService.restoreCommunityPost.bind(ApiService);
export const adminDeleteCommunityPost = ApiService.adminDeleteCommunityPost.bind(ApiService);

// Admin Events
export const getAdminEvents = ApiService.getAdminEvents.bind(ApiService);
export const createAdminEvent = ApiService.createAdminEvent.bind(ApiService);
export const updateAdminEvent = ApiService.updateAdminEvent.bind(ApiService);
export const deleteAdminEvent = ApiService.deleteAdminEvent.bind(ApiService);

// Admin Registrations
export const getAdminRegistrations = ApiService.getAdminRegistrations.bind(ApiService);
export const approveRegistration = ApiService.approveRegistration.bind(ApiService);
export const rejectRegistration = ApiService.rejectRegistration.bind(ApiService);

>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
// ==================== DONATION API RE-EXPORTS ====================
// Re-export donation-related functions from donationApi.js
export {
    getDonationImpact,
    getDonationImpactDetail,
    getRewardBalance,
    getRewardCatalogue,
    getRewardDetail,
    redeemReward,
    getRewardHistory,
    fetchUserAnimals,
    fetchAnimalDetails,
    fetchAdminAnimals,
    createAnimal,
    updateAnimal,
    deleteAnimal,
    archiveAnimal,
    getUserProfile,
    downloadCertificate,
    getAllocations,
    createAllocation,
    updateAllocation,
    deleteAllocation,
    fetchAllocationAnimals,
    fetchAllocationByAnimal,
    fetchAllocationDetail,
    createAllocationForAnimal,
    getProgressUpdates,
    createProgressUpdate,
    fetchAdminRewards,
    createAdminReward,
    updateAdminReward,
    deleteAdminReward,
} from './donationApi';