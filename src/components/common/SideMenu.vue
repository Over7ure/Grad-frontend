<template>
  <el-aside :width="sideWidth + 'px'" class="side-menu">
    <el-menu :collapse="isCollapse"
             :collapse-transition="false"
             :default-active="$route.path"
             :default-openeds="['']"
             active-text-color="#ffffff"
             background-color="#304156"
             class="side-menu-options"
             router
             text-color="#bfcbd9">
      <!-- 系统logo和标题 -->
      <div class="logo-container">
        <img alt="logo" class="logo-image" src="@/assets/logo.png">
        <transition name="fade">
          <span v-show="logoTextShow" class="logo-text">缺陷甄别系统</span>
        </transition>
      </div>
      
      <!-- 图像采集与传输菜单 -->
      <el-sub-menu index="img-acp-transfer">
        <template v-slot:title>
          <el-icon><Picture /></el-icon>
          <span>图像采集与传输</span>
        </template>
        <el-menu-item index="/filesUpload" class="submenu-item">
          <el-icon><Upload /></el-icon>
          <span>文件上传</span>
        </el-menu-item>
        <el-menu-item index="/dataCollection" class="submenu-item">
          <el-icon><DataLine /></el-icon>
          <span>实时数据采集</span>
        </el-menu-item>
        <el-menu-item index="/userList" class="submenu-item">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
      </el-sub-menu>
      
      <!-- 产品缺陷甄别菜单 -->
      <el-sub-menu index="def-scan">
        <template v-slot:title>
          <el-icon><Monitor /></el-icon>
          <span>产品缺陷甄别</span>
        </template>
        <el-menu-item index="/defectDetection" class="submenu-item">
          <el-icon><Search /></el-icon>
          <span>缺陷检查</span>
        </el-menu-item>
        <el-menu-item index="/showResult" class="submenu-item">
          <el-icon><Document /></el-icon>
          <span>检查结果</span>
        </el-menu-item>
      </el-sub-menu>
      
      <!-- 模型管理菜单 -->
      <el-sub-menu index="mod-mgt">
        <template v-slot:title>
          <el-icon><SetUp /></el-icon>
          <span>模型管理</span>
        </template>
        <el-menu-item index="/modelManagement" class="submenu-item">
          <el-icon><Connection /></el-icon>
          <span>算法模型管理</span>
        </el-menu-item>
        <el-menu-item index="/weightFileManagement" class="submenu-item">
          <el-icon><Files /></el-icon>
          <span>权重文件管理</span>
        </el-menu-item>
        <el-menu-item index="/modelTraining" class="submenu-item">
          <el-icon><Cpu /></el-icon>
          <span>模型训练</span>
        </el-menu-item>
      </el-sub-menu>
    </el-menu>
  </el-aside>
</template>

<script>
import {Picture, Upload, DataLine, User, Monitor, Search, Document, SetUp, Connection, Files, Cpu} from "@element-plus/icons-vue";

export default {
  name: 'SideMenu',
  props: {
    isCollapse: Boolean,  // 侧边栏是否折叠
    sideWidth: Number,    // 侧边栏宽度
    logoTextShow: Boolean // 是否显示logo文字
  },
  components: {
    Picture, Upload, DataLine, User, Monitor, Search, Document, SetUp, Connection, Files, Cpu
  }
}
</script>

<style scoped>
.side-menu {
  height: auto;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  transition: width 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden;
}

.side-menu-options {
  height: 100%;
  border-right: none;
  transition: width 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  border-bottom: 1px solid #263445;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.logo-image {
  width: 28px;
  height: 28px;
  object-fit: contain;
  margin-right: 8px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.logo-text {
  color: white;
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
  transition: opacity 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* 淡入淡出效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

:deep(.el-sub-menu__title) {
  padding-left: 20px !important;
  height: 50px;
  line-height: 50px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

:deep(.el-sub-menu__title .el-icon) {
  margin-right: 10px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.submenu-item {
  padding-left: 40px !important;
  height: 40px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

:deep(.el-menu-item.is-active) {
  background-color: #263445;
}

:deep(.el-menu-item:hover) {
  background-color: #263445;
}

/* 优化菜单项过渡效果 */
:deep(.el-sub-menu__title .el-sub-menu__icon-arrow) {
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

:deep(.el-menu--collapse) {
  width: 64px;
}

/* 修复折叠时的图标居中 */
:deep(.el-menu--collapse .el-sub-menu__title .el-icon),
:deep(.el-menu--collapse .el-menu-item .el-icon) {
  margin: 0;
  text-align: center;
  width: 100%;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* 折叠状态下图标效果增强 */
:deep(.el-menu--collapse .el-sub-menu__title .el-icon),
:deep(.el-menu--collapse .el-menu-item .el-icon) {
  transform: scale(1.1);
}

/* 子菜单箭头过渡 */
:deep(.el-sub-menu__icon-arrow) {
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
</style>

