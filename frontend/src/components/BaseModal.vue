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
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-caja {
  background: var(--color-fondo-tarjeta, #ffffff);
  color: inherit;
  border-radius: 20px;
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  border: 1px solid var(--color-borde, rgba(0, 0, 0, 0.06));
  animation: modalEntrada 0.3s ease-out;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--color-borde, rgba(0, 0, 0, 0.06));

    h2 {
      font-size: 1.1rem;
      font-weight: 700;
      margin: 0;
      background: linear-gradient(135deg, #6c5ce7, #a29bfe);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }

  &__cerrar {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 50%;
    background: var(--color-borde, rgba(0, 0, 0, 0.06));
    font-size: 0.9rem;
    cursor: pointer;
    color: var(--color-texto-secundario, #6b7280);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background: rgba(225, 112, 85, 0.15);
      color: #e17055;
      transform: rotate(90deg);
    }
  }

  &__cuerpo {
    padding: 1.5rem;
  }
}

@keyframes modalEntrada {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Transición Vue */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>