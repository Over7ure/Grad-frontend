<template>
  <!-- 搜索区域 -->
  <div class="search-container">
    <el-input v-model="fileName" :prefix-icon="Search" class="search-input" clearable
              placeholder="请输入文件名称"></el-input>
    <el-button :icon="Search" class="search-button" type="primary" @click="load">搜索</el-button>
  </div>

  <!-- 操作按钮区域 -->
  <div class="action-buttons-container">
    <el-button :icon="Upload" type="primary" @click="dialogVisible = true">上传文件</el-button>
  </div>

  <!-- 文件数据表格 -->
  <el-table :data="tableData" :header-cell-class-name="headerBg" border stripe @sort-change="handleSortChange">
    <el-table-column label="文件ID" prop="file_id" width="320" sortable></el-table-column>
    <el-table-column label="文件名称" prop="file_real_name" width="120" sortable></el-table-column>
    <el-table-column label="文件类型" prop="file_type" width="150" sortable></el-table-column>
    <el-table-column label="文件路径" prop="file_path" sortable></el-table-column>
    <el-table-column label="文件备注" prop="file_comment" width="150" sortable></el-table-column>
    <el-table-column label="上传时间" prop="file_create_time" width="170" sortable></el-table-column>
    <el-table-column align="center" label="操作" width="120">
      <template v-slot="scope">
        <el-button v-if="isImageFile(scope.row.file_type)" :icon="View" type="primary" @click="previewFile(scope.row)">预览</el-button>
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

  <!-- 文件预览对话框 -->
  <el-dialog v-model="previewVisible" title="文件预览" width="50%">
    <div class="image-preview-container">
      <el-image v-if="currentFile && currentFileUrl" :src="currentFileUrl" fit="contain"/>
    </div>
  </el-dialog>

  <!-- 文件上传对话框 -->
  <el-dialog v-model="dialogVisible" title="上传文件" width="30%">
    <el-upload
      v-model:file-list="uploadFileList"
      :auto-upload="false"
      multiple
      :on-change="handleFileChangeUnified"
      action="#"
      class="upload-container"
      drag>
      <el-icon class="el-icon--upload">
        <upload-filled/>
      </el-icon>
      <div class="el-upload__text">拖拽文件到此处或 <em>点击上传</em></div>
      <template #tip>
        <div class="el-upload__tip">
          支持上传以下文件类型：.pt、png、jpg、jpeg、zip、rar、7z，总大小不超过100MB。上传时只能选择单一文件类型。
        </div>
      </template>
    </el-upload>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button :loading="uploading" type="primary" @click="submitFilesUpload">上传文件</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import axios from 'axios';
import {Search, Upload, UploadFilled, View} from '@element-plus/icons-vue';
import {ElMessage} from 'element-plus';

