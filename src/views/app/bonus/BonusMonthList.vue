<template>
  <div class="baseContainer">
    <el-tabs activeName="first" >
      <el-tab-pane label="统计月份" name="first"><MonthList></MonthList></el-tab-pane>
      <el-tab-pane label="账号管理" name="second"><Accounts></Accounts></el-tab-pane>

    </el-tabs>
<!--    <div class="card">-->
<!--      <MonthList></MonthList>-->
<!--    </div>-->

<!--    <div class="card">-->
<!--      <Accounts></Accounts>-->
<!--    </div>-->

  </div>
</template>

<script>
import MonthList from "@/components/app/bonus/MonthList";
import Accounts from "@/components/app/bonus/Accounts";

export default {
  name: "BonusMonthList",
  components: {
    MonthList,
    Accounts
  },
  data(){
    return{

    }
  }
}
</script>

<style scoped>
.baseContainer {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
.card{
  width: 900px;
  height: 600px;
  margin-left: 5px;
  margin-right: 5px;
}
.chartTitle {
  font-weight: bold;
  margin-right: 20px
}
</style>