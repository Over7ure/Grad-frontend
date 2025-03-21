<template>
  <!-- Search Inputs -->
  <div class="search-container">
    <el-input v-model="username" :prefix-icon="Search" class="search-input" clearable
              placeholder="请输入名称"></el-input>
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
    <el-table-column label="ID" prop="uid" width="80"></el-table-column>
    <el-table-column label="用户名" prop="username" width="140"></el-table-column>
    <el-table-column label="密码" prop="password" width="140"></el-table-column>
    <el-table-column label="邮箱" prop="email"></el-table-column>
    <el-table-column label="文件数" prop="fileNum"></el-table-column>
    <el-table-column label="创建时间" prop="createDate"></el-table-column>
    <el-table-column label="用户身份" prop="role">
      <template v-slot="scope">
        <span v-if="scope.row.role === 0">管理员</span>
        <span v-else-if="scope.row.role === 1">用户</span>
        <span v-else>{{ scope.row.role }}</span>
      </template>
    </el-table-column>
    <el-table-column label="是否禁用" prop="isDisable">
      <template v-slot="scope">
        <span v-if="scope.row.isDisable === 0">否</span>
        <span v-else-if="scope.row.isDisable === 1">是</span>
        <span v-else>{{ scope.row.isDisable }}</span>
      </template>
    </el-table-column>
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
</template>

<script>
import axios from "axios";
import {Bottom, CirclePlus, Edit, Remove, Search, Top} from "@element-plus/icons-vue";

export default {
  name: 'UserList',
  computed: {
    Edit() {
      return Edit
    },
    Top() {
      return Top
    },
    Remove() {
      return Remove
    },
    Bottom() {
      return Bottom
    },
    CirclePlus() {
      return CirclePlus
    },
    Search() {
      return Search
    }
  },
  data() {
    return {
      tableData: [],
      total: 0,
      pageNum: 1,
      pageSize: 6,
      username: '',
      headerBg: 'headerBg'
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      axios.get(`http://localhost:9090/api/user/findPage`, {
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
</style>

