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

/* ============ BOTÓN CAMPANA ============ */
.campana-boton {
  position: relative;
  background: transparent;
  border: 1px solid transparent;
  padding: 0.5rem 0.65rem;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.22s ease, color 0.22s ease,
    transform 0.22s ease;
  color: var(--color-texto-secundario);
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;

  &:hover {
    background: var(--color-fondo-hover);
    color: var(--color-texto-primario);
    transform: scale(1.06);
  }

  &:active {
    transform: scale(0.95);
  }

  &--activo {
    background: var(--color-fondo-hover);
    color: var(--color-texto-primario);
  }

  &__icono {
    font-size: 1.15rem;
    display: block;
    line-height: 1;
  }
}

/* ============ BADGE ============ */
.campana-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background: linear-gradient(135deg, #e17055, #dc2626);
  color: #ffffff;
  font-size: 0.6rem;
  font-weight: 800;
  padding: 0.1rem 0.35rem;
  border-radius: 999px;
  min-width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  line-height: 1;
  letter-spacing: 0.02em;
  box-shadow: 0 0 0 2px var(--color-fondo-tarjeta, #ffffff),
    0 2px 6px rgba(220, 38, 38, 0.4);
  animation: badgePulse 2s ease-in-out infinite;
}

@keyframes badgePulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 2px var(--color-fondo-tarjeta, #ffffff),
      0 2px 6px rgba(220, 38, 38, 0.4);
  }
  50% {
    transform: scale(1.08);
    box-shadow: 0 0 0 2px var(--color-fondo-tarjeta, #ffffff),
      0 4px 12px rgba(220, 38, 38, 0.6);
  }
}

/* ============ PANEL ============ */
.campana-panel {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 400px;
  max-height: 500px;
  display: flex;
  flex-direction: column;
  background: var(--color-fondo-tarjeta);
  color: var(--color-texto-primario);
  border-radius: 18px;
  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.18),
    0 6px 16px rgba(0, 0, 0, 0.08);
  z-index: 100;
  border: 1px solid var(--color-borde);
  overflow: hidden;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.1rem 1.25rem;
    border-bottom: 1px solid var(--color-borde);
    gap: 0.75rem;
    flex-shrink: 0;
    background: var(--color-fondo-tarjeta);

    h3 {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 800;
      color: var(--color-texto-primario);
      letter-spacing: -0.01em;
    }
  }

  &__limpiar {
    background: transparent;
    border: none;
    color: var(--color-primario, #6c5ce7);
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
    padding: 0.35rem 0.65rem;
    border-radius: 8px;
    transition: background 0.2s ease, transform 0.2s ease;
    white-space: nowrap;
    font-family: inherit;

    &:hover {
      background: rgba(108, 92, 231, 0.12);
    }

    &:active {
      transform: scale(0.96);
    }
  }
}

/* ============ ESTADO VACÍO ============ */
.campana-vacio {
  padding: 3rem 1.25rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;

  &__icono {
    font-size: 2.75rem;
    display: block;
    margin-bottom: 0.35rem;
    animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }

  p {
    margin: 0;
    font-size: 0.92rem;
    font-weight: 700;
    color: var(--color-texto-primario);
  }

  &__sub {
    font-size: 0.8rem;
    color: var(--color-texto-secundario);
    font-weight: 400;
  }
}

@keyframes popIn {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* ============ LISTA ============ */
.campana-lista {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  flex: 1;

  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--color-borde-fuerte, rgba(0, 0, 0, 0.15));
    border-radius: 999px;
  }
}

.campana-item {
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
  padding: 0.85rem 1.25rem;
  border-bottom: 1px solid var(--color-borde);
  transition: background 0.2s ease;
  position: relative;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--color-fondo-hover);

    .campana-item__borrar {
      opacity: 1;
      transform: scale(1);
    }
  }

  &--no-leida {
    background: rgba(108, 92, 231, 0.06);

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: linear-gradient(180deg, #6c5ce7, #a29bfe);
      border-radius: 0 3px 3px 0;
    }

    .campana-item__titulo {
      font-weight: 800;
      color: var(--color-texto-primario);
    }
  }

  &__contenido {
    display: flex;
    gap: 0.8rem;
    flex: 1;
    min-width: 0;
    cursor: pointer;
    align-items: flex-start;
  }

  &__icono {
    font-size: 1.15rem;
    flex-shrink: 0;
    margin-top: 0.1rem;
    line-height: 1;
  }

  &__texto {
    min-width: 0;
    flex: 1;
  }

  &__titulo {
    margin: 0;
    font-size: 0.86rem;
    font-weight: 600;
    color: var(--color-texto-primario);
    line-height: 1.35;
  }

  &__mensaje {
    margin: 0.2rem 0 0;
    font-size: 0.8rem;
    color: var(--color-texto-secundario);
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__fecha {
    margin: 0.35rem 0 0;
    font-size: 0.68rem;
    color: var(--color-texto-claro);
    font-weight: 500;
    letter-spacing: 0.01em;
  }

  &__borrar {
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 0.8rem;
    opacity: 0;
    transform: scale(0.8);
    transition: opacity 0.2s ease, transform 0.2s ease,
      background 0.2s ease, color 0.2s ease;
    padding: 0.3rem;
    border-radius: 6px;
    color: var(--color-texto-secundario);
    flex-shrink: 0;
    margin-top: 0.1rem;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: inherit;
    width: 24px;
    height: 24px;

    &:hover {
      background: rgba(225, 112, 85, 0.14);
      color: #dc2626;
      opacity: 1 !important;
      transform: scale(1.05) !important;
    }

    &:active {
      transform: scale(0.95) !important;
    }
  }
}

/* ============ TRANSICIÓN PANEL ============ */
.panel-enter-active {
  transition: opacity 0.25s ease, transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.panel-leave-active {
  transition: opacity 0.18s ease, transform 0.2s ease;
}

.panel-enter-from,
.panel-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.97);
  transform-origin: top right;
}

/* ============ RESPONSIVE ============ */
@media (max-width: 480px) {
  .campana-panel {
    position: fixed;
    top: 68px;
    left: 0.75rem;
    right: 0.75rem;
    width: auto;
    max-height: calc(100vh - 90px);
    border-radius: 16px;
  }

  .campana-item {
    padding: 0.75rem 1rem;

    &__borrar {
      opacity: 0.6;
      transform: scale(1);
    }
  }
}

/* ============ MODO OSCURO ============ */
[data-theme='dark'] {
  .campana-badge {
    box-shadow: 0 0 0 2px var(--color-fondo-tarjeta),
      0 2px 6px rgba(220, 38, 38, 0.6);
  }

  .campana-panel {
    box-shadow:
      0 20px 50px rgba(0, 0, 0, 0.5),
      0 6px 16px rgba(0, 0, 0, 0.3);

    &__header {
      background: var(--color-fondo-tarjeta);
    }
  }

  .campana-item {
    &--no-leida {
      background: rgba(108, 92, 231, 0.14);

      &::before {
        background: linear-gradient(180deg, #a29bfe, #6c5ce7);
      }
    }

    &__borrar {
      &:hover {
        background: rgba(225, 112, 85, 0.2);
        color: #f87171;
      }
    }
  }
}
</style>