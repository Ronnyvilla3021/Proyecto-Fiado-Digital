import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

// ✅ Lee el puerto desde el archivo .env
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL, 
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