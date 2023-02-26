/*
    美客多FBM
*/
<template>
  <div class="mainList">
    <el-tabs v-model="activeName">
      <el-tab-pane :lazy="true" label="产品库" name="first" v-if="permission.product">
        <span slot="label"><i class="el-icon-goods"></i> 产品库</span>
        <MelProduct></MelProduct>
      </el-tab-pane>
      <el-tab-pane :lazy="true" label="采购管理" name="purchase"  v-if="user.is_superuser">
        <span slot="label"><i class="el-icon-shopping-cart-full"></i> 采购管理</span>
        <MelPurchase></MelPurchase>
      </el-tab-pane>
      <el-tab-pane :lazy="true" label="发仓运单" name="second">
        <span slot="label"><i class="el-icon-truck"></i> 发仓运单</span>
        <MelShip></MelShip>
      </el-tab-pane>
      <el-tab-pane :lazy="true" label="FBM库存" name="third">
        <span slot="label"><i class="el-icon-school"></i> FBM库存</span>
        <MelShopStock></MelShopStock>
      </el-tab-pane>
      <el-tab-pane :lazy="true" label="中转仓" name="four">
        <span slot="label"><i class="el-icon-house"></i> 中转仓</span>
        <MelTransStock></MelTransStock>
      </el-tab-pane>
      <el-tab-pane :lazy="true" label="销售订单" name="five">
        <span slot="label"><i class="el-icon-tickets"></i> 销售订单</span>
        <MelOrder></MelOrder>
      </el-tab-pane>
      <el-tab-pane :lazy="true" label="财务管理" name="six">
        <span slot="label"><i class="el-icon-money"></i> 财务管理</span>
        <MelFinance></MelFinance>
      </el-tab-pane>
      <el-tab-pane :lazy="true" label="操作日志" name="seven" v-if="user.is_superuser">
        <span slot="label"><i class="el-icon-notebook-2"></i> 操作日志</span>
        <MelOperateLog></MelOperateLog>
      </el-tab-pane>
    </el-tabs>
  </div>

</template>

<script>
import MelProduct from "@/views/app/mercado/MelProduct";
import MelShopStock from "@/views/app/mercado/MelShopStock";
import MelShip from "@/views/app/mercado/MelShip";
import MelTransStock from "@/views/app/mercado/MelTransStock";
import MelOrder from "@/views/app/mercado/MelOrder";
import MelFinance from "@/views/app/mercado/MelFinance";
import MelOperateLog from "@/views/app/mercado/MelOperateLog";
import MelPurchase from "@/views/app/mercado/MelPurchase";

export default {
  name: "MelManage",
  components:{
    MelProduct, MelShopStock, MelShip, MelTransStock, MelOrder, MelFinance, MelOperateLog, MelPurchase
  },
  data(){
    return{
      activeName: this.$route.query.activeName?this.$route.query.activeName:'second',
      user: JSON.parse(window.sessionStorage.getItem('user')),
      permission: JSON.parse(window.sessionStorage.getItem('ml_permission'))
    }
  },
}
</script>

<style scoped>
.mainList {
  padding: 10px;
  background-color: white;
  margin-top: 10px;
}
</style>