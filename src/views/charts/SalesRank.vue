<template>
  <el-table
      v-loading="loading"
      size="mini"
      :data="products"
      tooltip-effect="dark"
      style="width: 100%">
    <el-table-column
        label="排名"
        align="center"
        header-align="center"
        width="50">
      <template slot-scope="scope">
        {{scope.$index + 1}}
      </template>
    </el-table-column>
    <el-table-column
        label="图片"
        align="center"
        header-align="center"
        width="60">
      <template slot-scope="scope">
        <el-image
            style="width: 40px; height: 40px"
            :src="scope.row.image"
            :preview-src-list="[scope.row.image]"
            fit="fill">
        </el-image>
      </template>
    </el-table-column>
    <el-table-column
        label="SKU"
        min-width="180px"
        show-overflow-tooltip>
      <template slot-scope="scope">
        <div>{{ scope.row.sku }}</div>

        <div>{{ scope.row.name }}</div>
      </template>
    </el-table-column>
    <el-table-column
        label="销量"
        align="center"
        header-align="center">
      <template slot-scope="scope">
        <div>{{scope.row.total_qty}}</div>
        <div>{{scope.row.total_amount | currency}}</div>
      </template>

    </el-table-column>

  </el-table>
</template>

<script>

export default {
  name: "SalesRank",
  props: ['start_date', 'end_date'],
  data(){
    return{
      products: [],
      loading: false,
    }
  },
  filters: {
    //金额格式化
    currency: function (value) {
      if (!value) return 0.00;
      return `¥ ${value.toFixed(2)}`;
    },
  },
  watch: {
    start_date: {
      handler(val) {
        this.initProducts()
      }
    }
  },
  mounted() {
    this.initProducts();
  },
  methods:{

    initProducts(){
      this.loading = true
      this.postRequest('api/product_report/calc_total/', {'start_date': this.start_date, 'end_date': this.end_date}).then(resp => {
        this.loading = false
        if (resp) {
          this.products = resp.data;
        }
      })
    }
  }
}
</script>

<style scoped>

</style>