<template>
  <el-card class="card" shadow="never">
    <div slot="header" class="clearfix">
      <span class="chartTitle">③ 销售提成</span>
      <el-button style="float: right " type="success" :loading="loading" @click="createBonus">生成提成报表</el-button>
    </div>
    <el-select v-model="manager"
               @change="initBonus"
               placeholder="筛选负责人" class="selectManger">
      <el-option
          v-for="item in managers"
          :key="item.id"
          :label="item.name"
          :value="item.id">
      </el-option>
    </el-select>
    <el-table
        :data="bonus"
        :header-cell-style="{background:'#eef1f6'}"
        v-loading="loading"
        style="width: 100%">
      <el-table-column
          prop="account_name"
          align="center"
          header-align="center"
          label="账号名称">
      </el-table-column>
      <el-table-column
          align="center"
          header-align="center"
          label="平台|站点">
        <template slot-scope="scope">
          {{ scope.row.platform}}
          <el-divider direction="vertical"></el-divider>
          {{ scope.row.platform_base}}
        </template>
      </el-table-column>
      <el-table-column
          align="center"
          header-align="center"
          label="提成利润">
        <template slot-scope="scope">
          <span :class="scope.row.profit<0?'fushu':''">￥{{ scope.row.profit | currency }}</span>
        </template>
      </el-table-column>
      <el-table-column
          align="center"
          header-align="center"
          label="提成比例">
        <template slot-scope="scope">
          {{ scope.row.bonus_rate | percentFormat }}
        </template>
      </el-table-column>
      <el-table-column
          align="center"
          header-align="center"
          label="提成金额">
        <template slot-scope="scope">
          <span v-if="scope.row.bonus>0">￥{{ scope.row.bonus | currency }}</span>
          <span v-if="scope.row.bonus<=0">0</span>
        </template>
      </el-table-column>
      <el-table-column
          align="center"
          header-align="center"
          label="负责人">
        <template slot-scope="scope">
          {{ scope.row.manager ? scope.row.manager.name : '无' }}
        </template>
      </el-table-column>
      <el-table-column
          align="center"
          header-align="center"
          label="审核">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.is_calc" size="mini" type="success">已核对</el-tag>
        </template>
      </el-table-column>
      <el-table-column
          align="center"
          header-align="center"
          label="操作">
        <template slot-scope="scope">
          <el-button size="mini" plain type="primary" @click="editAccountBonus(scope.row)">编辑</el-button>
          <el-button size="mini" plain type="danger" @click="deleteAccountBonus(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
        style="margin-top: 10px"
        background
        small
        :hide-on-single-page="false"
        layout="prev, pager, next, ->, total"
        @current-change="currentChange"
        :page-size="size"
        :total="total">
    </el-pagination>

    <!--  编辑报表弹窗-->
    <el-dialog
        title="编辑报表"
        :visible.sync="bonusVisible"
        :close-on-click-modal="false"
        top="60px"
        width="800px">
      <div>
        <el-form ref="bonusForm" :model="accountBonus" label-width="180px">

          <el-form-item label="平台" prop="platform">
            <span>{{ this.accountBonus.platform }}</span>
          </el-form-item>
          <el-form-item label="站点" prop="platform_base">
            <span>{{ this.accountBonus.platform_base }}</span>
          </el-form-item>
          <el-form-item label="账号" prop="account_name">
            <span>{{ this.accountBonus.account_name }}</span>
          </el-form-item>
          <el-form-item label="原始货币" prop="ori_currency">
            <span>{{ this.accountBonus.ori_currency }}</span>
          </el-form-item>
          <el-form-item label="负责人" prop="manager">
            <span>{{ this.accountBonus.manager ? this.accountBonus.manager.name : '无' }}</span>
          </el-form-item>

          <el-form-item
              label="提成比例" prop="bonus_rate">
            <el-input-number v-model="accountBonus.bonus_rate"
                             controls-position="right" class="inputwidth"
                             :precision="2" :min="0" :step="0.01"></el-input-number>
          </el-form-item>

