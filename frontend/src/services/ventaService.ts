import api from './api';
import type { Venta, VentaFormulario } from '../types/Venta';

export const listarVentas = async (): Promise<Venta[]> => {
  const { data } = await api.get<Venta[]>('/ventas');
  return data;
};

export const registrarVenta = async (venta: VentaFormulario) => {
  const { data } = await api.post('/ventas', venta);
  return data;
};