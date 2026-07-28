import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Venta, VentaFormulario } from '../types/Venta';
import * as ventaService from '../services/ventaService';

export const useVentaStore = defineStore('venta', () => {
  const ventas = ref<Venta[]>([]);
  const cargando = ref(false);

  const cargarVentas = async () => {
    cargando.value = true;
    try {
      ventas.value = await ventaService.listarVentas();
    } finally {
      cargando.value = false;
    }
  };

  const registrar = async (venta: VentaFormulario) => {
    const resultado = await ventaService.registrarVenta(venta);
    await cargarVentas();
    return resultado;
  };

  return { ventas, cargando, cargarVentas, registrar };
});