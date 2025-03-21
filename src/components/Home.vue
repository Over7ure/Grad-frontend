<template>
  <el-container class="home">
    <!--Aside-->
    <SideMenu :isCollapse="isCollapse" :logoTextShow="logoTextShow" :sideWidth="sideWidth"/>
    <el-container>
      <!--Header-->
      <el-header>
        <Header :isCollapse="isCollapse" :loginUser="loginUser" @collapse="collapse" @logout="logout"/>
      </el-header>
      <el-main>
        <!--Viewer-->
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
      loginUser: localStorage.getItem('user' || '[]') == null ? '' : JSON.parse(window.localStorage.getItem('user' || '[]')).username,
      isCollapse: false,
      sideWidth: 200,
      logoTextShow: true,
    }
  },
  methods: {
    collapse() {
      this.isCollapse = !this.isCollapse
      if (this.isCollapse) {
        this.sideWidth = 64
        this.logoTextShow = false
      } else {
        this.sideWidth = 200
        this.logoTextShow = true
      }
    },
    logout() {
      localStorage.removeItem('user');
      this.$router.push({name: '登录'});
    }
  }
}
</script>

<style scoped>

</style>
