<template>
  <el-menu
      :default-active="'/index'"
      active-text-color="#ffd04b"
      background-color="rgb(48, 65, 86)"
      mode="horizontal"
      router
      style="min-width: 1300px; box-shadow: 2px 0 6px rgb(0 21 41 / 35%);border-bottom: grey solid 1px;"
      text-color="#fff"
  >
    <el-menu-item v-for="(item,i) in navList" :key="i" :index="item.name">
      {{ item.navItem }}
    </el-menu-item>
  </el-menu>
</template>

<script>
export default {
  name: 'NavMenu',
  data() {
    return {
      navList: [
        {name: '/index', navItem: '首页'},
        {name: '/admin', navItem: '个人中心'},
        {name: '/users', navItem: '*****系统'},
      ]
    }
  }
}
</script>

<style scoped>
a {
  text-decoration: none;
}

span {
  pointer-events: none;
}
</style>
