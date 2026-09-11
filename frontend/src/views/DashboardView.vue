<template>
  <div class="dashboard-view">
    <div class="dashboard-view__header">
      <div>
        <h1 class="dashboard-view__titulo">Dashboard</h1>
        <p class="dashboard-view__bienvenida">Bienvenido, {{ authStore.usuario?.nombre }} 👋</p>
      </div>
      <div class="dashboard-view__fecha">
        {{ fechaActual }}
      </div>
    </div>

    <div v-if="cargando" class="estado-info">
      <span class="spinner"></span>
      Cargando dashboard...
    </div>

    <template v-else-if="datos">
      <!-- Widgets -->
      <div class="widgets">
        <div class="widget widget--ventas">
          <div class="widget__icono">🛒</div>
          <div class="widget__contenido">
            <p class="widget__valor">${{ Number(datos.ventas_hoy.total).toFixed(2) }}</p>
            <p class="widget__etiqueta">Ventas hoy ({{ datos.ventas_hoy.cantidad }})</p>
          </div>
          <div class="widget__trend widget__trend--up">↑ 12%</div>
        </div>

        <div class="widget widget--morosos">
          <div class="widget__icono">⚠️</div>
          <div class="widget__contenido">
            <p class="widget__valor">{{ datos.clientes_morosos.cantidad }}</p>
            <p class="widget__etiqueta">Clientes morosos</p>
          </div>
          <div class="widget__trend widget__trend--down">↑ 3%</div>
        </div>

        <div class="widget widget--credito">
          <div class="widget__icono">💳</div>
          <div class="widget__contenido">
            <p class="widget__valor">${{ Number(datos.credito_activo.total).toFixed(2) }}</p>
            <p class="widget__etiqueta">Crédito activo ({{ datos.credito_activo.cantidad_creditos }})</p>
          </div>
          <div class="widget__trend widget__trend--up">↑ 5%</div>
        </div>

        <div class="widget widget--pagos">
          <div class="widget__icono">💰</div>
          <div class="widget__contenido">
            <p class="widget__valor">${{ Number(datos.pagos_recibidos_hoy.total).toFixed(2) }}</p>
            <p class="widget__etiqueta">Pagos recibidos hoy</p>
          </div>
          <div class="widget__trend widget__trend--up">↑ 8%</div>
        </div>
      </div>

      <!-- Gráficos -->
      <div class="graficos">
        <div class="grafico-card">
          <div class="grafico-card__header">
            <h3>Ventas últimos 7 días</h3>
            <span class="grafico-card__periodo">Esta semana</span>
          </div>
          <div class="grafico-card__contenido">
            <Bar v-if="datosGraficoBarras" :data="datosGraficoBarras" :options="opcionesBarras" />
          </div>
        </div>

        <div class="grafico-card">
          <div class="grafico-card__header">
            <h3>Contado vs Fiado</h3>
            <span class="grafico-card__periodo">Distribución</span>
          </div>
          <div class="grafico-card__contenido grafico-card__contenido--centrado">
            <Doughnut v-if="datosGraficoCircular" :data="datosGraficoCircular" :options="opcionesCircular" />
          </div>
        </div>
      </div>

      <!-- Clientes morosos (detalle) -->
      <div v-if="datos.clientes_morosos.clientes.length > 0" class="morosos-card">
        <div class="morosos-card__header">
          <h3>⚠️ Clientes en mora</h3>
          <span class="morosos-card__cantidad">{{ datos.clientes_morosos.clientes.length }} clientes</span>
        </div>
        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Saldo</th>
                <th>Venció</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in datos.clientes_morosos.clientes" :key="item.credito_id">
                <td>{{ item.cliente }}</td>
                <td class="table__monto">${{ Number(item.saldo).toFixed(2) }}</td>
                <td>{{ formatearFecha(item.fecha_limite) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { Bar, Doughnut } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
} from 'chart.js';
import { useAuthStore } from '../stores/authStore';
import { socket } from '../services/socket';
import * as dashboardService from '../services/dashboardService';
import type { DashboardData, VentaPorDia, MetodoPagoResumen } from '../types/Dashboard';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement);

const authStore = useAuthStore();

