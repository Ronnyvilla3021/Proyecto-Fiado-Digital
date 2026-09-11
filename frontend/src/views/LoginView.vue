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
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  background-image: url('/fondo.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(15, 18, 35, 0.78) 0%,
      rgba(30, 25, 70, 0.72) 45%,
      rgba(10, 12, 25, 0.85) 100%
    );
    backdrop-filter: blur(2px);
    z-index: 0;
  }

  &::after {
    content: '';
    position: absolute;
    width: 600px;
    height: 600px;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgba(108, 92, 231, 0.35) 0%,
      transparent 70%
    );
    top: -200px;
    right: -200px;
    z-index: 0;
    pointer-events: none;
  }
}

.login-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
  padding: 2.75rem 2.5rem 2.25rem;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow:
    0 30px 80px rgba(0, 0, 0, 0.35),
    0 8px 24px rgba(0, 0, 0, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  transition: transform 0.35s ease, box-shadow 0.35s ease, background 0.3s ease;
  animation: cardIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;

  &:hover {
    transform: translateY(-2px);
    box-shadow:
      0 36px 90px rgba(0, 0, 0, 0.4),
      0 10px 28px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.9);
  }

  &__header {
    text-align: center;
    margin-bottom: 1.75rem;
  }

  &__logo-img {
    width: 100%;
    max-width: 170px;
    height: auto;
    object-fit: contain;
    margin: 0 auto 1.25rem;
    display: block;
    filter: drop-shadow(0 6px 16px rgba(108, 92, 231, 0.25));
  }

  &__titulo {
    font-size: 1.55rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: #1a1a2e;
    margin: 0 0 0.35rem;
    line-height: 1.2;
  }

  &__subtitulo {
    color: #6b7280;
    font-size: 0.92rem;
    margin: 0;
    font-weight: 400;
  }

  &__footer {
    margin-top: 1.75rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(0, 0, 0, 0.07);
  }

  &__link {
    text-align: center;
    font-size: 0.88rem;
    color: #6b7280;
    margin: 0;

    a {
      color: #6c5ce7;
      text-decoration: none;
      font-weight: 700;
      transition: color 0.2s ease, opacity 0.2s ease;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: -2px;
        width: 0;
        height: 2px;
        background: #6c5ce7;
        transition: width 0.25s ease;
        border-radius: 2px;
      }

      &:hover {
        color: #5a4bd1;

        &::after {
          width: 100%;
        }
      }
    }
  }
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;

  label {
    font-size: 0.82rem;
    font-weight: 700;
    color: #374151;
    letter-spacing: 0.01em;
  }

  &__input-wrapper {
    display: flex;
    align-items: center;
    border: 1.5px solid #e5e7eb;
    border-radius: 12px;
    transition: border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
    background: #f9fafb;
    overflow: hidden;

    &:hover {
      border-color: #d1d5db;
      background: #ffffff;
    }

    &:focus-within {
      border-color: #6c5ce7;
      background: #ffffff;
      box-shadow: 0 0 0 4px rgba(108, 92, 231, 0.14);
    }
  }

  &__icono {
    padding: 0 0 0 0.95rem;
    font-size: 0.95rem;
    opacity: 0.65;
    user-select: none;
    line-height: 1;
  }

  input {
    flex: 1;
    padding: 0.75rem 0.8rem;
    border: none;
    background: transparent;
    font-size: 0.95rem;
    color: #1a1a2e;
    outline: none;
    min-width: 0;
    font-family: inherit;

    &::placeholder {
      color: #9ca3af;
      opacity: 0.85;
    }

    &:-webkit-autofill {
      -webkit-box-shadow: 0 0 0 1000px #ffffff inset;
      -webkit-text-fill-color: #1a1a2e;
      transition: background-color 5000s ease-in-out 0s;
    }
  }

  &__toggle {
    background: none;
    border: none;
    padding: 0 0.95rem;
    cursor: pointer;
    font-size: 0.95rem;
    opacity: 0.55;
    transition: opacity 0.2s ease, transform 0.2s ease;
    line-height: 1;

    &:hover {
      opacity: 0.95;
      transform: scale(1.1);
    }

    &:active {
      transform: scale(0.95);
    }
  }
}

.mensaje-error {
  color: #dc2626;
  font-size: 0.86rem;
  font-weight: 500;
  background: rgba(220, 38, 38, 0.08);
  padding: 0.7rem 0.95rem;
  border-radius: 10px;
  margin: 0;
  border-left: 3px solid #dc2626;
  animation: shake 0.4s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn {
  &.btn-primary {
    background: linear-gradient(135deg, #6c5ce7 0%, #5a4bd1 100%);
    color: #ffffff;
    border: none;
    border-radius: 12px;
    font-weight: 700;
    letter-spacing: 0.02em;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.25s ease, filter 0.2s ease;
    box-shadow: 0 8px 20px rgba(108, 92, 231, 0.35);

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 12px 28px rgba(108, 92, 231, 0.45);
      filter: brightness(1.05);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: 0 6px 14px rgba(108, 92, 231, 0.35);
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      box-shadow: none;
    }
  }

  &.btn-lg {
    padding: 0.85rem 1.25rem;
    font-size: 0.98rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    width: 100%;
  }
}

.spinner {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2.5px solid rgba(255, 255, 255, 0.35);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes cardIn {
  from {
    opacity: 0;
    transform: translateY(24px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* Responsive */
@media (max-width: 480px) {
  .login-page {
    padding: 1rem;
    background-attachment: scroll;
  }

  .login-card {
    padding: 2rem 1.5rem 1.75rem;
    border-radius: 20px;

    &__logo-img {
      max-width: 140px;
    }

    &__titulo {
      font-size: 1.3rem;
    }
  }
}

/* Modo oscuro — usa el atributo real de la app */
[data-theme='dark'] {
  .login-card {
    background: rgba(26, 26, 46, 0.96);
    border: 1px solid rgba(255, 255, 255, 0.08);

    &__titulo {
      color: #e8e8f0;
    }

    &__subtitulo,
    &__link {
      color: #a0a0b8;
    }

    &__footer {
      border-top-color: rgba(255, 255, 255, 0.08);
    }
  }

  .campo {
    label {
      color: #d4d4d8;
    }

    &__input-wrapper {
      background: #22223b;
      border-color: rgba(255, 255, 255, 0.1);

      &:hover {
        background: #2a2a44;
        border-color: rgba(255, 255, 255, 0.15);
      }

      &:focus-within {
        background: #2a2a44;
        border-color: #6c5ce7;
      }
    }

    input {
      color: #e8e8f0;

      &::placeholder {
        color: #6b6b85;
      }

      &:-webkit-autofill {
        -webkit-box-shadow: 0 0 0 1000px #22223b inset;
        -webkit-text-fill-color: #e8e8f0;
      }
    }
  }
}
</style>