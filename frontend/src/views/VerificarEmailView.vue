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
    bottom: -200px;
    right: -200px;
    z-index: 0;
    pointer-events: none;
  }
}

.verificar-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 440px;
  padding: 2.75rem 2.5rem 2.5rem;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow:
    0 30px 80px rgba(0, 0, 0, 0.35),
    0 8px 24px rgba(0, 0, 0, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  text-align: center;
  animation: cardIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
}

/* ============ ESTADO: VERIFICANDO ============ */
.mensaje-estado {
  display: flex;
  flex-direction: column;
  align-items: center;

  &__icono {
    font-size: 3.5rem;
    display: block;
    margin-bottom: 0.75rem;
    animation: pulse 1.8s ease-in-out infinite;
  }

  h3 {
    font-size: 1.2rem;
    font-weight: 800;
    margin: 0 0 0.4rem;
    color: #1a1a2e;
    letter-spacing: -0.01em;
  }

  p {
    color: #6b7280;
    margin: 0 0 1.5rem;
    font-size: 0.9rem;
  }
}

.spinner {
  display: inline-block;
  width: 36px;
  height: 36px;
  border: 3px solid rgba(108, 92, 231, 0.15);
  border-top-color: #6c5ce7;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto;
}

/* ============ ESTADO: ÉXITO ============ */
.mensaje-exito {
  display: flex;
  flex-direction: column;
  align-items: center;

  &__icono {
    font-size: 3.5rem;
    display: block;
    margin-bottom: 0.75rem;
    animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    filter: drop-shadow(0 6px 16px rgba(5, 150, 105, 0.3));
  }

  h3 {
    font-size: 1.2rem;
    font-weight: 800;
    color: #059669;
    margin: 0 0 0.6rem;
    letter-spacing: -0.01em;
  }

  p {
    color: #6b7280;
    line-height: 1.55;
    margin-bottom: 1.75rem;
    font-size: 0.92rem;
  }
}

/* ============ ESTADO: ERROR ============ */
.mensaje-error-caja {
  display: flex;
  flex-direction: column;
  align-items: center;

  &__icono {
    font-size: 3.5rem;
    display: block;
    margin-bottom: 0.75rem;
    animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    filter: drop-shadow(0 6px 16px rgba(220, 38, 38, 0.25));
  }

  h3 {
    font-size: 1.2rem;
    font-weight: 800;
    color: #dc2626;
    margin: 0 0 0.6rem;
    letter-spacing: -0.01em;
  }

  p {
    color: #6b7280;
    line-height: 1.55;
    margin-bottom: 1.75rem;
    font-size: 0.92rem;
    padding: 0.7rem 0.95rem;
    background: rgba(220, 38, 38, 0.06);
    border-radius: 10px;
    border-left: 3px solid #dc2626;
    text-align: left;
    width: 100%;
    box-sizing: border-box;
  }
}

/* ============ BOTONES ============ */
.btn {
  &.btn-primary {
    background: linear-gradient(135deg, #6c5ce7 0%, #5a4bd1 100%);
    color: #ffffff;
    border: none;
    border-radius: 12px;
    font-weight: 700;
    letter-spacing: 0.02em;
    cursor: pointer;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    padding: 0.8rem 1.75rem;
    font-size: 0.95rem;
    transition: transform 0.2s ease, box-shadow 0.25s ease, filter 0.2s ease;
    box-shadow: 0 8px 20px rgba(108, 92, 231, 0.35);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 28px rgba(108, 92, 231, 0.45);
      filter: brightness(1.05);
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 6px 14px rgba(108, 92, 231, 0.35);
    }
  }

  &.btn-outline {
    background: transparent;
    border: 1.5px solid var(--color-borde-fuerte, #d1d5db);
    color: #6b7280;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    padding: 0.75rem 1.5rem;
    font-size: 0.92rem;
    transition: border-color 0.2s ease, color 0.2s ease,
      background 0.2s ease, transform 0.2s ease;

    &:hover {
      border-color: #6c5ce7;
      color: #6c5ce7;
      background: rgba(108, 92, 231, 0.05);
      transform: translateY(-1px);
    }
  }
}

/* ============ ANIMACIONES ============ */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.08);
    opacity: 0.85;
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

/* ============ RESPONSIVE ============ */
@media (max-width: 480px) {
  .verificar-page {
    padding: 1rem;
    background-attachment: scroll;
  }

  .verificar-card {
    padding: 2rem 1.5rem 1.75rem;
    border-radius: 20px;
  }

  .mensaje-estado,
  .mensaje-exito,
  .mensaje-error-caja {
    &__icono {
      font-size: 3rem;
    }

    h3 {
      font-size: 1.1rem;
    }
  }
}

/* ============ MODO OSCURO ============ */
[data-theme='dark'] {
  .verificar-card {
    background: rgba(26, 26, 46, 0.96);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .mensaje-estado {
    h3 { color: #e8e8f0; }
    p { color: #a0a0b8; }
  }

  .mensaje-exito {
    h3 { color: #34d399; }
    p { color: #a0a0b8; }
  }

  .mensaje-error-caja {
    h3 { color: #f87171; }
    p {
      color: #a0a0b8;
      background: rgba(220, 38, 38, 0.12);
    }
  }

  .btn {
    &.btn-outline {
      border-color: rgba(255, 255, 255, 0.12);
      color: #a0a0b8;

      &:hover {
        border-color: #6c5ce7;
        color: #a29bfe;
        background: rgba(108, 92, 231, 0.12);
      }
    }
  }
}
</style>