<template>
  <div class="contentList">
    <div class="operate">
      <div>
        <el-input size="small" placeholder="请输入仓库、店铺名称搜索"
                  clearable
                  @clear="clearSearchValue"
                  @keyup.enter.native="doSearch"
                  tooltip-effect="dark"
                  v-model="searchValue"
                  style="width: 350px; margin-right: 5px">
          <el-button slot="append" icon="el-icon-search" @click="doSearch">搜索</el-button>
        </el-input>
      </div>
      <div>
        <el-button type="success" icon="el-icon-plus" @click="createStore">新增店铺/仓库</el-button>
      </div>
    </div>

    <!--    店铺列表-->
    <div style="margin-top: 5px">
      <el-table
          ref="storeTable"
          :data="stores"
          :header-cell-style="{background:'#fafafa'}"
          v-loading="loading"
          style="width: 100%">
        <el-table-column
            prop="store_name"
            label="店铺/仓库名称"
            width="250">
        </el-table-column>
        <el-table-column
            align="center"
            header-align="center"
            label="类型"
            width="180">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.type=='STORE'">{{ scope.row.type | storeType }}</el-tag>
            <el-tag type="" v-if="scope.row.type=='WAREHOUSE'">{{ scope.row.type | storeType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
            prop="address"
            label="地址">
        </el-table-column>

        <el-table-column
            :formatter="datetimeFormat"
            prop="create_time"
            label="创建时间">
        </el-table-column>

        <el-table-column
            label="操作"
            width="100"
            align="center"
            header-align="center"
        >
          <template slot-scope="scope">
            <el-button
                @click="checkStore(scope.row)"
                type="text"
                size="small">
              查看
            </el-button>
          </template>
        </el-table-column>

      </el-table>
    </div>

    <div class="pagination">
      <el-pagination
          background
          :page-sizes="[20, 30, 40, 50, 100]"
          @current-change="currentChange"
          @size-change="sizeChange"
          layout="sizes, prev, pager, next, jumper, ->, total"
          :total="total">
      </el-pagination>
    </div>

    <el-dialog
        :title="store.id? '店铺/仓库详情':'新建店铺/仓库'"
        top="60px"
        :destroy-on-close="true"
        :visible.sync="dialogVisible"
        width="500">
      <el-form ref="storeForm" :rules="rules" :model="store" label-width="100px">
        <el-form-item prop="store_name" label="名称" required>
          <el-input
              class="inputwidth"
              placeholder="请输入名称"
              v-model="store.store_name">
          </el-input>
        </el-form-item>

        <el-form-item required label="类型" prop="type">
          <el-select v-model="store.type" placeholder="请选择" class="inputwidth">
            <el-option
                v-for="item in typeOptions"
                :key="item.value"
                :label="item.name"
                :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item prop="contact_name" label="联系人" >
          <el-input
              class="inputwidth"
              placeholder="请输入联系人名称"
              v-model="store.contact_name">
          </el-input>
        </el-form-item>

        <el-form-item label="联系电话">
          <el-input
              class="inputwidth"
              placeholder="请输入联系人名称"
              v-model="store.phone">
          </el-input>
        </el-form-item>

        <el-form-item label="微信">
          <el-input
              class="inputwidth"
              placeholder="请输入微信号"
              v-model="store.wechat">
          </el-input>
        </el-form-item>

        <el-form-item label="QQ">
          <el-input
              class="inputwidth"
              placeholder="请输入QQ号"
              v-model="store.qq">
          </el-input>
        </el-form-item>

        <el-form-item label="地址">
          <el-input
              class="inputwidth"
              placeholder="请输入联系地址"
              v-model="store.address">
          </el-input>
        </el-form-item>

        <el-form-item label="网址">
          <el-input
              class="inputwidth"
              placeholder="请输入联系地址"
              v-model="store.website">
          </el-input>
        </el-form-item>

        <el-form-item label="备注">
          <el-input
              class="inputwidth"
              type="textarea"
              :rows="2"
              placeholder="请输入备注"
              v-model="store.note">
          </el-input>
        </el-form-item>

      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="closeDetail">取 消</el-button>
    <el-button v-if="!store.id" type="primary" @click="submitForm">确 定</el-button>
        <el-button v-if="store.id" type="primary" @click="editForm">保 存</el-button>
  </span>
    </el-dialog>

  </div>
</template>

<script>
import moment from "moment";

export default {
  name: "ProductStoreList",
  data(){
    return{
      stores: [],
      store: {
        id: null
      },
      total: 0,
      page: 1,
      size: 20,
      loading: false,
      searchValue: '',
      dialogVisible: false,
      typeOptions: [
        {name: '店铺', value: 'STORE'},
        {name: '仓库', value: 'WAREHOUSE'},
      ],
      rules:{
        store_name: [
          {required: true, message: '请输入名称', trigger: 'blur'},
        ],
        type: [
          {required: true, message: '请选择类型', trigger: 'blur'},
        ],
      },
    }
  },
  filters: {
    //店铺类型信息格式化
    storeType: function (value) {
      if (value === 'WAREHOUSE') {
        return '仓库'
      }
      if (value === 'STORE') {
        return '店铺'
      }
      return '';
    },

  },
  mounted() {
    this.initStores();
  },
  methods:{
    // 关闭对话框
    closeDetail(){
      this.dialogVisible = false;
    },

    // 新建店铺
    createStore(){
      this.store = {};
      this.dialogVisible = true;
    },

    //修改店铺
    editForm() {
      this.$confirm('是否修改店铺/仓库？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$refs.storeForm.validate((valid) => {
          if (valid) {
            this.loading = true;
            this.putRequest('api/stores/'+ this.store.id + '/', this.store).then(resp => {
              if (resp) {
                this.initStores();
                this.dialogVisible = false;
              }
              this.loading = false;
            })
          } else {
            return false;
          }
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        });
      });

    },

    //创建店铺
    submitForm() {
      this.$confirm('是否创建店铺/仓库？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$refs.storeForm.validate((valid) => {
          if (valid) {
            this.loading = true;
            this.postRequest('api/stores/', this.store).then(resp => {
              if (resp) {
                this.initStores();
                this.dialogVisible = false;
              }
              this.loading = false;
            })
          } else {
            return false;
          }
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        });
      });

    },

    // 查看店铺
    checkStore(obj){
      this.store = Object.assign({},obj)
      this.dialogVisible = true;
    },

    // 格式化日期时间
    datetimeFormat: function (row, column) {

      let date = row[column.property];

      if (date == undefined) {
        return ''
      };
      return moment(date).format("YYYY-MM-DD")
    },

    // 分页大小
    sizeChange(size) {
      this.size = size;
      this.initStores();
    },
    // 页码
    currentChange(page) {
      this.page = page;
      this.initStores();
    },

    // 搜索
    doSearch() {
      this.$refs.storeTable.clearFilter();
      this.initStores();
    },
    // 重置搜索内容
    clearSearchValue() {
      this.searchValue = '';
      this.initStores();
    },

    //初始化店铺列表
    initStores(){
      this.loading = true;
      let url = 'api/stores/?page=' + this.page + '&page_size=' + this.size;

      if (this.searchValue) {
        url += '&search=' + this.searchValue;
      }
      this.getRequest(url).then(resp => {
        if (resp.results) {
          this.stores = resp.results;
          this.total = resp.count;
          this.loading = false;
        }
      })
    }
  }
}
</script>

<style scoped>
.contentList {
  padding: 10px;
  background-color: white;
  margin-top: 10px;
}
.operate {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
}
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}
.inputwidth{
  width: 90%;
}
</style>