<template>
  <el-card class="card" shadow="never">
    <div slot="header" class="clearfix">
      <span class="chartTitle">② 账号销售报表</span>
      <el-button style="float: right " type="success" @click="addAccountSales">添加报表</el-button>
    </div>
    <el-table
        :data="accountSalesList"
        :header-cell-style="{background:'#eef1f6'}"
        v-loading="loading"
        style="width: 100%">
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-descriptions
              v-if="props.row.platform==='eBay' || props.row.platform==='Aliexpress'"
              :title="props.row.account_name" :column="2" border>
            <el-descriptions-item label="平台">{{ props.row.platform }}</el-descriptions-item>
            <el-descriptions-item label="站点">{{ props.row.platform_base }}</el-descriptions-item>
            <el-descriptions-item label="原始币种">{{ props.row.ori_currency }}</el-descriptions-item>
            <el-descriptions-item label="汇率">{{ props.row.currency_rate }}</el-descriptions-item>
            <el-descriptions-item label="销售额">{{ props.row.ori_currency + ' '}} {{ props.row.sale_amount | currency }}</el-descriptions-item>
            <el-descriptions-item label="销售收入(销售额 - 平台费用)">{{ props.row.ori_currency + ' '}} {{ props.row.sale_income | currency }}</el-descriptions-item>
            <el-descriptions-item label="净收款(打款金额)">{{ props.row.ori_currency + ' '}} {{ props.row.receipts | currency }}</el-descriptions-item>
            <el-descriptions-item label="结汇收入">￥{{ props.row.FES | currency }}</el-descriptions-item>
            <el-descriptions-item label="平台费用">{{ props.row.ori_currency + ' '}} {{ props.row.platform_fees | currency }}</el-descriptions-item>
            <el-descriptions-item label="产品成本">￥{{ props.row.product_cost | currency }}</el-descriptions-item>
            <el-descriptions-item label="物流成本">￥{{ props.row.shipping_cost }}</el-descriptions-item>
            <el-descriptions-item label="提成利润"><span :class="props.row.profit<0?'fushu':''">￥{{ props.row.profit | currency }}</span></el-descriptions-item>
            <el-descriptions-item label="当月毛利润"><span :class="props.row.month_profit<0?'fushu':''">￥{{ props.row.month_profit | currency }}</span></el-descriptions-item>
            <el-descriptions-item label="毛利率">{{ props.row.profit_margin | percentFormat }}</el-descriptions-item>
            <el-descriptions-item label="订单数">{{ props.row.orders }}</el-descriptions-item>
            <el-descriptions-item label="客单价">{{ props.row.ori_currency + ' '}}{{ props.row.CUP | currency }}</el-descriptions-item>
            <el-descriptions-item label="广告费">{{ props.row.ori_currency + ' '}}{{ props.row.ad_fees | currency }}</el-descriptions-item>
            <el-descriptions-item label="广告费占比">{{ props.row.ad_percent | percentFormat }}</el-descriptions-item>
            <el-descriptions-item label="负责人">{{ props.row.manager? props.row.manager.name: '无'}}</el-descriptions-item>
          </el-descriptions>
          <el-descriptions
              v-if="props.row.platform==='Coupang'"
              :title="props.row.account_name" :column="2" border>
            <el-descriptions-item label="平台">{{ props.row.platform }}</el-descriptions-item>
            <el-descriptions-item label="站点">{{ props.row.platform_base }}</el-descriptions-item>
            <el-descriptions-item label="原始币种">{{ props.row.ori_currency }}</el-descriptions-item>
            <el-descriptions-item label="汇率">{{ props.row.currency_rate }}</el-descriptions-item>
            <el-descriptions-item label="销售额">{{ props.row.ori_currency + ' '}} {{ props.row.sale_amount | currency }}</el-descriptions-item>
            <el-descriptions-item label="净收款(打款金额)">{{ props.row.ori_currency + ' '}} {{ props.row.receipts | currency }}</el-descriptions-item>
            <el-descriptions-item label="结汇收入">￥{{ props.row.FES | currency }}</el-descriptions-item>
            <el-descriptions-item label="平台费用">{{ props.row.ori_currency + ' '}} {{ props.row.platform_fees | currency }}</el-descriptions-item>
            <el-descriptions-item label="CGF/CGF LITE费用">{{ props.row.ori_currency + ' '}} {{ props.row.cp_cgf_fees | currency }}</el-descriptions-item>
            <el-descriptions-item label="产品成本">￥{{ props.row.product_cost | currency }}</el-descriptions-item>
            <el-descriptions-item label="CGF发仓运费">￥{{ props.row.cp_first_ship }}</el-descriptions-item>
            <el-descriptions-item label="提成利润"><span :class="props.row.profit<0?'fushu':''">￥{{ props.row.profit | currency }}</span></el-descriptions-item>
            <el-descriptions-item label="当月毛利润"><span :class="props.row.month_profit<0?'fushu':''">￥{{ props.row.month_profit | currency }}</span></el-descriptions-item>
            <el-descriptions-item label="广告费">{{ props.row.ori_currency + ' '}}{{ props.row.ad_fees | currency }}</el-descriptions-item>
            <el-descriptions-item label="负责人">{{ props.row.manager? props.row.manager.name: '无'}}</el-descriptions-item>
          </el-descriptions>

        </template>
      </el-table-column>
      <el-table-column
          prop="account_name"
          align="center"
          header-align="center"
          label="账号名称">
      </el-table-column>
      <el-table-column
          prop="platform"
          align="center"
          header-align="center"
          label="平台">
      </el-table-column>
      <el-table-column
          prop="platform_base"
          align="center"
          header-align="center"
          label="站点">
      </el-table-column>
      <el-table-column
          align="center"
          header-align="center"
          label="销售额">
        <template slot-scope="scope">
          {{ scope.row.ori_currency + ' '}} {{scope.row.sale_amount | currency}}
        </template>
      </el-table-column>
      <el-table-column
          align="center"
          header-align="center"
          label="当月毛利润">
        <template slot-scope="scope">
          <span :class="scope.row.month_profit<0?'fushu':''">￥{{ scope.row.month_profit | currency }}</span>
        </template>
      </el-table-column>

      <el-table-column
          align="center"
          header-align="center"
          label="操作">
        <template slot-scope="scope">
          <el-button size="mini" plain type="primary" @click="editAccountSales(scope.row)">编辑</el-button>
          <el-button size="mini" plain type="danger" @click="deleteAccountSales(scope.row.id)">删除</el-button>
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
    <div>
      <!--  添加报表弹窗-->
      <el-dialog
          :title="accountSales.id? '编辑报表':'添加账号数据'"
          :visible.sync="accountVisible"
          :close-on-click-modal="false"
          top="60px"
          width="800px">
        <div>
          <el-form ref="accountForm" :rules="rules" :model="accountSales" label-width="180px">

            <el-form-item  label="平台" prop="platform">
              <el-select @change="getAccounts($event)" v-model="accountSales.platform" placeholder="请选择" class="inputwidth">
                <el-option
                    v-for="item in platforms"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item  label="站点" prop="platform_base">
              <el-select v-model="accountSales.platform_base" placeholder="请选择" class="inputwidth">
                <el-option
                    v-for="item in platform_bases"
                    :key="item.name"
                    :label="item.name"
                    :value="item.name">
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="账号" prop="account_name">
              <el-select @change="setAccount($event)" filterable v-model="accountSales.account_name" placeholder="请选择" class="inputwidth">
                <el-option
                    v-for="item in accounts"
                    :disabled="item.disabled"
                    :key="item.name"
                    :label="item.name"
                    :value="item.name">
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item  label="原始币种" prop="ori_currency">
              <el-select @change="getRate($event)" v-model="accountSales.ori_currency" placeholder="请选择" class="inputwidth">
                <el-option
                    v-for="item in currencys"
                    :key="item.currency"
                    :label="item.currency"
                    :value="item.currency">
                </el-option>
              </el-select>

            </el-form-item>

