<template>
  <div>
    <!-- 工具栏 -->
    <div class="toolbar">
      <el-select v-if="isSuperuser" v-model="filterUser" size="small" placeholder="用户" clearable
        style="width: 130px" @change="initList">
        <el-option v-for="u in userOptions" :key="u.username" :label="u.first_name || u.username" :value="u.id" />
      </el-select>
      <el-input v-model="searchValue" size="small" placeholder="搜索配置名称" clearable
        style="width: 220px" @keyup.enter.native="initList" @clear="initList">
        <el-button slot="append" icon="el-icon-search" @click="initList" />
      </el-input>
      <el-button size="small" type="primary" icon="el-icon-plus" @click="openDialog()">新建刊登配置</el-button>
    </div>

    <!-- 表格 -->
    <el-table :data="list" v-loading="loading" border size="small"
      :header-cell-style="{background:'#fafafa'}">
      <el-table-column prop="name" label="配置名称" min-width="140" show-overflow-tooltip />
      <el-table-column label="默认库存" width="85" align="center">
        <template slot-scope="scope">
          {{ scope.row.default_stock != null ? scope.row.default_stock : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="匹配账号" width="120" show-overflow-tooltip>
        <template slot-scope="scope">
          {{ scope.row.match_shop_account || '全部' }}
        </template>
      </el-table-column>
      <el-table-column label="匹配站点" width="130">
        <template slot-scope="scope">
          {{ scope.row.match_site ? (getFlagEmoji(getSiteCode(scope.row.match_site)) + ' ' + getSiteName(scope.row.match_site)) : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="PL 状态" width="85" align="center">
        <template slot-scope="scope">
          <el-tag size="mini" :type="scope.row.promoted_listing_enabled ? 'success' : 'info'">
            {{ scope.row.promoted_listing_enabled ? '已开启' : '未开启' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="150" align="center">
        <template slot-scope="scope">
          <div>{{ scope.row.create_time | dateFmt }}</div>
          <div class="gray_zi">{{ scope.row.creator }}</div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="140" align="center">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" plain @click="openDialog(scope.row)">编辑</el-button>
          <el-popconfirm title="确定删除该刊登配置？" @confirm="deleteItem(scope.row.id)">
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
      :title="form.id ? '编辑刊登配置' : '新建刊登配置'"
      width="650px" :close-on-click-modal="false" @closed="onDialogClosed">
      <el-form v-if="dialogVisible" ref="formRef" :model="form" :rules="rules" label-width="130px">
        <el-tabs v-model="formTab" type="card">
          <!-- Tab 1: 基础信息 -->
          <el-tab-pane label="基础信息" name="basic">
            <el-form-item label="配置名称" prop="name">
              <el-input v-model="form.name" size="small" placeholder="如：标准刊登" />
              <div class="form-tip">建议名称格式：国家-账号-物流方式-广告情况，如：AU-MAX-信封-广告15%</div>
            </el-form-item>
            <el-form-item label="默认上架库存">
              <el-input-number v-model="form.default_stock" size="small"
                :min="0" controls-position="right" style="width: 180px" />
            </el-form-item>
            <el-form-item label="DC标签">
              <el-input v-model="form.tags" size="small" placeholder="多个标签用逗号分隔" />
            </el-form-item>
            <el-form-item label="销售计划">
              <el-input v-model="form.sale_plan" size="small" placeholder="销售计划" />
            </el-form-item>
            <el-form-item label="折扣">
              <el-input v-model="form.discount" size="small" placeholder="如：10% off" />
            </el-form-item>
            <el-form-item label="匹配店铺账号">
              <el-select v-model="form.match_shop_account" size="small" placeholder="选择账号（不填匹配全部）"
                style="width: 100%" clearable filterable :loading="loadingAccounts">
                <el-option v-for="acc in accountOptions" :key="acc"
                  :label="acc" :value="acc" />
              </el-select>
              <div class="form-tip">不填代表匹配所有账号</div>
            </el-form-item>
            <el-form-item label="匹配站点" prop="match_site">
              <el-select v-model="form.match_site" size="small" placeholder="请选择匹配站点"
                style="width: 100%" clearable filterable>
                <el-option v-for="s in siteOptions" :key="s.value"
                  :label="s.label" :value="s.value" />
              </el-select>
            </el-form-item>
          </el-tab-pane>

          <!-- Tab 2: 刊登模板 -->
          <el-tab-pane label="刊登模板" name="content">
            <el-form-item label="通用刊登模板">
              <el-select v-model="form.listing_template" size="small" placeholder="通用刊登模板" style="width: 100%" clearable filterable allow-create>
                <el-option v-for="o in listingTemplateOptions" :key="o" :label="o" :value="o" />
              </el-select>
            </el-form-item>
            <el-form-item label="付款方式">
              <el-input v-model="form.payment_method" size="small" placeholder="付款方式描述" />
            </el-form-item>
            <el-form-item label="货运方式">
              <el-select v-model="form.shipping_method" size="small" placeholder="货运方式描述" style="width: 100%" clearable filterable allow-create>
                <el-option v-for="o in shippingMethodOptions" :key="o" :label="o" :value="o" />
              </el-select>
            </el-form-item>
            <el-form-item label="不运送地区">
              <el-input v-model="form.excluded_regions" size="small" placeholder="不运送地区列表" />
            </el-form-item>
            <el-form-item label="买家要求">
              <el-input v-model="form.buyer_requirements" size="small" placeholder="买家要求" />
            </el-form-item>
            <el-form-item label="退货政策">
              <el-input v-model="form.return_policy" size="small" placeholder="退货政策" />
            </el-form-item>
            <el-form-item label="物品所在地">
              <el-select v-model="form.item_location" size="small" placeholder="物品所在地" style="width: 100%" clearable filterable allow-create>
                <el-option v-for="o in itemLocationOptions" :key="o" :label="o" :value="o" />
              </el-select>
            </el-form-item>
          </el-tab-pane>

          <!-- Tab 3: 广告 -->
          <el-tab-pane label="广告" name="ad">
            <el-form-item label="Promoted Listing">
              <el-switch v-model="form.promoted_listing_enabled" active-text="开启" inactive-text="关闭" />
            </el-form-item>
            <el-form-item label="PL 广告费率(%)">
              <el-input-number v-model="form.promoted_listing_ad_rate" size="small"
                :min="0" :max="100" :step="0.1" :precision="1"
                controls-position="right" style="width: 180px" />
            </el-form-item>
            <el-form-item label="Campaign">
              <el-input v-model="form.campaign" size="small" placeholder="Campaign 内容" />
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
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
  name: 'ListingConfig',
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
      formTab: 'basic',
      loadingAccounts: false,
      form: {
        id: null,
        name: '',
        default_stock: 10,
        tags: '',
        listing_template: '',
        payment_method: '',
        shipping_method: '',
        excluded_regions: '',
        buyer_requirements: '',
        return_policy: '',
        item_location: '',
        sale_plan: '',
        discount: '',
        match_shop_account: '',
        match_site: '',
        promoted_listing_enabled: false,
        promoted_listing_ad_rate: null,
        campaign: ''
      },
      rules: {
        name: [{ required: true, message: '请输入配置名称', trigger: 'blur' }],
        match_site: [{ required: true, message: '请选择匹配站点', trigger: 'change' }]
      },
      // 账号选项
      accountOptions: [],
      // 站点选项
      siteOptions: [],
      // 下拉预设选项
      listingTemplateOptions: ['AU本土', 'UK虚拟仓'],
      shippingMethodOptions: ['澳洲本土_跟踪普通', '澳洲本土_跟踪超厚'],
      itemLocationOptions: ['澳洲通用', '澳洲-76', '澳洲-GB', '澳洲-XF'],
      siteCodes: {
        'EBAY_US': 'US', 'EBAY_AU': 'AU', 'EBAY_CA': 'CA', 'EBAY_DE': 'DE',
        'EBAY_ES': 'ES', 'EBAY_FR': 'FR', 'EBAY_GB': 'GB', 'EBAY_IE': 'IE',
        'EBAY_IN': 'IN', 'EBAY_IT': 'IT', 'EBAY_MY': 'MY', 'EBAY_NL': 'NL',
        'EBAY_PH': 'PH', 'EBAY_PL': 'PL', 'EBAY_SG': 'SG', 'EBAY_TH': 'TH',
        'EBAY_VN': 'VN'
      },
      siteNames: {
        'EBAY_US': '美国', 'EBAY_AU': '澳大利亚', 'EBAY_CA': '加拿大', 'EBAY_DE': '德国',
        'EBAY_ES': '西班牙', 'EBAY_FR': '法国', 'EBAY_GB': '英国', 'EBAY_IE': '爱尔兰',
        'EBAY_IN': '印度', 'EBAY_IT': '意大利', 'EBAY_MY': '马来西亚', 'EBAY_NL': '荷兰',
        'EBAY_PH': '菲律宾', 'EBAY_PL': '波兰', 'EBAY_SG': '新加坡', 'EBAY_TH': '泰国',
        'EBAY_VN': '越南'
      }
    }
  },
  computed: {
    isSuperuser() {
      const user = JSON.parse(window.sessionStorage.getItem('user') || '{}')
      return !!user.is_superuser
    }
  },
  mounted() {
    this.buildSiteOptions()
    this.loadAccounts()
    this.loadUsers()
    this.initList()
  },
  methods: {
    buildSiteOptions() {
      this.siteOptions = Object.keys(this.siteCodes).map(value => {
        const code = this.siteCodes[value]
        const flag = this.getFlagEmoji(code)
        return { label: flag + ' ' + this.siteNames[value], value }
      })
    },

    getFlagEmoji(code) {
      if (!code || code.length !== 2) return ''
      const cp = code.toUpperCase().split('').map(c => 0x1F1E6 + c.charCodeAt(0) - 65)
      return String.fromCodePoint(...cp)
    },

    getSiteCode(site) {
      return this.siteCodes[site] || ''
    },

    getSiteName(site) {
      return this.siteNames[site] || site || ''
    },

    loadAccounts() {
      this.loadingAccounts = true
      this.getRequest('api/bo_bonus_accounts/?is_active=true&type=eBay&page_size=1000').then(resp => {
        this.loadingAccounts = false
        if (resp && resp.results) {
          this.accountOptions = resp.results.map(r => r.name)
        }
      }).catch(() => { this.loadingAccounts = false })
    },

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
      let url = 'api/listing_configs/?page=' + this.page + '&page_size=' + this.pageSize
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
      this.formTab = 'basic'
      if (row) {
        this.form = { ...row }
      } else {
        this.form = {
          id: null, name: '', default_stock: 10, tags: '',
          listing_template: '', payment_method: '', shipping_method: '',
          excluded_regions: '', buyer_requirements: '', return_policy: '', item_location: '',
          sale_plan: '', discount: '', match_shop_account: '', match_site: '',
          promoted_listing_enabled: false, promoted_listing_ad_rate: null, campaign: ''
        }
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
        if (this.form.promoted_listing_enabled) {
          if (!this.form.promoted_listing_ad_rate || parseFloat(this.form.promoted_listing_ad_rate) <= 0) {
            this.$message.warning('Promoted Listing 已开启，广告费率必须大于 0')
            return
          }
          if (!(this.form.campaign || '').trim()) {
            this.$message.warning('Promoted Listing 已开启，Campaign 不能为空')
            return
          }
        }
        this.saving = true
        const data = { ...this.form }
        delete data.id
        if (data.tags) {
          data.tags = data.tags.split(',').map(t => t.trim()).filter(Boolean).join(',')
        }
        const req = this.form.id
          ? this.patchRequest('api/listing_configs/' + this.form.id + '/', data)
          : this.postRequest('api/listing_configs/', data)
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
      this.deleteRequest('api/listing_configs/' + id + '/').then(resp => {
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
.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
.gray_zi { color: #99a9bf; font-size: 12px; }
</style>
