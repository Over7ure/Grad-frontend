<template>
  <div class="model-training-container">
    <!-- 标题和说明 -->
    <div class="page-header">
      <h2>模型训练</h2>
      <p class="description">通过以下步骤配置和启动模型训练流程</p>
    </div>

    <!-- 步骤指示器 -->
    <el-steps :active="currentStep" finish-status="success" class="steps-container">
      <el-step title="创建训练任务" description="初始化训练环境"></el-step>
      <el-step title="上传数据集" description="提供训练数据"></el-step>
      <el-step title="配置训练参数" description="设置训练超参数"></el-step>
      <el-step title="开始训练" description="启动训练流程"></el-step>
    </el-steps>

    <!-- 步骤1：创建训练任务 -->
    <el-card v-if="currentStep === 0" class="step-card">
      <template #header>
        <div class="card-header">
          <h3>第一步：创建训练任务</h3>
        </div>
      </template>
      <div class="card-content">
        <p>点击下方按钮创建新的训练任务，系统将为您初始化训练环境</p>
        <el-button 
          type="primary" 
          size="large" 
          @click.prevent="createTraining" 
          :loading="loading.creating" 
          class="action-button">
          <el-icon class="button-icon"><Plus /></el-icon>创建训练任务
        </el-button>
      </div>
    </el-card>

    <!-- 步骤2：上传数据集 -->
    <el-card v-else-if="currentStep === 1" class="step-card">
      <template #header>
        <div class="card-header">
          <h3>第二步：上传数据集</h3>
        </div>
      </template>
      <div class="card-content">
        <el-upload
          v-model:file-list="datasetFileList"
          :auto-upload="false"
          :multiple="false"
          :on-change="handleDatasetFileChange"
          action="#"
          class="upload-container"
          drag>
          <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
          <div class="el-upload__text">拖拽文件到此处或 <em>点击上传</em></div>
          <template #tip>
            <div class="el-upload__tip">
              支持上传.zip、.rar、.7z格式数据集文件，总大小不超过100MB
            </div>
          </template>
        </el-upload>
        <div class="action-row">
          <el-button @click="currentStep = 0">返回上一步</el-button>
          <el-button 
            type="primary" 
            @click.prevent="submitDatasetUpload" 
            :loading="loading.uploading" 
            :disabled="datasetFileList.length === 0">
            上传数据集
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 步骤3：训练配置 -->
    <el-card v-else-if="currentStep === 2" class="step-card">
      <template #header>
        <div class="card-header">
          <h3>第三步：训练配置</h3>
        </div>
      </template>
      <div class="card-content">
        <el-form 
          :model="trainConfig" 
          ref="trainConfigForm"
          :rules="formRules"
          label-position="top" 
          class="training-config-form">
          <div class="form-grid">
            <el-form-item label="项目名称" prop="pr_name">
              <el-input v-model="trainConfig.pr_name" placeholder="请输入项目名称" />
            </el-form-item>
            <el-form-item label="批次大小" prop="batch_size">
              <el-input-number v-model="trainConfig.batch_size" :min="1" :max="128" />
            </el-form-item>
            <el-form-item label="训练周期" prop="epochs">
              <el-input-number v-model="trainConfig.epochs" :min="1" :max="500" />
            </el-form-item>
            <el-form-item label="图片尺寸" prop="image_size">
              <el-select v-model="trainConfig.image_size" placeholder="选择图片尺寸">
                <el-option label="224x224" value="224"></el-option>
                <el-option label="256x256" value="256"></el-option>
                <el-option label="320x320" value="320"></el-option>
                <el-option label="384x384" value="384"></el-option>
                <el-option label="448x448" value="448"></el-option>
                <el-option label="512x512" value="512"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="学习率" prop="learning_rate">
              <el-select v-model="trainConfig.learning_rate" placeholder="选择学习率">
                <el-option label="0.1" value="0.1"></el-option>
                <el-option label="0.01" value="0.01"></el-option>
                <el-option label="0.001" value="0.001"></el-option>
                <el-option label="0.0001" value="0.0001"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="训练设备" prop="device">
              <el-radio-group v-model="trainConfig.device">
                <el-radio label="cuda">GPU (CUDA)</el-radio>
                <el-radio label="cpu">CPU</el-radio>
              </el-radio-group>
            </el-form-item>
          </div>
          <div class="action-row">
            <el-button @click="currentStep = 1">返回上一步</el-button>
            <el-button type="primary" @click="validateAndContinue">下一步</el-button>
          </div>
        </el-form>
      </div>
    </el-card>

    <!-- 步骤4：确认并开始训练 -->
    <el-card v-else-if="currentStep === 3" class="step-card">
      <template #header>
        <div class="card-header">
          <h3>第四步：确认并开始训练</h3>
        </div>
      </template>
      <div class="card-content">
        <div class="config-summary">
          <h4>训练配置摘要</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="项目名称">{{ trainConfig.pr_name }}</el-descriptions-item>
            <el-descriptions-item label="批次大小">{{ trainConfig.batch_size }}</el-descriptions-item>
            <el-descriptions-item label="训练周期">{{ trainConfig.epochs }}</el-descriptions-item>
            <el-descriptions-item label="图片尺寸">{{ trainConfig.image_size }}x{{ trainConfig.image_size }}</el-descriptions-item>
            <el-descriptions-item label="学习率">{{ trainConfig.learning_rate }}</el-descriptions-item>
            <el-descriptions-item label="训练设备">{{ trainConfig.device === 'cuda' ? 'GPU (CUDA)' : 'CPU' }}</el-descriptions-item>
          </el-descriptions>
        </div>
        <div class="action-row">
          <el-button @click="currentStep = 2">返回修改配置</el-button>
          <el-button type="primary" @click.prevent="startTraining" :loading="loading.training">
            <el-icon class="button-icon"><VideoPlay /></el-icon>开始训练
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 训练已开始状态 -->
    <el-card v-else class="step-card">
      <template #header>
        <div class="card-header">
          <h3>训练进行中</h3>
        </div>
      </template>
      <div class="card-content">
        <div class="training-status">
          <el-result
            icon="success"
            title="训练任务已成功启动"
            sub-title="训练任务正在后台进行中，您可以在任务管理页面查看训练进度">
            <template #extra>
              <el-button type="primary" @click="resetTraining">创建新的训练任务</el-button>
              <el-button @click="goToTaskList">查看任务列表</el-button>
            </template>
          </el-result>
        </div>
      </div>
    </el-card>

    <!-- 加载中遮罩 -->
    <div v-if="loading.overlay" class="custom-overlay">
      <div class="overlay-content">
        <el-icon class="is-loading" :size="30"><Loading /></el-icon>
        <p>{{ loading.message }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { UploadFilled, Plus, VideoPlay, Loading } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { defineComponent, ref, reactive, onMounted, watch } from "vue";

export default defineComponent({
  name: 'ModelTraining',
  components: {
    UploadFilled,
    Plus,
    VideoPlay,
    Loading
  },
  setup() {
    // 数据定义
    const currentStep = ref(0);
    const folderId = ref('');
    const yamlFileId = ref(''); // 新增: 保存yaml文件ID
    const datasetFileList = ref([]);
    const trainConfigForm = ref(null);

    // 表单数据与验证规则
    const trainConfig = reactive({
      pr_name: '',
      batch_size: 32,
      epochs: 10,
      image_size: '224',
      learning_rate: '0.001',
      device: 'cuda'
    });

    const formRules = {
      pr_name: [
        { required: true, message: '请输入项目名称', trigger: 'blur' },
        { min: 2, max: 50, message: '项目名称长度应为2-50个字符', trigger: 'blur' }
      ],
      batch_size: [
        { required: true, message: '请设置批次大小', trigger: 'change' },
        { type: 'number', min: 1, message: '批次大小必须大于0', trigger: 'change' }
      ],
      epochs: [
        { required: true, message: '请设置训练周期', trigger: 'change' },
        { type: 'number', min: 1, message: '训练周期必须大于0', trigger: 'change' }
      ],
      image_size: [
        { required: true, message: '请选择图片尺寸', trigger: 'change' }
      ],
      learning_rate: [
        { required: true, message: '请选择学习率', trigger: 'change' }
      ],
      device: [
        { required: true, message: '请选择训练设备', trigger: 'change' }
      ]
    };

    // 状态持久化相关方法
    const saveState = () => {
      const state = {
        currentStep: currentStep.value,
        folderId: folderId.value,
        yamlFileId: yamlFileId.value, // 新增: 保存yaml_file_id到状态中
        trainConfig: { ...trainConfig }
      };
      localStorage.setItem('modelTrainingState', JSON.stringify(state));
    };

    const loadState = () => {
      const savedState = localStorage.getItem('modelTrainingState');
      if (savedState) {
        try {
          const state = JSON.parse(savedState);
          currentStep.value = state.currentStep;
          folderId.value = state.folderId;
          yamlFileId.value = state.yamlFileId || ''; // 新增: 恢复yaml_file_id

          if (state.trainConfig) {
            Object.assign(trainConfig, state.trainConfig);
          }

          return true;
        } catch (e) {
          console.error('Error parsing saved training state:', e);
          return false;
        }
      }
      return false;
    };

    const clearState = () => {
      localStorage.removeItem('modelTrainingState');
    };

    // 监听关键状态变化
    watch([currentStep, folderId, yamlFileId], () => { // 新增: 监听yamlFileId变化
      // 只有当不是初始状态时才保存
      if (currentStep.value > 0 || folderId.value || yamlFileId.value) {
        saveState();
      }
    });

    // 加载状态管理
    const loading = reactive({
      creating: false,
      uploading: false,
      training: false,
      overlay: false,
      message: ''
    });

    // API请求封装
    const api = {
      // 创建训练任务
      createTraining: () => {
        loading.creating = true;
        loading.overlay = true;
        loading.message = '正在创建训练任务...';
        
        const formData = new FormData();
        return axios.post("http://localhost:5130/create_train", formData, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            'X-Requested-With': 'XMLHttpRequest' // 添加AJAX标识
          }
        })
        .then(response => {
          if (response.data.code === 200) {
            folderId.value = response.data.data.folder_id;
            ElMessage.success("训练任务创建成功");
            currentStep.value = 1; // 进入上传数据集步骤
            saveState(); // 保存当前状态
            return true;
          } else {
            throw new Error(response.data.msg || "创建训练任务失败");
          }
        })
        .catch(error => {
          // 针对性处理重定向响应
          if (error.response && (error.response.status === 301 || error.response.status === 302)) {
            console.log("拦截到重定向，不执行页面跳转");
            folderId.value = error.response.data?.folder_id || '';
            ElMessage.success("训练任务创建成功");
            currentStep.value = 1;
            saveState(); // 保存当前状态
            return true;
          } else {
            console.error("创建训练流程失败:", error);
            ElMessage.error(error.message || "请求失败");
            clearState(); // 添加: 发生错误时清除状态
            return false;
          }
        })
        .finally(() => {
          loading.creating = false;
          loading.overlay = false;
        });
      },

      // 上传数据集
      uploadDataset: (files) => {
        loading.uploading = true;
        loading.overlay = true;
        loading.message = '正在上传数据集...';
        
        try {
          const formData = new FormData();
          formData.append('folder_id', folderId.value);
          
          if (!files || files.length === 0) {
            throw new Error('没有选择文件');
          }
          
          // 检查并安全添加文件
          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file && file.raw) {
              formData.append('files', file.raw);
            } else {
              console.error('无效的文件对象:', file);
              throw new Error('存在无效的文件对象');
            }
          }
          
          // 使用常规 axios 实例，避免原型链问题
          return axios.post("http://localhost:5130/upload_datasets", formData, {
            headers: { 
              'Content-Type': 'multipart/form-data',
              'X-Requested-With': 'XMLHttpRequest' // 添加AJAX标识
            }
          })
          .then(response => {
            if(response.data.code === 200){
              // 修复: 使用正确的ElMessage格式
              if (response.data.data && response.data.data.yaml_file_id) {
                yamlFileId.value = response.data.data.yaml_file_id;
                console.log("获取yaml_file_id成功:", yamlFileId.value);
              } else {
                console.warn("响应中没有yaml_file_id");
                ElMessage.warning("响应中没有yaml_file_id");
              }

              ElMessage.success('数据集上传成功');
              currentStep.value = 2; // 进入训练配置步骤
              saveState(); // 保存当前状态
              return true;
            } else {
              throw new Error(response.data.msg || '数据集上传失败');
            }
          })
          .catch(error => {
            console.error('上传错误:', error);
            ElMessage.error('上传失败: ' + (error.response?.data?.msg || error.message || '未知错误'));
            clearState(); // 添加: 发生错误时清除状态
            return false;
          })
          .finally(() => {
            loading.uploading = false;
            loading.overlay = false;
          });
        } catch (err) {
          console.error('文件处理错误:', err);
          ElMessage.error(err.message || '准备上传数据时出错');
          loading.uploading = false;
          loading.overlay = false;
          return Promise.reject(err);
        }
      },
      
      // 开始训练
      startTraining: (config) => {
        loading.training = true;
        loading.overlay = true;
        loading.message = '正在启动训练...';
        
        try {
          const formData = new FormData();
          formData.append('yaml_id', yamlFileId.value);
          
          for (const key in config) {
            formData.append(key, config[key]);
          }
          
          return axios.post("http://localhost:5130/start_train", formData, {
            headers: { 
              'Content-Type': 'multipart/form-data',
              'X-Requested-With': 'XMLHttpRequest'
            }
          })
          .then(response => {
            if(response.data.code === 200){
              ElMessage.success("训练已成功启动");
              currentStep.value = 4; // 进入训练进行中状态
              saveState(); // 保存当前状态
              return true;
            } else {
              throw new Error(response.data.msg || "训练启动失败");
            }
          })
          .catch(error => {
            ElMessage.error(error.message || "请求失败");
            clearState(); // 添加: 发生错误时清除状态
            return false;
          })
          .finally(() => {
            loading.training = false;
            loading.overlay = false;
          });
        } catch (err) {
          console.error('训练参数处理错误:', err);
          ElMessage.error(err.message || '准备训练参数时出错');
          loading.training = false;
          loading.overlay = false;
          return Promise.reject(err);
        }
      }
    };

    // 处理函数
    const handleDatasetFileChange = (file) => {
      // 修复文件处理逻辑
      if (!file || !file.raw) {
        ElMessage.error('无效的文件对象');
        return;
      }
      
      const allowedExtensions = ['.zip', '.rar', '.7z'];
      const fileName = file.raw.name.toLowerCase();
      const isAllowed = allowedExtensions.some(ext => fileName.endsWith(ext));
      
      if (!isAllowed) {
        ElMessage.error('仅支持上传.zip、.rar、.7z格式压缩包');
        const index = datasetFileList.value.indexOf(file);
        if (index > -1) {
          datasetFileList.value.splice(index, 1);
        }
      }
    };

    const validateAndContinue = () => {
      trainConfigForm.value.validate((valid) => {
        if (valid) {
          currentStep.value = 3; // 进入确认步骤
          saveState(); // 保存当前状态
        }
      });
    };

    const resetTraining = () => {
      // 重置所有状态
      currentStep.value = 0;
      folderId.value = '';
      yamlFileId.value = ''; // 新增: 重置yaml_file_id
      datasetFileList.value = [];
      Object.assign(trainConfig, {
        pr_name: '',
        batch_size: 32,
        epochs: 10,
        image_size: '224',
        learning_rate: '0.001',
        device: 'cuda'
      });

      // 清除保存的状态
      clearState();
    };

    const goToTaskList = () => {
      // 跳转到任务列表页面
      // 可以根据实际路由配置进行修改
      // this.$router.push('/task-list');

      // 清除保存的状态，因为我们已经完成了整个流程
      clearState();
    };

    const createTraining = (event) => {
      if (event) {
        event.preventDefault(); // 显式阻止默认行为
      }
      return api.createTraining();
    };

    const submitDatasetUpload = (event) => {
      if (event) {
        event.preventDefault(); // 显式阻止默认行为
      }
      
      if (!datasetFileList.value || datasetFileList.value.length === 0) {
        ElMessage.warning('请先选择要上传的数据集文件');
        return false;
      }
      
      return api.uploadDataset(datasetFileList.value);
    };

    const startTraining = (event) => {
      if (event) {
        event.preventDefault(); // 显式阻止默认行为
      }
      return api.startTraining(trainConfig);
    };

    // 在组件挂载时检查并恢复保存的状态
    onMounted(() => {
      loadState();
    });

    // 对外暴露的方法
    return {
      currentStep,
      trainConfig,
      datasetFileList,
      loading,
      formRules,
      trainConfigForm,
      
      createTraining,
      handleDatasetFileChange,
      submitDatasetUpload,
      validateAndContinue,
      startTraining,
      resetTraining,
      goToTaskList
    };
  }
});
</script>

