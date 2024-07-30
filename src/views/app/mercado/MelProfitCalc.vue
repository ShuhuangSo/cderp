/*
产品利润计算工具
*/
<template>
  <div style="display: flex; justify-content: center">
    <div class="pContainer">
      <el-card shadow="hover" style="padding-bottom: 20px">
        <div slot="header" class="clearfix">
          <span>利润计算工具</span>
        </div>

        <ProfitCalc></ProfitCalc>

      </el-card>
    </div>


  </div>
</template>

<script>

import ProfitCalc from "@/components/app/mercado/ProfitCalc";

export default {
  name: "MelProfitCalc",
  components:{ProfitCalc},
}
</script>

<style scoped>
.pContainer {
  margin-top: 10px;
  width: 1200px;
}

</style>