<template>
  <div style="display: flex; justify-content: center">
    <div class="pContainer">
      <el-card shadow="hover" style="padding-bottom: 20px; height: 550px">
        <div slot="header" class="clearfix">
          <span style="font-weight: bold"><i class="el-icon-star-on"></i>采购设置</span>
        </div>

        <el-tabs v-model="defaultTab">
          <el-tab-pane label="补货推荐" name="refill">
            <el-form ref="storeForm" label-width="100px">
              <el-form-item label="警戒库存" >
                <el-input-number v-model="sys_refill.sys_alert_qty" :min="0"></el-input-number>
              </el-form-item>
              <el-form-item label="最小采购量" >
                <el-input-number v-model="sys_refill.sys_mini_pq" :min="0"></el-input-number>
              </el-form-item>
              <el-form-item label="采购上限" >
                <el-input-number v-model="sys_refill.sys_max_pq" :min="0"></el-input-number>
              </el-form-item>
              <el-form-item label="备货天数" >
                <el-input-number v-model="sys_refill.sys_stock_days" :min="0"></el-input-number>
              </el-form-item>

            </el-form>
            <el-button
                style="width: 200px;margin-left: 50px;margin-top: 50px"
                type="primary"
                @click="saveRefill">保 存
            </el-button>
          </el-tab-pane>
        </el-tabs>

      </el-card>
    </div>
  </div>
</template>

<script>
export default {
  name: "SettingPurchase",
  data() {
    return {
      defaultTab: 'refill',
      sys_refill: {
        id: null,
        sys_alert_qty: 0,
        sys_mini_pq: 0,
        sys_max_pq: 0,
        sys_stock_days: 0
      }
    }
  },
  mounted() {
    this.initSysRefill();
  },
  methods: {
    //保存设置
    saveRefill(){
      this.putRequest('api/settings/sys_refill/'+ this.sys_refill.id+'/', this.sys_refill).then(resp => {
        if(resp) {
          this.$message.success('操作成功')
        }
      })
    },
    initSysRefill() {
      this.getRequest('api/settings/sys_refill/').then(resp => {
        this.sys_refill = resp[0];
      })
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