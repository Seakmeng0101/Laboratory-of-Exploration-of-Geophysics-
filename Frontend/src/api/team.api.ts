import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:4000/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getAllTeams = () => API.get('/teams');
export const getTeamById = (id: string) => API.get(`/teams/${id}`);
export const createTeam = (data: FormData) => API.post('/teams', data);
export const updateTeam = (id: string, data: FormData) => API.put(`/teams/${id}`, data);
export const deleteTeam = (id: string) => API.delete(`/teams/${id}`);