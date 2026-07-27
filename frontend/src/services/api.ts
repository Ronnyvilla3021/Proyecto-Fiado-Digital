import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const api = axios.create({
  baseURL: 'http://localhost:5000',
});

// Interceptor: agrega el token automáticamente a TODAS las peticiones salientes
api.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`;
  }
  return config;
});

// Interceptor: si el backend responde 401 (token inválido/expirado), cierra sesión automáticamente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore();
      authStore.cerrarSesion();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;