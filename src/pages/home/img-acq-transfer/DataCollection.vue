<template>
  <div class="data-collection-container">
    <div class="webcam-section">
      <div class="webcam-display" :class="{ 'offline': !cameraOnline }">
        <video v-show="cameraOnline" ref="webcam" autoplay muted playsinline></video>
        <div v-if="!cameraOnline" class="camera-offline">
          <span class="camera-offline-icon">📷</span>
          <span>摄像头未开启</span>
        </div>
      </div>
      <div class="capture-controls">
        <button class="control-button" @click="toggleCamera">
          {{ cameraOnline ? '关闭摄像头' : '开启摄像头' }}
        </button>
        <button class="control-button" :disabled="!cameraOnline" @click="captureImage">
          拍摄照片
        </button>
        <button class="control-button" :disabled="!cameraOnline" @click="toggleContinuousCapture">
          {{ continuousCapture ? '停止连续拍摄' : '开始连续拍摄' }}
        </button>
      </div>
    </div>

    <div class="settings-section">
      <div class="settings-card">
        <h2 class="card-title">摄像头状态</h2>
        <div class="camera-status">
          <div class="status-indicator" :class="{ 'online': cameraOnline, 'offline': !cameraOnline }"></div>
          <span>{{ cameraOnline ? '在线' : '离线' }}</span>
        </div>
        <div class="camera-info" v-if="cameraOnline">
          <p><strong>分辨率:</strong> {{ cameraResolution }}</p>
          <p><strong>帧率:</strong> 30fps</p>
        </div>
      </div>

      <div class="settings-card">
        <h2 class="card-title">拍摄设置</h2>
        <div class="setting-item">
          <label>连续拍摄间隔 (秒)</label>
          <input type="number" v-model="captureInterval" min="1" max="60" :disabled="continuousCapture">
        </div>
      </div>

      <div class="settings-card capture-log">
        <h2 class="card-title">捕获日志</h2>
        <div class="log-container">
          <div v-if="captureLogs.length === 0" class="empty-log">
            暂无捕获记录
          </div>
          <div v-else class="log-entry" v-for="(log, index) in captureLogs" :key="index">
            <span class="log-time">{{ log.time }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DataCollection',
  data() {
    return {
      cameraOnline: false,
      stream: null,
      cameraResolution: '1280x720',
      captureInterval: 5,
      continuousCapture: false,
      captureTimer: null,
      captureLogs: [],
      captureCount: 0
    }
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
          video: { width: 1280, height: 720 } 
        });
        
        // 设置视频源
        if (this.$refs.webcam) {
          this.$refs.webcam.srcObject = this.stream;
        } else {
          throw new Error('找不到视频元素');
        }
        
        // 等待DOM更新完成
        await this.$nextTick();
        this.cameraOnline = true;
        
        // 获取分辨率信息
        const videoTrack = this.stream.getVideoTracks()[0];
        if (videoTrack) {
          const settings = videoTrack.getSettings();
          this.cameraResolution = settings.width + 'x' + settings.height;
        }
        
        this.addLog('摄像头已开启');
      } catch (error) {
        console.error('无法访问摄像头:', error);
        this.addLog('摄像头访问失败: ' + error.message);
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
    addLog(message) {
      const now = new Date();
      const timeString = now.toLocaleTimeString();
      this.captureLogs.unshift({
        time: timeString,
        message: message
      });
      
      if (this.captureLogs.length > 50) {
        this.captureLogs.pop();
      }
    }
  },
  beforeUnmount() {
    this.stopCamera();
    if (this.captureTimer) {
      clearInterval(this.captureTimer);
    }
  }
}
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
  object-fit: contain; /* 修改为contain确保视频完全可见 */
  background: #000; /* 添加黑色背景确保视频边界可见 */
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
