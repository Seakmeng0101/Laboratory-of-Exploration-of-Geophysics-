import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:4000/api' });

API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export const getAllTeams = () => API.get('/auth/users');
export const deleteTeam = (id: string) => API.delete(`/auth/users/${id}`);
export const registerModerator = (data: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
}) => API.post('/auth/register', data);