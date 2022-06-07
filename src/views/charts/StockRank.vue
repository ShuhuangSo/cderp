<template>
  <el-table
      v-loading="loading"
      size="mini"
      :data="stocks"
      tooltip-effect="dark"
      style="width: 100%">
    <el-table-column
        label="排名"
        align="center"
        header-align="center"
        width="50">
      <template slot-scope="scope">
        {{ scope.$index + 1 }}
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

        <div>{{ scope.row.p_name }}</div>
      </template>
    </el-table-column>
    <el-table-column
        label="库存/成本"
        align="center"
        header-align="center">
      <template slot-scope="scope">
        <div>{{ scope.row.qty }}</div>
        <div>{{ scope.row.amount | currency }}</div>
      </template>

    </el-table-column>

  </el-table>
</template>

<script>
export default {
  name: "StockRank",
  props: ['store', 'series'],
  data() {
    return {
      stocks: [],
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
    store: {
      handler(val) {
        this.initStocks()
      }
    },
    series: {
      handler(val) {
        this.initStocks()
      }
    },
  },
  mounted() {
    this.initStocks()
  },
  methods: {
    initStocks() {
      this.loading = true
      if (!this.store) this.store = '';
      if (this.series === '全部系列') this.series = '';
      this.getRequest('api/stock_list/?ordering=-qty&store=' + this.store + '&product__series=' + this.series).then(resp => {
        this.loading = false
        if (resp) {
          this.stocks = resp.results;
        }
      })
    }
  }
}
</script>

<style scoped>

</style>