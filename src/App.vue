<template>
  <keep-alive>
    <router-view v-if="$route.meta.keepAlive"/>
  </keep-alive>
  <router-view v-if="!$route.meta.keepAlive"/>
</template>

<script>
export default {
  name: 'app',
};
</script>

<style>
</style>
