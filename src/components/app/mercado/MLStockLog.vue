<template>
  <div>
    <div>
      <el-select v-model="filter_action"
                 style="width: 150px;margin-left: 5px"
                 @change="changeFilter" placeholder="请选择筛选项">
        <el-option
            v-for="item in filter_action_group"
            :key="item.name"
            :label="item.name"
            :value="item.value">
        </el-option>
      </el-select>

      <el-select v-model="filter_in_out"
                 style="width: 150px;margin-left: 5px"
                 @change="changeFilter" placeholder="请选择筛选项">
        <el-option
            v-for="item in filter_in_out_group"
            :key="item.name"
            :label="item.name"
            :value="item.value">
        </el-option>
      </el-select>
    </div>
    <el-table
        :header-cell-style="{background:'#eef1f6'}"
        :data="stockLogs"
        border
        size="mini"
        v-loading="loading"
        style="width: 98%; margin: 10px">

      <el-table-column
          align="center"
          header-align="center"
          width="80"
          label="库存">
        <template slot-scope="scope">
          <span style="font-weight: bold">{{scope.row.current_stock}}</span>
        </template>
      </el-table-column>

      <el-table-column
          prop="qty"
          align="center"
          header-align="center"
          width="80"
          label="数量">
        <template slot-scope="scope">
          <span v-if="scope.row.in_out==='IN'" style="color: green;font-weight: bold">+ {{scope.row.qty}}</span>
          <span v-if="scope.row.in_out==='OUT'" style="color: #b80303;font-weight: bold">- {{scope.row.qty}}</span>
        </template>
      </el-table-column>

      <el-table-column
          align="center"
          header-align="center"
          width="80"
          label="类型">
        <template slot-scope="scope">
          <span>{{scope.row.action | type}}</span>
        </template>
      </el-table-column>

      <el-table-column
          label="描述">
        <template slot-scope="scope">
          <span>{{scope.row.desc}}</span>
        </template>
      </el-table-column>
      <el-table-column
          prop="user_name"
          align="center"
          header-align="center"
          label="操作人"
          width="100">
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
  name: "MLStockLog",
  props: ['obj'],
  data(){
    return{
      stockLogs: [],
      loading: false,
      opTotal: 0, // 日志总条数
      opPage: 1,  // 日志当前页
      opSize: 20,  // 日志页大小
      filter_action: '', // 变动来源筛选
      filter_action_group: [
        {
          name: '全部类型',
          value: ''
        },
        {
          name: 'FBM入仓',
          value: '&action=INBOUND'
        },
        {
          name: '库存盘点',
          value: '&action=TAKING'
        },
        {
          name: '销售出库',
          value: '&action=SALE'
        },
        {
          name: '取消订单入库',
          value: '&action=CANCEL'
        },
      ],
      filter_in_out: '', // in out筛选
      filter_in_out_group: [
        {
          name: '全部出入库',
          value: ''
        },
        {
          name: '出库',
          value: '&in_out=OUT'
        },
        {
          name: '入库',
          value: '&in_out=IN'
        },
      ],
    }
  },
  filters: {
    //信息格式化
    type: function (value) {
      if (value==='INBOUND') return 'FBM入仓';
      if (value==='TAKING') return '库存盘点';
      if (value==='SALE') return '销售出库';
      if (value==='CANCEL') return '取消订单';
    },
  },
  mounted() {
    this.initLog();
  },
  methods:{
    changeFilter(){
      this.opPage = 1
      this.initLog();
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
      if(this.obj.type==='SHOP_STOCK'){
        let url = '/api/ml_stock_log/?shop_stock=' + this.obj.id +
            '&page=' + this.opPage + '&page_size=' + this.opSize;

        if (this.filter_action) {
          url += this.filter_action;
        }

        if (this.filter_in_out) {
          url += this.filter_in_out;
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