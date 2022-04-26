<template>

  <el-container style="height: 100%">
    <el-header class="headerMenu">

      <div style="display: flex; justify-content: left">
        <router-link to="/home">
          <img src="../../assets/logo-m.png" alt="CaseDance" class="logo">
        </router-link>
        <div style=" margin-left: 60px ">
          <h3 style="color: #aa0515"><i class="el-icon-office-building"></i> 供应商客户端</h3>
        </div>

      </div>

      <div class="avatar">
        <el-dropdown style="margin-bottom: 10px" @command="commandHandler">
          <span class="el-dropdown-link">
            <i class="el-icon-user"></i>{{ user.name }}<i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="userinfo">用户信息</el-dropdown-item>
            <el-dropdown-item command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>

    </el-header>

    <el-container>
      <el-aside width="300px" class="aside">
        <el-collapse accordion  @change="changeSentPurchase">
          <el-collapse-item>
            <template slot="title">
              <span class="aniu"><h3>待确认</h3></span>
              <el-badge v-if="totalConfirm" :value="totalConfirm" class="item"></el-badge>
            </template>
            <el-table
                v-loading="loading"
                :data="confirmOrder"
                @row-click="clickPurchase"
                highlight-current-row
                style="width: 100%">
              <el-table-column
                  prop="p_number"
                  label="批次号">
              </el-table-column>
              <el-table-column
                  prop="create_time"
                  align="right"
                  header-align="center"
                  :formatter="datetimeFormat"
                  label="订单日期">
              </el-table-column>

            </el-table>
            <el-pagination
                background
                :hide-on-single-page="true"
                @current-change="confirmCurrentChange"
                layout="prev, next"
                :total="totalConfirm">
            </el-pagination>
          </el-collapse-item>

          <el-collapse-item>
            <template slot="title">
              <span class="aniu"><h3>待发货</h3></span>
              <el-badge v-if="totalSend" type="success" :value="totalSend" class="item"></el-badge>
            </template>
            <el-table
                v-loading="loading"
                :data="waitSendOrder"
                @row-click="clickPurchase"
                highlight-current-row
                style="width: 100%">
              <el-table-column
                  prop="p_number"
                  label="批次号">
              </el-table-column>
              <el-table-column
                  prop="create_time"
                  align="right"
                  header-align="center"
                  :formatter="datetimeFormat"
                  label="订单日期">
              </el-table-column>

            </el-table>
            <el-pagination
                background
                :hide-on-single-page="true"
                @current-change="waitSendCurrentChange"
                layout="prev, next"
                :total="totalSend">
            </el-pagination>
          </el-collapse-item>

          <el-collapse-item>
            <template slot="title">
              <span class="aniu"><h3>部分发货</h3></span>
              <el-badge v-if="totalPartSend" type="warning" :value="totalPartSend" class="item"></el-badge>
            </template>
            <el-table
                v-loading="loading"
                :data="partSendOrder"
                @row-click="clickPurchase"
                highlight-current-row
                style="width: 100%">
              <el-table-column
                  prop="p_number"
                  label="批次号">
              </el-table-column>
              <el-table-column
                  prop="create_time"
                  align="right"
                  header-align="center"
                  :formatter="datetimeFormat"
                  label="订单日期">
              </el-table-column>

            </el-table>
            <el-pagination
                background
                :hide-on-single-page="true"
                @current-change="partSendCurrentChange"
                layout="prev, next"
                :total="totalPartSend">
            </el-pagination>
          </el-collapse-item>

          <el-collapse-item name="sent">
            <template slot="title">
              <span class="aniu"><h3>已发货</h3></span>
            </template>
            <el-table
                v-loading="loading"
                :data="sentOrder"
                @row-click="clickPurchase"
                highlight-current-row
                style="width: 100%">
              <el-table-column
                  prop="p_number"
                  label="批次号">
              </el-table-column>
              <el-table-column
                  prop="create_time"
                  align="right"
                  header-align="center"
                  :formatter="datetimeFormat"
                  label="订单日期">
              </el-table-column>

            </el-table>
            <el-pagination
                background
                :hide-on-single-page="true"
                @current-change="sentCurrentChange"
                layout="prev, next"
                :total="totalSent">
            </el-pagination>
          </el-collapse-item>

        </el-collapse>
      </el-aside>
      <el-main>
        <router-view @reloadList="updateList" :key="$route.fullPath"></router-view>
      </el-main>
    </el-container>

  </el-container>

</template>

<script>
import moment from "moment";

