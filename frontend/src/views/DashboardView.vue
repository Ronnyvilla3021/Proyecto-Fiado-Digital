<template>
  <div>
    <h1>Dashboard</h1>
    <p>Bienvenido, {{ authStore.usuario?.nombre }} 👋</p>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore();
</script>