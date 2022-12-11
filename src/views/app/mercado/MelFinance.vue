/*
美客多FBM-财务管理
*/
<template>
  <div style="display: flex">
<!--    左侧-->
    <div class="left_side">
      <el-card shadow="never">
        <div style="display: flex;justify-content: center">
          <span class="chartTitle">店铺资金</span>
        </div>

        <div style="text-align:center; width: 100%;margin-top: 50px">
          <div style="color: #6e7079;">在途外汇</div>
          <div class="zTitle2">$<animate-number ref="stockNum2" from="0" :to="onway_fund" :key="onway_fund"
                                                duration="1000"></animate-number>
          </div>
        </div>

        <div style="text-align:center; width: 100%;margin-top: 50px">
          <div style="color: #6e7079;">外汇资金</div>
          <div class="zTitle2">$<animate-number ref="stockNum1" from="0" :to="rest_income" :key="rest_income"
                                                duration="1000"></animate-number>
          </div>
        </div>

        <div style="text-align:center; width: 100%;margin-top: 50px">
          <div style="color: #6e7079;">结汇资金</div>
          <div class="zTitle2">￥<animate-number ref="stockNum3" from="0" :to="income_rmb" :key="income_rmb"
                                                duration="1000"></animate-number>
          </div>
        </div>

      </el-card>
    </div>
