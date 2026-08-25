<template>
  <div class="campana-wrapper">
    <button class="campana-boton" @click="abierto = !abierto" :class="{ 'campana-boton--activo': abierto }">
      <span class="campana-boton__icono">🔔</span>
      <span v-if="notificacionStore.noLeidas > 0" class="campana-badge">
        {{ notificacionStore.noLeidas }}
      </span>
    </button>

    <Transition name="panel">
      <div v-if="abierto" class="campana-panel">
        <div class="campana-panel__header">
          <h3>Notificaciones</h3>
          <button
            v-if="notificacionStore.notificaciones.length > 0"
            class="campana-panel__limpiar"
            @click="marcarTodasLeidas"
          >
            Marcar todas como leídas
          </button>
        </div>

        <div v-if="notificacionStore.notificaciones.length === 0" class="campana-vacio">
          <span class="campana-vacio__icono">🎉</span>
          <p>No tienes notificaciones</p>
          <span class="campana-vacio__sub">Todo está al día</span>
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
              ✕
            </button>
          </div>
        </div>
      </div>
    </Transition>
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

  if (noti.tipo === 'cobro_pendiente' || noti.tipo === 'mora') {
    const estadoFiltro = noti.tipo === 'mora' ? 'vencido' : 'pendiente';
    router.push({ name: 'creditos', query: { estado: estadoFiltro } });
    abierto.value = false;
  }
};

const marcarTodasLeidas = () => {
  notificacionStore.notificaciones.forEach(noti => {
    if (!noti.leida) {
      notificacionStore.marcarComoLeida(noti.id);
    }
  });
};

const eliminarNoti = (id: number) => {
  notificacionStore.eliminar(id);
};

const recibirNotificacion = (noti: Notificacion) => {
  notificacionStore.agregarNotificacion(noti);
};

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
  position: relative;
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--color-texto-secundario);

  &:hover {
    background: var(--color-fondo-hover);
    transform: scale(1.05);
  }

  &--activo {
    background: var(--color-fondo-hover);
  }

  &__icono {
    font-size: 1.15rem;
  }
}

.campana-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background: linear-gradient(135deg, #e17055, #d63031);
  color: white;
  font-size: 0.6rem;
  font-weight: 700;
  padding: 0.1rem 0.35rem;
  border-radius: 999px;
  min-width: 18px;
  text-align: center;
  animation: badgePulse 2s ease-in-out infinite;
}

@keyframes badgePulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.campana-panel {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 380px;
  max-height: 480px;
  overflow-y: auto;
  background: var(--color-fondo-tarjeta);
  color: var(--color-texto-primario);
  border-radius: 16px;
  box-shadow: var(--shadow-xl);
  z-index: 100;
  border: 1px solid var(--color-borde);

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--color-borde);

    h3 {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--color-texto-primario);
    }
  }

  &__limpiar {
    background: none;
    border: none;
    color: #6c5ce7;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    transition: all 0.2s;

    &:hover {
      background: rgba(108, 92, 231, 0.12);
    }
  }
}

.campana-vacio {
  padding: 2.5rem 1rem;
  text-align: center;

  &__icono {
    font-size: 2.5rem;
    display: block;
    margin-bottom: 0.5rem;
  }

  p {
    margin: 0;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--color-texto-primario);
  }

  &__sub {
    font-size: 0.8rem;
    color: var(--color-texto-secundario);
  }
}

.campana-lista {
  display: flex;
  flex-direction: column;
}

.campana-item {
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid var(--color-borde);
  transition: all 0.2s;

  &:hover {
    background: var(--color-fondo-hover);

    .campana-item__borrar {
      opacity: 1;
    }
  }

  &--no-leida {
    background: rgba(108, 92, 231, 0.06);
    border-left: 3px solid #6c5ce7;

    .campana-item__titulo {
      font-weight: 700;
    }
  }

  &__contenido {
    display: flex;
    gap: 0.75rem;
    flex: 1;
    min-width: 0;
    cursor: pointer;
  }

  &__icono {
    font-size: 1.1rem;
    flex-shrink: 0;
    margin-top: 0.1rem;
  }

  &__texto {
    min-width: 0;
  }

  &__titulo {
    margin: 0;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--color-texto-primario);
  }

  &__mensaje {
    margin: 0.15rem 0 0;
    font-size: 0.8rem;
    color: var(--color-texto-secundario);
    line-height: 1.35;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__fecha {
    margin: 0.3rem 0 0;
    font-size: 0.65rem;
    color: var(--color-texto-claro);
  }

  &__borrar {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.75rem;
    opacity: 0;
    transition: all 0.2s;
    padding: 0.2rem 0.4rem;
    border-radius: 6px;
    color: var(--color-texto-secundario);
    flex-shrink: 0;
    margin-top: 0.1rem;

    &:hover {
      background: rgba(225, 112, 85, 0.12);
      color: #e17055;
      opacity: 1 !important;
    }
  }
}

/* Transición panel */
.panel-enter-active,
.panel-leave-active {
  transition: all 0.25s ease;
}

.panel-enter-from,
.panel-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.98);
}
</style>