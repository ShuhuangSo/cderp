<template>
  <el-table
      :header-cell-style="{background:'#eef1f6'}"
      :data="series"
      border
      style="width: 98%; margin: 10px">
    <el-table-column
        prop="name"
        label="系列名称">
    </el-table-column>
    <el-table-column
        label="操作"
        width="180">
    </el-table-column>

  </el-table>
</template>

<script>
export default {
  name: "Series",
  data() {
    return {
      series: [],
    }
  },
  mounted() {
    this.initSeries();
  },
  methods: {
    initSeries(){
      //获取产品系列
      this.getRequest('api/product_extra_info/?type=SERIES').then(resp => {
        if (resp.results) {
          this.series = resp.results;
        }
      })
    }
  }
}
</script>

<style scoped>

</style>