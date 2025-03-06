<template>
  <div 
    class="video-container" 
    ref="containerRef"
    @click="togglePlay"
  >
    <div class="video-wrapper">
      <video
        ref="videoPlayer"
        class="video-element"
        :poster="poster"
        playsinline
        autoplay
        webkit-playsinline
        controls
        @loadedmetadata="initVideo"
      >
        <source :src="videoSource" type="video/mp4">
      </video>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount,nextTick,watch } from 'vue'
import { useRoute } from 'vue-router'

const videoSource = ref('')
const poster = ref('') // 海报帧图片 URL，用于在视频处于下载中的状态时显示
const containerRef = ref<HTMLElement | null>(null)
const videoPlayer = ref<HTMLVideoElement | null>(null)

const route = useRoute()

const getUrl = async () => {
  const baseUrl = import.meta.env.VITE_API_BASE
  const id = route?.query.id 
  // 获取路由参数 http://113.45.79.44/files/123/123.mp4
  videoSource.value = `${baseUrl}/files/${id}/${id}.mp4`;

  // 用 fetch API 获取视频地址 ，会导致视频初次加载缓慢，暂无找到分片加载解决方案
  // try {
  //   const response = await fetch(`${baseUrl}/files/${id}/${id}.mp4`)
  //   if (!response.ok) {
  //     throw new Error(`HTTP error! status: ${response.status}`)
  //   }
    
  //   videoSource.value = response.url || ''
  //   // 手动触发视频加载
  //   // await nextTick()
  //   videoPlayer.value?.load();

  // }catch (error) {
  //   console.error('API调用错误:', error)
  // }
}

// 自动播放处理
const initVideo = async () => {
  if (!videoPlayer.value) return
  try {
    // 先尝试非静音播放
    videoPlayer.value.muted = false
    await videoPlayer.value.play()
  } catch (error) {
    // 如果被阻止则静音播放
    videoPlayer.value.muted = true
    await videoPlayer.value.play()
  } finally {
    videoPlayer.value.volume = 0.6
  }
}

// 响应式布局
const updateLayout = () => {
  if (!containerRef.value || !videoPlayer.value) return
  
  const container = containerRef.value
  const video = videoPlayer.value
  const isPortrait = container.clientHeight > container.clientWidth
  
  // 计算视频比例
  const videoRatio = video.videoWidth / video.videoHeight || 16/9
  const containerRatio = container.clientWidth / container.clientHeight
  
  if (isPortrait) {
    // 竖屏模式
    if (containerRatio > videoRatio) {
      video.style.width = '100%'
      video.style.height = 'auto'
    } else {
      video.style.width = 'auto'
      video.style.height = '100%'
    }
    video.style.transform = 'translate(-50%, -50%)'
  } else {
    // 横屏模式
    // video.style.transform = `rotate(-90deg) translate(${container.clientHeight/2}px, ${container.clientWidth/2}px)`
    video.style.width = `${container.clientHeight}px`
    video.style.height = `${container.clientWidth}px`
  }
}

const resizeObserver = new ResizeObserver(updateLayout)

// 播放控制
const togglePlay = () => {
  if (!videoPlayer.value) return
  videoPlayer.value.paused ? videoPlayer.value.play() : videoPlayer.value.pause()
}

// 深度监听路由参数变化
watch(
  () => route.query.id,
  (newId, oldId) => {
    if (newId && newId !== oldId) {
      getUrl()
    }
  },
  { immediate: true, deep: true }
)

onMounted(() => {
  if (containerRef.value) {
    resizeObserver.observe(containerRef.value)
  }
})

onBeforeUnmount(() => {
  resizeObserver.disconnect()
})
</script>

<style scoped>
.video-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #000;
  overflow: hidden;
}

.video-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.video-element {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

/* 横屏优化 */
@media (orientation: landscape) {
  .video-element {
    transform-origin: center center;
    object-fit: cover;
  }
}

/* 控件优化 */
::v-deep video::-webkit-media-controls-panel {
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent) !important;
  opacity: 1 !important;
  transition: opacity 0.3s;
}

::v-deep video:hover::-webkit-media-controls-panel {
  opacity: 1 !important;
}
</style>