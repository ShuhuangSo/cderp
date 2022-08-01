<template>
  <div class="chart" id="sales"></div>
</template>

<script>
export default {
  name: "SaleChart",
  props: ['listingID', 'dateR'],
  data(){
    return{
      listingTrack: null,
      total_qty: 0,
      total_sales: 0,
    }
  },
  mounted() {
    this.initSales();
  },
  watch: {
    listingID:{
      handler(val){
        this.initSales();
      }
    },
    dateR:{
      handler(val){
        this.initSales();
      }
    }
  },
  methods:{
    initSales(){
      // 基于准备好的dom，初始化echarts实例
      let myChart = this.$echarts.init(document.getElementById('sales'));
      myChart.showLoading() // 开启loading

      // 请求远程数据
      let url = 'api/med_listing_track/?listing__id=' + this.listingID + '&ordering=create_time'
      if (this.dateR) {
        let start = this.dateR[0] + ' 00:00:00'
        let end = this.dateR[1] + ' 23:59:59'
        url += '&create_time__gte=' + start;
        url += '&create_time__lte=' + end;
      }
      this.getRequest(url).then(resp => {
        myChart.hideLoading() // 关闭loading
        if (resp) {
          this.listingTrack = resp;
          //计算区间总销售额、总数量
          this.listingTrack.forEach(item=>{
            this.total_qty += item.today_sold
            this.total_sales += item.price * item.today_sold
          })

          let option = {
            title: {
              text: '区间总销量 '+ this.total_qty +' 个',
              subtext: '销售额: $' + this.total_sales.toFixed(2),
              left: 'center'
            },
            tooltip: {
              trigger: 'axis'
            },
            xAxis: {
              type: 'category',
              boundaryGap: false,
              data: this.listingTrack.map(i => i.create_time)
            },
            yAxis: {
              type: 'value',
              name: '销量(个)'
            },
            series: [
              {
                data: this.listingTrack.map(i => i.today_sold),
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
          myChart.setOption(option);

        }
      })

    }
  }
}
</script>

<style scoped>

</style>