<template>
  <div class="data-collection-container">
    <div class="webcam-section">
      <div :class="{ 'offline': !cameraOnline }" class="webcam-display">
        <video v-show="cameraOnline" ref="webcam" autoplay muted playsinline></video>
        <canvas ref="overlay" class="overlay-canvas"></canvas>
        <div v-if="!cameraOnline" class="camera-offline">
          <span class="camera-offline-icon">📷</span>
          <span>摄像头未开启</span>
        </div>
      </div>
      <div class="capture-controls">
        <button class="control-button" @click="toggleCamera">
          {{ cameraOnline ? '关闭摄像头' : '开启摄像头' }}
        </button>
        <button :disabled="!cameraOnline" class="control-button" @click="captureImage">
          拍摄照片
        </button>
        <button :disabled="!cameraOnline" class="control-button" @click="toggleContinuousCapture">
          {{ continuousCapture ? '停止连续拍摄' : '开始连续拍摄' }}
        </button>
        <button :disabled="!cameraOnline" class="control-button" @click="toggleContinuousDetect">
          {{ continuousDetect ? '停止缺陷检测' : '开始缺陷检测' }}
        </button>
      </div>
    </div>

    <div class="settings-section">
      <div class="settings-card">
        <h2 class="card-title">摄像头状态</h2>
        <div class="camera-status">
          <div :class="{ 'online': cameraOnline, 'offline': !cameraOnline }" class="status-indicator"></div>
          <span>{{ cameraOnline ? '在线' : '离线' }}</span>
        </div>
        <div v-if="cameraOnline" class="camera-info">
          <p><strong>分辨率:</strong> {{ cameraResolution }}</p>
          <p><strong>帧率:</strong> {{ frameRate }}</p>
        </div>
      </div>

      <div class="settings-card">
        <h2 class="card-title">拍摄设置</h2>
        <div class="setting-item">
          <label>连续拍摄间隔 (秒)</label>
          <input v-model="captureInterval" :disabled="continuousCapture" max="60" min="1" type="number">
        </div>
      </div>

      <div class="settings-card capture-log">
        <h2 class="card-title">捕获日志</h2>
        <div class="log-container">
          <div v-if="captureLogs.length === 0" class="empty-log">
            暂无捕获记录
          </div>
          <div v-for="(log, index) in captureLogs" v-else :key="index" class="log-entry">
            <span class="log-time">{{ log.time }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  name: 'DataCollection',
  data() {
    return {
      cameraOnline: false,
      stream: null,
      cameraResolution: '1280x720',
      frameRate: '30',
      captureInterval: 3,
      continuousCapture: false,
      continuousDetect: false,
      captureTimer: null,
      detectTimer: null,
      captureLogs: [],
      captureCount: 0,
      detecting: false, // 新增标志
    };
  },
  methods: {
    async toggleCamera() {
      if (this.cameraOnline) {
        this.stopCamera();
      } else {
        await this.startCamera();
      }
    },
    async startCamera() {
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: {width: 1280, height: 720},
        });

        if (this.$refs.webcam && this.$refs.overlay) {
          this.$refs.webcam.srcObject = this.stream;

          await this.$nextTick();
          this.cameraOnline = true;

          const videoTrack = this.stream.getVideoTracks()[0];
          if (videoTrack) {
            const settings = videoTrack.getSettings();
            this.cameraResolution = settings.width + 'x' + settings.height;
            this.frameRate = settings.frameRate ? settings.frameRate.toFixed(1) + 'fps' : '未知';
          }

          this.$refs.webcam.onloadedmetadata = () => {
            const video = this.$refs.webcam;
            const canvas = this.$refs.overlay;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
          };

          this.addLog('摄像头已开启');
        } else {
          console.error('找不到视频元素');
          this.addLog('初始化失败: 找不到视频元素');
          if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
          }
          this.cameraOnline = false;
        }
      } catch (error) {
        console.error('无法访问摄像头:', error);
        this.addLog('摄像头访问失败: ' + error.message);
        this.cameraOnline = false;
      }
    },
    stopCamera() {
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;
      }

      this.cameraOnline = false;
      this.addLog('摄像头已关闭');

      if (this.continuousCapture) {
        this.toggleContinuousCapture();
      }
    },
    captureImage() {
      if (!this.cameraOnline) return;
      this.captureCount++;
      this.addLog(`已捕获图像 #${this.captureCount}`);
    },
    toggleContinuousCapture() {
      if (this.continuousCapture) {
        clearInterval(this.captureTimer);
        this.captureTimer = null;
        this.continuousCapture = false;
        this.addLog('连续拍摄已停止');
      } else {
        this.continuousCapture = true;
        this.addLog(`连续拍摄已开始，间隔: ${this.captureInterval}秒`);
        this.captureTimer = setInterval(() => {
          this.captureImage();
        }, this.captureInterval * 1000);
      }
    },
    toggleContinuousDetect() {
      if (this.continuousDetect) {
        clearInterval(this.detectTimer);
        this.detectTimer = null;
        this.detecting = false; // 停止检测
        this.clearOverlay();
        this.continuousDetect = false;
        this.addLog('缺陷检测已停止');
      } else {
        this.continuousDetect = true;
        this.detecting = true; // 开始检测
        this.addLog('缺陷检测已开始');
        this.detectTimer = setInterval(() => {
          this.detectFrame();
        }, 500);
      }
    },
    async detectFrame() {
      if (!this.detecting) return; // 若已停止则不再处理
      const video = this.$refs.webcam;
      if (!video) return;
      const off = document.createElement('canvas');
      off.width = video.videoWidth;
      off.height = video.videoHeight;
      const offCtx = off.getContext('2d');
      offCtx.drawImage(video, 0, 0);
      off.toBlob(async blob => {
        if (!blob || !this.detecting) return; // 检查检测状态
        // 第一步：上传图片获取files_id
        const uploadForm = new FormData();
        uploadForm.append('files', blob, 'frame.jpg');
        try {
          const uploadRes = await axios.post('http://localhost:5130/upload_files', uploadForm);
          console.log('上传图片响应:', uploadRes.data);
          // 获取files_id
          const uploaded = uploadRes.data?.data?.uploaded_files?.[0]?.box_data?.[0]?.file_id;
          if (!uploaded || !this.detecting) {
            console.error('未获取到files_id');
            return;
          }
          const files_id = uploaded;
          const weight_file_id = this.$store.state.selectedWeightRawId;
          console.log('files_id:', files_id, 'weight_file_id:', weight_file_id);

          // 第二步：缺陷检测
          const predictForm = new FormData();
          predictForm.append('files_id', files_id);
          predictForm.append('weight_file_id', weight_file_id);
          const res = await axios.post('http://localhost:5130/start_predict', predictForm);
          console.log('缺陷检测响应:', res.data);
          if (!this.detecting) return; // 检查检测状态
          const dr = res.data?.data?.detection_results;
          if (Array.isArray(dr) && dr.length > 0) {
            let allBoxes = [];
            dr.forEach(item => {
              if (Array.isArray(item.boxes)) {
                allBoxes = allBoxes.concat(item.boxes);
              }
            });
            console.log('待画框boxes:', allBoxes);
            this.drawBoxes(allBoxes);

            // 日志栏精简检测结果
            const validBoxes = allBoxes.filter(b => b.confidence > 0.6);
            const abnormalCount = validBoxes.filter(b => b.class_name === 0 || b.class_name === '0').length;
            const normalCount = validBoxes.length - abnormalCount;
            if (validBoxes.length > 0) {
              this.addLog(
                `检测到${validBoxes.length}个目标，异常${abnormalCount}，正常${normalCount}`
              );
            } else {
              this.addLog('未检测到目标');
            }
            // 更新生产历史数据
            const now = new Date();
            const prodDate = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
            const hasDefect = abnormalCount > 0;
            axios.get('/api/prodHistory/saveOrUpdateToday', { params: { prodDate, hasDefect } })
              .catch(err => console.error('更新生产历史失败:', err));
          }
        } catch (e) {
          console.error('检测帧出错:', e);
        }
      }, 'image/jpeg');
    },
    drawBoxes(boxes) {
      const canvas = this.$refs.overlay;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // boxes: [{class_name, confidence, x, y, w, h}, ...]
      ctx.strokeStyle = 'blue';
      ctx.lineWidth = 2;
      ctx.font = '18px Arial';
      ctx.fillStyle = 'blue';

      for (const box of boxes) {
        if (box.confidence > 0.6) {
          // 坐标归一化转像素
          const x = box.x * canvas.width;
          const y = box.y * canvas.height;
          const w = box.w * canvas.width;
          const h = box.h * canvas.height;
          console.log('画框:', { x, y, w, h, class_name: box.class_name, confidence: box.confidence }); // 调试输出
          ctx.strokeRect(x, y, w, h);
          if (box.class_name === 0 || box.class_name === '0') {
            ctx.save();
            ctx.font = '18px Arial';
            ctx.fillStyle = 'blue';
            ctx.textBaseline = 'top';
            ctx.fillText('abnormal', x, Math.max(y - 22, 0));
            ctx.restore();
          }
        }
      }
    },
    clearOverlay() {
      const canvas = this.$refs.overlay;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
    addLog(message) {
      const now = new Date();
      const timeString = now.toLocaleTimeString();
      this.captureLogs.unshift({
        time: timeString,
        message: message,
      });

      if (this.captureLogs.length > 50) {
        this.captureLogs.pop();
      }
    },
  },
  beforeUnmount() {
    this.stopCamera();
    if (this.captureTimer) {
      clearInterval(this.captureTimer);
    }
    if (this.detectTimer) {
      clearInterval(this.detectTimer);
    }
  },
};
</script>