const datos = ref<DashboardData | null>(null);
const ventasSemana = ref<VentaPorDia[]>([]);
const metodoPago = ref<MetodoPagoResumen[]>([]);
const cargando = ref(true);

const fechaActual = computed(() => {
  return new Date().toLocaleDateString('es-EC', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
});

const cargarTodo = async () => {
  const [dashboard, semana, metodos] = await Promise.all([
    dashboardService.obtenerDashboard(),
    dashboardService.obtenerGraficoVentasSemana(),
    dashboardService.obtenerGraficoMetodoPago(),
  ]);
  datos.value = dashboard;
  ventasSemana.value = semana;
  metodoPago.value = metodos;
};

onMounted(async () => {
  cargando.value = true;
  await cargarTodo();
  cargando.value = false;

  socket.connect();
  socket.on('nueva-venta', recargarSilencioso);
  socket.on('nuevo-pago', recargarSilencioso);
});

onUnmounted(() => {
  socket.off('nueva-venta', recargarSilencioso);
  socket.off('nuevo-pago', recargarSilencioso);
  socket.disconnect();
});

const recargarSilencioso = () => {
  cargarTodo();
};

const formatearFecha = (fecha: string) =>
  new Date(fecha).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' });

const datosGraficoBarras = computed(() => {
  if (ventasSemana.value.length === 0) return null;
  return {
    labels: ventasSemana.value.map((v) =>
      new Date(v.dia).toLocaleDateString('es-EC', { weekday: 'short', day: 'numeric' })
    ),
    datasets: [
      {
        label: 'Ventas ($)',
        backgroundColor: '#6c5ce7',
        borderRadius: 8,
        data: ventasSemana.value.map((v) => Number(v.total)),
      },
    ],
  };
});

const opcionesBarras = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: {
    y: {
      beginAtZero: true,
      grid: { 
        color: 'rgba(0,0,0,0.06)',
        drawBorder: false,
      },
    },
    x: {
      grid: { display: false },
    },
  },
};

const datosGraficoCircular = computed(() => {
  if (metodoPago.value.length === 0) return null;
  const contado = metodoPago.value.find((m) => m.metodo_pago === 'contado');
  const fiado = metodoPago.value.find((m) => m.metodo_pago === 'fiado');

  return {
    labels: ['Contado', 'Fiado'],
    datasets: [
      {
        backgroundColor: ['#6c5ce7', '#fdcb6e'],
        borderWidth: 0,
        data: [Number(contado?.total || 0), Number(fiado?.total || 0)],
      },
    ],
  };
});

const opcionesCircular = {
  responsive: true,
  plugins: {
    legend: { 
      position: 'bottom' as const,
      labels: { 
        usePointStyle: true, 
        padding: 20,
        color: 'var(--color-texto-primario)'
      }
    },
  },
  cutout: '70%',
};
</script>

<style scoped lang="scss">
.dashboard-view {
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 1.75rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  &__titulo {
    font-size: 1.75rem;
    font-weight: 800;
    margin: 0;
    letter-spacing: -0.02em;
    color: var(--color-texto-primario);
    line-height: 1.2;
  }

  &__bienvenida {
    color: var(--color-texto-secundario);
    margin: 0.35rem 0 0;
    font-size: 0.92rem;
    font-weight: 400;
  }

  &__fecha {
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--color-texto-secundario);
    background: var(--color-fondo-tarjeta);
    padding: 0.5rem 1rem;
    border-radius: 999px;
    border: 1px solid var(--color-borde);
    white-space: nowrap;
    text-transform: capitalize;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
  }
}

.estado-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 4rem 2rem;
  color: var(--color-texto-secundario);
  font-size: 0.95rem;
  font-weight: 500;
}

