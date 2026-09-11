<template>
  <div class="registro-page">
    <div class="registro-card">
      <div class="registro-card__header">
        <!-- LOGO IMPLEMENTADO -->
        <img src="../assets/logo.png.png" alt="Fiado Digital" class="registro-card__logo-img" />
        
        <h1 class="registro-card__titulo">Crear cuenta</h1>
        <p class="registro-card__subtitulo">Regístrate en Fiado Digital</p>
      </div>

      <form v-if="!registroExitoso" class="registro-form" @submit.prevent="manejarRegistro">
        <div class="campo">
          <label for="nombre">Nombre completo</label>
          <div class="campo__input-wrapper">
            <span class="campo__icono">👤</span>
            <input
              id="nombre"
              v-model="nombre"
              type="text"
              placeholder="Tu nombre completo"
              required
            />
          </div>
        </div>

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
              placeholder="Mínimo 6 caracteres"
              minlength="6"
              required
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

        <div class="campo">
          <label for="confirmar">Confirmar contraseña</label>
          <div class="campo__input-wrapper">
            <span class="campo__icono">🔐</span>
            <input
              id="confirmar"
              v-model="confirmarPassword"
              :type="mostrarConfirmar ? 'text' : 'password'"
              placeholder="Repite tu contraseña"
              required
            />
            <button
              type="button"
              class="campo__toggle"
              @click="mostrarConfirmar = !mostrarConfirmar"
            >
              {{ mostrarConfirmar ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
        </div>

        <p v-if="errorMensaje" class="mensaje-error">{{ errorMensaje }}</p>

        <button type="submit" class="btn btn-primary btn-lg" :disabled="cargando">
          <span v-if="cargando" class="spinner"></span>
          {{ cargando ? 'Creando cuenta...' : 'Registrarme' }}
        </button>
      </form>

      <div v-else class="mensaje-exito">
        <span class="mensaje-exito__icono">✅</span>
        <h3>¡Cuenta creada correctamente!</h3>
        <p>Revisa tu correo <strong>{{ email }}</strong> y haz click en el enlace de verificación antes de iniciar sesión.</p>
        <RouterLink to="/login" class="btn btn-primary">Ir al login</RouterLink>
      </div>

      <p class="registro-card__link">
        <RouterLink to="/login">← Volver al inicio de sesión</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { registrar } from '../services/authService';

const nombre = ref('');
const email = ref('');
const password = ref('');
const confirmarPassword = ref('');
const cargando = ref(false);
const errorMensaje = ref('');
const registroExitoso = ref(false);
const mostrarPassword = ref(false);
const mostrarConfirmar = ref(false);

const manejarRegistro = async () => {
  errorMensaje.value = '';

  if (password.value !== confirmarPassword.value) {
    errorMensaje.value = 'Las contraseñas no coinciden';
    return;
  }

  if (password.value.length < 6) {
    errorMensaje.value = 'La contraseña debe tener al menos 6 caracteres';
    return;
  }

  cargando.value = true;
  try {
    await registrar(nombre.value, email.value, password.value);
    registroExitoso.value = true;
  } catch (error: any) {
    errorMensaje.value = error.response?.data?.error || 'Error al crear la cuenta';
  } finally {
    cargando.value = false;
  }
};
</script>

<style scoped lang="scss">
.registro-page {
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
    left: -200px;
    z-index: 0;
    pointer-events: none;
  }
}

.registro-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 440px;
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
    max-width: 160px;
    height: auto;
    object-fit: contain;
    margin: 0 auto 1.25rem;
    display: block;
    filter: drop-shadow(0 6px 16px rgba(108, 92, 231, 0.25));
  }

  &__titulo {
    font-size: 1.5rem;
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

  &__link {
    text-align: center;
    margin-top: 1.5rem;
    font-size: 0.88rem;

    a {
      color: #6c5ce7;
      text-decoration: none;
      font-weight: 700;
      transition: color 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;

      &:hover {
        color: #5a4bd1;
        text-decoration: underline;
      }
    }
  }
}

.registro-form {
  display: flex;
  flex-direction: column;
  gap: 1.05rem;
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
}

.mensaje-exito {
  text-align: center;
  padding: 0.5rem 0;

  &__icono {
    font-size: 3rem;
    display: block;
    margin-bottom: 0.75rem;
    animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }

  h3 {
    font-size: 1.15rem;
    font-weight: 800;
    color: #059669;
    margin: 0 0 0.6rem;
  }

  p {
    color: #6b7280;
    line-height: 1.55;
    margin-bottom: 1.5rem;
    font-size: 0.9rem;

    strong {
      color: #1a1a2e;
      font-weight: 700;
      word-break: break-all;
    }
  }

  .btn {
    margin-top: 0.5rem;
  }
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

@keyframes popIn {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* Responsive */
@media (max-width: 480px) {
  .registro-page {
    padding: 1rem;
    background-attachment: scroll;
  }

  .registro-card {
    padding: 2rem 1.5rem 1.75rem;
    border-radius: 20px;

    &__logo-img {
      max-width: 130px;
    }

    &__titulo {
      font-size: 1.3rem;
    }
  }
}

/* Modo oscuro — usa el atributo real de la app */
[data-theme='dark'] {
  .registro-card {
    background: rgba(26, 26, 46, 0.96);
    border: 1px solid rgba(255, 255, 255, 0.08);

    &__titulo {
      color: #e8e8f0;
    }

    &__subtitulo {
      color: #a0a0b8;
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

  .mensaje-exito {
    h3 { color: #34d399; }

    p {
      color: #a0a0b8;

      strong { color: #e8e8f0; }
    }
  }
}
</style>