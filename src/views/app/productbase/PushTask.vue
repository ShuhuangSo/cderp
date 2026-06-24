<template>
  <el-tabs v-model="activeName" @tab-click="handleTabClick" tabPosition="left">
    <el-tab-pane :lazy="true" label="抓取任务" name="fetch">
      <span slot="label"><i class="el-icon-sold-out"></i> 采集任务</span>
      <PushFetchTask ref="fetchTask"></PushFetchTask>
    </el-tab-pane>
    <el-tab-pane :lazy="true" label="同步任务" name="task">
      <span slot="label"><i class="el-icon-refresh"></i> 同步任务</span>
      <span>sync</span>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import PushFetchTask from "@/views/app/productbase/PushFetchTask";
export default {
  name: "PushTask",
  components: {PushFetchTask},
  data(){
    return{
      activeName: 'fetch'
    }
  },
  methods: {
    // Tab 点击切换时触发
    handleTabClick(tab) {
      // 只在切换到你需要的标签时刷新
      if (tab.name === "fetch") {
        // 用 $nextTick 确保子组件已渲染完成
        this.$nextTick(() => {
          if (this.$refs.fetchTask) {
            // 调用子组件的初始化方法
            this.$refs.fetchTask.initTask();
          }
        });
      }
    }
  }
}
</script>

<style scoped>

</style>