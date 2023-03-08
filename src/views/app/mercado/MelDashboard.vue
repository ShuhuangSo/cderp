<template>
  <div class="baseContainer">
    <div class="pContainer">

<!--      待办事项-->
      <el-card class="small-card" shadow="never">
        <div style="display: flex;justify-content: space-between">
          <span class="chartTitle">待办事项</span>
          <span>
            <i class="el-icon-loading" v-if="daiban_loading"></i>
            <el-link type="info"
                     v-if="!daiban_loading"
                     @click.native="initDaiban"
                     :underline="false"
                     icon="el-icon-refresh-right"></el-link>
          </span>
        </div>

        <div style="display: flex;padding-top: 20px">
          <div class="msg_title">
            发货运单
          </div>
          <div style="width: 100px;text-align:center">
            <div class="zTitle">
              {{this.daiban.pre_qty}}
            </div>
            <div  class="small_zi">备货中</div>
          </div>

          <div style="text-align:center; width: 100px">

            <div class="zTitle">
              {{this.daiban.shipped_qty}}
            </div>
            <div class="small_zi">运输中</div>
          </div>

          <div style="text-align:center; width: 100px">

            <div class="zTitle">
              {{this.daiban.booked_qty}}
            </div>
            <div class="small_zi">已预约</div>
          </div>

        </div>

        <div style="display: flex;padding-top: 20px">
          <div class="msg_title">
            采购管理
          </div>
          <div style="width: 100px;text-align:center">
            <div class="zTitle">
              {{this.daiban.wait_buy_num}}
            </div>
            <div  class="small_zi">待采购</div>
          </div>

          <div style="text-align:center; width: 100px">

            <div class="zTitle">
              {{this.daiban.purchased_num}}
            </div>
            <div class="small_zi">已采购</div>
          </div>

          <div style="text-align:center; width: 100px">

            <div class="zTitle">
              {{this.daiban.rec_num}}
            </div>
            <div class="small_zi">已到货</div>
          </div>

          <div style="text-align:center; width: 100px">

            <div class="zTitle">
              {{this.daiban.pack_num}}
            </div>
            <div class="small_zi">已打包</div>
          </div>

        </div>


      </el-card>
<!--      店铺信息-->
      <el-card class="small-card" shadow="never">
        <div style="display: flex;justify-content: space-between">
          <div>
            <span class="chartTitle">店铺信息</span>
            <el-select v-model="shop"
                       style="width: 300px;margin-left: 5px"
                       @change="getShopInfo" placeholder="请选择店铺">
              <el-option
                  v-for="item in shops"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id">
                <span style="float: left">{{ item.name }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{ item.nickname }}</span>
              </el-option>
            </el-select>
          </div>


          <span>
            <i class="el-icon-loading" v-if="tStockLoading"></i>
            <el-link type="info"
                     v-if="!tStockLoading"
                     @click.native="getTodayStock"
                     :underline="false"
                     icon="el-icon-refresh-right"></el-link>
          </span>
        </div>

        <el-descriptions
            style="margin-top: 10px; margin-left: 10px"
            title="" :column="1" size="medium">
          <el-descriptions-item label="负责人">{{ this.shop_info.manager }}</el-descriptions-item>
          <el-descriptions-item label="在售产品">12</el-descriptions-item>
          <el-descriptions-item label="FBM库存">{{ this.shop_info.total_qty }}</el-descriptions-item>
          <el-descriptions-item label="30天销量">212</el-descriptions-item>
          <el-descriptions-item label="30天毛利">212</el-descriptions-item>
          <el-descriptions-item label="店铺额度">21212 / 212</el-descriptions-item>

        </el-descriptions>

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
          <MelSalesCharts
              :key="timer"
              :startSaleDate="startSaleDate | dateFormat"
              :endSaleDate="endSaleDate | dateFormat"></MelSalesCharts>

        </div>
      </el-card>

    </div>
  </div>
</template>

<script>
import moment from "moment/moment";
import MelSalesCharts from "@/components/app/mercado/MelSalesCharts";

export default {
  name: "MelDashboard",
  components:{MelSalesCharts},
  data(){
    return{
      shops: [],
      shop: null,
      startSaleDate: '',
      endSaleDate: '',
      salesDate: '30d',
      timer: '',
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
      daiban:{
        'pre_qty': null,
        'shipped_qty': null,
        'booked_qty': null,
        'wait_buy_num': null,
        'purchased_num': null,
        'rec_num': null,
        'pack_num': null,
      },
      daiban_loading: false,
      shop_info:{
        'manager': null,
        'total_qty': null,
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
    //设置默认销售统计时间
    this.startSaleDate = new Date();
    this.endSaleDate = new Date();

    this.initDaiban()
    this.inintShops()
  },
  methods:{
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

    // 获取待办信息
    initDaiban(){
      this.daiban_loading = true
      this.getRequest('/api/ml_shops/get_daiban/').then(resp => {
        this.daiban_loading = false
        if (resp) {
          this.daiban.pre_qty = resp.pre_qty
          this.daiban.shipped_qty = resp.shipped_qty
          this.daiban.booked_qty = resp.booked_qty
          this.daiban.wait_buy_num = resp.wait_buy_num
          this.daiban.purchased_num = resp.purchased_num
          this.daiban.rec_num = resp.rec_num
          this.daiban.pack_num = resp.pack_num
        }
      })
    },

    // 获取店铺信息
    getShopInfo(){
      this.postRequest('/api/ml_shops/shop_info/', {'id': this.shop}).then(resp => {
        if (resp) {
          this.shop_info.manager = resp.manager
          this.shop_info.total_qty = resp.total_qty

        }
      })
    },

    inintShops(){
      //获取所有可选店铺
      if(window.sessionStorage.getItem('ml_shops')) {
        this.shops = JSON.parse(window.sessionStorage.getItem('ml_shops'));
      }else{
        let url = 'api/ml_shops/?warehouse_type=FBM&page_size=1000&ordering=create_time'

        this.getRequest(url).then(resp => {
          if (resp.results) {
            this.shops = resp.results;
            window.sessionStorage.setItem('ml_shops', JSON.stringify(this.shops));
          }
        })
      }
    },

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
  height: 300px;
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
  font-size: 18px;
  color: #008080;
}
.zTitle2 {
  font-weight: bold;
  font-size: xxx-large;
  color: #4f6782;
}
.small_zi {
  color: #8c939d;
  font-size: 12px
}
.msg_title{
  text-align: center;
  font-size: 14px;
}
</style>