<template>
  <div>
    <el-table
        v-if="obj.op_type==='ONWAY'"
        ref="stockTable"
        :data="onway_stocks"
        :header-cell-style="{background:'#fafafa'}"
        v-loading="loading"
        style="width: 100%">

      <el-table-column
          label="在途数量"
          align="center"
          header-align="center">
        <template slot-scope="scope">
          <div>{{ scope.row.qty}}</div>
        </template>
      </el-table-column>

      <el-table-column
          label="批次"
          align="center"
          header-align="center">
        <template slot-scope="scope">
          <div>{{ scope.row.batch}}</div>
        </template>
      </el-table-column>

      <el-table-column
          label="状态"
          align="center"
          header-align="center"
          width="100">
        <template slot-scope="scope">
          <div>{{ scope.row.s_status | status }}</div>
        </template>
      </el-table-column>

      <el-table-column
          label="预约时间"
          align="center"
          header-align="center"
          width="100">
        <template slot-scope="scope">
          <div>{{ scope.row.book_date }}</div>
        </template>
      </el-table-column>

      <el-table-column
          label="标签"
          align="center"
          header-align="center"
          width="100">
        <template slot-scope="scope">
          <el-tag
              v-if="scope.row.tag_name"
              style="border: none"
              :color="scope.row.tag_color"
              effect="dark" type="info">
            <span style="font-weight: bold">{{ scope.row.tag_name }}</span>
          </el-tag>
        </template>
      </el-table-column>

    </el-table>

    <el-table
        v-if="obj.op_type==='TRANS'"
        ref="stockTable"
        :data="onway_stocks"
        :header-cell-style="{background:'#fafafa'}"
        v-loading="loading"
        style="width: 100%">

      <el-table-column
          width="80"
          label="在仓数量"
          align="center"
          header-align="center">
        <template slot-scope="scope">
          <div>{{ scope.row.qty}}</div>
        </template>
      </el-table-column>

      <el-table-column
          label="入仓批次"
          align="center"
          header-align="center">
        <template slot-scope="scope">
          <div>{{ scope.row.batch}}</div>
        </template>
      </el-table-column>

      <el-table-column
          label="所在仓"
          align="center"
          header-align="center">
        <template slot-scope="scope">
          <div>{{ scope.row.warehouse }}</div>
        </template>
      </el-table-column>

      <el-table-column
          label="到仓日期"
          align="center"
          header-align="center"
          width="100">
        <template slot-scope="scope">
          <div>{{ scope.row.arrived_date }}</div>
        </template>
      </el-table-column>

    </el-table>
  </div>
</template>

<script>

export default {
  name: "MelStockDetail",
  props: ['obj'],
  data(){
    return{
      onway_stocks: [],
      loading: false,

    }
  },
  filters: {
    //状态格式化
    status: function (value) {
      if (value ==='SHIPPED') return '已发货'
      if (value ==='BOOKED') return '已预约'
    },
  },
  mounted() {
    this.initOnWayStock()
  },
  methods:{
    initOnWayStock(){
      let url = '/api/ml_shopstock/get_stock_detail/'

      this.loading = true
      this.postRequest(url, this.obj).then(resp => {
        this.loading = false
        if (resp) {
          this.onway_stocks = resp;
        }
      })
    }
  }
}
</script>

<style scoped>

</style>