<!--            ebay平台内容-->
            <div v-if="accountSales.platform==='eBay' || accountSales.platform==='Aliexpress'">
              <el-form-item
                  :label="'销售额 '+accountSales.ori_currency" prop="sale_amount">
                <el-input-number v-model="accountSales.sale_amount"
                                 controls-position="right" class="inputwidth"
                                 :precision="2" :min="0" :step="1"></el-input-number>
                <span class="note" >eBay: 马帮销售额</span>
              </el-form-item>

              <el-form-item :label="'净收款 '+accountSales.ori_currency" prop="receipts">
                <el-input-number v-model="accountSales.receipts"
                                 controls-position="right" class="inputwidth"
                                 :precision="2" :min="0" :step="1"></el-input-number>
                <span class="note" >eBay: 后台statements里面的 payouts</span>
              </el-form-item>

              <el-form-item :label="'退款 '+accountSales.ori_currency" prop="refund">
                <el-input-number v-model="accountSales.refund"
                                 controls-position="right" class="inputwidth"
                                 :precision="2" :min="0" :step="1"></el-input-number>
                <span class="note" >eBay: 后台statements里面的 refunds+Claims+Payment disputes</span>
              </el-form-item>

              <el-form-item
                  :label="'平台费用 '+accountSales.ori_currency" prop="platform_fees">
                <el-input-number v-model="accountSales.platform_fees"
                                 controls-position="right" class="inputwidth"
                                 :precision="2" :min="0" :step="1"></el-input-number>
                <span class="note" >eBay: 后台invoice里面 total invoices</span>
              </el-form-item>

              <el-form-item :label="'广告费 '+accountSales.ori_currency" prop="ad_fees">
                <el-input-number v-model="accountSales.ad_fees"
                                 controls-position="right" class="inputwidth"
                                 :precision="2" :min="0" :step="1"></el-input-number>
                <span class="note">eBay: 含税广告费</span>
              </el-form-item>

              <el-form-item
                  label="产品成本 RMB" prop="product_cost">
                <el-input-number v-model="accountSales.product_cost"
                                 controls-position="right" class="inputwidth"
                                 :precision="2" :min="0" :step="1"></el-input-number>
                <span class="note">eBay: 马帮产品成本</span>
              </el-form-item>

              <el-form-item label="物流费用 RMB" prop="shipping_cost">
                <el-input-number v-model="accountSales.shipping_cost"
                                 controls-position="right" class="inputwidth"
                                 :precision="2" :min="0" :step="1"></el-input-number>
                <span class="note">eBay: 马帮物流成本</span>
              </el-form-item>

              <el-form-item label="订单数" prop="orders">
                <el-input-number v-model="accountSales.orders"
                                 controls-position="right" class="inputwidth"
                                 :min="0" :step="1"></el-input-number>
              </el-form-item>
            </div>

