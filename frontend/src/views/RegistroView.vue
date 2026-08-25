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
  background: linear-gradient(135deg, #f0f2f6 0%, #e8ecf1 100%);
  padding: 1rem;
}

.registro-card {
  background: var(--color-fondo-tarjeta, #ffffff);
  padding: 2.5rem;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 420px;
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

  &__link {
    text-align: center;
    margin-top: 1.25rem;
    font-size: 0.85rem;

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

.registro-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;

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

.mensaje-exito {
  text-align: center;
  padding: 1rem 0;

  &__icono {
    font-size: 3rem;
    display: block;
    margin-bottom: 0.5rem;
  }

  h3 {
    font-size: 1.1rem;
    font-weight: 700;
    color: #00b894;
    margin-bottom: 0.5rem;
  }

  p {
    color: var(--color-texto-secundario, #6b7280);
    line-height: 1.5;
    margin-bottom: 1.5rem;
  }

  .btn {
    margin-top: 0.5rem;
  }
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