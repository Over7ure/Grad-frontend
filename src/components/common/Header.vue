<template>
  <el-header class="home-container-header">
    <div class="collapse-button-container">
      <span class="collapse-button" @click="collapse" :class="{'is-collapsed': isCollapse}">
        <el-icon>
          <Component :is="isCollapse ? 'Expand' : 'Fold'"/>
        </el-icon>
      </span>
      <span class="page-title">{{ pageTitle }}</span>
    </div>
    <el-dropdown class="user-dropdown">
      <span class="user-dropdown-trigger">
        <span class="login-user">{{ loginUser }}</span>
        <el-icon class="arrow-icon">
          <ArrowDown/>
        </el-icon>
      </span>
      <template v-slot:dropdown>
        <el-dropdown-menu class="dropdown-menu">
          <el-dropdown-item class="dropdown-item" @click="logout">退出</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </el-header>
</template>

<script>
import {ArrowDown, Expand, Fold} from "@element-plus/icons-vue";

export default {
  name: 'HomeContainerHeader',
  // 接收父组件传递的属性
  props: {
    isCollapse: Boolean, // 侧边栏是否折叠
    loginUser: String    // 当前登录用户名
  },
  components: {ArrowDown, Expand, Fold},
  computed: {
    // 计算当前页面标题，根据路由匹配情况动态生成
    pageTitle() {
      const route = this.$route;
      const matched = route.matched;
      if (matched.length > 1) {
        return matched.map(r => r.name).join(' / ');
      }
      return route.name;
    }
  },
  methods: {
    // 触发侧边栏折叠/展开事件
    collapse() {
      this.$emit('collapse');
    },
    // 触发退出登录事件
    logout() {
      this.$emit('logout');
    }
  }
}
</script>

<style scoped>
.home-container-header {
  background: #304156;
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid #263445;
}

.collapse-button-container {
  flex: 1;
  font-size: 18px;
  display: flex;
  align-items: center;
}

.collapse-button {
  cursor: pointer;
  margin-right: 15px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  color: #bfcbd9;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 4px;
}

.collapse-button:hover {
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.05);
}

.collapse-button.is-collapsed:hover {
  transform: rotate(-180deg);
}

.collapse-button .el-icon {
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.collapse-button:active .el-icon {
  transform: scale(0.9);
}

.page-title {
  margin-left: 10px;
  padding-bottom: 2px;
  font-size: 18px;
  font-weight: 500;
  color: #bfcbd9;
  transition: opacity 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.user-dropdown {
  width: auto;
  cursor: pointer;
}

.user-dropdown-trigger {
  display: flex;
  align-items: center;
  outline: none;
  border: none;
  padding: 5px 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-dropdown-trigger:hover {
  background-color: rgba(255, 255, 255, 0.1);
  outline: none;
  border: none;
}

.arrow-icon {
  margin-left: 5px;
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  color: #bfcbd9;
}

.dropdown-menu {
  padding: 5px 0;
  background-color: #263445;
  border: 1px solid #1c2a3a;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.3);
}

.dropdown-item {
  font-size: 14px;
  padding: 8px 16px;
  color: #bfcbd9;
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.dropdown-item:hover {
  background-color: #263445;
  color: #ffffff;
}

.login-user {
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  outline: none;
  border: none;
}

.user-dropdown:hover .arrow-icon {
  transform: rotate(180deg);
}
</style>
