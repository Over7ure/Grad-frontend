<template>
  <!-- 搜索区域 -->
  <div class="search-container">
    <el-input v-model="picName" :prefix-icon="Search" class="search-input" clearable
              placeholder="请输入图片名称"></el-input>
    <el-button :icon="Search" class="search-button" type="primary" @click="load">搜索</el-button>
  </div>

  <!-- 操作按钮区域 -->
  <div class="action-buttons-container">
    <el-button :icon="Upload" type="primary" @click="dialogVisible = true">上传图片</el-button>
  </div>

  <!-- 图片数据表格 -->
  <el-table :data="tableData" :header-cell-class-name="headerBg" border stripe>
    <el-table-column label="ID" prop="picId" width="80"></el-table-column>
    <el-table-column label="图片名称" prop="picName" width="180"></el-table-column>
    <el-table-column label="上传时间" prop="uploadDate"></el-table-column>
    <el-table-column label="图片地址" prop="picUrl"></el-table-column>
    <el-table-column align="center" label="操作" width="200">
      <template v-slot="scope">
        <el-button :icon="View" type="primary" @click="previewImage(scope.row)">预览</el-button>
        <el-button :icon="Remove" type="danger" @click="deleteImage(scope.row.picId)">删除</el-button>
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

  <!-- 图片预览对话框 -->
  <el-dialog v-model="previewVisible" title="图片预览" width="50%">
    <div class="image-preview-container">
      <el-image v-if="currentImage && currentImageUrl" :src="currentImageUrl" fit="contain"/>
    </div>
  </el-dialog>

  <!-- 图片上传对话框 -->
  <el-dialog v-model="dialogVisible" title="上传图片" width="30%">
    <el-upload
        v-model:file-list="fileList"
        :auto-upload="false"
        :limit="5"
        :on-change="handleFileChange"
        action="#"
        class="upload-container"
        drag
        multiple>
      <el-icon class="el-icon--upload">
        <upload-filled/>
      </el-icon>
      <div class="el-upload__text">拖拽文件到此处或 <em>点击上传</em></div>
      <template #tip>
        <div class="el-upload__tip">支持jpg/png/gif/ico格式图片，且不超过5MB</div>
      </template>
    </el-upload>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button :loading="uploading" type="primary" @click="submitUpload">上传</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import axios from "axios";
import {Remove, Search, Upload, UploadFilled, View} from "@element-plus/icons-vue";
import {ElMessage, ElMessageBox} from 'element-plus';

export default {
  name: 'ImagesUpload',
  computed: {
    // 图标组件计算属性
    Upload() {
      return Upload
    },
    Search() {
      return Search
    },
    View() {
      return View
    },
    Remove() {
      return Remove
    },
    // 获取当前图片URL的计算属性
    currentImageUrl() {
      if (!this.currentImage) return '';
      return this.currentImage.picUrl || '';
    }
  },
  components: {
    UploadFilled
  },
  data() {
    return {
      dialogVisible: false,      // 上传对话框显示状态
      previewVisible: false,     // 预览对话框显示状态
      currentImage: null,        // 当前预览的图片
      fileList: [],              // 待上传文件列表
      uploading: false,          // 上传状态标识
      tableData: [],             // 表格数据
      total: 0,                  // 数据总数
      pageNum: 1,                // 当前页码
      pageSize: 6,               // 每页数据量
      picName: '',               // 图片名称搜索关键字
      headerBg: 'headerBg',      // 表头样式类名
      baseUrl: '/public/'        // 基础URL路径
    }
  },
  created() {
    // 组件创建时加载数据
    this.load()
  },
  methods: {
    // 加载图片数据列表
    load() {
      axios.get(`http://localhost:9090/api/image/findPage`, {
        params: {
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          picName: this.picName
        }
      }).then(res => {
        this.tableData = res.data.data
        this.total = res.data.total
      }).catch(error => {
        ElMessage.error(error);
      })
    },
    // 处理页面大小变化
    handleSizeChange(pageSize) {
      this.pageSize = pageSize
      this.load()
    },
    // 处理页码变化
    handleCurrentChange(pageNum) {
      this.pageNum = pageNum
      this.load()
    },
    // 预览图片
    previewImage(image) {
      this.currentImage = image
      this.previewVisible = true
    },
    // 删除图片
    deleteImage(id) {
      ElMessageBox.confirm('确定要删除这张图片吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        axios.delete(`http://localhost:9090/api/image/delete/${id}`)
            .then(res => {
              if (res.data.code === 200) {
                ElMessage.success('删除成功')
                this.load()
              } else {
                ElMessage.error(res.data.message || '删除失败')
              }
            })
            .catch(error => {
              ElMessage.error('删除失败')
            })
      }).catch(() => {
        // 用户取消删除，不做任何操作
      })
    },
    // 文件选择变化处理
    handleFileChange(file) {
      // 验证文件类型和大小
      const isImage = file.raw.type.startsWith('image/');
      const isLt5M = file.raw.size / 1024 / 1024 < 5;

      if (!isImage) {
        ElMessage.error('只能上传图片文件!');
        this.fileList.pop();
      }
      if (!isLt5M) {
        ElMessage.error('图片大小不能超过5MB!');
        this.fileList.pop();
      }
    },
    // 提交上传
    submitUpload() {
      if (this.fileList.length === 0) {
        ElMessage.warning('请选择要上传的图片');
        return;
      }

      this.uploading = true;
      const uploadPromises = [];
      const results = {
        success: 0,
        failed: 0,
        failedFiles: []
      };

      // 逐个上传文件
      this.fileList.forEach(file => {
        const reader = new FileReader();
        reader.readAsDataURL(file.raw);

        const promise = new Promise((resolve) => {
          reader.onload = () => {
            const picUrl = reader.result; // Base64编码的数据URL
            const picName = file.name;    // 使用原始文件名

            // 发送请求到后端
            axios.post('http://localhost:9090/api/image/uploadManually', {
              picUrl: picUrl,
              picName: picName
            })
                .then(response => {
                  if (response.data.code === 200) {
                    results.success++;
                    resolve();
                  } else {
                    results.failed++;
                    results.failedFiles.push(picName);
                    resolve();
                  }
                })
                .catch(() => {
                  results.failed++;
                  results.failedFiles.push(picName);
                  resolve(); // 继续处理其他上传
                });
          };

          reader.onerror = () => {
            results.failed++;
            results.failedFiles.push(file.name);
            resolve(); // 继续处理其他上传
          };
        });

        uploadPromises.push(promise);
      });

      // 处理所有上传任务
      Promise.all(uploadPromises)
          .then(() => {
            if (results.failed === 0) {
              ElMessage.success(`所有${results.success}张图片上传成功`);
            } else if (results.success > 0) {
              ElMessage.warning(`${results.success}张图片上传成功，${results.failed}张上传失败`);
            } else {
              ElMessage.error('所有图片上传失败');
            }

            if (results.success > 0) {
              this.dialogVisible = false;
              this.fileList = [];
              this.load(); // 上传后刷新图片列表
            }
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
</style>
