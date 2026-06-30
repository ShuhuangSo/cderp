<template>
  <div>
    <!-- 工具栏 -->
    <div class="toolbar">
      <el-input v-model="searchValue" size="small" placeholder="搜索属性名" clearable
        style="width: 220px" @keyup.enter.native="initList" @clear="initList">
        <el-button slot="append" icon="el-icon-search" @click="initList" />
      </el-input>
      <el-button size="small" type="primary" icon="el-icon-plus" @click="openDialog()">新建属性映射</el-button>
    </div>

    <!-- 表格 -->
    <el-table :data="list" v-loading="loading" border size="small"
      :header-cell-style="{background:'#fafafa'}">
      <el-table-column type="expand">
        <template slot-scope="scope">
          <el-table v-if="scope.row.values && scope.row.values.length"
            :data="scope.row.values" border size="mini" style="margin: 4px 0; width: 98%">
            <el-table-column type="index" label="#" width="40" align="center" />
            <el-table-column label="匹配模式" min-width="180">
              <template slot-scope="vs">
                <code>{{ vs.row.match_pattern }}</code>
              </template>
            </el-table-column>
            <el-table-column label="替换为" min-width="180">
              <template slot-scope="vs">
                <code>{{ vs.row.replace_value }}</code>
              </template>
            </el-table-column>
          </el-table>
          <span v-else class="gray_zi">暂无规则</span>
        </template>
      </el-table-column>
      <el-table-column label="变体属性名" min-width="180">
        <template slot-scope="scope">
          <template v-for="(name, i) in parseNames(scope.row.attribute_name)">
            <el-tag size="small" type="warning" style="margin: 2px" :key="i">{{ name }}</el-tag>
          </template>
        </template>
      </el-table-column>
      <el-table-column label="规则数" width="80" align="center">
        <template slot-scope="scope">
          {{ (scope.row.values || []).length }}
        </template>
      </el-table-column>
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
            <el-popconfirm title="确定删除该属性映射？" @confirm="deleteItem(scope.row.id)">
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
      :title="form.id ? '编辑属性映射' : '新建属性映射'"
      width="650px" :close-on-click-modal="false" @closed="onDialogClosed">
      <el-form v-if="dialogVisible" ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="变体属性名" prop="attribute_name">
          <div class="variant-tags">
            <template v-for="(name, idx) in attrNameList">
              <el-input
                v-if="editingNameIdx === idx"
                :key="'edit-' + idx"
                v-model="editingNameValue"
                ref="editNameInput"
                size="mini"
                style="width: 120px; margin-right: 6px; margin-bottom: 4px"
                @keyup.enter.native="commitEditName(idx)"
                @blur="commitEditName(idx)"
              />
              <el-tag
                v-else
                :key="idx"
                size="small"
                closable
                type="warning"
                @close="removeName(idx)"
                @click.native="startEditName(idx, name)"
                style="margin-right: 6px; margin-bottom: 4px; cursor: pointer"
              >{{ name }}</el-tag>
            </template>
            <el-input
              v-if="showNameInput"
              ref="nameInput"
              v-model="newNameValue"
              size="mini"
              style="width: 120px; margin-right: 6px"
              placeholder="新属性名"
              @keyup.enter.native="addName"
              @blur="addName"
            />
            <el-button
              v-else
              size="mini" type="primary" icon="el-icon-plus" circle
              @click="showNameInput = true"
            />
          </div>
          <div class="form-tip">多个属性名以逗号分隔，大小写不敏感，全局唯一</div>
        </el-form-item>

        <!-- 值替换规则 -->
        <el-divider content-position="left">值替换规则（拖拽排序，上→下优先级递减）</el-divider>
        <draggable v-model="form.values" ghost-class="value-ghost" handle=".drag-handle">
          <div v-for="(val, idx) in form.values" :key="'val-' + idx" class="value-row">
            <i class="el-icon-s-operation drag-handle" title="拖拽排序" />
            <span class="value-idx">{{ idx + 1 }}</span>
            <el-input v-model="val.match_pattern" size="small" placeholder="匹配模式" style="flex: 1" />
            <span class="value-arrow">→</span>
            <el-input v-model="val.replace_value" size="small" placeholder="替换为" style="flex: 1" />
            <el-button size="mini" type="default" plain icon="el-icon-delete" circle @click="removeValue(idx)" />
          </div>
        </draggable>
        <el-button size="small" type="primary" icon="el-icon-plus" style="margin-top: 8px" @click="addValue">添加规则</el-button>
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
import draggable from 'vuedraggable'

