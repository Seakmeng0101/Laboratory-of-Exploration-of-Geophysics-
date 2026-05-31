export interface Member {
  id: string;
  name: string;
  position: string;
  specialty: string;
  role: string;
  link: string | null;
  image: string | null;
}

export interface Team {
  id: string;
  name: string;
  email: string;
  position: string;
  image: string | null;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  image: string | null;
  link: string | null;
}

export interface Project {
  id: string;
  title: string;
  description: string[];
  image: string | null;
}

export interface Equipment {
  id: string;
  machine: string;
  model: string;
  capacity: string;
  image: string | null;
}

export interface TeamContact {
  id: string;
  name: string;
  faculty: string;
  institute: string;
  address: string;
  email: string;
  tel: string;
  image: string | null;
}

export interface User {
  userId: string;
  email: string;
  role: 'admin' | 'moderator';
}