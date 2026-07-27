import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { publica: true },
    },
    {
      path: '/',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { publica: false },
    },
    {
      path: '/clientes',
      name: 'clientes',
      component: () => import('../views/ClientesView.vue'),
      meta: { publica: false },
    },
    {
      path: '/ventas',
      name: 'ventas',
      component: () => import('../views/VentasView.vue'),
      meta: { publica: false },
    },
    {
      path: '/creditos',
      name: 'creditos',
      component: () => import('../views/CreditosView.vue'),
      meta: { publica: false },
    },
  ],
});

// Guard global: bloquea rutas privadas si no hay sesión iniciada
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();
  const rutaPublica = to.meta.publica === true;

  if (!rutaPublica && !authStore.token) {
    next({ name: 'login' });
  } else if (to.name === 'login' && authStore.token) {
    next({ name: 'dashboard' });
  } else {
    next();
  }
});

export default router;