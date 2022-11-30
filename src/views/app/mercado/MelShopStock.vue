/*
美客多FBM库存
*/
<template>
  <div>
    <div>
      <el-card class="small-card" shadow="never">
        <div style="display: flex;justify-content: space-between">
          <span class="chartTitle">店铺数据</span>
          <span>
            <i class="el-icon-loading" v-if="tStockLoading"></i>
            <el-link type="info"
                     v-if="!tStockLoading"
                     @click.native="getTodayStock"
                     :underline="false"
                     icon="el-icon-refresh-right"></el-link>
          </span>
        </div>

        <div style="display: flex;justify-content: space-between; padding-top: 5px">
          <div style="width: 290px;text-align:center">
            <div style="color: #6e7079;">库存</div>
            <div class="zTitle2">
              <animate-number ref="stockNum" from="0" :to="todayStockQty" :key="todayStockQty"
                              duration="1000"></animate-number>
            </div>
          </div>

          <div style="text-align:center; width: 290px">
            <div style="color: #6e7079;">占用资金</div>
            <div class="zTitle2">￥<animate-number ref="stockNum2" from="0" :to="todayStockAmount" :key="todayStockAmount"
                                                  duration="1000"></animate-number>
            </div>
          </div>

          <div style="width: 290px;text-align:center">
            <div style="color: #6e7079;">30天销量</div>
            <div class="zTitle2">
              <animate-number ref="stockNum3" from="0" :to="sold_qty" :key="sold_qty"
                              duration="1000"></animate-number>
            </div>
          </div>

          <div style="text-align:center; width: 290px">
            <div style="color: #6e7079;">30天销售额</div>
            <div class="zTitle2">$<animate-number ref="stockNum4" from="0" :to="sold_amount" :key="sold_amount"
                                                  duration="1000"></animate-number>
            </div>
          </div>

          <div style="text-align:center; width: 290px">
            <div style="color: #6e7079;">30天毛利润</div>
            <div class="zTitle2">￥<animate-number ref="stockNum5" from="0" :to="sold_profit" :key="sold_profit"
                                                  duration="1000"></animate-number>
            </div>
          </div>
        </div>
      </el-card>
    </div>
    <div class="operate">
      <div>
        <el-input size="small" placeholder="SKU 名称 ItemID UPC ML代码"
                  clearable
                  @clear="clearSearchValue"
                  @keyup.enter.native="doSearch"
                  v-model="searchValue"
                  style="width: 350px; margin-right: 5px">
          <el-button slot="append" icon="el-icon-search" @click="doSearch">搜索</el-button>
        </el-input>

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

        <el-select v-model="filter_name"
                   style="width: 150px;margin-left: 5px"
                   :disabled="!shopID"
                   @change="changeFilter" placeholder="请选择筛选项">
          <el-option
              v-for="item in filter_group"
              :key="item.name"
              :label="item.name"
              :value="item.value">
          </el-option>
        </el-select>
      </div>

      <div>
        <el-button icon="el-icon-upload"
                   style="margin-right: 10px"
                   :disabled="!shopID"
                   @click="uploadVisible=true">FBM库存导入
        </el-button>
      </div>
    </div>

    <div style="margin-top: 5px">
      <el-table
          ref="productTable"
          :data="shopStocks"
          :header-cell-style="{background:'#fafafa'}"
          v-loading="loading"
          style="width: 100%">

        <el-table-column
            label="图片"
            align="center"
            header-align="center"
            width="100">
          <template slot-scope="scope">
            <el-image
                style="width: 80px; height: 80px"
                :src="scope.row.image"
                :preview-src-list="[scope.row.image]"
                fit="fill">
            </el-image>
          </template>
        </el-table-column>

        <el-table-column
            label="产品"
            show-overflow-tooltip>
          <template slot-scope="scope">
            <div style="font-weight: bold">{{ scope.row.sku }}</div>

            <div>{{ scope.row.p_name }}</div>
          </template>
        </el-table-column>

        <el-table-column
            label="ItemID"
            show-overflow-tooltip
            width="120">
          <template slot-scope="scope">
            <div>{{ scope.row.item_id }}</div>
          </template>
        </el-table-column>

        <el-table-column
            align="center"
            header-align="center"
            label="FBM库存 | 在途 | 中转仓">
          <template slot-scope="scope">
            <span class="stock_qty">{{ scope.row.qty}}</span>
            <el-divider direction="vertical"></el-divider>
            <span class="onway_qty">{{ scope.row.onway_qty}}</span>
            <el-divider direction="vertical"></el-divider>
            <span class="zz_qty">{{ scope.row.trans_qty}}</span>
          </template>
        </el-table-column>

        <el-table-column
            label="销量">
          <template slot-scope="scope">
            <div>15天销量: <span class="zi">{{scope.row.day15_sold}} </span>
            </div>
            <div>30天销量: <span class="zi">{{scope.row.day30_sold}} </span>
            </div>
            <div>累计销量: <span class="zi">{{scope.row.total_sold}}</span></div>
          </template>
        </el-table-column>

        <el-table-column
            label="利润">
          <template slot-scope="scope">
            <div>平均毛利润: <span class="zi">{{scope.row.avg_profit | currency}} </span>
            </div>
            <div>平均毛利率: <span class="zi">{{scope.row.avg_profit_rate | rate}} </span>
            </div>
            <div>累计利润: <span class="zi">{{scope.row.total_profit | currency}}</span></div>
          </template>
        </el-table-column>

        <el-table-column
            align="center"
            header-align="center"
            label="均摊成本 | 均摊头程">
          <template slot-scope="scope">
            {{ scope.row.unit_cost | currency}}
            <el-divider direction="vertical"></el-divider>
            {{ scope.row.first_ship_cost | currency}}
          </template>
        </el-table-column>

        <el-table-column
            label="状态"
            align="center"
            header-align="center"
            width="100">
          <template slot-scope="scope">
            <el-tag size="small" effect="plain" v-if="scope.row.p_status=='NORMAL'">普通</el-tag>
            <el-tag type="success" size="small" effect="plain" v-if="scope.row.p_status=='HOT_SALE'">热卖</el-tag>
            <el-tag type="danger" size="small" effect="plain" v-if="scope.row.p_status=='OFFLINE'">停售</el-tag>
            <el-tag type="warning" size="small" effect="plain" v-if="scope.row.p_status=='CLEAN'">清仓</el-tag>
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
            :total="total">
        </el-pagination>
      </div>
    </div>

    <!--    批量上传弹窗-->
    <el-dialog
        title="批量上传"
        :visible.sync="uploadVisible"
        :destroy-on-close="true"
        :close-on-click-modal="false"
        width="500px"
    >
      <div>
        <el-upload
            v-loading="loading"
            style="margin-left: 50px;"
            ref="upload"
            name="excel"
            :data="{'id': this.shopID}"
            :headers="headers"
            :on-success="onSuccess"
            :auto-upload="false"
            :before-upload="beforeUpload"
            :limit="1"
            drag
            action="api/ml_shopstock/fbm_upload/">
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div class="el-upload__tip" slot="tip">只能上传excel文件,
            <el-link href="/media/template/ml_products_upload_ template.xlsx" target="_blank">模板下载</el-link>
          </div>
        </el-upload>

      </div>
      <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="uploadVisible = false">取 消</el-button>
          <el-button size="small" type="primary" @click="submitUpload">开始导入</el-button>
        </span>
    </el-dialog>

  </div>
