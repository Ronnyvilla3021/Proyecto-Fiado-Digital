<template>
  <div class="campana-wrapper">
    <button class="campana-boton" @click="abierto = !abierto">
      🔔
      <span v-if="notificacionStore.noLeidas > 0" class="campana-badge">
        {{ notificacionStore.noLeidas }}
      </span>
    </button>

    <div v-if="abierto" class="campana-panel">
      <div class="campana-panel__header">
        <h3>Notificaciones</h3>
      </div>

      <div v-if="notificacionStore.notificaciones.length === 0" class="campana-vacio">
        No tienes notificaciones.
      </div>

      <div v-else class="campana-lista">
        <div
  v-for="noti in notificacionStore.notificaciones"
  :key="noti.id"
  class="campana-item"
  :class="{ 'campana-item--no-leida': !noti.leida }"
>
  <div class="campana-item__contenido" @click="marcarLeida(noti)">
    <span class="campana-item__icono">{{ iconoPorTipo(noti.tipo) }}</span>
    <div class="campana-item__texto">
      <p class="campana-item__titulo">{{ noti.titulo }}</p>
      <p class="campana-item__mensaje">{{ noti.mensaje }}</p>
      <p class="campana-item__fecha">{{ formatearFecha(noti.createdAt) }}</p>
    </div>
  </div>
  <button class="campana-item__borrar" title="Eliminar" @click.stop="eliminarNoti(noti.id)">
    🗑️
  </button>
</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useNotificacionStore } from '../stores/notificacionStore';
import { socket } from '../services/socket';
import type { Notificacion } from '../types/Notificacion';
import { useRouter } from 'vue-router';

const notificacionStore = useNotificacionStore();
const abierto = ref(false);
const router = useRouter();

const iconoPorTipo = (tipo: Notificacion['tipo']) => {
  const iconos = {
    cobro_pendiente: '⏰',
    mora: '⚠️',
    resumen_diario: '📊',
    sistema: '🔔',
  };
  return iconos[tipo] || '🔔';
};

const formatearFecha = (fecha: string) =>
  new Date(fecha).toLocaleString('es-EC', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

const marcarLeida = (noti: Notificacion) => {
  if (!noti.leida) {
    notificacionStore.marcarComoLeida(noti.id);
  }

  // Redirige según el tipo de notificación, si aplica
  if (noti.tipo === 'cobro_pendiente' || noti.tipo === 'mora') {
    const estadoFiltro = noti.tipo === 'mora' ? 'vencido' : 'pendiente';
    router.push({ name: 'creditos', query: { estado: estadoFiltro } });
    abierto.value = false;
  }
  // 'resumen_diario' y 'sistema' no navegan a ningún lado, son solo informativas
};

const eliminarNoti = (id: number) => {
  notificacionStore.eliminar(id);
};

const recibirNotificacion = (noti: Notificacion) => {
  notificacionStore.agregarNotificacion(noti);
};

// Cierra el panel si se hace click fuera de él
const cerrarSiEsFuera = (evento: MouseEvent) => {
  const objetivo = evento.target as HTMLElement;
  if (!objetivo.closest('.campana-wrapper')) {
    abierto.value = false;
  }
};

onMounted(() => {
  notificacionStore.cargarNotificaciones();
  socket.on('nueva-notificacion', recibirNotificacion);
  document.addEventListener('click', cerrarSiEsFuera);
});

onUnmounted(() => {
  socket.off('nueva-notificacion', recibirNotificacion);
  document.removeEventListener('click', cerrarSiEsFuera);
});
</script>

<style scoped lang="scss">
.campana-wrapper {
  position: relative;
}

.campana-boton {
  background: none;
  border: none;
  font-size: 1.15rem;
  cursor: pointer;
  padding: 0.4rem;
  border-radius: 6px;
  position: relative;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
}

.campana-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: #dc2626;
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.1rem 0.35rem;
  border-radius: 999px;
  min-width: 16px;
  text-align: center;
}

.campana-panel {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 340px;
  max-height: 420px;
  overflow-y: auto;
  background: var(--color-fondo-tarjeta, white);
  color: inherit;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 100;

  &__header {
    padding: 0.9rem 1.1rem;
    border-bottom: 1px solid var(--color-borde, #eee);

    h3 {
      margin: 0;
      font-size: 0.95rem;
    }
  }
}

.campana-vacio {
  padding: 2rem 1rem;
  text-align: center;
  font-size: 0.85rem;
  color: var(--color-texto-secundario, #6b7280);
}

.campana-lista {
  display: flex;
  flex-direction: column;
}

.campana-item {
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
  padding: 0.8rem 1.1rem;
  border-bottom: 1px solid var(--color-borde, #f3f4f6);
  transition: background 0.15s;

  &:hover {
    background: rgba(79, 70, 229, 0.05);

    .campana-item__borrar {
      opacity: 1;
    }
  }

  &--no-leida {
    background: rgba(79, 70, 229, 0.06);

    .campana-item__titulo {
      font-weight: 700;
    }
  }

  &__contenido {
    display: flex;
    gap: 0.7rem;
    flex: 1;
    min-width: 0;
    cursor: pointer;
  }

  &__icono {
    font-size: 1.1rem;
    flex-shrink: 0;
  }

  &__texto {
    min-width: 0;
  }

  &__titulo {
    margin: 0;
    font-size: 0.85rem;
    font-weight: 600;
  }

  &__mensaje {
    margin: 0.15rem 0 0;
    font-size: 0.8rem;
    color: var(--color-texto-secundario, #6b7280);
    line-height: 1.35;
  }

  &__fecha {
    margin: 0.3rem 0 0;
    font-size: 0.7rem;
    color: var(--color-texto-secundario, #9ca3af);
  }

  &__borrar {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.85rem;
    opacity: 0;
    transition: opacity 0.15s;
    flex-shrink: 0;
    padding: 0.2rem;

    &:hover {
      opacity: 1 !important;
    }
  }
}
</style>