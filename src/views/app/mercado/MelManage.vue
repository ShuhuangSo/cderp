/*
    美客多产品管理
*/
<template>
  <div class="mainList">

    <el-tabs v-model="activeName">
      <el-tab-pane :lazy="true" label="产品库" name="first">产品库</el-tab-pane>
      <el-tab-pane :lazy="true" label="发仓运单" name="second">发仓运单</el-tab-pane>
      <el-tab-pane :lazy="true" label="FBM库存" name="third">店铺库存</el-tab-pane>
      <el-tab-pane :lazy="true" label="销售订单" name="four">销售订单</el-tab-pane>
    </el-tabs>
  </div>

</template>

<script>
export default {
  name: "MelManage",
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