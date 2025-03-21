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
        <b v-show="logoTextShow" class="logo-text">缺陷甄别系统</b>
      </div>
      <el-sub-menu index="1">
        <template v-slot:title>
          <el-icon>
            <Menu/>
          </el-icon>
          <span>图像采集与传输</span>
        </template>
        <el-menu-item index="1-1">图像上传</el-menu-item>
        <el-menu-item index="1-2">实时数据采集</el-menu-item>
        <el-menu-item index="/userList">用户管理</el-menu-item>
      </el-sub-menu>
      <el-sub-menu index="2">
        <template v-slot:title>
          <el-icon>
            <Menu/>
          </el-icon>
          <span>产品缺陷甄别</span>
        </template>
        <el-menu-item index="2-1">缺陷检查</el-menu-item>
        <el-menu-item index="2-2">检查结果</el-menu-item>
      </el-sub-menu>
      <el-sub-menu index="3">
        <template v-slot:title>
          <el-icon>
            <Menu/>
          </el-icon>
          <span>模型管理</span>
        </template>
        <el-menu-item index="3-1">算法模型管理</el-menu-item>
        <el-menu-item index="3-2">权重文件管理</el-menu-item>
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