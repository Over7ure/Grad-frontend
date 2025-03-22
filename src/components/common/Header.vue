<template>
  <el-header class="home-container-header">
    <div class="collapse-button-container">
      <span class="collapse-button" @click="collapse">
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
          <el-dropdown-item class="dropdown-item">个人信息</el-dropdown-item>
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
  font-size: 12px;
  border-bottom: 1px solid #ccc;
  line-height: 60px;
  display: flex;
  align-items: center;
}

.collapse-button-container {
  flex: 1;
  font-size: 20px;
  display: flex;
  align-items: center;
}

.collapse-button {
  cursor: pointer;
  margin-right: 20px;
}

.page-title {
  font-size: 16px;
  font-weight: bold;
}

.user-dropdown {
  width: 70px;
  cursor: pointer;
}

.user-dropdown-trigger {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.arrow-icon {
  margin-left: 5px;
}

.dropdown-menu {
  padding: 10px;
}

.dropdown-item {
  font-size: 14px;
  padding: 5px 0;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-user {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-right: 5px;
}
</style>
