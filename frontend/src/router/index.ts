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