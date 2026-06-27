<template>
  <div>
    <!-- 日期筛选 -->
    <div class="toolbar">
      <el-radio-group v-model="datePreset" size="small" @change="onPresetChange">
        <el-radio-button label="today">今日</el-radio-button>
        <el-radio-button label="yesterday">昨日</el-radio-button>
        <el-radio-button label="week">最近一周</el-radio-button>
        <el-radio-button label="month">最近一月</el-radio-button>
        <el-radio-button label="custom">自定义</el-radio-button>
      </el-radio-group>
      <el-date-picker
        v-if="datePreset === 'custom'"
        v-model="customDateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="yyyy-MM-dd"
        size="small"
        style="margin-left: 10px"
        @change="fetchStats" />
      <el-button size="small" icon="el-icon-refresh" circle
        style="margin-left: 10px" @click="fetchStats" />
    </div>

    <!-- 汇总卡片 -->
    <div class="summary-cards">
      <div class="stat-card" v-for="card in summaryCards" :key="card.key">
        <div class="stat-value">{{ card.value }}</div>
        <div class="stat-label">{{ card.label }}</div>
      </div>
    </div>

    <!-- 柱状图 -->
    <div v-loading="loading" class="chart-wrap">
      <div ref="chartDom" class="chart-box"></div>
    </div>

    <!-- 用户明细表 -->
    <el-table :data="users" border size="small" style="margin-top: 10px"
      v-loading="loading"
      :header-cell-style="{background:'#fafafa'}">
      <el-table-column label="用户" width="120">
        <template slot-scope="scope">
          {{ scope.row.display_name || scope.row.username }}
        </template>
      </el-table-column>
      <el-table-column label="抓取产品" align="center" sortable prop="stats.products_fetched" />
      <el-table-column label="创建店铺" align="center" sortable prop="stats.shops_created" />
      <el-table-column label="变体变更" align="center" sortable prop="stats.skus_created" />
      <el-table-column label="导出店铺" align="center" sortable prop="stats.shops_exported" />
      <el-table-column label="导出SKU" align="center" sortable prop="stats.skus_exported" />
      <el-table-column label="AI Tokens" align="center" sortable prop="stats.dify_tokens">
        <template slot-scope="scope">
          {{ formatTokens(scope.row.stats.dify_tokens) }}
        </template>
      </el-table-column>
      <el-table-column label="AI 费用(¥)" align="center" sortable prop="stats.dify_cost" />
    </el-table>
  </div>
</template>

<script>
import moment from 'moment'

const METRICS = [
  { key: 'products_fetched', label: '抓取产品' },
  { key: 'shops_created', label: '创建店铺' },
  { key: 'skus_created', label: '变体变更' },
  { key: 'shops_exported', label: '导出店铺' },
  { key: 'skus_exported', label: '导出SKU' },
  { key: 'dify_tokens', label: 'AI Tokens', format: val => {
    if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M'
    if (val >= 1000) return (val / 1000).toFixed(1) + 'K'
    return val
  }},
  { key: 'dify_cost', label: 'AI 费用(¥)', format: val => typeof val === 'number' ? val.toFixed(4) : val }
]

export default {
  name: 'StatsDashboard',
  data() {
    return {
      loading: false,
      datePreset: 'today',
      customDateRange: null,
      startDate: '',
      endDate: '',
      users: [],
      chart: null
    }
  },
  computed: {
    summaryCards() {
      const totals = {}
      METRICS.forEach(m => { totals[m.key] = m.key === 'dify_cost' ? 0 : 0 })
      this.users.forEach(u => {
        METRICS.forEach(m => {
          const val = u.stats[m.key]
          if (m.key === 'dify_cost') {
            totals[m.key] += parseFloat(val) || 0
          } else {
            totals[m.key] += (typeof val === 'number' ? val : (parseInt(val) || 0))
          }
        })
      })
      return METRICS.map(m => {
        let displayVal = totals[m.key]
        if (m.format) displayVal = m.format(displayVal)
        return {
          key: m.key,
          label: m.label,
          value: displayVal
        }
      })
    }
  },
  mounted() {
    this.setPresetDate('today')
    this.$nextTick(() => {
      this.fetchStats()
    })
  },
  beforeDestroy() {
    if (this._resizeHandler) {
      window.removeEventListener('resize', this._resizeHandler)
    }
    if (this.chart) {
      this.chart.dispose()
      this.chart = null
    }
  },
  methods: {
    setPresetDate(preset) {
      const today = moment().format('YYYY-MM-DD')
      switch (preset) {
        case 'today':
          this.startDate = today
          this.endDate = today
          break
        case 'yesterday':
          this.startDate = moment().subtract(1, 'day').format('YYYY-MM-DD')
          this.endDate = this.startDate
          break
        case 'week':
          this.startDate = moment().subtract(6, 'day').format('YYYY-MM-DD')
          this.endDate = today
          break
        case 'month':
          this.startDate = moment().subtract(29, 'day').format('YYYY-MM-DD')
          this.endDate = today
          break
        case 'custom':
          if (this.customDateRange && this.customDateRange.length === 2) {
            this.startDate = this.customDateRange[0]
            this.endDate = this.customDateRange[1]
          }
          break
      }
    },

    onPresetChange(preset) {
      if (preset !== 'custom') {
        this.setPresetDate(preset)
        this.fetchStats()
      }
    },

    formatTokens(val) {
      if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M'
      if (val >= 1000) return (val / 1000).toFixed(1) + 'K'
      return val || 0
    },

    fetchStats() {
      if (this.datePreset === 'custom') {
        if (!this.customDateRange || this.customDateRange.length !== 2) return
        this.setPresetDate('custom')
      }
      this.loading = true
      const url = 'api/stats/?start_date=' + this.startDate + '&end_date=' + this.endDate
      this.getRequest(url).then(resp => {
        this.loading = false
        if (resp) {
          this.users = resp.users || []
          this.$nextTick(() => { this.renderChart() })
        }
      }).catch(() => {
        this.loading = false
      })
    },

    renderChart() {
      if (!this.$refs.chartDom) return
      if (!this.chart) {
        this.chart = this.$echarts.init(this.$refs.chartDom)
        this._resizeHandler = () => {
          if (this.chart) this.chart.resize()
        }
        window.addEventListener('resize', this._resizeHandler)
      }
      const users = this.users
      if (!users.length) {
        this.chart.clear()
        return
      }
      const names = users.map(u => u.display_name || u.username)
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' }
        },
        legend: {
          data: METRICS.map(m => m.label),
          top: 0
        },
        grid: {
          left: 50,
          right: 20,
          top: 40,
          bottom: 30
        },
        xAxis: {
          type: 'category',
          data: names,
          axisLabel: { rotate: names.length > 4 ? 30 : 0 }
        },
        yAxis: {
          type: 'value',
          minInterval: 1
        },
        series: METRICS.map(m => ({
          name: m.label,
          type: 'bar',
          data: users.map(u => {
            const val = u.stats[m.key]
            if (m.key === 'dify_cost') return parseFloat(val) || 0
            return typeof val === 'number' ? val : (parseInt(val) || 0)
          })
        }))
      }
      this.chart.setOption(option, true)
    }
  }
}
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
}
.summary-cards {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}
.stat-card {
  flex: 1;
  text-align: center;
  padding: 20px 12px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}
.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 8px;
}
.chart-wrap {
  margin-top: 16px;
  min-height: 200px;
}
.chart-box {
  width: 100%;
  height: 350px;
}
</style>
