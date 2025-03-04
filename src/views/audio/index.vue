<template>
  <div class="container">
    <img :src="coverUrl" alt="专辑封面" class="cover-img" />
    <div class="song-info">
      <h2>{{ songTitle }}</h2>
      <p>{{ artist }}</p>
    </div>
    
    <!-- 进度条 -->
    <div class="progress-container" @click="handleProgressClick">
      <div class="progress-bar" :style="{ width: progressPercent + '%' }"></div>
    </div>

    <!-- 歌词区域 -->
    <div class="lyrics-container" ref="lyricsContainer">
      <div 
        v-for="(lyric, index) in lyrics"
        :key="index"
        class="lyric-line"
        :class="{ active: currentLyricIndex === index }"
      >
        {{ lyric.text }}
      </div>
    </div>

    <!-- 控制按钮 -->
    <div class="controls">
      <button @click="togglePlay">
        {{ isPlaying ? '暂停' : '播放' }}
      </button>
    </div>

    <!-- 隐藏的音频元素 -->
    <audio 
      ref="audioPlayer"
      @timeupdate="handleTimeUpdate"
      @loadedmetadata="handleLoadedMetadata"
    ></audio>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'

interface Lyric {
  time: number
  text: string
}

// 响应式数据
const audioPlayer = ref<HTMLAudioElement>()
const lyricsContainer = ref<HTMLElement>()
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const currentLyricIndex = ref(0)

// 静态数据（可改为props）
const coverUrl = 'cover.jpg'
const songTitle = '歌曲名称'
const artist = '歌手'
const audioUrl = 'song.mp3'

// 歌词数据（示例）
const lyrics = ref<Lyric[]>([
  { time: 12.533, text: "那岁月长河的角落" },
  { time: 13.733, text: "零歌与落叶的故事波" },
  // 更多歌词数据...
])

// 计算属性
const progressPercent = computed(() => {
  return (currentTime.value / duration.value) * 100 || 0
})

// 生命周期
onMounted(() => {
  if (audioPlayer.value) {
    audioPlayer.value.src = audioUrl
  }
})

// 监听当前歌词变化
watch(currentLyricIndex, () => {
  nextTick(() => {
    const activeLine = lyricsContainer.value?.querySelector('.lyric-line.active')
    if (activeLine) {
      activeLine.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  })
})

// 方法
const togglePlay = () => {
  if (!audioPlayer.value) return
  
  isPlaying.value = !isPlaying.value
  isPlaying.value ? audioPlayer.value.play() : audioPlayer.value.pause()
}

const handleTimeUpdate = () => {
  if (!audioPlayer.value) return
  
  currentTime.value = audioPlayer.value.currentTime
  updateCurrentLyric()
}

const handleLoadedMetadata = () => {
  if (audioPlayer.value) {
    duration.value = audioPlayer.value.duration
  }
}

const handleProgressClick = (e: MouseEvent) => {
  if (!audioPlayer.value || !duration.value) return
  
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width
  audioPlayer.value.currentTime = percent * duration.value
}

const updateCurrentLyric = () => {
  let activeIndex = -1
  for (let i = lyrics.value.length - 1; i >= 0; i--) {
    if (currentTime.value >= lyrics.value[i].time) {
      activeIndex = i
      break
    }
  }
  currentLyricIndex.value = activeIndex
}
</script>

<style scoped>
/* 保持原有样式不变 */
.container {
  flex: 1;
  max-width: 768px;
  margin: 0 auto;
  padding: 20px;
  width: 100%;
}

.cover-img {
  width: 100%;
  max-height: 40vh;
  object-fit: contain;
  margin-bottom: 20px;
}

.song-info {
  text-align: center;
  margin-bottom: 20px;
}

.progress-container {
  width: 100%;
  height: 5px;
  background: #ddd;
  margin: 15px 0;
  cursor: pointer;
  position: relative;
}

.progress-bar {
  height: 100%;
  background: #007bff;
  transition: width 0.1s linear;
}

.lyrics-container {
  height: 30vh;
  overflow-y: auto;
  text-align: center;
  padding: 10px;
  margin-top: 20px;
}

.lyric-line {
  padding: 8px 0;
  color: #666;
  transition: all 0.3s ease;
}

.lyric-line.active {
  color: #000;
  font-size: 1.2em;
  font-weight: bold;
}

.controls {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

button {
  padding: 10px 20px;
  border: none;
  background: #007bff;
  color: white;
  border-radius: 5px;
  cursor: pointer;
}
</style>