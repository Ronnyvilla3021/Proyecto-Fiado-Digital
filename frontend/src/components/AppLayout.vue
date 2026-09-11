<template>
  <div class="app-layout" :data-theme="modoOscuro ? 'dark' : 'light'">
    <!-- Overlay para cerrar sidebar en móvil -->
    <Transition name="overlay">
      <div
        v-if="sidebarAbierto"
        class="sidebar-overlay"
        @click="cerrarSidebar"
      ></div>
    </Transition>

    <!-- Sidebar -->
    <aside class="sidebar" :class="{ 'sidebar--abierta': sidebarAbierto }">
      <div class="sidebar__logo">
        <img src="../assets/logo.png.png" alt="Fiado Digital" class="sidebar__logo-img" />
      </div>

      <nav class="sidebar__nav">
        <RouterLink
          to="/"
          class="sidebar__link"
          active-class="sidebar__link--activo"
          @click="cerrarSidebar"
        >
          <span class="sidebar__link-icon">📊</span>
          <span>Dashboard</span>
        </RouterLink>
        <RouterLink
          to="/clientes"
          class="sidebar__link"
          active-class="sidebar__link--activo"
          @click="cerrarSidebar"
        >
          <span class="sidebar__link-icon">👥</span>
          <span>Clientes</span>
        </RouterLink>
        <RouterLink
          to="/ventas"
          class="sidebar__link"
          active-class="sidebar__link--activo"
          @click="cerrarSidebar"
        >
          <span class="sidebar__link-icon">🛒</span>
          <span>Ventas</span>
        </RouterLink>
        <RouterLink
          to="/creditos"
          class="sidebar__link"
          active-class="sidebar__link--activo"
          @click="cerrarSidebar"
        >
          <span class="sidebar__link-icon">💳</span>
          <span>Créditos</span>
        </RouterLink>
        <RouterLink
          v-if="authStore.esAdmin() || authStore.esSupervisor()"
          to="/reportes"
          class="sidebar__link"
          active-class="sidebar__link--activo"
          @click="cerrarSidebar"
        >
          <span class="sidebar__link-icon">📄</span>
          <span>Reportes</span>
        </RouterLink>
        <RouterLink
          v-if="authStore.esAdmin()"
          to="/auditoria"
          class="sidebar__link"
          active-class="sidebar__link--activo"
          @click="cerrarSidebar"
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
          <button
            class="header__btn header__btn-tema"
            @click="modoOscuro = !modoOscuro"
            title="Cambiar tema"
          >
            {{ modoOscuro ? '☀️' : '🌙' }}
          </button>
          <button
            class="header__btn header__btn-salir"
            @click="salir"
            title="Cerrar sesión"
          >
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
import { ref, watch, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import NotificacionesCampana from './NotificacionesCampana.vue';

const router = useRouter();
const authStore = useAuthStore();

/* ========== MODO OSCURO ========== */
const modoOscuro = ref(localStorage.getItem('modoOscuro') === 'true');

watch(modoOscuro, (valor) => {
  localStorage.setItem('modoOscuro', String(valor));
  document.documentElement.setAttribute('data-theme', valor ? 'dark' : 'light');
});

// Inicializar tema
document.documentElement.setAttribute('data-theme', modoOscuro.value ? 'dark' : 'light');

/* ========== SIDEBAR MÓVIL ========== */
const sidebarAbierto = ref(false);

const toggleSidebar = () => {
  sidebarAbierto.value = !sidebarAbierto.value;
};

const cerrarSidebar = () => {
  sidebarAbierto.value = false;
};

// Bloquea el scroll del body cuando el sidebar está abierto en móvil
watch(sidebarAbierto, (abierto) => {
  document.body.style.overflow = abierto ? 'hidden' : '';
});

// Cierra el sidebar si se cambia de tamaño de pantalla a desktop
const handleResize = () => {
  if (window.innerWidth > 768 && sidebarAbierto.value) {
    sidebarAbierto.value = false;
  }
};

window.addEventListener('resize', handleResize);

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  document.body.style.overflow = '';
});

