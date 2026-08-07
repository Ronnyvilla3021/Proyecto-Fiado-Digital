import api from './api';
import type { Credito, PagoFormulario } from '../types/Credito';

export const listarCreditos = async (estado?: string): Promise<Credito[]> => {
  const { data } = await api.get<Credito[]>('/creditos', {
    params: estado ? { estado } : {},
  });
  return data;
};

export const registrarPago = async (pago: PagoFormulario) => {
  const { data } = await api.post('/creditos/pagos', pago);
  return data;
};