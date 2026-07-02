<template>
  <div>
    <!-- 状态提示 -->
    <el-alert v-if="stats.computing" title="后台正在计算中，请稍候..." type="info" :closable="false" show-icon
      style="margin-bottom: 12px" />

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-value">{{ stats.cdn_total != null ? stats.cdn_total : '-' }}</div>
        <div class="stat-label">CDN 图片总数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.db_total != null ? stats.db_total : '-' }}</div>
        <div class="stat-label">DB 图片记录数</div>
        <div class="stat-sub-row">
          <div class="stat-sub">
            <span class="sub-value success">{{ stats.migrated != null ? stats.migrated : '-' }}</span>
            <span class="sub-label">已迁移</span>
          </div>
          <div class="stat-sub">
            <span class="sub-value">{{ stats.unmigrated != null ? stats.unmigrated : '-' }}</span>
            <span class="sub-label">未迁移</span>
          </div>
        </div>
      </div>
      <div class="stat-card" :class="{ 'stat-warn': stats.orphan > 0 }">
        <div class="stat-value">{{ stats.orphan != null ? stats.orphan : '-' }}</div>
        <div class="stat-label">孤儿图片</div>
      </div>
    </div>

    <!-- 更新时间 -->
    <div v-if="stats.updated_at" class="gray_zi" style="margin-bottom: 12px">
      最后更新：{{ stats.updated_at | fmtTime }}
    </div>

    <div class="toolbar">
      <el-button size="small" icon="el-icon-refresh" :loading="loadingStats" @click="refreshStats">
        刷新统计
      </el-button>
      <el-button size="small" type="danger" icon="el-icon-delete"
        :loading="cleaning"
        :disabled="!stats.orphan || stats.computing"
        @click="handleCleanup">
        清理孤儿图片
      </el-button>
    </div>

    <!-- 清理结果 -->
    <div v-if="cleanResult" class="result-box">
      <el-alert :title="cleanResult" type="success" :closable="false" show-icon />
    </div>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  name: 'ImageCleanup',
  filters: {
    fmtTime(val) {
      if (!val) return ''
      return moment(val).format('YYYY-MM-DD HH:mm:ss')
    }
  },
  data() {
    return {
      loadingStats: false,
      cleaning: false,
      stats: {
        cdn_total: null,
        db_total: null,
        migrated: null,
        unmigrated: null,
        orphan: null,
        computing: false,
        updated_at: ''
      },
      cleanResult: '',
      _pollTimer: null
    }
  },
  mounted() {
    this.fetchStats()
  },
  beforeDestroy() {
    if (this._pollTimer) clearTimeout(this._pollTimer)
  },
  methods: {
    fetchStats() {
      this.loadingStats = true
      this.getRequest('api/base_product_group/image_stats/').then(resp => {
        this.loadingStats = false
        if (resp) {
          this.stats.cdn_total = resp.cdn_total != null ? resp.cdn_total : 0
          this.stats.db_total = resp.db_total != null ? resp.db_total : 0
          this.stats.migrated = resp.migrated != null ? resp.migrated : 0
          this.stats.unmigrated = resp.unmigrated != null ? resp.unmigrated : 0
          this.stats.orphan = resp.orphan != null ? resp.orphan : 0
          this.stats.computing = !!resp.computing
          this.stats.updated_at = resp.updated_at || ''
        }
      }).catch(() => { this.loadingStats = false })
    },

    // 轮询直到 computing 变为 false
    pollStats() {
      if (this._pollTimer) clearTimeout(this._pollTimer)
      this.getRequest('api/base_product_group/image_stats/').then(resp => {
        if (resp) {
          this.stats.computing = !!resp.computing
          if (resp.computing) {
            this._pollTimer = setTimeout(() => { this.pollStats() }, 2000)
          } else {
            // 计算完成，更新完整数据
            this.stats.cdn_total = resp.cdn_total != null ? resp.cdn_total : 0
            this.stats.db_total = resp.db_total != null ? resp.db_total : 0
            this.stats.migrated = resp.migrated != null ? resp.migrated : 0
            this.stats.unmigrated = resp.unmigrated != null ? resp.unmigrated : 0
            this.stats.orphan = resp.orphan != null ? resp.orphan : 0
            this.stats.updated_at = resp.updated_at || ''
            this.loadingStats = false
            this.$message.success('统计刷新完成')
          }
        } else {
          this.loadingStats = false
        }
      }).catch(() => { this.loadingStats = false })
    },

    refreshStats() {
      this.loadingStats = true
      this.cleanResult = ''
      this.postRequest('api/base_product_group/image_stats/').then(resp => {
        if (resp) {
          // 任务已提交，开始轮询
          this.stats.computing = true
          this.pollStats()
        } else {
          this.loadingStats = false
        }
      }).catch(() => { this.loadingStats = false })
    },

    handleCleanup() {
      if (!this.stats.orphan) {
        this.$message.info('没有需要清理的图片')
        return
      }
      this.$confirm(`发现 ${this.stats.orphan} 张孤儿图片，确定要清理吗？`, '确认清理', {
        confirmButtonText: '确定清理',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.cleaning = true
        this.cleanResult = ''
        this.postRequest('api/base_product_group/cleanup_images/').then(resp => {
          this.cleaning = false
          if (resp) {
            this.cleanResult = resp.msg || '已提交清理任务，后台处理中'
            this.$message.success(this.cleanResult)
            // 稍后自动刷新统计
            setTimeout(() => { this.refreshStats() }, 2000)
          }
        }).catch(() => { this.cleaning = false })
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.stats-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}
.stat-card {
  flex: 1;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
  text-align: center;
  border: 1px solid #ebeef5;
}
.stat-card.stat-warn {
  background: #fef0f0;
  border-color: #fab6b6;
}
.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  line-height: 1.3;
}
.stat-warn .stat-value {
  color: #f56c6c;
}
.stat-loading {
  font-size: 28px;
  color: #909399;
  line-height: 1.3;
}
.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}
.stat-sub-row {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #dcdfe6;
}
.stat-sub {
  text-align: center;
}
.sub-value {
  font-size: 15px;
  font-weight: 600;
  color: #606266;
}
.sub-value.success {
  color: #67c23a;
}
.sub-label {
  display: block;
  font-size: 11px;
  color: #c0c4cc;
}
.toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}
.result-box {
  margin-top: 8px;
}
.gray_zi {
  color: #99a9bf;
  font-size: 13px;
}
</style>
