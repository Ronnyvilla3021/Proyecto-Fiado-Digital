<template>
  <div class="auditoria-view">
    <div class="auditoria-view__header">
      <div>
        <h1 class="auditoria-view__titulo">Auditoría</h1>
        <p class="auditoria-view__subtitulo">Historial de acciones sensibles realizadas en el sistema</p>
      </div>
    </div>

    <div class="filtros">
      <select v-model="filtroEntidad" class="form-control" @change="cargar">
        <option value="">Todas las entidades</option>
        <option value="cliente">Clientes</option>
        <option value="venta">Ventas</option>
        <option value="credito">Créditos</option>
      </select>

      <select v-model="filtroAccion" class="form-control" @change="cargar">
        <option value="">Todas las acciones</option>
        <option value="crear">Crear</option>
        <option value="editar">Editar</option>
        <option value="desactivar">Desactivar</option>
        <option value="reactivar">Reactivar</option>
        <option value="pago">Pago</option>
      </select>
    </div>

    <div v-if="cargando" class="estado-info">
      <span class="spinner"></span>
      Cargando historial...
    </div>
    <div v-else-if="registros.length === 0" class="estado-info">
      <span class="estado-info__icono">📭</span>
      <p>No hay registros de auditoría con estos filtros</p>
    </div>

    <div v-else class="linea-tiempo">
      <div v-for="registro in registros" :key="registro.id" class="evento fade-in">
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
                <span class="cambio__campo">{{ campo }}:</span>
                <span class="cambio__antes">{{ cambio.antes }}</span>
                <span class="cambio__flecha">→</span>
                <span class="cambio__despues">{{ cambio.despues }}</span>
              </template>
              <template v-else>
                <span class="cambio__campo">{{ campo }}:</span>
                <span>{{ cambio }}</span>
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
  new Date(fecha).toLocaleString('es-EC', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });

const esCambioAntesDespues = (valor: any): valor is { antes: any; despues: any } =>
  valor && typeof valor === 'object' && 'antes' in valor && 'despues' in valor;
</script>

<style scoped lang="scss">
.auditoria-view {
  &__header {
    margin-bottom: 1.5rem;
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
  gap: 0.6rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;

  .form-control {
    max-width: 200px;
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

.linea-tiempo {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.evento {
  display: flex;
  gap: 0.9rem;
  background: var(--color-fondo-tarjeta, #ffffff);
  border-radius: 14px;
  padding: 1rem 1.25rem;
  border: 1px solid var(--color-borde, rgba(0, 0, 0, 0.04));
  transition: all 0.3s;
  animation: fadeIn 0.4s ease-out;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
    transform: translateX(4px);
  }

  &__icono {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    flex-shrink: 0;
    background: rgba(108, 92, 231, 0.1);

    &--desactivar {
      background: rgba(225, 112, 85, 0.1);
    }

    &--reactivar,
    &--pago {
      background: rgba(0, 184, 148, 0.1);
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
    color: var(--color-texto-claro, #9ca3af);
    margin-left: auto;
  }

  &__descripcion {
    margin: 0;
    font-size: 0.88rem;
  }

  &__detalles {
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid var(--color-borde, rgba(0, 0, 0, 0.04));
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }
}

.cambio {
  font-size: 0.8rem;
  color: var(--color-texto-secundario, #6b7280);
  display: flex;
  align-items: center;
  gap: 0.3rem;
  flex-wrap: wrap;

  &__campo {
    font-weight: 600;
    text-transform: capitalize;
    color: var(--color-texto-primario, #1a1a2e);
  }

  &__antes {
    background: rgba(225, 112, 85, 0.08);
    padding: 0.05rem 0.4rem;
    border-radius: 4px;
    color: #e17055;
    font-size: 0.75rem;
    text-decoration: line-through;
  }

  &__flecha {
    color: var(--color-texto-claro, #9ca3af);
  }

  &__despues {
    background: rgba(0, 184, 148, 0.08);
    padding: 0.05rem 0.4rem;
    border-radius: 4px;
    color: #00b894;
    font-size: 0.75rem;
    font-weight: 600;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>