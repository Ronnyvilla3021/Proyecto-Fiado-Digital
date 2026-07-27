import api from './api';

interface LoginResponse {
  mensaje: string;
  token: string;
  usuario: {
    id: number;
    nombre: string;
    email: string;
    rol: 'administrador' | 'cajero' | 'supervisor';
  };
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const { data } = await api.post<LoginResponse>('/auth/login', { email, password });
  return data;
};

export const registrar = async (nombre: string, email: string, password: string) => {
  const { data } = await api.post('/auth/registro', { nombre, email, password });
  return data;
};