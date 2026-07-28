<template>
  <div class="ventas-view">
    <div class="ventas-view__header">
      <h1>Ventas</h1>
      <button class="boton-primario" @click="abrirModal">+ Nueva venta</button>
    </div>

    <div v-if="ventaStore.cargando" class="estado-info">Cargando ventas...</div>
    <div v-else-if="ventaStore.ventas.length === 0" class="estado-info">
      Aún no hay ventas registradas.
    </div>

    <table v-else class="tabla">
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Cliente</th>
          <th>Método</th>
          <th>Total</th>
          <th>Ítems</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="venta in ventaStore.ventas" :key="venta.id">
          <td>{{ formatearFecha(venta.fecha) }}</td>
          <td>{{ venta.Cliente ? `${venta.Cliente.nombre} ${venta.Cliente.apellido}` : 'Consumidor final' }}</td>
          <td>
            <span class="etiqueta" :class="`etiqueta--${venta.metodo_pago}`">
              {{ venta.metodo_pago }}
            </span>
          </td>
          <td>${{ Number(venta.total).toFixed(2) }}</td>
          <td>{{ venta.detalles.length }} ítem(s)</td>
        </tr>
      </tbody>
    </table>

    <!-- Modal Nueva Venta -->
    <BaseModal :visible="modalVisible" titulo="Registrar venta" @cerrar="cerrarModal">
      <form class="form-venta" @submit.prevent="guardarVenta">
        <div class="campo">
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

        <div class="campo" v-if="formulario.metodo_pago === 'fiado'">
          <label>Cliente</label>
          <select v-model.number="formulario.cliente_id" required>
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

        <div class="campo" v-if="formulario.metodo_pago === 'fiado'">
          <label>Plazo (días)</label>
          <input v-model.number="formulario.dias_plazo" type="number" min="1" placeholder="15" />
        </div>

        <div class="campo">
          <label>Observaciones</label>
          <input v-model="formulario.observaciones" type="text" placeholder="Opcional" />
        </div>

        <hr class="separador" />

        <div class="campo">
          <label>Ítems de la venta</label>

          <div v-for="(item, index) in formulario.detalles" :key="index" class="item-fila">
            <input
              v-model="item.descripcion"
              type="text"
              placeholder="Descripción"
              class="item-fila__descripcion"
              required
            />
            <input
              v-model.number="item.cantidad"
              type="number"
              min="1"
              placeholder="Cant."
              class="item-fila__numero"
              required
            />
            <input
              v-model.number="item.precio_unitario"
              type="number"
              min="0"
              step="0.01"
              placeholder="Precio"
              class="item-fila__numero"
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

          <button type="button" class="boton-secundario" @click="agregarItem">
            + Agregar ítem
          </button>
        </div>

        <div class="total-venta">
          <span>Total</span>
          <strong>${{ totalCalculado.toFixed(2) }}</strong>
        </div>

        <p v-if="errorMensaje" class="mensaje-error">{{ errorMensaje }}</p>

        <button type="submit" class="boton-primario" :disabled="guardando">
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

const ventaStore = useVentaStore();
const clienteStore = useClienteStore();

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
    align-items: center;
    margin-bottom: 1.25rem;

    h1 {
      font-size: 1.4rem;
      font-weight: 700;
    }
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

  &--contado {
    background: #dbeafe;
    color: #2563eb;
  }

  &--fiado {
    background: #fef3c7;
    color: #d97706;
  }
}

.form-venta {
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

  input, select {
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

.opciones-pago {
  display: flex;
  gap: 0.5rem;
}

.opcion-pago {
  flex: 1;
  padding: 0.6rem;
  border: 1px solid var(--color-borde);
  background: var(--color-input-fondo, white);
  color: inherit;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.88rem;
  font-weight: 600;
  transition: all 0.15s;

  &--activa {
    border-color: #4f46e5;
    background: #eef2ff;
    color: #4f46e5;
  }
}

.separador {
  border: none;
  border-top: 1px solid var(--color-borde);
  margin: 0.25rem 0;
}

.item-fila {
  display: grid;
  grid-template-columns: 1fr 60px 80px 70px 28px;
  gap: 0.4rem;
  align-items: center;
  margin-bottom: 0.5rem;

  input {
    padding: 0.45rem 0.6rem;
    font-size: 0.85rem;
  }

  &__subtotal {
    font-size: 0.82rem;
    font-weight: 600;
    text-align: right;
  }

  &__quitar {
    background: none;
    border: none;
    color: #dc2626;
    cursor: pointer;
    font-size: 0.9rem;

    &:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
  }
}

.boton-secundario {
  background: none;
  border: 1px dashed var(--color-borde);
  color: #4f46e5;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;

  &:hover {
    background: #eef2ff;
  }
}

.total-venta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--color-input-fondo, #f9fafb);
  border-radius: 8px;
  font-size: 1rem;

  strong {
    font-size: 1.2rem;
    color: #4f46e5;
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