<template>
  <div>
    <nav-menu/>
    <router-view/>
  </div>
</template>

<script>
import NavMenu from "@/components/common/NavMenu.vue";

export default {
  name: 'MyHome',
  components: {
    NavMenu
  }
}
</script>

<style scoped>

</style>
