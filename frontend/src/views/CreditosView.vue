<template>
  <div class="creditos-view">
    <div class="creditos-view__header">
      <h1>Créditos</h1>

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
    </div>

    <div v-if="creditoStore.cargando" class="estado-info">Cargando créditos...</div>
    <div v-else-if="creditoStore.creditos.length === 0" class="estado-info">
      No hay créditos {{ filtroActivo ? `en estado "${filtroActivo}"` : '' }}.
    </div>

    <table v-else class="tabla">
      <thead>
        <tr>
          <th>Cliente</th>
          <th>Monto total</th>
          <th>Saldo</th>
          <th>Fecha límite</th>
          <th>Estado</th>
          <th>Mora</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="credito in creditoStore.creditos" :key="credito.id">
          <td>{{ credito.Cliente.nombre }} {{ credito.Cliente.apellido }}</td>
          <td>${{ Number(credito.monto_total).toFixed(2) }}</td>
          <td><strong>${{ Number(credito.saldo).toFixed(2) }}</strong></td>
          <td>{{ formatearFecha(credito.fecha_limite) }}</td>
          <td>
            <span class="etiqueta" :class="`etiqueta--${credito.estado}`">
              {{ credito.estado }}
            </span>
          </td>
          <td>
            <span v-if="credito.dias_mora > 0" class="mora">
              {{ credito.dias_mora }} día(s)
            </span>
            <span v-else>—</span>
          </td>
          <td>
            <button
              v-if="credito.estado !== 'pagado'"
              class="boton-secundario"
              @click="abrirModalPago(credito)"
            >
              💰 Pagar
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal Registrar Pago -->
    <BaseModal :visible="modalVisible" titulo="Registrar pago" @cerrar="cerrarModal">
      <div v-if="creditoSeleccionado" class="detalle-credito">
        <p>
          <strong>Cliente:</strong>
          {{ creditoSeleccionado.Cliente.nombre }} {{ creditoSeleccionado.Cliente.apellido }}
        </p>
        <p><strong>Saldo pendiente:</strong> ${{ Number(creditoSeleccionado.saldo).toFixed(2) }}</p>
      </div>

      <form class="form-pago" @submit.prevent="guardarPago">
        <div class="campo">
          <label>Monto a pagar</label>
          <input
            v-model.number="montoPago"
            type="number"
            min="0.01"
            step="0.01"
            :max="creditoSeleccionado ? Number(creditoSeleccionado.saldo) : undefined"
            required
          />
        </div>

        <p v-if="errorMensaje" class="mensaje-error">{{ errorMensaje }}</p>

        <button type="submit" class="boton-primario" :disabled="guardando">
          {{ guardando ? 'Registrando...' : 'Registrar pago' }}
        </button>
      </form>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useCreditoStore } from '../stores/creditoStore';
import BaseModal from '../components/BaseModal.vue';
import type { Credito } from '../types/Credito';

const creditoStore = useCreditoStore();

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
  creditoStore.cargarCreditos();
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
    align-items: center;
    margin-bottom: 1.25rem;
    flex-wrap: wrap;
    gap: 1rem;

    h1 {
      font-size: 1.4rem;
      font-weight: 700;
    }
  }
}

.filtros {
  display: flex;
  gap: 0.4rem;
}

.filtro-boton {
  padding: 0.4rem 0.85rem;
  border: 1px solid var(--color-borde);
  background: var(--color-fondo-tarjeta);
  color: inherit;
  border-radius: 999px;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: #4f46e5;
  }

  &--activo {
    background: #4f46e5;
    border-color: #4f46e5;
    color: white;
  }
}

.estado-info {
  padding: 2rem;
  text-align: center;
  color: var(--color-texto-secundario, #6b7280);
}

.tabla {
  width: 100%;
  border-collapse: collapse;
  background: var(--color-fondo-tarjeta);
  border-radius: 10px;
  overflow: hidden;

  th, td {
    padding: 0.75rem 1rem;
    text-align: left;
    font-size: 0.88rem;
    border-bottom: 1px solid var(--color-borde);
  }

  th {
    font-weight: 600;
    color: var(--color-texto-secundario);
    font-size: 0.78rem;
    text-transform: uppercase;
  }
}

.etiqueta {
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;

  &--pendiente {
    background: #fef3c7;
    color: #d97706;
  }

  &--pagado {
    background: #dcfce7;
    color: #16a34a;
  }

  &--vencido {
    background: #fee2e2;
    color: #dc2626;
  }
}

.mora {
  color: #dc2626;
  font-weight: 600;
  font-size: 0.85rem;
}

.boton-secundario {
  background: none;
  border: 1px solid #4f46e5;
  color: #4f46e5;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 600;

  &:hover {
    background: #eef2ff;
  }
}

.detalle-credito {
  background: var(--color-input-fondo, #f9fafb);
  padding: 0.85rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.88rem;

  p {
    margin: 0.25rem 0;
  }
}

.form-pago {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;

  label {
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--color-texto-secundario, #6b7280);
  }

  input {
    padding: 0.55rem 0.75rem;
    border: 1px solid var(--color-borde);
    border-radius: 8px;
    font-size: 0.9rem;
    background: var(--color-input-fondo, white);
    color: inherit;

    &:focus {
      outline: none;
      border-color: #4f46e5;
    }
  }
}

.mensaje-error {
  color: #dc2626;
  font-size: 0.85rem;
  background: #fef2f2;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
}

.boton-primario {
  background: #4f46e5;
  color: white;
  border: none;
  padding: 0.6rem 1.1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.88rem;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: #4338ca;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}
</style>