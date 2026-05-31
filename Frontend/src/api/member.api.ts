import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:4000/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getAllMembers = () => API.get('/members');
export const getMemberById = (id: string) => API.get(`/members/${id}`);
export const createMember = (data: FormData) => API.post('/members', data);
export const updateMember = (id: string, data: FormData) => API.put(`/members/${id}`, data);
export const deleteMember = (id: string) => API.delete(`/members/${id}`);