.spinner {
  width: 26px;
  height: 26px;
  border: 3px solid var(--color-borde);
  border-top-color: var(--color-primario, #6c5ce7);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ============ WIDGETS ============ */
.widgets {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.1rem;
  margin-bottom: 1.5rem;
}

.widget {
  background: var(--color-fondo-tarjeta);
  border-radius: 16px;
  padding: 1.35rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid var(--color-borde);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.28s ease, border-color 0.28s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    opacity: 0.9;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(108, 92, 231, 0.04),
      transparent 60%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.08);
    border-color: var(--color-borde-fuerte);

    &::after {
      opacity: 1;
    }

    .widget__icono {
      transform: scale(1.12) rotate(-5deg);
    }
  }

  &--ventas {
    &::before {
      background: linear-gradient(90deg, #6c5ce7, #a29bfe);
    }
    .widget__icono {
      background: linear-gradient(135deg, rgba(108, 92, 231, 0.16), rgba(162, 155, 254, 0.1));
    }
  }

  &--morosos {
    &::before {
      background: linear-gradient(90deg, #e17055, #d63031);
    }
    .widget__icono {
      background: linear-gradient(135deg, rgba(225, 112, 85, 0.16), rgba(214, 48, 49, 0.1));
    }
  }

  &--credito {
    &::before {
      background: linear-gradient(90deg, #fdcb6e, #f9ca24);
    }
    .widget__icono {
      background: linear-gradient(135deg, rgba(253, 203, 110, 0.2), rgba(249, 202, 36, 0.12));
    }
  }

  &--pagos {
    &::before {
      background: linear-gradient(90deg, #00b894, #00cec9);
    }
    .widget__icono {
      background: linear-gradient(135deg, rgba(0, 184, 148, 0.16), rgba(0, 206, 201, 0.1));
    }
  }

  &__icono {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    flex-shrink: 0;
    background: rgba(108, 92, 231, 0.12);
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  &__contenido {
    flex: 1;
    min-width: 0;
  }

  &__valor {
    font-size: 1.55rem;
    font-weight: 800;
    margin: 0;
    line-height: 1.15;
    letter-spacing: -0.02em;
    color: var(--color-texto-primario);
    font-variant-numeric: tabular-nums;
  }

  &__etiqueta {
    font-size: 0.78rem;
    color: var(--color-texto-secundario);
    margin: 0.25rem 0 0;
    font-weight: 500;
  }

  &__trend {
    font-size: 0.7rem;
    font-weight: 700;
    padding: 0.25rem 0.6rem;
    border-radius: 999px;
    flex-shrink: 0;
    letter-spacing: 0.01em;

    &--up {
      color: #059669;
      background: rgba(0, 184, 148, 0.14);
    }

    &--down {
      color: #dc2626;
      background: rgba(225, 112, 85, 0.14);
    }
  }
}

/* ============ GRÁFICOS ============ */
.graficos {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.1rem;
  margin-bottom: 1.5rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

.grafico-card {
  background: var(--color-fondo-tarjeta);
  border-radius: 16px;
  padding: 1.35rem 1.5rem;
  border: 1px solid var(--color-borde);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.15rem;
    gap: 0.75rem;
    flex-wrap: wrap;

    h3 {
      font-size: 0.98rem;
      font-weight: 700;
      margin: 0;
      color: var(--color-texto-primario);
      letter-spacing: -0.01em;
    }
  }

  &__periodo {
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--color-texto-secundario);
    padding: 0.3rem 0.7rem;
    background: var(--color-fondo-input);
    border-radius: 999px;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  &__contenido {
    min-height: 220px;
    position: relative;

    &--centrado {
      display: flex;
      align-items: center;
      justify-content: center;
      max-width: 300px;
      margin: 0 auto;
      min-height: 220px;
    }
  }
}

/* ============ MOROSOS ============ */
.morosos-card {
  background: var(--color-fondo-tarjeta);
  border-radius: 16px;
  padding: 1.35rem 1.5rem 0.5rem;
  border: 1px solid var(--color-borde);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  overflow: hidden;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    gap: 0.75rem;
    flex-wrap: wrap;

    h3 {
      font-size: 0.98rem;
      font-weight: 700;
      margin: 0;
      color: var(--color-texto-primario);
      letter-spacing: -0.01em;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
  }

  &__cantidad {
    font-size: 0.75rem;
    font-weight: 700;
    color: #dc2626;
    padding: 0.3rem 0.75rem;
    background: rgba(225, 112, 85, 0.14);
    border-radius: 999px;
    letter-spacing: 0.01em;
  }

  .table-wrapper {
    background: transparent;
    border: none;
    box-shadow: none;
    border-radius: 0;
    margin: 0 -1.5rem;
    width: calc(100% + 3rem);
  }

  .table {
    width: 100%;
    border-collapse: collapse;

    th,
    td {
      padding: 0.85rem 1.5rem;
      text-align: left;
      font-size: 0.86rem;
      border-bottom: 1px solid var(--color-borde);
      color: var(--color-texto-primario);
      vertical-align: middle;
    }

    th {
      font-weight: 700;
      color: var(--color-texto-secundario);
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: transparent;
      white-space: nowrap;
    }

    tbody tr {
      transition: background 0.2s ease;

      &:last-child td {
        border-bottom: none;
      }

      &:hover {
        background: rgba(225, 112, 85, 0.05);
      }
    }
  }
}

.table__monto {
  font-weight: 700;
  color: #dc2626;
  font-variant-numeric: tabular-nums;
}

/* ============ RESPONSIVE ============ */
@media (max-width: 640px) {
  .dashboard-view {
    &__titulo {
      font-size: 1.45rem;
    }

    &__header {
      flex-direction: column;
      align-items: stretch;
    }

    &__fecha {
      align-self: flex-start;
      font-size: 0.78rem;
    }
  }

  .widgets {
    grid-template-columns: 1fr;
    gap: 0.9rem;
  }

  .widget {
    padding: 1.15rem 1.25rem;

    &__icono {
      width: 46px;
      height: 46px;
      font-size: 1.3rem;
      border-radius: 12px;
    }

    &__valor {
      font-size: 1.35rem;
    }
  }

  .grafico-card {
    padding: 1.15rem 1.25rem;

    &__contenido {
      min-height: 200px;
    }
  }

  .morosos-card {
    padding: 1.15rem 1.25rem 0.25rem;

    &__header h3 {
      font-size: 0.92rem;
    }

    .table-wrapper {
      margin: 0 -1.25rem;
      width: calc(100% + 2.5rem);
      overflow-x: auto;
    }

    .table {
      min-width: 480px;

      th,
      td {
        padding: 0.75rem 1.25rem;
        font-size: 0.82rem;
      }
    }
  }
}

/* ============ MODO OSCURO ============ */
[data-theme='dark'] {
  .dashboard-view__fecha {
    background: var(--color-fondo-tarjeta);
    border-color: var(--color-borde);
  }

  .widget {
    background: var(--color-fondo-tarjeta);
    border-color: var(--color-borde);

    &:hover {
      border-color: rgba(108, 92, 231, 0.3);
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
    }

    &--ventas .widget__icono {
      background: linear-gradient(135deg, rgba(108, 92, 231, 0.28), rgba(162, 155, 254, 0.18));
    }

    &--morosos .widget__icono {
      background: linear-gradient(135deg, rgba(225, 112, 85, 0.28), rgba(214, 48, 49, 0.18));
    }

    &--credito .widget__icono {
      background: linear-gradient(135deg, rgba(253, 203, 110, 0.28), rgba(249, 202, 36, 0.2));
    }

    &--pagos .widget__icono {
      background: linear-gradient(135deg, rgba(0, 184, 148, 0.28), rgba(0, 206, 201, 0.18));
    }

    &__trend {
      &--up {
        color: #34d399;
        background: rgba(0, 184, 148, 0.2);
      }

      &--down {
        color: #f87171;
        background: rgba(225, 112, 85, 0.2);
      }
    }
  }

  .grafico-card {
    background: var(--color-fondo-tarjeta);
    border-color: var(--color-borde);

    &:hover {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    }

    &__periodo {
      background: var(--color-fondo-input);
      color: var(--color-texto-secundario);
    }
  }

  .morosos-card {
    background: var(--color-fondo-tarjeta);
    border-color: var(--color-borde);

    &__cantidad {
      color: #f87171;
      background: rgba(225, 112, 85, 0.2);
    }

    .table {
      th {
        color: var(--color-texto-secundario);
      }

      td {
        color: var(--color-texto-primario);
      }

      tbody tr:hover {
        background: rgba(225, 112, 85, 0.08);
      }
    }
  }

  .table__monto {
    color: #f87171;
  }
}
</style>