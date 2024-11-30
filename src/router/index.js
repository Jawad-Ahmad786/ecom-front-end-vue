import { createWebHistory, createRouter } from 'vue-router'
import HomeComponent from '../components/Home.vue';
import CartComponent from '../components/Cart.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeComponent
  },
  {
    path: '/cart',
    name: 'Cart',
    component: CartComponent
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router;