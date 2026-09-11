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
    margin-bottom: 1.75rem;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
  }

  &__titulo {
    font-size: 1.75rem;
    font-weight: 800;
    margin: 0;
    letter-spacing: -0.02em;
    color: var(--color-texto-primario, #1a1a2e);
    line-height: 1.2;
  }

  &__subtitulo {
    color: var(--color-texto-secundario, #6b7280);
    margin: 0.35rem 0 0;
    font-size: 0.9rem;
    font-weight: 400;
  }
}

.reportes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
  gap: 1.25rem;
}

.reporte-card {
  background: var(--color-fondo-tarjeta, #ffffff);
  border-radius: 18px;
  padding: 1.65rem 1.5rem 1.5rem;
  border: 1px solid var(--color-borde, rgba(0, 0, 0, 0.05));
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.28s ease, border-color 0.28s ease;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(108, 92, 231, 0.05) 0%,
      transparent 60%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 40px rgba(108, 92, 231, 0.12),
      0 4px 12px rgba(0, 0, 0, 0.05);
    border-color: rgba(108, 92, 231, 0.25);

    &::before {
      opacity: 1;
    }

    .reporte-card__icono {
      transform: scale(1.1) rotate(-5deg);
    }
  }

  &__icono {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    background: linear-gradient(
      135deg,
      rgba(108, 92, 231, 0.14),
      rgba(162, 155, 254, 0.1)
    );
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    margin-bottom: 0.9rem;
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  &__titulo {
    font-size: 1.08rem;
    font-weight: 800;
    margin: 0 0 0.4rem;
    color: var(--color-texto-primario, #1a1a2e);
    letter-spacing: -0.01em;
  }

  &__descripcion {
    font-size: 0.86rem;
    color: var(--color-texto-secundario, #6b7280);
    margin: 0 0 1.15rem;
    line-height: 1.5;
    flex: 1;
  }

  &__filtros {
    display: flex;
    gap: 0.6rem;
    margin-bottom: 1.1rem;

    .campo-fecha {
      flex: 1;
      min-width: 0;
    }
  }

  &__botones {
    display: flex;
    gap: 0.6rem;
    margin-top: auto;
    padding-top: 0.5rem;
    border-top: 1px dashed var(--color-borde, rgba(0, 0, 0, 0.06));

    .btn {
      flex: 1;
      font-size: 0.82rem;
      padding: 0.55rem 0.75rem;
    }
  }
}

.campo-fecha {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;

  label {
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--color-texto-secundario, #6b7280);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .form-control {
    padding: 0.5rem 0.7rem;
    font-size: 0.84rem;
    border-width: 1.5px;
    border-radius: 10px;
    background: var(--color-fondo-input, #f9fafb);

    &:hover {
      border-color: var(--color-borde-fuerte, #d1d5db);
    }

    &:focus {
      background: var(--color-fondo-tarjeta, #ffffff);
      box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.14);
    }
  }

  select.form-control {
    cursor: pointer;
  }
}

/* Botones específicos con más impacto visual */
.btn {
  &.btn-success {
    background: linear-gradient(135deg, #059669 0%, #00b894 100%);
    color: #ffffff;
    border: none;
    border-radius: 10px;
    font-weight: 700;
    transition: transform 0.2s ease, box-shadow 0.25s ease, filter 0.2s ease;
    box-shadow: 0 4px 12px rgba(0, 184, 148, 0.25);

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 184, 148, 0.35);
      filter: brightness(1.05);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }
  }

  &.btn-danger {
    background: linear-gradient(135deg, #dc2626 0%, #e17055 100%);
    color: #ffffff;
    border: none;
    border-radius: 10px;
    font-weight: 700;
    transition: transform 0.2s ease, box-shadow 0.25s ease, filter 0.2s ease;
    box-shadow: 0 4px 12px rgba(225, 112, 85, 0.25);

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(225, 112, 85, 0.35);
      filter: brightness(1.05);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }
}

.mensaje-error {
  margin-top: 1.25rem;
  color: #dc2626;
  font-size: 0.86rem;
  font-weight: 500;
  background: rgba(220, 38, 38, 0.08);
  padding: 0.75rem 1rem;
  border-radius: 10px;
  border-left: 3px solid #dc2626;
  animation: shake 0.4s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

/* Responsive */
@media (max-width: 640px) {
  .reportes-view {
    &__titulo {
      font-size: 1.45rem;
    }
  }

  .reportes-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .reporte-card {
    padding: 1.4rem 1.25rem 1.25rem;

    &__icono {
      width: 46px;
      height: 46px;
      font-size: 1.35rem;
    }
  }

  .reporte-card__filtros {
    flex-direction: column;
    gap: 0.5rem;
  }
}

/* Modo oscuro — usa el atributo real de la app */
[data-theme='dark'] {
  .reporte-card {
    background: var(--color-fondo-tarjeta);
    border-color: var(--color-borde);

    &:hover {
      border-color: rgba(108, 92, 231, 0.35);
      box-shadow: 0 16px 40px rgba(108, 92, 231, 0.2),
        0 4px 12px rgba(0, 0, 0, 0.3);
    }

    &__icono {
      background: linear-gradient(
        135deg,
        rgba(108, 92, 231, 0.22),
        rgba(162, 155, 254, 0.15)
      );
    }

    &__titulo {
      color: var(--color-texto-primario);
    }

    &__descripcion {
      color: var(--color-texto-secundario);
    }

    &__botones {
      border-top-color: var(--color-borde);
    }
  }

  .campo-fecha {
    label {
      color: var(--color-texto-secundario);
    }

    .form-control {
      background: var(--color-fondo-input);
      border-color: var(--color-borde);
      color: var(--color-texto-primario);

      &:hover {
        border-color: var(--color-borde-fuerte);
      }

      &:focus {
        background: var(--color-fondo-input);
        border-color: var(--color-primario);
      }
    }
  }
}
</style>