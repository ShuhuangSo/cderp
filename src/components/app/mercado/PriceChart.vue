<template>
  <div class="chart" id="price"></div>
</template>

<script>
export default {
  name: "PriceChart",
  props: ['listingID', 'dateR'],
  data(){
    return{
      listingTrack: null,
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
      let myChart = this.$echarts.init(document.getElementById('price'));
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

          let option = {
            title: {
              text: '售价波动',
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
              name: '售价($)'
            },
            series: [
              {
                data: this.listingTrack.map(i => i.price),
                name: '当天售价',
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