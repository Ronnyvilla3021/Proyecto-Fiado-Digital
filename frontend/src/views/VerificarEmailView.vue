<template>
  <div class="verificar-page">
    <div class="verificar-card">
      <div v-if="verificando" class="mensaje-estado">
        <span class="mensaje-estado__icono">⏳</span>
        <h3>Verificando tu cuenta...</h3>
        <p>Por favor espera un momento</p>
        <div class="spinner"></div>
      </div>

      <div v-else-if="exito" class="mensaje-exito">
        <span class="mensaje-exito__icono">✅</span>
        <h3>¡Cuenta verificada correctamente!</h3>
        <p>Ya puedes iniciar sesión y comenzar a usar Fiado Digital.</p>
        <RouterLink to="/login" class="btn btn-primary">Ir al login</RouterLink>
      </div>

      <div v-else class="mensaje-error-caja">
        <span class="mensaje-error-caja__icono">❌</span>
        <h3>No pudimos verificar tu cuenta</h3>
        <p>{{ errorMensaje }}</p>
        <RouterLink to="/login" class="btn btn-outline">Volver al login</RouterLink>
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
.verificar-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0f2f6 0%, #e8ecf1 100%);
  padding: 1rem;
}

.verificar-card {
  background: var(--color-fondo-tarjeta, #ffffff);
  padding: 2.5rem;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 420px;
  border: 1px solid var(--color-borde, rgba(0, 0, 0, 0.04));
  text-align: center;
}

.mensaje-estado {
  &__icono {
    font-size: 3rem;
    display: block;
    margin-bottom: 0.5rem;
  }

  h3 {
    font-size: 1.1rem;
    font-weight: 700;
    margin: 0 0 0.25rem;
  }

  p {
    color: var(--color-texto-secundario, #6b7280);
    margin: 0 0 1rem;
  }
}

.spinner {
  display: inline-block;
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-borde, #e5e7eb);
  border-top-color: #6c5ce7;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.mensaje-exito {
  &__icono {
    font-size: 3rem;
    display: block;
    margin-bottom: 0.5rem;
  }

  h3 {
    font-size: 1.1rem;
    font-weight: 700;
    color: #00b894;
    margin: 0 0 0.5rem;
  }

  p {
    color: var(--color-texto-secundario, #6b7280);
    line-height: 1.5;
    margin-bottom: 1.5rem;
  }
}

.mensaje-error-caja {
  &__icono {
    font-size: 3rem;
    display: block;
    margin-bottom: 0.5rem;
  }

  h3 {
    font-size: 1.1rem;
    font-weight: 700;
    color: #e17055;
    margin: 0 0 0.5rem;
  }

  p {
    color: var(--color-texto-secundario, #6b7280);
    line-height: 1.5;
    margin-bottom: 1.5rem;
  }
}
</style>