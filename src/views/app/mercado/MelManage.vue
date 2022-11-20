/*
    美客多FBM
*/
<template>
  <div class="mainList">

    <el-tabs v-model="activeName">
      <el-tab-pane :lazy="true" label="产品库" name="first"><MelProduct></MelProduct></el-tab-pane>
      <el-tab-pane :lazy="true" label="发仓运单" name="second"><MelShip></MelShip></el-tab-pane>
      <el-tab-pane :lazy="true" label="FBM库存" name="third"><MelShopStock></MelShopStock></el-tab-pane>
      <el-tab-pane :lazy="true" label="中转仓" name="four">中转仓</el-tab-pane>
      <el-tab-pane :lazy="true" label="销售订单" name="five">销售订单</el-tab-pane>
    </el-tabs>
  </div>

</template>

<script>
import MelProduct from "@/views/app/mercado/MelProduct";
import MelShopStock from "@/views/app/mercado/MelShopStock";
import MelShip from "@/views/app/mercado/MelShip";

export default {
  name: "MelManage",
  components:{
    MelProduct, MelShopStock, MelShip
  },
  data(){
    return{
      activeName: this.$route.query.activeName?this.$route.query.activeName:'first',
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