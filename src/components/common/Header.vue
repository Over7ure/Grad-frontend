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
  props: {
    isCollapse: Boolean,
    loginUser: String
  },
  components: {ArrowDown, Expand, Fold},
  computed: {
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
    collapse() {
      this.$emit('collapse');
    },
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
  align-items: center; /* Ensure items are aligned properly */
}

.collapse-button-container {
  flex: 1;
  font-size: 20px;
  display: flex;
  align-items: center; /* Ensure items are aligned properly */
}

.collapse-button {
  cursor: pointer;
  margin-right: 20px; /* Add distance between collapse button and page title */
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
  margin-left: 5px; /* Add distance between username and arrow */
}

.dropdown-menu {
  padding: 10px; /* Add padding to dropdown menu */
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
  margin-right: 5px; /* Add distance between username and arrow */
}
</style>
