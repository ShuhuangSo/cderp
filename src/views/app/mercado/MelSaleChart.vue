/*
美客多FBM--销售订单图表
*/
<template>
  <div class="chart" id="sales"></div>
</template>

<script>
export default {
  name: "MelSaleChart",
  props: ["startSaleDate", "endSaleDate", "shop", "chartType"],
  data(){
    return{
      salesReports: null,
      total_qty: 0,
      total_profit: 0,
      total_amount: 0,
    }
  },
  mounted() {
    this.initSalesReports();
  },
  watch: {
    chartType:{
      handler(val){
        this.initSalesReports();
      }

    }
  },
  methods: {
    //初始化销售数据
    initSalesReports() {
      // 基于准备好的dom，初始化echarts实例
      let myChart = this.$echarts.init(document.getElementById('sales'));
      myChart.showLoading() // 开启loading

      // 请求远程数据
      let url = 'api/ml_shop_reports/?calc_date__gte=' + this.startSaleDate + '&calc_date__lte=' + this.endSaleDate
      url += '&shop=' + this.shop
      this.getRequest(url).then(resp => {
        if (resp) {
          myChart.hideLoading() // 关闭loading
          this.salesReports = resp.reverse();
          //计算区间总销售额、总数量
          this.total_qty = 0
          this.total_profit = 0
          this.total_amount = 0
          this.salesReports.forEach(item=>{
            this.total_qty += item.qty
            this.total_profit += item.profit
            this.total_amount += item.amount
          })

          // 绘制订单图表
          let option = {
            title: {
              text: '区间总销量 '+ this.total_qty +' 个',
              subtext: '毛利润: ￥' + this.total_profit.toFixed(2),
              left: 'center'
            },
            tooltip: {
              trigger: 'axis'
            },
            xAxis: {
              type: 'category',
              boundaryGap: false,
              data: this.salesReports.map(item => item.calc_date),
            },
            yAxis: {
              type: 'value',
              name: '销量(个)'
            },
            series: [
              {
                data: this.salesReports.map(i => i.qty),
                name: '当天销量',
                type: 'line',
                smooth: true,
                symbolSize: 0,
                areaStyle: {
                  color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [{
                      offset: 0, color: '#4B74FF' // 0% 处的颜色
                    }, {
                      offset: 1, color: '#fff' // 100% 处的颜色
                    }],
                    global: false
                  }
                }
              }
            ]
          };

          // 绘制销售额图表
          let option2 = {
            title: {
              text: '区间总销售额 $ '+ this.total_amount.toFixed(2),
              subtext: '毛利润: ￥' + this.total_profit.toFixed(2),
              left: 'center'
            },
            tooltip: {
              trigger: 'axis'
            },
            xAxis: {
              type: 'category',
              boundaryGap: true,
              data: this.salesReports.map(item => item.calc_date),
            },
            yAxis: {
              type: 'value',
              name: '销量额($)'
            },
            series: [
              {
                data: this.salesReports.map(i => i.amount),
                name: '当天销售额',
                type: 'bar',
                color: '#5b70c3'
              }
            ]
          };

          // 绘制毛利润图表
          let option3 = {
            title: {
              text: '区间总利润 ￥ '+ this.total_profit.toFixed(2),
              subtext: '订单数: ' + this.total_qty,
              left: 'center'
            },
            tooltip: {
              trigger: 'axis'
            },
            xAxis: {
              type: 'category',
              boundaryGap: true,
              data: this.salesReports.map(item => item.calc_date),
            },
            yAxis: {
              type: 'value',
              name: '毛利润(rmb)'
            },
            series: [
              {
                data: this.salesReports.map(i => i.profit),
                name: '当天利润',
                type: 'bar',
                color: '#9eca7f'
              }
            ]
          };

          if (this.chartType === 'ORDER') {
            myChart.setOption(option);
          }
          if (this.chartType === 'AMOUNT') {
            myChart.setOption(option2);
          }
          if (this.chartType === 'PROFIT') {
            myChart.setOption(option3);
          }
        }
      })
    },
  },
}
</script>

<style scoped>
.chart {
  width: 100%;
  height: 100%;
}
</style>