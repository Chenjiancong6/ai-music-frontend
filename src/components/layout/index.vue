<template>
 <div class="layout-wrap">
  <FloatingButton />
  <div class="router-wrap">
    <RouterView />
  </div> 
 </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import FloatingButton  from './components/floating-button.vue';

</script>
<style lang="less" scoped>
.layout-wrap {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>