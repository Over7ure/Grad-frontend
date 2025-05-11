<template>
  <div class="result-container">
    <div class="header">
      <h2>生产数据分析</h2>
      <div class="date-selector">
        <span>选择日期：</span>
        <select v-model="selectedDate" @change="handleDateChange">
          <option value="*Overall_history">总生产数据</option>
          <option v-for="item in prodDataList" :key="item.prodDate" :value="item.prodDate">
            {{ formatDate(item.prodDate) }}
          </option>
        </select>
      </div>
    </div>

    <div class="content">
      <!-- 生产数据卡片 -->
      <div class="card data-summary">
        <h3>生产数据概览</h3>
        <div class="data-grid">
          <div class="data-item">
            <div class="data-value">{{ currentData?.prodNum || 0 }}</div>
            <div class="data-label">生产数量</div>
          </div>
          <div class="data-item">
            <div class="data-value">{{ currentData?.defectNum || 0 }}</div>
            <div class="data-label">缺陷数量</div>
          </div>
          <div class="data-item">
            <div class="data-value">{{ (currentData?.yieldRate || 0).toFixed(2) }}%</div>
            <div class="data-label">良品率</div>
          </div>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="charts-container">
        <div class="card">
          <h3>生产数据统计</h3>
          <div ref="barChartContainer" class="chart-box"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  name: 'ShowResult',
  data() {
    return {
      prodDataList: [],
      selectedDate: '',
      barChart: null,
      currentData: null,
    };
  },
  methods: {
    fetchData() {
      this.$axios.get('/api/prodHistory/findAll').then(response => {
        this.prodDataList = response.data;
        // 为每条数据计算良品率
        this.prodDataList.forEach(item => {
          item.yieldRate = item.prodNum > 0 ?
              ((item.prodNum - item.defectNum) / item.prodNum * 100) : 0;
        });

        if (this.prodDataList.length > 0) {
          this.selectedDate = this.prodDataList[0].prodDate;
          this.currentData = this.prodDataList[0];
          this.updateCharts();
        }
      });
    },
    handleDateChange() {
      if (this.selectedDate === '*Overall_history') {
        this.currentData = this.prodDataList.reduce((acc, item) => {
          acc.prodNum += item.prodNum;
          acc.defectNum += item.defectNum;
          return acc;
        }, {
          prodNum: 0,
          defectNum: 0,
        });
        // 计算总数据的良品率
        this.currentData.yieldRate = this.currentData.prodNum > 0 ?
            ((this.currentData.prodNum - this.currentData.defectNum) / this.currentData.prodNum * 100) : 0;
      } else {
        this.currentData = this.prodDataList.find(item => item.prodDate === this.selectedDate);
      }
      this.updateCharts();
    },
    formatDate(date) {
      return date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
    },
    updateCharts() {
      if (!this.currentData) return;
      this.updateBarChart();
    },
    updateBarChart() {
      const option = {
        title: {
          text: '',
          left: 'center',
          top: 0,
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: ['生产数量', '缺陷数量', '良品数量'],
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            name: '数量',
            type: 'bar',
            barWidth: '60%',
            data: [
              this.currentData.prodNum,
              this.currentData.defectNum,
              this.currentData.prodNum - this.currentData.defectNum,
            ],
            itemStyle: {
              color: function(params) {
                const colorList = ['#5470c6', '#ee6666', '#91cc75'];
                return colorList[params.dataIndex];
              },
            },
          }],
      };
      this.barChart.setOption(option);
    },
    initCharts() {
      this.barChart = echarts.init(this.$refs.barChartContainer);

      // 添加窗口尺寸变化时图表的自适应调整
      window.addEventListener('resize', () => {
        this.barChart.resize();
      });
    },
  },
  mounted() {
    this.initCharts();
    this.fetchData();
  },
  beforeUnmount() {
    // 移除事件监听，防止内存泄漏
    window.removeEventListener('resize', () => {});

    // 销毁图表实例
    if (this.barChart) {
      this.barChart.dispose();
    }
  },
};
</script>

<style scoped>
.result-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.date-selector {
  display: flex;
  align-items: center;
}

.date-selector select {
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  margin-left: 10px;
  outline: none;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  /* 保证卡片宽度自适应父容器 */
  width: 100%;
  box-sizing: border-box;
}

.card h3 {
  margin-top: 0;
  color: #303133;
  font-size: 18px;
  margin-bottom: 20px;
  text-align: center;
}

.data-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.data-item {
  text-align: center;
  padding: 15px;
  border-radius: 6px;
  background-color: #f0f2f5;
}

.data-value {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 5px;
}

.data-label {
  font-size: 14px;
  color: #606266;
}

.charts-container {
  /* 让统计卡片与概览卡片同宽 */
  width: 100%;
  /* 移除grid布局 */
  display: block;
  margin: 0;
  padding: 0;
}

.chart-box {
  height: 300px;
  width: 100%;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
  }

  .date-selector {
    margin-top: 10px;
  }

  .data-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .charts-container {
    /* 保持移动端同样效果 */
    width: 100%;
    display: block;
  }
}
</style>
