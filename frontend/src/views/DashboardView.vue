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
    align-items: flex-start;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  &__titulo {
    font-size: 1.6rem;
    font-weight: 800;
    margin: 0;
    letter-spacing: -0.5px;
    color: var(--color-texto-primario);
  }

  &__bienvenida {
    color: var(--color-texto-secundario);
    margin: 0.2rem 0 0;
    font-size: 0.95rem;
  }

  &__fecha {
    font-size: 0.85rem;
    color: var(--color-texto-secundario);
    background: var(--color-fondo-tarjeta);
    padding: 0.4rem 1rem;
    border-radius: 10px;
    border: 1px solid var(--color-borde);
    white-space: nowrap;
  }
}

.estado-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 3rem;
  color: var(--color-texto-secundario);
  font-size: 0.95rem;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid var(--color-borde);
  border-top-color: #6c5ce7;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Widgets */
.widgets {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.widget {
  background: var(--color-fondo-tarjeta);
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid var(--color-borde);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-md);
  }

  &--ventas::before {
    background: linear-gradient(90deg, #6c5ce7, #a29bfe);
  }

  &--morosos::before {
    background: linear-gradient(90deg, #e17055, #d63031);
  }

  &--credito::before {
    background: linear-gradient(90deg, #fdcb6e, #f9ca24);
  }

  &--pagos::before {
    background: linear-gradient(90deg, #00b894, #00cec9);
  }

  &__icono {
    font-size: 1.8rem;
    flex-shrink: 0;
  }

  &__contenido {
    flex: 1;
  }

  &__valor {
    font-size: 1.5rem;
    font-weight: 800;
    margin: 0;
    line-height: 1.2;
    letter-spacing: -0.5px;
    color: var(--color-texto-primario);
  }

  &__etiqueta {
    font-size: 0.78rem;
    color: var(--color-texto-secundario);
    margin: 0.1rem 0 0;
  }

  &__trend {
    font-size: 0.7rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    border-radius: 20px;
    flex-shrink: 0;

    &--up {
      color: #00b894;
      background: rgba(0, 184, 148, 0.12);
    }

    &--down {
      color: #e17055;
      background: rgba(225, 112, 85, 0.12);
    }
  }
}

/* Gráficos */
.graficos {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

.grafico-card {
  background: var(--color-fondo-tarjeta);
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  border: 1px solid var(--color-borde);

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;

    h3 {
      font-size: 0.95rem;
      font-weight: 700;
      margin: 0;
      color: var(--color-texto-primario);
    }
  }

  &__periodo {
    font-size: 0.7rem;
    color: var(--color-texto-secundario);
    padding: 0.2rem 0.6rem;
    background: var(--color-fondo-hover);
    border-radius: 20px;
  }

  &__contenido {
    min-height: 200px;

    &--centrado {
      display: flex;
      align-items: center;
      justify-content: center;
      max-width: 280px;
      margin: 0 auto;
    }
  }
}

/* Morosos */
.morosos-card {
  background: var(--color-fondo-tarjeta);
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  border: 1px solid var(--color-borde);

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;

    h3 {
      font-size: 0.95rem;
      font-weight: 700;
      margin: 0;
      color: var(--color-texto-primario);
    }
  }

  &__cantidad {
    font-size: 0.78rem;
    color: #e17055;
    padding: 0.2rem 0.6rem;
    background: rgba(225, 112, 85, 0.12);
    border-radius: 20px;
  }
}

.table__monto {
  font-weight: 600;
  color: var(--color-texto-primario);
}
</style>