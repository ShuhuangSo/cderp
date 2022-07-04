<template>
  <el-card class="card" shadow="never">
    <el-button style="float: right " type="success" @click="addAccount">添加账号</el-button>
    <el-table
        :data="accounts"
        v-loading="loading"
        style="width: 100%">

      <el-table-column
          prop="name"
          align="center"
          header-align="center"
          label="账号">
      </el-table-column>
      <el-table-column
          prop="type"
          align="center"
          header-align="center"
          label="平台">
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
          label="操作">
        <template slot-scope="scope">
          <el-button size="mini" type="text" @click="editAccount(scope.row)" >编辑</el-button>
          <el-divider direction="vertical"></el-divider>
          <el-button size="mini" type="text" @click="deleteAccount(scope.row.id)" >删除</el-button>
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

          <el-form-item  label="账号名称" prop="name">
            <el-input v-model="account.name" class="inputwidth"></el-input>
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
      accountVisible: false,
      account: {
        id: null,
        type: null,
        name: '',
        manager: null,
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
    addAccount(){
      this.initManagers();
      this.account.id = null,
      this.account.type = null
      this.account.name = ''
      this.account.manager = null

      this.accountVisible = true
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