<template>
  <div class="chart" id="total"></div>
</template>

<script>
export default {
  name: "SellerTotalChart",
  props: ['sellerID', 'dateR'],
  data(){
    return{
      sellerTrack: null,
    }
  },
  watch: {
    sellerID:{
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
  mounted() {
    this.initSales();
  },
  methods:{
    initSales(){
      // 基于准备好的dom，初始化echarts实例
      let myChart = this.$echarts.init(document.getElementById('total'));
      myChart.showLoading() // 开启loading

      // 请求远程数据
      let url = 'api/med_seller_track/?seller__id=' + this.sellerID + '&ordering=create_time'
      if (this.dateR) {
        let start = this.dateR[0] + ' 00:00:00'
        let end = this.dateR[1] + ' 23:59:59'
        url += '&create_time__gte=' + start;
        url += '&create_time__lte=' + end;
      }
      this.getRequest(url).then(resp => {
        myChart.hideLoading() // 关闭loading
        if (resp) {
          this.sellerTrack = resp;

          let option = {
            title: {
              text: '历史总单量变化',
              left: 'center'
            },
            tooltip: {
              trigger: 'axis'
            },
            xAxis: {
              type: 'category',
              boundaryGap: false,
              data: this.sellerTrack.map(i => i.create_time)
            },
            yAxis: {
              type: 'value',
              name: '订单数(个)'
            },
            series: [
              {
                data: this.sellerTrack.map(i => i.total),
                name: '总订单数',
                type: 'line',
                symbolSize: 0,
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