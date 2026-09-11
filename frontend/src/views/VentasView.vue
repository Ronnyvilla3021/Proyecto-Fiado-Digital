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

  &__sub {
    font-size: 0.85rem;
    opacity: 0.75;
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

  &--contado {
    background: rgba(9, 132, 227, 0.14);
    color: #0369a1;
  }

  &--fiado {
    background: rgba(253, 203, 110, 0.22);
    color: #b45309;
  }
}

.form-venta {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.opciones-pago {
  display: flex;
  gap: 0.6rem;
}

.opcion-pago {
  flex: 1;
  padding: 0.7rem 0.9rem;
  border: 1.5px solid var(--color-borde, #e5e7eb);
  background: var(--color-fondo-input, #f9fafb);
  color: var(--color-texto-primario, #1a1a2e);
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: inherit;
  transition: border-color 0.25s ease, background 0.25s ease,
    color 0.25s ease, box-shadow 0.25s ease, transform 0.2s ease;

  &:hover:not(&--activa) {
    border-color: var(--color-primario, #6c5ce7);
    color: var(--color-primario, #6c5ce7);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &--activa {
    border-color: var(--color-primario, #6c5ce7);
    background: rgba(108, 92, 231, 0.08);
    color: var(--color-primario, #6c5ce7);
    box-shadow: 0 0 0 4px rgba(108, 92, 231, 0.14);
  }
}

.separador {
  border: none;
  border-top: 1px dashed var(--color-borde, rgba(0, 0, 0, 0.08));
  margin: 0.5rem 0;
}

.item-fila {
  display: grid;
  grid-template-columns: 1fr 64px 90px 76px 30px;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.55rem;

  &__descripcion {
    min-width: 0;
  }

  &__numero {
    min-width: 0;
    text-align: center;
    font-variant-numeric: tabular-nums;
  }

  &__subtotal {
    font-size: 0.84rem;
    font-weight: 700;
    text-align: right;
    color: var(--color-primario, #6c5ce7);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  &__quitar {
    background: none;
    border: none;
    color: #dc2626;
    cursor: pointer;
    font-size: 0.95rem;
    padding: 0.3rem;
    border-radius: 6px;
    transition: background 0.2s ease, transform 0.2s ease;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover:not(:disabled) {
      background: rgba(220, 38, 38, 0.12);
      transform: scale(1.15);
    }

    &:active:not(:disabled) {
      transform: scale(0.95);
    }

    &:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
  }
}

/* Inputs dentro del modal — override específico */
.form-venta {
  .form-control {
    border-radius: 10px;
    padding: 0.55rem 0.75rem;
    font-size: 0.86rem;
    border-width: 1.5px;
  }
}

.total-venta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.9rem 1.15rem;
  background: linear-gradient(
    135deg,
    rgba(108, 92, 231, 0.08),
    rgba(162, 155, 254, 0.05)
  );
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  border: 1px solid rgba(108, 92, 231, 0.18);
  color: var(--color-texto-secundario, #6b7280);

  strong {
    font-size: 1.35rem;
    font-weight: 800;
    color: var(--color-primario, #6c5ce7);
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.01em;
  }
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
      min-width: 680px;
    }
  }
}

@media (max-width: 640px) {
  .ventas-view {
    &__titulo {
      font-size: 1.45rem;
    }

    &__header {
      flex-direction: column;
      align-items: stretch;

      .btn {
        width: 100%;
      }
    }
  }

  .item-fila {
    grid-template-columns: 1fr 60px 80px 30px;
    grid-template-areas:
      'desc desc desc desc'
      'cant precio subtotal quitar';
    gap: 0.4rem;

    &__descripcion { grid-area: desc; }
    &__numero:nth-of-type(1) { grid-area: cant; }
    &__numero:nth-of-type(2) { grid-area: precio; }
    &__subtotal { grid-area: subtotal; }
    &__quitar { grid-area: quitar; }
  }

  .total-venta {
    strong {
      font-size: 1.15rem;
    }
  }
}

/* Modo oscuro — usa el atributo real de la app */
[data-theme='dark'] {
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

  .opcion-pago {
    background: var(--color-fondo-input);
    border-color: var(--color-borde);
    color: var(--color-texto-primario);

    &:hover:not(&--activa) {
      border-color: var(--color-primario);
      color: var(--color-primario);
    }

    &--activa {
      border-color: var(--color-primario);
      background: rgba(108, 92, 231, 0.18);
      color: #a29bfe;
    }
  }

  .item-fila {
    &__subtotal {
      color: #a29bfe;
    }

    &__quitar {
      &:hover:not(:disabled) {
        background: rgba(220, 38, 38, 0.2);
      }
    }
  }

  .total-venta {
    background: linear-gradient(
      135deg,
      rgba(108, 92, 231, 0.18),
      rgba(162, 155, 254, 0.1)
    );
    border-color: rgba(108, 92, 231, 0.35);
    color: var(--color-texto-secundario);

    strong {
      color: #a29bfe;
    }
  }
}
</style>