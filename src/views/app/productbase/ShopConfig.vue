<template>
  <div>
    <!-- 工具栏 -->
    <div class="toolbar">
      <el-select v-model="filterPlatform" size="small" placeholder="平台" clearable
        style="width: 130px" @change="initList">
        <el-option label="EBAY" value="EBAY" />
        <el-option label="Amazon" value="Amazon" />
        <el-option label="Shopee" value="Shopee" />
        <el-option label="Lazada" value="Lazada" />
      </el-select>
      <el-select v-model="filterMain" size="small" placeholder="主店铺" clearable
        style="width: 110px" @change="initList">
        <el-option label="是" :value="true" />
        <el-option label="否" :value="false" />
      </el-select>
      <el-select v-if="isSuperuser" v-model="filterUser" size="small" placeholder="用户" clearable
        style="width: 130px" @change="initList">
        <el-option v-for="u in userOptions" :key="u.username" :label="u.first_name || u.username" :value="u.id" />
      </el-select>
      <el-input v-model="searchValue" size="small" placeholder="搜索店铺账号/站点" clearable
        style="width: 220px" @keyup.enter.native="initList" @clear="initList">
        <el-button slot="append" icon="el-icon-search" @click="initList" />
      </el-input>
      <el-button size="small" type="primary" icon="el-icon-plus" @click="openDialog()">新建店铺配置</el-button>
    </div>

    <!-- 表格 -->
    <el-table :data="list" v-loading="loading" border size="small"
      :header-cell-style="{background:'#fafafa'}">
      <el-table-column prop="platform" label="平台" width="90" />
      <el-table-column label="店铺账号" width="160" show-overflow-tooltip>
        <template slot-scope="scope">
          <div>{{ scope.row.shop_account }}
            <el-tag v-if="scope.row.is_main" size="mini" type="success" style="margin-left: 4px">主</el-tag>
          </div>
          <div class="gray_zi" style="font-size: 12px">{{ getFlagEmoji(getSiteCode(scope.row.site)) }} {{ getSiteName(scope.row.site) }}</div>
        </template>
      </el-table-column>
      <el-table-column label="自动创建" width="90" align="center">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.auto_create_shop"
            :disabled="scope.row.is_main"
            @change="toggleAutoCreate(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column label="刊登配置" min-width="100" show-overflow-tooltip>
        <template slot-scope="scope">
          {{ listingConfigMap[scope.row.listing_config] || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="定价规则" min-width="100" show-overflow-tooltip>
        <template slot-scope="scope">
          {{ pricingRuleMap[scope.row.pricing_rule] || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="170" align="center">
        <template slot-scope="scope">
          <div>{{ scope.row.create_time | dateFmt }}</div>
          <div class="gray_zi">{{ scope.row.creator }}</div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="170" align="center">
        <template slot-scope="scope">
          <div class="action-btns">
            <span><el-tooltip content="编辑" placement="top">
              <el-button size="mini" type="primary" plain icon="el-icon-edit" circle @click="openDialog(scope.row)" />
            </el-tooltip></span>
            <span v-if="!scope.row.is_main"><el-tooltip content="设为主店铺" placement="top">
              <el-button size="mini" type="warning" plain icon="el-icon-star-on" circle
                @click="setAsMain(scope.row)" />
            </el-tooltip></span>
            <span><el-popconfirm title="确定删除该店铺配置？" @confirm="deleteItem(scope.row.id)">
              <el-tooltip slot="reference" content="删除" placement="top">
                <el-button size="mini" type="default" plain icon="el-icon-delete" circle />
              </el-tooltip>
            </el-popconfirm></span>
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
      :title="form.id ? '编辑店铺配置' : '新建店铺配置'"
      width="500px" :close-on-click-modal="false" @closed="onDialogClosed">
      <el-form v-if="dialogVisible" ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="平台" prop="platform">
          <el-select v-model="form.platform" size="small" placeholder="请选择平台" style="width: 100%">
            <el-option label="EBAY" value="EBAY" />
            <el-option label="Amazon" value="Amazon" />
            <el-option label="Shopee" value="Shopee" />
            <el-option label="Lazada" value="Lazada" />
          </el-select>
        </el-form-item>
        <el-form-item label="店铺账号" prop="shop_account">
          <el-select v-model="form.shop_account" size="small" placeholder="请选择店铺账号"
            style="width: 100%" filterable :loading="loadingAccounts">
            <el-option v-for="acc in availableShopAccounts" :key="acc"
              :label="acc" :value="acc" />
          </el-select>
        </el-form-item>
        <el-form-item label="站点">
          <el-select v-model="form.site" size="small" placeholder="请选择站点"
            style="width: 100%" clearable filterable>
            <el-option v-for="s in siteOptions" :key="s.value"
              :label="s.label" :value="s.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="刊登配置">
          <el-select v-model="form.listing_config" size="small" placeholder="请选择刊登配置"
            style="width: 100%" clearable filterable>
            <el-option v-for="opt in listingConfigOptions" :key="opt.id"
              :label="opt.name" :value="opt.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="定价规则">
          <el-select v-model="form.pricing_rule" size="small" placeholder="请选择定价规则（可选）"
            style="width: 100%" clearable filterable>
            <el-option v-for="opt in pricingRuleOptions" :key="opt.id"
              :label="opt.name" :value="opt.id" />
          </el-select>
        </el-form-item>
        <template v-if="form.is_main">
          <el-divider content-position="left">AI 优化</el-divider>
          <el-form-item label="自动AI优化标题">
            <el-switch v-model="form.auto_optimize_title" />
          </el-form-item>
          <el-form-item label="自动AI优化描述">
            <el-switch v-model="form.auto_optimize_desc" />
          </el-form-item>
        </template>
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
  name: 'ShopConfig',
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
      filterPlatform: '',
      filterMain: undefined,
      filterUser: '',
      userOptions: [],
      dialogVisible: false,
      form: {
        id: null,
        platform: '',
        shop_account: '',
        site: '',
        is_main: false,
        auto_create_shop: false,
        listing_config: null,
        pricing_rule: null,
        auto_optimize_title: false,
        auto_optimize_desc: false
      },
      rules: {
        platform: [{ required: true, message: '请选择平台', trigger: 'change' }],
        shop_account: [{ required: true, message: '请选择店铺账号', trigger: 'change' }]
      },
      // ID → 名称映射（表格显示用）
      listingConfigMap: {},
      listingConfigOptions: [],
      pricingRuleMap: {},
      pricingRuleOptions: [],
      // 店铺账号下拉
      availableShopAccounts: [],
      loadingAccounts: false,
      // 站点选项（国旗 + 名称）
      siteOptions: [],
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
    this.loadListingConfigOptions()
    this.loadPricingRules()
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

    loadListingConfigOptions() {
      this.getRequest('api/listing_configs/?page_size=100').then(resp => {
        if (resp && resp.results) {
          const map = {}
          const opts = []
          resp.results.forEach(c => {
            map[c.id] = c.name
            opts.push({ id: c.id, name: c.name })
          })
          this.listingConfigMap = map
          this.listingConfigOptions = opts
        }
      })
    },

    loadPricingRules() {
      this.getRequest('api/pricing_rules/?page_size=100').then(resp => {
        if (resp && resp.results) {
          const map = {}
          const opts = []
          resp.results.forEach(r => {
            map[r.id] = r.name
            opts.push({ id: r.id, name: r.name })
          })
          this.pricingRuleMap = map
          this.pricingRuleOptions = opts
        }
      })
    },

    loadShopAccounts() {
      if (this.availableShopAccounts.length) return
      this.loadingAccounts = true
      this.getRequest('api/bo_bonus_accounts/?is_active=true&type=eBay&page_size=1000').then(resp => {
        this.loadingAccounts = false
        if (resp && resp.results) {
          this.availableShopAccounts = resp.results.map(r => r.name)
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
      let url = 'api/shop_configs/?page=' + this.page + '&page_size=' + this.pageSize
      if (this.searchValue) url += '&search=' + encodeURIComponent(this.searchValue)
      if (this.filterPlatform) url += '&platform=' + this.filterPlatform
      if (this.filterMain !== undefined && this.filterMain !== '') url += '&is_main=' + this.filterMain
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
      this.loadShopAccounts()
      this.loadListingConfigOptions()
      this.loadPricingRules()
      if (row) {
        this.form = { ...row }
      } else {
        this.form = {
          id: null, platform: '', shop_account: '', site: '',
          is_main: false, auto_create_shop: false, listing_config: null, pricing_rule: null,
          auto_optimize_title: false, auto_optimize_desc: false
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
        this.saving = true
        const data = {
          platform: this.form.platform,
          shop_account: this.form.shop_account,
          site: this.form.site,
          listing_config: this.form.listing_config,
          pricing_rule: this.form.pricing_rule,
          auto_optimize_title: this.form.auto_optimize_title,
          auto_optimize_desc: this.form.auto_optimize_desc
        }
        const req = this.form.id
          ? this.patchRequest('api/shop_configs/' + this.form.id + '/', data)
          : this.postRequest('api/shop_configs/', data)
        req.then(resp => {
          this.saving = false
          if (resp) {
            this.dialogVisible = false
            this.initList()
          }
        }).catch(() => { this.saving = false })
      })
    },

    toggleAutoCreate(row) {
      this.patchRequest('api/shop_configs/' + row.id + '/', {
        auto_create_shop: row.auto_create_shop
      }).then(resp => {
        if (!resp) {
          row.auto_create_shop = !row.auto_create_shop
        }
      })
    },

    setAsMain(row) {
      this.$confirm('将该店铺设为主店铺？', '提示', { type: 'warning' }).then(() => {
        this.patchRequest('api/shop_configs/' + row.id + '/', {
          is_main: true
        }).then(resp => {
          if (resp) this.initList()
        })
      }).catch(() => {})
    },

    deleteItem(id) {
      this.deleteRequest('api/shop_configs/' + id + '/').then(resp => {
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
