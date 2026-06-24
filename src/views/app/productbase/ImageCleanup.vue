<template>
  <div>
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

    <div class="toolbar">
      <el-button size="small" icon="el-icon-refresh" :loading="loadingStats" @click="fetchStats">
        刷新统计
      </el-button>
      <el-button size="small" type="danger" icon="el-icon-delete"
        :loading="cleaning"
        :disabled="!stats.orphan"
        @click="handleCleanup">
        清理孤儿图片
      </el-button>
    </div>

    <!-- 清理结果 -->
    <div v-if="lastResult" class="result-box">
      <el-divider content-position="left">最近清理结果</el-divider>
      <div class="result-row">
        <div class="result-item">
          <span class="result-num">{{ lastResult.orphan }}</span>
          <span class="result-label">发现孤儿</span>
        </div>
        <div class="result-item">
          <span class="result-num success">{{ lastResult.deleted }}</span>
          <span class="result-label">已删除</span>
        </div>
        <div v-if="lastResult.failed" class="result-item">
          <span class="result-num fail">{{ lastResult.failed }}</span>
          <span class="result-label">失败</span>
        </div>
        <div class="result-item">
          <span class="result-num">{{ lastResult.batches }}</span>
          <span class="result-label">批次</span>
        </div>
      </div>
      <div v-if="lastResult.msg" class="result-msg gray_zi">{{ lastResult.msg }}</div>
    </div>

    <div v-if="lastResult === null && !loadingStats && stats.cdn_total == null" class="empty-state">
      <el-empty description="点击「刷新统计」获取图片数据" :image-size="80" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImageCleanup',
  data() {
    return {
      loadingStats: false,
      cleaning: false,
      stats: {
        cdn_total: null,
        db_total: null,
        migrated: null,
        unmigrated: null,
        orphan: null
      },
      lastResult: null
    }
  },
  mounted() {
    this.fetchStats()
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
        this.postRequest('api/base_product_group/cleanup_images/').then(resp => {
          this.cleaning = false
          if (resp) {
            if (resp.msg) {
              this.lastResult = { orphan: resp.orphan || 0, deleted: 0, failed: 0, batches: 0, msg: resp.msg }
            } else {
              this.lastResult = {
                orphan: resp.orphan || 0,
                deleted: resp.deleted || 0,
                failed: resp.failed || 0,
                batches: resp.batches || 0,
                msg: ''
              }
            }
            // 刷新统计
            this.fetchStats()
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
.result-row {
  display: flex;
  gap: 24px;
}
.result-item {
  text-align: center;
}
.result-num {
  font-size: 22px;
  font-weight: 700;
  color: #303133;
}
.result-num.success {
  color: #67c23a;
}
.result-num.fail {
  color: #f56c6c;
}
.result-label {
  display: block;
  font-size: 12px;
  color: #909399;
}
.result-msg {
  margin-top: 8px;
}
.gray_zi {
  color: #99a9bf;
  font-size: 13px;
}
.empty-state {
  margin-top: 60px;
}
</style>
