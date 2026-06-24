<template>
  <div class="mainList">
    <el-tabs v-model="activeName">
      <el-tab-pane :lazy="true" label="产品库" name="product">
        <span slot="label"><i class="el-icon-goods"></i> 产品库</span>
        <PushProduct></PushProduct>
      </el-tab-pane>
      <el-tab-pane :lazy="true" label="供应商" name="supplier">
        <span slot="label"><i class="el-icon-s-cooperation"></i> 供应商</span>
        <SupplierManager></SupplierManager>
      </el-tab-pane>
      <el-tab-pane :lazy="true" label="任务中心" name="task">
        <span slot="label"><i class="el-icon-s-promotion"></i> 任务中心</span>
        <PushTask></PushTask>
      </el-tab-pane>
      <el-tab-pane :lazy="true" label="操作日志" name="log">
        <span slot="label"><i class="el-icon-notebook-2"></i> 操作日志</span>
        <PushLog></PushLog>
      </el-tab-pane>
      <el-tab-pane :lazy="true" label="设置" name="settings">
        <span slot="label"><i class="el-icon-setting"></i> 设置</span>
        <Settings></Settings>
      </el-tab-pane>
      <el-tab-pane :lazy="true" label="数据统计" name="stats">
        <span slot="label"><i class="el-icon-s-data"></i> 数据统计</span>
        <StatsDashboard></StatsDashboard>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import PushLog from "@/views/app/productbase/PushLog";
import PushProduct from "@/views/app/productbase/PushProduct";
import PushTask from "@/views/app/productbase/PushTask";
import SupplierManager from "@/views/app/productbase/SupplierManager";
import Settings from "@/views/app/productbase/Settings";
import StatsDashboard from "@/views/app/productbase/StatsDashboard";
export default {
  name: "PushProductBase",
  components: {PushTask, PushLog, PushProduct, SupplierManager, Settings, StatsDashboard},
  data(){
    return{
      activeName: 'product'
    }
  }
}
</script>

<style scoped>
.mainList {
  padding: 10px;
  background-color: white;
  margin-top: 10px;
  border-radius: 15px;
}
</style>