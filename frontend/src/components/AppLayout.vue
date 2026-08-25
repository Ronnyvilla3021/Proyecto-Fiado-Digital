<template>
  <div class="app-layout" :data-theme="modoOscuro ? 'dark' : 'light'">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar__logo">
        <!-- LOGO IMPLEMENTADO -->
        <img src="../assets/logo.png.png" alt="Fiado Digital" class="sidebar__logo-img" />
      </div>

      <nav class="sidebar__nav">
        <RouterLink to="/" class="sidebar__link" active-class="sidebar__link--activo">
          <span class="sidebar__link-icon">📊</span>
          <span>Dashboard</span>
        </RouterLink>
        <RouterLink to="/clientes" class="sidebar__link" active-class="sidebar__link--activo">
          <span class="sidebar__link-icon">👥</span>
          <span>Clientes</span>
        </RouterLink>
        <RouterLink to="/ventas" class="sidebar__link" active-class="sidebar__link--activo">
          <span class="sidebar__link-icon">🛒</span>
          <span>Ventas</span>
        </RouterLink>
        <RouterLink to="/creditos" class="sidebar__link" active-class="sidebar__link--activo">
          <span class="sidebar__link-icon">💳</span>
          <span>Créditos</span>
        </RouterLink>
        <RouterLink
          v-if="authStore.esAdmin() || authStore.esSupervisor()"
          to="/reportes"
          class="sidebar__link"
          active-class="sidebar__link--activo"
        >
          <span class="sidebar__link-icon">📄</span>
          <span>Reportes</span>
        </RouterLink>
        <RouterLink
          v-if="authStore.esAdmin()"
          to="/auditoria"
          class="sidebar__link"
          active-class="sidebar__link--activo"
        >
          <span class="sidebar__link-icon">📋</span>
          <span>Auditoría</span>
        </RouterLink>
      </nav>

      <div class="sidebar__footer">
        <div class="sidebar__user">
          <div class="sidebar__user-avatar">{{ authStore.usuario?.nombre?.charAt(0) || 'U' }}</div>
          <div class="sidebar__user-info">
            <span class="sidebar__user-name">{{ authStore.usuario?.nombre || 'Usuario' }}</span>
            <span class="sidebar__user-rol">{{ authStore.usuario?.rol || 'sin rol' }}</span>
          </div>
        </div>
        <button class="sidebar__logout" @click="salir">
          <span>🚪</span>
          <span>Salir</span>
        </button>
      </div>
    </aside>

    <!-- Contenido principal -->
    <div class="main">
      <!-- Header -->
      <header class="header">
        <div class="header__left">
          <button class="header__menu-btn" @click="toggleSidebar">☰</button>
          <h1 class="header__title">Dashboard</h1>
        </div>

        <div class="header__right">
          <NotificacionesCampana />
          <button class="header__btn header__btn-tema" @click="modoOscuro = !modoOscuro" title="Cambiar tema">
            {{ modoOscuro ? '☀️' : '🌙' }}
          </button>
          <button class="header__btn header__btn-salir" @click="salir" title="Cerrar sesión">
            🚪
          </button>
        </div>
      </header>

      <!-- Vista actual -->
      <main class="contenido">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import NotificacionesCampana from './NotificacionesCampana.vue';

const router = useRouter();
const authStore = useAuthStore();

const modoOscuro = ref(localStorage.getItem('modoOscuro') === 'true');

watch(modoOscuro, (valor) => {
  localStorage.setItem('modoOscuro', String(valor));
  document.documentElement.setAttribute('data-theme', valor ? 'dark' : 'light');
});

// Inicializar tema
document.documentElement.setAttribute('data-theme', modoOscuro.value ? 'dark' : 'light');

const toggleSidebar = () => {
  document.querySelector('.sidebar')?.classList.toggle('sidebar--abierta');
};

const salir = () => {
  authStore.cerrarSesion();
  router.push({ name: 'login' });
};
</script>

<style scoped lang="scss">
.app-layout {
  display: flex;
  min-height: 100vh;
  background: var(--color-fondo);
  color: var(--color-texto-primario);
  transition: background 0.3s ease, color 0.3s ease;
}

/* ========== SIDEBAR ========== */
.sidebar {
  width: 260px;
  background: var(--color-fondo-tarjeta);
  border-right: 1px solid var(--color-borde);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  height: 100vh;
  transition: transform 0.3s ease, background 0.3s ease;

  &__logo {
    padding: 1.25rem 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    border-bottom: 1px solid var(--color-borde);
  }

  /* ESTILO NUEVO PARA LA IMAGEN DEL LOGO */
  &__logo-img {
    width: 100%;
    max-width: 150px;
    height: auto;
    object-fit: contain;
  }

  &__nav {
    flex: 1;
    padding: 1.5rem 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  &__link {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 0.7rem 1rem;
    border-radius: 12px;
    text-decoration: none;
    color: var(--color-texto-secundario);
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.3s ease;
    position: relative;

    &:hover {
      background: var(--color-fondo-hover);
      color: var(--color-texto-primario);
      transform: translateX(4px);
    }

    &--activo {
      background: rgba(108, 92, 231, 0.12);
      color: #6c5ce7;
      font-weight: 600;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 24px;
        background: linear-gradient(180deg, #6c5ce7, #a29bfe);
        border-radius: 0 4px 4px 0;
      }
    }

    &-icon {
      font-size: 1.1rem;
      flex-shrink: 0;
    }
  }

  &__footer {
    padding: 1rem 0.75rem;
    border-top: 1px solid var(--color-borde);
  }

  &__user {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0.75rem;
    border-radius: 12px;
    background: var(--color-fondo-input);
    margin-bottom: 0.5rem;
  }

  &__user-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6c5ce7, #a29bfe);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 0.9rem;
    flex-shrink: 0;
  }

  &__user-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    line-height: 1.3;
  }

  &__user-name {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--color-texto-primario);
  }

  &__user-rol {
    font-size: 0.7rem;
    color: var(--color-texto-secundario);
    text-transform: capitalize;
  }

  &__logout {
    width: 100%;
    padding: 0.6rem 0.75rem;
    border: none;
    border-radius: 12px;
    background: transparent;
    color: var(--color-texto-secundario);
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(225, 112, 85, 0.1);
      color: #e17055;
    }
  }
}

/* ========== MAIN ========== */
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* ========== HEADER ========== */
.header {
  height: 72px;
  background: var(--color-fondo-tarjeta);
  border-bottom: 1px solid var(--color-borde);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 50;
  transition: background 0.3s ease;

  &__left {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  &__menu-btn {
    display: none;
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    padding: 0.4rem;
    border-radius: 8px;
    color: var(--color-texto-primario);

    &:hover {
      background: var(--color-fondo-hover);
    }
  }

  &__title {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;
    color: var(--color-texto-primario);
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__btn {
    background: none;
    border: none;
    font-size: 1.1rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 10px;
    transition: all 0.3s ease;
    color: var(--color-texto-secundario);

    &:hover {
      background: var(--color-fondo-hover);
      color: var(--color-texto-primario);
      transform: scale(1.05);
    }

    &-tema {
      font-size: 1.05rem;
    }

    &-salir {
      font-size: 1rem;
    }
  }
}

/* ========== CONTENIDO ========== */
.contenido {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ========== RESPONSIVE ========== */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    transform: translateX(-100%);
    z-index: 100;
    box-shadow: var(--shadow-lg);

    &--abierta {
      transform: translateX(0);
    }
  }

  .header__menu-btn {
    display: block !important;
  }

  .header {
    padding: 0 1rem;
  }

  .contenido {
    padding: 1rem;
  }
}
</style>