<!--    右侧-->
    <div class="right_side">
      <div class="operate">
        <div>

          <el-select v-model="shopID"
                     style="width: 300px;"
                     @change="changeShop" placeholder="请选择店铺">
            <el-option
                v-for="item in shops"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              <span style="float: left">{{ item.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ item.nickname }}</span>
            </el-option>
          </el-select>

          <el-radio-group
              style="margin-left: 20px"
              @change="changeType" v-model="finance.f_type">
            <el-radio-button label="WD">店铺提现</el-radio-button>
            <el-radio-button label="EXC" v-if="user.is_superuser">资金结汇</el-radio-button>
          </el-radio-group>

        </div>

        <div>
          <el-button icon="el-icon-plus"
                     v-if="finance.f_type==='WD'"
                     style="margin-right: 10px"
                     :disabled="!shopID"
                     type="success"
                     @click="openCreateWD">新增店铺提现
          </el-button>

          <el-button icon="el-icon-plus"
                     v-if="finance.f_type==='EXC' && user.is_superuser"
                     style="margin-right: 10px"
                     :disabled="!shopID"
                     type="success"
                     @click="openCreateEXC">新增结汇
          </el-button>
        </div>
      </div>

      <div style="margin-top: 5px">
        <el-table
            v-if="finance.f_type==='WD'"
            ref="financeTable"
            :data="finances"
            :header-cell-style="{background:'#fafafa'}"
            v-loading="loading"
            style="width: 100%">

          <el-table-column
              label="类型"
              align="center"
              header-align="center"
              width="180">
            <template slot-scope="scope">
              <div>{{ scope.row.f_type | status}}</div>
            </template>
          </el-table-column>

          <el-table-column
              label="币种"
              align="center"
              header-align="center"
              width="100">
            <template slot-scope="scope">
              <div>{{ scope.row.currency }}</div>
            </template>
          </el-table-column>

          <el-table-column
              label="提现金额"
              align="center"
              header-align="center">
            <template slot-scope="scope">
              <div>{{ scope.row.income | currencyEX }}</div>
            </template>
          </el-table-column>

          <el-table-column
              label="提现日期"
              align="center"
              header-align="center"
              width="180">
            <template slot-scope="scope">
              <div>{{ scope.row.wd_date }}</div>
            </template>
          </el-table-column>

          <el-table-column
              label="到账日期"
              align="center"
              header-align="center">
            <template slot-scope="scope">
              <div>{{ scope.row.rec_date}}</div>
              <div v-if="!scope.row.is_received"><el-tag effect="dark" type="warning">未到账</el-tag></div>
            </template>
          </el-table-column>

          <el-table-column
              v-if="finance.f_type==='WD'"
              label="操作"
              align="center"
              header-align="center">
            <template slot-scope="scope">
              <el-button size="mini" plain type="success"
                         v-if="!scope.row.is_received && user.is_superuser"
                         @click="openConfirmReceived(scope.row.id)">确认到账</el-button>
            </template>
          </el-table-column>

        </el-table>

        <el-table
            v-if="finance.f_type==='EXC'"
            ref="financeTable"
            :data="finances"
            :header-cell-style="{background:'#fafafa'}"
            v-loading="loading"
            style="width: 100%">

          <el-table-column
              label="类型"
              align="center"
              header-align="center"
              width="180">
            <template slot-scope="scope">
              <div>{{ scope.row.f_type | status}}</div>
            </template>
          </el-table-column>

          <el-table-column
              label="币种"
              align="center"
              header-align="center"
              width="100">
            <template slot-scope="scope">
              <div>{{ scope.row.currency }}</div>
            </template>
          </el-table-column>

          <el-table-column
              label="结汇日期"
              align="center"
              header-align="center"
              width="180">
            <template slot-scope="scope">
              <div>{{ scope.row.exc_date }}</div>
            </template>
          </el-table-column>

          <el-table-column
              label="结汇金额"
              align="center"
              header-align="center">
            <template slot-scope="scope">
              <div>{{ scope.row.exchange | currencyEX }}</div>
            </template>
          </el-table-column>

          <el-table-column
              label="到账金额"
              align="center"
              header-align="center">
            <template slot-scope="scope">
              <div>{{ scope.row.income_rmb | currencyRMB }}</div>
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
    </div>

    <!--    新增结汇弹窗-->
    <el-dialog
        title="资金结汇"
        :visible.sync="createEXCVisible"
        :destroy-on-close="true"
        :close-on-click-modal="false"
        width="400px"
    >
      <div>
        结汇金额：
        <el-input-number
            style="width: 100%"
            v-model="finance.exchange"
            :precision="2"
            controls-position="right"
            :min="0"></el-input-number>
      </div>
      <div style="margin-top: 10px">
        到账rmb：
        <el-input-number
            style="width: 100%"
            v-model="finance.income_rmb"
            :precision="2"
            controls-position="right"
            :min="0"></el-input-number>
      </div>
      <div style="margin-top: 10px">
        结汇日期：
        <el-date-picker
            style="width: 100%"
            v-model="finance.exc_date"
            value-format="yyyy-MM-dd"
            type="date"
            placeholder="选择结汇日期">
        </el-date-picker>
      </div>
      <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="createEXCVisible = false">取 消</el-button>
          <el-button size="small" type="primary" :disabled="!finance.exchange || !finance.income_rmb || !finance.exc_date" @click="summitCreateEXC">确 定</el-button>
        </span>
    </el-dialog>

    <!--    新增店铺提现弹窗-->
    <el-dialog
        title="店铺提现"
        :visible.sync="createWDVisible"
        :destroy-on-close="true"
        :close-on-click-modal="false"
        width="400px"
    >
      <div>
        提现金额：
        <el-input-number
            style="width: 100%"
            v-model="finance.income"
            :precision="2"
            controls-position="right"
            :min="0"></el-input-number>
      </div>
      <div style="margin-top: 10px">
        提现日期：
        <el-date-picker
            style="width: 100%"
            v-model="finance.wd_date"
            value-format="yyyy-MM-dd"
            type="date"
            placeholder="选择提现日期">
        </el-date-picker>
      </div>
      <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="createWDVisible = false">取 消</el-button>
          <el-button size="small" type="primary" :disabled="!finance.income || !finance.wd_date" @click="summitCreateWD">确 定</el-button>
        </span>
    </el-dialog>


    <!--    确认提现弹窗-->
    <el-dialog
        title="确认到账"
        :visible.sync="confirmWDVisible"
        :destroy-on-close="true"
        :close-on-click-modal="false"
        width="400px"
    >
      <div style="margin-top: 10px">
        到账日期：
        <el-date-picker
            style="width: 100%"
            v-model="finance.wd_date"
            value-format="yyyy-MM-dd"
            type="date"
            placeholder="选择到账日期">
        </el-date-picker>
      </div>
      <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="confirmWDVisible = false">取 消</el-button>
          <el-button size="small" type="primary" :disabled="!finance.wd_date" @click="confirmReceived">确 定</el-button>
        </span>
    </el-dialog>

  </div>
</template>

<script>
import moment from "moment/moment";

