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
    margin-bottom: 1.75rem;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
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
  gap: 0.75rem;
  margin-bottom: 1.75rem;
  flex-wrap: wrap;
  padding: 0.9rem 1rem;
  background: var(--color-fondo-tarjeta, #ffffff);
  border: 1px solid var(--color-borde, rgba(0, 0, 0, 0.06));
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);

  .form-control {
    max-width: 220px;
    flex: 1 1 180px;
    padding: 0.6rem 0.85rem;
    border: 1.5px solid var(--color-borde, #e5e7eb);
    border-radius: 10px;
    background: var(--color-fondo-input, #f9fafb);
    font-size: 0.88rem;
    font-weight: 500;
    color: var(--color-texto-primario, #1a1a2e);
    cursor: pointer;
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
    appearance: none;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    padding-right: 2.2rem;

    &:hover {
      border-color: var(--color-borde-fuerte, #d1d5db);
      background-color: var(--color-fondo-tarjeta, #ffffff);
    }

    &:focus {
      outline: none;
      border-color: var(--color-primario, #6c5ce7);
      background-color: var(--color-fondo-tarjeta, #ffffff);
      box-shadow: 0 0 0 4px rgba(108, 92, 231, 0.12);
    }
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
  width: 26px;
  height: 26px;
  border: 3px solid var(--color-borde, #e5e7eb);
  border-top-color: var(--color-primario, #6c5ce7);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 0.5rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.linea-tiempo {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  position: relative;
}

.evento {
  display: flex;
  gap: 1rem;
  background: var(--color-fondo-tarjeta, #ffffff);
  border-radius: 16px;
  padding: 1.1rem 1.35rem;
  border: 1px solid var(--color-borde, rgba(0, 0, 0, 0.05));
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
  animation: fadeIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: #6c5ce7;
    opacity: 0;
    transition: opacity 0.25s ease;
  }

  &:hover {
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.07);
    transform: translateX(4px);
    border-color: rgba(108, 92, 231, 0.2);

    &::before {
      opacity: 1;
    }
  }

  &__icono {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.05rem;
    flex-shrink: 0;
    background: rgba(108, 92, 231, 0.12);
    color: #6c5ce7;
    transition: transform 0.25s ease;

    .evento:hover & {
      transform: scale(1.08) rotate(-3deg);
    }

    &--crear {
      background: rgba(108, 92, 231, 0.12);
      color: #6c5ce7;
    }

    &--editar {
      background: rgba(253, 203, 110, 0.18);
      color: #d97706;
    }

    &--desactivar {
      background: rgba(225, 112, 85, 0.14);
      color: #dc2626;
    }

    &--reactivar {
      background: rgba(0, 184, 148, 0.14);
      color: #059669;
    }

    &--pago {
      background: rgba(0, 184, 148, 0.14);
      color: #059669;
    }
  }

  &__contenido {
    flex: 1;
    min-width: 0;
  }

  &__cabecera {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-bottom: 0.35rem;
  }

  &__usuario {
    font-weight: 700;
    font-size: 0.9rem;
    color: var(--color-texto-primario, #1a1a2e);
  }

  &__rol {
    font-size: 0.7rem;
    color: var(--color-texto-secundario, #6b7280);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 600;
    background: var(--color-fondo-input, #f3f4f6);
    padding: 0.15rem 0.55rem;
    border-radius: 999px;
  }

  &__fecha {
    font-size: 0.75rem;
    color: var(--color-texto-claro, #9ca3af);
    margin-left: auto;
    font-weight: 500;
    white-space: nowrap;
  }

  &__descripcion {
    margin: 0;
    font-size: 0.9rem;
    color: var(--color-texto-primario, #374151);
    line-height: 1.5;
  }

  &__detalles {
    margin-top: 0.7rem;
    padding-top: 0.7rem;
    border-top: 1px dashed var(--color-borde, rgba(0, 0, 0, 0.06));
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }
}

.cambio {
  font-size: 0.82rem;
  color: var(--color-texto-secundario, #6b7280);
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
  line-height: 1.4;

  &__campo {
    font-weight: 700;
    text-transform: capitalize;
    color: var(--color-texto-primario, #1a1a2e);
    min-width: 80px;
  }

  &__antes {
    background: rgba(225, 112, 85, 0.1);
    padding: 0.15rem 0.55rem;
    border-radius: 6px;
    color: #dc2626;
    font-size: 0.76rem;
    text-decoration: line-through;
    font-weight: 500;
    border: 1px solid rgba(225, 112, 85, 0.15);
  }

  &__flecha {
    color: var(--color-texto-claro, #9ca3af);
    font-weight: 700;
    font-size: 0.85rem;
  }

  &__despues {
    background: rgba(0, 184, 148, 0.1);
    padding: 0.15rem 0.55rem;
    border-radius: 6px;
    color: #059669;
    font-size: 0.76rem;
    font-weight: 700;
    border: 1px solid rgba(0, 184, 148, 0.18);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 640px) {
  .auditoria-view {
    &__titulo {
      font-size: 1.45rem;
    }
  }

  .filtros {
    padding: 0.75rem;

    .form-control {
      max-width: 100%;
      flex: 1 1 100%;
    }
  }

  .evento {
    padding: 0.95rem 1rem;
    gap: 0.75rem;

    &__icono {
      width: 36px;
      height: 36px;
      font-size: 0.95rem;
      border-radius: 10px;
    }

    &__fecha {
      margin-left: 0;
      flex-basis: 100%;
      margin-top: 0.15rem;
    }

    &__cabecera {
      gap: 0.4rem;
    }
  }

  .cambio {
    &__campo {
      min-width: auto;
    }
  }
}

/* Modo oscuro — usa el atributo real de la app */
[data-theme='dark'] {
  .filtros {
    background: var(--color-fondo-tarjeta);
    border-color: var(--color-borde);

    .form-control {
      background: var(--color-fondo-input);
      border-color: var(--color-borde);
      color: var(--color-texto-primario);

      &:hover {
        border-color: var(--color-borde-fuerte);
        background: var(--color-fondo-input);
      }

      &:focus {
        border-color: var(--color-primario);
        background: var(--color-fondo-input);
      }
    }
  }

  .evento {
    background: var(--color-fondo-tarjeta);
    border-color: var(--color-borde);

    &__usuario { color: var(--color-texto-primario); }

    &__rol {
      background: var(--color-fondo-input);
      color: var(--color-texto-secundario);
    }

    &__descripcion { color: var(--color-texto-primario); }
  }

  .cambio {
    &__campo { color: var(--color-texto-primario); }
  }

  .estado-info {
    background: var(--color-fondo-tarjeta);
    border-color: var(--color-borde);

    p { color: var(--color-texto-secundario); }
  }
}
</style>