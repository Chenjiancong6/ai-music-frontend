<template>
  <div class="fab-container" ref="container">
    <button 
      class="fab-main"
      @click.stop="toggleMenu"
    >
      <i :class="[selectedIcon, { rotate: isRotating }]"></i>
    </button>
    
    <div class="fab-options" :class="{ active: isOpen }">
      <button
        v-for="option in options"
        :key="option.type"
        class="fab-option"
        :class="{ rotate: option.rotating }"
        @click.stop="selectOption(option)"
      >
        <i :class="option.icon"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
const isOpen = ref(false)
const isRotating = ref(false)
const container = ref(null)
const currentType = ref('video')
const router = useRouter()
const route = useRoute()

const options = ref([
  { 
    type: 'video',
    icon: 'fas fa-video',
    rotating: false
  },
  { 
    type: 'music',
    icon: 'fas fa-music',
    rotating: false
  }
])

const selectedIcon = computed(() => 
  currentType.value === 'video' ? 'fas fa-video' : 'fas fa-music'
)

const toggleMenu = () => {
  isOpen.value = !isOpen.value
  isRotating.value = true
  setTimeout(() => isRotating.value = false, 300)
}

const selectOption = (option) => {
  const id = route?.query.id;
  // 根据选项跳转到不同的页面
  if(option.type === 'video') {
    router.push(`/video?id=${id}`)
  }
  if(option.type === 'music') {
    router.push(`/audio?id=${id}`)
  }

  currentType.value = option.type
  option.rotating = true
  setTimeout(() => option.rotating = false, 300)
  closeMenu()
}

const closeMenu = () => {
  isOpen.value = false
}

const handleClickOutside = (e) => {
  if (!container.value?.contains(e.target)) {
    closeMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* 保持原有 CSS 样式不变 */
.fab-container {
  position: fixed;
  bottom: 10rem;
  right: 1rem;
  z-index: 1000;
}

.fab-main {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: #c3c3c3;
  border: none;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  cursor: pointer;
  transition: transform 0.3s, background 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fab-main i {
  color: white;
  font-size: 1.5rem;
  transition: transform 0.3s;
}

.fab-options {
  position: absolute;
  bottom: 70px;
  right: 0;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.fab-options.active {
  opacity: 1;
  visibility: visible;
}

.fab-option {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background: #c3c3c3;
  border: none;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  cursor: pointer;
  margin: 15px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateY(20px);
  opacity: 0;
  transition: all 0.3s ease;
}

.fab-option i {
  color: white;
  font-size: 1.2rem;
}

.fab-options.active .fab-option {
  transform: translateY(0);
  opacity: 1;
}

.fab-option:nth-child(1) {
  transition-delay: 0.05s;
}

.fab-option:nth-child(2) {
  transition-delay: 0.1s;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.rotate {
  animation: rotate 0.3s ease-in-out;
}
</style>