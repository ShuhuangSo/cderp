<template>
  <div>
    <!-- 工具栏 -->
    <div class="toolbar">
      <el-input v-model="searchValue" size="small" placeholder="搜索类目/仓库" clearable
        style="width: 220px" @keyup.enter.native="initList" @clear="initList">
        <el-button slot="append" icon="el-icon-search" @click="initList" />
      </el-input>
      <el-button size="small" type="primary" icon="el-icon-plus" @click="openDialog()">新建规则</el-button>
    </div>

    <!-- 表格 -->
    <el-table :data="list" v-loading="loading" border size="small"
      :header-cell-style="{background:'#fafafa'}">
      <el-table-column prop="category_id" label="类目ID" min-width="160" show-overflow-tooltip>
        <template slot-scope="scope">
          <span v-if="scope.row.category_id">{{ scope.row.category_id }}</span>
          <span v-else class="gray_zi">兜底规则</span>
        </template>
      </el-table-column>
      <el-table-column prop="category_name" label="类目名称" min-width="120" show-overflow-tooltip>
        <template slot-scope="scope">
          <span v-if="scope.row.category_name">{{ scope.row.category_name }}</span>
          <span v-else class="gray_zi">-</span>
        </template>
      </el-table-column>
      <el-table-column prop="warehouse" label="仓库" min-width="120" />
      <el-table-column label="MB产品状态" min-width="110" show-overflow-tooltip>
        <template slot-scope="scope">
          {{ scope.row.mb_product_status || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="priority" label="优先级" width="80" align="center" />
      <el-table-column label="创建时间" width="170" align="center">
        <template slot-scope="scope">
          <div>{{ scope.row.create_time | dateFmt }}</div>
          <div class="gray_zi">{{ scope.row.creator }}</div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" align="center">
        <template slot-scope="scope">
          <div class="action-btns">
            <el-tooltip content="编辑" placement="top">
              <el-button size="mini" type="primary" plain icon="el-icon-edit" circle @click="openDialog(scope.row)" />
            </el-tooltip>
            <el-popconfirm title="确定删除该规则？" @confirm="deleteItem(scope.row.id)">
              <el-tooltip slot="reference" content="删除" placement="top">
                <el-button size="mini" type="default" plain icon="el-icon-delete" circle />
              </el-tooltip>
            </el-popconfirm>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination v-if="total > pageSize" class="pagination" background
      :page-sizes="[20, 30, 50, 100]" :current-page="page" :page-size="pageSize"
      :total="total" layout="sizes, prev, pager, next, jumper, ->, total"
      @current-change="page = $event; initList()"
      @size-change="pageSize = $event; initList()" />

    <!-- 新建/编辑弹窗 -->
    <el-dialog :visible.sync="dialogVisible"
      :title="form.id ? '编辑仓库匹配规则' : '新建仓库匹配规则'"
      width="500px" :close-on-click-modal="false" @closed="onDialogClosed">
      <el-form v-if="dialogVisible" ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="类目ID">
          <el-input v-model="form.category_id" size="small" placeholder="eBay 类目ID 路径，如：150|173444" />
        </el-form-item>
        <el-form-item label="类目名称">
          <el-input v-model="form.category_name" size="small" placeholder="类目名称，子串匹配（大小写不敏感）" />
        </el-form-item>
        <el-form-item label="仓库" prop="warehouse">
          <el-input v-model="form.warehouse" size="small" placeholder="如：华强仓" />
        </el-form-item>
        <el-form-item label="MB产品状态">
          <el-select v-model="form.mb_product_status" size="small" placeholder="导出的产品状态" clearable style="width: 100%">
            <el-option label="自动创建" value="自动创建" />
            <el-option label="等待开发" value="等待开发" />
            <el-option label="正常销售" value="正常销售" />
            <el-option label="商品清仓" value="商品清仓" />
            <el-option label="停止销售" value="停止销售" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-input-number v-model="form.priority" size="small" :min="0" controls-position="right" style="width: 180px" />
        </el-form-item>
        <div class="form-tip" style="margin-left: 100px">
          category_id 精确匹配 → category_name 子串匹配 → 兜底规则 → 硬编码兜底 'F仓'<br>
          <b>兜底规则：</b>category_id 和 category_name 均为空（有且仅一条）
        </div>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveForm">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  name: 'WarehouseConfig',
  filters: {
    dateFmt(value) {
      if (!value) return ''
      return moment(value).format('YYYY-MM-DD HH:mm')
    }
  },
  data() {
    return {
      loading: false,
      saving: false,
      list: [],
      page: 1,
      pageSize: 20,
      total: 0,
      searchValue: '',
      dialogVisible: false,
      form: {
        id: null,
        category_id: '',
        category_name: '',
        warehouse: '',
        mb_product_status: '',
        priority: 0
      },
      rules: {
        warehouse: [{ required: true, message: '请输入仓库名称', trigger: 'blur' }]
      }
    }
  },
  mounted() {
    this.initList()
  },
  methods: {
    initList() {
      this.loading = true
      let url = 'api/warehouse_configs/?page=' + this.page + '&page_size=' + this.pageSize
      if (this.searchValue) url += '&search=' + encodeURIComponent(this.searchValue)
      this.getRequest(url).then(resp => {
        this.loading = false
        if (resp && resp.results) {
          this.list = resp.results
          this.total = resp.count
        }
      }).catch(() => { this.loading = false })
    },

    openDialog(row) {
      if (row) {
        this.form = { ...row }
      } else {
        this.form = { id: null, category_id: '', category_name: '', warehouse: '', mb_product_status: '', priority: 0 }
      }
      this.dialogVisible = true
    },

    onDialogClosed() {
      if (this.$refs.formRef) {
        this.$refs.formRef.resetFields()
      }
    },

    saveForm() {
      this.$refs.formRef.validate(valid => {
        if (!valid) return
        this.saving = true
        const data = { ...this.form }
        delete data.id
        const req = this.form.id
          ? this.putRequest('api/warehouse_configs/' + this.form.id + '/', data)
          : this.postRequest('api/warehouse_configs/', data)
        req.then(resp => {
          this.saving = false
          if (resp) {
            this.dialogVisible = false
            this.initList()
          }
        }).catch(() => { this.saving = false })
      })
    },

    deleteItem(id) {
      this.deleteRequest('api/warehouse_configs/' + id + '/').then(resp => {
        if (resp) this.initList()
      })
    }
  }
}
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}
.gray_zi { color: #99a9bf; font-size: 12px; }
.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.6;
}
.action-btns {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
}
.action-btns > span {
  display: inline-flex;
}
</style>