/* ========== SESIÓN ========== */
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
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.3s ease;
  z-index: 100;

  &__logo {
    padding: 1.5rem 1.5rem 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    border-bottom: 1px solid var(--color-borde);
    min-height: 84px;
  }

  &__logo-img {
    width: 100%;
    max-width: 145px;
    height: auto;
    object-fit: contain;
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.03);
    }
  }

  &__nav {
    flex: 1;
    padding: 1.5rem 0.85rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    overflow-y: auto;
  }

  &__link {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 0.75rem 1rem;
    border-radius: 12px;
    text-decoration: none;
    color: var(--color-texto-secundario);
    font-size: 0.9rem;
    font-weight: 500;
    transition: background 0.22s ease, color 0.22s ease,
      transform 0.22s ease;
    position: relative;

    &:hover:not(&--activo) {
      background: var(--color-fondo-hover);
      color: var(--color-texto-primario);
      transform: translateX(4px);
    }

    &:active {
      transform: translateX(2px) scale(0.99);
    }

    &--activo {
      background: linear-gradient(
        135deg,
        rgba(108, 92, 231, 0.14),
        rgba(162, 155, 254, 0.08)
      );
      color: var(--color-primario, #6c5ce7);
      font-weight: 700;
      box-shadow: 0 2px 8px rgba(108, 92, 231, 0.12);

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 26px;
        background: linear-gradient(180deg, #6c5ce7, #a29bfe);
        border-radius: 0 4px 4px 0;
        box-shadow: 0 0 8px rgba(108, 92, 231, 0.4);
      }

      .sidebar__link-icon {
        transform: scale(1.1);
      }
    }

    &-icon {
      font-size: 1.15rem;
      flex-shrink: 0;
      transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
      line-height: 1;
    }
  }

  &__footer {
    padding: 1rem 0.85rem 1.15rem;
    border-top: 1px solid var(--color-borde);
  }

  &__user {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.65rem 0.75rem;
    border-radius: 12px;
    background: var(--color-fondo-input);
    margin-bottom: 0.65rem;
    border: 1px solid var(--color-borde);
    transition: border-color 0.25s ease, background 0.25s ease;

    &:hover {
      border-color: var(--color-borde-fuerte);
    }
  }

  &__user-avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6c5ce7, #a29bfe);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    font-weight: 700;
    font-size: 0.92rem;
    flex-shrink: 0;
    box-shadow: 0 4px 10px rgba(108, 92, 231, 0.35);
    letter-spacing: 0.02em;
  }

  &__user-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    line-height: 1.35;
  }

  &__user-name {
    font-size: 0.86rem;
    font-weight: 700;
    color: var(--color-texto-primario);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__user-rol {
    font-size: 0.7rem;
    color: var(--color-texto-secundario);
    text-transform: capitalize;
    font-weight: 500;
  }

  &__logout {
    width: 100%;
    padding: 0.65rem 0.75rem;
    border: none;
    border-radius: 12px;
    background: transparent;
    color: var(--color-texto-secundario);
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    transition: background 0.22s ease, color 0.22s ease,
      transform 0.22s ease;
    font-family: inherit;

    &:hover {
      background: rgba(225, 112, 85, 0.1);
      color: #dc2626;
      transform: translateX(2px);
    }

    &:active {
      transform: translateX(0) scale(0.99);
    }
  }
}

/* ========== OVERLAY (MÓVIL) ========== */
.sidebar-overlay {
  display: none;
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
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border-bottom: 1px solid var(--color-borde);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 50;
  transition: background 0.3s ease, border-color 0.3s ease;

  &__left {
    display: flex;
    align-items: center;
    gap: 1rem;
    min-width: 0;
  }

  &__menu-btn {
    display: none;
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    padding: 0.45rem 0.6rem;
    border-radius: 10px;
    color: var(--color-texto-primario);
    transition: background 0.2s ease, transform 0.2s ease;
    line-height: 1;

    &:hover {
      background: var(--color-fondo-hover);
    }

    &:active {
      transform: scale(0.95);
    }
  }

  &__title {
    font-size: 1.08rem;
    font-weight: 700;
    margin: 0;
    color: var(--color-texto-primario);
    letter-spacing: -0.01em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  &__btn {
    background: transparent;
    border: 1px solid transparent;
    font-size: 1.1rem;
    cursor: pointer;
    padding: 0.5rem 0.65rem;
    border-radius: 10px;
    transition: background 0.22s ease, color 0.22s ease,
      transform 0.22s ease, border-color 0.22s ease;
    color: var(--color-texto-secundario);
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: inherit;

    &:hover {
      background: var(--color-fondo-hover);
      color: var(--color-texto-primario);
      transform: scale(1.06);
    }

    &:active {
      transform: scale(0.95);
    }

    &-tema {
      font-size: 1.05rem;
    }

    &-salir {
      font-size: 1rem;

      &:hover {
        background: rgba(225, 112, 85, 0.1);
        color: #dc2626;
      }
    }
  }
}

/* ========== CONTENIDO ========== */
.contenido {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  animation: fadeIn 0.35s cubic-bezier(0.22, 1, 0.36, 1);
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

/* ========== TRANSICIONES ========== */
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.28s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

/* ========== RESPONSIVE ========== */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    transform: translateX(-100%);
    z-index: 100;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);

    &--abierta {
      transform: translateX(0);
    }
  }

  .sidebar-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(10, 12, 25, 0.55);
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
    z-index: 90;
  }

  .header__menu-btn {
    display: flex !important;
  }

  .header {
    padding: 0 1rem;
    height: 64px;

    &__title {
      font-size: 1rem;
    }
  }

  .contenido {
    padding: 1rem;
  }
}

@media (max-width: 420px) {
  .header {
    padding: 0 0.75rem;

    &__title {
      display: none;
    }
  }
}

/* ========== MODO OSCURO ========== */
[data-theme='dark'] {
  .header {
    background: rgba(26, 26, 46, 0.85);
    border-bottom-color: var(--color-borde);
  }

  .sidebar {
    background: var(--color-fondo-tarjeta);
    border-right-color: var(--color-borde);

    &__user {
      background: var(--color-fondo-input);
    }

    &__link--activo {
      background: linear-gradient(
        135deg,
        rgba(108, 92, 231, 0.28),
        rgba(162, 155, 254, 0.15)
      );
      color: #a29bfe;
    }

    &__logout:hover {
      background: rgba(225, 112, 85, 0.15);
      color: #f87171;
    }
  }

  .header__btn {
    &-salir:hover {
      background: rgba(225, 112, 85, 0.15);
      color: #f87171;
    }
  }

  .sidebar-overlay {
    background: rgba(0, 0, 0, 0.7);
  }
}
</style>