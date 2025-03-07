import { createRouter, createWebHashHistory } from 'vue-router'


const router = createRouter({
  history: createWebHashHistory(),
  strict: true,
  routes: [
    {
      path: '/',
      component: () => import('@/components/layout/index.vue'),
      children:[
        {
          path: '/',
          redirect:'/video',
        },
        {
          path: '/video',
          name: 'video',
          component: () => import('@/views/video/index.vue'),
          meta: {
            id: '',
            title: '视频',
          }
        },
        {
          path: '/audio',
          name: 'music',
          component: () => import('@/views/audio/index.vue'),
          meta: {
            id: '',
            title: '音频',
          }
        },
      ]
    },

  ],
})

export default router
