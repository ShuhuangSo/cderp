<template>
  <div>
    <!-- 工具栏 -->
    <div class="toolbar">
      <el-input v-model="search" size="small" placeholder="搜索名称/联系人/电话" clearable
        style="width: 280px" @keyup.enter.native="initSuppliers" @clear="initSuppliers">
        <el-button slot="append" icon="el-icon-search" @click="initSuppliers" />
      </el-input>
      <el-button size="small" :type="filterFavorite ? 'warning' : ''" icon="el-icon-star-on"
        @click="filterFavorite = !filterFavorite; initSuppliers()">
        {{ filterFavorite ? '已收藏' : '收藏' }}
      </el-button>
      <el-button size="small" type="primary" icon="el-icon-plus" @click="openSupplierDialog()">新增供应商</el-button>
    </div>

    <!-- 供应商表格（可展开产品系列） -->
    <el-table :data="suppliers" v-loading="loading" border size="small"
      :header-cell-style="{background:'#fafafa'}" row-key="id" @expand-change="handleExpand">
      <el-table-column type="expand">
        <template slot-scope="scope">
          <div class="expand-content">
            <div class="expand-header">
              <span class="expand-title">产品系列（{{ getSeriesList(scope.row.id).length }}）</span>
              <el-button size="mini" type="primary" icon="el-icon-plus" @click="openSeriesDialog(null, scope.row.id)">
                新增系列
              </el-button>
            </div>
            <el-table :data="getSeriesList(scope.row.id)" border size="mini"
              :header-cell-style="{background:'#f5f7fa'}" style="margin-top: 8px">
              <el-table-column prop="name" label="系列名称" min-width="200" />
              <el-table-column prop="price" label="价格" width="120" />
              <el-table-column label="操作" width="120" align="center">
                <template slot-scope="s">
                  <el-button size="mini" type="primary" plain @click="openSeriesDialog(s.row, scope.row.id)">编辑</el-button>
                  <el-popconfirm title="确定删除？" @confirm="deleteSeries(s.row.id, scope.row.id)">
                    <el-button slot="reference" size="mini" type="default" plain icon="el-icon-delete" />
                  </el-popconfirm>
                </template>
              </el-table-column>
            </el-table>
            <el-empty v-if="getSeriesList(scope.row.id).length === 0" description="暂无产品系列" :image-size="40" />
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="供应商名称" min-width="160" />
      <el-table-column label="收藏" width="70" align="center">
        <template slot-scope="scope">
          <i :class="scope.row.is_favorite ? 'el-icon-star-on' : 'el-icon-star-off'"
            :style="{ color: scope.row.is_favorite ? '#e6a23c' : '#c0c4cc', cursor: 'pointer', fontSize: '18px' }"
            @click="toggleFavorite(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column label="系列数" width="80" align="center">
        <template slot-scope="scope">
          <el-tag size="mini" type="info">{{ getSeriesCount(scope.row.id) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="contact_person" label="联系人" width="100" />
      <el-table-column prop="phone" label="电话" width="130" />
      <el-table-column prop="wechat" label="微信" width="110" />
      <el-table-column prop="purchase_channel" label="采购渠道" width="100" />
      <el-table-column label="链接" width="120" show-overflow-tooltip>
        <template slot-scope="scope">
          <a v-if="scope.row.link_url" :href="scope.row.link_url" target="_blank" style="color: #409eff">
            {{ scope.row.link_url }}
          </a>
        </template>
      </el-table-column>
      <el-table-column prop="address" label="地址" min-width="140" show-overflow-tooltip />
      <el-table-column label="操作" width="140" align="center" fixed="right">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" plain @click="openSupplierDialog(scope.row)">编辑</el-button>
          <el-popconfirm title="确定删除该供应商？将级联删除所有产品系列" @confirm="deleteSupplier(scope.row.id)">
            <el-button slot="reference" size="mini" type="default" plain icon="el-icon-delete" />
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination v-if="total > pageSize" class="pagination" background
      :page-sizes="[20, 30, 50, 100]" :current-page="page" :page-size="pageSize"
      :total="total" layout="sizes, prev, pager, next, jumper, ->, total"
      @current-change="page = $event; initSuppliers()"
      @size-change="pageSize = $event; initSuppliers()" />

    <!-- 供应商弹窗 -->
    <el-dialog :title="supplierForm.id ? '编辑供应商' : '新增供应商'" :visible.sync="supplierDialogVisible"
      width="550px" destroy-on-close :close-on-click-modal="false">
      <el-form ref="supplierFormRef" :model="supplierForm" :rules="supplierRules" label-width="80px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="名称" prop="name">
              <el-input v-model="supplierForm.name" size="small" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="采购渠道">
              <el-input v-model="supplierForm.purchase_channel" size="small" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="链接">
              <el-input v-model="supplierForm.link_url" size="small" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="联系人">
              <el-input v-model="supplierForm.contact_person" size="small" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电话">
              <el-input v-model="supplierForm.phone" size="small" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="微信">
              <el-input v-model="supplierForm.wechat" size="small" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="QQ">
              <el-input v-model="supplierForm.qq" size="small" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="地址">
              <el-input v-model="supplierForm.address" size="small" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="收藏">
              <el-switch v-model="supplierForm.is_favorite" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer">
        <el-button @click="supplierDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="savingSupplier" @click="saveSupplier">保存</el-button>
      </div>
    </el-dialog>

    <!-- 产品系列弹窗 -->
    <el-dialog :title="seriesForm.id ? '编辑产品系列' : '新增产品系列'" :visible.sync="seriesDialogVisible"
      width="400px" destroy-on-close :close-on-click-modal="false">
      <el-form ref="seriesFormRef" :model="seriesForm" :rules="seriesRules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="seriesForm.name" size="small" />
        </el-form-item>
        <el-form-item label="价格">
          <el-input-number v-model="seriesForm.price" size="small" :precision="2" :min="0"
            controls-position="right" style="width: 100%" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="seriesDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="savingSeries" @click="saveSeries">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'SupplierManager',
  data() {
    return {
      loading: false,
      search: '',
      filterFavorite: false,
      page: 1,
      pageSize: 20,
      total: 0,
      suppliers: [],
      // 每个供应商的产品系列缓存 { supplierId: [seriesObjects] }
      seriesMap: {},
      // 供应商弹窗
      supplierDialogVisible: false,
      savingSupplier: false,
      supplierForm: { id: null, name: '', is_favorite: false, purchase_channel: '', link_url: '',
        contact_person: '', phone: '', wechat: '', qq: '', address: '' },
      supplierRules: { name: [{ required: true, message: '请输入名称', trigger: 'blur' }] },
      // 产品系列弹窗
      seriesDialogVisible: false,
      savingSeries: false,
      seriesForm: { id: null, name: '', price: 0, supplier: null },
      seriesRules: { name: [{ required: true, message: '请输入名称', trigger: 'blur' }] }
    }
  },
  mounted() {
    this.initSuppliers()
    this.loadAllSeries()
  },
  methods: {
    // ========== 供应商 ==========
    loadAllSeries() {
      this.getRequest('api/product_series/?page_size=1000').then(resp => {
        if (resp && resp.results) {
          const map = {}
          resp.results.forEach(s => {
            if (!map[s.supplier]) map[s.supplier] = []
            map[s.supplier].push(s)
          })
          this.seriesMap = map
        }
      })
    },

    initSuppliers() {
      this.loading = true
      let url = 'api/base_suppliers/?page=' + this.page + '&page_size=' + this.pageSize
      if (this.search) url += '&search=' + encodeURIComponent(this.search)
      if (this.filterFavorite) url += '&is_favorite=true'
      this.getRequest(url).then(resp => {
        this.loading = false
        if (resp && resp.results) {
          this.suppliers = resp.results
          this.total = resp.count
        }
      }).catch(() => { this.loading = false })
    },

    getSeriesCount(supplierId) {
      const list = this.seriesMap[supplierId]
      return list ? list.length : 0
    },

    getSeriesList(supplierId) {
      return this.seriesMap[supplierId] || []
    },

    loadSeries(supplierId) {
      if (this.seriesMap[supplierId]) return
      this.getRequest('api/product_series/?supplier=' + supplierId + '&page_size=1000').then(resp => {
        if (resp && resp.results) {
          this.$set(this.seriesMap, supplierId, resp.results)
        }
      })
    },

    // 展开行时确保数据已加载
    handleExpand(row, expandedRows) {
      if (expandedRows.some(r => r.id === row.id) && !this.seriesMap[row.id]) {
        this.loadSeries(row.id)
      }
    },

    openSupplierDialog(row) {
      if (row) {
        this.supplierForm = { ...row }
      } else {
        this.supplierForm = { id: null, name: '', is_favorite: false, purchase_channel: '', link_url: '',
          contact_person: '', phone: '', wechat: '', qq: '', address: '' }
      }
      this.supplierDialogVisible = true
    },

    saveSupplier() {
      this.$refs.supplierFormRef.validate(valid => {
        if (!valid) return
        this.savingSupplier = true
        const data = { ...this.supplierForm }
        delete data.id
        const req = this.supplierForm.id
          ? this.patchRequest('api/base_suppliers/' + this.supplierForm.id + '/', data)
          : this.postRequest('api/base_suppliers/', data)
        req.then(resp => {
          this.savingSupplier = false
          if (resp) {
            this.supplierDialogVisible = false
            this.initSuppliers()
            this.loadAllSeries()
          }
          // resp 为 undefined 时表示 API 错误，全局拦截器已弹提示，保持弹窗
        }).catch(() => { this.savingSupplier = false })
      })
    },

    deleteSupplier(id) {
      this.deleteRequest('api/base_suppliers/' + id + '/').then(() => {
        this.$delete(this.seriesMap, id)
        this.initSuppliers()
      })
    },

    toggleFavorite(row) {
      this.patchRequest('api/base_suppliers/' + row.id + '/', { is_favorite: !row.is_favorite }).then(() => {
        row.is_favorite = !row.is_favorite
      })
    },

    // ========== 产品系列 ==========
    openSeriesDialog(row, supplierId) {
      if (row) {
        this.seriesForm = { ...row, supplier: supplierId }
      } else {
        this.seriesForm = { id: null, name: '', price: 0, supplier: supplierId }
      }
      this.seriesDialogVisible = true
    },

    saveSeries() {
      this.$refs.seriesFormRef.validate(valid => {
        if (!valid) return
        this.savingSeries = true
        const data = { name: this.seriesForm.name, price: this.seriesForm.price, supplier: this.seriesForm.supplier }
        const req = this.seriesForm.id
          ? this.patchRequest('api/product_series/' + this.seriesForm.id + '/', data)
          : this.postRequest('api/product_series/', data)
        req.then(() => {
          this.savingSeries = false
          this.seriesDialogVisible = false
          // 刷新该供应商的产品系列
          const sid = this.seriesForm.supplier
          this.$delete(this.seriesMap, sid)
          this.loadSeries(sid)
        }).catch(() => { this.savingSeries = false })
      })
    },

    deleteSeries(seriesId, supplierId) {
      this.deleteRequest('api/product_series/' + seriesId + '/').then(() => {
        this.$delete(this.seriesMap, supplierId)
        this.loadSeries(supplierId)
      })
    }
  }
}
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  gap: 8px;
}
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}
.expand-content {
  padding: 8px 0;
}
.expand-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.expand-title {
  font-weight: 600;
  font-size: 13px;
  color: #303133;
}
</style>