<style scoped>
.data-collection-container {
  display: flex;
  height: 100%;
  min-height: 600px;
  gap: 20px;
  padding: 20px;
  background-color: #f5f7fa;
}

.webcam-section {
  flex: 3;
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.webcam-display {
  flex: 1;
  background-color: #2c3e50;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.webcam-display video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #000;
}

.overlay-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.camera-offline {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
}

.camera-offline-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.capture-controls {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 16px;
  background-color: #f8f9fa;
}

.control-button {
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  background-color: #409eff;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.control-button:hover {
  background-color: #66b1ff;
}

.control-button:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}

.settings-section {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 400px;
}

.settings-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 16px;
}

.card-title {
  margin-top: 0;
  margin-bottom: 16px;
  padding-bottom: 8px;
  font-size: 18px;
  border-bottom: 1px solid #ebeef5;
  color: #303133;
}

.camera-status {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
}

.status-indicator.online {
  background-color: #67c23a;
}

.status-indicator.offline {
  background-color: #f56c6c;
}

.camera-info {
  margin-top: 16px;
}

.camera-info p {
  margin: 8px 0;
  color: #606266;
}

.setting-item {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
}

.setting-item label {
  margin-bottom: 8px;
  color: #606266;
}

.setting-item input, .setting-item select {
  padding: 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.capture-log {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 200px;
  max-height: 300px;
}

.log-container {
  flex: 1;
  overflow-y: auto;
  background-color: #f8f9fa;
  border-radius: 4px;
  padding: 8px;
  max-height: 250px;
  height: 250px;
}

.empty-log {
  color: #909399;
  text-align: center;
  padding: 20px;
}

.log-entry {
  padding: 8px;
  border-bottom: 1px solid #ebeef5;
  font-size: 14px;
}

.log-time {
  color: #909399;
  margin-right: 8px;
}

.log-message {
  color: #303133;
}
</style>

