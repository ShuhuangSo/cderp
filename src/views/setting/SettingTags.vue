<template>
  <div style="display: flex; justify-content: center">
    <div class="pContainer">
      <el-card shadow="hover" style="padding-bottom: 20px; height: 550px">
        <div slot="header" class="clearfix">
          <span style="font-weight: bold"><i class="el-icon-star-on"></i>标签管理</span>
        </div>

        <el-tabs tabPosition="left" v-model="tagType" @tab-click="handleClick">
          <el-tab-pane label="产品标签" name="PRODUCT"><TagsManage :key="timer" v-if="isShow" :tagType="tagType"></TagsManage></el-tab-pane>
          <el-tab-pane label="订单标签" name="ORDER"><TagsManage :key="timer" v-if="isShow" :tagType="tagType"></TagsManage></el-tab-pane>
          <el-tab-pane label="采购标签" name="PURCHASE"><TagsManage :key="timer" v-if="isShow" :tagType="tagType"></TagsManage></el-tab-pane>
          <el-tab-pane label="客户标签" name="CUSTOMER"><TagsManage :key="timer" v-if="isShow" :tagType="tagType"></TagsManage></el-tab-pane>
        </el-tabs>

      </el-card>
    </div>
  </div>
</template>

<script>
import TagsManage from "@/components/setting/TagsManage";

export default {
  name: "SettingTags",
  components: {
    TagsManage
  },
  data(){
    return{
      tagType: 'PRODUCT',
      timer: '',
      isShow: true
    }
  },
  methods:{
    handleClick(tab){
      this.tagType = tab.name
      this.isShow = false;
      this.timer = new Date().getTime();
      this.isShow = true;
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