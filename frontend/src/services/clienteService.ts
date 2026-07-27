import api from './api';
import type { Cliente, ClienteFormulario } from '../types/Cliente';

export const listarClientes = async (busqueda?: string): Promise<Cliente[]> => {
  const { data } = await api.get<Cliente[]>('/clientes', {
    params: busqueda ? { busqueda } : {},
  });
  return data;
};

export const crearCliente = async (cliente: ClienteFormulario) => {
  const { data } = await api.post('/clientes', cliente);
  return data;
};

export const editarCliente = async (id: number, cambios: Partial<ClienteFormulario> & { estado?: string }) => {
  const { data } = await api.put(`/clientes/${id}`, cambios);
  return data;
};

export const eliminarCliente = async (id: number) => {
  const { data } = await api.delete(`/clientes/${id}`);
  return data;
};