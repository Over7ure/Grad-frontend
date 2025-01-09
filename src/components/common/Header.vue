<template>
  <el-header class="home-container-header">
    <div class="collapse-button-container">
      <span class="collapse-button" @click="collapse">
        <el-icon>
          <Component :is="isCollapse ? 'Expand' : 'Fold'"/>
        </el-icon>
      </span>
    </div>
    <el-dropdown class="user-dropdown">
      <span class="user-dropdown-trigger">
        {{ loginUser }}
        <el-icon>
          <ArrowDown/>
        </el-icon>
      </span>
      <template v-slot:dropdown>
        <el-dropdown-menu>
          <el-dropdown-item class="dropdown-item">个人信息</el-dropdown-item>
          <el-dropdown-item class="dropdown-item">退出</el-dropdown-item>
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
  methods: {
    collapse() {
      this.$emit('collapse');
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
}

.collapse-button-container {
  flex: 1;
  font-size: 20px;
}

.collapse-button {
  cursor: pointer;
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

.dropdown-item {
  font-size: 14px;
  padding: 5px 0;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>