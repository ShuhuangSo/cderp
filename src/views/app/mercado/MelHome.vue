<template>
  <div class="mainList">
    <div style="display: flex;justify-content: center">
      <el-radio-group @change="changeSite" v-model="siteID">
        <el-radio-button label="MLM">墨西哥</el-radio-button>
        <el-radio-button label="MLC">智利</el-radio-button>
        <el-radio-button label="MLB">巴西</el-radio-button>
      </el-radio-group>
    </div>
    <el-tabs v-model="activeName">
      <el-tab-pane :lazy="true" label="产品跟踪" name="first"><Listing :siteID="siteID"></Listing></el-tab-pane>
      <el-tab-pane :lazy="true" label="卖家管理" name="second"><Seller :siteID="siteID"></Seller></el-tab-pane>
      <el-tab-pane :lazy="true" label="类目热搜" name="third"><Categories :key="timer" :siteID="siteID"></Categories></el-tab-pane>
    </el-tabs>
  </div>

</template>

<script>
import Listing from "@/components/app/mercado/Listing";
import Categories from "@/components/app/mercado/Categories";
import Seller from "@/components/app/mercado/Seller";

export default {
  name: "MelHome",
  components:{
    Listing, Categories, Seller
  },
  data(){
    return{
      activeName: 'first',
      siteID: 'MLM',
      timer: null
    }
  },
  methods:{
    changeSite(){
      this.timer = new Date().getTime();
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