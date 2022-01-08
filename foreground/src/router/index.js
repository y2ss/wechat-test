import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Spu from '../views/Spu.vue'
import Sku from '../views/Sku.vue'
import Order from '../views/Order.vue'
import Production from '../views/Production.vue'
import Shopping from '../views/Shopping.vue'
import Hot from '../views/HotProduction.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/spu',
    name: 'Spu',
    component: Spu
  },
  {
    path: '/sku',
    name: 'Sku',
    component: Sku
  },
  {
    path: '/order',
    name: 'Order',
    component: Order
  },
  {
    path: '/production',
    name: 'Production',
    component: Production
  },
  {
    path: '/shopping',
    name: 'Shopping',
    component: Shopping
  },
  {
    path: '/hot',
    name: 'Hot',
    component: Hot
  }
]

const router = new VueRouter({
  routes
})

export default router
