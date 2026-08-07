import api from './api';
import type { DashboardData, VentaPorDia, MetodoPagoResumen } from '../types/Dashboard';

export const obtenerDashboard = async (): Promise<DashboardData> => {
  const { data } = await api.get<DashboardData>('/dashboard');
  return data;
};

export const obtenerGraficoVentasSemana = async (): Promise<VentaPorDia[]> => {
  const { data } = await api.get<VentaPorDia[]>('/dashboard/grafico-ventas-semana');
  return data;
};

export const obtenerGraficoMetodoPago = async (): Promise<MetodoPagoResumen[]> => {
  const { data } = await api.get<MetodoPagoResumen[]>('/dashboard/grafico-metodo-pago');
  return data;
};