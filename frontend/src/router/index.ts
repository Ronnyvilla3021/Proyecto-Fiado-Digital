import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import AppLayout from '../components/AppLayout.vue';

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
      path: '/registro',
      name: 'registro',
      component: () => import('../views/RegistroView.vue'),
      meta: { publica: true },
    },
    {
      path: '/verificar-email/:token',
      name: 'verificar-email',
      component: () => import('../views/VerificarEmailView.vue'),
      meta: { publica: true },
    },
    {
      path: '/',
      component: AppLayout,
      meta: { publica: false },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('../views/DashboardView.vue'),
        },
        {
          path: 'reportes',
          name: 'reportes',
          component: () => import('../views/ReportesView.vue'),
        },
        {
          path: 'clientes',
          name: 'clientes',
          component: () => import('../views/ClientesView.vue'),
        },
        {
          path: 'ventas',
          name: 'ventas',
          component: () => import('../views/VentasView.vue'),
        },
        {
          path: 'creditos',
          name: 'creditos',
          component: () => import('../views/CreditosView.vue'),
        },
        {
          path: 'auditoria',
          name: 'auditoria',
          component: () => import('../views/AuditoriaView.vue'),
        },
      ],
    },
  ],
});

// ✅ CORREGIDO: Sintaxis moderna, retornamos los valores en lugar de usar next()
router.beforeEach((to) => {
  const authStore = useAuthStore();
  const rutaPublica = to.meta.publica === true;

  if (!rutaPublica && !authStore.token) {
    return { name: 'login' }; // Equivale a next({ name: 'login' })
  } else if (to.name === 'login' && authStore.token) {
    return { name: 'dashboard' }; // Equivale a next({ name: 'dashboard' })
  } else {
    return true; // Equivale a next()
  }
});

export default router;