export default {
  name: 'FilesUpload',
  computed: {
    Upload() { return Upload },
    Search() { return Search },
    View() { return View },
    currentFileUrl() {
      if (!this.currentFile) return '';
      // 构建当前文件的预览URL
      return `/docker_files/${encodeURIComponent(this.currentFile.file_path)}`;
    }
  },
  components: { UploadFilled },
  data() {
    return {
      dialogVisible: false,
      previewVisible: false,
      currentFile: null,       // 当前预览的文件
      uploadFileList: [],
      uploading: false,
      tableData: [],           // 显示的数据
      allData: [],             // 从CSV加载的所有数据
      filteredData: [],        // 过滤后的数据
      total: 0,
      pageNum: 1,
      pageSize: 6,
      fileName: '',            // 文件名称搜索关键字
      headerBg: 'headerBg',
      sortProp: '',            // 排序属性
      sortOrder: '',           // 排序顺序
    }
  },
  created() {
    this.load()
  },
  methods: {
    // 直接使用 axios 读取本地 CSV 文件数据
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
                  // 假设格式为 YYYYMMDDHHmm
                  obj.file_create_time = obj.file_create_time.substring(0,4) + '-' +
                    obj.file_create_time.substring(4,6) + '-' +
                    obj.file_create_time.substring(6,8) + ' ' +
                    obj.file_create_time.substring(8,10) + ':' +
                    obj.file_create_time.substring(10,12);
                }
              }
              if (!obj.file_type.includes('folder')) {
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
    
    // 解析CSV行，处理字段中可能包含逗号的情况
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
    
    // 过滤和排序数据
    filterAndSortData() {
      // 搜索过滤
      let filtered = this.allData;
      if (this.fileName) {
        const searchTerm = this.fileName.toLowerCase();
        filtered = filtered.filter(item => 
          item.file_real_name.toLowerCase().includes(searchTerm)
        );
      }
      
      // 排序
      if (this.sortProp && this.sortOrder) {
        filtered.sort((a, b) => {
          let valA = a[this.sortProp];
          let valB = b[this.sortProp];
          
          // 如果是数值，进行数值排序
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
    
    // 应用分页
    applyPagination() {
      const start = (this.pageNum - 1) * this.pageSize;
      const end = Math.min(start + this.pageSize, this.filteredData.length);
      this.tableData = this.filteredData.slice(start, end);
    },
    
    // 处理排序变化
    handleSortChange(column) {
      this.sortProp = column.prop;
      this.sortOrder = column.order;
      this.filterAndSortData();
    },
    
    // 判断是否为图片文件
    isImageFile(fileType) {
      return fileType && fileType.toLowerCase().includes('images');
    },
    
    // 文件预览
    previewFile(file) {
      this.currentFile = file;
      this.previewVisible = true;
    },
    
    // 分页大小变化
    handleSizeChange(pageSize) {
      this.pageSize = pageSize;
      this.applyPagination();
    },
    
    // 页码变化
    handleCurrentChange(pageNum) {
      this.pageNum = pageNum;
      this.applyPagination();
    },
    
    // 文件选择变化处理
    handleFileChangeUnified(file) {
      // 定义允许的文件扩展名及分组
      const allowed = {
        weight: ['.pt'],
        image: ['.png', '.jpg', '.jpeg'],
        archive: ['.zip', '.rar', '.7z']
      };
      const fileName = file.raw.name.toLowerCase();
      // 判断当前文件所属分组
      let fileGroup = null;
      for (const group in allowed) {
        if (allowed[group].some(ext => fileName.endsWith(ext))) {
          fileGroup = group;
          break;
        }
      }
      if (!fileGroup) {
        ElMessage.error('文件类型不支持!');
        this.uploadFileList.pop();
        return;
      }
      // 检查上传列表中是否存在文件且类型必须一致
      if (this.uploadFileList.length > 1) {
        // 取第一个文件所属分组
        const firstName = this.uploadFileList[0].raw.name.toLowerCase();
        let firstGroup = null;
        for (const group in allowed) {
          if (allowed[group].some(ext => firstName.endsWith(ext))) {
            firstGroup = group;
            break;
          }
        }
        if (firstGroup && firstGroup !== fileGroup) {
          ElMessage.error('一次只能上传同一类型的文件!');
          this.uploadFileList.pop();
          return;
        }
      }
      // 累计总大小判断（单位：字节）
      const totalSize = this.uploadFileList.reduce((sum, f) => sum + f.raw.size, 0);
      if (totalSize > 104857600) {
        ElMessage.error('总大小不能超过100MB!');
        this.uploadFileList.pop();
      }
    },
    
    // 文件上传
    submitFilesUpload() {
      if (this.uploadFileList.length === 0) {
        ElMessage.warning('请选择要上传的文件');
        return;
      }
      this.uploading = true;
      const formData = new FormData();
      this.uploadFileList.forEach(file => {
        formData.append('files', file.raw);
      });
      axios.post("http://localhost:5130/upload_files", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      .then(response => {
        if(response.data.code === 200){
          ElMessage.success('文件上传成功');
          this.dialogVisible = false;
          this.uploadFileList = [];
          // 上传成功后重新加载CSV数据
          this.load();
        } else {
          ElMessage.error(response.data.code+": "+response.data.msg);
        }
      })
      .catch(error => {
        console.error('上传错误:', error);
        ElMessage.error('上传失败: ' + (error.response?.data?.msg || error.message || '未知错误'));
      })
      .finally(() => {
        this.uploading = false;
      });
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

.upload-container {
  width: 100%;
}

.image-preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-preview-container .el-image {
  max-height: 60vh;
}

.empty-state {
  margin: 20px 0;
  text-align: center;
}

/* 选项卡内容的样式 */
.el-tabs__content {
  padding: 15px 0;
}
</style>
