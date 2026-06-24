<template>
  <div>
    <!-- 工具栏 -->
    <div class="toolbar">
      <el-select v-if="isSuperuser" v-model="filterUser" size="small" placeholder="用户" clearable
        style="width: 130px" @change="initList">
        <el-option v-for="u in userOptions" :key="u.username" :label="u.first_name || u.username" :value="u.id" />
      </el-select>
      <el-input v-model="searchValue" size="small" placeholder="搜索规则名称" clearable
        style="width: 220px" @keyup.enter.native="initList" @clear="initList">
        <el-button slot="append" icon="el-icon-search" @click="initList" />
      </el-input>
      <el-button size="small" type="primary" icon="el-icon-plus" @click="openDialog()">新建规则</el-button>
    </div>

    <!-- 表格 -->
    <el-table :data="list" v-loading="loading" border size="small"
      :header-cell-style="{background:'#fafafa'}">
      <el-table-column prop="name" label="规则名称" min-width="140" show-overflow-tooltip />
      <el-table-column label="定价公式" min-width="240">
        <template slot-scope="scope">
          <code class="formula-code">{{ scope.row.formula }}</code>
        </template>
      </el-table-column>
      <el-table-column label="最低限价" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.min_price != null ? scope.row.min_price : '不限' }}
        </template>
      </el-table-column>
      <el-table-column label="最高限价" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.max_price != null ? scope.row.max_price : '不限' }}
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="170" align="center">
        <template slot-scope="scope">
          <div>{{ scope.row.create_time | dateFmt }}</div>
          <div class="gray_zi">{{ scope.row.creator }}</div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="140" align="center">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" plain @click="openDialog(scope.row)">编辑</el-button>
          <el-popconfirm title="确定删除该定价规则？" @confirm="deleteItem(scope.row.id)">
            <el-button slot="reference" size="mini" type="default" plain icon="el-icon-delete" circle />
          </el-popconfirm>
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
      :title="form.id ? '编辑定价规则' : '新建定价规则'"
      width="600px" :close-on-click-modal="false" @closed="onDialogClosed">
      <el-form v-if="dialogVisible" ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="规则名称" prop="name">
          <el-input v-model="form.name" size="small" placeholder="如：8折定价" />
        </el-form-item>
        <el-form-item label="定价公式" prop="formula">
          <el-input v-model="form.formula" type="textarea" size="small" :rows="3"
            class="formula-input"
            placeholder="输入定价公式，如：{price} * 0.8" />
          <div v-if="formulaError" class="formula-error">{{ formulaError }}</div>
          <div class="formula-help">
            <div class="help-title">可用变量</div>
            <div class="help-item"><code>{price}</code> — 抓取的价格</div>
            <div class="help-title">支持运算符</div>
            <div class="help-item">算术：<code>+</code> <code>-</code> <code>*</code> <code>/</code>&emsp;比较：<code>&lt;</code> <code>&gt;</code> <code>&lt;=</code> <code>&gt;=</code> <code>==</code> <code>!=</code></div>
            <div class="help-item">条件：<code>if</code> ... <code>else</code> ...</div>
            <div class="help-title">示例</div>
            <div class="help-item"><code>{price} * 0.8</code></div>
            <div class="help-item"><code>{price} * 0.9 if {price} &lt; 10 else {price} * 0.8</code><span class="help-desc">&nbsp;→ 低于10打9折，否则8折</span></div>
            <div class="help-item"><code>{price} * 1.1 + 3</code></div>
          </div>
        </el-form-item>
        <el-form-item label="最低限价">
          <el-input-number v-model="form.min_price" size="small"
            :min="0" :precision="2" controls-position="right" style="width: 180px" />
          <span class="form-tip">留空表示不限制</span>
        </el-form-item>
        <el-form-item label="最高限价">
          <el-input-number v-model="form.max_price" size="small"
            :min="0" :precision="2" controls-position="right" style="width: 180px" />
          <span class="form-tip">留空表示不限制</span>
        </el-form-item>
      </el-form>

      <!-- 公式测试 -->
      <el-divider content-position="left">公式试算</el-divider>
      <div class="test-row">
        <span class="test-label">测试价格</span>
        <el-input-number v-model="testPrice" size="small" :precision="2"
          controls-position="right" style="width: 160px" placeholder="输入价格" />
        <el-button size="small" type="primary" :loading="testing" @click="testPricing">试算</el-button>
      </div>
      <div v-if="testResult" class="test-result">
        <el-tag v-if="testResult.error" type="danger" size="small">{{ testResult.error }}</el-tag>
        <template v-else>
          <div class="test-steps">
            <span class="test-step">原价 <b>{{ testResult.original_price }}</b></span>
            <i class="el-icon-right"></i>
            <span class="test-step">目标价 <b>{{ testResult.target_price }}</b></span>
            <i class="el-icon-right"></i>
            <span class="test-step">最终价 <b class="test-final">{{ testResult.final_price }}</b></span>
          </div>
          <div v-if="testResult.detail" class="test-detail gray_zi">
            <div v-for="(line, i) in testResult.detail.split('\n')" :key="i"
              v-html="line ? line : '&nbsp;'" />
          </div>
        </template>
      </div>

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
  name: 'PricingRule',
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
      filterUser: '',
      userOptions: [],
      dialogVisible: false,
      formulaError: '',
      form: {
        id: null,
        name: '',
        formula: '',
        min_price: null,
        max_price: null
      },
      rules: {
        name: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
        formula: [{ required: true, message: '请输入定价公式', trigger: 'blur' }]
      },
      // 公式试算
      testPrice: null,
      testing: false,
      testResult: null
    }
  },
  computed: {
    isSuperuser() {
      const user = JSON.parse(window.sessionStorage.getItem('user') || '{}')
      return !!user.is_superuser
    }
  },
  mounted() {
    this.loadUsers()
    this.initList()
  },
  methods: {
    loadUsers() {
      const user = JSON.parse(window.sessionStorage.getItem('user') || '{}')
      if (!user.is_superuser) return
      this.getRequest('api/settings/users/?is_active=True&page_size=1000').then(resp => {
        if (resp) {
          this.userOptions = Array.isArray(resp) ? resp : (resp.results || [])
        }
      })
    },

    initList() {
      this.loading = true
      let url = 'api/pricing_rules/?page=' + this.page + '&page_size=' + this.pageSize
      if (this.searchValue) url += '&search=' + encodeURIComponent(this.searchValue)
      if (this.filterUser) url += '&user=' + this.filterUser
      this.getRequest(url).then(resp => {
        this.loading = false
        if (resp && resp.results) {
          this.list = resp.results
          this.total = resp.count
        }
      }).catch(() => { this.loading = false })
    },

    openDialog(row) {
      this.formulaError = ''
      this.testResult = null
      this.testPrice = null
      if (row) {
        this.form = { ...row }
      } else {
        this.form = { id: null, name: '', formula: '', min_price: null, max_price: null }
      }
      this.dialogVisible = true
    },

    onDialogClosed() {
      if (this.$refs.formRef) {
        this.$refs.formRef.resetFields()
      }
      this.formulaError = ''
      this.testResult = null
    },

    testPricing() {
      if (!this.form.formula || !this.form.formula.trim()) {
        this.$message.warning('请先输入定价公式')
        return
      }
      if (this.testPrice == null || this.testPrice === '') {
        this.$message.warning('请输入测试价格')
        return
      }
      if (parseFloat(this.testPrice) < 0) {
        this.$message.warning('测试价格不能为负数')
        return
      }
      this.testing = true
      this.testResult = null
      const payload = {
        formula: this.form.formula.trim(),
        price: this.testPrice
      }
      if (this.form.min_price) payload.min_price = this.form.min_price
      if (this.form.max_price) payload.max_price = this.form.max_price
      this.postRequest('api/pricing_rules/test_pricing/', payload).then(resp => {
        this.testing = false
        if (resp) {
          if (resp.error) {
            this.testResult = { error: resp.error }
          } else {
            this.testResult = resp
          }
        }
      }).catch(() => {
        this.testing = false
        this.testResult = { error: '试算请求失败' }
      })
    },

    saveForm() {
      this.$refs.formRef.validate(valid => {
        if (!valid) return
        this.formulaError = ''
        this.saving = true
        const data = { ...this.form }
        delete data.id
        if (!data.min_price) data.min_price = null
        if (!data.max_price) data.max_price = null
        const req = this.form.id
          ? this.patchRequest('api/pricing_rules/' + this.form.id + '/', data)
          : this.postRequest('api/pricing_rules/', data)
        req.then(resp => {
          this.saving = false
          if (resp) {
            this.dialogVisible = false
            this.initList()
          }
        }).catch(() => {
          this.saving = false
          // 公式验证错误由拦截器展示，同时记录到本地
        })
      })
    },

    deleteItem(id) {
      this.deleteRequest('api/pricing_rules/' + id + '/').then(resp => {
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
.formula-code {
  font-family: 'SF Mono', 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 12px;
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 3px;
  word-break: break-all;
}
.formula-input ::v-deep textarea {
  font-family: 'SF Mono', 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 12px;
}
.form-tip {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
}
.formula-error {
  font-size: 12px;
  color: #f56c6c;
  margin-top: 4px;
  line-height: 1.5;
}
.formula-help {
  margin-top: 8px;
  padding: 10px 12px;
  background: #fafafa;
  border-radius: 6px;
  border: 1px solid #ebeef5;
  font-size: 12px;
  line-height: 1.9;
  color: #606266;
}
.help-title {
  font-weight: 600;
  color: #303133;
  margin-top: 6px;
}
.help-title:first-child {
  margin-top: 0;
}
.help-item {
  padding-left: 8px;
}
.help-item code {
  font-family: 'SF Mono', 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 11px;
  background: #ecf5ff;
  color: #409eff;
  padding: 1px 5px;
  border-radius: 3px;
}
.help-desc {
  color: #909399;
}
.test-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.test-label {
  font-size: 13px;
  color: #606266;
}
.test-result {
  padding: 10px 12px;
  background: #f0f9eb;
  border-radius: 6px;
  border: 1px solid #e1f3d8;
  font-size: 13px;
}
.test-steps {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.test-step {
  color: #606266;
}
.test-step b {
  color: #303133;
}
.test-final {
  color: #67c23a;
}
.test-detail {
  font-size: 12px;
  line-height: 1.7;
}
.gray_zi {
  color: #99a9bf;
}
</style>
