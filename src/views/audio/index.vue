<template>
  <div class="player-container">
    <div class="album-art" :class="{ active: isPlaying }">
      <img :src="currentCover" alt="专辑封面" />
    </div>
    <div class="song-info">
      <h2 class="song-title">{{ currentTitle }}</h2>
      <p class="artist">by {{ currentArtist }}</p>
    </div>
    <div class="progress-container" @click="seekAudio">
      <div class="progress" :style="{ width: progressPercent + '%' }"></div>
    </div>
    <div class="time-display">
      <span>{{ formatTime(currentTime) }}</span>
      <span>{{ formatTime(duration) }}</span>
    </div>
    <div class="controls">
      <!-- <button class="control-btn" @click="prevSong">
        <i class="fas fa-step-backward"></i>
      </button> -->
      <button class="control-btn play-btn" @click="togglePlay">
        <i :class="playIcon"></i>
      </button>
      <!-- <button class="control-btn" @click="nextSong">
        <i class="fas fa-step-forward"></i>
      </button> -->
    </div>
    <div class="lyrics-container" ref="lyricsContainer">
      <div v-for="(lyric, index) in lyrics" :key="index" class="lyric-line"
        :class="{ active: currentLyricIndex === index }">
        {{ lyric.text }}
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
const route = useRoute();
const baseurl = import.meta.env.VITE_API_BASE;

function parseTime(timeStr) {
  const [hms, ms] = timeStr.split(",");
  const [h, m, s] = hms.split(":");
  return +h * 3600 + +m * 60 + +s + +ms / 1000;
}

function parseSrt(srtText) {
  // 保持原有解析逻辑不变
  const lines = srtText.split("\n");
  const lyrics = [];
  let currentLyric = null;

  lines.forEach((line) => {
    line = line.trim(); // 去除前后空白字符

    if (line.match(/^\d+$/)) {
      // 序号行
      if (currentLyric) {
        lyrics.push(currentLyric);
      }
      currentLyric = { text: "", start: 0, end: 0 }; // 初始化 currentLyric
    } else if (
      line.match(/^\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}$/)
    ) {
      // 时间行
      if (!currentLyric) {
        console.error("Unexpected time line without index:", line);
        return;
      }
      const [start, end] = line.split(" --> ");
      currentLyric.start = parseTime(start);
      currentLyric.end = parseTime(end);
    } else if (line) {
      // 歌词行
      if (!currentLyric) {
        console.error("Unexpected text line without index or time:", line);
        return;
      }
      currentLyric.text += line + "\n";
    }
  });

  // 添加最后一段歌词
  if (currentLyric) {
    lyrics.push(currentLyric);
  }

  // console.log("Parsed lyrics:", lyrics); // 调试信息
  return lyrics;
}

// 响应式数据
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const lyrics = ref([]);
const currentLyricIndex = ref(-1);
const audio = ref(null);
const lyricsContainer = ref(null);

// 当前歌曲信息
const songData = reactive({
  id: null,
  title: "AI Peng Song",
  artist: "AI Peng",
  cover: "",
});

// 计算属性
const playIcon = computed(() =>
  isPlaying.value ? "fas fa-pause" : "fas fa-play"
);

const progressPercent = computed(
  () => (currentTime.value / duration.value) * 100 || 0
);

// 方法
function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

async function loadSongData() {
  songData.id = route?.query.id;
  try {
    const [metaRes, lyricsRes] = await Promise.all([
      fetch(`${baseurl}/files/${songData.id}/${songData.id}.json`),
      fetch(`${baseurl}/files/${songData.id}/${songData.id}.srt`),
    ]);

    const meta = await metaRes.json();
    songData.title = meta.title;
    songData.cover = meta.cover || "";

    const srtText = await lyricsRes.text();
    lyrics.value = parseSrt(srtText);

    // 初始化音频
    audio.value = new Audio(
      `${baseurl}/files/${songData.id}/${songData.id}.mp3`
    );
    setupAudioListeners();
  } catch (error) {
    console.error("加载失败:", error);
  }
}

function setupAudioListeners() {
  audio.value.addEventListener("timeupdate", () => {
    currentTime.value = audio.value.currentTime;
    updateLyrics();
  });

  audio.value.addEventListener("loadedmetadata", () => {
    duration.value = audio.value.duration;
  });

  audio.value.addEventListener("ended", () => {
    isPlaying.value = false;
  });
}

function togglePlay() {
  isPlaying.value = !isPlaying.value;
  isPlaying.value ? audio.value.play() : audio.value.pause();
}

function seekAudio(e) {
  const rect = e.target.getBoundingClientRect();
  const pos = (e.clientX - rect.left) / rect.width;
  audio.value.currentTime = pos * duration.value;
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function updateLyrics() {
  const current = audio.value.currentTime;
  const index = lyrics.value.findIndex(
    (lyric, i) =>
      current >= lyric.start &&
      current < (lyrics.value[i + 1]?.start || Infinity)
  );

  if (index !== -1 && index !== currentLyricIndex.value) {
    currentLyricIndex.value = index;
    console.log(currentLyricIndex.value);

    scrollToLyric(index);
  }
}

function scrollToLyric(index) {
  const container = lyricsContainer.value;
  const target = container.children[index];
  if (target) {
    const top = target.offsetTop - container.offsetHeight / 2;
    // container.scrollTo({ top, behavior: "smooth" });
    target.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

// 生命周期钩子
onMounted(() => {
  loadSongData();
});

const currentCover = computed(() => songData.cover);
const currentTitle = computed(() => songData.title);
const currentArtist = computed(() => songData.artist);
const prevSong = () => console.log("待实现");
const nextSong = () => console.log("待实现");
</script>

<!-- 原有样式保持不变 -->
<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #1a1a1a;
  color: #fff;
  font-family: "Microsoft YaHei", sans-serif;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.player-container {
  background: #2a2a2a;
  border-radius: 20px;
  padding: 30px;
  width: 400px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.album-art {
  width: 300px;
  height: 300px;
  margin: 0 auto 25px;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  animation: rotate 20s linear infinite;
  animation-play-state: paused;
}

.album-art.active {
  animation-play-state: running;
}

.album-art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.song-info {
  text-align: center;
  margin-bottom: 25px;
}

.song-title {
  font-size: 22px;
  margin-bottom: 8px;
}

.artist {
  color: #888;
  font-size: 16px;
}

.progress-container {
  background: #404040;
  height: 4px;
  border-radius: 2px;
  margin: 20px 0;
  cursor: pointer;
}

.progress {
  background: #ff3366;
  height: 100%;
  width: 0%;
  border-radius: 2px;
  transition: width 0.1s linear;
}

.controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 30px;
}

.control-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 24px;
  cursor: pointer;
  padding: 10px;
  transition: color 0.3s;
}

.control-btn:hover {
  color: #ff3366;
}

.play-btn {
  font-size: 36px;
}

.time-display {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #888;
  margin-top: 8px;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* 歌词容器 */
.lyrics-container {
  height: 200px;
  overflow-y: auto;
  margin-top: 20px;
  text-align: center;
  scroll-behavior: smooth;
}

.lyric-line {
  color: #888;
  margin: 12px 0;
  transition: color 0.3s;
}

.lyric-line.active {
  color: #fff;
  font-weight: bold;
}

.lyrics-container {
  overflow-y: auto;
  /* 允许滚动 */
  scrollbar-width: none;
  /* 隐藏滚动条（Firefox） */
}

.lyrics-container::-webkit-scrollbar {
  display: none;
  /* 隐藏滚动条（Chrome、Safari、Edge） */
}
</style>
