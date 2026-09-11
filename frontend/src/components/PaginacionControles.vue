<template>
  <div class="paginacion" v-if="totalPaginas > 1">
    <button
      class="btn btn-outline btn-sm"
      :disabled="paginaActual === 1"
      @click="$emit('cambiar', paginaActual - 1)"
    >
      ‹ Anterior
    </button>

    <span class="paginacion__info">Página {{ paginaActual }} de {{ totalPaginas }}</span>

    <button
      class="btn btn-outline btn-sm"
      :disabled="paginaActual === totalPaginas"
      @click="$emit('cambiar', paginaActual + 1)"
    >
      Siguiente ›
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  paginaActual: number;
  totalPaginas: number;
}>();

defineEmits<{
  cambiar: [pagina: number];
}>();
</script>

<style scoped lang="scss">
.paginacion {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
  padding: 1rem 1.25rem;
  background: var(--color-fondo-tarjeta, #ffffff);
  border-top: 1px solid var(--color-borde, rgba(0, 0, 0, 0.06));
  flex-wrap: wrap;

  &__info {
    font-size: 0.84rem;
    font-weight: 600;
    color: var(--color-texto-secundario, #6b7280);
    padding: 0.4rem 0.85rem;
    background: var(--color-fondo-input, #f9fafb);
    border-radius: 999px;
    border: 1px solid var(--color-borde, rgba(0, 0, 0, 0.06));
    letter-spacing: 0.01em;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }

  /* Botones heredados de .btn, refinamiento específico */
  .btn {
    &.btn-outline {
      border: 1.5px solid var(--color-borde-fuerte, #e5e7eb);
      background: var(--color-fondo-tarjeta, #ffffff);
      color: var(--color-texto-primario, #1a1a2e);
      font-weight: 600;
      padding: 0.5rem 1rem;
      border-radius: 10px;
      transition: border-color 0.2s ease, background 0.2s ease,
        color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-family: inherit;
      line-height: 1;

      &:hover:not(:disabled) {
        border-color: var(--color-primario, #6c5ce7);
        color: var(--color-primario, #6c5ce7);
        background: rgba(108, 92, 231, 0.06);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(108, 92, 231, 0.12);
      }

      &:active:not(:disabled) {
        transform: translateY(0);
        box-shadow: none;
      }

      &:disabled {
        opacity: 0.45;
        cursor: not-allowed;
        border-color: var(--color-borde, #e5e7eb);
        color: var(--color-texto-claro, #9ca3af);
        background: var(--color-fondo-input, #f9fafb);
        transform: none;
      }
    }

    &.btn-sm {
      font-size: 0.82rem;
    }
  }
}

/* Responsive */
@media (max-width: 480px) {
  .paginacion {
    gap: 0.6rem;
    padding: 0.85rem 0.75rem;

    &__info {
      font-size: 0.78rem;
      padding: 0.35rem 0.7rem;
      order: -1;
      flex-basis: 100%;
      text-align: center;
    }

    .btn {
      &.btn-outline {
        padding: 0.5rem 0.85rem;
        font-size: 0.78rem;
        flex: 1;
        justify-content: center;
      }
    }
  }
}

/* Modo oscuro */
[data-theme='dark'] {
  .paginacion {
    background: var(--color-fondo-tarjeta);
    border-top-color: var(--color-borde);

    &__info {
      background: var(--color-fondo-input);
      border-color: var(--color-borde);
      color: var(--color-texto-secundario);
    }

    .btn.btn-outline {
      background: var(--color-fondo-tarjeta);
      border-color: var(--color-borde);
      color: var(--color-texto-primario);

      &:hover:not(:disabled) {
        border-color: var(--color-primario);
        color: #a29bfe;
        background: rgba(108, 92, 231, 0.12);
      }

      &:disabled {
        background: var(--color-fondo-input);
        color: var(--color-texto-claro);
        border-color: var(--color-borde);
      }
    }
  }
}
</style>