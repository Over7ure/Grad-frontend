<template>
  <el-container class="user-list-container">
    <!-- Aside -->
    <el-aside :width="sideWidth + 'px'" class="user-list-aside">
      <el-menu :collapse="isCollapse" :collapse-transition="false"
               :default-openeds="['']"
               active-text-color="#ffd04b"
               background-color="rgb(48, 65, 86)"
               class="user-list-menu"
               text-color="#fff">
        <div class="logo-container">
          <img alt="" class="logo-image" src="@/assets/logo.png">
          <b v-show="logoTextShow" class="logo-text">*****系统</b>
        </div>
        <el-sub-menu index="1">
          <template v-slot:title>
            <el-icon>
              <Menu/>
            </el-icon>
            <span>导航一</span>
          </template>
          <el-menu-item index="1-1">选项1</el-menu-item>
          <el-menu-item index="1-2">选项2</el-menu-item>
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

    <el-container>
      <!-- Header -->
      <el-header class="user-list-header">
        <div class="collapse-button-container">
          <span class="collapse-button" @click="collapse">
            <el-icon>
              <Component :is="isCollapse ? 'Expand' : 'Fold'"/>
            </el-icon>
          </span>
        </div>
        <el-dropdown class="user-dropdown">
          <span class="user-dropdown-trigger">
            王宸玮
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

      <el-main>
        <!-- Breadcrumb -->
        <div class="breadcrumb-container">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <!-- Search Inputs -->
        <div class="search-container">
          <el-input v-model="username" :suffix-icon="Search" class="search-input" placeholder="请输入名称" clearable></el-input>
<!--          <el-input :suffix-icon="Message" class="search-input" placeholder="请输入邮箱" clearable></el-input>-->
<!--          <el-input :suffix-icon="Position" class="search-input" placeholder="请输入地址" clearable></el-input>-->
          <el-button :icon="Search" class="search-button" type="primary" @click="load">搜索</el-button>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons-container">
          <el-button :icon="CirclePlus" type="primary">新增</el-button>
          <el-button :icon="Remove" type="danger">批量删除</el-button>
          <el-button :icon="Bottom" type="primary">导入</el-button>
          <el-button :icon="Top" type="primary">导出</el-button>
        </div>

        <!-- Table -->
        <el-table :data="tableData" :header-cell-class-name="headerBg" border stripe>
          <el-table-column label="ID" prop="id" width="80"></el-table-column>
          <el-table-column label="用户名" prop="username" width="140"></el-table-column>
          <el-table-column label="密码" prop="password" width="140"></el-table-column>
          <el-table-column label="邮箱" prop="email"></el-table-column>
          <el-table-column label="地址" prop="address"></el-table-column>
          <el-table-column label="创建时间" prop="createTime"></el-table-column>
          <el-table-column label="用户身份" prop="role"></el-table-column>
          <el-table-column align="center" label="操作" width="200">
            <template v-slot>
              <el-button :icon="Edit" type="success">编辑</el-button>
              <el-button :icon="Remove" type="danger">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- Pagination -->
        <div class="pagination-container">
          <el-pagination
              :current-page="pageNum"
              :page-size="pageSize"
              :page-sizes="[6, 12, 18]"
              :total="total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange">
          </el-pagination>
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import axios from "axios";
import {ArrowDown, Bottom, CirclePlus, Edit, Menu, Message, Position, Remove, Search, Top, Fold, Expand} from "@element-plus/icons-vue";

const debounce = (fn, delay) => {
  let timer = null;
  return function () {
    let context = this;
    let args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(context, args);
    }, delay);
  }
}
const _ResizeObserver = window.ResizeObserver;
window.ResizeObserver = class ResizeObserver extends _ResizeObserver {
  constructor(callback) {
    callback = debounce(callback, 16);
    super(callback);
  }
}

export default {
  name: 'UserList',
  computed: {
    Edit() {
      return Edit
    },
    Top() {
      return Top
    },
    Bottom() {
      return Bottom
    },
    Remove() {
      return Remove
    },
    CirclePlus() {
      return CirclePlus
    },
    Position() {
      return Position
    },
    Message() {
      return Message
    },
    Search() {
      return Search
    }
  },
  components: {ArrowDown, Menu, Expand, Fold},
  data() {
    return {
      tableData: [],
      total: 0,
      pageNum: 1,
      pageSize: 6,
      username: "",
      isCollapse: false,
      sideWidth: 200,
      logoTextShow: true,
      headerBg: 'headerBg'
    }
  },
  created() {
    this.load()
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
    load() {
      axios.get(`http://localhost:9090/user/findPage`, {
        params: {
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          username: this.username
        }
      }).then(res => {
        console.log(res.data)
        this.tableData = res.data.data
        this.total = res.data.total
      }).catch(error => {
        console.error(error)
      })
    },
    handleSizeChange(pageSize) {
      console.log(pageSize)
      this.pageSize = pageSize
      this.load()
    },
    handleCurrentChange(pageNum) {
      console.log(pageNum)
      this.pageNum = pageNum
      this.load()
    },
  }
}
</script>

<style scoped>
.user-list-container {
  min-height: 100vh;
}

.user-list-aside {
  box-shadow: 2px 0 6px rgb(0 21 41 / 35%);
}

.user-list-menu {
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

.user-list-header {
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

.breadcrumb-container {
  margin-bottom: 30px;
}

.search-container {
  margin: 10px 0;
}

.search-input {
  margin-left: 5px;
  width: 200px;
}

.search-button {
  margin-left: 5px;
}

.action-buttons-container {
  margin: 10px 0;
}

.pagination-container {
  padding: 10px 0;
}

.headerBg {
  background: #eee !important;
  color: grey;
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