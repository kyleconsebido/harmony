import { createRouter, createWebHistory } from 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/auth',
      name: 'Auth',
      component: () => import('../views/AuthView.vue'),
      children: [
        {
          path: '/login',
          name: 'Login',
          component: () => import('../views/AuthLogin.vue')
        },
        {
          path: '/register',
          name: 'Register',
          component: () => import('../views/AuthRegister.vue')
        },
        {
          path: '/forgot-password',
          name: 'Forgot Password',
          component: () => import('../views/AuthForgotPassword.vue')
        },
        {
          path: '/reset-password',
          name: 'Reset Password',
          component: () => import('../views/AuthResetPassword.vue')
        }
      ]
    },
    {
      path: '/rooms',
      name: 'Rooms',
      component: () => import('../views/RoomsView.vue'),
      children: [{ path: '/rooms/:id', component: () => import('../views/RoomView.vue') }],
      meta: { requiresAuth: true }
    }
  ]
})

export default router
