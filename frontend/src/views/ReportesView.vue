<template>
  <div class="reportes-view">
    <div class="reportes-view__header">
      <div>
        <h1 class="reportes-view__titulo">Reportes</h1>
        <p class="reportes-view__subtitulo">Exporta la información del negocio en Excel o PDF</p>
      </div>
    </div>

    <div class="reportes-grid">
      <!-- Ventas -->
      <div class="reporte-card">
        <div class="reporte-card__icono">📊</div>
        <h3 class="reporte-card__titulo">Ventas</h3>
        <p class="reporte-card__descripcion">Historial completo de ventas, con cliente, método de pago y total.</p>

        <div class="reporte-card__filtros">
          <div class="campo-fecha">
            <label>Desde</label>
            <input v-model="filtrosVentas.desde" type="date" class="form-control" />
          </div>
          <div class="campo-fecha">
            <label>Hasta</label>
            <input v-model="filtrosVentas.hasta" type="date" class="form-control" />
          </div>
        </div>

        <div class="reporte-card__botones">
          <button class="btn btn-success btn-sm" :disabled="descargando" @click="descargar('ventas', 'excel')">
            📗 Excel
          </button>
          <button class="btn btn-danger btn-sm" :disabled="descargando" @click="descargar('ventas', 'pdf')">
            📕 PDF
          </button>
        </div>
      </div>

      <!-- Clientes -->
      <div class="reporte-card">
        <div class="reporte-card__icono">👥</div>
        <h3 class="reporte-card__titulo">Clientes</h3>
        <p class="reporte-card__descripcion">Listado completo de clientes, con límite de crédito y estado.</p>

        <div class="reporte-card__botones">
          <button class="btn btn-success btn-sm" :disabled="descargando" @click="descargar('clientes', 'excel')">
            📗 Excel
          </button>
          <button class="btn btn-danger btn-sm" :disabled="descargando" @click="descargar('clientes', 'pdf')">
            📕 PDF
          </button>
        </div>
      </div>

      <!-- Créditos -->
      <div class="reporte-card">
        <div class="reporte-card__icono">💳</div>
        <h3 class="reporte-card__titulo">Créditos</h3>
        <p class="reporte-card__descripcion">Créditos activos, pagados y vencidos, con días de mora.</p>

        <div class="reporte-card__filtros">
          <div class="campo-fecha">
            <label>Filtrar por estado</label>
            <select v-model="estadoCreditos" class="form-control">
              <option value="">Todos</option>
              <option value="pendiente">Pendientes</option>
              <option value="vencido">Vencidos</option>
              <option value="pagado">Pagados</option>
            </select>
          </div>
        </div>

        <div class="reporte-card__botones">
          <button class="btn btn-success btn-sm" :disabled="descargando" @click="descargar('creditos', 'excel')">
            📗 Excel
          </button>
          <button class="btn btn-danger btn-sm" :disabled="descargando" @click="descargar('creditos', 'pdf')">
            📕 PDF
          </button>
        </div>
      </div>

      <!-- Pagos -->
      <div class="reporte-card">
        <div class="reporte-card__icono">💰</div>
        <h3 class="reporte-card__titulo">Pagos</h3>
        <p class="reporte-card__descripcion">Historial de pagos recibidos, con cliente y usuario que los registró.</p>

        <div class="reporte-card__filtros">
          <div class="campo-fecha">
            <label>Desde</label>
            <input v-model="filtrosPagos.desde" type="date" class="form-control" />
          </div>
          <div class="campo-fecha">
            <label>Hasta</label>
            <input v-model="filtrosPagos.hasta" type="date" class="form-control" />
          </div>
        </div>

        <div class="reporte-card__botones">
          <button class="btn btn-success btn-sm" :disabled="descargando" @click="descargar('pagos', 'excel')">
            📗 Excel
          </button>
          <button class="btn btn-danger btn-sm" :disabled="descargando" @click="descargar('pagos', 'pdf')">
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
  &__header {
    margin-bottom: 1.5rem;
  }

  &__titulo {
    font-size: 1.6rem;
    font-weight: 800;
    margin: 0;
    letter-spacing: -0.5px;
  }

  &__subtitulo {
    color: var(--color-texto-secundario, #6b7280);
    margin: 0.2rem 0 0;
    font-size: 0.9rem;
  }
}

.reportes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.reporte-card {
  background: var(--color-fondo-tarjeta, #ffffff);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid var(--color-borde, rgba(0, 0, 0, 0.04));
  transition: all 0.3s;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.06);
  }

  &__icono {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  &__titulo {
    font-size: 1.05rem;
    font-weight: 700;
    margin: 0 0 0.3rem;
  }

  &__descripcion {
    font-size: 0.85rem;
    color: var(--color-texto-secundario, #6b7280);
    margin: 0 0 1rem;
    line-height: 1.4;
    flex: 1;
  }

  &__filtros {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;

    .campo-fecha {
      flex: 1;
    }
  }

  &__botones {
    display: flex;
    gap: 0.6rem;
    margin-top: auto;

    .btn {
      flex: 1;
    }
  }
}

.campo-fecha {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;

  label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-texto-secundario, #6b7280);
  }

  .form-control {
    padding: 0.4rem 0.6rem;
    font-size: 0.82rem;
  }
}

.mensaje-error {
  margin-top: 1rem;
  color: #e17055;
  font-size: 0.85rem;
  background: rgba(225, 112, 85, 0.1);
  padding: 0.6rem 0.9rem;
  border-radius: 10px;
  border-left: 3px solid #e17055;
}
</style>