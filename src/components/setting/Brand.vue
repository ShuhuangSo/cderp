<template>
  <el-table
      :header-cell-style="{background:'#eef1f6'}"
      :data="brands"
      border
      style="width: 98%; margin: 10px">
    <el-table-column
        prop="name"
        label="品牌名称">
    </el-table-column>
    <el-table-column
        label="操作"
        width="180">
    </el-table-column>

  </el-table>
</template>

<script>
export default {
  name: "Brand",
  data() {
    return {
      brands: [],
    }
  },
  mounted() {
    this.initBrands();
  },
  methods:{
    initBrands(){
      //获取品牌
      this.getRequest('api/product_extra_info/?type=BRAND&page_size=1000').then(resp => {
        if (resp.results) {
          this.brands = resp.results;
        }
      })
    }
  }
}
</script>

<style scoped>

</style>