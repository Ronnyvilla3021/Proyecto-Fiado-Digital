import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Notificacion } from '../types/Notificacion';
import * as notificacionService from '../services/notificacionService';

export const useNotificacionStore = defineStore('notificacion', () => {
  const notificaciones = ref<Notificacion[]>([]);

  const noLeidas = computed(() => notificaciones.value.filter((n) => !n.leida).length);

  const cargarNotificaciones = async () => {
    notificaciones.value = await notificacionService.listarNotificaciones();
  };

  const marcarComoLeida = async (id: number) => {
    await notificacionService.marcarLeida(id);
    const noti = notificaciones.value.find((n) => n.id === id);
    if (noti) noti.leida = true;
  };

  // Se llama cuando llega una notificación nueva por Socket.io
  const agregarNotificacion = (noti: Notificacion) => {
    notificaciones.value.unshift(noti);
  };

  const eliminar = async (id: number) => {
  await notificacionService.eliminarNotificacion(id);
  notificaciones.value = notificaciones.value.filter((n) => n.id !== id);
};

  return { notificaciones, noLeidas, cargarNotificaciones, marcarComoLeida, agregarNotificacion, eliminar };
});