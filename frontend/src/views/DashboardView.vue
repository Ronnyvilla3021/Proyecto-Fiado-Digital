<template>
  <div class="dashboard-temporal">
    <h1>¡Bienvenido, {{ authStore.usuario?.nombre }}! 👋</h1>
    <p>Rol: {{ authStore.usuario?.rol }}</p>
    <button @click="salir">Cerrar sesión</button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

const router = useRouter();
const authStore = useAuthStore();

const salir = () => {
  authStore.cerrarSesion();
  router.push({ name: 'login' });
};
</script>

<style scoped lang="scss">
.dashboard-temporal {
  padding: 2rem;

  button {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    cursor: pointer;
  }
}
</style>