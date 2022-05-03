<template>
  <div style="display: flex; justify-content: center">
    <div class="pContainer">
      <el-card shadow="hover" style="padding-bottom: 20px; height: 550px">
        <div slot="header" class="clearfix">
          <span style="font-weight: bold"><i class="el-icon-star-on"></i>产品设置</span>
        </div>

        <el-tabs v-model="defaultTab" >
          <el-tab-pane label="品牌" name="brand"><Brand></Brand></el-tab-pane>
          <el-tab-pane label="系列" name="series"><Series></Series></el-tab-pane>
        </el-tabs>

      </el-card>
    </div>
  </div>
</template>

<script>
import Brand from "@/components/setting/Brand";
import Series from "@/components/setting/Series";

export default {
  name: "SettingProduct",
  components:{
    Brand, Series
  },
  data(){
    return{
      defaultTab: 'brand',
    }
  }
}
</script>

<style scoped>
.pContainer {
  margin-top: 10px;
  width: 1200px;
}
</style>