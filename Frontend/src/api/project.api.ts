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

export const getAllProjects = () => API.get('/projects');
export const getProjectById = (id: string) => API.get(`/projects/${id}`);
export const createProject = (data: FormData) => API.post('/projects', data);
export const updateProject = (id: string, data: FormData) => API.put(`/projects/${id}`, data);
export const deleteProject = (id: string) => API.delete(`/projects/${id}`);