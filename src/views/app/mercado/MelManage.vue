/*
    美客多FBM
*/
<template>
  <div class="mainList">

    <el-tabs v-model="activeName">
      <el-tab-pane :lazy="true" label="产品库" name="first"><MelProduct></MelProduct></el-tab-pane>
      <el-tab-pane :lazy="true" label="发仓运单" name="second">发仓运单</el-tab-pane>
      <el-tab-pane :lazy="true" label="FBM库存" name="third">FBM库存</el-tab-pane>
      <el-tab-pane :lazy="true" label="中转仓" name="four">中转仓</el-tab-pane>
      <el-tab-pane :lazy="true" label="销售订单" name="five">销售订单</el-tab-pane>
    </el-tabs>
  </div>

</template>

<script>
import MelProduct from "@/views/app/mercado/MelProduct";

export default {
  name: "MelManage",
  components:{
    MelProduct
  },
  data(){
    return{
      activeName: 'first',
    }
  }
}
</script>

<style scoped>
.mainList {
  padding: 10px;
  background-color: white;
  margin-top: 10px;
}
</style>