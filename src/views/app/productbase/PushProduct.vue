<template>
  <div>
    <!--    状态筛选项-->
    <div class="status">
      <div>
        <el-button size="small" :type="p_status==='INIT'?'primary':''" @click="changeStatus('INIT')">草稿箱</el-button>
        <span class="jiantou"><i class="el-icon-d-arrow-right"></i></span>

        <el-button size="small" :type="p_status==='PREPARING'?'primary':''" @click="changeStatus('PREPARING')">数据准备</el-button>
        <span class="jiantou"><i class="el-icon-d-arrow-right"></i></span>

        <el-button size="small" :type="p_status==='READY'?'primary':''" @click="changeStatus('READY')">产品列表</el-button>
      </div>
    </div>
    <!--    筛选信息-->
    <div class="operate">
      <div class="operate-left">
        <el-input size="small" :placeholder="searchPlaceholder"
                  clearable
                  @clear="clearSearchValue"
                  @keyup.enter.native="doSearch"
                  v-model="searchValue"
                  style="width: 320px; margin-right: 5px">
          <el-select slot="prepend" v-model="searchType" size="small"
            style="width: 80px">
            <el-option label="综合" value="search" />
            <el-option label="SKU" value="sku" />
            <el-option label="标题" value="title" />
          </el-select>
          <el-button slot="append" icon="el-icon-search" @click="doSearch">搜索</el-button>
        </el-input>
        <el-select v-model="filterUser" size="small" style="width: 140px; margin-right: 5px" @change="changeUserFilter">
          <el-option label="我的产品" value="" />
          <el-option label="所有产品" value="__all__" />
          <el-option v-if="isSuperuser" v-for="u in userOptions" :key="u.username"
            :label="u.first_name || u.username" :value="u.username" />
        </el-select>
        <!-- 数据状态筛选（仅数据准备可见） -->
        <el-dropdown @command="handleDataStatus" v-if="p_status==='PREPARING'" style="margin-left: 5px">
          <el-button size="small">
            数据状态<i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item :class="{ 'is-checked': filterMigrated === 'true' }" command="migrated-true">
              <i v-if="filterMigrated === 'true'" class="el-icon-check" style="margin-right: 6px" />图片已迁移
            </el-dropdown-item>
            <el-dropdown-item :class="{ 'is-checked': filterMigrated === 'false' }" command="migrated-false">
              <i v-if="filterMigrated === 'false'" class="el-icon-check" style="margin-right: 6px" />图片未迁移
            </el-dropdown-item>
            <el-dropdown-item :class="{ 'is-checked': filterMapped === 'true' }" command="mapped-true">
              <i v-if="filterMapped === 'true'" class="el-icon-check" style="margin-right: 6px" />变体已翻译
            </el-dropdown-item>
            <el-dropdown-item :class="{ 'is-checked': filterMapped === 'false' }" command="mapped-false">
              <i v-if="filterMapped === 'false'" class="el-icon-check" style="margin-right: 6px" />变体未翻译
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <!-- 下拉批量操作菜单 -->
        <el-dropdown @command="handleBatchCommand">
          <el-button size="small">
            批量操作<i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-if="p_status==='INIT'" command="fillInfo">批量补充资料</el-dropdown-item>
            <el-dropdown-item command="delete">批量删除</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
      <div class="operate-right">
        <!-- 导出下拉 -->
        <el-dropdown @command="handleExportCommand" v-if="p_status==='READY'">
          <el-button size="small" type="primary">
            导出<i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="selected" :disabled="!hasSelection">导出 SKU(勾选)</el-dropdown-item>
            <el-dropdown-item command="unsynced">导出 SKU(未同步)</el-dropdown-item>
            <el-dropdown-item command="listingSelected" :disabled="!hasSelection" divided>导出上架信息(勾选)</el-dropdown-item>
            <el-dropdown-item command="listingUnsynced">导出上架信息(未同步)</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
    <!--数据表格-->
    <div style="margin-top: 5px">
      <!--      草稿箱-->
      <el-table
          v-if="p_status==='INIT'"
          ref="productTable"
          :data="Products"
          :header-cell-style="{background:'#fafafa'}"
          v-loading="loading"
          highlight-current-row
          style="width: 100%">

        <el-table-column
            type="selection"
            width="42">
        </el-table-column>

        <el-table-column
            label="图片"
            align="center"
            header-align="center"
            width="120">
          <template slot-scope="scope">
            <el-image
                style="width: 70px; height: 70px; border-radius: 8px"
                :src="thumbUrl(scope.row.images)"
                :preview-src-list="scope.row.images ? [scope.row.images] : []"
                fit="cover">
            </el-image>
          </template>
        </el-table-column>

        <el-table-column
            label="产品/类目"
            show-overflow-tooltip
            min-width="300">
          <template slot-scope="scope">
            <div>{{ scope.row.first_product_group_title}}</div>
            <div class="gray_zi">{{ scope.row.category}}</div>
            <div class="gray_zi">{{ scope.row.from_site_id}}
              <el-tag size="mini" type="info">{{ scope.row.sku_count }}个SKU</el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column
            width="150"
            label="产品供应">
          <template slot-scope="scope">
            <div>{{scope.row.supplier}}</div>
            <div class="gray_zi">{{scope.row.series}}</div>
          </template>
        </el-table-column>

        <el-table-column
            label="标签"
            width="150">
          <template slot-scope="scope">
            <el-tag v-for="(t, i) in (scope.row.tag || '').split(',').filter(Boolean)" :key="i" size="mini" style="margin: 2px">{{ t.trim() }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column
            label="创建日期"
            align="center"
            header-align="center"
            width="130">
          <template slot-scope="scope">
            <div>{{ scope.row.create_time | dateT }}</div>
            <div class="gray_zi">{{scope.row.creator}}</div>
          </template>
        </el-table-column>

        <el-table-column
            label="操作"
            align="center"
            header-align="center"
        >
          <template slot-scope="scope">
            <el-button
                size="mini" type="warning" plain round @click="openAddInfoDialog(scope.row)">
              <i class="el-icon-warning-outline"></i> 补充资料
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!--      数据准备-->
      <el-table
          v-if="p_status==='PREPARING'"
          ref="productTable"
          :data="Products"
          :header-cell-style="{background:'#fafafa'}"
          v-loading="loading"
          highlight-current-row
          style="width: 100%">

        <el-table-column
            type="selection"
            width="42">
        </el-table-column>

        <el-table-column
            label="图片"
            align="center"
            header-align="center"
            width="120">
          <template slot-scope="scope">
            <el-image
                style="width: 70px; height: 70px; border-radius: 8px"
                :src="thumbUrl(scope.row.images)"
                :preview-src-list="scope.row.images ? [scope.row.images] : []"
                fit="cover">
            </el-image>
          </template>
        </el-table-column>

        <el-table-column
            label="产品信息"
            min-width="300">
          <template slot-scope="scope">
            <div>{{scope.row.supplier}}</div>
            <div class="gray_zi">{{scope.row.series}}</div>
            <div class="gray_zi">
              <el-tag size="mini" style="margin-right: 5px">{{ scope.row.group_count }}个店铺</el-tag>
              <el-tag size="mini" type="info">{{ scope.row.sku_count }}个SKU</el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column
            label="标签"
            width="150">
          <template slot-scope="scope">
            <el-tag v-for="(t, i) in (scope.row.tag || '').split(',').filter(Boolean)" :key="i" size="mini" style="margin: 2px">{{ t.trim() }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column
            label="图片迁移"
            width="140" align="center">
          <template slot-scope="scope">
            <div>
              <el-tag size="mini" :type="migrationTagType(scope.row)">
                {{ migrationLabel(scope.row) }}
              </el-tag>
            </div>
            <div v-if="scope.row.image_migration_summary" class="gray_zi" style="margin-top: 2px">
              {{ scope.row.image_migration_summary }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
            label="变体翻译"
            width="90" align="center">
          <template slot-scope="scope">
            <el-tag size="mini" :type="scope.row.variant_mapped ? 'success' : 'info'">
              {{ scope.row.variant_mapped ? '已翻译' : '待翻译' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
            label="创建日期"
            align="center"
            header-align="center"
            width="130">
          <template slot-scope="scope">
            <div>{{ scope.row.create_time | dateT }}</div>
            <div class="gray_zi">{{scope.row.creator}}</div>
          </template>
        </el-table-column>

        <el-table-column
            label="操作"
            align="center"
            header-align="center"
        >
          <template slot-scope="scope">
            <el-button
                size="mini" type="success" plain round @click="openDetailDialog(scope.row.id)">
              详情
            </el-button>
            <template v-if="scope.row.image_migration_status === 'partial' || scope.row.image_migration_status === 'failed'">
              <el-tooltip content="重新迁移" placement="top">
                <el-button
                  size="mini" type="warning" plain circle icon="el-icon-refresh"
                  style="margin-left: 6px"
                  :loading="scope.row._retrying"
                  @click="retryMigration(scope.row)" />
              </el-tooltip>
              <el-tooltip content="跳过迁移" placement="top">
                <el-button
                  size="mini" type="info" plain circle icon="el-icon-close"
                  style="margin-left: 6px"
                  :loading="scope.row._skipping"
                  @click="skipMigration(scope.row)" />
              </el-tooltip>
            </template>
            <el-button
                v-if="scope.row.image_migrated && scope.row.variant_mapped"
                size="mini" type="warning" plain round
                style="margin-left: 6px"
                :loading="scope.row._marking"
                @click="markReady(scope.row)">
              <i class="el-icon-check"></i> 上架
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!--      产品列表(READY) -->
      <el-table
          v-if="p_status==='READY'"
          ref="productTable"
          :data="Products"
          :header-cell-style="{background:'#fafafa'}"
          v-loading="loading"
          highlight-current-row
          style="width: 100%">

        <el-table-column
            type="selection"
            width="42">
        </el-table-column>

        <el-table-column
            label="图片"
            align="center"
            header-align="center"
            width="120">
          <template slot-scope="scope">
            <el-image
                style="width: 70px; height: 70px; border-radius: 8px"
                :src="thumbUrl(scope.row.images)"
                :preview-src-list="scope.row.images ? [scope.row.images] : []"
                fit="cover">
            </el-image>
          </template>
        </el-table-column>

        <el-table-column
            label="产品信息"
            show-overflow-tooltip
            min-width="300">
          <template slot-scope="scope">
            <div>{{ scope.row.first_product_group_title}}</div>
            <div class="gray_zi">{{ scope.row.category}}</div>
            <div class="gray_zi">
              <el-tag size="mini">{{ scope.row.group_count }}个店铺</el-tag>
              <el-tag size="mini" type="info">{{ scope.row.sku_count }}个SKU</el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column
            width="150"
            label="产品供应">
          <template slot-scope="scope">
            <div>{{scope.row.supplier}}</div>
            <div class="gray_zi">{{scope.row.series}}</div>
          </template>
        </el-table-column>

        <el-table-column
            label="标签"
            width="150">
          <template slot-scope="scope">
            <el-tag v-for="(t, i) in (scope.row.tag || '').split(',').filter(Boolean)" :key="i" size="mini" style="margin: 2px">{{ t.trim() }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column
            label="同步进度"
            width="140" align="center">
          <template slot-scope="scope">
            <div class="gray_zi">SKU {{ scope.row.synced_sku_count || '0/0' }}</div>
            <div class="gray_zi">店铺 {{ scope.row.synced_shop_count || '0/0' }}</div>
          </template>
        </el-table-column>

        <el-table-column
            label="创建日期"
            align="center"
            header-align="center"
            width="130">
          <template slot-scope="scope">
            <div>{{ scope.row.create_time | dateT }}</div>
            <div class="gray_zi">{{scope.row.creator}}</div>
          </template>
        </el-table-column>

        <el-table-column
            label="操作"
            align="center"
            header-align="center"
        >
          <template slot-scope="scope">
            <el-button
                size="mini" type="success" plain round @click="openDetailDialog(scope.row.id)">
              产品详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
            background
            :page-sizes="[20, 30, 40, 50, 100]"
            @current-change="currentChange"
            @size-change="sizeChange"
            layout="sizes, prev, pager, next, jumper, ->, total"
            :current-page="page"
            :total="total">
        </el-pagination>
      </div>
    </div>

    <!-- 补充资料弹窗 -->
    <el-dialog
        title="补充资料"
        :visible.sync="addInfoDialogVisible"
        width="500px"
        @close="resetAddInfoForm">
      <el-form :model="addInfoForm" :rules="addInfoRules" ref="addInfoFormRef" label-width="80px">
        <el-form-item label="供应商" prop="supplier">
          <el-autocomplete v-model="addInfoForm.supplier" placeholder="输入或选择供应商" size="small" style="width: 100%" clearable
            :fetch-suggestions="searchAddInfoSuppliers"
            @select="onAdInfoSupplierChange" @input="clearSupplierError">
            <template slot-scope="{ item }">
              <i v-if="item.favorite" class="el-icon-star-on" style="color: #f7ba2a; margin-right: 4px"></i>
              <span>{{ item.value }}</span>
            </template>
          </el-autocomplete>
        </el-form-item>
        <el-form-item label="产品系列" prop="series">
          <el-autocomplete v-model="addInfoForm.series" placeholder="输入或选择产品系列" size="small" style="width: 100%" clearable
            :fetch-suggestions="searchAddInfoSeries"
            @select="onAdInfoSeriesChange" @input="clearSeriesError" />
        </el-form-item>
        <el-form-item label="成本价" prop="cost">
          <el-input v-model="addInfoForm.cost" placeholder="请输入成本价" type="number"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addInfoDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="addInfoSaving" @click="submitAddInfo">确认提交</el-button>
      </div>
    </el-dialog>

    <!-- ================== 产品详情弹窗 ================== -->
    <el-dialog
        title="产品详情"
        :visible.sync="detailDialogVisible"
        width="90%"
        top="5vh"
        append-to-body
        :close-on-click-modal="false"
        :before-close="handleDetailBeforeClose">
      <!-- 嵌入详情组件，传入id -->
      <PushProductDetail
          v-if="detailDialogVisible"
          ref="pushDetail"
          :product-id="currentProductId"
          @saved="onDetailSaved"
          @cancel="handleDetailCancel"
      />
    </el-dialog>

  </div>
</template>

<script>
import moment from "moment";
import axios from "axios";
// 引入产品详情组件
import PushProductDetail from "./PushProductDetail.vue";

export default {
  name: "PushProduct",
  components: {
    PushProductDetail // 注册组件
  },
  data() {
    return {
      loading: false,
      total: 0,
      page: 1,
      size: 20,
      searchValue: '',
      searchType: 'search',
      Products: [],
      p_status: 'PREPARING',
      filterMigrated: '',
      filterMapped: '',
      filterUser: '',
      userOptions: [],
      addInfoDialogVisible: false,
      addInfoSaving: false,
      selectedRows: [],
      addInfoForm: {
        supplier: '',
        series: '',
        cost: ''
      },
      addInfoRules: {
        supplier: [{required: true, message: '请输入供应商', trigger: ['blur', 'change']}],
        series: [{required: true, message: '请输入产品系列', trigger: ['blur', 'change']}],
        cost: [{required: true, message: '请输入成本价', trigger: 'blur'}]
      },
      // 辅助录入数据
      addInfoSuppliers: [],
      addInfoSeriesList: [],
      addInfoSeriesAll: [],
      addInfoSeriesMap: {},
      // 产品详情弹窗
      detailDialogVisible: false,
      currentProductId: null // 传递给详情的ID
    }
  },
  computed: {
    searchPlaceholder() {
      const map = { search: '搜索类目/系列/标签', sku: '搜索 SKU', title: '搜索标题' }
      return map[this.searchType] || '请输入搜索内容'
    },
    isSuperuser() {
      const user = JSON.parse(window.sessionStorage.getItem('user') || '{}')
      return !!user.is_superuser
    },
    hasSelection() {
      const table = this.$refs.productTable
      return table && table.selection && table.selection.length > 0
    }
  },
  filters: {
    dateT: function (value) {
      return moment(value).format("YYYY-MM-DD HH:mm");
    },
  },
  created() {
    this._reqId = 0 // 非响应式，防止竞态
  },
  mounted() {
    this.loadUsers()
    this.initProducts()
    this.loadAddInfoRefs()
  },
  methods: {
    thumbUrl(url) {
      if (!url) return ''
      return url + (url.indexOf('?') >= 0 ? '&w=100' : '?w=100')
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
    changeStatus(value) {
      this.page = 1;
      this.p_status = value
      this.filterMigrated = ''
      this.filterMapped = ''
      this.initProducts()
    },
    changeUserFilter() {
      this.page = 1
      this.initProducts()
    },
    handleDataStatus(cmd) {
      this.page = 1
      if (cmd === 'migrated-true') {
        this.filterMigrated = this.filterMigrated === 'true' ? '' : 'true'
      } else if (cmd === 'migrated-false') {
        this.filterMigrated = this.filterMigrated === 'false' ? '' : 'false'
      } else if (cmd === 'mapped-true') {
        this.filterMapped = this.filterMapped === 'true' ? '' : 'true'
      } else if (cmd === 'mapped-false') {
        this.filterMapped = this.filterMapped === 'false' ? '' : 'false'
      }
      this.initProducts()
    },
    clearSearchValue() {
      this.searchValue = '';
      this.initProducts();
    },
    doSearch() {
      this.page = 1;
      this.$refs.productTable.clearFilter();
      this.initProducts();
    },
    sizeChange(size) {
      this.page = 1;
      this.size = size;
      this.initProducts();
    },
    currentChange(page) {
      this.page = page;
      this.initProducts();
    },
    initProducts() {
      const reqId = ++this._reqId
      let url = '/api/base_product_group/?page=' + this.page + '&page_size=' + this.size
      url += '&p_status=' + this.p_status
      if (this.filterUser === '__all__') {
        // 所有产品，不加 creator 筛选
      } else if (this.filterUser) {
        url += '&creator=' + encodeURIComponent(this.filterUser)
      } else {
        const user = JSON.parse(window.sessionStorage.getItem('user') || '{}')
        if (user.username) url += '&creator=' + encodeURIComponent(user.username)
      }
      if (this.filterMigrated) url += '&image_migrated=' + this.filterMigrated
      if (this.filterMapped) url += '&variant_mapped=' + this.filterMapped
      if (this.searchValue) {
        url += '&' + this.searchType + '=' + encodeURIComponent(this.searchValue)
      }
      this.loading = true
      this.getRequest(url).then(resp => {
        this.loading = false
        if (resp && resp.results && reqId === this._reqId) {
          this.Products = resp.results
          this.total = resp.count
        }
      }).catch(() => {
        this.loading = false
      })
    },
    // 加载供应商和产品系列辅助数据
    loadAddInfoRefs() {
      this.getRequest('api/base_suppliers/quick_list/').then(resp => {
        if (resp && Array.isArray(resp)) {
          this.addInfoSuppliers = resp
          const map = {}
          const all = []
          resp.forEach(sup => {
            if (sup.series && sup.series.length) {
              map[sup.id] = sup.series
              all.push(...sup.series)
            }
          })
          this.addInfoSeriesList = all
          this.addInfoSeriesAll = all
          this.addInfoSeriesMap = map
        }
      })
    },

    searchAddInfoSuppliers(query, cb) {
      const q = (query || '').toLowerCase()
      cb(this.addInfoSuppliers.filter(s => s.name.toLowerCase().includes(q)).map(s => ({ value: s.name, favorite: !!s.is_favorite })))
    },

    searchAddInfoSeries(query, cb) {
      const q = (query || '').toLowerCase()
      cb(this.addInfoSeriesList.filter(s => s.name.toLowerCase().includes(q)).map(s => ({ value: s.name })))
    },

    clearSupplierError() {
      this.$nextTick(() => {
        if (this.addInfoForm.supplier && this.$refs.addInfoFormRef) {
          this.$refs.addInfoFormRef.clearValidate('supplier')
        }
      })
    },

    clearSeriesError() {
      this.$nextTick(() => {
        if (this.addInfoForm.series && this.$refs.addInfoFormRef) {
          this.$refs.addInfoFormRef.clearValidate('series')
        }
      })
    },

    // 供应商变更 → 过滤产品系列
    onAdInfoSupplierChange(item) {
      const val = (item && item.value) ? item.value : this.addInfoForm.supplier
      this.addInfoForm.series = ''
      this.addInfoForm.cost = ''
      if (!val) {
        this.addInfoSeriesList = this.addInfoSeriesAll || []
        return
      }
      const sup = this.addInfoSuppliers.find(s => s.name === val)
      if (sup) {
        this.addInfoSeriesList = this.addInfoSeriesMap[sup.id] || []
      } else {
        this.addInfoSeriesList = this.addInfoSeriesAll || []
      }
    },

    // 产品系列变更 → 自动填价格
    onAdInfoSeriesChange(item) {
      const val = (item && item.value) ? item.value : this.addInfoForm.series
      if (!val) {
        this.addInfoForm.cost = ''
        return
      }
      const series = this.addInfoSeriesList.find(s => s.name === val)
      if (series && series.price) {
        this.addInfoForm.cost = series.price
      }
    },

    // 单个打开补充资料
    openAddInfoDialog(row) {
      this.selectedRows = [row];
      this.addInfoForm.supplier = row.supplier || '';
      this.addInfoForm.series = row.series || '';
      this.addInfoForm.cost = row.cost || '';
      this.addInfoDialogVisible = true;
      this.loadAddInfoRefs();
    },
    resetAddInfoForm() {
      this.$refs.addInfoFormRef.resetFields();
    },
    // 提交补充资料
    submitAddInfo() {
      this.$refs.addInfoFormRef.validate(valid => {
        if (!valid) return;
        let postData = {
          ids: this.selectedRows.map(item => item.id),
          supplier: this.addInfoForm.supplier,
          series: this.addInfoForm.series,
          cost: this.addInfoForm.cost
        };
        this.addInfoSaving = true
        this.postRequest('/api/base_product_group/update_product_supply/', postData).then(res => {
          this.addInfoSaving = false
          if (res) {
            this.addInfoDialogVisible = false
            this.initProducts()
          }
        }).catch(() => { this.addInfoSaving = false })
      });
    },
    // 批量下拉菜单指令分发
    handleBatchCommand(cmd) {
      const selection = this.$refs.productTable.selection;
      if (!selection.length) {
        this.$message.warning('请先勾选操作数据');
        return;
      }
      this.selectedRows = selection;
      if (cmd === 'fillInfo') {
        this.addInfoForm = {supplier: '', series: '', cost: ''};
        this.addInfoDialogVisible = true;
        this.loadAddInfoRefs();
      } else if (cmd === 'delete') {
        this.$confirm('此操作将永久删除选中数据, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          const ids = this.selectedRows.map(item => item.id);
          this.postRequest('/api/base_product_group/batch_delete/', {ids}).then(() => {
            this.initProducts();
          }).catch(() => {
          })
        }).catch(() => {});
      }
    },

    // ================== 打开产品详情弹窗 ==================
    openDetailDialog(id) {
      this.currentProductId = id;
      this.detailDialogVisible = true;
    },

    // ================== 导出 ==================
    handleExportCommand(cmd) {
      const selection = this.$refs.productTable.selection
      if (cmd === 'selected') {
        if (!selection.length) { this.$message.warning('请先勾选产品'); return }
        this.exportSkus({ ids: selection.map(r => r.id) })
      } else if (cmd === 'unsynced') {
        const user = JSON.parse(window.sessionStorage.getItem('user') || '{}')
        this.exportSkus({ creator: user.username || '' })
      } else if (cmd === 'listingSelected') {
        if (!selection.length) { this.$message.warning('请先勾选产品'); return }
        this.exportListing({ ids: selection.map(r => r.id) })
      } else if (cmd === 'listingUnsynced') {
        this.exportListing({})
      }
    },

    async exportSkus(params) {
      try {
        const token = window.localStorage.getItem('tokenStr')
        const instance = axios.create()
        const resp = await instance.post('api/base_product_group/export_skus/', params, {
          responseType: 'blob',
          headers: { Authorization: token, 'app-ver': 176 }
        })
        const blob = resp.data
        const contentType = resp.headers['content-type'] || ''
        // 无数据时返回 JSON，否则返回 Excel
        if (contentType.includes('application/json')) {
          const text = await blob.text()
          const json = JSON.parse(text)
          this.$message.info(json.msg || '没有需要导出的数据')
          return
        }
        if (!blob || blob.size === 0) {
          this.$message.error('导出失败：空文件')
          return
        }
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'skus_export.xlsx'
        a.click()
        URL.revokeObjectURL(url)
        this.$message.success('导出成功')
      } catch (e) {
        this.$message.error('导出失败')
      }
    },

    // ================== 导出上架信息 ==================
    async exportListing(params) {
      try {
        const token = window.localStorage.getItem('tokenStr')
        const instance = axios.create()
        const resp = await instance.post('api/base_product_group/export_listing/', params, {
          responseType: 'blob',
          headers: { Authorization: token, 'app-ver': 176 }
        })
        const blob = resp.data
        const contentType = resp.headers['content-type'] || ''
        if (contentType.includes('application/json')) {
          const text = await blob.text()
          const json = JSON.parse(text)
          this.$message.info(json.msg || json.error || '没有需要导出的数据')
          return
        }
        if (!blob || blob.size === 0) {
          this.$message.error('导出失败：空文件')
          return
        }
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'listing_export.xlsx'
        a.click()
        URL.revokeObjectURL(url)
        this.$message.success('导出成功')
      } catch (e) {
        this.$message.error('导出失败')
      }
    },

    // ================== Mark Ready ==================
    markReady(row) {
      this.$set(row, '_marking', true)
      this.postRequest('api/base_product_group/' + row.id + '/mark_ready/').then(resp => {
        this.$set(row, '_marking', false)
        if (resp) this.initProducts()
      }).catch(() => { this.$set(row, '_marking', false) })
    },

    // ================== 图片迁移状态 ==================
    migrationTagType(row) {
      const s = row.image_migration_status
      if (s === 'done') return 'success'
      if (s === 'partial') return 'warning'
      if (s === 'failed') return 'danger'
      return 'info' // pending
    },
    migrationLabel(row) {
      const s = row.image_migration_status
      if (s === 'done') return '已迁移'
      if (s === 'partial') return '部分失败'
      if (s === 'failed') return '迁移失败'
      return '迁移中'
    },
    retryMigration(row) {
      this.$set(row, '_retrying', true)
      this.postRequest('api/base_product_group/' + row.id + '/retry_migration/').then(resp => {
        this.$set(row, '_retrying', false)
        if (resp) this.initProducts()
      }).catch(() => { this.$set(row, '_retrying', false) })
    },
    skipMigration(row) {
      this.$confirm('跳过将删除剩余未迁移的图片并标记迁移完成，确定跳过？', '提示', { type: 'warning' }).then(() => {
        this.$set(row, '_skipping', true)
        this.postRequest('api/base_product_group/' + row.id + '/skip_migration/').then(resp => {
          this.$set(row, '_skipping', false)
          if (resp) this.initProducts()
        }).catch(() => { this.$set(row, '_skipping', false) })
      }).catch(() => {})
    },

    // ================== 产品详情保存回调 ==================
    onDetailSaved() {
      this.detailDialogVisible = false;
      this.initProducts();
    },

    handleDetailCancel() {
      const detail = this.$refs.pushDetail
      if (detail && detail._modified) {
        this.$confirm('内容已修改，确定不保存就关闭？', '提示', { type: 'warning' })
          .then(() => { this.detailDialogVisible = false })
          .catch(() => {})
      } else {
        this.detailDialogVisible = false
      }
    },

    handleDetailBeforeClose(done) {
      const detail = this.$refs.pushDetail
      if (detail && detail._modified) {
        this.$confirm('内容已修改，确定不保存就关闭？', '提示', { type: 'warning' })
          .then(() => done())
          .catch(() => {})
      } else {
        done()
      }
    }
  }
}
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}
.gray_zi {
  color: #99a9bf;
}
.operate {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.operate-left {
  display: flex;
  align-items: center;
  gap: 5px;
}
.operate-right {
  display: flex;
  align-items: center;
}
::v-deep .el-dropdown-menu__item.is-checked {
  color: #409eff;
  font-weight: 500;
}
::v-deep .el-dropdown-menu__item.is-disabled {
  color: #c0c4cc;
  cursor: not-allowed;
}
.status {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.jiantou {
  margin-left: 8px;
  margin-right: 8px;
  color: #6e7079;
}
.dialog-footer {
  text-align: right;
}
</style>