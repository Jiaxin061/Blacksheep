// Offline stubbed auth service to remove API dependency
export const authService = {
  // Login user (offline mock)
  login: async (_email, _password) => ({
    success: true,
    user: { id: 1, name: 'Offline User', role: 'guest' },
    token: null,
    message: 'Authentication disabled (offline mode)',
  }),

  // Register user (offline mock)
  register: async (_userData) => ({
    success: true,
    user: { id: 1, name: 'Offline User', role: 'guest' },
    token: null,
    message: 'Registration disabled (offline mode)',
  }),

  // Logout user (offline mock)
  logout: async () => ({
    success: true,
    message: 'Logout completed (offline mode)',
  }),

  // Get current user (offline mock)
  getCurrentUser: async () => ({
    success: true,
    user: { id: 1, name: 'Offline User', role: 'guest' },
    token: null,
    message: 'Offline mode',
  }),
};

export default authService;






