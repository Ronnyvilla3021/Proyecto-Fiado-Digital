<template>
  <Teleport to="body">
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
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-caja {
  background: var(--color-fondo-tarjeta, white);
  color: inherit;
  border-radius: 12px;
  width: 100%;
  max-width: 480px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);

    h2 {
      font-size: 1.1rem;
      font-weight: 700;
    }
  }

  &__cerrar {
    background: none;
    border: none;
    font-size: 1.1rem;
    cursor: pointer;
    color: inherit;
    opacity: 0.6;

    &:hover {
      opacity: 1;
    }
  }

  &__cuerpo {
    padding: 1.5rem;
  }
}
</style>