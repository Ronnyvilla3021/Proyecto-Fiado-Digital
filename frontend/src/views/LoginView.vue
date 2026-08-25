<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-card__header">
        <!-- LOGO IMPLEMENTADO -->
        <img src="../assets/logo.png.png" alt="Fiado Digital" class="login-card__logo-img" />
        
        <h1 class="login-card__titulo">Bienvenido de vuelta</h1>
        <p class="login-card__subtitulo">Inicia sesión para continuar</p>
      </div>

      <form class="login-form" @submit.prevent="manejarLogin">
        <div class="campo">
          <label for="email">Correo electrónico</label>
          <div class="campo__input-wrapper">
            <span class="campo__icono">📧</span>
            <input
              id="email"
              v-model="email"
              type="email"
              placeholder="tucorreo@ejemplo.com"
              required
              autocomplete="email"
            />
          </div>
        </div>

        <div class="campo">
          <label for="password">Contraseña</label>
          <div class="campo__input-wrapper">
            <span class="campo__icono">🔒</span>
            <input
              id="password"
              v-model="password"
              :type="mostrarPassword ? 'text' : 'password'"
              placeholder="••••••••"
              required
              autocomplete="current-password"
            />
            <button
              type="button"
              class="campo__toggle"
              @click="mostrarPassword = !mostrarPassword"
            >
              {{ mostrarPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
        </div>

        <p v-if="errorMensaje" class="mensaje-error">{{ errorMensaje }}</p>

        <button type="submit" class="btn btn-primary btn-lg" :disabled="cargando">
          <span v-if="cargando" class="spinner"></span>
          {{ cargando ? 'Ingresando...' : 'Iniciar sesión' }}
        </button>
      </form>

      <div class="login-card__footer">
        <p class="login-card__link">
          ¿No tienes cuenta? <RouterLink to="/registro">Regístrate aquí</RouterLink>
        </p>
      </div>
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
const mostrarPassword = ref(false);

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
  background: linear-gradient(135deg, #f0f2f6 0%, #e8ecf1 100%);
  padding: 1rem;
}

.login-card {
  background: var(--color-fondo-tarjeta, #ffffff);
  padding: 2.5rem;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 400px;
  border: 1px solid var(--color-borde, rgba(0, 0, 0, 0.04));
  transition: all 0.3s;

  &__header {
    text-align: center;
    margin-bottom: 2rem;
  }

  /* ESTILO NUEVO PARA LA IMAGEN DEL LOGO */
  &__logo-img {
    width: 100%;
    max-width: 200px;
    height: auto;
    object-fit: contain;
    margin-bottom: 1.5rem;
  }

  &__titulo {
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--color-texto-primario, #1a1a2e);
    margin: 0 0 0.25rem;
  }

  &__subtitulo {
    color: var(--color-texto-secundario, #6b7280);
    font-size: 0.9rem;
    margin: 0;
  }

  &__footer {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--color-borde, rgba(0, 0, 0, 0.06));
  }

  &__link {
    text-align: center;
    font-size: 0.85rem;
    color: var(--color-texto-secundario, #6b7280);
    margin: 0;

    a {
      color: #6c5ce7;
      text-decoration: none;
      font-weight: 600;
      transition: color 0.2s;

      &:hover {
        color: #5a4bd1;
        text-decoration: underline;
      }
    }
  }
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;

  label {
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--color-texto-secundario, #6b7280);
  }

  &__input-wrapper {
    display: flex;
    align-items: center;
    border: 2px solid var(--color-borde, #e5e7eb);
    border-radius: 12px;
    transition: all 0.3s;
    background: var(--color-fondo-input, #f8fafc);

    &:focus-within {
      border-color: #6c5ce7;
      box-shadow: 0 0 0 4px rgba(108, 92, 231, 0.1);
    }
  }

  &__icono {
    padding: 0 0 0 0.9rem;
    font-size: 0.9rem;
    opacity: 0.5;
  }

  input {
    flex: 1;
    padding: 0.7rem 0.8rem;
    border: none;
    background: transparent;
    font-size: 0.95rem;
    color: var(--color-texto-primario, #1a1a2e);
    outline: none;
    min-width: 0;

    &::placeholder {
      color: var(--color-texto-secundario, #9ca3af);
      opacity: 0.6;
    }
  }

  &__toggle {
    background: none;
    border: none;
    padding: 0 0.9rem;
    cursor: pointer;
    font-size: 0.9rem;
    opacity: 0.5;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.8;
    }
  }
}

.mensaje-error {
  color: #e17055;
  font-size: 0.85rem;
  background: rgba(225, 112, 85, 0.1);
  padding: 0.6rem 0.9rem;
  border-radius: 10px;
  margin: 0;
  border-left: 3px solid #e17055;
}

.spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>