<template>
  <div class="clientes-view">
    <div class="clientes-view__header">
      <h1>Clientes</h1>
      <button class="boton-primario" @click="abrirModalCrear">+ Nuevo cliente</button>
    </div>

    <input
      v-model="busqueda"
      type="text"
      placeholder="Buscar por nombre, apellido o cédula..."
      class="input-busqueda"
      @input="buscar"
    />

    <div v-if="clienteStore.cargando" class="estado-info">Cargando clientes...</div>
    <div v-else-if="clienteStore.clientes.length === 0" class="estado-info">
      No se encontraron clientes.
    </div>

    <table v-else class="tabla">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Cédula</th>
          <th>Teléfono</th>
          <th>Límite crédito</th>
          <th>Estado</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="cliente in clienteStore.clientes" :key="cliente.id">
          <td>{{ cliente.nombre }} {{ cliente.apellido }}</td>
          <td>{{ cliente.cedula }}</td>
          <td>{{ cliente.telefono || '—' }}</td>
          <td>${{ Number(cliente.limite_credito).toFixed(2) }}</td>
          <td>
            <span class="etiqueta" :class="`etiqueta--${cliente.estado}`">
              {{ cliente.estado }}
            </span>
          </td>
          <td class="tabla__acciones">
  <button class="boton-icono" title="Editar" @click="abrirModalEditar(cliente)">✏️</button>
  <button
    v-if="authStore.esAdmin() && cliente.estado === 'activo'"
    class="boton-icono"
    title="Desactivar"
    @click="confirmarEliminar(cliente)"
  >
    🗑️
  </button>
  <button
    v-if="authStore.esAdmin() && cliente.estado === 'inactivo'"
    class="boton-icono"
    title="Reactivar"
    @click="reactivarCliente(cliente)"
  >
    ✅
  </button>
</td>
        </tr>
      </tbody>
    </table>

    <!-- Modal Crear/Editar -->
    <BaseModal :visible="modalVisible" :titulo="clienteEditando ? 'Editar cliente' : 'Nuevo cliente'" @cerrar="cerrarModal">
      <form class="form-cliente" @submit.prevent="guardarCliente">
        <div class="campo">
          <label>Nombre</label>
          <input v-model="formulario.nombre" type="text" required />
        </div>
        <div class="campo">
          <label>Apellido</label>
          <input v-model="formulario.apellido" type="text" required />
        </div>
        <div class="campo">
          <label>Cédula</label>
          <input v-model="formulario.cedula" type="text" required :disabled="!!clienteEditando" />
        </div>
        <div class="campo">
          <label>Teléfono</label>
          <input v-model="formulario.telefono" type="text" />
        </div>
        <div class="campo">
          <label>Dirección</label>
          <input v-model="formulario.direccion" type="text" />
        </div>
        <div class="campo">
          <label>Email</label>
          <input v-model="formulario.email" type="email" />
        </div>

        <div class="campo" v-if="authStore.esAdmin() || authStore.esSupervisor()">
          <label>Límite de crédito</label>
          <input v-model.number="formulario.limite_credito" type="number" step="0.01" min="0" />
        </div>
        <p v-else class="nota">
          Solo un administrador o supervisor puede asignar el límite de crédito.
        </p>

        <p v-if="errorMensaje" class="mensaje-error">{{ errorMensaje }}</p>

        <button type="submit" class="boton-primario" :disabled="guardando">
          {{ guardando ? 'Guardando...' : 'Guardar' }}
        </button>
      </form>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useClienteStore } from '../stores/clienteStore';
import { useAuthStore } from '../stores/authStore';
import BaseModal from '../components/BaseModal.vue';
import type { Cliente, ClienteFormulario } from '../types/Cliente';

const clienteStore = useClienteStore();
const authStore = useAuthStore();

const busqueda = ref('');
const modalVisible = ref(false);
const clienteEditando = ref<Cliente | null>(null);
const guardando = ref(false);
const errorMensaje = ref('');

const formularioVacio: ClienteFormulario = {
  nombre: '',
  apellido: '',
  cedula: '',
  telefono: '',
  direccion: '',
  email: '',
  limite_credito: 0,
};

const formulario = ref<ClienteFormulario>({ ...formularioVacio });

onMounted(() => {
  clienteStore.cargarClientes();
});

