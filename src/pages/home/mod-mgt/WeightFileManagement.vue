<template>
  <!-- 搜索区域 -->
  <div class="search-container">
    <el-input v-model="fileName" :prefix-icon="Search" class="search-input" clearable
              placeholder="请输入权重文件名称"></el-input>
    <el-button :icon="Search" class="search-button" type="primary" native-type="button" @click="load">搜索</el-button>
  </div>

  <!-- 权重文件表格 -->
  <el-table :data="tableData" :header-cell-class-name="headerBg" border stripe @sort-change="handleSortChange">
    <el-table-column label="文件ID" prop="file_id" width="320" sortable></el-table-column>
    <el-table-column label="文件名称" prop="file_real_name" width="120" sortable></el-table-column>
    <el-table-column label="文件类型" prop="file_type" width="150" sortable></el-table-column>
    <el-table-column label="文件路径" prop="file_path" sortable></el-table-column>
    <el-table-column label="文件备注" prop="file_comment" width="150" sortable></el-table-column>
    <el-table-column label="上传时间" prop="file_create_time" width="170" sortable></el-table-column>
    <!-- 新增选择列 -->
    <el-table-column align="center" label="选择" width="100">
      <template v-slot="scope">
        <el-button
          type="primary"
          size="small"
          :plain="selectedRawId !== scope.row.raw_file_id"
          @click="selectWeight(scope.row)"
        >
          {{ selectedRawId === scope.row.raw_file_id ? '已选择' : '选择' }}
        </el-button>
      </template>
    </el-table-column>
  </el-table>

  <!-- 分页控件 -->
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
import axios from 'axios';
import { Search } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

export default {
  name: 'WeightFileManagement',
  computed: {
    Search() { return Search }
  },
  data() {
    return {
      tableData: [],
      allData: [],
      filteredData: [],
      total: 0,
      pageNum: 1,
      pageSize: 6,
      fileName: '',
      headerBg: 'headerBg',
      sortProp: '',
      sortOrder: '',
      selectedRawId: null, // 新增：当前选中的原始ID
    }
  },
  created() {
    this.load();
  },
  methods: {
    load() {
      axios.get('/docker_files/data_record.csv', { responseType: 'text' })
      .then(res => {
        try {
          const data = res.data;
          const lines = data.split('\n').filter(line => line.trim() !== '');
          if (lines.length === 0) {
            this.allData = [];
            this.total = 0;
            this.tableData = [];
            return;
          }
          const headers = lines[0].split(',').map(h => h.trim());
          let result = [];
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            if (!line.trim()) continue;
            const values = this.parseCSVLine(line);
            if (values.length >= headers.length) {
              let obj = {};
              headers.forEach((header, index) => {
                obj[header] = values[index] !== undefined ? values[index].trim() : '';
              });
              // 移除 file_path 中的 "/soft/_api/data/"
              obj.file_path = obj.file_path.replace('/soft/_api/data/', '');
              // 仅保留 file_id 中末尾的 UUID 部分
              {
                const match = obj.file_id.match(/([a-f0-9-]{36})$/i);
                if (match) {
                  obj.file_id = match[1];
                }
              }
              // 新增：保存原始ID（未截断的file_id）到 raw_file_id 字段
              obj.raw_file_id = values[headers.indexOf('file_id')] || obj.file_id;
              // 标准化 file_create_time 格式
              {
                if (obj.file_create_time.includes('E') || obj.file_create_time.includes('.')) {
                  const num = parseFloat(obj.file_create_time);
                  const dt = new Date(num);
                  obj.file_create_time = dt.getFullYear() + '-' +
                    String(dt.getMonth()+1).padStart(2, '0') + '-' +
                    String(dt.getDate()).padStart(2, '0') + ' ' +
                    String(dt.getHours()).padStart(2, '0') + ':' +
                    String(dt.getMinutes()).padStart(2, '0') + ':' +
                    String(dt.getSeconds()).padStart(2, '0');
                } else if (obj.file_create_time.length === 12) {
                  obj.file_create_time = obj.file_create_time.substring(0,4) + '-' +
                    obj.file_create_time.substring(4,6) + '-' +
                    obj.file_create_time.substring(6,8) + ' ' +
                    obj.file_create_time.substring(8,10) + ':' +
                    obj.file_create_time.substring(10,12);
                }
              }
              // 只保留权重文件（.pt）
              if (obj.file_type && obj.file_type.toLowerCase().endsWith('weight')) {
                result.push(obj);
              }
            }
          }
          this.allData = result;
          this.filterAndSortData();
        } catch (error) {
          console.error('解析CSV数据失败:', error);
          ElMessage.error('无法解析文件数据: ' + error.message);
        }
      })
      .catch(error => {
        console.error('加载CSV文件失败:', error);
        ElMessage.error('加载文件数据失败: ' + error.message);
      });
    },
    parseCSVLine(line) {
      const values = [];
      let inQuotes = false;
      let currentValue = '';
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' && (i === 0 || line[i-1] !== '\\')) {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue);
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue);
      return values;
    },
    filterAndSortData() {
      let filtered = this.allData;
      if (this.fileName) {
        const searchTerm = this.fileName.toLowerCase();
        filtered = filtered.filter(item =>
          item.file_real_name.toLowerCase().includes(searchTerm)
        );
      }
      if (this.sortProp && this.sortOrder) {
        filtered.sort((a, b) => {
          let valA = a[this.sortProp];
          let valB = b[this.sortProp];
          if (!isNaN(Number(valA)) && !isNaN(Number(valB))) {
            valA = Number(valA);
            valB = Number(valB);
          } else {
            valA = String(valA).toLowerCase();
            valB = String(valB).toLowerCase();
          }
          if (this.sortOrder === 'ascending') {
            return valA > valB ? 1 : -1;
          } else {
            return valA < valB ? 1 : -1;
          }
        });
      }
      this.filteredData = filtered;
      this.total = filtered.length;
      this.applyPagination();
    },
    applyPagination() {
      const start = (this.pageNum - 1) * this.pageSize;
      const end = Math.min(start + this.pageSize, this.filteredData.length);
      this.tableData = this.filteredData.slice(start, end);
    },
    handleSortChange(column) {
      this.sortProp = column.prop;
      this.sortOrder = column.order;
      this.filterAndSortData();
    },
    handleSizeChange(pageSize) {
      this.pageSize = pageSize;
      this.applyPagination();
    },
    handleCurrentChange(pageNum) {
      this.pageNum = pageNum;
      this.applyPagination();
    },
    selectWeight(row) {
      this.selectedRawId = row.raw_file_id;
      // 可根据需要将ID存储到localStorage或emit事件
      localStorage.setItem('selectedWeightRawId', this.selectedRawId);
    }
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
.pagination-container {
  padding: 10px 0;
}
.headerBg {
  background: #eee !important;
  color: grey;
}
</style>
