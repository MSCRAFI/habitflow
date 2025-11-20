import axios from 'axios';

const RAW_API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
const API_BASE_URL = RAW_API_BASE_URL.endsWith('/') ? RAW_API_BASE_URL : `${RAW_API_BASE_URL}/`;

// Thin wrapper around axios with sane defaults and a few helpers.
// Methods are grouped by feature area (auth, users, habits, community, forest).
class APIClient {
  // Generic helpers for flexibility and future-proofing
  async get(url, config = {}) {
    const res = await this.client.get(url, config);
    return res.data;
  }
  async post(url, data = {}, config = {}) {
    const res = await this.client.post(url, data, config);
    return res.data;
  }
  async patch(url, data = {}, config = {}) {
    const res = await this.client.patch(url, data, config);
    return res.data;
  }
  async delete(url, config = {}) {
    const res = await this.client.delete(url, config);
    return res.data;
  }
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config || {};

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
              // Create a new axios instance to avoid interceptor recursion
              const refreshClient = axios.create({
                baseURL: API_BASE_URL,
                headers: {
                  'Content-Type': 'application/json',
                },
              });

              const refreshResponse = await refreshClient.post('auth/refresh/', {
                refresh: refreshToken,
              });

              const { access } = refreshResponse.data || {};
              if (access) {
                localStorage.setItem('access_token', access);
                this.setAuthToken(access);
                // Retry the original request with new token
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${access}`;
                return this.client(originalRequest);
              }
            }
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            this.clearAuthToken();
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  setAuthToken(token) {
    if (token) {
      this.client.defaults.headers.Authorization = `Bearer ${token}`;
    } else {
      delete this.client.defaults.headers.Authorization;
    }
  }

  clearAuthToken() {
    delete this.client.defaults.headers.Authorization;
  }

  // Auth endpoints
  async login(username, password) {
    // Our backend uses JWT simplejwt at /auth/login/ returning access/refresh/user
    const response = await this.client.post('auth/login/', { username, password });
    // Returns { access, refresh, user }

    return response.data;
  }

  async register(userData) {
    const response = await this.client.post('auth/register/', userData);
    return response.data;
  }

  async refreshToken(refreshToken) {
    const response = await this.client.post('auth/refresh/', { refresh: refreshToken });
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.client.get('users/me/');
    return response.data;
  }

  async updateProfile(profileData) {
    const response = await this.client.patch('users/profile/', profileData);
    return response.data;
  }

  async getProfile() {
    const response = await this.client.get('users/profile/');
    return response.data;
  }

  async getUserBadges() {
    const response = await this.client.get('/users/badges/');
    return response.data;
  }

  async getUserLevel() {
    const response = await this.client.get('users/level/');
    return response.data;
  }

  async searchUsers(query) {
    const response = await this.client.get('users/search/', { params: { q: query } });
    return response.data;
  }

  async followUser(userId) {
    const response = await this.client.post('users/follow/', { user_id: userId });
    return response.data;
  }

  async unfollowUser(userId) {
    const response = await this.client.delete('users/follow/', { data: { user_id: userId } });
    return response.data;
  }

  // ===== Habits =====
  async getHabits(params = {}) {
    const response = await this.client.get('habits/', { params });
    return response.data;
  }

  async createHabit(habitData) {
    const response = await this.client.post('habits/', habitData);
    return response.data;
  }

  async updateHabit(habitId, habitData) {
    const response = await this.client.patch(`habits/${habitId}/`, habitData);
    return response.data;
  }

  async deleteHabit(habitId) {
    const response = await this.client.delete(`habits/${habitId}/`);
    return response.data;
  }

  async getHabitEntries(habitId, params = {}) {
    const response = await this.client.get(`habits/${habitId}/entries/`, { params });
    return response.data;
  }

  async getHabitStacks() {
    const response = await this.client.get('habits/stacks/');
    return response.data;
  }

  async createHabitStack(data) {
    const response = await this.client.post('habits/stacks/', data);
    return response.data;
  }

  async createHabitEntry(habitId, entryData = {}) {
    // Align with backend: use mark_complete action for quick completion
    const payload = { note: entryData.note || '' };
    const response = await this.client.post(`habits/${habitId}/mark_complete/`, payload);
    return response.data;
  }

  async updateHabitEntry(habitId, entryId, entryData) {
    const response = await this.client.patch(`habits/${habitId}/entries/${entryId}/`, entryData);
    return response.data;
  }

  async getStatistics() {
    const response = await this.client.get('habits/statistics/');
    return response.data;
  }

  // ===== Community / Gamification =====
  async getSocialFeed() {
    const response = await this.client.get('habits/feed/');
    return response.data;
  }

  // Community
  async getCommunityStats() {
    const response = await this.client.get('users/community/stats/');
    return response.data;
  }

  async getLeaderboard(type = 'weekly') {
    const response = await this.client.get('users/community/leaderboard/', { params: { type } });
    return response.data;
  }

  async getBadges() {
    const response = await this.client.get('/users/badges/');
    return response.data;
  }

  async getPoints() {
    const response = await this.client.get('users/points/');
    return response.data;
  }

  // ===== Challenges =====
  async getChallenges() {
    const response = await this.client.get('habits/challenges/');
    return response.data;
  }

  async createChallenge(data) {
    const response = await this.client.post('habits/challenges/', data);
    return response.data;
  }

  async joinChallenge(id) {
    const response = await this.client.post(`habits/challenges/${id}/join/`);
    return response.data;
  }

  // Analytics
  async getWeeklyAnalytics() {
    const response = await this.client.get('habits/analytics/weekly/');
    return response.data;
  }

  async getMonthlyAnalytics() {
    const response = await this.client.get('habits/analytics/monthly/');
    return response.data;
  }

  // Following (removed duplicates)

  async getPublicUsers(params) {
    const response = await this.client.get('users/public/', { params });
    return response.data;
  }

  async getTodayHabits() {
    const response = await this.client.get('habits/today/');
    return response.data;
  }

  // Avatar upload
  async uploadAvatar(formData) {
    const response = await this.client.post('users/profile/avatar/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Analytics method (maps to backend statistics endpoint)
  async getAnalytics() {
    const response = await this.client.get('habits/statistics/');
    return response.data;
  }

  // ===== Forest Game =====
  async getForestOverview() {
    const response = await this.client.get('forest/overview/');
    return response.data;
  }

  async waterTree(habitId, waterType = 'normal') {
    const response = await this.client.post('forest/water/', {
      habit_id: habitId,
      water_type: waterType
    });
    return response.data;
  }

  async pruneTree(habitId) {
    const response = await this.client.post('forest/prune/', {
      habit_id: habitId
    });
    return response.data;
  }

  async fertilizeTree(habitId) {
    const response = await this.client.post('forest/fertilize/', {
      habit_id: habitId
    });
    return response.data;
  }

  async moveTree(habitId, x, y) {
    const response = await this.client.post('forest/move/', {
      habit_id: habitId,
      x: x,
      y: y
    });
    return response.data;
  }

  async changeWeather(weatherType, durationHours = 6) {
    const response = await this.client.post('forest/weather/', {
      weather_type: weatherType,
      duration_hours: durationHours
    });
    return response.data;
  }

  async getForestStatistics() {
    const response = await this.client.get('forest/statistics/');
    return response.data;
  }

  // ===== Utilities =====
  // Utility method for file uploads
  async uploadFile(endpoint, file, additionalData = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    const response = await this.client.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

const api = new APIClient();
export default api;