export default {
  name: "MelFinance",
  data(){
    return{
      user: JSON.parse(window.sessionStorage.getItem('user')),
      shops: null,
      shopID: null,
      loading: false,
      total: 0, // 总条数
      page: 1,  // 当前页
      size: 20,  // 页大小
      searchValue: '',
      finances: [],
      finance: {
        income: null,
        exchange: null,
        income_rmb: null,
        exc_date: null,
        wd_date: null,
        shop: null,
        f_type: 'WD',
      },
      financeID: null,
      createWDVisible: false, //新增店铺提现
      createEXCVisible: false, //新增结汇
      confirmWDVisible: false, //确认提现
      onway_fund: 0.0,
      income_rmb: 0.0,
      rest_income: 0.0,
    }
  },
  filters: {
    //rmb金额格式化
    currencyRMB: function (value) {
      if (!value) return 0.00;
      return `¥${value.toFixed(2)}`;
    },
    //外汇金额格式化
    currencyEX: function (value) {
      if (!value) return 0.00;
      return `$${value}`;
    },
    //订单状态格式化
    status: function (value) {
      if (value==='WD') return '店铺提现';
      if (value==='EXC') return '结汇';
    },
  },
  mounted() {
    this.inintShops();
  },
  methods:{
    getDate() {
      var now = new Date();
      var year = now.getFullYear(); //得到年份
      var month = now.getMonth(); //得到月份
      var date = now.getDate(); //得到日期
      var hour = " 00:00:00"; //默认时分秒 如果传给后台的格式为年月日时分秒，就需要加这个，如若不需要，此行可忽略
      month = month + 1;
      month = month.toString().padStart(2, "0");
      date = date.toString().padStart(2, "0");
      var defaultDate = `${year}-${month}-${date}`;//
      return defaultDate;
    },
    //打开确认新建提现弹窗
    openCreateWD(){
      this.createWDVisible=true
      this.finance.wd_date = this.getDate()
    },
    //选择类型
    changeType(){
      this.initFinances()
    },
    //打开结汇弹窗
    openCreateEXC(){
      this.finance.exc_date = this.getDate()
      this.createEXCVisible = true
    },
    //打开确认到账弹窗
    openConfirmReceived(id){
      this.financeID = id;
      this.finance.wd_date = this.getDate()
      this.confirmWDVisible = true
    },
    //确认提现到账
    confirmReceived(){
      this.loading = true;
      this.patchRequest('api/ml_finance/'+ this.financeID + '/', {'rec_date': this.finance.wd_date, 'is_received': true}).then(resp => {
        this.loading = false;
        if (resp) {
          this.confirmWDVisible = false
          this.financeID = null
          this.initFinances();
          this.getFund()
        }
      })
    },
    //提交创建提现
    summitCreateWD(){
      this.finance.shop = this.shopID
      this.finance.f_type = 'WD'

      this.loading = true;
      this.postRequest('api/ml_finance/create_wd/', this.finance).then(resp => {
        this.loading = false;
        if (resp) {
          this.createWDVisible = false
          this.initFinances();
          this.getFund()
        }
      })
    },
    //提交创建结汇
    summitCreateEXC(){
      this.finance.shop = this.shopID

      this.loading = true;
      this.postRequest('api/ml_finance/create_exc/', this.finance).then(resp => {
        this.loading = false;
        if (resp) {
          this.createEXCVisible = false
          this.initFinances();
          this.getFund()
        }
      })
    },
    //改变店铺动作
    changeShop(){
      this.page = 1;
      this.initFinances();
      this.getFund()
    },

    // 重置搜索内容
    clearSearchValue() {
      this.searchValue = '';
      this.initFinances();
    },
    // 搜索
    doSearch() {
      this.page = 1;
      this.$refs.financeTable.clearFilter();
      this.initFinances();
    },
    // 分页大小
    sizeChange(size) {
      this.page = 1;
      this.size = size;
      this.initFinances();
    },
    // 页码
    currentChange(page) {
      this.page = page;
      this.initFinances();
    },

    //获取资金情况
    getFund() {
      let url = 'api/ml_finance/calc_fund/'
      this.postRequest(url, {'shop': this.shopID}).then(resp => {
        if (resp) {
          this.onway_fund = resp.onway_fund
          this.income_rmb = resp.income_rmb
          this.rest_income = resp.rest_income
          this.$nextTick(() => {
            this.$refs.stockNum1.start()
            this.$refs.stockNum2.start()
            this.$refs.stockNum3.start()
          })
        }
      })
    },

    inintShops(){
      //获取所有可选店铺
      if(window.sessionStorage.getItem('ml_shops')) {
        this.shops = JSON.parse(window.sessionStorage.getItem('ml_shops'));
      }else{
        this.getRequest('api/ml_shops/?warehouse_type=FBM&page_size=1000&ordering=create_time').then(resp => {
          if (resp.results) {
            this.shops = resp.results;
            window.sessionStorage.setItem('ml_shops', JSON.stringify(this.shops));
          }
        })
      }
      if (this.shops.length) {
        this.shopID = this.shops[0].id
        this.initFinances()
        this.getFund()
      }
    },

    initFinances(){
      let url = '/api/ml_finance/?shop=' + this.shopID + '&page=' + this.page + '&page_size=' + this.size
      if (this.finance.f_type) {
        url += '&f_type=' + this.finance.f_type;
      }
      url += '&ordering=-create_time'

      this.loading = true
      this.getRequest(url).then(resp => {
        this.loading = false
        if (resp.results) {
          this.finances = resp.results;
          this.total = resp.count;
        }
      })
    }
  }
}
</script>

<style scoped>
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
.left_side{
  width: 300px;
  margin-right: 10px;
}
.right_side{
  width: 100%;
}
.zTitle2 {
  font-weight: bold;
  font-size: 30px;
  color: #4f6782;
}
.chartTitle {
  font-weight: bold;
}
</style>