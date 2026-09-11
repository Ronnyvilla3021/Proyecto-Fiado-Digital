<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="modal-overlay" @click.self="$emit('cerrar')">
        <div class="modal-caja">
          <div class="modal-caja__header">
            <h2>{{ titulo }}</h2>
            <button class="modal-caja__cerrar" @click="$emit('cerrar')">✕</button>
          </div>
          <div class="modal-caja__cuerpo">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean;
  titulo: string;
}>();

defineEmits<{
  cerrar: [];
}>();
</script>

<style scoped lang="scss">
/* ============ OVERLAY ============ */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 12, 25, 0.55);
  backdrop-filter: blur(6px) saturate(140%);
  -webkit-backdrop-filter: blur(6px) saturate(140%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1.25rem;
  overflow-y: auto;
}

/* ============ CAJA ============ */
.modal-caja {
  position: relative;
  background: var(--color-fondo-tarjeta, #ffffff);
  color: var(--color-texto-primario, #1a1a2e);
  border-radius: 20px;
  width: 100%;
  max-width: 540px;
  max-height: calc(100vh - 2.5rem);
  display: flex;
  flex-direction: column;
  box-shadow:
    0 25px 70px rgba(0, 0, 0, 0.35),
    0 10px 24px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  border: 1px solid var(--color-borde, rgba(0, 0, 0, 0.08));
  overflow: hidden;
  animation: modalEntrada 0.32s cubic-bezier(0.22, 1, 0.36, 1);

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.35rem 1.75rem;
    border-bottom: 1px solid var(--color-borde, rgba(0, 0, 0, 0.06));
    flex-shrink: 0;
    gap: 1rem;
    background: var(--color-fondo-tarjeta, #ffffff);

    h2 {
      font-size: 1.15rem;
      font-weight: 800;
      margin: 0;
      letter-spacing: -0.01em;
      background: linear-gradient(135deg, #6c5ce7, #a29bfe);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1.3;
    }
  }

  &__cerrar {
    width: 34px;
    height: 34px;
    border: none;
    border-radius: 50%;
    background: var(--color-fondo-input, #f3f4f6);
    font-size: 0.95rem;
    cursor: pointer;
    color: var(--color-texto-secundario, #6b7280);
    transition: background 0.25s ease, color 0.25s ease,
      transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    line-height: 1;
    font-family: inherit;

    &:hover {
      background: rgba(225, 112, 85, 0.14);
      color: #dc2626;
      transform: rotate(90deg) scale(1.05);
    }

    &:active {
      transform: rotate(90deg) scale(0.95);
    }
  }

  &__cuerpo {
    padding: 1.5rem 1.75rem 1.75rem;
    overflow-y: auto;
    flex: 1;

    /* Scrollbar interna más fina */
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--color-borde-fuerte, rgba(0, 0, 0, 0.15));
      border-radius: 999px;
    }
  }
}

/* ============ ANIMACIÓN DE ENTRADA ============ */
@keyframes modalEntrada {
  from {
    opacity: 0;
    transform: scale(0.94) translateY(24px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* ============ TRANSICIÓN VUE ============ */
.modal-enter-active {
  transition: opacity 0.3s ease;
}

.modal-leave-active {
  transition: opacity 0.22s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;

  .modal-caja {
    transform: scale(0.96) translateY(12px);
    transition: transform 0.22s ease;
  }
}

.modal-enter-to,
.modal-leave-from {
  opacity: 1;
}

/* ============ RESPONSIVE ============ */
@media (max-width: 640px) {
  .modal-overlay {
    padding: 0.75rem;
    align-items: flex-end;
  }

  .modal-caja {
    max-width: 100%;
    max-height: calc(100vh - 1.5rem);
    border-radius: 20px 20px 0 0;
    animation: modalEntradaMovil 0.32s cubic-bezier(0.22, 1, 0.36, 1);

    &__header {
      padding: 1.15rem 1.35rem;

      h2 {
        font-size: 1.05rem;
      }
    }

    &__cuerpo {
      padding: 1.25rem 1.35rem 1.5rem;
    }
  }

  @keyframes modalEntradaMovil {
    from {
      opacity: 0;
      transform: translateY(60px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

/* ============ MODO OSCURO ============ */
[data-theme='dark'] {
  .modal-overlay {
    background: rgba(0, 0, 0, 0.7);
  }

  .modal-caja {
    background: var(--color-fondo-tarjeta);
    border-color: var(--color-borde);
    box-shadow:
      0 25px 70px rgba(0, 0, 0, 0.55),
      0 10px 24px rgba(0, 0, 0, 0.35),
      inset 0 1px 0 rgba(255, 255, 255, 0.04);

    &__header {
      background: var(--color-fondo-tarjeta);
      border-bottom-color: var(--color-borde);
    }

    &__cerrar {
      background: var(--color-fondo-input);
      color: var(--color-texto-secundario);

      &:hover {
        background: rgba(225, 112, 85, 0.2);
        color: #f87171;
      }
    }

    &__cuerpo {
      &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.15);
      }
    }
  }
}
</style>