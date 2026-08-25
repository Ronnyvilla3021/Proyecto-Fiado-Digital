<template>
  <div class="creditos-view">
    <div class="creditos-view__header">
      <div>
        <h1 class="creditos-view__titulo">Créditos</h1>
        <p class="creditos-view__subtitulo">Gestiona los créditos de tus clientes</p>
      </div>
    </div>

    <div class="filtros">
      <button
        v-for="opcion in filtrosEstado"
        :key="opcion.valor"
        class="filtro-boton"
        :class="{ 'filtro-boton--activo': filtroActivo === opcion.valor }"
        @click="cambiarFiltro(opcion.valor)"
      >
        {{ opcion.etiqueta }}
      </button>
    </div>

    <div v-if="creditoStore.cargando" class="estado-info">
      <span class="spinner"></span>
      Cargando créditos...
    </div>
    <div v-else-if="creditoStore.creditos.length === 0" class="estado-info">
      <span class="estado-info__icono">💳</span>
      <p>No hay créditos {{ filtroActivo ? `en estado "${filtroActivo}"` : '' }}</p>
    </div>

    <div v-else class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th>Cliente</th>
            <th class="th-ordenable" @click="cambiarOrden('monto_total')">
              Monto total <span class="th-ordenable__icono">{{ iconoOrden('monto_total') }}</span>
            </th>
            <th class="th-ordenable" @click="cambiarOrden('saldo')">
              Saldo <span class="th-ordenable__icono">{{ iconoOrden('saldo') }}</span>
            </th>
            <th class="th-ordenable" @click="cambiarOrden('fecha_limite')">
              Fecha límite <span class="th-ordenable__icono">{{ iconoOrden('fecha_limite') }}</span>
            </th>
            <th class="th-ordenable" @click="cambiarOrden('estado')">
              Estado <span class="th-ordenable__icono">{{ iconoOrden('estado') }}</span>
            </th>
            <th class="th-ordenable" @click="cambiarOrden('dias_mora')">
              Mora <span class="th-ordenable__icono">{{ iconoOrden('dias_mora') }}</span>
            </th>
            <th class="table__acciones">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="credito in datosPaginados" :key="credito.id">
            <td><strong>{{ credito.Cliente.nombre }} {{ credito.Cliente.apellido }}</strong></td>
            <td>${{ Number(credito.monto_total).toFixed(2) }}</td>
            <td class="table__saldo">${{ Number(credito.saldo).toFixed(2) }}</td>
            <td>{{ formatearFecha(credito.fecha_limite) }}</td>
            <td>
              <span class="badge" :class="`badge--${credito.estado}`">
                {{ credito.estado }}
              </span>
            </td>
            <td>
              <span v-if="credito.dias_mora > 0" class="badge-mora">
                {{ credito.dias_mora }} día(s)
              </span>
              <span v-else class="text-muted">—</span>
            </td>
            <td class="table__acciones">
              <button
                v-if="credito.estado !== 'pagado'"
                class="btn btn-success btn-sm"
                @click="abrirModalPago(credito)"
              >
                💰 Pagar
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <PaginacionControles
        :pagina-actual="paginaActual"
        :total-paginas="totalPaginas"
        @cambiar="irAPagina"
      />
    </div>

    <!-- Modal Registrar Pago -->
    <BaseModal :visible="modalVisible" titulo="Registrar pago" @cerrar="cerrarModal">
      <div v-if="creditoSeleccionado" class="detalle-credito">
        <div class="detalle-credito__item">
          <span class="detalle-credito__label">Cliente:</span>
          <span class="detalle-credito__valor">{{ creditoSeleccionado.Cliente.nombre }} {{ creditoSeleccionado.Cliente.apellido }}</span>
        </div>
        <div class="detalle-credito__item">
          <span class="detalle-credito__label">Saldo pendiente:</span>
          <span class="detalle-credito__valor detalle-credito__valor--destacado">${{ Number(creditoSeleccionado.saldo).toFixed(2) }}</span>
        </div>
      </div>

      <form class="form-pago" @submit.prevent="guardarPago">
        <div class="form-group">
          <label>Monto a pagar</label>
          <input
            v-model.number="montoPago"
            type="number"
            min="0.01"
            step="0.01"
            :max="creditoSeleccionado ? Number(creditoSeleccionado.saldo) : undefined"
            class="form-control"
            required
          />
        </div>

        <p v-if="errorMensaje" class="mensaje-error">{{ errorMensaje }}</p>

        <button type="submit" class="btn btn-success" :disabled="guardando">
          <span v-if="guardando" class="spinner"></span>
          {{ guardando ? 'Registrando...' : 'Registrar pago' }}
        </button>
      </form>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useCreditoStore } from '../stores/creditoStore';
import BaseModal from '../components/BaseModal.vue';
import type { Credito } from '../types/Credito';
import { useRoute } from 'vue-router';
import { useTablaAvanzada } from '../composables/useTablaAvanzada';
import PaginacionControles from '../components/PaginacionControles.vue';

const creditoStore = useCreditoStore();
const route = useRoute();

const { paginaActual, totalPaginas, datosPaginados, cambiarOrden, irAPagina, iconoOrden } =
  useTablaAvanzada(computed(() => creditoStore.creditos));

