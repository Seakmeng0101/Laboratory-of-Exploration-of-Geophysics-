import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

export const API = axios.create({ baseURL: API_URL });

// Auth routes: never refresh or redirect for these
const authRoutes = [
  '/auth/login',
  '/auth/refresh',
  '/auth/verify-otp',
  '/auth/resend-otp',
  '/auth/forgot-password',
  '/auth/reset-password',
];

// Public routes: visitors can READ them without login (GET only)
const publicRoutes = [
  '/members',
  '/teams',
  '/services',
  '/projects',
  '/equipments',
  '/team-contacts',
  '/contact',
];

const goToLogin = () => {
  sessionStorage.clear();
  window.location.href = '/login';
};

API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    const url: string = originalRequest.url || '';
    const isGet = originalRequest.method?.toLowerCase() === 'get';
    const isSkipped =
      authRoutes.some((route) => url.includes(route)) ||
      (isGet && publicRoutes.some((route) => url.includes(route)));

    if (error.response?.status === 401 && !originalRequest._retry && !isSkipped) {
      originalRequest._retry = true;
      try {
        const refreshToken = sessionStorage.getItem('refreshToken');
        if (!refreshToken) {
          goToLogin();
          return Promise.reject(error);
        }

        const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = res.data;

        sessionStorage.setItem('accessToken', accessToken);
        sessionStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return API(originalRequest);
      } catch (refreshError) {
        goToLogin();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const login = (email: string, password: string) =>
  API.post('/auth/login', { email, password });

export const verifyOtp = (otp: string) =>
  API.post('/auth/verify-otp', { otp });

export const logout = (refreshToken: string) =>
  API.post('/auth/logout', { refreshToken });

export const getMe = () => API.get('/auth/me');

export const forgotPassword = (email: string) =>
  API.post('/auth/forgot-password', { email });

export const resetPassword = (email: string, password: string, confirmPassword: string) =>
  API.post('/auth/reset-password', { email, password, confirmPassword });

export const resendOtp = (email: string) =>
  API.post('/auth/resend-otp', { email });