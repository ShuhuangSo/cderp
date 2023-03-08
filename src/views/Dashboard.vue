<template>
  <div class="baseContainer">
    <div class="pContainer">
      <el-card class="small-card" shadow="never">
        <div style="display: flex;justify-content: space-between">
          <span class="chartTitle">今日销量</span>
          <span>
            <i class="el-icon-loading" v-if="tsLoading"></i>
            <el-link type="info"
                     v-if="!tsLoading"
                     @click.native="getTodaySales"
                     :underline="false"
                     icon="el-icon-refresh-right"></el-link>
          </span>
        </div>

        <div style="display: flex;justify-content: space-between; padding-top: 20px">
          <div style="width: 290px;text-align:center">
            <div style="color: #6e7079;">销量</div>
            <div class="zTitle">
              <animate-number ref="salesNum" from="0" :to="todaySaleQty" :key="todaySaleQty"
                              duration="2000"></animate-number>
            </div>
          </div>
          <div style="text-align:center; width: 290px">
            <div style="color: #6e7079;">销售额</div>
            <div class="zTitle">
              ￥<animate-number ref="salesNum2" from="0" :to="todaySaleAmount" :key="todaySaleAmount"
                              duration="2000"></animate-number>
            </div>
          </div>
        </div>
      </el-card>
      <el-card class="small-card" shadow="never">
        <div style="display: flex;justify-content: space-between">
          <span class="chartTitle">今日库存</span>
          <span>
            <i class="el-icon-loading" v-if="tStockLoading"></i>
            <el-link type="info"
                     v-if="!tStockLoading"
                     @click.native="getTodayStock"
                     :underline="false"
                     icon="el-icon-refresh-right"></el-link>
          </span>
        </div>

        <div style="display: flex;justify-content: space-between; padding-top: 20px">
          <div style="width: 290px;text-align:center">
            <div style="color: #6e7079;">库存</div>
            <div class="zTitle2">
              <animate-number ref="stockNum" from="0" :to="todayStockQty" :key="todayStockQty"
                              duration="2000"></animate-number>
            </div>
          </div>
          <div style="text-align:center; width: 290px">
            <div style="color: #6e7079;">占用资金</div>
            <div class="zTitle2">￥<animate-number ref="stockNum2" from="0" :to="todayStockAmount" :key="todayStockAmount"
                              duration="2000"></animate-number>
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="main-card-big" shadow="never">
        <div class="main-chart-big">
          <span class="chartTitle">销量统计</span>
          <el-select v-model="salesDate"
                     @change="changeSalesDate"
                     size="mini" placeholder="请选择">
            <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value">
            </el-option>
          </el-select>
          <SalesCharts
              :key="timer" v-if="startSaleDate"
              :startSaleDate="startSaleDate | dateFormat"
              :endSaleDate="endSaleDate | dateFormat"></SalesCharts>

        </div>
      </el-card>

      <el-card class="main-card" shadow="never">
        <div class="main-chart">
          <div class="mTitle">
            <span class="chartTitle">库存统计</span>
            <span>
              <el-link type="info"
                       v-if="!tsLoading"
                       @click.native="sc_key=new Date().getTime()"
                       :underline="false"
                       style="margin-right: 10px"
                       icon="el-icon-refresh-right"></el-link>
              <el-radio-group size="mini" v-model="stockShow" style="margin-right: 25px">
              <el-radio-button label="系列"></el-radio-button>
              <el-radio-button label="门店"></el-radio-button>
            </el-radio-group>
            </span>

          </div>

          <StockCharts ref="stockCharts" :key="sc_key" :stockShow="stockShow"></StockCharts>
        </div>
      </el-card>

      <el-card class="main-card" shadow="never">
        <div class="main-chart">
          <div class="mTitle">
            <div>
              <span class="chartTitle">客户采购量</span>
              <el-date-picker
                  v-model="cus_date"
                  :editable="false"
                  :clearable="false"
                  size="mini"
                  type="daterange"
                  align="right"
                  unlink-panels
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  value-format="yyyy-MM-dd"
                  style="width: 250px"
                  :picker-options="pickerOptions">
              </el-date-picker>
            </div>
            <span>
              <el-radio-group size="mini" v-model="customerShow" style="margin-right: 25px">
              <el-radio-button label="数量"></el-radio-button>
              <el-radio-button label="金额"></el-radio-button>
            </el-radio-group>
            </span>

          </div>
          <CustomerCharts
              :customerShow="customerShow"
              :start_date="cus_date[0] | dateFormat"
              :end_date="cus_date[1] | dateFormat"></CustomerCharts>
        </div>
      </el-card>

      <el-card class="main-card" shadow="never">
        <span class="chartTitle">库存排名</span>
        <el-select v-model="store"
                   size="mini"
                   placeholder="请选择" style="width: 150px">
          <el-option
              v-for="item in stores"
              :key="item.id"
              :label="item.store_name"
              :value="item.id">
          </el-option>
        </el-select>
        <el-select v-model="series"
                   size="mini"
                   placeholder="请选择" style="width: 150px; margin-left: 5px">
          <el-option
              v-for="item in productSeries"
              :key="item.name"
              :label="item.name"
              :value="item.name">
          </el-option>
        </el-select>
        <div class="main-chart2">
          <StockRank :store="store" :series="series"></StockRank>
        </div>
      </el-card>

      <el-card class="main-card" shadow="never">
        <span class="chartTitle">销量排名</span>
        <el-date-picker
            v-model="p_date"
            :editable="false"
            :clearable="false"
            size="mini"
            type="daterange"
            align="right"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            style="width: 250px"
            :picker-options="pickerOptions">
        </el-date-picker>
        <div class="main-chart2">
          <SalesRank :start_date="p_date[0] | dateFormat"
                     :end_date="p_date[1] | dateFormat"></SalesRank>
        </div>
      </el-card>

    </div>
  </div>


