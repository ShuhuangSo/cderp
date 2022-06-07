<template>
  <div class="chart" id="customer"></div>
</template>

<script>
export default {
  name: "CustomerCharts",
  props: ['start_date', 'end_date', 'customerShow'],
  data() {
    return {
      myChart: null,
      customerReports: [],
      option: null,
    }
  },
  watch: {
    start_date: {
      handler(val) {
        this.initCustomerReport()
      }
    },
    customerShow: {
      handler(val) {
        if (val === '数量') {
          this.option.series[0].data = this.customerReports.map(item => item.total_qty)
        }
        if (val === '金额') {
          this.option.series[0].data = this.customerReports.map(item => item.total_amount)
        }

        this.myChart.setOption(this.option);
      },
    }
  },
  mounted() {
    this.initCustomerReport()
  },
  methods: {
    initCustomerReport() {
      // 基于准备好的dom，初始化echarts实例
      this.myChart = this.$echarts.init(document.getElementById('customer'));
      this.myChart.showLoading() // 开启loading

      // 请求远程数据
      let url = 'api/customer_report/calc_total/'
      this.postRequest(url, {'start_date': this.start_date, 'end_date': this.end_date}).then(resp => {
        this.myChart.hideLoading() // 关闭loading
        if (resp) {
          this.customerReports = resp.data.reverse()

          let colors = ['#ee845f', '#9ec97e', '#5871c0', '#de6e6a', '#84bfdb', '#599f76', '#ed8a5d', '#9164af', '#b6c068', '#f3c96b']
          this.option = {
            xAxis: {
              type: 'value'
            },
            yAxis: {
              type: 'category',
              data: this.customerReports.map(item => item.name)
            },
            tooltip: {
              trigger: 'item'
            },
            grid: {
              left: 120,// 调整这个属性
            },
            series: [
              {
                data: this.customerReports.map(item => item.total_qty),
                type: 'bar',
                itemStyle: {
                  color: params => colors[params.dataIndex] || '#5871c0'
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