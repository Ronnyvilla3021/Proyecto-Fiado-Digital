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

.filtros {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.filtro-boton {
  padding: 0.5rem 1rem;
  border: 1.5px solid var(--color-borde, #e5e7eb);
  background: var(--color-fondo-tarjeta, #ffffff);
  color: var(--color-texto-secundario, #6b7280);
  border-radius: 999px;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.25s ease;
  font-weight: 600;
  font-family: inherit;
  letter-spacing: 0.01em;

  &:hover:not(&--activo) {
    border-color: var(--color-primario, #6c5ce7);
    color: var(--color-primario, #6c5ce7);
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(108, 92, 231, 0.12);
  }

  &:active {
    transform: translateY(0);
  }

  &--activo {
    background: linear-gradient(135deg, #6c5ce7, #7d6ef0);
    border-color: transparent;
    color: #ffffff;
    box-shadow: 0 6px 16px rgba(108, 92, 231, 0.35);
    transform: translateY(-1px);
  }
}

.estado-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: var(--color-texto-secundario, #6b7280);
  background: var(--color-fondo-tarjeta, #ffffff);
  border: 1px dashed var(--color-borde, #e5e7eb);
  border-radius: 16px;
  gap: 0.5rem;

  &__icono {
    font-size: 3rem;
    margin-bottom: 0.25rem;
    opacity: 0.7;
  }

  p {
    font-size: 0.95rem;
    font-weight: 600;
    margin: 0;
    color: var(--color-texto-primario, #374151);
  }
}

.spinner {
  width: 22px;
  height: 22px;
  border: 2.5px solid rgba(255, 255, 255, 0.35);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.table-wrapper {
  background: var(--color-fondo-tarjeta, #ffffff);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--color-borde, rgba(0, 0, 0, 0.06));
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.table {
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 0.9rem 1.15rem;
    text-align: left;
    font-size: 0.88rem;
    border-bottom: 1px solid var(--color-borde, rgba(0, 0, 0, 0.06));
    color: var(--color-texto-primario, #1a1a2e);
    vertical-align: middle;
  }

  th {
    font-weight: 700;
    color: var(--color-texto-secundario, #6b7280);
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background: var(--color-fondo-input, #f9fafb);
    white-space: nowrap;
  }

  tbody tr {
    transition: background 0.2s ease;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  tbody tr:hover {
    background: rgba(108, 92, 231, 0.05);
  }
}

.th-ordenable {
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  transition: color 0.2s ease;

  &:hover {
    color: var(--color-primario, #6c5ce7);
  }

  &__icono {
    font-size: 0.7rem;
    opacity: 0.6;
    margin-left: 0.2rem;
    transition: opacity 0.2s ease;

    .th-ordenable:hover & {
      opacity: 1;
    }
  }
}

.table__saldo {
  font-weight: 700;
  color: var(--color-primario, #6c5ce7);
  font-variant-numeric: tabular-nums;
}

.table__acciones {
  text-align: right;
  white-space: nowrap;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.7rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: capitalize;
  letter-spacing: 0.01em;

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }

  &--pendiente {
    background: rgba(253, 203, 110, 0.2);
    color: #b45309;
  }

  &--vencido {
    background: rgba(225, 112, 85, 0.14);
    color: #dc2626;
  }

  &--pagado {
    background: rgba(0, 184, 148, 0.14);
    color: #059669;
  }
}

.badge-mora {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: rgba(225, 112, 85, 0.14);
  color: #dc2626;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  border: 1px solid rgba(225, 112, 85, 0.2);

  &::before {
    content: '⚠';
    font-size: 0.7rem;
  }
}

.text-muted {
  color: var(--color-texto-claro, #9ca3af);
}

.detalle-credito {
  background: var(--color-fondo-input, #f8fafc);
  padding: 1.1rem 1.25rem;
  border-radius: 14px;
  margin-bottom: 1.5rem;
  border: 1px solid var(--color-borde, rgba(0, 0, 0, 0.05));

  &__item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;

    &:not(:last-child) {
      border-bottom: 1px dashed var(--color-borde, rgba(0, 0, 0, 0.06));
    }
  }

  &__label {
    font-size: 0.85rem;
    color: var(--color-texto-secundario, #6b7280);
    font-weight: 500;
  }

  &__valor {
    font-size: 0.88rem;
    font-weight: 600;
    color: var(--color-texto-primario, #1a1a2e);

    &--destacado {
      font-size: 1.2rem;
      font-weight: 800;
      color: var(--color-primario, #6c5ce7);
      font-variant-numeric: tabular-nums;
    }
  }
}

.form-pago {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.mensaje-error {
  color: #dc2626;
  font-size: 0.86rem;
  font-weight: 500;
  background: rgba(220, 38, 38, 0.08);
  padding: 0.7rem 0.95rem;
  border-radius: 10px;
  margin: 0;
  border-left: 3px solid #dc2626;
  animation: shake 0.4s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

/* Responsive */
@media (max-width: 900px) {
  .table-wrapper {
    overflow-x: auto;

    .table {
      min-width: 820px;
    }
  }
}

@media (max-width: 640px) {
  .creditos-view {
    &__titulo {
      font-size: 1.45rem;
    }
  }

  .filtros {
    gap: 0.4rem;
  }

  .filtro-boton {
    padding: 0.4rem 0.8rem;
    font-size: 0.78rem;
  }

  .detalle-credito {
    padding: 0.9rem 1rem;

    &__item {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.25rem;
    }

    &__valor--destacado {
      font-size: 1.05rem;
    }
  }
}

/* Modo oscuro */
[data-theme='dark'] {
  .filtro-boton {
    background: var(--color-fondo-tarjeta);
    border-color: var(--color-borde);
    color: var(--color-texto-secundario);

    &:hover:not(&--activo) {
      border-color: var(--color-primario);
      color: var(--color-primario);
    }

    &--activo {
      background: linear-gradient(135deg, #6c5ce7, #7d6ef0);
      border-color: transparent;
      color: #ffffff;
    }
  }

  .table {
    th {
      background: var(--color-fondo-input);
      color: var(--color-texto-secundario);
    }

    td {
      color: var(--color-texto-primario);
    }

    tbody tr:hover {
      background: rgba(108, 92, 231, 0.08);
    }
  }

  .estado-info {
    background: var(--color-fondo-tarjeta);
    border-color: var(--color-borde);

    p { color: var(--color-texto-secundario); }
  }

  .detalle-credito {
    background: var(--color-fondo-input);
    border-color: var(--color-borde);

    &__valor {
      color: var(--color-texto-primario);
    }
  }
}
</style>