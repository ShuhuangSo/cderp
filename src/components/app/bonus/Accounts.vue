<template>
  <el-card class="card" shadow="never">
    <div style="display: flow;justify-content: space-between">
      <el-input size="small" placeholder="账号名称"
                clearable
                @clear="clearSearchValue"
                @keyup.enter.native="doSearch"
                v-model="searchValue"
                style="width: 300px; margin-right: 5px">
        <el-button slot="append" icon="el-icon-search" @click="doSearch">搜索</el-button>
      </el-input>
      <el-button style="float: right " type="success" @click="addAccount">添加账号</el-button>
    </div>

    <el-table
        ref="productTable"
        :data="accounts"
        v-loading="loading"
        style="width: 100%">

      <el-table-column
          prop="name"
          align="center"
          header-align="center"
          width="150"
          label="账号">
      </el-table-column>
      <el-table-column
          prop="type"
          align="center"
          header-align="center"
          label="平台">
      </el-table-column>
      <el-table-column
          prop="site"
          align="center"
          header-align="center"
          label="站点">
      </el-table-column>
      <el-table-column
          align="center"
          header-align="center"
          label="负责人">
        <template slot-scope="scope">
          <span>{{scope.row.manager?scope.row.manager.name: '无'}}</span>
        </template>
      </el-table-column>
      <el-table-column
          align="center"
          header-align="center"
          label="是否启用">
        <template slot-scope="scope">
          <el-tag :type="scope.row.is_active?'success':'danger'">{{scope.row.is_active?'是': '否'}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
          align="center"
          header-align="center"
          width="350"
          label="操作">
        <template slot-scope="scope">
          <el-button size="mini" type="text" @click="editAccount(scope.row)" >编辑</el-button>
          <el-divider direction="vertical"></el-divider>
          <el-button size="mini" type="text" @click="syncAccount(scope.row, 'USER')" >同步负责人</el-button>
          <el-divider direction="vertical"></el-divider>
          <el-button size="mini" type="text" @click="syncAccount(scope.row, 'SITE')" >同步站点</el-button>
          <el-divider direction="vertical"></el-divider>
          <el-button size="mini" type="text" @click="syncAccount(scope.row, 'STATUS')" >同步状态</el-button>
<!--          <el-divider direction="vertical"></el-divider>-->
<!--          <el-button size="mini" type="text" @click="deleteAccount(scope.row.id)" >删除</el-button>-->
        </template>
      </el-table-column>

    </el-table>
    <el-pagination
        style="margin-top: 10px"
        background
        small
        :hide-on-single-page="true"
        layout="prev, pager, next, ->, total"
        @current-change="currentChange"
        :page-size="size"
        :total="total">
    </el-pagination>

    <!--  添加账号弹窗-->
    <el-dialog
        title="添加账号"
        :visible.sync="accountVisible"
        :close-on-click-modal="false"
        top="60px"
        width="800px">
      <div>
        <el-form ref="accountForm" :model="account" label-width="180px">

          <el-form-item  label="平台" prop="type">
            <el-select v-model="account.type" placeholder="请选择" class="inputwidth">
              <el-option
                  v-for="item in platforms"
                  :key="item.value"
                  :label="item.name"
                  :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item  label="站点" prop="site">
            <el-select v-model="account.site" placeholder="请选择" class="inputwidth">
              <el-option
                  v-for="item in siteList"
                  :key="item.value"
                  :label="item.name"
                  :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item  label="账号名称" prop="name">
            <el-input v-model="account.name" :disabled="account.id" class="inputwidth"></el-input>
          </el-form-item>

          <el-form-item  label="负责人" prop="type">
            <el-select v-model="account.manager" placeholder="请选择" class="inputwidth">
              <el-option
                  v-for="item in managers"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item  label="是否启用" prop="name">
            <el-switch
                v-model="account.is_active"
                active-color="#13ce66"
                inactive-color="#ff4949">
            </el-switch>
          </el-form-item>


        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
    <el-button @click="accountVisible = false">取 消</el-button>
    <el-button v-if="!account.id"
               :disabled="this.account.type==null || this.account.name == ''"
               type="primary" :loading="loading" @click="createAccount">确 定</el-button>
    <el-button v-if="account.id"
               :disabled="this.account.type==null || this.account.name == ''"
               type="primary"  :loading="loading" @click="updateAccount">保 存</el-button>
  </span>
    </el-dialog>
  </el-card>
</template>

<script>
export default {
  name: "Accounts",
  data(){
    return{
      accounts: [],
      loading: false,
      total: 0, // 总条数
      page: 1,  // 当前页
      size: 10,  // 页大小
      searchValue: '',
      accountVisible: false,
      account: {
        id: null,
        type: null,
        site: null,
        name: '',
        manager: null,
        is_active: true,
      },
      managers: [],
      platforms: [
        {name: 'eBay', value: 'eBay'},
        {name: 'Coupang', value: 'Coupang'},
        {name: 'Aliexpress', value: 'Aliexpress'},
        {name: 'Shopee', value: 'Shopee'},
        {name: 'Mercado', value: 'Mercado'},
        {name: 'Shopify', value: 'Shopify'},
        {name: 'Amazon', value: 'Amazon'},
      ],
      siteList: [
        {name: '英国', value: 'UK'},
        {name: '澳洲', value: 'AU'},
        {name: '美国', value: 'US'},
        {name: '德国', value: 'DE'},
      ],
    }
  },
  mounted() {
    this.initAccounts();
  },
  methods:{
    deleteAccount(id){
      this.$confirm('是否删除该账号?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let url = 'api/bo_bonus_accounts/'+ id + '/'
        this.deleteRequest(url).then(resp => {
          this.page = 1
          this.initAccounts();
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },
    editAccount(row){
      Object.assign(this.account, row)
      if (row.manager) this.account.manager = row.manager.id
      this.initManagers();
      this.accountVisible = true;
    },
    //同步到产品开发
    syncAccount(row, op_type){
      let data = {
        'platform': row.type,
        'site': row.site,
        'account_name': row.name,
        'user_name': row.manager.name,
        'op_type': op_type,
        'is_active': row.is_active
      }
      this.$confirm('是否确定同步？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        let url = 'api/dev_listing_account/sync_account/'
        this.postRequest(url, data).then(resp => {
          this.loading = false
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        });
      });
    },
    addAccount(){
      this.initManagers();
      this.account.id = null,
      this.account.type = null
      this.account.site = null
      this.account.name = ''
      this.account.manager = null

      this.accountVisible = true
    },
    // 重置搜索内容
    clearSearchValue() {
      this.searchValue = '';
      this.initAccounts();
    },
    // 搜索
    doSearch() {
      this.page = 1;
      this.$refs.productTable.clearFilter();
      this.initAccounts();
    },
    // 页码
    currentChange(page) {
      this.page = page;
      this.initAccounts();
    },
    updateAccount(){
      this.loading = true
      let url = 'api/bo_bonus_accounts/'+ this.account.id + '/'
      this.putRequest(url, this.account).then(resp => {
        this.loading = false
        if (resp) {
          this.initAccounts();
          this.accountVisible = false;
        }
      })
    },
    createAccount(){
      let url = 'api/bo_bonus_accounts/'
      this.postRequest(url, this.account).then(resp => {
        if (resp) {
          this.initAccounts()
          this.accountVisible = false
        }
      })
    },
    initManagers(){
      let url = 'api/bo_manager/'
      this.getRequest(url).then(resp => {
        if (resp) {
          this.managers = resp
        }
      })
    },
    initAccounts(){
      this.loading = true
      let url = 'api/bo_bonus_accounts/?page=' + this.page + '&page_size=' + this.size;
      if (this.searchValue) {
        url += '&search=' + this.searchValue;
      }
      url += '&ordering=manager__id'
      this.getRequest(url).then(resp => {
        this.loading = false
        if (resp.results) {
          this.accounts = resp.results;
          this.total = resp.count;
        }
      })
    }
  }
}
</script>

<style scoped>
.chartTitle {
  font-weight: bold;
  margin-right: 20px
}
.inputwidth {
  width: 300px;
}
</style>