<template>
  <div class="baseContainer">
    <div class="pContainer">
      <el-card shadow="never">
        <el-page-header @back="cancel" :content="month | monthFormat">
        </el-page-header>
      </el-card>

      <el-card shadow="hover">
        <div slot="header" class="clearfix">

          <span class="chartTitle">① 设置月份基准汇率</span>
          <el-button style="float: right " type="success" @click="addCurrency">添加币种</el-button>
        </div>
        <el-table
            :data="rate"
            :header-cell-style="{background:'#eef1f6'}"
            empty-text="请添加汇率"
            v-loading="rLoading"
            style="width: 100%">
        <el-table-column
            align="center"
            header-align="center"
            label="币种">
          <template slot-scope="scope">
            <span>{{scope.row.currency}}</span>
          </template>
        </el-table-column>
        <el-table-column
            align="center"
            header-align="center"
            label="汇率">
          <template slot-scope="scope">
            <span>{{scope.row.rate}}</span>
          </template>
        </el-table-column>
          <el-table-column
              align="center"
              header-align="center"
              label="操作">
            <template slot-scope="scope">
              <el-button type="text" @click="changeRate(scope.row)">编辑</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <AccountSales :month="month" :currencys="rate"></AccountSales>
      <AccountBonus :month="month"></AccountBonus>

<!--      汇率弹窗-->
      <el-dialog
          :title="currencyRate.id?'修改汇率':'添加币种'"
          :visible.sync="rateVisible"
          width="30%">
        <div>
          <el-form ref="rateForm"
                   label-position="top">
            <el-form-item label="币种" prop="currency" >
              <el-select v-model="currencyRate.currency" placeholder="请选择" style="width: 100%">
                <el-option
                    v-for="item in currencyList"
                    :disabled="item.disabled"
                    :key="item.name"
                    :label="item.name"
                    :value="item.name">
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item
                label="汇率" prop="rate">
              <el-input-number v-model="currencyRate.rate" :precision="2" :min="0" :step="1"></el-input-number>
            </el-form-item>

          </el-form>

        </div>
        <span slot="footer" class="dialog-footer">
    <el-button @click="rateVisible = false">取 消</el-button>
    <el-button v-if="!currencyRate.id"
               :disabled="currencyRate.currency ==='' || currencyRate.rate ===0"
               type="primary" @click="createCurrency">确 定</el-button>
    <el-button v-if="currencyRate.id" type="primary" @click="updateCurrency">保 存</el-button>
  </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import AccountSales from "@/components/app/bonus/AccountSales";
import AccountBonus from "@/components/app/bonus/AccountBonus";

export default {
  name: "MonthDetail",
  components:{
    AccountSales, AccountBonus
  },
  data(){
    return{
      month: this.$route.query.month,
      rate: [],
      rLoading: false,
      rateVisible: false,
      currencyRate: {
        id: null,
        currency: '',
        rate: 0,
        month: this.$route.query.month,
      },
      currencyList: [
        {name: 'USD', disabled: false},
        {name: 'AUD', disabled: false},
        {name: 'GBP', disabled: false},
        {name: 'EUR', disabled: false},
        {name: 'KWR', disabled: false},
        {name: 'MXN', disabled: false},

      ],
    }
  },
  filters: {
    //信息格式化
    monthFormat: function (value) {
      let year = value.substring(0,4)
      let mon = value.substring(4)
      return year + '年' + mon + '月'
    },
  },
  mounted() {
    this.initRate();
  },
  methods:{
    //编辑币种
    changeRate(obj){
      Object.assign(this.currencyRate, obj)
      this.rateVisible = true
    },
    // 修改汇率
    updateCurrency(){
      this.putRequest('api/bo_exchange_rate/'+this.currencyRate.id+'/', this.currencyRate).then(resp => {
        if (resp) {
          this.initRate();
          this.rateVisible = false;
        }
      })
    },
    // 添加币种
    createCurrency(){
      this.postRequest('api/bo_exchange_rate/', this.currencyRate).then(resp => {
        if (resp) {
          this.initRate();
          this.rateVisible = false;
        }
      })
    },
    addCurrency(){
      this.currencyRate.id = null
      this.currencyRate.currency = ''
      this.currencyRate.rate = 0;
      this.rateVisible = true;
    },
    //返回
    cancel() {
      this.$router.push('/bonusMonthList')
    },
    //初始化汇率
    initRate(){
      this.rLoading = true
      let url = 'api/bo_exchange_rate/?month=' + this.month
      this.getRequest(url).then(resp => {
        this.rLoading = false
        if (resp.results) {
          this.rate = resp.results;
          this.rate.forEach(item=>{
            this.currencyList.forEach(i=>{
              if (item.currency === i.name) i.disabled = true
            })
          })
        }
      })
    }
  }
}
</script>

<style scoped>
.baseContainer {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
.pContainer {
  width: 1200px;
}
.chartTitle {
  font-weight: bold;
  margin-right: 20px
}
.el-card{
  margin-top: 10px;
}

</style>