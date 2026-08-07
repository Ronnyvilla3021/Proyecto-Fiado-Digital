<template>
  <div class="login-page">
    <div class="login-card">
      <div v-if="verificando" class="mensaje-estado">
        <p>Verificando tu cuenta...</p>
      </div>

      <div v-else-if="exito" class="mensaje-exito">
        <p>✅ ¡Cuenta verificada correctamente!</p>
        <p>Ya puedes iniciar sesión.</p>
        <RouterLink to="/login" class="boton-primario boton-link">Ir al login</RouterLink>
      </div>

      <div v-else class="mensaje-error-caja">
        <p>❌ No pudimos verificar tu cuenta</p>
        <p>{{ errorMensaje }}</p>
        <RouterLink to="/login" class="boton-primario boton-link">Volver al login</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../services/api';

const route = useRoute();
const verificando = ref(true);
const exito = ref(false);
const errorMensaje = ref('');

onMounted(async () => {
  const token = route.params.token as string;
  try {
    await api.get(`/auth/verificar-email/${token}`);
    exito.value = true;
  } catch (error: any) {
    errorMensaje.value = error.response?.data?.error || 'El enlace es inválido o ya fue usado.';
  } finally {
    verificando.value = false;
  }
});
</script>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f4f6f8;
}

.login-card {
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 380px;
  text-align: center;
}

.mensaje-estado p {
  color: #6b7280;
}

.mensaje-exito {
  p:first-child {
    font-size: 1.1rem;
    font-weight: 600;
    color: #16a34a;
    margin-bottom: 0.5rem;
  }
}

.mensaje-error-caja {
  p:first-child {
    font-size: 1.1rem;
    font-weight: 600;
    color: #dc2626;
    margin-bottom: 0.5rem;
  }
}

.boton-primario {
  display: inline-block;
  background: #4f46e5;
  color: white;
  border: none;
  padding: 0.65rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
  text-decoration: none;
  font-size: 0.9rem;
}
</style>