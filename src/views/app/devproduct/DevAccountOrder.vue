<template>
  <div>
    <el-table
        ref="orderTable"
        :header-cell-style="{background:'#eef1f6'}"
        :data="orders"
        border
        size="mini"
        style="width: 98%; margin: 10px">
      <el-table-column
          align="center"
          header-align="center"
          width="130"
          label="账号">
        <template slot-scope="scope">
          <div>{{scope.row.account_name}}</div>

        </template>
      </el-table-column>
      <el-table-column
          prop="user_name"
          align="center"
          header-align="center"
          width="80"
          label="负责人">
      </el-table-column>

      <el-table-column
          label="订单号/产品链接"
          min-width="220"
          show-overflow-tooltip>
        <template slot-scope="scope">
          <div>
            {{scope.row.order_number}}
            <el-tag v-if="!scope.row.is_settled"
                    style="margin-left: 5px"
                    type="warning"
                    size="mini">
              待结算</el-tag>
            <el-tag v-if="scope.row.is_combined"
                    style="margin-left: 5px"
                    type=""
                    size="mini">
              合并</el-tag>
            <el-tag v-if="scope.row.is_resent"
                    style="margin-left: 5px"
                    type="danger"
                    size="mini">
              重发</el-tag>
          </div>
          <div class="gray_zi">
            {{ scope.row.platform }}
            <el-divider direction="vertical"></el-divider>
            {{ scope.row.site }}
            <el-divider direction="vertical"></el-divider>
            {{ scope.row.item_id }}
            <el-link :href="scope.row.sale_url"
                     title="查看平台链接"
                     :underline="false" target="_blank"><i class="el-icon-link"></i></el-link>

          </div>
        </template>
      </el-table-column>

      <el-table-column
          label="数量"
          align="center"
          header-align="center"
          width="60">
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
          <div>{{ scope.row.item_price }}</div>
        </template>
      </el-table-column>
      <el-table-column
          label="收取运费"
          align="center"
          header-align="center"
          width="80">
        <template slot-scope="scope">
          <div>{{ scope.row.postage_price }}</div>
        </template>
      </el-table-column>
      <el-table-column
          label="总价"
          align="center"
          header-align="center"
          width="80">
        <template slot-scope="scope">
          <div>{{ scope.row.total_price }}</div>
        </template>
      </el-table-column>

      <el-table-column
          label="毛利润"
          align="center"
          header-align="center"
          width="80">
        <template slot-scope="scope">
          <div v-if="scope.row.profit > 0" class="positive">{{ scope.row.profit | currency}}</div>
          <div v-if="scope.row.profit <= 0" class="negitive">{{ scope.row.profit | currency}}</div>
        </template>
      </el-table-column>

      <el-table-column
          label="毛利率"
          align="center"
          header-align="center"
          width="80">
        <template slot-scope="scope">
          <div v-if="scope.row.profit_rate > 0" class="positive">{{ scope.row.profit_rate | rate}}</div>
          <div v-if="scope.row.profit_rate <= 0" class="negitive">{{ scope.row.profit_rate | rate}}</div>
        </template>
      </el-table-column>

      <el-table-column
          label="订单日期"
          align="center"
          header-align="center"
          width="100">
        <template slot-scope="scope">
          {{scope.row.order_time | date}}
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
</template>

<script>
import moment from "moment";

export default {
  name: "DevAccountOrder",
  props: ['productID'],
  data(){
    return{
      loading: false,
      total: 0, // 总条数
      page: 1,  // 当前页
      size: 20,  // 页大小
      searchValue: '',
      orders: [],
    }
  },
  filters:{
    //百分比格式化
    status: function (value) {
      if (value) return '已结算'
      return '未结算'
    },
    //百分比格式化
    rate: function (value) {
      if (!value) return 0;
      value = value * 100
      return `${value.toFixed(1)}%`;
    },
    //rmb金额格式化
    currency: function (value) {
      if (!value) return 0.00;
      return `¥ ${value.toFixed(2)}`;
    },
    //rmb金额格式化
    f_currency: function (value) {
      if (!value) return `$ 0.00`;
      if (value < 0) return `-$ ${Math.abs(value).toFixed(2)}`;
      return `$ ${value.toFixed(2)}`;
    },
    //时间日期格式化
    date: function (value) {
      return moment(value).format("YYYY-MM-DD");
    },
    //图片地址格式化
    smpic: function (value) {
      if (!value) return '';
      let url = value.slice(0, value.length-4)
      return url + '_100x100.jpg/?' + Math.random()
    },
  },
  mounted() {
    this.initOrders()
  },
  methods:{
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
    initOrders(){
      let url = '/api/dev_order/?page=' + this.page + '&page_size=' + this.size
      if (this.searchValue) {
        url += '&search=' + this.searchValue;
      }
      if (this.productID) {
        url += '&dev_p_id=' + this.productID;
      }
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
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}
.operate {
  margin-top: 10px;
  margin-left: 10px;
  margin-right: 20px;
  display: flex;
  justify-content: space-between;
}
.positive {
  font-weight: bold;
  color: green;
}
.negitive {
  font-weight: bold;
  color: #aa0515;
}
.gray_zi{
  color: #99a9bf;
}
</style>