</template>

<script>
import moment from "moment/moment";

export default {
  name: "MelShopStock",
  data(){
    return{
      shops: null,
      shopID: null,
      shopStocks: null,
      loading: false,
      total: 0, // 总条数
      page: 1,  // 当前页
      size: 20,  // 页大小
      searchValue: '',
      uploadVisible: false,
      sort: '', //排序变量
      filter_name: null, // 库存筛选
      tStockLoading: false,
      todayStockQty: 0, // 今日库存量
      sold_qty: 0, // 30天销量
      todayStockAmount: 0.0, // 今日库存金额
      sold_amount: 0.0, // 30天销量额
      sold_profit: 0.0, // 30天毛利润
      filter_group: [
        {
          name: '全部产品',
          value: ''
        },
        {
          name: '有货产品',
          value: '&qty__gt=0'
        },
        {
          name: '缺货产品',
          value: '&qty__lte=0'
        },
        {
          name: '在途产品',
          value: '&onway_qty__gt=0'
        },
        {
          name: '中转仓有货产品',
          value: '&trans_qty__gt=0'
        },
      ],
      // 批量上传认证
      headers: {
        Authorization: window.localStorage.getItem('tokenStr'),
      },
    }
  },
  filters: {
    //时间日期格式化
    date: function (value) {
      return moment(value).format("YYYY-MM-DD");
    },
    //rmb金额格式化
    currency: function (value) {
      if (!value) return 0.00;
      return `¥${value.toFixed(2)}`;
    },
    //rmb金额格式化
    rate: function (value) {
      if (!value) return 0;
      value = value * 100
      return `${value.toFixed(1)}%`;
    },
  },
  mounted() {
    this.inintShops();
    this.getTodayStock() // 计算库存
  },
  methods:{
    // 型号上传前的回调
    beforeUpload() {
      this.loading = true;
    },
    // 上传成功之后的回调
    onSuccess(response, file, fileList) {
      this.loading = false;
      this.$refs.upload.clearFiles();
      this.initShopStock();
      this.uploadVisible = false;
    },
    // 上传
    submitUpload() {
      this.$refs.upload.submit();
    },

    // 重置搜索内容
    clearSearchValue() {
      this.searchValue = '';
      this.initShopStock();
    },
    // 搜索
    doSearch() {
      this.page = 1;
      this.$refs.productTable.clearFilter();
      this.initShopStock();
    },
    // 分页大小
    sizeChange(size) {
      this.page = 1;
      this.size = size;
      this.initShopStock();
    },
    // 页码
    currentChange(page) {
      this.page = page;
      this.initShopStock();
    },
    //改变筛选动作
    changeFilter(){
      this.page = 1;
      this.initShopStock();
    },
    //改变店铺动作
    changeShop(){
      this.page = 1;
      this.filter_name = ''
      this.initShopStock();
      this.getTodayStock() // 计算库存
    },

    //获取今日库存
    getTodayStock() {
      this.tStockLoading = true
      let url = 'api/ml_shopstock/calc_stock/'
      this.postRequest(url, {'id': this.shopID}).then(resp => {
        this.tStockLoading = false
        if (resp) {
          this.todayStockQty = resp.todayStockQty
          this.todayStockAmount = resp.todayStockAmount
          this.sold_qty = resp.sold_qty
          this.sold_amount = resp.sold_amount
          this.sold_profit = resp.sold_profit
          this.$nextTick(() => {
            this.$refs.stockNum.start()
            this.$refs.stockNum2.start()
            this.$refs.stockNum3.start()
            this.$refs.stockNum4.start()
            this.$refs.stockNum5.start()
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
        this.filter_name = ''
        this.initShopStock()
      }
    },
    initShopStock(){
      let url = '/api/ml_shopstock/?shop=' + this.shopID + '&page=' + this.page + '&page_size=' + this.size
      if (this.searchValue) {
        url += '&search=' + this.searchValue;
      }
      if (this.filter_name) {
        url += this.filter_name;
      }
      url += '&ordering=' + this.sort + ',item_id'

      this.loading = true
      this.getRequest(url).then(resp => {
        this.loading = false
        if (resp.results) {
          this.shopStocks = resp.results;
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
.stock_qty {
  font-weight: bold;
  color: teal;
}
.onway_qty {
  font-weight: bold;
  color: #E6A23C;
}
.zz_qty {
  font-weight: bold;
  color: cornflowerblue;
}
.small-card {
  width: 99%;
  height: 130px;
  margin-left: 5px;
  margin-right: 5px;
  margin-bottom: 10px;
}
.chartTitle {
  font-weight: bold;
  margin-right: 20px
}
.zTitle2 {
  font-weight: bold;
  font-size: 30px;
  color: #4f6782;
}
</style>