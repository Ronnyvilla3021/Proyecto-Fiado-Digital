import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Credito, PagoFormulario } from '../types/Credito';
import * as creditoService from '../services/creditoService';

export const useCreditoStore = defineStore('credito', () => {
  const creditos = ref<Credito[]>([]);
  const cargando = ref(false);

  const cargarCreditos = async (estado?: string) => {
    cargando.value = true;
    try {
      creditos.value = await creditoService.listarCreditos(estado);
    } finally {
      cargando.value = false;
    }
  };

  const pagar = async (pago: PagoFormulario) => {
    const resultado = await creditoService.registrarPago(pago);
    await cargarCreditos();
    return resultado;
  };

  return { creditos, cargando, cargarCreditos, pagar };
});