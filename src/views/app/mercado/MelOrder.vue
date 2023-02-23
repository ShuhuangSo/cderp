/*
美客多FBM--销售订单
*/
<template>
  <div>

    <div class="operate">
      <div>
        <el-input size="small" placeholder="SKU 名称 ItemID 订单编号"
                  clearable
                  @clear="clearSearchValue"
                  @keyup.enter.native="doSearch"
                  v-model="searchValue"
                  style="width: 350px; margin-right: 5px">
          <el-button slot="append" icon="el-icon-search" @click="doSearch">搜索</el-button>
        </el-input>

        <el-select v-model="shopID"
                   style="width: 300px;margin-right: 50px"
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

        <span>筛选：</span>
        <el-date-picker
            v-model="cus_date"
            :editable="false"
            :clearable="false"
            type="daterange"
            align="right"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            style="width: 250px"
            @change="changeFilter"
            :picker-options="pickerOptions">
        </el-date-picker>

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

        <el-link type="info"
                 style="margin-left: 10px"
                 @click.native="showChart"
                 :underline="false"
                 icon="el-icon-s-data"></el-link>

      </div>

      <div>
        <el-button icon="el-icon-upload"
                   style="margin-right: 10px"
                   :disabled="!shopID"
                   @click="uploadVisible=true">销售订单导入
        </el-button>
      </div>
    </div>

    <div style="margin-top: 5px">
      <el-table
          ref="orderTable"
          :data="orders"
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
                style="width: 70px; height: 70px"
                :src="scope.row.image | smpic"
                :preview-src-list="[scope.row.image?scope.row.image+'?' + Math.random():'']"
                fit="fill">
            </el-image>
          </template>
        </el-table-column>

        <el-table-column
            label="产品"
            show-overflow-tooltip>
          <template slot-scope="scope">
            <div style="font-weight: bold">{{ scope.row.sku }}
              <el-link @click.native="copyText(scope.row.sku)"
                       style="margin-bottom: 3px"
                       :underline="false"><i class="el-icon-copy-document"></i></el-link>
            </div>

            <div>{{ scope.row.p_name }}</div>
            <div>{{ scope.row.item_id }}
              <el-link :href="scope.row.sale_url"
                       title="查看平台链接"
                       :underline="false" target="_blank"><i class="el-icon-link"></i></el-link>
              <el-link @click.native="selectItemID(scope.row.item_id)"
                       style="margin-left: 5px"
                       title="筛选当前ItemID"
                       :underline="false"><i class="el-icon-connection"></i></el-link>
              <el-link @click.native="copyText(scope.row.item_id)"
                       style="margin-left: 5px"
                       title="复制"
                       :underline="false"><i class="el-icon-copy-document"></i></el-link>
            </div>
          </template>
        </el-table-column>

        <el-table-column
            label="订单号"
            width="150">
          <template slot-scope="scope">
            <div>{{ scope.row.order_number }}</div>
            <el-tag v-if="scope.row.is_ad" type="warning" size="mini" effect="dark">广告</el-tag>
            <el-tag v-if="scope.row.order_status!=='FINISHED'"
                    style="margin-left: 5px"
                    type="danger" size="mini" effect="dark">
              {{ scope.row.order_status | status }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column
            label="数量"
            align="center"
            header-align="center"
            width="80">
          <template slot-scope="scope">
            <div>{{ scope.row.qty }}</div>
          </template>
        </el-table-column>

        <el-table-column
            label="币种"
            align="center"
            header-align="center"
            width="50">
          <template slot-scope="scope">
            <div>{{ scope.row.currency }}</div>
          </template>
        </el-table-column>

        <el-table-column
            label="售价"
            align="center"
            header-align="center"
            width="80">
          <template slot-scope="scope">
            <div>{{ scope.row.price }}</div>
          </template>
        </el-table-column>

        <el-table-column
            label="佣金"
            align="center"
            header-align="center"
            width="80">
          <template slot-scope="scope">
            <div>{{ scope.row.fees }}</div>
          </template>
        </el-table-column>

        <el-table-column
            label="运费"
            align="center"
            header-align="center"
            width="80">
          <template slot-scope="scope">
            <div>{{ scope.row.postage }}</div>
          </template>
        </el-table-column>

        <el-table-column
            label="收入"
            align="center"
            header-align="center"
            width="80">
          <template slot-scope="scope">
            <div>{{ scope.row.receive_fund }}</div>
          </template>
        </el-table-column>

        <el-table-column
            label="毛利润"
            align="center"
            header-align="center"
            width="120">
          <template slot-scope="scope">
            <div v-if="scope.row.profit > 0" class="positive">{{ scope.row.profit | currency}}</div>
            <div v-if="scope.row.profit <= 0" class="negitive">{{ scope.row.profit | currency}}</div>
          </template>
        </el-table-column>

        <el-table-column
            label="毛利率"
            align="center"
            header-align="center"
            width="120">
          <template slot-scope="scope">
            <div v-if="scope.row.profit_rate > 0" class="positive">{{ scope.row.profit_rate | rate}}</div>
            <div v-if="scope.row.profit_rate <= 0" class="negitive">{{ scope.row.profit_rate | rate}}</div>
          </template>
        </el-table-column>

        <el-table-column
            label="订单日期(本土)"
            align="center"
            header-align="center"
            width="150">
          <template slot-scope="scope">
            <div :title="scope.row.order_time_bj | bjdate">{{ scope.row.order_time | date}}</div>
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
            action="api/ml_orders/bulk_upload/">
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div class="el-upload__tip" slot="tip">只能上传excel文件,
            <el-link href="/media/template/mercado_order_template.xlsx" target="_blank">模板下载</el-link>
          </div>
        </el-upload>

      </div>
      <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="uploadVisible = false">取 消</el-button>
          <el-button size="small" type="primary" :disabled="loading" @click="submitUpload">开始导入</el-button>
        </span>
    </el-dialog>

    <!--    图表弹窗-->
    <el-dialog
        title="销售图表"
        :visible.sync="chartVisible"
        :destroy-on-close="true"
        :close-on-click-modal="false"
        width="80%"
    >
      <el-select v-model="chartType"
                 @change="changeChartType"
                 size="mini" placeholder="请选择">
        <el-option
            v-for="item in chart_options"
            :key="item.value"
            :label="item.label"
            :value="item.value">
        </el-option>
      </el-select>
      <div class="chart">
        <MelSaleChart
            :key="timer"
            :shop="shopID"
            :chartType="chartType"
        :startSaleDate="start_date | dateFormat"
        :endSaleDate="end_date | dateFormat"></MelSaleChart>

      </div>
      <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="chartVisible = false">关 闭</el-button>
        </span>
    </el-dialog>

  </div>
</template>

<script>
import moment from "moment";
import MelSaleChart from "@/views/app/mercado/MelSaleChart";

export default {
  name: "MelOrder",
  components: {MelSaleChart},
  data(){
    return{
      user: JSON.parse(window.sessionStorage.getItem('user')),
      orders: [],
      shops: null,
      shopID: null,
      loading: false,
      total: 0, // 总条数
      page: 1,  // 当前页
      size: 20,  // 页大小
      searchValue: '',
      uploadVisible: false,
      chartVisible: false,
      timer: '',
      // 批量上传认证
      headers: {
        Authorization: window.localStorage.getItem('tokenStr'),
      },
      cus_date: '', // 订单日期筛选
      start_date: '', // 订单日期筛选
      end_date: '', // 订单日期筛选
      pickerOptions: {
        shortcuts: [{
          text: '昨天',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 1);
            end.setTime(end.getTime() - 3600 * 1000 * 24 * 1);
            picker.$emit('pick', [start, end]);
          }
        },
          {
            text: '最近一周',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          },
          {
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
      filter_name: '', // 库存筛选
      filter_group: [
        {
          name: '全部订单',
          value: ''
        },
        {
          name: '有广告',
          value: '&is_ad=True'
        },
        {
          name: '无广告',
          value: '&is_ad=False'
        },
        {
          name: '退货订单',
          value: '&order_status=RETURN'
        },
        {
          name: 'CASE',
          value: '&order_status=CASE'
        },
        {
          name: '取消订单',
          value: '&order_status=CANCEL'
        },
        {
          name: '完成订单',
          value: '&order_status=FINISHED'
        },
      ],
      chart_options: [{
        value: 'ORDER',
        label: '订单图表'
      }, {
        value: 'AMOUNT',
        label: '销售额图表'
      }, {
        value: 'PROFIT',
        label: '毛利润图表'
      }],
      chartType: 'ORDER',
    }
  },
  filters: {
    //时间日期格式化
    date: function (value) {
      return moment(value).format("YYYY-MM-DD HH:mm");
    },
    //时间日期格式化
    dateFormat: function (value) {
      if (value === '') return value
      return moment(value).format("YYYY-MM-DD");
    },
    //时间日期格式化
    bjdate: function (value) {
      return '北京时间' + moment(value).format("YYYY-MM-DD HH:mm");
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
    //订单状态格式化
    status: function (value) {
      if (value==='RETURN') return '退货';
      if (value==='CASE') return 'CASE';
      if (value==='CANCEL') return '取消';
    },
    //图片地址格式化
    smpic: function (value) {
      if (!value) return '';
      let url = value.slice(0, value.length-4)
      return url + '_100x100.jpg/?' + Math.random()
    },
  },
  mounted() {
    //设置默认订单统计时间
    this.startSaleDate = new Date();
    this.endSaleDate = new Date();
    this.startSaleDate.setTime(this.startSaleDate.getTime() - 3600 * 1000 * 24 * 30);

    this.cus_date = [this.startSaleDate, this.endSaleDate]

    this.inintShops();
  },
  methods:{
    //打开图表
    showChart(){
      this.timer = new Date().getTime();
      this.chartVisible = true
    },
    //快速筛选itemID
    selectItemID(item_id){
      this.page = 1;
      this.searchValue = item_id
      this.initOrders();
    },
    //点击复制
    copyText(value){
      let text = value;
      if (navigator.clipboard) {
        // clipboard api 复制
        navigator.clipboard.writeText(text);
      } else {
        let textarea = document.createElement('textarea');
        document.body.appendChild(textarea);
        // 隐藏此输入框
        textarea.style.position = 'fixed';
        textarea.style.clip = 'rect(0 0 0 0)';
        textarea.style.top = '10px';
        // 赋值
        textarea.value = text;
        // 选中
        textarea.select();
        // 复制
        document.execCommand('copy', true);
        // 移除输入框
        document.body.removeChild(textarea);
      }
      this.$message.success('已复制！')
    },
    // 型号上传前的回调
    beforeUpload() {
      this.loading = true;
    },
    // 上传成功之后的回调
    onSuccess(response, file, fileList) {
      this.loading = false;
      this.$refs.upload.clearFiles();
      this.initOrders();
      this.uploadVisible = false;
    },
    // 上传
    submitUpload() {
      this.$refs.upload.submit();
    },

    //改变店铺动作
    changeShop(){
      this.page = 1;
      this.initOrders();
    },
    //改变筛选动作
    changeFilter(){
      this.page = 1;
      this.initOrders();
    },

    // 重置搜索内容
    clearSearchValue() {
      this.searchValue = '';
      this.initOrders();
    },
    // 搜索
    doSearch() {
      this.page = 1;
      this.$refs.orderTable.clearFilter();
      this.initOrders();
    },
    // 分页大小
    sizeChange(size) {
      this.page = 1;
      this.size = size;
      this.initOrders();
    },
    // 页码
    currentChange(page) {
      this.page = page;
      this.initOrders();
    },

    inintShops(){
      //获取所有可选店铺
      if(window.sessionStorage.getItem('ml_shops')) {
        this.shops = JSON.parse(window.sessionStorage.getItem('ml_shops'));
      }else{
        let url = 'api/ml_shops/?warehouse_type=FBM&page_size=1000&ordering=create_time'
        if (!this.user.is_superuser) {
          url += '&user=' + this.user.id;
        }
        this.getRequest(url).then(resp => {
          if (resp.results) {
            this.shops = resp.results;
            window.sessionStorage.setItem('ml_shops', JSON.stringify(this.shops));
          }
        })
      }
      if (this.shops.length) {
        this.shopID = this.shops[0].id
        this.initOrders()
      }
    },

    initOrders(){
      let url = '/api/ml_orders/?shop=' + this.shopID + '&page=' + this.page + '&page_size=' + this.size
      if (this.searchValue) {
        url += '&search=' + this.searchValue;
      }
      if (this.filter_name) {
        url += this.filter_name;
      }

      this.start_date =String(moment(this.cus_date[0]).format("YYYY-MM-DD"))+' 00:00:00'
      this.end_date = String(moment(this.cus_date[1]).format("YYYY-MM-DD"))+' 23:59:59'

      url += '&order_time__gte='+ this.start_date + '&order_time__lte=' + this.end_date
      url += '&ordering=-order_time'

      this.loading = true
      this.getRequest(url).then(resp => {
        this.loading = false
        if (resp.results) {
          this.orders = resp.results;
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
.positive {
  font-weight: bold;
  color: green;
}
.negitive {
  font-weight: bold;
  color: #aa0515;
}
.chart{
  height: 500px;
}
</style>