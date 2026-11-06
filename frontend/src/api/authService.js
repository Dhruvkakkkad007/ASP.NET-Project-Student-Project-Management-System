import axiosClient from './axiosClient';

/**
 * Service for authentication endpoints
 */
export const authService = {
  /**
   * Log in user with credentials
   * @param {{ email: string, password: string }} credentials
   * @returns {Promise<{ token: string }>}
   */
  async login(credentials) {
    // Both /Users/login and /User/login work
    const response = await axiosClient.post('/Users/login', credentials);
    // Backend returns { Token: "..." } or { token: "..." }
    const token = response.token || response.Token;
    return { token };
  },
};

