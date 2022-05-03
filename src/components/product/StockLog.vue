<template>
  <div>
    <el-table
        :header-cell-style="{background:'#eef1f6'}"
        :data="stockLogs"
        border
        size="mini"
        v-loading="loading"
        style="width: 98%; margin: 10px">

      <el-table-column
          prop="store_name"
          align="center"
          header-align="center"
          label="店铺">
      </el-table-column>
      <el-table-column
          align="center"
          header-align="center"
          label="类型">
        <template slot-scope="scope">
          <span>{{scope.row.op_type | type}}</span>
        </template>
      </el-table-column>
      <el-table-column
          prop="qty"
          align="center"
          header-align="center"
          label="数量">
        <template slot-scope="scope">
          <span v-if="scope.row.op_type==='M_IN'" style="color: green;font-weight: bold">+ {{scope.row.qty}}</span>
          <span v-if="scope.row.op_type==='B_IN'" style="color: green;font-weight: bold">+ {{scope.row.qty}}</span>
          <span v-if="scope.row.op_type==='M_OUT' || scope.row.op_type==='S_OUT'" style="color: #b80303;font-weight: bold">- {{scope.row.qty}}</span>
          <span v-if="scope.row.op_type==='UNLOCK'" style="color: green;font-weight: bold"><i class="el-icon-unlock"></i> {{scope.row.qty}}</span>
          <span v-if="scope.row.op_type==='LOCK'" style="color: #b80303;font-weight: bold"><i class="el-icon-lock"></i> {{scope.row.qty}}</span>
        </template>
      </el-table-column>
      <el-table-column
          align="center"
          header-align="center"
          label="批次号">
        <template slot-scope="scope">
          <el-button type="text" @click="goBatchDetail(scope.row)">{{ scope.row.op_batch_number }}</el-button>
        </template>
      </el-table-column>
      <el-table-column
          prop="username"
          align="center"
          header-align="center"
          label="操作人"
          width="180">
      </el-table-column>
      <el-table-column
          prop="create_time"
          align="center"
          header-align="center"
          label="操作时间"
          :formatter="datetimeFormat"
          width="180">
      </el-table-column>

    </el-table>
    <el-pagination
        background
        :hide-on-single-page="true"
        :page-sizes="[20, 30, 40, 50, 100]"
        @current-change="opCurrentChange"
        @size-change="opSizeChange"
        layout="sizes, prev, pager, next, jumper, ->, total"
        :total="opTotal">
    </el-pagination>
  </div>
</template>

<script>
import moment from "moment";

export default {
  name: "StockLog",
  props: ['obj'],
  data(){
    return{
      stockLogs: [],
      loading: false,
      opTotal: 0, // 日志总条数
      opPage: 1,  // 日志当前页
      opSize: 20,  // 日志页大小
    }
  },
  filters: {
    //信息格式化
    type: function (value) {
      if (value==='LOCK') return '锁仓';
      if (value==='UNLOCK') return '解锁';
      if (value==='S_OUT') return '销售出库';
      if (value==='M_OUT') return '手工出库';
      if (value==='M_IN') return '手工入库';
      if (value==='B_IN') return '采购入库';
    },
  },
  mounted() {
    this.initLog();
  },
  methods:{
    //跳转到批次详情
    goBatchDetail(row){
      if (row.op_type==='M_IN' || row.op_type==='M_OUT'){
        let routeUrl = this.$router.resolve({
          path: "/stockInoutView",
          query: {id:row.op_origin_id}
        });
        window.open(routeUrl.href, '_blank');
      }
      if (row.op_type==='S_OUT' || row.op_type==='LOCK' || row.op_type==='UNLOCK'){
        let routeUrl = this.$router.resolve({
          path: "/orderDetail",
          query: {id:row.op_origin_id}
        });
        window.open(routeUrl.href, '_blank');
      }
      if (row.op_type==='B_IN'){
        let routeUrl = this.$router.resolve({
          path: "/purchaseDetail",
          query: {id:row.op_origin_id}
        });
        window.open(routeUrl.href, '_blank');
      }


    },

    // 分页大小
    opSizeChange(size) {
      this.opSize = size;
      this.initLog();
    },
    // 页码
    opCurrentChange(page) {
      this.opPage = page;
      this.initLog();
    },

    // 格式化日期时间
    datetimeFormat: function (row, column) {

      let date = row[column.property];

      if (date == undefined) {
        return ''
      }
      return moment(date).format("YYYY-MM-DD HH:mm:ss")
    },

    initLog(){
      //获取产品相关库存记录
      if(this.obj.type==='PRODUCT'){
        let url = '/api/stock_log/?product=' + this.obj.id +
            '&page=' + this.opPage + '&page_size=' + this.opSize;
        if (this.obj.filter && this.obj.filter!=='ALL'){
          url += '&op_type=' + this.obj.filter;
        }
        this.loading = true
        this.getRequest(url).then(resp => {
          if (resp.results) {
            this.loading = false
            this.stockLogs = resp.results;
            this.opTotal = resp.count;
          }
        })
      }


    }
  }
}
</script>

<style scoped>

</style>