<!--            Coupang平台内容-->
            <div v-if="accountSales.platform==='Coupang'">
              <el-form-item
                  :label="'销售额 '+accountSales.ori_currency" prop="sale_amount">
                <el-input-number v-model="accountSales.sale_amount"
                                 controls-position="right" class="inputwidth"
                                 :precision="2" :min="0" :step="1"></el-input-number>
                <span class="note">Coupang: 平台销售额</span>
              </el-form-item>

              <el-form-item :label="'最终支付金额 '+accountSales.ori_currency" prop="receipts">
                <el-input-number v-model="accountSales.receipts"
                                 controls-position="right" class="inputwidth"
                                 :precision="2" :min="0" :step="1"></el-input-number>
              </el-form-item>

              <el-form-item
                  :label="'平台费用 '+accountSales.ori_currency" prop="platform_fees">
                <el-input-number v-model="accountSales.platform_fees"
                                 controls-position="right" class="inputwidth"
                                 :precision="2" :min="0" :step="1"></el-input-number>
              </el-form-item>

              <el-form-item label="结汇收入 RMB" prop="FES">
                <el-input-number v-model="accountSales.FES"
                                 controls-position="right" class="inputwidth"
                                 :precision="2" :min="0" :step="1"></el-input-number>
                <span class="note">Coupang: PingPong结汇金额</span>
              </el-form-item>

              <el-form-item :label="'CGF/CGF LITE费用 '+accountSales.ori_currency" prop="cp_cgf_fees">
                <el-input-number v-model="accountSales.cp_cgf_fees"
                                 controls-position="right" class="inputwidth"
                                 :precision="2" :min="0" :step="1"></el-input-number>
              </el-form-item>

              <el-form-item
                  label="产品成本 RMB" prop="product_cost">
                <el-input-number v-model="accountSales.product_cost"
                                 controls-position="right" class="inputwidth"
                                 :precision="2" :min="0" :step="1"></el-input-number>
              </el-form-item>

              <el-form-item label="CGF发仓运费 RMB" prop="cp_first_ship">
                <el-input-number v-model="accountSales.cp_first_ship"
                                 controls-position="right" class="inputwidth"
                                 :precision="2" :min="0" :step="1"></el-input-number>
                <span class="note">Coupang: 本地发仓快递费</span>
              </el-form-item>
            </div>


          </el-form>
        </div>
        <span slot="footer" class="dialog-footer">
    <el-button @click="accountVisible = false">取 消</el-button>
    <el-button v-if="!accountSales.id" type="primary"  :loading="loading" @click="createAccountSales">确 定</el-button>
    <el-button v-if="accountSales.id" type="primary"  :loading="loading" @click="updateAccountSales">保 存</el-button>
  </span>
      </el-dialog>
    </div>
  </el-card>


