<template>
  <div class="model-training-container">
    <!-- 标题和说明 -->
    <div class="page-header">
      <h2>模型训练</h2>
      <p class="description">通过以下步骤配置和启动模型训练流程</p>
    </div>

    <!-- 步骤指示器 -->
    <el-steps :active="currentStep" class="steps-container" finish-status="success">
      <el-step description="初始化训练环境" title="创建训练任务"></el-step>
      <el-step description="提供训练数据" title="上传数据集"></el-step>
      <el-step description="设置训练超参数" title="配置训练参数"></el-step>
      <el-step description="启动训练流程" title="开始训练"></el-step>
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
            :loading="loading.creating"
            class="action-button"
            native-type="button"
            size="large"
            type="primary"
            @click.prevent="createTraining">
          <el-icon class="button-icon">
            <Plus/>
          </el-icon>
          创建训练任务
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
          <el-icon class="el-icon--upload">
            <UploadFilled/>
          </el-icon>
          <div class="el-upload__text">拖拽文件到此处或 <em>点击上传</em></div>
          <template #tip>
            <div class="el-upload__tip">
              支持上传.zip、.rar、.7z格式数据集文件，总大小不超过100MB
            </div>
          </template>
        </el-upload>
        <div class="action-row">
          <el-button native-type="button" @click="currentStep = 0">返回上一步</el-button>
          <el-button
              :disabled="datasetFileList.length === 0"
              :loading="loading.uploading"
              native-type="button"
              type="primary"
              @click.prevent="submitDatasetUpload">
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
            ref="trainConfigForm"
            :model="trainConfig"
            :rules="formRules"
            class="training-config-form"
            label-position="top">
          <div class="form-grid">
            <el-form-item label="项目名称" prop="pr_name">
              <el-input v-model="trainConfig.pr_name" placeholder="请输入项目名称"/>
            </el-form-item>
            <el-form-item label="批次大小" prop="batch_size">
              <el-input v-model="trainConfig.batch_size" placeholder="default: 32"/>
            </el-form-item>
            <el-form-item label="训练周期" prop="epochs">
              <el-input v-model="trainConfig.epochs"/>
            </el-form-item>
            <el-form-item label="图片尺寸" prop="image_size">
              <el-input v-model="trainConfig.image_size" placeholder="default: 512*512"/>
            </el-form-item>
            <el-form-item label="学习率" prop="learning_rate">
              <el-input v-model="trainConfig.learning_rate" placeholder="default: 0.001"/>
            </el-form-item>
            <el-form-item label="训练设备" prop="device">
              <el-input v-model="trainConfig.device" placeholder="default: cuda"/>
            </el-form-item>
          </div>
          <div class="action-row">
            <el-button native-type="button" @click="currentStep = 1">返回上一步</el-button>
            <el-button native-type="button" type="primary" @click="validateAndContinue">下一步</el-button>
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
            <el-descriptions-item label="图片尺寸">{{ trainConfig.image_size }}</el-descriptions-item>
            <el-descriptions-item label="学习率">{{ trainConfig.learning_rate }}</el-descriptions-item>
          </el-descriptions>
        </div>
        <div class="action-row">
          <el-button native-type="button" @click="currentStep = 2">返回修改配置</el-button>
          <el-button :loading="loading.training" native-type="button" type="primary" @click.prevent="startTraining">
            <el-icon class="button-icon">
              <VideoPlay/>
            </el-icon>
            开始训练
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 训练已开始状态 -->
    <el-card v-else-if="currentStep===4" class="step-card">
      <template #header>
        <div class="card-header">
          <h3>训练进行中</h3>
        </div>
      </template>
      <div class="card-content">
        <div class="training-status">
          <div v-if="trainLog && trainLog.last_epoch" class="train-log-panel">
            <div class="train-log-header">
              <h4>最新训练日志</h4>
              <el-button :disabled="!trainLog" size="small" type="success" @click="exportTrainLogJson">
                导出JSON
              </el-button>
            </div>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="当前Epoch">{{ trainLog.last_epoch.epoch }}</el-descriptions-item>
              <el-descriptions-item label="训练耗时">{{ trainLog.last_epoch.time }}s</el-descriptions-item>
              <el-descriptions-item label="lr/pg0">{{ trainLog.last_epoch['lr/pg0'] }}</el-descriptions-item>
              <el-descriptions-item label="lr/pg1">{{ trainLog.last_epoch['lr/pg1'] }}</el-descriptions-item>
              <el-descriptions-item label="lr/pg2">{{ trainLog.last_epoch['lr/pg2'] }}</el-descriptions-item>
              <el-descriptions-item label="mAP50">{{ trainLog.last_epoch['metrics/mAP50(B)'] }}</el-descriptions-item>
              <el-descriptions-item label="mAP50-95">{{
                  trainLog.last_epoch['metrics/mAP50-95(B)']
                }}
              </el-descriptions-item>
              <el-descriptions-item label="Precision">{{
                  trainLog.last_epoch['metrics/precision(B)']
                }}
              </el-descriptions-item>
              <el-descriptions-item label="Recall">{{ trainLog.last_epoch['metrics/recall(B)'] }}</el-descriptions-item>
              <el-descriptions-item label="训练box损失">{{
                  trainLog.last_epoch['train/box_loss']
                }}
              </el-descriptions-item>
              <el-descriptions-item label="训练cls损失">{{
                  trainLog.last_epoch['train/cls_loss']
                }}
              </el-descriptions-item>
              <el-descriptions-item label="训练dfl损失">{{
                  trainLog.last_epoch['train/dfl_loss']
                }}
              </el-descriptions-item>
              <el-descriptions-item label="验证box损失">{{ trainLog.last_epoch['val/box_loss'] }}</el-descriptions-item>
              <el-descriptions-item label="验证cls损失">{{ trainLog.last_epoch['val/cls_loss'] }}</el-descriptions-item>
              <el-descriptions-item label="验证dfl损失">{{ trainLog.last_epoch['val/dfl_loss'] }}</el-descriptions-item>
            </el-descriptions>
            <!-- 新增：训练日志曲线图 -->
            <div
                v-if="trainLog && trainLog.total_epochs && trainLog.total_epochs.length"
                ref="chartRef"
                class="train-log-chart"
            ></div>
          </div>
          <el-result
              icon="success"
              sub-title="训练任务正在后台进行中，您可以在点击按钮查看训练进度"
              title="训练任务已成功启动">
            <template #extra>
              <el-button native-type="button" type="primary" @click="resetTraining">创建新的训练任务</el-button>
              <el-button native-type="button" @click="viewCurrentTrainStatus">查看当前任务训练状态</el-button>
            </template>
          </el-result>
        </div>
      </div>
    </el-card>

    <!-- 加载中遮罩 -->
    <div v-if="loading.overlay" class="custom-overlay">
      <div class="overlay-content">
        <el-icon :size="30" class="is-loading">
          <Loading/>
        </el-icon>
        <p>{{ loading.message }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import {Loading, Plus, UploadFilled, VideoPlay} from '@element-plus/icons-vue';
import {ElMessage} from 'element-plus';
import {defineComponent, onBeforeUnmount, onMounted, reactive, ref, watch} from 'vue';
import * as echarts from 'echarts';

export default defineComponent({
  name: 'ModelTraining',
  components: {
    UploadFilled,
    Plus,
    VideoPlay,
    Loading,
  },
  setup() {
    // 数据定义
    const currentStep = ref(0);
    const folderId = ref(''); // 训练数据存放路径ID
    const yamlFileId = ref(''); // yaml文件ID
    const trainSaveFolderId = ref(''); // 训练结果存放路径ID
    const weightFileId = ref(''); // 训练权重文件存放路径ID
    const datasetFileList = ref([]);
    const trainConfigForm = ref(null);

    // 表单数据与验证规则
    const trainConfig = reactive({
      pr_name: '',
      batch_size: null, // 允许为空
      epochs: 100, // 默认值 100
      image_size: '', // 允许为空
      learning_rate: '', // 允许为空
      device: '', // 允许为空
    });

    // 新增：训练日志相关
    const trainLog = ref(null);

    // 新增：echarts实例和图表数据
    const chartRef = ref(null);
    let chartInstance = null;

    // 新增：状态持久化
    const STORAGE_KEY = 'modelTrainingState';
    // 恢复状态
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const s = JSON.parse(saved);
        if (s.currentStep !== undefined) currentStep.value = s.currentStep;
        if (s.folderId) folderId.value = s.folderId;
        if (s.yamlFileId) yamlFileId.value = s.yamlFileId;
        if (s.trainSaveFolderId) trainSaveFolderId.value = s.trainSaveFolderId;
        if (s.weightFileId) weightFileId.value = s.weightFileId;
        if (s.trainConfig) Object.assign(trainConfig, s.trainConfig);
        if (Array.isArray(s.datasetFileList)) datasetFileList.value = s.datasetFileList;
      } catch (error) {
        console.log(error);
      }
    }
    // 监听关键状态变化并保存
    watch(
        [
          currentStep,
          folderId,
          yamlFileId,
          trainSaveFolderId,
          weightFileId,
          trainConfig,
          datasetFileList,
        ],
        () => {
          localStorage.setItem(
              STORAGE_KEY,
              JSON.stringify({
                currentStep: currentStep.value,
                folderId: folderId.value,
                yamlFileId: yamlFileId.value,
                trainSaveFolderId: trainSaveFolderId.value,
                weightFileId: weightFileId.value,
                trainConfig: {...trainConfig},
                datasetFileList: datasetFileList.value,
              }),
          );
        },
        {deep: true},
    );

    // 处理所有epoch日志为图表数据
    const getEpochChartData = () => {
      // 修改为 total_epochs
      if (!trainLog.value || !trainLog.value.total_epochs || !Array.isArray(trainLog.value.total_epochs)) return null;
      const epochs = trainLog.value.total_epochs;
      return {
        epochs: epochs.map(e => e.epoch),
        mAP50: epochs.map(e => e['metrics/mAP50(B)']),
        mAP50_95: epochs.map(e => e['metrics/mAP50-95(B)']),
        precision: epochs.map(e => e['metrics/precision(B)']),
        recall: epochs.map(e => e['metrics/recall(B)']),
        train_box_loss: epochs.map(e => e['train/box_loss']),
        train_cls_loss: epochs.map(e => e['train/cls_loss']),
        train_dfl_loss: epochs.map(e => e['train/dfl_loss']),
        val_box_loss: epochs.map(e => e['val/box_loss']),
        val_cls_loss: epochs.map(e => e['val/cls_loss']),
        val_dfl_loss: epochs.map(e => e['val/dfl_loss']),
        lr_pg0: epochs.map(e => e['lr/pg0']),
        lr_pg1: epochs.map(e => e['lr/pg1']),
        lr_pg2: epochs.map(e => e['lr/pg2']),
        time: epochs.map(e => e['time']),
      };
    };

    // 渲染echarts
    const renderChart = () => {
      if (!chartRef.value) return;
      const chartData = getEpochChartData();
      if (!chartData) return;
      if (!chartInstance) {
        chartInstance = echarts.init(chartRef.value);
      }
      const option = {
        tooltip: {trigger: 'axis'},
        legend: {
          data: [
            'mAP50', 'mAP50-95', 'Precision', 'Recall',
            '训练box损失', '训练cls损失', '训练dfl损失',
            '验证box损失', '验证cls损失', '验证dfl损失',
            'lr/pg0', 'lr/pg1', 'lr/pg2',
          ],
          top: 10,
        },
        grid: {left: 40, right: 20, bottom: 40, top: 70}, // 增大top，拉开legend与series距离
        xAxis: {
          type: 'category',
          data: chartData.epochs,
        },
        yAxis: [
          {type: 'value'},
        ],
        series: [
          {name: 'mAP50', type: 'line', data: chartData.mAP50},
          {name: 'mAP50-95', type: 'line', data: chartData.mAP50_95},
          {name: 'Precision', type: 'line', data: chartData.precision},
          {name: 'Recall', type: 'line', data: chartData.recall},
          {name: '训练box损失', type: 'line', data: chartData.train_box_loss},
          {name: '训练cls损失', type: 'line', data: chartData.train_cls_loss},
          {name: '训练dfl损失', type: 'line', data: chartData.train_dfl_loss},
          {name: '验证box损失', type: 'line', data: chartData.val_box_loss},
          {name: '验证cls损失', type: 'line', data: chartData.val_cls_loss},
          {name: '验证dfl损失', type: 'line', data: chartData.val_dfl_loss},
          {name: 'lr/pg0', type: 'line', data: chartData.lr_pg0},
          {name: 'lr/pg1', type: 'line', data: chartData.lr_pg1},
          {name: 'lr/pg2', type: 'line', data: chartData.lr_pg2},
        ],
      };
      chartInstance.setOption(option);
      chartInstance.resize();
    };

    // 加载状态管理
    const loading = reactive({
      creating: false,
      uploading: false,
      training: false,
      overlay: false,
      message: '',
    });

    // API请求封装
    const api = {
      // 创建训练任务
      createTraining: () => {
        loading.creating = true;
        loading.overlay = true;
        loading.message = '正在创建训练任务...';

        const formData = new FormData();
        return axios.post('http://localhost:5130/create_train', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }).then(response => {
          if (response.data.code === 200) {
            folderId.value = response.data.data.folder_id;
            trainSaveFolderId.value = response.data.data.train_save_folder_id;
            ElMessage.success('训练任务创建成功');
            currentStep.value = 1; // 进入上传数据集步骤
            return true;
          } else {
            throw new Error(response.data.msg || '创建训练任务失败');
          }
        }).catch(error => {
          ElMessage.error(error.message || '请求失败');
          return false;
        }).finally(() => {
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
            ElMessage.error('没有选择文件');
          }

          // 检查并安全添加文件
          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file && file.raw) {
              formData.append('files', file.raw);
            } else {
              ElMessage.error('无效的文件对象:', file);
            }
          }

          return axios.post('http://localhost:5130/upload_datasets', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }).then(response => {
            if (response.data.code === 200) {
              if (response.data.data && response.data.data.yaml_file_id) {
                yamlFileId.value = response.data.data.yaml_file_id;
              } else {
                ElMessage.warning('响应中没有yaml_file_id');
              }
              ElMessage.success('数据集上传成功');
              currentStep.value = 2; // 进入训练配置步骤
              return true;
            } else {
              throw new Error(response.data.msg || '数据集上传失败');
            }
          }).catch(error => {
            ElMessage.error('上传失败: ' + (error.response?.data?.msg || error.message || '未知错误'));
            return false;
          }).finally(() => {
            loading.uploading = false;
            loading.overlay = false;
          });
        } catch (err) {
          ElMessage.error(err.message || '准备上传数据时出错');
          loading.uploading = false;
          loading.overlay = false;
          return Promise.reject(err);
        }
      },

      // 开始训练
      startTraining: (config) => {
        try {
          const formData = new FormData();
          // 确保 yaml_id 和 train_save_folder_id 存在且有效才添加
          if (yamlFileId.value) {
            formData.append('yaml_id', yamlFileId.value);
          } else {
            console.error('yaml_id is missing');
            ElMessage.error('启动训练失败：缺少必要的 yaml_id');
            loading.training = false;
            loading.overlay = false;
            return Promise.reject('Missing yaml_id'); // 提前返回或抛出错误
          }
          if (trainSaveFolderId.value) {
            formData.append('train_save_folder_id', trainSaveFolderId.value);
          } else {
            console.error('train_save_folder_id is missing');
            ElMessage.error('启动训练失败：缺少必要的 train_save_folder_id');
            loading.training = false;
            loading.overlay = false;
            return Promise.reject('Missing train_save_folder_id'); // 提前返回或抛出错误
          }

          // 仅添加非空值的超参数
          for (const key in config) {
            const value = config[key];
            // 检查值是否为 null, undefined 或空字符串
            if (value !== null && value !== undefined && value !== '') {
              formData.append(key, value);
            }
          }

          ElMessage.success('启动训练成功');
          currentStep.value = 4; // 进入训练进行中状态

          return axios.post('http://localhost:5130/start_train', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }).then(async response => {
            if (response.data.code === 200 && response.data.data) {
              weightFileId.value = response.data.data.weights_file_id || '';
              ElMessage.success('Train successfully. Weights File ID:', weightFileId.value);

              ElMessage.success('训练已完成');
              currentStep.value = 5;
              return true;
            } else {
              throw new Error(response.data.msg || '训练启动失败');
            }
          }).catch(error => {
            ElMessage.error(error.message || '请求失败');
            return false;
          });
        } catch (err) {
          console.error('启动训练时发生错误:', err);
          ElMessage.error('启动训练时发生错误: ' + err.message); // 显示更具体的错误信息
          loading.training = false;
          loading.overlay = false;
          return Promise.reject(err); // 保持 Promise 链
        }
      },
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
        }
      });
    };

    const resetTraining = () => {
      // 重置所有状态
      currentStep.value = 0;
      folderId.value = '';
      trainSaveFolderId.value = ''; // 新增: 重置 train_save_folder_id
      yamlFileId.value = '';
      weightFileId.value = ''; // 新增: 重置 weights_file_id
      datasetFileList.value = [];
      Object.assign(trainConfig, {
        pr_name: '',
        batch_size: null, // 重置为 null
        epochs: 100, // 重置为 100
        image_size: '', // 重置为空
        learning_rate: '', // 重置为空
        device: '', // 重置为''
      });

      trainLog.value = null;
      // 新增：清除本地存储
      localStorage.removeItem(STORAGE_KEY);
    };

    const createTraining = (event) => {
      if (event) event.preventDefault();
      return api.createTraining();
    };

    const submitDatasetUpload = (event) => {
      if (event) event.preventDefault();
      if (!datasetFileList.value || datasetFileList.value.length === 0) {
        ElMessage.warning('请先选择要上传的数据集文件');
        return false;
      }

      return api.uploadDataset(datasetFileList.value);
    };

    const startTraining = (event) => {
      if (event) event.preventDefault();
      return api.startTraining(trainConfig);
    };

    // 新增：导出训练日志为 JSON
    const exportTrainLogJson = () => {
      if (!trainLog.value) {
        ElMessage.warning('暂无训练日志可导出');
        return;
      }
      const dataStr = JSON.stringify(trainLog.value, null, 2);
      const blob = new Blob([dataStr], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `train_log_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      ElMessage.success('训练日志已导出为JSON');
    };

    // 新增：查看当前任务训练状态
    const viewCurrentTrainStatus = (event) => {
      if (event) event.preventDefault();
      if (!trainSaveFolderId.value) {
        ElMessage.warning('未找到训练任务ID，无法获取训练日志');
        return;
      }
      const formData = new FormData();
      formData.append('train_folder_id', trainSaveFolderId.value);
      axios.post('http://localhost:5130/train_log', formData, {
        headers: {'Content-Type': 'multipart/form-data'},
      }).then(res => {
        if (res.data && res.data.code === 200) {
          trainLog.value = res.data.data;
          ElMessage.success('训练日志已获取');
        } else {
          ElMessage.error(res.data.msg || '获取训练日志失败');
        }
      }).catch(error => {
        ElMessage.error('获取训练日志失败: ' + (error.message || '未知错误'));
      });
    };

    // 监听trainLog变化，自动渲染图表
    watch(() => trainLog.value, () => {
      setTimeout(renderChart, 200); // 等待DOM渲染
    });

    // 窗口自适应
    onMounted(() => {
      window.addEventListener('resize', () => {
        if (chartInstance) chartInstance.resize();
      });
    });

    onBeforeUnmount(() => {
      if (chartInstance) chartInstance.dispose();
      window.removeEventListener('resize', () => {});
    });

    // 对外暴露的方法
    return {
      currentStep,
      trainConfig,
      datasetFileList,
      loading,
      trainConfigForm,
      trainLog,
      createTraining,
      handleDatasetFileChange,
      submitDatasetUpload,
      validateAndContinue,
      startTraining,
      resetTraining,
      exportTrainLogJson,
      viewCurrentTrainStatus,
      chartRef,
    };
  },
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
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.step-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
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

.action-row .el-button {
  min-width: 120px;
  transition: background-color 0.3s, color 0.3s;
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

.train-log-panel {
  margin-bottom: 25px;
  background-color: #fff;
  padding: 20px 20px 10px 20px; /* 上下内边距更紧凑 */
  border-radius: 10px; /* 圆角更柔和 */
  border: 1px solid #e5e6eb; /* 更浅的边框色 */
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06); /* 更轻的阴影 */
  text-align: left;
  position: relative;
}

.train-log-panel h4 {
  margin-bottom: 12px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  border-bottom: 1px solid #f5f5f5;
  padding-bottom: 6px;
}

.train-log-panel .el-descriptions {
  margin-top: 8px;
}

.train-log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.train-log-chart {
  width: 100%;
  height: 300px;
  margin-top: 18px; /* 顶部间距更小 */
  background: #fafbfc; /* 更柔和的背景色 */
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  border: 1px solid #f0f0f0;
  padding: 6px 4px 4px 4px; /* 更紧凑的内边距 */
  transition: box-shadow 0.2s;
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
