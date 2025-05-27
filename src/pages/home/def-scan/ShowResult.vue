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
      <div class="export-buttons">
        <el-dropdown @command="handleExport">
          <el-button size="small" type="primary">
            导出结果<i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <template #dropdown>
            <el-dropdown-item command="daily">按日导出</el-dropdown-item>
            <el-dropdown-item command="monthly">按月导出</el-dropdown-item>
          </template>
        </el-dropdown>
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
      selectedDate: '*Overall_history', // 默认选择总生产数据
      barChart: null,
      currentData: null,
    };
  },
  methods: {
    fetchData() {
      this.$axios.get('/api/prodHistory/findAll').then(response => {
        // 按日期升序排序 prodDataList
        this.prodDataList = response.data.sort((a, b) => a.prodDate.localeCompare(b.prodDate));
        // 为每条数据计算良品率
        this.prodDataList.forEach(item => {
          item.yieldRate = item.prodNum > 0 ?
              ((item.prodNum - item.defectNum) / item.prodNum * 100) : 0;
        });
        // 默认选中总生产数据
        this.selectedDate = '*Overall_history';
        this.handleDateChange();
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
    // 统一导出入口，根据 command 执行
    handleExport(command) {
      if (!this.prodDataList.length) {
        this.$message.warning('暂无数据可导出');
        return;
      }
      let payload, filename;
      if (command === 'daily') {
        payload = this.prodDataList;
        filename = `prod_daily.json`;
      } else if (command === 'monthly') {
        payload = this.prodDataList.reduce((acc, item) => {
          const month = item.prodDate.slice(0, 7);
          (acc[month] || (acc[month] = [])).push(item);
          return acc;
        }, {});
        filename = `prod_monthly.json`;
      }
      const blob = new Blob([JSON.stringify(payload, null, 2)], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      this.$message.success(`已导出${command === 'daily' ? '按日' : '按月'}结果`);
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
  padding: 24px 16px 24px 16px;
  background-color: #f5f7fa;
  border-radius: 12px;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.04);
}

.header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
}

.header h2 {
  margin: 0;
  font-size: 22px;
  color: #222;
  font-weight: 600;
  letter-spacing: 1px;
}

.date-selector {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 6px;
  padding: 6px 12px;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.03);
}

.date-selector span {
  font-size: 15px;
  color: #666;
}

.date-selector select {
  padding: 7px 14px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  margin-left: 10px;
  outline: none;
  font-size: 15px;
  background: #f8fafc;
  transition: border 0.2s;
}

.date-selector select:focus {
  border: 1.5px solid #409eff;
}

.export-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.card {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.07);
  padding: 24px;
  width: 100%;
  box-sizing: border-box;
}

.card h3 {
  margin-top: 0;
  color: #303133;
  font-size: 18px;
  margin-bottom: 20px;
  text-align: center;
  font-weight: 500;
}

.data-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
}

.data-item {
  text-align: center;
  padding: 18px;
  border-radius: 8px;
  background-color: #f0f2f5;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.03);
}

.data-value {
  font-size: 28px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 7px;
}

.data-label {
  font-size: 15px;
  color: #606266;
}

.charts-container {
  width: 100%;
  display: block;
  margin: 0;
  padding: 0;
}

.chart-box {
  height: 320px;
  width: 100%;
}

@media (max-width: 900px) {
  .result-container {
    padding: 12px 2vw 12px 2vw;
  }
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .content {
    gap: 14px;
  }
  .data-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .card {
    padding: 14px;
  }

  .chart-box {
    height: 220px;
  }
}
</style>