</template>

<script>
export default {
  name: "AccountSales",
  props: ['month', 'currencys'],
  data(){
    return{
      loading: false,
      total: 0, // 总条数
      page: 1,  // 当前页
      size: 20,  // 页大小
      accountSalesList: [],
      accountVisible: false,
      accountSales: {
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
        manager: null,
      },
      accounts: [],
      platform_bases: [],
      platforms: [
        {name: 'eBay', value: 'eBay'},
        {name: 'Coupang', value: 'Coupang'},
        {name: 'Aliexpress', value: 'Aliexpress'},
        {name: 'Shopee', value: 'Shopee'},
        {name: 'Mercado', value: 'Mercado'},
        {name: 'Shopify', value: 'Shopify'},
        {name: 'Amazon', value: 'Amazon'},
      ],
      rules: {
        platform: [
          {required: true, message: '请选择平台', trigger: 'blur'},
        ],
        platform_base: [
          {required: true, message: '请选择站点', trigger: 'blur'},
        ],
        account_name: [
          {required: true, message: '选择账号', trigger: 'blur'},
        ],
        ori_currency: [
          {required: true, message: '选择原始币种', trigger: 'blur'},
        ],
      }
    }
  },
  filters:{
    // 百分比格式化
    percentFormat: function (value) {

      if (value == undefined) {
        return '--'
      }
      if (!value) {
        return 0
      }
      return (value*100).toFixed(2) +"%";
    },
    //金额格式化
    currency: function (val) {
      if (!val) return 0
      val = val.toString().replace(/\$|\,/g,'');
      if(isNaN(val)) {
        val = "0";
      }
      let sign = (val == (val = Math.abs(val)));
      val = Math.floor(val*100+0.50000000001);
      let cents = val%100;
      val = Math.floor(val/100).toString();
      if(cents<10) {
        cents = "0" + cents
      }
      for (var i = 0; i < Math.floor((val.length-(1+i))/3); i++) {
        val = val.substring(0,val.length-(4*i+3))+',' + val.substring(val.length-(4*i+3));
      }

      return (((sign)?'':'-') + val + '.' + cents);
    },
  },
  mounted() {
    this.initAccountSales();
  },
  methods:{
    //删除报表
    deleteAccountSales(id){
      this.$confirm('是否删除报表？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        this.deleteRequest('api/bo_account_sales/'+ id+'/').then(resp => {
          this.initAccountSales();
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
      this.initAccountSales();
    },
    setAccount(value){
      this.accounts.forEach(item=>{
        if (item.name === value) this.accountSales.manager = item.manager.id
      })
    },

    updateAccountSales(){
      this.loading = true
      this.accountSales.manager = this.accountSales.manager.id
      let url = 'api/bo_account_sales/'+ this.accountSales.id + '/'
      this.putRequest(url, this.accountSales).then(resp => {
        this.loading = false
        if (resp) {
          this.initAccountSales();
          this.accountVisible = false;
        }
      })
    },
    editAccountSales(row){
      Object.assign(this.accountSales, row)
      this.accountVisible = true;
      this.getAccounts(row.platform)
    },
    createAccountSales(){
      this.$refs.accountForm.validate((valid) => {
        if (valid) {
          this.loading = true
          let url = 'api/bo_account_sales/'
          this.postRequest(url, this.accountSales).then(resp => {
            this.loading = false
            if (resp) {
              this.initAccountSales();
              this.accountVisible = false;
            }
          })
        } else {
          return false;
        }
      });

    },
    addAccountSales(){
      this.accountSales.platform = ''
      this.accountSales.platform_base = ''
      this.accountSales.account_name = ''
      this.accountSales.month = this.month
      this.accountSales.ori_currency = ''
      this.accountSales.currency_rate = null
      this.accountSales.sale_amount = null
      this.accountSales.sale_income = null
      this.accountSales.receipts = null
      this.accountSales.FES = null
      this.accountSales.refund = null
      this.accountSales.platform_fees = null
      this.accountSales.platform_fees_rmb = null
      this.accountSales.product_cost = null
      this.accountSales.shipping_cost = null
      this.accountSales.profit = null
      this.accountSales.profit_margin = null
      this.accountSales.month_profit = null
      this.accountSales.orders = null
      this.accountSales.CUP = null
      this.accountSales.ad_fees = null
      this.accountSales.ad_fees_rmb = null
      this.accountSales.ad_percent = null
      this.accountSales.cp_cgf_fees = null
      this.accountSales.cp_first_ship = null
      this.accountSales.manager = null

      this.accountVisible = true;
    },
    //设置汇率
    getRate(value){
      this.currencys.forEach(item=>{
        if (item.currency === value) this.accountSales.currency_rate = item.rate;
      })
    },
    //获取账号
    getAccounts(value){


      let url = 'api/bo_bonus_accounts/?page_size=500&type=' + value
      this.getRequest(url).then(resp => {
        if (resp.results) {
          this.accounts = resp.results;
          let a = false
          this.accounts.forEach(item=>{
            if(item.name === this.accountSales.account_name) a = true;
            item['disabled'] = false
            this.accountSalesList.forEach(i=>{
              if (item.name === i.account_name) item['disabled'] = true
            })
          })
          if (!a) {
            this.accountSales.account_name = ''
          }
        }
      })

      let url2 = 'api/bo_basic_info/?page_size=500&type=BASE&platform=' + value
      this.getRequest(url2).then(resp => {
        if (resp.results) {
          this.platform_bases = resp.results;
          let b = false
          this.platform_bases.forEach(item=>{
            if(item.name === this.accountSales.platform_base) b = true
          })
          if (!b) {
            this.accountSales.platform_base = ''
          }
        }
      })
    },
    //初始账号业绩
    initAccountSales(){
      this.loading = true
      let url = 'api/bo_account_sales/?month=' + this.month + '&page=' + this.page + '&page_size=' + this.size;
      this.getRequest(url).then(resp => {
        this.loading = false
        if (resp.results) {
          this.accountSalesList = resp.results;
          this.total = resp.count;
        }
      })
    },
  }
}
</script>

<style scoped>
.chartTitle {
  font-weight: bold;
  margin-right: 20px
}
.card{
  margin-top: 10px;
}
.inputwidth {
  width: 200px;
}
.note{
  margin-left: 10px;
  color: #919398;
  font-size: 12px;
}
.demo-table-expand {
  font-size: 0;
}
.demo-table-expand label {
  width: 90px;
  color: #99a9bf;
  font-weight: bold;
}
.demo-table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 50%;
}
.fushu {
  color: red;
  font-weight: bold;
}
</style>