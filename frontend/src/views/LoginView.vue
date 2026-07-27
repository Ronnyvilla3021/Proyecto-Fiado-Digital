<template>
  <div class="login-page">
    <div class="login-card">
      <h1 class="login-card__titulo">Fiado Digital</h1>
      <p class="login-card__subtitulo">Inicia sesión para continuar</p>

      <form class="login-form" @submit.prevent="manejarLogin">
        <div class="campo">
          <label for="email">Correo electrónico</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="tucorreo@ejemplo.com"
            required
          />
        </div>

        <div class="campo">
          <label for="password">Contraseña</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            required
          />
        </div>

        <p v-if="errorMensaje" class="mensaje-error">{{ errorMensaje }}</p>

        <button type="submit" class="boton-primario" :disabled="cargando">
          {{ cargando ? 'Ingresando...' : 'Iniciar sesión' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { login } from '../services/authService';
import { useAuthStore } from '../stores/authStore';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const cargando = ref(false);
const errorMensaje = ref('');

const manejarLogin = async () => {
  errorMensaje.value = '';
  cargando.value = true;

  try {
    const respuesta = await login(email.value, password.value);
    authStore.setSesion(respuesta.token, respuesta.usuario);
    router.push({ name: 'dashboard' });
  } catch (error: any) {
    errorMensaje.value = error.response?.data?.error || 'Error al iniciar sesión';
  } finally {
    cargando.value = false;
  }
};
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

  &__titulo {
    font-size: 1.6rem;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 0.25rem;
    text-align: center;
  }

  &__subtitulo {
    color: #6b7280;
    font-size: 0.9rem;
    text-align: center;
    margin-bottom: 1.5rem;
  }
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;

  label {
    font-size: 0.85rem;
    font-weight: 600;
    color: #374151;
  }

  input {
    padding: 0.65rem 0.85rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 0.95rem;

    &:focus {
      outline: none;
      border-color: #4f46e5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
    }
  }
}

.mensaje-error {
  color: #dc2626;
  font-size: 0.85rem;
  background: #fef2f2;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
}

.boton-primario {
  background: #4f46e5;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: #4338ca;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}
</style>