<style scoped>
.model-training-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-header h2 {
  font-size: 28px;
  color: var(--el-color-primary);
  margin-bottom: 8px;
}

.page-header .description {
  color: #606266;
  font-size: 14px;
}

.steps-container {
  margin-bottom: 30px;
}

.step-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  color: var(--el-color-primary-dark-2);
  font-size: 18px;
}

.card-content {
  padding: 20px 0;
}

.action-button {
  margin-top: 15px;
  min-width: 150px;
}

.button-icon {
  margin-right: 6px;
}

.action-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  gap: 12px;
}

.upload-container {
  width: 100%;
}

.upload-container :deep(.el-upload-dragger) {
  width: 100%;
  height: 200px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.config-summary {
  margin-bottom: 30px;
}

.config-summary h4 {
  margin-bottom: 15px;
  color: #303133;
}

.custom-overlay {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
}

.overlay-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.overlay-content .is-loading {
  animation: rotating 2s linear infinite;
  color: var(--el-color-primary);
}

.overlay-content p {
  margin-top: 15px;
  color: white;
  font-size: 16px;
}

@keyframes rotating {
  0% {
    transform: rotateZ(0deg);
  }
  100% {
    transform: rotateZ(360deg);
  }
}

.training-status {
  text-align: center;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .action-row {
    flex-direction: column;
  }
  
  .action-row .el-button {
    margin-top: 10px;
    width: 100%;
  }
}
</style>

