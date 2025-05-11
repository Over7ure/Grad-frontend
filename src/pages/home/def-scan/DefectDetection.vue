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
  },
  methods: {
    load() {
      axios.get('/api/csv/data_record', {responseType: 'text'}).then(res => {
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
      console.log('开始检测，文件信息:', row);
      const files_id = row.file_id_raw; // 使用原始ID进行请求
      let weight_file_id = this.$store.state.selectedWeightRawId; // 从Vuex store获取权重文件ID
      console.log('使用的文件ID:', files_id, '权重文件ID:', weight_file_id);

      if (!files_id) {
        ElMessage.error('缺少文件ID');
        console.error('检测中止：缺少文件ID');
        return;
      }

      if (!weight_file_id) {
        ElMessage.warning('未选择权重文件，请先在权重文件管理页面选择一个权重文件。');
        console.warn('检测警告：未选择权重文件');
        return;
      }

      const formData = new FormData();
      formData.append('files_id', files_id);
      formData.append('weight_file_id', weight_file_id);
      console.log('准备发送的FormData:', formData);

      try {
        console.log('发送检测请求到 http://localhost:5130/start_predict');
        const predictRes = await axios.post('http://localhost:5130/start_predict', formData);
        console.log('收到检测响应:', predictRes);

        let hasDefect = false;
        if (predictRes.data && predictRes.data.code === 200 && predictRes.data.data.detection_results.length > 0) {
          const detectionResult = predictRes.data.data.detection_results[0];
          console.log('检测结果:', detectionResult);

          if (detectionResult.boxes && detectionResult.boxes.length > 0 && detectionResult.predict_file_id) {
            // 判断是否有异常目标
            const validBoxes = detectionResult.boxes.filter(b => b.confidence > 0.6);
            const abnormalCount = validBoxes.filter(b => b.class_name === 0 || b.class_name === '0').length;
            hasDefect = abnormalCount > 0;
            // 获取预测文件的路径
            console.log('获取预测文件的路径，predict_file_id:', detectionResult.predict_file_id);
            const getPathFormData = new FormData();
            getPathFormData.append('files_id', detectionResult.predict_file_id);

            try {
              console.log('发送请求到 http://localhost:5130/get_files 以获取预测文件路径');
              const pathRes = await axios.post('http://localhost:5130/get_files', getPathFormData);
              console.log('收到获取路径响应:', pathRes);

              if (pathRes.data && pathRes.data.code === 200 && pathRes.data.data && Array.isArray(pathRes.data.data.results) && pathRes.data.data.results.length > 0 && pathRes.data.data.results[0].file_path) {
                let filePath = pathRes.data.data.results[0].file_path;
                // 清理路径，与 load 方法中的处理保持一致
                if (filePath.startsWith('/soft/_api/data/')) {
                  filePath = filePath.replace('/soft/_api/data/', '');
                }
                this.predictFileUrl = '/api/image/view?path=' + encodeURIComponent(filePath);
                this.predictFileId = detectionResult.predict_file_id; // 用于弹窗的 v-if 判断
                this.dialogVisible = true;
                ElMessage.success('检测到缺陷');
                console.log('成功检测到缺陷，预览URL:', this.predictFileUrl);
              } else {
                ElMessage.error('获取预测文件路径失败: ' + (pathRes.data.msg || '未能从 /get_files 获取有效数据或路径不存在'));
                console.error('从 /get_files 获取路径失败，响应数据:', pathRes.data);
                this.predictFileUrl = '';
                this.predictFileId = '';
              }
            } catch (pathError) {
              console.error('请求 /get_files 失败:', pathError);
              ElMessage.error('请求预测文件路径接口失败: ' + (pathError.response?.data?.msg || pathError.message || '网络错误'));
              this.predictFileUrl = '';
              this.predictFileId = '';
            }
          } else {
            hasDefect = false;
            ElMessage.success('未检测到缺陷');
            this.predictFileUrl = '';
            this.predictFileId = '';
          }
        } else {
          hasDefect = false;
          ElMessage.error('检测失败: ' + (predictRes.data.msg || '未能获取有效检测结果'));
          console.error('检测失败，响应数据:', predictRes.data);
          this.predictFileUrl = ''; // 清空URL
          this.predictFileId = ''; // 清空ID
        }
        // 新增：调用生产历史接口
        const today = new Date();
        const prodDate = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
        await axios.get('/api/prodHistory/saveOrUpdateToday', {
          params: {
            prodDate,
            hasDefect
          }
        });
      } catch (e) {
        console.error('检测请求发送失败:', e);
        ElMessage.error('检测请求发送失败: ' + (e.response?.data?.msg || e.message || '网络错误'));
        this.predictFileUrl = ''; // 清空URL
        this.predictFileId = ''; // 清空ID
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

