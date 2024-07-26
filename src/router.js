import Vue from "vue";
import VueRouter from "vue-router";
import store from './store';
import { authGuard } from "./auth/authGuard";

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    component: () => import(/* webpackChunkName: "app" */ './views'),
    redirect: '/app/home',
    beforeEnter: authGuard,
    children: [
      {
        path: 'app/piaf',
        component: () => import(/* webpackChunkName: "piaf" */ './app/piaf'),
        redirect: '/app/piaf/start',
        children: [
          { path: 'start', component: () => import(/* webpackChunkName: "piaf" */ './app/piaf/start') }          
        ]
      },
      {
        path: 'app/second-menu',
        component: () => import(/* webpackChunkName: "second-menu" */ './app/secondMenu'),
        redirect: '/app/second-menu/second',
        children: [
          { path: 'second', component: () => import(/* webpackChunkName: "second-menu" */ './app/secondMenu/Second') }
        ]
      },
      { path: 'app/dashboard', component: () => import(/* webpackChunkName: "usuarios" */ './views/app/dashboard/Container') },
      { path: 'app/usuarios', component: () => import(/* webpackChunkName: "usuarios" */ './views/app/usuarios/Container') },
      { path: 'app/proyectos', component: () => import(/* webpackChunkName: "proyectos" */ './views/app/proyectos/List') },
      { path: 'app/gastos', component: () => import(/* webpackChunkName: "gastos" */ './views/app/gastos/List') },
      { path: 'app/ordenespagos', component: () => import(/* webpackChunkName: "gastos" */ './views/app/ordenespagos/List') },
      { path: 'app/envios', component: () => import(/* webpackChunkName: "gastos" */ './views/app/envios/List') },
      { path: 'app/liquidaciones', component: () => import(/* webpackChunkName: "gastos" */ './views/app/liquidaciones/List') },
      { path: 'app/conceptosclientes', component: () => import(/* webpackChunkName: "licencias" */ './views/app/conceptosclientes/List') },
      { path: '/app/tablas/clientes', component: () => import(/* webpackChunkName: "clientes" */   './views/app/tablas/clientes/List') },
      { path: '/app/tablas/conceptos', component: () => import(/* webpackChunkName: "conceptos" */ './views/app/tablas/conceptos/List') },
      { path: '/app/reportes/facturacionygastos', component: () => import(/* webpackChunkName: "facturacionygastos" */ './views/app/reportes/facturacionygastos/facturacionygastos') },
      { path: '/app/reportes/proyectos', component: () => import(/* webpackChunkName: "permisos" */ './views/app/reportes/proyectos/proyectos') },
      { path: '/app/cashflow', component: () => import(/* webpackChunkName: "permisos" */ './views/app/cashflow/List') },
      { path: '/app/home', component: () => import(/* webpackChunkName: "permisos" */ './views/app/home/List') }
    ]
  },
  { path: '/error', component: () => import(/* webpackChunkName: "error" */ './views/Error') }, 
  
  {
    path: '/user',
    component: () => import(/* webpackChunkName: "user" */ './views/user'),
    redirect: '/user/login',
    children: [
      { path: 'login', component: () => import(/* webpackChunkName: "user" */ './views/user/Login') },
      { path: 'register', component: () => import(/* webpackChunkName: "user" */ './views/user/Register') },
      { path: 'forgot-password', component: () => import(/* webpackChunkName: "user" */ './views/user/ForgotPassword') }
    ]
  },
  { path: '*', component: () => import(/* webpackChunkName: "error" */ './views/Error') }
]

const router = new VueRouter({
  linkActiveClass: "active",
  routes,
  mode: "history"
});

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
      // this route requires auth, check if logged in
      // if not, redirect to login page.
      if (!store.getters['auth/isAuthenticated']) {
          next({
              path: '/login',
              query: { redirect: to.fullPath },
          });
      } else {
          next();
      }
  } else {
      next(); // make sure to always call next()!
  }
});

export default router;
