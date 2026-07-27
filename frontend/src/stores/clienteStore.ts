import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Cliente, ClienteFormulario } from '../types/Cliente';
import * as clienteService from '../services/clienteService';

export const useClienteStore = defineStore('cliente', () => {
  const clientes = ref<Cliente[]>([]);
  const cargando = ref(false);

  const cargarClientes = async (busqueda?: string) => {
    cargando.value = true;
    try {
      clientes.value = await clienteService.listarClientes(busqueda);
    } finally {
      cargando.value = false;
    }
  };

  const crear = async (cliente: ClienteFormulario) => {
    await clienteService.crearCliente(cliente);
    await cargarClientes();
  };

  const editar = async (id: number, cambios: Partial<ClienteFormulario> & { estado?: string }) => {
    await clienteService.editarCliente(id, cambios);
    await cargarClientes();
  };

  const eliminar = async (id: number) => {
    await clienteService.eliminarCliente(id);
    await cargarClientes();
  };

  return { clientes, cargando, cargarClientes, crear, editar, eliminar };
});