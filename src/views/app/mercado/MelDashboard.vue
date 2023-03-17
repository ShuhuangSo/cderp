<template>
  <div class="baseContainer">

    <div class="pContainer">
      <div class="main-card-big"  shadow="never" v-if="daiban.all_product_incomplete">
        <el-alert
            title="信息不完整"
            type="warning"
            effect="dark"
            description="产品库部分产品信息不完整，请及时处理！"
            show-icon>
        </el-alert>
      </div>

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

        <div style="display: flex;padding-top: 10px" v-if="permission.dashboard_ship">
          <div class="msg_title">
            发货运单
          </div>
          <div style="width: 100px;text-align:center">
            <div >
              <el-link
                  @click.native="goDetail('ship', 'PREPARING')"
                  :underline="false">
                <span class="zTitle">{{this.daiban.pre_qty}}</span>
              </el-link>
            </div>
            <div  class="small_zi">备货中</div>
          </div>

          <div style="text-align:center; width: 100px">
            <div>
              <el-link
                  @click.native="goDetail('ship', 'SHIPPED')"
                  :underline="false">
                <span class="zTitle">{{this.daiban.shipped_qty}}</span>
              </el-link>
            </div>
            <div class="small_zi">运输中</div>
          </div>

          <div style="text-align:center; width: 100px">
            <div>
              <el-link
                  @click.native="goDetail('ship', 'BOOKED')"
                  :underline="false">
                <span class="zTitle">{{this.daiban.booked_qty}}</span>
              </el-link>
            </div>
            <div class="small_zi">已预约</div>
          </div>

        </div>



        <div style="display: flex;padding-top: 20px"  v-if="permission.dashboard_purchase">
          <div class="msg_title">
            采购管理
          </div>
          <div style="width: 100px;text-align:center">
            <div>
              <el-link
                  @click.native="goDetail('purchase', 'WAITBUY')"
                  :underline="false">
                <span class="zTitle">{{this.daiban.wait_buy_num}}</span>
              </el-link>

            </div>
            <div  class="small_zi">待采购</div>
          </div>

          <div style="text-align:center; width: 100px">

            <div>
              <el-link
                  @click.native="goDetail('purchase', 'PURCHASED')"
                  :underline="false">
                <span class="zTitle">{{this.daiban.purchased_num}}</span>
              </el-link>
            </div>
            <div class="small_zi">已采购</div>
          </div>

          <div style="text-align:center; width: 100px">

            <div>
              <el-link
                  @click.native="goDetail('purchase', 'RECEIVED')"
                  :underline="false">
                <span class="zTitle">{{this.daiban.rec_num}}</span>
              </el-link>

            </div>
            <div class="small_zi">已到货</div>
          </div>

          <div style="text-align:center; width: 100px">

            <div>
              <el-link
                  @click.native="goDetail('purchase', 'PACKED')"
                  :underline="false">
                <span class="zTitle">{{this.daiban.pack_num}}</span>
              </el-link>

            </div>
            <div class="small_zi">已打包</div>
          </div>

        </div>

        <div style="display: flex;padding-top: 20px" v-if="daiban.overtime_ship || daiban.need_book || daiban.income_confirm">
          <div class="msg_title">
            操作提醒
          </div>
          <div style="width: 100px;text-align:center" v-if="daiban.need_book">
            <div>
              <el-link
                  @click.native="goDetail('ship', 'SHIPPED')"
                  :underline="false">
                <span class="zTitle_2">{{this.daiban.need_book}}</span>
              </el-link>

            </div>
            <div  class="small_zi">需预约</div>
          </div>

          <div style="width: 100px;text-align:center" v-if="daiban.overtime_ship">
            <div>
              <el-link
                  @click.native="goDetail('ship', 'BOOKED')"
                  :underline="false">
                <span class="zTitle_2">{{this.daiban.overtime_ship}}</span>
              </el-link>

            </div>
            <div  class="small_zi">入仓核对</div>
          </div>

          <div style="width: 100px;text-align:center" v-if="daiban.income_confirm">
            <div>
              <el-link
                  @click.native="goDetail('finance', '')"
                  :underline="false">
                <span class="zTitle_2">{{this.daiban.income_confirm}}</span>
              </el-link>

            </div>
            <div  class="small_zi">提现待确认</div>
          </div>

        </div>

        <div style="display: flex;padding-top: 20px">
          <div class="msg_title">
            快捷入口
          </div>
          <div style="width: 100px;text-align:center">
            <div>
              <el-link
                  @click.native="goDetail('product', '')"
                  :underline="false">
                <span style="font-size: 20px"><i class="el-icon-goods"></i></span>
              </el-link>
            </div>
            <div  class="small_zi">产品库</div>
          </div>

          <div style="width: 100px;text-align:center">
            <div>
              <el-link
                  @click.native="goDetail('orders', '')"
                  :underline="false">
                <span style="font-size: 20px"><i class="el-icon-tickets"></i></span>
              </el-link>
            </div>
            <div  class="small_zi">销售订单</div>
          </div>

          <div style="width: 100px;text-align:center">
            <div>
              <el-link
                  @click.native="goDetail('finance', '')"
                  :underline="false">
                <span style="font-size: 20px"><i class="el-icon-money"></i></span>
              </el-link>
            </div>
            <div  class="small_zi">财务管理</div>
          </div>

          <div style="width: 100px;text-align:center">
            <div>
              <el-link
                  @click.native="goDetail('upc', '')"
                  :underline="false">
                <span style="font-size: 20px"><i class="el-icon-postcard"></i></span>
              </el-link>
            </div>
            <div  class="small_zi">UPC号码</div>
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
            <i class="el-icon-loading" v-if="shop_info_loading"></i>
            <el-link type="info"
                     v-if="!shop_info_loading"
                     @click.native="getShopInfo"
                     :underline="false"
                     icon="el-icon-refresh-right"></el-link>
          </span>
        </div>

        <el-descriptions
            style="margin-top: 15px; margin-left: 10px"
            title="" :column="1" size="medium">
          <el-descriptions-item label="负责人">{{ this.shop_info.manager }}</el-descriptions-item>
          <el-descriptions-item label="在售产品">{{ this.shop_info.total_sku }}</el-descriptions-item>
          <el-descriptions-item label="FBM库存">{{ this.shop_info.total_qty }}</el-descriptions-item>
          <el-descriptions-item label="库存金额">{{ this.shop_info.total_amount | currency }}</el-descriptions-item>
          <el-descriptions-item label="店铺额度">￥ {{ this.shop_info.used_quota | q_currency }} / {{ this.shop_info.quota | q_currency }}</el-descriptions-item>
        </el-descriptions>

      </el-card>
