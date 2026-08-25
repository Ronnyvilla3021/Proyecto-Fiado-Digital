<template>
  <div class="ventas-view">
    <div class="ventas-view__header">
      <div>
        <h1 class="ventas-view__titulo">Ventas</h1>
        <p class="ventas-view__subtitulo">Registra y gestiona tus ventas</p>
      </div>
      <button class="btn btn-primary" @click="abrirModal">+ Nueva venta</button>
    </div>

    <div v-if="ventaStore.cargando" class="estado-info">
      <span class="spinner"></span>
      Cargando ventas...
    </div>
    <div v-else-if="ventaStore.ventas.length === 0" class="estado-info">
      <span class="estado-info__icono">🛒</span>
      <p>Aún no hay ventas registradas</p>
      <span class="estado-info__sub">Comienza registrando tu primera venta</span>
    </div>

    <div v-else class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th class="th-ordenable" @click="cambiarOrden('fecha')">
              Fecha <span class="th-ordenable__icono">{{ iconoOrden('fecha') }}</span>
            </th>
            <th>Cliente</th>
            <th class="th-ordenable" @click="cambiarOrden('metodo_pago')">
              Método <span class="th-ordenable__icono">{{ iconoOrden('metodo_pago') }}</span>
            </th>
            <th class="th-ordenable" @click="cambiarOrden('total')">
              Total <span class="th-ordenable__icono">{{ iconoOrden('total') }}</span>
            </th>
            <th>Ítems</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="venta in datosPaginados" :key="venta.id">
            <td>{{ formatearFecha(venta.fecha) }}</td>
            <td>{{ venta.Cliente ? `${venta.Cliente.nombre} ${venta.Cliente.apellido}` : 'Consumidor final' }}</td>
            <td>
              <span class="badge" :class="`badge--${venta.metodo_pago}`">
                {{ venta.metodo_pago }}
              </span>
            </td>
            <td><strong>${{ Number(venta.total).toFixed(2) }}</strong></td>
            <td>{{ venta.detalles.length }} ítem(s)</td>
          </tr>
        </tbody>
      </table>

      <PaginacionControles
        :pagina-actual="paginaActual"
        :total-paginas="totalPaginas"
        @cambiar="irAPagina"
      />
    </div>

    <!-- Modal Nueva Venta -->
    <BaseModal :visible="modalVisible" titulo="Registrar venta" @cerrar="cerrarModal">
      <form class="form-venta" @submit.prevent="guardarVenta">
        <div class="form-group">
          <label>Método de pago</label>
          <div class="opciones-pago">
            <button
              type="button"
              class="opcion-pago"
              :class="{ 'opcion-pago--activa': formulario.metodo_pago === 'contado' }"
              @click="formulario.metodo_pago = 'contado'"
            >
              💵 Contado
            </button>
            <button
              type="button"
              class="opcion-pago"
              :class="{ 'opcion-pago--activa': formulario.metodo_pago === 'fiado' }"
              @click="formulario.metodo_pago = 'fiado'"
            >
              📒 Fiado
            </button>
          </div>
        </div>

        <div v-if="formulario.metodo_pago === 'fiado'" class="form-group">
          <label>Cliente</label>
          <select v-model.number="formulario.cliente_id" class="form-control" required>
            <option :value="null" disabled>Selecciona un cliente</option>
            <option
              v-for="cliente in clientesActivos"
              :key="cliente.id"
              :value="cliente.id"
            >
              {{ cliente.nombre }} {{ cliente.apellido }} — Cédula {{ cliente.cedula }}
            </option>
          </select>
        </div>

        <div v-if="formulario.metodo_pago === 'fiado'" class="form-group">
          <label>Plazo (días)</label>
          <input v-model.number="formulario.dias_plazo" type="number" min="1" placeholder="15" class="form-control" />
        </div>

        <div class="form-group">
          <label>Observaciones</label>
          <input v-model="formulario.observaciones" type="text" placeholder="Opcional" class="form-control" />
        </div>

        <hr class="separador" />

        <div class="form-group">
          <label>Ítems de la venta</label>

          <div v-for="(item, index) in formulario.detalles" :key="index" class="item-fila">
            <input
              v-model="item.descripcion"
              type="text"
              placeholder="Descripción"
              class="form-control item-fila__descripcion"
              required
            />
            <input
              v-model.number="item.cantidad"
              type="number"
              min="1"
              placeholder="Cant."
              class="form-control item-fila__numero"
              required
            />
            <input
              v-model.number="item.precio_unitario"
              type="number"
              min="0"
              step="0.01"
              placeholder="Precio"
              class="form-control item-fila__numero"
              required
            />
            <span class="item-fila__subtotal">
              ${{ (item.cantidad * item.precio_unitario || 0).toFixed(2) }}
            </span>
            <button
              type="button"
              class="item-fila__quitar"
              @click="quitarItem(index)"
              :disabled="formulario.detalles.length === 1"
            >
              ✕
            </button>
          </div>

          <button type="button" class="btn btn-outline btn-sm" @click="agregarItem">
            + Agregar ítem
          </button>
        </div>

        <div class="total-venta">
          <span>Total</span>
          <strong>${{ totalCalculado.toFixed(2) }}</strong>
        </div>

        <p v-if="errorMensaje" class="mensaje-error">{{ errorMensaje }}</p>

        <button type="submit" class="btn btn-primary" :disabled="guardando">
          <span v-if="guardando" class="spinner"></span>
          {{ guardando ? 'Registrando...' : 'Registrar venta' }}
        </button>
      </form>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useVentaStore } from '../stores/ventaStore';
