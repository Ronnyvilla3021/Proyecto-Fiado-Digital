<template>
  <div class="reportes-view">
    <h1>Reportes</h1>
    <p class="descripcion">Exporta la información del negocio en Excel o PDF.</p>

    <div class="reportes-grid">
      <!-- Ventas -->
      <div class="reporte-card">
        <h3>📊 Ventas</h3>
        <p>Historial completo de ventas, con cliente, método de pago y total.</p>

        <div class="campo-fecha">
          <label>Desde</label>
          <input v-model="filtrosVentas.desde" type="date" />
        </div>
        <div class="campo-fecha">
          <label>Hasta</label>
          <input v-model="filtrosVentas.hasta" type="date" />
        </div>

        <div class="reporte-card__botones">
          <button class="boton-excel" :disabled="descargando" @click="descargar('ventas', 'excel')">
            📗 Excel
          </button>
          <button class="boton-pdf" :disabled="descargando" @click="descargar('ventas', 'pdf')">
            📕 PDF
          </button>
        </div>
      </div>

      <!-- Clientes -->
      <div class="reporte-card">
        <h3>👥 Clientes</h3>
        <p>Listado completo de clientes, con límite de crédito y estado.</p>

        <div class="reporte-card__botones">
          <button class="boton-excel" :disabled="descargando" @click="descargar('clientes', 'excel')">
            📗 Excel
          </button>
          <button class="boton-pdf" :disabled="descargando" @click="descargar('clientes', 'pdf')">
            📕 PDF
          </button>
        </div>
      </div>

      <!-- Créditos -->
      <div class="reporte-card">
        <h3>💳 Créditos</h3>
        <p>Créditos activos, pagados y vencidos, con días de mora.</p>

        <div class="campo-fecha">
          <label>Filtrar por estado</label>
          <select v-model="estadoCreditos">
            <option value="">Todos</option>
            <option value="pendiente">Pendientes</option>
            <option value="vencido">Vencidos</option>
            <option value="pagado">Pagados</option>
          </select>
        </div>

        <div class="reporte-card__botones">
          <button class="boton-excel" :disabled="descargando" @click="descargar('creditos', 'excel')">
            📗 Excel
          </button>
          <button class="boton-pdf" :disabled="descargando" @click="descargar('creditos', 'pdf')">
            📕 PDF
          </button>
        </div>
      </div>

      <!-- Pagos -->
      <div class="reporte-card">
        <h3>💰 Pagos</h3>
        <p>Historial de pagos recibidos, con cliente y usuario que los registró.</p>

        <div class="campo-fecha">
          <label>Desde</label>
          <input v-model="filtrosPagos.desde" type="date" />
        </div>
        <div class="campo-fecha">
          <label>Hasta</label>
          <input v-model="filtrosPagos.hasta" type="date" />
        </div>

        <div class="reporte-card__botones">
          <button class="boton-excel" :disabled="descargando" @click="descargar('pagos', 'excel')">
            📗 Excel
          </button>
          <button class="boton-pdf" :disabled="descargando" @click="descargar('pagos', 'pdf')">
            📕 PDF
          </button>
        </div>
      </div>
    </div>

    <p v-if="mensajeError" class="mensaje-error">{{ mensajeError }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import * as reporteService from '../services/reporteService';

type TipoReporte = 'ventas' | 'clientes' | 'creditos' | 'pagos';
type Formato = 'excel' | 'pdf';

const descargando = ref(false);
const mensajeError = ref('');

const filtrosVentas = ref({ desde: '', hasta: '' });
const filtrosPagos = ref({ desde: '', hasta: '' });
const estadoCreditos = ref('');

const descargar = async (tipo: TipoReporte, formato: Formato) => {
  mensajeError.value = '';
  descargando.value = true;
  try {
    switch (tipo) {
      case 'ventas':
        await reporteService.descargarReporteVentas(formato, filtrosVentas.value);
        break;
      case 'clientes':
        await reporteService.descargarReporteClientes(formato);
        break;
      case 'creditos':
        await reporteService.descargarReporteCreditos(formato, estadoCreditos.value || undefined);
        break;
      case 'pagos':
        await reporteService.descargarReportePagos(formato, filtrosPagos.value);
        break;
    }
  } catch (error: any) {
    mensajeError.value = 'Error al generar el reporte. Verifica tus permisos.';
  } finally {
    descargando.value = false;
  }
};
</script>

<style scoped lang="scss">
.reportes-view {
  h1 {
    font-size: 1.4rem;
    font-weight: 700;
    margin-bottom: 0.2rem;
  }
}

.descripcion {
  color: var(--color-texto-secundario, #6b7280);
  margin-bottom: 1.5rem;
}

.reportes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.reporte-card {
  background: var(--color-fondo-tarjeta);
  border-radius: 12px;
  padding: 1.25rem;

  h3 {
    margin: 0 0 0.4rem;
    font-size: 1rem;
  }

  p {
    font-size: 0.85rem;
    color: var(--color-texto-secundario, #6b7280);
    margin: 0 0 1rem;
    line-height: 1.4;
  }

  &__botones {
    display: flex;
    gap: 0.6rem;
    margin-top: 1rem;
  }
}

.campo-fecha {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin-bottom: 0.75rem;

  label {
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--color-texto-secundario, #6b7280);
  }

  input, select {
    padding: 0.5rem 0.65rem;
    border: 1px solid var(--color-borde);
    border-radius: 8px;
    font-size: 0.85rem;
    background: var(--color-input-fondo, white);
    color: inherit;
  }
}

.boton-excel, .boton-pdf {
  flex: 1;
  padding: 0.55rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border: none;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.boton-excel {
  background: #dcfce7;
  color: #16a34a;

  &:hover:not(:disabled) {
    background: #bbf7d0;
  }
}

.boton-pdf {
  background: #fee2e2;
  color: #dc2626;

  &:hover:not(:disabled) {
    background: #fecaca;
  }
}

.mensaje-error {
  margin-top: 1rem;
  color: #dc2626;
  font-size: 0.85rem;
  background: #fef2f2;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
}
</style>