export default {
  name: 'VariantMappingConfig',
  components: { draggable },
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
        attribute_name: '',
        values: []
      },
      rules: {
        attribute_name: [{ required: true, message: '请输入变体属性名', trigger: 'blur' }]
      },
      // tag editing in form
      editingNameIdx: -1,
      editingNameValue: '',
      showNameInput: false,
      newNameValue: ''
    }
  },
  computed: {
    attrNameList() {
      return (this.form.attribute_name || '').split(',').map(s => s.trim()).filter(Boolean)
    }
  },
  mounted() {
    this.initList()
  },
  methods: {
    parseNames(str) {
      return (str || '').split(',').map(s => s.trim()).filter(Boolean)
    },

    initList() {
      this.loading = true
      let url = 'api/variant_mapping/?page=' + this.page + '&page_size=' + this.pageSize
      if (this.searchValue) url += '&search=' + encodeURIComponent(this.searchValue)
      this.getRequest(url).then(resp => {
        this.loading = false
        if (resp && resp.results) {
          this.list = resp.results
          this.total = resp.count
        }
      }).catch(() => { this.loading = false })
    },

    // ---- tag name editor ----
    startEditName(idx, name) {
      this.editingNameIdx = idx
      this.editingNameValue = name
      this.$nextTick(() => {
        const el = this.$refs.editNameInput
        if (el) {
          if (Array.isArray(el)) el[0].focus()
          else el.focus()
        }
      })
    },
    commitEditName(idx) {
      const list = [...this.attrNameList]
      const val = this.editingNameValue.trim()
      if (val && val !== list[idx]) {
        list[idx] = val
        this.form.attribute_name = list.join(',')
      }
      this.editingNameIdx = -1
    },
    removeName(idx) {
      const list = [...this.attrNameList]
      list.splice(idx, 1)
      this.form.attribute_name = list.join(',')
    },
    addName() {
      const val = this.newNameValue.trim()
      this.showNameInput = false
      if (!val) { this.newNameValue = ''; return }
      const list = [...this.attrNameList]
      if (!list.some(n => n.toLowerCase() === val.toLowerCase())) {
        list.push(val)
        this.form.attribute_name = list.join(',')
      }
      this.newNameValue = ''
    },

    // ---- dialog ----
    openDialog(row) {
      this.editingNameIdx = -1
      this.showNameInput = false
      this.newNameValue = ''
      if (row) {
        this.form = {
          id: row.id,
          attribute_name: row.attribute_name || '',
          values: JSON.parse(JSON.stringify(row.values || []))
        }
      } else {
        this.form = { id: null, attribute_name: '', values: [] }
      }
      this.dialogVisible = true
    },
    onDialogClosed() {
      if (this.$refs.formRef) {
        this.$refs.formRef.resetFields()
      }
    },

    addValue() {
      this.form.values.push({ match_pattern: '', replace_value: '' })
    },
    removeValue(idx) {
      this.form.values.splice(idx, 1)
    },

    saveForm() {
      this.$refs.formRef.validate(valid => {
        if (!valid) return
        this.saving = true
        const data = {
          attribute_name: this.form.attribute_name,
          values: this.form.values
        }
        const req = this.form.id
          ? this.putRequest('api/variant_mapping/' + this.form.id + '/', data)
          : this.postRequest('api/variant_mapping/', data)
        req.then(resp => {
          if (!resp) { this.saving = false; return }
          const attrId = resp.id || this.form.id
          // 按拖拽顺序构建 value_ids
          const respValues = resp.values || []
          const ids = this.form.values.map(fv => {
            // 有 ID 的直接用，新增的按位置从响应匹配
            if (fv.id) return fv.id
            const idx = this.form.values.indexOf(fv)
            return (respValues[idx] && respValues[idx].id) || null
          }).filter(Boolean)
          if (attrId && ids.length) {
            this.postRequest('api/variant_mapping/' + attrId + '/reorder/', {
              value_ids: ids
            }).then(() => {
              this.saving = false
              this.dialogVisible = false
              this.initList()
            }).catch(() => { this.saving = false })
          } else {
            this.saving = false
            this.dialogVisible = false
            this.initList()
          }
        }).catch(() => { this.saving = false })
      })
    },

    deleteItem(id) {
      this.deleteRequest('api/variant_mapping/' + id + '/').then(resp => {
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
.variant-tags {
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
.value-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  margin-bottom: 6px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background: #fff;
}
.drag-handle {
  cursor: grab;
  color: #909399;
  font-size: 16px;
}
.drag-handle:active {
  cursor: grabbing;
}
.value-idx {
  font-size: 12px;
  color: #c0c4cc;
  min-width: 20px;
  text-align: center;
}
.value-arrow {
  color: #909399;
  font-weight: 600;
}
.value-ghost {
  opacity: 0.5;
}
</style>
