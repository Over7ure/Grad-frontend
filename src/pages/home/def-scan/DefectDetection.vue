<template>
  <!-- 搜索区域 -->
  <div class="search-container">
    <el-input v-model="fileName" :prefix-icon="Search" class="search-input" clearable
              placeholder="请输入文件名称"></el-input>
    <el-button :icon="Search" class="search-button" native-type="button" type="primary" @click="filterAndSortData">
      搜索
    </el-button>
  </div>
  <!-- 缺陷检测文件表格 -->
  <el-table :data="tableData" :header-cell-class-name="headerBg" border stripe @sort-change="handleSortChange">
    <el-table-column label="文件ID" prop="file_id" sortable width="320"></el-table-column>
    <el-table-column label="文件名称" prop="file_real_name" sortable width="120"></el-table-column>
    <el-table-column label="文件类型" prop="file_type" sortable width="150"></el-table-column>
    <el-table-column label="文件路径" prop="file_path" sortable></el-table-column>
    <el-table-column label="上传时间" prop="file_create_time" sortable width="170"></el-table-column>
    <el-table-column align="center" label="操作" width="100">
      <template #default="scope">
        <div class="action-btn-wrapper">
          <el-button native-type="button" size="small" type="primary" @click="handleDetect(scope.row)">检测</el-button>
        </div>
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
  <!-- 检测结果弹窗 -->
  <el-dialog v-model="dialogVisible" title="检测结果" width="50%">
    <div class="image-preview-container">
      <el-image v-if="predictFileId && predictFileUrl" :src="predictFileUrl" fit="contain"/>
    </div>
  </el-dialog>
</template>

<script>
import axios from 'axios';
import {Search} from '@element-plus/icons-vue';
import {ElMessage} from 'element-plus';

export default {
  name: 'DefectDetection',
  computed: {
    Search() { return Search; },
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
      dialogVisible: false,
      predictFileId: '',
      predictFileUrl: '',
    };
  },
  created() {
    this.load(); // 调用 load 方法
    localStorage.removeItem('predictFileId');
  },
  methods: {
    load() {
      // 检查 localStorage
      const storedPredictFileId = localStorage.getItem('predictFileId');
      axios.get('/docker_files/data_record.csv', {responseType: 'text'}).then(res => {
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
              // 保存原始ID
              obj.file_id_raw = obj.file_id;
              // 移除 file_path 中的 "/soft/_api/data/"
              obj.file_path = obj.file_path.replace('/soft/_api/data/', '');

              if (storedPredictFileId && obj.file_id_raw === storedPredictFileId) {
                this.predictFileUrl = '/docker_files/' + encodeURIComponent(obj.file_path);
                this.predictFileId = storedPredictFileId; // 设置 predictFileId 以便弹窗能引用
              }

              // 仅保留 file_id 中末尾的 UUID 部分
              {
                const match = obj.file_id.match(/([a-f0-9-]{36})$/i);
                if (match) {
                  obj.file_id = match[1];
                }
              }

              // 标准化 file_create_time 格式
              {
                if (obj.file_create_time.includes('E') || obj.file_create_time.includes('.')) {
                  const num = parseFloat(obj.file_create_time);
                  const dt = new Date(num);
                  obj.file_create_time = dt.getFullYear() + '-' +
                      String(dt.getMonth() + 1).padStart(2, '0') + '-' +
                      String(dt.getDate()).padStart(2, '0') + ' ' +
                      String(dt.getHours()).padStart(2, '0') + ':' +
                      String(dt.getMinutes()).padStart(2, '0') + ':' +
                      String(dt.getSeconds()).padStart(2, '0');
                } else if (obj.file_create_time.length === 12) {
                  obj.file_create_time = obj.file_create_time.substring(0, 4) + '-' +
                      obj.file_create_time.substring(4, 6) + '-' +
                      obj.file_create_time.substring(6, 8) + ' ' +
                      obj.file_create_time.substring(8, 10) + ':' +
                      obj.file_create_time.substring(10, 12);
                }
              }
              // 只保留文件类型为 images-file 且备注为 images-file-None 的文件
              if (
                  obj.file_type === 'images-file' &&
                  obj.file_comment === 'images-file-None'
              ) {
                result.push(obj);
              }
            }
          }
          this.allData = result;
          this.filterAndSortData();

          if (this.predictFileUrl) {
            this.dialogVisible = true; // 直接显示预览框
          }

        } catch (error) {
          console.error('解析CSV数据失败:', error);
          ElMessage.error('无法解析文件数据: ' + error.message);
        }
      }).catch(error => {
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
        if (char === '"' && (i === 0 || line[i - 1] !== '\\')) {
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
            item.file_real_name.toLowerCase().includes(searchTerm),
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
    async handleDetect(row) {
      const files_id = row.file_id_raw; // 使用原始ID进行请求
      const weight_file_id = localStorage.getItem('selectedWeightRawId');
      if (!files_id || !weight_file_id) {
        ElMessage.error('缺少文件ID或权重文件ID');
        return;
      }
      const formData = new FormData();
      formData.append('files_id', files_id);
      formData.append('weight_file_id', weight_file_id);
      try {
        const res = await axios.post('/start_predict', formData);
        if (res.data && res.data.code === 200 && res.data.data.detection_results.length > 0) {
          const result = res.data.data.detection_results[0];
          if (result.boxes && result.boxes.length > 0) {
            // 将 predict_file_id (后端返回的预测结果文件ID) 存储到 localStorage
            localStorage.setItem('predictFileId', result.predict_file_id);
            // 刷新页面以触发 created 钩子中的恢复逻辑
            location.reload();
          } else {
            ElMessage.warning('未检测到缺陷');
          }
        } else {
          ElMessage.error('检测失败: ' + (res.data.msg || '未能获取有效检测结果'));
        }
      } catch (e) {
        console.error('检测请求发送失败:', e);
        ElMessage.error('检测请求发送失败: ' + (e.response?.data?.msg || e.message || '网络错误'));
      }
    },
  },
};
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

.action-btn-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 60vh; /* 与 FilesUpload.vue 保持一致 */
  background: #f8f8f8; /* 与 FilesUpload.vue 保持一致 */
  overflow: hidden;
}

.image-preview-container .el-image {
  width: 100% !important;
  height: 100% !important;
  object-fit: contain !important; /* 与 FilesUpload.vue 保持一致 */
  display: block;
  background: #f8f8f8; /* 与 FilesUpload.vue 保持一致 */
}
</style>

