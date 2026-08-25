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
  padding: 0.75rem;

  &__info {
    font-size: 0.85rem;
    color: var(--color-texto-secundario, #6b7280);
  }
}
</style>