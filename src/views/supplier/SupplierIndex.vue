<template>
  <div style="margin-top: 300px;padding-left: 100px;padding-right: 100px">
    <h2>订单处理流程</h2>
    <el-steps :active="3">
      <el-step title="确认订单" description="确认收到订单"></el-step>
      <el-step title="订单发货" description="填写发货数量并发货"></el-step>
      <el-step title="完成" description="全部发完订单完成，部分发货订单可继续发货"></el-step>
    </el-steps>
  </div>
</template>

<script>
export default {
  name: "SupplierIndex"
}
</script>

<style scoped>

</style>