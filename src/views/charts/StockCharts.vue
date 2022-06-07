<template>
  <div class="chart" id="stock"></div>
</template>

<script>
export default {
  name: "StockCharts",
  props: {stockShow: String},
  data() {
    return {
      stockReports: null,
      dataSeries: [],
      dataStore: [],
      myChart: null,
      option: null,
    }
  },
  mounted() {
    this.initStockReports();
  },
  watch: {
    stockShow:{
      handler(val){
        if (val === '系列') {
          this.option.series[0].data = this.dataSeries
          this.myChart.setOption(this.option);
        }
        if (val === '门店') {
          this.option.series[0].data = this.dataStore
          this.myChart.setOption(this.option);
        }

      }

    }
  },
  methods: {
    initStockReports() {
      // 基于准备好的dom，初始化echarts实例
      this.myChart = this.$echarts.init(document.getElementById('stock'));
      this.myChart.showLoading() // 开启loading

      // 请求远程数据
      let url = 'api/stock_report/calc_current_stock/'
      this.getRequest(url).then(resp => {
        if (resp) {
          this.myChart.hideLoading() // 关闭loading
          this.stockReports = resp;
          let tQty = 0
          let tAmount = 0.0
          this.stockReports.series_data.forEach(item => {
            this.dataSeries.push(
                {
                  name: item.name,
                  value: item.qty
                }
            )
            tQty += item.qty
            tAmount += item.amount
          })
          this.stockReports.store_data.forEach(item => {
            this.dataStore.push(
                {
                  name: item.name,
                  value: item.qty
                }
            )
          })


          this.option = {
            title: {
              text: '总库存 ' + tQty + ' 个',
              subtext: tAmount + ' 元',
              left: 'center'
            },
            tooltip: {
              trigger: 'item'
            },
            legend: {
              orient: 'vertical',
              left: 'left'
            },
            series: [
              {
                name: '库存量',
                type: 'pie',
                radius: '50%',
                data: this.dataSeries,
                //重点
                label : {
                  normal : {
                    formatter: '{b} ({d}%)',
                  }
                },
                emphasis: {
                  itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                  }
                }
              }
            ]
          };

          this.myChart.setOption(this.option);
        }
      })

    }
  }
}
</script>

<style scoped>
.chart {
  width: 100%;
  height: 100%;
}
</style>