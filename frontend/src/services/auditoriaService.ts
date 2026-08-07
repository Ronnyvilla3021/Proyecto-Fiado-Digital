import api from './api';
import type { RegistroAuditoria } from '../types/Auditoria';

interface FiltrosAuditoria {
  entidad?: string;
  accion?: string;
}

export const listarAuditoria = async (filtros: FiltrosAuditoria = {}): Promise<RegistroAuditoria[]> => {
  const { data } = await api.get<RegistroAuditoria[]>('/auditoria', { params: filtros });
  return data;
};