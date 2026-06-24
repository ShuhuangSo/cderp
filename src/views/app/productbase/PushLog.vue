<template>
  <div>
    <!-- 筛选 -->
    <div class="toolbar">
      <el-select v-model="filterAction" size="small" placeholder="操作类型" clearable style="width: 140px" @change="initLogs">
        <el-option label="创建产品" value="CREATE" />
        <el-option label="修改产品" value="UPDATE" />
        <el-option label="新增店铺" value="ADD_SHOP" />
        <el-option label="删除店铺" value="DELETE_SHOP" />
        <el-option label="新增SKU" value="ADD_SKU" />
        <el-option label="删除SKU" value="DELETE_SKU" />
        <el-option label="状态变更" value="STATUS_CHANGE" />
        <el-option label="图片迁移" value="IMAGE_MIGRATE" />
      </el-select>
      <el-input v-model="filterOperator" size="small" placeholder="操作人" clearable
        style="width: 140px" @keyup.enter.native="initLogs" @clear="initLogs" />
      <el-button size="small" icon="el-icon-refresh" @click="initLogs">刷新</el-button>
    </div>

    <!-- 日志表格 -->
    <el-table :data="logs" v-loading="loading" border size="small"
      :header-cell-style="{background:'#fafafa'}">
      <el-table-column v-if="!productId" label="图片" width="60" align="center">
        <template slot-scope="scope">
          <el-image
            v-if="scope.row.base_product_cover"
            style="width: 40px; height: 40px"
            :src="scope.row.base_product_cover"
            :preview-src-list="[scope.row.base_product_cover]"
            fit="cover"
          />
        </template>
      </el-table-column>
      <el-table-column prop="operator" label="操作人" width="100" />
      <el-table-column label="操作类型" width="120">
        <template slot-scope="scope">
          <el-tag size="mini" :type="actionTagType(scope.row.action)">{{ scope.row.action_display }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="detail" label="详情" min-width="250" show-overflow-tooltip />
      <el-table-column prop="create_time" label="时间" width="170">
        <template slot-scope="scope">
          {{ scope.row.create_time | dateLog }}
        </template>
      </el-table-column>
    </el-table>

    <el-pagination v-if="total > pageSize" class="pagination" background
      :page-sizes="[20, 30, 50, 100]" :current-page="page" :page-size="pageSize"
      :total="total" layout="sizes, prev, pager, next, jumper, ->, total"
      @current-change="page = $event; initLogs()"
      @size-change="pageSize = $event; initLogs()" />
  </div>
</template>

<script>
import moment from 'moment'

export default {
  name: 'PushLog',
  props: {
    // 产品 ID，传了则只显示该产品的日志
    productId: { type: Number, default: null }
  },
  data() {
    return {
      loading: false,
      logs: [],
      page: 1,
      pageSize: 20,
      total: 0,
      filterAction: '',
      filterOperator: ''
    }
  },
  filters: {
    dateLog(value) {
      if (!value) return ''
      return moment(value).format('YYYY-MM-DD HH:mm:ss')
    }
  },
  mounted() {
    this.initLogs()
  },
  methods: {
    initLogs() {
      this.loading = true
      let url = 'api/product_logs/?page=' + this.page + '&page_size=' + this.pageSize + '&ordering=-create_time'
      if (this.productId) url += '&base_group=' + this.productId
      if (this.filterAction) url += '&action=' + this.filterAction
      if (this.filterOperator) url += '&operator=' + encodeURIComponent(this.filterOperator)
      this.getRequest(url).then(resp => {
        this.loading = false
        if (resp && resp.results) {
          this.logs = resp.results
          this.total = resp.count
        }
      }).catch(() => { this.loading = false })
    },

    actionTagType(action) {
      const map = {
        CREATE: 'success', UPDATE: 'primary', ADD_SHOP: 'warning',
        DELETE_SHOP: 'danger', ADD_SKU: '', DELETE_SKU: 'danger',
        STATUS_CHANGE: 'info', IMAGE_MIGRATE: ''
      }
      return map[action] || ''
    }
  }
}
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}
</style>
