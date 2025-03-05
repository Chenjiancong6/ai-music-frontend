import { createRouter, createWebHashHistory } from 'vue-router'


const router = createRouter({
  history: createWebHashHistory(),
  strict: true,
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