import { useClienteStore } from '../stores/clienteStore';
import BaseModal from '../components/BaseModal.vue';
import type { VentaFormulario } from '../types/Venta';
import { useTablaAvanzada } from '../composables/useTablaAvanzada';
import PaginacionControles from '../components/PaginacionControles.vue';

const ventaStore = useVentaStore();
const clienteStore = useClienteStore();

const { paginaActual, totalPaginas, datosPaginados, cambiarOrden, irAPagina, iconoOrden } =
  useTablaAvanzada(computed(() => ventaStore.ventas));

const modalVisible = ref(false);
const guardando = ref(false);
const errorMensaje = ref('');

const formularioVacio = (): VentaFormulario => ({
  cliente_id: null,
  metodo_pago: 'contado',
  observaciones: '',
  dias_plazo: 15,
  detalles: [{ descripcion: '', cantidad: 1, precio_unitario: 0 }],
});

const formulario = ref<VentaFormulario>(formularioVacio());

const clientesActivos = computed(() =>
  clienteStore.clientes.filter((c) => c.estado === 'activo')
);

const totalCalculado = computed(() =>
  formulario.value.detalles.reduce(
    (suma, item) => suma + (Number(item.cantidad) || 0) * (Number(item.precio_unitario) || 0),
    0
  )
);

onMounted(() => {
  ventaStore.cargarVentas();
  clienteStore.cargarClientes();
});

const formatearFecha = (fecha: string) =>
  new Date(fecha).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' });

const agregarItem = () => {
  formulario.value.detalles.push({ descripcion: '', cantidad: 1, precio_unitario: 0 });
};

const quitarItem = (index: number) => {
  formulario.value.detalles.splice(index, 1);
};

const abrirModal = () => {
  formulario.value = formularioVacio();
  errorMensaje.value = '';
  modalVisible.value = true;
};

const cerrarModal = () => {
  modalVisible.value = false;
};

const guardarVenta = async () => {
  errorMensaje.value = '';
  guardando.value = true;
  try {
    const datosEnvio: VentaFormulario = {
      ...formulario.value,
      cliente_id: formulario.value.metodo_pago === 'fiado' ? formulario.value.cliente_id : null,
    };
    await ventaStore.registrar(datosEnvio);
    cerrarModal();
  } catch (error: any) {
    errorMensaje.value = error.response?.data?.error || 'Error al registrar la venta';
  } finally {
    guardando.value = false;
  }
};
</script>

<style scoped lang="scss">
.ventas-view {
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

  &__sub {
    font-size: 0.85rem;
    opacity: 0.7;
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

.badge {
  display: inline-block;
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: capitalize;

  &--contado {
    background: rgba(9, 132, 227, 0.12);
    color: #0984e3;
  }

  &--fiado {
    background: rgba(253, 203, 110, 0.25);
    color: #e17055;
  }
}

.form-venta {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.opciones-pago {
  display: flex;
  gap: 0.5rem;
}

.opcion-pago {
  flex: 1;
  padding: 0.6rem;
  border: 2px solid var(--color-borde, #e5e7eb);
  background: var(--color-fondo-input, #f8fafc);
  color: var(--color-texto-primario, #1a1a2e);
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.88rem;
  font-weight: 600;
  transition: all 0.3s;

  &:hover {
    border-color: var(--color-texto-secundario);
  }

  &--activa {
    border-color: #6c5ce7;
    background: rgba(108, 92, 231, 0.08);
    color: #6c5ce7;
    box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.1);
  }
}

.separador {
  border: none;
  border-top: 1px solid var(--color-borde, rgba(0, 0, 0, 0.06));
  margin: 0.25rem 0;
}

.item-fila {
  display: grid;
  grid-template-columns: 1fr 60px 80px 70px 28px;
  gap: 0.4rem;
  align-items: center;
  margin-bottom: 0.5rem;

  &__descripcion {
    min-width: 0;
  }

  &__numero {
    min-width: 0;
    text-align: center;
  }

  &__subtotal {
    font-size: 0.82rem;
    font-weight: 600;
    text-align: right;
    color: var(--color-texto-primario, #1a1a2e);
  }

  &__quitar {
    background: none;
    border: none;
    color: #e17055;
    cursor: pointer;
    font-size: 0.9rem;
    padding: 0.2rem;
    border-radius: 6px;
    transition: all 0.2s;

    &:hover:not(:disabled) {
      background: rgba(225, 112, 85, 0.1);
      transform: scale(1.2);
    }

    &:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
  }
}

.total-venta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--color-fondo-input, #f8fafc);
  border-radius: 10px;
  font-size: 1rem;
  border: 1px solid var(--color-borde, rgba(0, 0, 0, 0.04));

  strong {
    font-size: 1.2rem;
    color: #6c5ce7;
  }
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