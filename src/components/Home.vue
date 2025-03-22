<template>
  <el-container class="home">
    <!-- 侧边菜单栏 -->
    <SideMenu :isCollapse="isCollapse" :logoTextShow="logoTextShow" :sideWidth="sideWidth"/>
    <el-container>
      <!-- 页面顶部导航栏 -->
      <el-header>
        <Header :isCollapse="isCollapse" :loginUser="loginUser" @collapse="collapse" @logout="logout"/>
      </el-header>
      <!-- 主内容区域 -->
      <el-main>
        <router-view/>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import SideMenu from "@/components/common/SideMenu.vue";
import Header from "@/components/common/Header.vue";

export default {
  name: 'MyHome',
  components: {
    SideMenu,
    Header
  },
  data() {
    return {
      // 从本地存储获取当前登录用户信息
      loginUser: localStorage.getItem('user' || '[]') == null ? '' : JSON.parse(window.localStorage.getItem('user' || '[]')).username,
      isCollapse: false,  // 侧边栏是否折叠
      sideWidth: 200,     // 侧边栏宽度
      logoTextShow: true, // 是否显示logo文字
    }
  },
  methods: {
    // 处理侧边栏折叠/展开
    collapse() {
      this.isCollapse = !this.isCollapse
      if (this.isCollapse) {
        // 折叠状态
        this.sideWidth = 64
        this.logoTextShow = false
      } else {
        // 展开状态
        this.sideWidth = 200
        this.logoTextShow = true
      }
    },
    // 处理用户登出
    logout() {
      localStorage.removeItem('user');
      this.$router.push('/login');
    }
  }
}
</script>

<style scoped>
/* 主页样式可以在这里添加 */
</style>