const filtrosEstado = [
  { etiqueta: 'Todos', valor: '' },
  { etiqueta: 'Pendientes', valor: 'pendiente' },
  { etiqueta: 'Vencidos', valor: 'vencido' },
  { etiqueta: 'Pagados', valor: 'pagado' },
];
const filtroActivo = ref('');

const modalVisible = ref(false);
const creditoSeleccionado = ref<Credito | null>(null);
const montoPago = ref<number>(0);
const guardando = ref(false);
const errorMensaje = ref('');

onMounted(() => {
  const estadoInicial = (route.query.estado as string) || '';
  filtroActivo.value = estadoInicial;
  creditoStore.cargarCreditos(estadoInicial || undefined);
});

const cambiarFiltro = (valor: string) => {
  filtroActivo.value = valor;
  creditoStore.cargarCreditos(valor || undefined);
};

const formatearFecha = (fecha: string) =>
  new Date(fecha).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' });

const abrirModalPago = (credito: Credito) => {
  creditoSeleccionado.value = credito;
  montoPago.value = Number(credito.saldo);
  errorMensaje.value = '';
  modalVisible.value = true;
};

const cerrarModal = () => {
  modalVisible.value = false;
  creditoSeleccionado.value = null;
};

const guardarPago = async () => {
  if (!creditoSeleccionado.value) return;

  errorMensaje.value = '';
  guardando.value = true;
  try {
    await creditoStore.pagar({
      credito_id: creditoSeleccionado.value.id,
      monto: montoPago.value,
    });
    cerrarModal();
  } catch (error: any) {
    errorMensaje.value = error.response?.data?.error || 'Error al registrar el pago';
  } finally {
    guardando.value = false;
  }
};
</script>

<style scoped lang="scss">
.creditos-view {
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
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

.filtros {
  display: flex;
  gap: 0.4rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.filtro-boton {
  padding: 0.4rem 0.85rem;
  border: 2px solid var(--color-borde, #e5e7eb);
  background: var(--color-fondo-tarjeta, #ffffff);
  color: var(--color-texto-primario, #1a1a2e);
  border-radius: 999px;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;

  &:hover {
    border-color: #6c5ce7;
    transform: translateY(-1px);
  }

  &--activo {
    background: linear-gradient(135deg, #6c5ce7, #a29bfe);
    border-color: #6c5ce7;
    color: white;
    box-shadow: 0 4px 12px rgba(108, 92, 231, 0.3);
  }
}

.estado-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: var(--color-texto-secundario, #6b7280);

  &__icono {
    font-size: 3rem;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 0.95rem;
    font-weight: 600;
    margin: 0;
  }
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.table-wrapper {
  background: var(--color-fondo-tarjeta, #ffffff);
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid var(--color-borde, rgba(0, 0, 0, 0.06));
}

.table {
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 0.85rem 1.1rem;
    text-align: left;
    font-size: 0.88rem;
    border-bottom: 1px solid var(--color-borde, rgba(0, 0, 0, 0.06));
  }

  th {
    font-weight: 700;
    color: var(--color-texto-secundario, #6b7280);
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  tbody tr:hover {
    background: rgba(108, 92, 231, 0.04);
  }
}

.th-ordenable {
  cursor: pointer;
  user-select: none;
  white-space: nowrap;

  &:hover {
    color: #6c5ce7;
  }

  &__icono {
    font-size: 0.7rem;
    opacity: 0.6;
    margin-left: 0.15rem;
  }
}

.table__saldo {
  font-weight: 700;
  color: #6c5ce7;
}

.table__acciones {
  text-align: right;
}

.badge {
  display: inline-block;
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: capitalize;

  &--pendiente {
    background: rgba(253, 203, 110, 0.25);
    color: #d68910;
  }

  &--vencido {
    background: rgba(225, 112, 85, 0.12);
    color: #e17055;
  }

  &--pagado {
    background: rgba(0, 184, 148, 0.12);
    color: #00b894;
  }
}

.badge-mora {
  background: rgba(225, 112, 85, 0.12);
  color: #e17055;
  padding: 0.15rem 0.5rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
}

.text-muted {
  color: var(--color-texto-claro, #9ca3af);
}

.detalle-credito {
  background: var(--color-fondo-input, #f8fafc);
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  border: 1px solid var(--color-borde, rgba(0, 0, 0, 0.04));

  &__item {
    display: flex;
    justify-content: space-between;
    padding: 0.25rem 0;

    &:not(:last-child) {
      border-bottom: 1px solid var(--color-borde, rgba(0, 0, 0, 0.04));
    }
  }

  &__label {
    font-size: 0.85rem;
    color: var(--color-texto-secundario, #6b7280);
  }

  &__valor {
    font-size: 0.85rem;
    font-weight: 500;

    &--destacado {
      font-size: 1.1rem;
      font-weight: 700;
      color: #6c5ce7;
    }
  }
}

.form-pago {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.mensaje-error {
  color: #e17055;
  font-size: 0.85rem;
  background: rgba(225, 112, 85, 0.1);
  padding: 0.6rem 0.9rem;
  border-radius: 10px;
  margin: 0;
  border-left: 3px solid #e17055;
}
</style>