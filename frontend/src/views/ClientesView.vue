<template>
  <div class="clientes-view">
    <div class="clientes-view__header">
      <div>
        <h1 class="clientes-view__titulo">Clientes</h1>
        <p class="clientes-view__subtitulo">Gestiona tu cartera de clientes</p>
      </div>
      <button class="btn btn-primary" @click="abrirModalCrear">+ Nuevo cliente</button>
    </div>

    <div class="clientes-view__filtros">
      <div class="campo-busqueda">
        <span class="campo-busqueda__icono">🔍</span>
        <input
          v-model="busqueda"
          type="text"
          placeholder="Buscar por nombre, apellido o cédula..."
          class="campo-busqueda__input"
          @input="buscar"
        />
      </div>
    </div>

    <div v-if="clienteStore.cargando" class="estado-info">
      <span class="spinner"></span>
      Cargando clientes...
    </div>
    <div v-else-if="clienteStore.clientes.length === 0" class="estado-info">
      <span class="estado-info__icono">📭</span>
      <p>No se encontraron clientes</p>
      <span class="estado-info__sub">Comienza agregando tu primer cliente</span>
    </div>

    <div v-else class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th class="th-ordenable" @click="cambiarOrden('nombre')">
              Nombre <span class="th-ordenable__icono">{{ iconoOrden('nombre') }}</span>
            </th>
            <th class="th-ordenable" @click="cambiarOrden('cedula')">
              Cédula <span class="th-ordenable__icono">{{ iconoOrden('cedula') }}</span>
            </th>
            <th>Teléfono</th>
            <th class="th-ordenable" @click="cambiarOrden('limite_credito')">
              Límite crédito <span class="th-ordenable__icono">{{ iconoOrden('limite_credito') }}</span>
            </th>
            <th class="th-ordenable" @click="cambiarOrden('estado')">
              Estado <span class="th-ordenable__icono">{{ iconoOrden('estado') }}</span>
            </th>
            <th class="table__acciones">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cliente in datosPaginados" :key="cliente.id">
            <td>{{ cliente.nombre }} {{ cliente.apellido }}</td>
            <td>{{ cliente.cedula }}</td>
            <td>{{ cliente.telefono || '—' }}</td>
            <td>${{ Number(cliente.limite_credito).toFixed(2) }}</td>
            <td>
              <span class="badge" :class="`badge--${cliente.estado}`">
                {{ cliente.estado }}
              </span>
            </td>
            <td class="table__acciones">
              <button class="btn-icon" title="Editar" @click="abrirModalEditar(cliente)">✏️</button>
              <button
                v-if="authStore.esAdmin() && cliente.estado === 'activo'"
                class="btn-icon btn-icon--danger"
                title="Desactivar"
                @click="confirmarEliminar(cliente)"
              >
                🗑️
              </button>
              <button
                v-if="authStore.esAdmin() && cliente.estado === 'inactivo'"
                class="btn-icon btn-icon--success"
                title="Reactivar"
                @click="reactivarCliente(cliente)"
              >
                ✅
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

    <!-- Modal Crear/Editar -->
    <BaseModal :visible="modalVisible" :titulo="clienteEditando ? 'Editar cliente' : 'Nuevo cliente'" @cerrar="cerrarModal">
      <form class="form-cliente" @submit.prevent="guardarCliente">
        <div class="form-group">
          <label>Nombre</label>
          <input v-model="formulario.nombre" type="text" class="form-control" required />
        </div>
        <div class="form-group">
          <label>Apellido</label>
          <input v-model="formulario.apellido" type="text" class="form-control" required />
        </div>
        <div class="form-group">
          <label>Cédula</label>
          <input v-model="formulario.cedula" type="text" class="form-control" required :disabled="!!clienteEditando" />
        </div>
        <div class="form-group">
          <label>Teléfono</label>
          <input v-model="formulario.telefono" type="text" class="form-control" />
        </div>
        <div class="form-group">
          <label>Dirección</label>
          <input v-model="formulario.direccion" type="text" class="form-control" />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input v-model="formulario.email" type="email" class="form-control" />
        </div>

        <div v-if="authStore.esAdmin() || authStore.esSupervisor()" class="form-group">
          <label>Límite de crédito</label>
          <input v-model.number="formulario.limite_credito" type="number" step="0.01" min="0" class="form-control" />
        </div>
        <p v-else class="nota">
          Solo un administrador o supervisor puede asignar el límite de crédito.
        </p>

        <p v-if="errorMensaje" class="mensaje-error">{{ errorMensaje }}</p>

        <button type="submit" class="btn btn-primary" :disabled="guardando">
          <span v-if="guardando" class="spinner"></span>
          {{ guardando ? 'Guardando...' : 'Guardar' }}
        </button>
      </form>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useClienteStore } from '../stores/clienteStore';
