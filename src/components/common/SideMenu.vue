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
      <!-- 系统logo和标题 -->
      <div class="logo-container">
        <img alt="" class="logo-image" src="@/assets/logo.png">
        <b v-show="logoTextShow" class="logo-text">缺陷甄别系统</b>
      </div>
      
      <!-- 图像采集与传输菜单 -->
      <el-sub-menu index="img-acp-transfer">
        <template v-slot:title>
          <el-icon><Menu/></el-icon>
          <span>图像采集与传输</span>
        </template>
        <el-menu-item index="/imagesUpload">图像上传</el-menu-item>
        <el-menu-item index="/dataCollection">实时数据采集</el-menu-item>
        <el-menu-item index="/userList">用户管理</el-menu-item>
      </el-sub-menu>
      
      <!-- 产品缺陷甄别菜单 -->
      <el-sub-menu index="def-scan">
        <template v-slot:title>
          <el-icon><Menu/></el-icon>
          <span>产品缺陷甄别</span>
        </template>
        <el-menu-item index="/defectDetection">缺陷检查</el-menu-item>
        <el-menu-item index="/showResult">检查结果</el-menu-item>
      </el-sub-menu>
      
      <!-- 模型管理菜单 -->
      <el-sub-menu index="mod-mgt">
        <template v-slot:title>
          <el-icon><Menu/></el-icon>
          <span>模型管理</span>
        </template>
        <el-menu-item index="/modelManagement">算法模型管理</el-menu-item>
        <el-menu-item index="/weightFileManagement">权重文件管理</el-menu-item>
      </el-sub-menu>
    </el-menu>
  </el-aside>
</template>

<script>
import {Menu} from "@element-plus/icons-vue";

export default {
  name: 'SideMenu',
  props: {
    isCollapse: Boolean,  // 侧边栏是否折叠
    sideWidth: Number,    // 侧边栏宽度
    logoTextShow: Boolean // 是否显示logo文字
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
