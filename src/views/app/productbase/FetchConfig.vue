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
      <el-button size="small" type="primary" icon="el-icon-plus" @click="openDialog()">新建抓取配置</el-button>
    </div>

    <!-- 表格 -->
    <el-table :data="list" v-loading="loading" border size="small"
      :header-cell-style="{background:'#fafafa'}"
      :row-class-name="rowClass">
      <el-table-column prop="name" label="配置名称" min-width="160" show-overflow-tooltip />
      <el-table-column label="启用状态" width="100" align="center">
        <template slot-scope="scope">
          <el-tag size="mini" :type="scope.row.is_active ? 'success' : 'info'">
            {{ scope.row.is_active ? '已启用' : '未启用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="属性白名单" width="110" align="center">
        <template slot-scope="scope">
          {{ (scope.row.keep_attributes || []).length }} 个
        </template>
      </el-table-column>
      <el-table-column label="固定属性" width="100" align="center">
        <template slot-scope="scope">
          {{ fixedAttrCount(scope.row.fixed_attributes) }} 个
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="170" align="center">
        <template slot-scope="scope">
          <div>{{ scope.row.create_time | dateFmt }}</div>
          <div class="gray_zi">{{ scope.row.creator }}</div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="190" align="center">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" plain @click="openDialog(scope.row)">编辑</el-button>
          <el-popconfirm title="确定删除该抓取配置？" @confirm="deleteItem(scope.row.id)">
            <el-button slot="reference" size="mini" type="default" plain icon="el-icon-delete" circle />
          </el-popconfirm>
          <el-button v-if="!scope.row.is_active" size="mini" type="success" plain
            @click="activateItem(scope.row.id)">启用</el-button>
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
      :title="form.id ? '编辑抓取配置' : '新建抓取配置'"
      width="650px" destroy-on-close :close-on-click-modal="false">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="配置名称" prop="name">
          <el-input v-model="form.name" size="small" placeholder="如：默认抓取" />
        </el-form-item>
        <el-form-item label="启用配置">
          <el-tooltip content="保存时自动关闭同用户其他已启用的配置" placement="top">
            <el-switch v-model="form.is_active" active-text="启用" inactive-text="关闭" />
          </el-tooltip>
        </el-form-item>

        <!-- 属性保留白名单 -->
        <el-form-item label="属性白名单">
          <div class="tag-input-wrap">
            <el-tag v-for="(attr, idx) in form.keep_attributes" :key="'ka-' + idx"
              size="small" closable @close="removeKeepAttr(idx)" style="margin-right: 6px; margin-bottom: 4px">
              {{ attr }}
            </el-tag>
            <el-input v-if="keepAttrInputVisible" v-model="keepAttrInput"
              ref="keepAttrInput" size="mini" style="width: 140px"
              placeholder="输入属性名"
              @keyup.enter.native="addKeepAttr"
              @blur="addKeepAttr" />
            <el-button v-else size="mini" icon="el-icon-plus" @click="showKeepAttrInput">添加属性</el-button>
          </div>
          <div class="form-tip">从 eBay 抓取时，只保留白名单中的属性，其他丢弃</div>
        </el-form-item>

        <!-- 固定附加属性 -->
        <el-form-item label="固定属性">
          <el-table :data="form.fixed_attrs_list" border size="mini" style="width: 100%">
            <el-table-column label="属性名" min-width="160">
              <template slot-scope="scope">
                <el-input v-model="scope.row.key" size="mini" placeholder="属性名" />
              </template>
            </el-table-column>
            <el-table-column label="属性值" min-width="180">
              <template slot-scope="scope">
                <el-input v-model="scope.row.value" size="mini" placeholder="属性值" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="70" align="center">
              <template slot-scope="scope">
                <el-button size="mini" type="default" plain icon="el-icon-delete"
                  circle @click="removeFixedAttr(scope.$index)" />
              </template>
            </el-table-column>
          </el-table>
          <el-button size="small" type="primary" icon="el-icon-plus"
            style="margin-top: 8px" @click="addFixedAttr">添加属性</el-button>
          <div class="form-tip">
            固定写入的属性值。属性名不在白名单中则追加，存在则覆盖 eBay 原始值。
          </div>
        </el-form-item>
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
  name: 'FetchConfig',
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
      form: {
        id: null,
        name: '',
        is_active: false,
        keep_attributes: [],
        fixed_attrs_list: []
      },
      rules: {
        name: [{ required: true, message: '请输入配置名称', trigger: 'blur' }]
      },
      keepAttrInputVisible: false,
      keepAttrInput: ''
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
      let url = 'api/fetch_configs/?page=' + this.page + '&page_size=' + this.pageSize
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

    rowClass({ row }) {
      return row.is_active ? 'active-row' : ''
    },

    fixedAttrCount(obj) {
      if (!obj) return 0
      if (typeof obj === 'object') return Object.keys(obj).length
      return 0
    },

    openDialog(row) {
      if (row) {
        const keep = Array.isArray(row.keep_attributes) ? [...row.keep_attributes] : []
        let fixedList = []
        const fixed = row.fixed_attributes
        if (fixed && typeof fixed === 'object' && !Array.isArray(fixed)) {
          fixedList = Object.entries(fixed).map(([k, v]) => ({ key: k, value: v }))
        } else if (Array.isArray(fixed)) {
          fixedList = [...fixed]
        }
        this.form = {
          id: row.id,
          name: row.name || '',
          is_active: !!row.is_active,
          keep_attributes: keep,
          fixed_attrs_list: fixedList
        }
      } else {
        this.form = {
          id: null,
          name: '',
          is_active: false,
          keep_attributes: ['Compatible Model', 'Material', 'Type', 'Style', 'Compatible Brand'],
          fixed_attrs_list: []
        }
      }
      this.dialogVisible = true
    },

    // ---- keep_attributes tag input ----
    showKeepAttrInput() {
      this.keepAttrInputVisible = true
      this.keepAttrInput = ''
      this.$nextTick(() => {
        if (this.$refs.keepAttrInput) this.$refs.keepAttrInput.focus()
      })
    },

    addKeepAttr() {
      const val = (this.keepAttrInput || '').trim()
      if (val && !this.form.keep_attributes.includes(val)) {
        this.form.keep_attributes.push(val)
      }
      this.keepAttrInputVisible = false
      this.keepAttrInput = ''
    },

    removeKeepAttr(idx) {
      this.form.keep_attributes.splice(idx, 1)
    },

    // ---- fixed_attributes key-value table ----
    addFixedAttr() {
      this.form.fixed_attrs_list.push({ key: '', value: '' })
    },

    removeFixedAttr(idx) {
      this.form.fixed_attrs_list.splice(idx, 1)
    },

    // ---- save ----
    saveForm() {
      this.$refs.formRef.validate(valid => {
        if (!valid) return
        this.saving = true
        const data = {
          name: this.form.name,
          is_active: this.form.is_active,
          keep_attributes: this.form.keep_attributes,
          fixed_attributes: {}
        }
        // 将 [{key, value}] 转为 {key: value}
        this.form.fixed_attrs_list.forEach(item => {
          if (item.key && item.key.trim()) {
            data.fixed_attributes[item.key.trim()] = item.value || ''
          }
        })
        const req = this.form.id
          ? this.patchRequest('api/fetch_configs/' + this.form.id + '/', data)
          : this.postRequest('api/fetch_configs/', data)
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
      this.deleteRequest('api/fetch_configs/' + id + '/').then(resp => {
        if (resp) this.initList()
      })
    },

    activateItem(id) {
      this.postRequest('api/fetch_configs/' + id + '/activate/').then(resp => {
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
.tag-input-wrap {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 2px;
}
.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
.gray_zi { color: #99a9bf; font-size: 12px; }
</style>

<style>
/* 非 scoped，用于 el-table 行高亮 */
.active-row {
  background-color: #f0f9eb !important;
}
</style>