<!--          ebay显示内容-->
          <div v-if="accountBonus.platform==='eBay'">
            <el-form-item
                :label="'销售额 '+accountBonus.ori_currency" prop="sale_amount">
              <el-input-number v-model="accountBonus.sale_amount"
                               controls-position="right" class="inputwidth"
                               :precision="2" :min="0" :step="1"></el-input-number>
              <span class="note">eBay: 马帮销售额</span>
            </el-form-item>

            <el-form-item
                :label="'净收款 '+accountBonus.ori_currency" prop="receipts">
              <el-input-number v-model="accountBonus.receipts"
                               controls-position="right" class="inputwidth"
                               :precision="2" :min="0" :step="1"></el-input-number>
              <span class="note">eBay: 后台statements里面的 payouts</span>
            </el-form-item>

            <el-form-item
                :label="'退款 '+accountBonus.ori_currency" prop="refund">
              <el-input-number v-model="accountBonus.refund"
                               controls-position="right" class="inputwidth"
                               :precision="2" :min="0" :step="1"></el-input-number>
              <span class="note">eBay: 后台statements里面的 refunds+Claims+Payment disputes</span>
            </el-form-item>

            <el-form-item
                :label="'平台费用 '+accountBonus.ori_currency" prop="platform_fees">
              <el-input-number v-model="accountBonus.platform_fees"
                               controls-position="right" class="inputwidth"
                               :precision="2" :min="0" :step="1"></el-input-number>
              <span class="note">eBay: 后台invoice里面 total invoices</span>
            </el-form-item>

            <el-form-item
                :label="'广告费 '+accountBonus.ori_currency" prop="ad_fees">
              <el-input-number v-model="accountBonus.ad_fees"
                               controls-position="right" class="inputwidth"
                               :precision="2" :min="0" :step="1"></el-input-number>
              <span class="note">eBay: 含税广告费</span>
            </el-form-item>

            <el-form-item
                label="产品成本 RMB" prop="product_cost">
              <el-input-number v-model="accountBonus.product_cost"
                               controls-position="right" class="inputwidth"
                               :precision="2" :min="0" :step="1"></el-input-number>
              <span class="note">eBay: 马帮产品成本</span>
            </el-form-item>

            <el-form-item
                label="物流费用 RMB" prop="shipping_cost">
              <el-input-number v-model="accountBonus.shipping_cost"
                               controls-position="right" class="inputwidth"
                               :precision="2" :min="0" :step="1"></el-input-number>
              <span class="note">eBay: 马帮物流成本</span>
            </el-form-item>

            <el-form-item
                label="订单数" prop="orders">
              <el-input-number v-model="accountBonus.orders"
                               controls-position="right" class="inputwidth"
                               :min="0" :step="1"></el-input-number>
            </el-form-item>
          </div>

<!--          Coupang显示内容-->
          <div v-if="accountBonus.platform==='Coupang'">
            <el-form-item
                :label="'销售额 '+accountBonus.ori_currency" prop="sale_amount">
              <el-input-number v-model="accountBonus.sale_amount"
                               controls-position="right" class="inputwidth"
                               :precision="2" :min="0" :step="1"></el-input-number>
              <span class="note">Coupang: 平台销售额</span>
            </el-form-item>

            <el-form-item
                :label="'最终支付金额 '+accountBonus.ori_currency" prop="receipts">
              <el-input-number v-model="accountBonus.receipts"
                               controls-position="right" class="inputwidth"
                               :precision="2" :min="0" :step="1"></el-input-number>
            </el-form-item>

            <el-form-item
                :label="'平台费用 '+accountBonus.ori_currency" prop="platform_fees">
              <el-input-number v-model="accountBonus.platform_fees"
                               controls-position="right" class="inputwidth"
                               :precision="2" :min="0" :step="1"></el-input-number>
            </el-form-item>

            <el-form-item label="结汇收入 RMB" prop="FES">
              <el-input-number v-model="accountBonus.FES"
                               controls-position="right" class="inputwidth"
                               :precision="2" :min="0" :step="1"></el-input-number>
              <span class="note">Coupang: PingPong结汇金额</span>
            </el-form-item>

            <el-form-item :label="'CGF/CGF LITE费用 '+accountBonus.ori_currency" prop="cp_cgf_fees">
              <el-input-number v-model="accountBonus.cp_cgf_fees"
                               controls-position="right" class="inputwidth"
                               :precision="2" :min="0" :step="1"></el-input-number>
            </el-form-item>

            <el-form-item
                label="产品成本 RMB" prop="product_cost">
              <el-input-number v-model="accountBonus.product_cost"
                               controls-position="right" class="inputwidth"
                               :precision="2" :min="0" :step="1"></el-input-number>
              <span class="note">eBay: 马帮产品成本</span>
            </el-form-item>

            <el-form-item label="CGF发仓运费 RMB" prop="cp_first_ship">
              <el-input-number v-model="accountBonus.cp_first_ship"
                               controls-position="right" class="inputwidth"
                               :precision="2" :min="0" :step="1"></el-input-number>
              <span class="note">Coupang: 本地发仓快递费</span>
            </el-form-item>

          </div>

          <el-form-item label="提成利润" prop="platform">
            <span v-if="this.profit>0" class="lirun">￥{{ this.profit | currency }}</span>
            <span v-if="this.profit<=0" class="fulirun">￥{{ this.profit | currency }}</span>
          </el-form-item>
          <el-form-item label="提成金额" prop="platform">
            <span class="lirun">￥{{ this.aBonus | currency }}</span>
          </el-form-item>
          <el-form-item label="审核" prop="is_calc">
            <el-switch
                v-model="accountBonus.is_calc"
                active-color="#13ce66">
            </el-switch>
          </el-form-item>


        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
    <el-button @click="bonusVisible = false">取 消</el-button>
    <el-button type="primary" :loading="loading" @click="updateAccountBonus">保 存</el-button>
  </span>
    </el-dialog>
  </el-card>
