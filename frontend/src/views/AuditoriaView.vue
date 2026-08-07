<template>
  <div class="auditoria-view">
    <h1>Auditoría</h1>
    <p class="descripcion">Historial de acciones sensibles realizadas en el sistema.</p>

    <div class="filtros">
      <select v-model="filtroEntidad" @change="cargar">
        <option value="">Todas las entidades</option>
        <option value="cliente">Clientes</option>
        <option value="venta">Ventas</option>
        <option value="credito">Créditos</option>
      </select>

      <select v-model="filtroAccion" @change="cargar">
        <option value="">Todas las acciones</option>
        <option value="crear">Crear</option>
        <option value="editar">Editar</option>
        <option value="desactivar">Desactivar</option>
        <option value="reactivar">Reactivar</option>
        <option value="pago">Pago</option>
      </select>
    </div>

    <div v-if="cargando" class="estado-info">Cargando historial...</div>
    <div v-else-if="registros.length === 0" class="estado-info">
      No hay registros de auditoría con estos filtros.
    </div>

    <div v-else class="linea-tiempo">
      <div v-for="registro in registros" :key="registro.id" class="evento">
        <div class="evento__icono" :class="`evento__icono--${registro.accion}`">
          {{ iconoPorAccion(registro.accion) }}
        </div>

        <div class="evento__contenido">
          <div class="evento__cabecera">
            <span class="evento__usuario">{{ registro.Usuario?.nombre || 'Sistema' }}</span>
            <span class="evento__rol" v-if="registro.Usuario">({{ registro.Usuario.rol }})</span>
            <span class="evento__fecha">{{ formatearFecha(registro.createdAt) }}</span>
          </div>

          <p class="evento__descripcion">{{ registro.descripcion }}</p>

          <div v-if="registro.detalles" class="evento__detalles">
            <div v-for="(cambio, campo) in registro.detalles" :key="campo" class="cambio">
              <template v-if="esCambioAntesDespues(cambio)">
                <strong>{{ campo }}:</strong> {{ cambio.antes }} → {{ cambio.despues }}
              </template>
              <template v-else>
                <strong>{{ campo }}:</strong> {{ cambio }}
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import * as auditoriaService from '../services/auditoriaService';
import type { RegistroAuditoria } from '../types/Auditoria';

const registros = ref<RegistroAuditoria[]>([]);
const cargando = ref(false);
const filtroEntidad = ref('');
const filtroAccion = ref('');

const cargar = async () => {
  cargando.value = true;
  try {
    registros.value = await auditoriaService.listarAuditoria({
      entidad: filtroEntidad.value || undefined,
      accion: filtroAccion.value || undefined,
    });
  } finally {
    cargando.value = false;
  }
};

onMounted(cargar);

const iconoPorAccion = (accion: RegistroAuditoria['accion']) => {
  const iconos = {
    crear: '➕',
    editar: '✏️',
    desactivar: '🚫',
    reactivar: '✅',
    pago: '💰',
  };
  return iconos[accion] || '📝';
};

const formatearFecha = (fecha: string) =>
  new Date(fecha).toLocaleString('es-EC', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const esCambioAntesDespues = (valor: any): valor is { antes: any; despues: any } =>
  valor && typeof valor === 'object' && 'antes' in valor && 'despues' in valor;
</script>

<style scoped lang="scss">
.auditoria-view {
  h1 {
    font-size: 1.4rem;
    font-weight: 700;
    margin-bottom: 0.2rem;
  }
}

.descripcion {
  color: var(--color-texto-secundario, #6b7280);
  margin-bottom: 1.25rem;
}

.filtros {
  display: flex;
  gap: 0.6rem;
  margin-bottom: 1.5rem;

  select {
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--color-borde);
    border-radius: 8px;
    font-size: 0.85rem;
    background: var(--color-input-fondo, white);
    color: inherit;
  }
}

.estado-info {
  padding: 2rem;
  text-align: center;
  color: var(--color-texto-secundario, #6b7280);
}

.linea-tiempo {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.evento {
  display: flex;
  gap: 0.9rem;
  background: var(--color-fondo-tarjeta);
  border-radius: 10px;
  padding: 1rem 1.1rem;

  &__icono {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    flex-shrink: 0;
    background: rgba(79, 70, 229, 0.1);

    &--desactivar {
      background: rgba(220, 38, 38, 0.1);
    }

    &--reactivar,
    &--pago {
      background: rgba(22, 163, 74, 0.1);
    }
  }

  &__contenido {
    flex: 1;
    min-width: 0;
  }

  &__cabecera {
    display: flex;
    align-items: baseline;
    gap: 0.4rem;
    flex-wrap: wrap;
    margin-bottom: 0.2rem;
  }

  &__usuario {
    font-weight: 700;
    font-size: 0.88rem;
  }

  &__rol {
    font-size: 0.75rem;
    color: var(--color-texto-secundario, #6b7280);
    text-transform: capitalize;
  }

  &__fecha {
    font-size: 0.75rem;
    color: var(--color-texto-secundario, #9ca3af);
    margin-left: auto;
  }

  &__descripcion {
    margin: 0;
    font-size: 0.88rem;
  }

  &__detalles {
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid var(--color-borde);
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }
}

.cambio {
  font-size: 0.8rem;
  color: var(--color-texto-secundario, #6b7280);

  strong {
    color: inherit;
    text-transform: capitalize;
  }
}
</style>