export default {
  name: "SupplierHome",
  data() {
    return {
      user: JSON.parse(window.sessionStorage.getItem('user')),
      loading: false,
      totalConfirm: 0,
      totalSend: 0,
      totalPartSend: 0,
      confirmOrder: [],
      waitSendOrder: [],
      partSendOrder: [],
      sentOrder: [],
      confirmPage: 1,
      confirmSize: 10,
      waitConfirmPage: 1,
      waitConfirmSize: 10,
      partSentPage: 1,
      partSentSize: 10,
      totalSent: 0,
      sentPage: 1,
      sentSize: 10,
    }
  },
  mounted() {
    this.initConfirmOrder();
    this.initWaitSendOrder();
    this.initPartSendOrder();
  },
  methods: {
    //已发货分页
    sentCurrentChange(page){
      this.sentPage = page;
      this.initsentSendOrder();
    },

    //部分发货分页
    partSendCurrentChange(page){
      this.partSentPage = page;
      this.initPartSendOrder();
    },

    //待发货分页
    waitSendCurrentChange(page){
      this.waitConfirmPage = page;
      this.initWaitSendOrder();
    },

    // 待确认分页
    confirmCurrentChange(page) {
      this.confirmPage = page;
      this.initConfirmOrder();
    },

    //已发货点击回调
    changeSentPurchase(string){
      if (string==='sent'){
        this.initsentSendOrder();
      }
    },

    //更新列表
    updateList(){
      this.initConfirmOrder();
      this.initWaitSendOrder();
      this.initPartSendOrder();
    },

    // 点击采购单
    clickPurchase(row, column, event){
      this.$router.replace({
        path: '/supplierOrderDetail',
        query: {
          id: row.id
        }
      })
    },

    // 格式化日期时间
    datetimeFormat: function (row, column) {

      let date = row[column.property];

      if (date == undefined) {
        return ''
      };
      return moment(date).format("YYYY年MM月DD日")
    },

    // 初始化待确认采购单
    initConfirmOrder() {
      this.loading = true;
      let url = 'api/purchase_orders/?order_status=WAIT_CONFIRM'+
          '&page=' + this.confirmPage + '&page_size=' + this.confirmSize

      this.getRequest(url).then(resp => {
        if (resp.results) {
          this.confirmOrder = resp.results;
          this.totalConfirm = resp.count;
          this.loading = false;
        }
      })
    },

    // 初始化待发货采购单
    initWaitSendOrder() {
      this.loading = true;
      let url = 'api/purchase_orders/?order_status=IN_PRODUCTION'+
          '&page=' + this.waitConfirmPage + '&page_size=' + this.waitConfirmSize

      this.getRequest(url).then(resp => {
        if (resp.results) {
          this.waitSendOrder = resp.results;
          this.totalSend = resp.count;
          this.loading = false;
        }
      })
    },

    // 初始化部分发货采购单
    initPartSendOrder() {
      this.loading = true;
      let url = 'api/purchase_orders/?order_status=PART_SENT'+
          '&page=' + this.partSentPage + '&page_size=' + this.partSentSize

      this.getRequest(url).then(resp => {
        if (resp.results) {
          this.partSendOrder = resp.results;
          this.totalPartSend = resp.count;
          this.loading = false;
        }
      })
    },

    // 初始化已发货采购单
    initsentSendOrder() {
      this.loading = true;
      let url = 'api/purchase_orders/?order_status=SENT'+
          '&page=' + this.sentPage + '&page_size=' + this.sentSize

      this.getRequest(url).then(resp => {
        if (resp.results) {
          this.sentOrder = resp.results;
          this.totalSent = resp.count;
          this.loading = false;
        }
      })
    },

    // 退出登录
    commandHandler(command) {
      if (command == 'logout') {
        this.$confirm('是否注销退出系统?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          // 清空用户信息
          window.sessionStorage.removeItem('tokenStr');
          window.sessionStorage.removeItem('user');

          //跳转到登录页
          this.$router.replace('/');
          this.$message({
            type: 'success',
            message: '注销成功!'
          });
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消'
          });
        });

      }
    }
  }
}
</script>

<style scoped>
.headerMenu {
  margin: 0px;
  padding: 0px;
  display: flex;
  justify-content: space-between;
  background-color: #313132;
}

.avatar {
  margin-top: 17px;
  margin-right: 150px;
}

.el-dropdown-link {
  cursor: pointer;
  color: #d6d6d6;
}

.el-icon-arrow-down {
  font-size: 12px;
}

.el-icon-user {
  margin-right: 5px;
  margin-top: 2px;
}

.logo {
  height: 30px;
  margin-top: 15px;
  margin-right: 50px;
  margin-left: 50px;
}

.aside {
  height: 100%;
  background: #ffffff;
  padding-top: 30px;
}

.item {
  margin-top: 10px;
  margin-left: 5px;
}

.aniu {
  margin-left: 60px;
}
</style>