import { useAuthStore } from '../stores/authStore';
import BaseModal from '../components/BaseModal.vue';
import type { Cliente, ClienteFormulario } from '../types/Cliente';
import { useTablaAvanzada } from '../composables/useTablaAvanzada';
import PaginacionControles from '../components/PaginacionControles.vue';

const clienteStore = useClienteStore();
const authStore = useAuthStore();

const { paginaActual, totalPaginas, datosPaginados, cambiarOrden, irAPagina, iconoOrden } =
  useTablaAvanzada(computed(() => clienteStore.clientes));

const busqueda = ref('');
const modalVisible = ref(false);
const clienteEditando = ref<Cliente | null>(null);
const guardando = ref(false);
const errorMensaje = ref('');

const formularioVacio = (): ClienteFormulario => ({
  nombre: '',
  apellido: '',
  cedula: '',
  telefono: '',
  direccion: '',
  email: '',
  limite_credito: 0,
});

const formulario = ref<ClienteFormulario>({ ...formularioVacio() });

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
  formulario.value = { ...formularioVacio() };
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
    const datosLimpios: ClienteFormulario = {
      nombre: formulario.value.nombre,
      apellido: formulario.value.apellido,
      cedula: formulario.value.cedula,
      telefono: formulario.value.telefono || undefined,
      direccion: formulario.value.direccion || undefined,
      email: formulario.value.email || undefined,
      limite_credito: formulario.value.limite_credito,
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

  &__filtros {
    margin-bottom: 1.5rem;
  }
}

.campo-busqueda {
  display: flex;
  align-items: center;
  background: var(--color-fondo-tarjeta, #ffffff);
  border: 2px solid var(--color-borde, rgba(0, 0, 0, 0.06));
  border-radius: 12px;
  padding: 0 0.9rem;
  transition: all 0.3s;
  max-width: 400px;

  &:focus-within {
    border-color: #6c5ce7;
    box-shadow: 0 0 0 4px rgba(108, 92, 231, 0.1);
  }

  &__icono {
    font-size: 0.9rem;
    opacity: 0.5;
  }

  &__input {
    flex: 1;
    padding: 0.7rem 0.8rem;
    border: none;
    background: transparent;
    font-size: 0.9rem;
    color: var(--color-texto-primario, #1a1a2e);
    outline: none;
    min-width: 0;

    &::placeholder {
      color: var(--color-texto-secundario, #9ca3af);
      opacity: 0.6;
    }
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
  width: 24px;
  height: 24px;
  border: 3px solid var(--color-borde, #e5e7eb);
  border-top-color: #6c5ce7;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
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

.table__acciones {
  display: flex;
  gap: 0.3rem;
  justify-content: flex-end;
}

.badge {
  display: inline-block;
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: capitalize;

  &--activo {
    background: rgba(0, 184, 148, 0.12);
    color: #00b894;
  }

  &--inactivo {
    background: rgba(225, 112, 85, 0.12);
    color: #e17055;
  }
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.25rem 0.4rem;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: var(--color-borde, rgba(0, 0, 0, 0.06));
    transform: scale(1.1);
  }

  &--danger:hover {
    background: rgba(225, 112, 85, 0.1);
  }

  &--success:hover {
    background: rgba(0, 184, 148, 0.1);
  }
}

.form-cliente {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.nota {
  font-size: 0.8rem;
  color: var(--color-texto-claro, #9ca3af);
  font-style: italic;
  margin: 0;
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