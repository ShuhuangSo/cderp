<template>
  <div class="chart" id="sales"></div>
</template>

<script>
export default {
  name: "SalesCharts",
  props: ["startSaleDate", "endSaleDate"],
  data() {
    return {
      salesReports: null,
      dateList: [],
      series: [],
      interval: 0,  // x轴标签显示间隔数
      selected: {},  // 默认显示的系列
      total: {
        tQty: 0,
        tAmount: 0,
      }

    }
  },
  mounted() {
    this.initSalesReports();
  },
  methods: {
    //初始化销售数据
    initSalesReports() {
      // 基于准备好的dom，初始化echarts实例
      let myChart = this.$echarts.init(document.getElementById('sales'));
      myChart.showLoading() // 开启loading

      // 请求远程数据
      let url = 'api/sales_report/?sale_date__gte=' + this.startSaleDate + '&sale_date__lte=' + this.endSaleDate
      this.getRequest(url).then(resp => {
        if (resp) {
          myChart.hideLoading() // 关闭loading
          this.salesReports = resp;

          //处理数据格式
          let dateSet = new Set(this.salesReports.map(i => i.sale_date));
          this.dateList = Array.from(dateSet) // 日期列表
          if (this.dateList.length > 15 && this.dateList.length < 31 ) {
            this.interval = 1
          }
          if (this.dateList.length > 31 ) {
            this.interval = 3
          }
          let seriesSet = new Set(this.salesReports.map(i => i.series)); //产品系列

          let totalQty = [] // 总销量
          for (let s of seriesSet) {
            // 筛选出该条折线图（该），对应的所有原始数据
            let list = this.salesReports.filter(d => d.series === s);
            // 匹配得到该条折线，对应的所有横轴的值组成的数组
            let _data = this.dateList.map((d, index) => {
              let num = list.find(item => item.sale_date === d);
              if (totalQty[index] == null || totalQty[index] == "") {
                totalQty[index] = 0
              }
              totalQty[index] += num.qty
              return num.qty;
            })
            this.series.push({   // 每个系列，对应一条折线图
              name: s,
              type: 'line',
              data: _data,   // 每个系列，对应的横坐标的值组成的数组
              smooth: true,
              symbolSize: 0,
            })
            this.selected[s] = false  // 其它系列默认不选中显示
          }
          //手动插入总销量
          this.series.unshift({
            name: '总销量',
            type: 'line',
            data: totalQty,
            smooth: true,
            symbolSize: 0,
            markPoint: {
              data: [
                {type: 'max', name: '最大值'},
                {type: 'min', name: '最小值'},
              ]
            },
            markLine: {
              data: [
                {type: 'average', name: '平均值'},
              ],
              label: {
                position: 'middle'
              }
            },
          })
          //计算区间总销售额、总数量
          this.salesReports.forEach(item=>{
            this.total.tQty += item.qty
            this.total.tAmount += item.amount
          })
          this.$emit('func',this.total)

          // 绘制图表
          let option = {
            title: {
              text: '区间总销量 '+ this.total.tQty +' 个',
              subtext: this.total.tAmount.toFixed(2) + ' 元',
              left: 'center'
            },
            tooltip: {
              trigger: 'axis'
            },
            legend: {
              icon: 'circle',
              bottom: 'bottom',
              selected: this.selected
            },
            xAxis: {
              type: 'category',
              boundaryGap: false,
              data: this.dateList,
              axisLabel: {
                interval: this.interval,
                formatter: function (value) {
                  return value.substring(5);
                }
              },
            },
            yAxis: {
              type: 'value'
            },
            series: this.series
          };

          myChart.setOption(option);
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