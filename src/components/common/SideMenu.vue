<template>
  <el-aside :width="sideWidth + 'px'" class="side-menu">
    <el-menu :collapse="isCollapse"
             :collapse-transition="false"
             :default-active="''"
             :default-openeds="['']"
             active-text-color="#ffd04b"
             background-color="rgb(48, 65, 86)"
             class="side-menu-options"
             router
             text-color="#fff">
      <div class="logo-container">
        <img alt="" class="logo-image" src="@/assets/logo.png">
        <b v-show="logoTextShow" class="logo-text">*****系统</b>
      </div>
      <el-sub-menu index="userManagement">
        <template v-slot:title>
          <el-icon>
            <Menu/>
          </el-icon>
          <span>用户管理</span>
        </template>
        <el-menu-item index="/userList">用户信息</el-menu-item>
        <el-menu-item index="/index">选项2</el-menu-item>
      </el-sub-menu>
      <el-sub-menu index="2">
        <template v-slot:title>
          <el-icon>
            <Menu/>
          </el-icon>
          <span>导航二</span>
        </template>
        <el-sub-menu index="2-1">
          <template v-slot:title>选项1</template>
          <el-menu-item index="2-1-1">选项1-1</el-menu-item>
        </el-sub-menu>
      </el-sub-menu>
      <el-sub-menu index="3">
        <template v-slot:title>
          <el-icon>
            <Menu/>
          </el-icon>
          <span>导航三</span>
        </template>
        <el-menu-item index="3-1">选项1</el-menu-item>
      </el-sub-menu>
    </el-menu>
  </el-aside>
</template>

<script>
import {Menu} from "@element-plus/icons-vue";

export default {
  name: 'SideMenu',
  props: {
    isCollapse: Boolean,
    sideWidth: Number,
    logoTextShow: Boolean
  },
  components: {Menu}
}
</script>

<style scoped>
.side-menu {
  box-shadow: 2px 0 6px rgb(0 21 41 / 35%);
}

.side-menu-options {
  min-height: 100%;
  overflow-x: hidden;
}

.logo-container {
  height: 60px;
  line-height: 60px;
  text-align: center;
}

.logo-image {
  width: 20px;
  position: relative;
  top: 5px;
  right: 5px;
}

.logo-text {
  color: white;
}
</style>