</template>

<script>
import SalesCharts from "@/views/charts/SalesCharts";
import StockCharts from "@/views/charts/StockCharts";
import CustomerCharts from "@/views/charts/CustomerCharts";
import SalesRank from "@/views/charts/SalesRank";
import StockRank from "@/views/charts/StockRank";
import moment from "moment";

export default {
  name: "Dashboard",
  components: {
    SalesCharts,
    StockCharts,
    CustomerCharts,
    SalesRank,
    StockRank,

  },
  data() {
    return {
      startSaleDate: '',
      endSaleDate: '',
      salesDate: '7d',
      timer: '',
      sc_key: '',
      stockShow: '系列',  // 库存统计显示类型
      todaySaleQty: 0,  //今日销量
      todaySaleAmount: 0.0, // 今日销售额
      todayStockQty: 0, // 今日库存量
      todayStockAmount: 0.0, // 今日库存金额
      tsLoading: false, // 获取销量加载
      tStockLoading: false, // 获取库存加载
      cus_date: '', // 客户采购量显示日期
      p_date: '', // 产品销量显示日期
      customerShow: '数量', //客户采购量默认显示
      stores: [], //店铺列表
      store: null,
      productSeries: [], //产品系列列表
      series: '全部系列',
      options: [{
        value: '7d',
        label: '最近7天'
      }, {
        value: '15d',
        label: '最近15天'
      }, {
        value: '30d',
        label: '最近30天'
      }, {
        value: '60d',
        label: '最近60天'
      }],
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
            picker.$emit('pick', [start, end]);
          }
        }]
      },
    }
  },
  filters: {
    //时间日期格式化
    dateFormat: function (value) {
      if (value === '') return value
      return moment(value).format("YYYY-MM-DD");
    },
    //金额格式化
    currency: function (value) {
      if (!value) return 0.00;
      return `¥ ${value.toFixed(2)}`;
    },
  },
  mounted() {
    // 如果是供应商角色，就跳转到供应商页面
    let user = JSON.parse(window.sessionStorage.getItem('user'));
    if (user.role === 'SUPPLIER') {
      this.$router.replace('/supplierHome');
    }
    // if (user.role === 'STAFF') {
    //   this.$router.replace('/melManage');
    // }
    this.initSettings();
    this.getTodaySales();
    this.getTodayStock();
  },
  methods: {

    //改变销售统计时间
    changeSalesDate() {
      if (this.salesDate === '7d') {
        this.startSaleDate.setTime(new Date().getTime() - 3600 * 1000 * 24 * 7);
      }
      if (this.salesDate === '15d') {
        this.startSaleDate.setTime(new Date().getTime() - 3600 * 1000 * 24 * 15);
      }
      if (this.salesDate === '30d') {
        this.startSaleDate.setTime(new Date().getTime() - 3600 * 1000 * 24 * 30);
      }
      if (this.salesDate === '60d') {
        this.startSaleDate.setTime(new Date().getTime() - 3600 * 1000 * 24 * 60);
      }

      this.timer = new Date().getTime();
    },

    //获取今日库存
    getTodayStock() {
      this.tStockLoading = true
      let url = 'api/stock_report/calc_current_stock/'
      this.getRequest(url).then(resp => {
        this.tStockLoading = false
        if (resp) {
          this.todayStockQty = resp.total_qty
          this.todayStockAmount = resp.total_amount
          this.$nextTick(() => {
            this.$refs.stockNum.start()
            this.$refs.stockNum2.start()
          })
        }
      })
    },

    //获取今天销售额
    getTodaySales() {
      this.tsLoading = true
      this.getRequest('api/sales_report/calc_today_sales/').then(resp => {
        this.tsLoading = false
        if (resp) {
          this.todaySaleQty = resp.total_qty
          this.todaySaleAmount = resp.total_amount.toFixed(2)
          this.$nextTick(() => {
            this.$refs.salesNum.start()
            this.$refs.salesNum2.start()
          })
        }
      })
    },

    initSettings() {
      //设置默认销售统计时间
      this.startSaleDate = new Date();
      this.endSaleDate = new Date();
      this.startSaleDate.setTime(this.startSaleDate.getTime() - 3600 * 1000 * 24 * 7);

      this.cus_date = [this.startSaleDate, this.endSaleDate]
      this.p_date = [this.startSaleDate, this.endSaleDate]

      //获取所有可选仓库
      if (window.sessionStorage.getItem('stores')) {
        this.stores = JSON.parse(window.sessionStorage.getItem('stores'));
      } else {
        this.getRequest('api/stores/?page_size=1000').then(resp => {
          if (resp.results) {
            this.stores = resp.results;
            window.sessionStorage.setItem('stores', JSON.stringify(this.stores));
          }
        })
      }
      this.store = this.stores[0].id

      //初始化产品系列
      let url = 'api/product_extra_info/?type=SERIES'
      this.getRequest(url).then(resp => {
        if (resp.results) {
          this.productSeries = resp.results;
          //添加全部系列
          this.productSeries.push({
            'name': '全部系列',
            'id': ''
          })

        }
      })

    }
  }
}
</script>

<style scoped>
.main-chart {
  width: 590px;
  height: 400px;
}
.main-chart2 {
  width: 590px;
  height: 920px;
}

.main-card {
  width: 590px;
  margin-left: 5px;
  margin-right: 5px;
  margin-bottom: 10px;
}

.small-card {
  width: 590px;
  height: 200px;
  margin-left: 5px;
  margin-right: 5px;
  margin-bottom: 10px;
}

.main-chart-big {
  width: 1192px;
  height: 400px;
  padding-bottom: 10px;
}

.main-card-big {
  width: 1192px;
  margin-left: 5px;
  margin-right: 5px;
  margin-bottom: 10px;
}

.pContainer {
  max-width: 1300px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.baseContainer {
  display: flex;
  justify-content: center;
}

.chartTitle {
  font-weight: bold;
  margin-right: 20px
}

.mTitle {
  display: flex;
  justify-content: space-between;
}

.zTitle {
  font-weight: bold;
  font-size: xxx-large;
  color: #008080;
}
.zTitle2 {
  font-weight: bold;
  font-size: xxx-large;
  color: #4f6782;
}

</style>