<template>
  <div class="app-layout" :class="{ 'app-layout--oscuro': modoOscuro }">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar__logo">
        <span>🥇</span>
        <span>Fiado Digital</span>
      </div>

      <nav class="sidebar__nav">
        <RouterLink to="/" class="sidebar__link">
          <span>📊</span> Dashboard
        </RouterLink>
        <RouterLink to="/clientes" class="sidebar__link">
          <span>👥</span> Clientes
        </RouterLink>
        <RouterLink to="/ventas" class="sidebar__link">
          <span>🛒</span> Ventas
        </RouterLink>
        <RouterLink to="/creditos" class="sidebar__link">
          <span>💳</span> Créditos
        </RouterLink>
        <RouterLink
          v-if="authStore.esAdmin() || authStore.esSupervisor()"
          to="/reportes"
          class="sidebar__link"
        >
          <span>📄</span> Reportes
        </RouterLink>
      </nav>
    </aside>

    <!-- Contenido principal -->
    <div class="main">
      <!-- Header -->
      <header class="header">
        <div class="header__espaciador"></div>

        <div class="header__acciones">
  <NotificacionesCampana />

  <button class="header__boton" @click="modoOscuro = !modoOscuro" title="Cambiar tema">
    {{ modoOscuro ? '☀️' : '🌙' }}
  </button>

  <div class="header__usuario">
    <span class="header__nombre">{{ authStore.usuario?.nombre }}</span>
    <span class="header__rol">{{ authStore.usuario?.rol }}</span>
  </div>

  <button class="header__boton" @click="salir" title="Cerrar sesión">
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

// Modo oscuro persistente (se guarda en localStorage)
const modoOscuro = ref(localStorage.getItem('modoOscuro') === 'true');

watch(modoOscuro, (valor) => {
  localStorage.setItem('modoOscuro', String(valor));
});

const salir = () => {
  authStore.cerrarSesion();
  router.push({ name: 'login' });
};
</script>

<style scoped lang="scss">
.app-layout {
  --color-fondo-tarjeta: #ffffff;
  --color-borde: rgba(0, 0, 0, 0.08);
  --color-texto-secundario: #6b7280;
  --color-input-fondo: #ffffff;

  display: flex;
  min-height: 100vh;
  background: #f4f6f8;
  color: #1a1a1a;
  transition: background 0.2s, color 0.2s;

  &--oscuro {
    --color-fondo-tarjeta: #1c1f26;
    --color-borde: rgba(255, 255, 255, 0.08);
    --color-texto-secundario: #9ca3af;
    --color-input-fondo: #22252c;

    background: #14161a;
    color: #e5e7eb;

    .sidebar {
      background: #1c1f26;
      border-right-color: #2a2e37;
    }

    .header {
      background: #1c1f26;
      border-bottom-color: #2a2e37;
    }

    .sidebar__link:hover,
    .sidebar__link.router-link-active {
      background: #2a2e37;
    }
  }
}

.sidebar {
  width: 240px;
  background: white;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;

  &__logo {
    padding: 1.5rem 1.25rem;
    font-weight: 700;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__nav {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.5rem;
  }

  &__link {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.65rem 0.9rem;
    border-radius: 8px;
    text-decoration: none;
    color: inherit;
    font-size: 0.9rem;
    font-weight: 500;
    transition: background 0.15s;

    &:hover {
      background: #f0f1f3;
    }

    &.router-link-active {
      background: #eef2ff;
      color: #4f46e5;
      font-weight: 600;
    }
  }
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.header {
  height: 64px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  flex-shrink: 0;

  &__acciones {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  &__boton {
    background: none;
    border: none;
    font-size: 1.1rem;
    cursor: pointer;
    padding: 0.4rem;
    border-radius: 6px;

    &:hover {
      background: rgba(0, 0, 0, 0.05);
    }
  }

  &__usuario {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    line-height: 1.2;
  }

  &__nombre {
    font-size: 0.85rem;
    font-weight: 600;
  }

  &__rol {
    font-size: 0.75rem;
    color: #6b7280;
    text-transform: capitalize;
  }
}

.contenido {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}
</style>