<!--      销量统计-->
      <el-card class="main-card-big" shadow="never"  v-if="permission.dashboard_saleChart">
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
          <span style="margin-left: 10px">
            <el-link type="info"
                     @click.native="timer = new Date().getTime()"
                     :underline="false"
                     icon="el-icon-refresh-right"></el-link>
          </span>
          <MelSalesCharts
              :key="timer"
              :startSaleDate="startSaleDate | dateFormat"
              :endSaleDate="endSaleDate | dateFormat"></MelSalesCharts>

        </div>
      </el-card>

<!--      收支管理-->
      <el-card class="main-card-big" shadow="never" v-if="permission.dashboard_shopFinance">
        <div class="main-win-big">
          <span class="chartTitle">收支管理</span>

          <MelShopFinance
              :key="timer"
              :startSaleDate="startSaleDate | dateFormat"
              :endSaleDate="endSaleDate | dateFormat"></MelShopFinance>

        </div>
      </el-card>

    </div>
  </div>
</template>

<script>
import moment from "moment/moment";
import MelSalesCharts from "@/components/app/mercado/MelSalesCharts";
import MelShopFinance from "@/components/app/mercado/MelShopFinance";

export default {
  name: "MelDashboard",
  components:{MelSalesCharts, MelShopFinance},
  data(){
    return{
      user: JSON.parse(window.sessionStorage.getItem('user')),
      permission: JSON.parse(window.sessionStorage.getItem('ml_permission')),
      shops: [],
      shop: null,
      startSaleDate: '',
      endSaleDate: '',
      salesDate: '15d',
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
        'overtime_ship': null,
        'need_book': null,
        'income_confirm': null,
        'all_product_incomplete': null,
      },
      daiban_loading: false,
      shop_info_loading: false,
      shop_info:{
        'manager': null,
        'total_sku': null,
        'total_qty': null,
        'total_amount': null,
        'quota': null,
        'used_quota': null,
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
      return `¥ ${value.toFixed(0)}`;
    },
    //金额格式化
    q_currency: function (value) {
      if (!value) return 0.00;
      return `${value.toFixed(0)}`;
    },
  },
  mounted() {
    //设置默认销售统计时间
    this.startSaleDate = new Date(new Date().getTime() - 3600 * 1000 * 24 * 15);
    this.endSaleDate = new Date();

    this.initDaiban()
    this.inintShops()
  },
  methods:{
    //路由到详情页面
    goDetail(activeName, partName){
      if (activeName === 'upc') {
        this.$router.push({
          path: '/melUPCMange',
        });
      } else {
        this.$router.push({
          path: '/melManage',
          query: {
            partName: partName,
            activeName: activeName,
          }
        });
      }

    },
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
          this.daiban.overtime_ship = resp.overtime_ship
          this.daiban.need_book = resp.need_book
          this.daiban.income_confirm = resp.income_confirm
          this.daiban.all_product_incomplete = resp.all_product_incomplete
        }
      })
    },

    // 获取店铺信息
    getShopInfo(){
      this.shop_info_loading = true
      this.postRequest('/api/ml_shops/shop_info/', {'id': this.shop}).then(resp => {
        this.shop_info_loading = false
        if (resp) {
          this.shop_info.manager = resp.manager
          this.shop_info.total_sku = resp.total_sku
          this.shop_info.total_qty = resp.total_qty
          this.shop_info.total_amount = resp.total_amount
          this.shop_info.quota = resp.quota
          this.shop_info.used_quota = resp.used_quota

        }
      })
    },

    inintShops(){
      //获取所有可选店铺
      if(window.sessionStorage.getItem('ml_shops')) {
        this.shops = JSON.parse(window.sessionStorage.getItem('ml_shops'));

        if (this.shops.length) {
          this.shop = this.shops[0].id
          this.getShopInfo()
        }
      }else{
        let url = 'api/ml_shops/?warehouse_type=FBM&page_size=1000&ordering=create_time'
        if (!this.user.is_superuser) {
          url += '&user=' + this.user.id;
        }
        this.getRequest(url).then(resp => {
          if (resp.results) {
            this.shops = resp.results;
            window.sessionStorage.setItem('ml_shops', JSON.stringify(this.shops));

            if (this.shops.length) {
              this.shop = this.shops[0].id
              this.getShopInfo()
            }
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
  border-radius: 15px;
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
.main-win-big {
  height: 400px;
  padding-bottom: 10px;
}

.main-card-big {
  border-radius: 15px;
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
.zTitle_2 {
  font-weight: bold;
  font-size: 18px;
  color: red;
}
.small_zi {
  color: #8c939d;
  font-size: 12px
}
.msg_title{
  text-align: center;
  font-size: 14px;
  padding-top: 10px;
}
</style>