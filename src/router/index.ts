import { createRouter, createWebHistory } from 'vue-router'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect:'/video',
    },
    {
      path: '/video',
      name: 'video',
      component: () => import('@/views/video/index.vue'),
      meta: {
        title: '视频',
      }
    },
    {
      path: '/audio',
      name: 'audio',
      component: () => import('@/views/audio/index.vue'),
      meta: {
        title: '音频',
      }
    },
  ],
})

export default router