let timeoutBusqueda: ReturnType<typeof setTimeout>;
const buscar = () => {
  clearTimeout(timeoutBusqueda);
  timeoutBusqueda = setTimeout(() => {
    clienteStore.cargarClientes(busqueda.value);
  }, 400);
};

const abrirModalCrear = () => {
  clienteEditando.value = null;
  formulario.value = { ...formularioVacio };
  errorMensaje.value = '';
  modalVisible.value = true;
};

const abrirModalEditar = (cliente: Cliente) => {
  clienteEditando.value = cliente;
  formulario.value = {
    nombre: cliente.nombre,
    apellido: cliente.apellido,
    cedula: cliente.cedula,
    telefono: cliente.telefono || '',
    direccion: cliente.direccion || '',
    email: cliente.email || '',
    limite_credito: Number(cliente.limite_credito),
  };
  errorMensaje.value = '';
  modalVisible.value = true;
};

const cerrarModal = () => {
  modalVisible.value = false;
};

const guardarCliente = async () => {
  errorMensaje.value = '';
  guardando.value = true;
  try {
    // Convertimos strings vacíos a null, para no romper validaciones opcionales del backend (ej. email)
    const datosLimpios = {
      ...formulario.value,
      telefono: formulario.value.telefono || null,
      direccion: formulario.value.direccion || null,
      email: formulario.value.email || null,
    };

    if (clienteEditando.value) {
      await clienteStore.editar(clienteEditando.value.id, datosLimpios);
    } else {
      await clienteStore.crear(datosLimpios);
    }
    cerrarModal();
  } catch (error: any) {
    errorMensaje.value = error.response?.data?.error || 'Error al guardar el cliente';
  } finally {
    guardando.value = false;
  }
};

const confirmarEliminar = async (cliente: Cliente) => {
  const confirmado = window.confirm(
    `¿Desactivar a ${cliente.nombre} ${cliente.apellido}? Esto no borra su historial, solo lo marca como inactivo.`
  );
  if (!confirmado) return;

  try {
    await clienteStore.eliminar(cliente.id);
  } catch (error: any) {
    alert(error.response?.data?.error || 'Error al desactivar el cliente');
  }
};
const reactivarCliente = async (cliente: Cliente) => {
  const confirmado = window.confirm(`¿Reactivar a ${cliente.nombre} ${cliente.apellido}?`);
  if (!confirmado) return;

  try {
    await clienteStore.editar(cliente.id, { estado: 'activo' });
  } catch (error: any) {
    alert(error.response?.data?.error || 'Error al reactivar el cliente');
  }
};
</script>

<style scoped lang="scss">
.clientes-view {
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

.input-busqueda {
  width: 100%;
  max-width: 360px;
  padding: 0.6rem 0.9rem;
  border: 1px solid var(--color-borde);
  border-radius: 8px;
  margin-bottom: 1.25rem;
  font-size: 0.9rem;
  background: var(--color-input-fondo);
  color: inherit;

  &:focus {
    outline: none;
    border-color: #4f46e5;
  }
}

.estado-info {
  padding: 2rem;
  text-align: center;
  color: #6b7280;
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

  &__acciones {
    display: flex;
    gap: 0.4rem;
  }
}

.boton-icono {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.95rem;
  padding: 0.25rem 0.4rem;
  border-radius: 6px;

  &:hover {
    background: rgba(0, 0, 0, 0.06);
  }
}

.etiqueta {
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;

  &--activo {
    background: #dcfce7;
    color: #16a34a;
  }

  &--inactivo {
    background: #fee2e2;
    color: #dc2626;
  }
}

.form-cliente {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;

  label {
    font-size: 0.82rem;
    font-weight: 600;
    color: #6b7280;
  }

  input {
    padding: 0.55rem 0.75rem;
    border: 1px solid var(--color-borde);
    border-radius: 8px;
    font-size: 0.9rem;
    background: var(--color-input-fondo);
    color: inherit;

    &:focus {
      outline: none;
      border-color: #4f46e5;
    }

    &:disabled {
      background: rgba(128, 128, 128, 0.15);
      cursor: not-allowed;
    }
  }
}

.nota {
  font-size: 0.8rem;
  color: #9ca3af;
  font-style: italic;
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