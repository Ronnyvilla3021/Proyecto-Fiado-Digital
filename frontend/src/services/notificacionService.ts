import api from './api';
import type { Notificacion } from '../types/Notificacion';

export const listarNotificaciones = async (): Promise<Notificacion[]> => {
  const { data } = await api.get<Notificacion[]>('/notificaciones');
  return data;
};

export const marcarLeida = async (id: number) => {
  const { data } = await api.put(`/notificaciones/${id}/leer`);
  return data;
};

export const ejecutarJobManual = async (tipo: 'cobros-pendientes' | 'mora' | 'resumen-diario') => {
  const { data } = await api.post(`/notificaciones/ejecutar/${tipo}`);
  return data;
};

export const eliminarNotificacion = async (id: number) => {
  const { data } = await api.delete(`/notificaciones/${id}`);
  return data;
};