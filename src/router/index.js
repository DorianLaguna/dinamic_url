import { createRouter, createWebHistory } from 'vue-router'
import GeneratorView from '../views/GeneratorView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/crear/:prompt',
      name: 'GeneratorView',
      component: GeneratorView,
      props: true
    }
  ]
})

export default router
