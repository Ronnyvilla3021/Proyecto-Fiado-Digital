<template>
  <div class="dashboard-view">
    <h1>Dashboard</h1>
    <p class="bienvenida">Bienvenido, {{ authStore.usuario?.nombre }} 👋</p>

    <div v-if="cargando" class="estado-info">Cargando dashboard...</div>

    <template v-else-if="datos">
      <!-- Widgets -->
      <div class="widgets">
        <div class="widget">
          <span class="widget__icono">🛒</span>
          <div>
            <p class="widget__valor">${{ Number(datos.ventas_hoy.total).toFixed(2) }}</p>
            <p class="widget__etiqueta">Ventas hoy ({{ datos.ventas_hoy.cantidad }})</p>
          </div>
        </div>

        <div class="widget widget--alerta">
          <span class="widget__icono">⚠️</span>
          <div>
            <p class="widget__valor">{{ datos.clientes_morosos.cantidad }}</p>
            <p class="widget__etiqueta">Clientes morosos</p>
          </div>
        </div>

        <div class="widget">
          <span class="widget__icono">💳</span>
          <div>
            <p class="widget__valor">${{ Number(datos.credito_activo.total).toFixed(2) }}</p>
            <p class="widget__etiqueta">Crédito activo ({{ datos.credito_activo.cantidad_creditos }})</p>
          </div>
        </div>

        <div class="widget widget--exito">
          <span class="widget__icono">💰</span>
          <div>
            <p class="widget__valor">${{ Number(datos.pagos_recibidos_hoy.total).toFixed(2) }}</p>
            <p class="widget__etiqueta">Pagos recibidos hoy</p>
          </div>
        </div>
      </div>

      <!-- Gráficos -->
      <div class="graficos">
        <div class="grafico-card">
          <h3>Ventas últimos 7 días</h3>
          <Bar v-if="datosGraficoBarras" :data="datosGraficoBarras" :options="opcionesBarras" />
        </div>

        <div class="grafico-card">
          <h3>Contado vs Fiado</h3>
          <Doughnut v-if="datosGraficoCircular" :data="datosGraficoCircular" :options="opcionesCircular" />
        </div>
      </div>

      <!-- Clientes morosos (detalle) -->
      <div v-if="datos.clientes_morosos.clientes.length > 0" class="morosos-card">
        <h3>Clientes en mora</h3>
        <table class="tabla">
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
              <td>${{ Number(item.saldo).toFixed(2) }}</td>
              <td>{{ formatearFecha(item.fecha_limite) }}</td>
            </tr>
          </tbody>
        </table>
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

  // Conectamos el socket y escuchamos eventos en tiempo real
  socket.connect();
  socket.on('nueva-venta', recargarSilencioso);
  socket.on('nuevo-pago', recargarSilencioso);
});

onUnmounted(() => {
  socket.off('nueva-venta', recargarSilencioso);
  socket.off('nuevo-pago', recargarSilencioso);
  socket.disconnect();
});

// Recarga los datos sin mostrar el spinner de "Cargando...", para que se sienta fluido
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
        backgroundColor: '#4f46e5',
        borderRadius: 6,
        data: ventasSemana.value.map((v) => Number(v.total)),
      },
    ],
  };
});

const opcionesBarras = {
  responsive: true,
  plugins: { legend: { display: false } },
};

const datosGraficoCircular = computed(() => {
  if (metodoPago.value.length === 0) return null;
  const contado = metodoPago.value.find((m) => m.metodo_pago === 'contado');
  const fiado = metodoPago.value.find((m) => m.metodo_pago === 'fiado');

  return {
    labels: ['Contado', 'Fiado'],
    datasets: [
      {
        backgroundColor: ['#2563eb', '#d97706'],
        data: [Number(contado?.total || 0), Number(fiado?.total || 0)],
      },
    ],
  };
});

const opcionesCircular = {
  responsive: true,
  plugins: { legend: { position: 'bottom' as const } },
};
</script>

<style scoped lang="scss">
.dashboard-view {
  h1 {
    font-size: 1.4rem;
    font-weight: 700;
    margin-bottom: 0.2rem;
  }
}

.bienvenida {
  color: var(--color-texto-secundario, #6b7280);
  margin-bottom: 1.5rem;
}

.estado-info {
  padding: 2rem;
  text-align: center;
  color: var(--color-texto-secundario, #6b7280);
}

.widgets {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.widget {
  background: var(--color-fondo-tarjeta);
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-left: 4px solid #4f46e5;

  &--alerta {
    border-left-color: #dc2626;
  }

  &--exito {
    border-left-color: #16a34a;
  }

  &__icono {
    font-size: 1.6rem;
  }

  &__valor {
    font-size: 1.3rem;
    font-weight: 700;
    margin: 0;
  }

  &__etiqueta {
    font-size: 0.8rem;
    color: var(--color-texto-secundario, #6b7280);
    margin: 0.15rem 0 0;
  }
}

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
  border-radius: 12px;
  padding: 1.25rem;

  h3 {
    font-size: 0.95rem;
    margin: 0 0 1rem;
  }
}

.morosos-card {
  background: var(--color-fondo-tarjeta);
  border-radius: 12px;
  padding: 1.25rem;

  h3 {
    font-size: 0.95rem;
    margin: 0 0 1rem;
  }
}

.tabla {
  width: 100%;
  border-collapse: collapse;

  th, td {
    padding: 0.6rem 0.75rem;
    text-align: left;
    font-size: 0.85rem;
    border-bottom: 1px solid var(--color-borde);
  }

  th {
    font-weight: 600;
    color: var(--color-texto-secundario);
    font-size: 0.75rem;
    text-transform: uppercase;
  }
}
</style>