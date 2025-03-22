<template>
  <!-- 路由视图 - 应用主体内容区域 -->
  <router-view/>
</template>

<script>
export default {
  name: 'app',
}
</script>

<style>
/* 确保应用至少占满整个视口高度 */
#app {
  min-height: 100vh;
}
</style>
