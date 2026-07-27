import { defineStore } from 'pinia';
import { ref } from 'vue';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: 'administrador' | 'cajero' | 'supervisor';
}

export const useAuthStore = defineStore('auth', () => {
  // Estado: se inicializa leyendo localStorage, para mantener la sesión al recargar la página
  const token = ref<string | null>(localStorage.getItem('token'));
  const usuario = ref<Usuario | null>(
    localStorage.getItem('usuario') ? JSON.parse(localStorage.getItem('usuario')!) : null
  );

  const setSesion = (nuevoToken: string, nuevoUsuario: Usuario) => {
    token.value = nuevoToken;
    usuario.value = nuevoUsuario;
    localStorage.setItem('token', nuevoToken);
    localStorage.setItem('usuario', JSON.stringify(nuevoUsuario));
  };

  const cerrarSesion = () => {
    token.value = null;
    usuario.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  };

  const esAdmin = () => usuario.value?.rol === 'administrador';
  const esSupervisor = () => usuario.value?.rol === 'supervisor';
  const esCajero = () => usuario.value?.rol === 'cajero';

  return { token, usuario, setSesion, cerrarSesion, esAdmin, esSupervisor, esCajero };
});