</template>

<script>
export default {
  name: "AccountBonus",
  props: ['month'],
  computed: {
    // 提成利润
    profit() {
      if (this.accountBonus.platform === 'eBay') {
        return this.accountBonus.FES - this.accountBonus.product_cost - this.accountBonus.shipping_cost
      }
      if (this.accountBonus.platform === 'Coupang') {
        return this.accountBonus.FES - this.accountBonus.product_cost - this.accountBonus.cp_first_ship
      }
    },
    // 提成
    aBonus() {
      if (this.profit>0){
        return this.profit * this.accountBonus.bonus_rate
      }
      return 0
    },
  },
  data() {
    return {
      bonus: [],
      loading: false,
      total: 0, // 总条数
      page: 1,  // 当前页
      size: 20,  // 页大小
      bonusVisible: false,
      managers: [],
      manager: '',
      accountBonus: {
        id: null,
        platform: '',
        platform_base: '',
        account_name: '',
        month: this.month,
        ori_currency: '',
        currency_rate: null,
        sale_amount: null,
        sale_income: null,
        receipts: null,
        FES: null,
        refund: null,
        platform_fees: null,
        platform_fees_rmb: null,
        product_cost: null,
        shipping_cost: null,
        profit: null,
        profit_margin: null,
        month_profit: null,
        orders: null,
        CUP: null,
        ad_fees: null,
        ad_fees_rmb: null,
        ad_percent: null,
        cp_cgf_fees: null,
        cp_first_ship: null,
        bonus_rate: null,
        bonus: null,
        manager: null,
        is_calc: false
      },
    }
  },
  filters: {
    // 百分比格式化
    percentFormat: function (value) {

      if (value == undefined) {
        return '--'
      }
      if (!value) {
        return 0
      }
      return (value * 100).toFixed(2) + "%";
    },
    //金额格式化
    currency: function (val) {
      if (val == undefined) {
        return 0
      }
      val = val.toString().replace(/\$|\,/g, '');
      if (isNaN(val)) {
        val = "0";
      }
      let sign = (val == (val = Math.abs(val)));
      val = Math.floor(val * 100 + 0.50000000001);
      let cents = val % 100;
      val = Math.floor(val / 100).toString();
      if (cents < 10) {
        cents = "0" + cents
      }
      for (var i = 0; i < Math.floor((val.length - (1 + i)) / 3); i++) {
        val = val.substring(0, val.length - (4 * i + 3)) + ',' + val.substring(val.length - (4 * i + 3));
      }

      return (((sign) ? '' : '-') + val + '.' + cents);
    },
  },
  mounted() {
    this.initBonus()
    this.initManagers()
  },
  methods: {
    deleteAccountBonus(id){
      this.$confirm('是否删除报表？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        this.deleteRequest('api/bo_account_bonus/'+ id+'/').then(resp => {
          this.initBonus();
          this.loading = false;
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        });
      });
    },
    // 页码
    currentChange(page) {
      this.page = page;
      this.initBonus();
    },
    updateAccountBonus(){
      this.accountBonus.profit = this.profit
      this.accountBonus.bonus = this.aBonus
      this.loading = true
      let url = 'api/bo_account_bonus/'+ this.accountBonus.id + '/'
      this.putRequest(url, this.accountBonus).then(resp => {
        this.loading = false
        if (resp) {
          this.initBonus();
          this.bonusVisible = false;
        }
      })
    },
    editAccountBonus(row) {
      Object.assign(this.accountBonus, row)
      this.bonusVisible = true;
    },
    createBonus() {
      this.loading = true
      let url = 'api/bo_account_bonus/create_bonus/'
      this.postRequest(url, {'month': this.month}).then(resp => {
        this.loading = false
        if (resp) {
          this.manager = ''
          this.initBonus();
        }
      })
    },
    initManagers(){
      let url = 'api/bo_manager/'
      this.getRequest(url).then(resp => {
        if (resp) {
          this.managers = resp
          this.managers.push({
            name: '全部员工',
            id: ''
          })
        }
      })
    },
    initBonus() {
      this.loading = true
      let url = 'api/bo_account_bonus/?month=' + this.month + '&page=' + this.page + '&page_size=' + this.size;
      if (this.manager) {
        url += '&manager=' + this.manager;
      }
      this.getRequest(url).then(resp => {
        this.loading = false
        if (resp.results) {
          this.bonus = resp.results;
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

.card {
  margin-top: 10px;
}

.fushu {
  color: red;
  font-weight: bold;
}

.inputwidth {
  width: 200px;
}
.selectManger{
  margin-bottom: 5px;
}

.note {
  margin-left: 10px;
  color: #919398;
  font-size: 12px;
}
.lirun{
  font-size: 16px;
  color: teal;
  font-weight: bold;
}
.fulirun{
  font-size: 16px;
  color: red;
  font-weight: bold;
}
</style>