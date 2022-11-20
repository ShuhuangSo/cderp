/*
美客多FBM--创建运单
*/
<template>
  <div style="display: flex; justify-content: center">
    <div class="pContainer">
      <el-card shadow="hover" style="padding-bottom: 20px">
        <div slot="header" class="clearfix">
          <el-page-header @back="cancel" content="创建运单">
          </el-page-header>
        </div>
        <div>
          <el-form ref="shipForm" :rules="rules" :model="ship" label-width="180px">
            <el-form-item label="类型" prop="target">
              <el-radio-group v-model="ship.target" @input="changeTarget">
                <el-radio label="FBM">FBM入仓</el-radio>
                <el-radio label="TRANSIT">中转仓</el-radio>
              </el-radio-group>

            </el-form-item>

            <el-form-item label="目标店铺" required prop="shop">
              <el-select v-model="ship.shop"
                         style="width: 300px;"
                         placeholder="请选择店铺">
                <el-option
                    v-for="item in shops"
                    :key="ship.target"
                    :label="item.name"
                    :value="item.name">
                  <span style="float: left">{{ item.name }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">{{ item.nickname }}</span>
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="承运商" prop="shop">
              <el-select v-model="ship.carrier"
                         style="width: 300px;"
                         placeholder="请选择发货物流">
                <el-option
                    v-for="item in carriers"
                    :label="item.name"
                    :value="item.name">
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="发货方式" prop="ship_type">
              <el-radio-group v-model="ship.ship_type">
                <el-radio label="空运">空运</el-radio>
                <el-radio label="海运">海运</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="截单日期" prop="end_date">
              <el-date-picker
                  v-model="ship.end_date"
                  type="date"
                  placeholder="选择日期">
              </el-date-picker>
            </el-form-item>

            <el-form-item label="航班日期" prop="end_date">
              <el-date-picker
                  v-model="ship.ship_date"
                  type="date"
                  placeholder="选择日期">
              </el-date-picker>
            </el-form-item>

            <el-form-item label="备注">
              <el-input
                  style="width: 600px;"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入备注"
                  v-model="ship.note">
              </el-input>
            </el-form-item>

          </el-form>
        </div>

      </el-card>
    </div>
  </div>
</template>

<script>
export default {
  name: "MelCreateShip",
  data(){
    return{
      ship: {
        target: 'FBM',
        shop: '',
        ship_type: '空运',
        carrier: '',
        end_date: '',
        ship_date: '',
        note: '',
        ship_detail: null,
      },
      shops: null, //可选店铺
      carriers: null, //可选物流商
    }
  },
  mounted() {
    this.inintShops();
    this.initCarriers();
  },
  methods:{
    changeTarget(){
      this.ship.shop = ''
      this.inintShops()
    },
    // 取消并返回
    cancel() {
      this.$router.push({
        path: '/melManage',
        query: {
          activeName: 'second'
        }
      });
    },
    inintShops(){
      //获取所有可选店铺
      this.getRequest('api/ml_shops/?warehouse_type='+ this.ship.target + '&page_size=1000&ordering=create_time').then(resp => {
        if (resp.results) {
          this.shops = resp.results;
        }
      })
    },
    initCarriers(){
      //获取所有物流商
      this.getRequest('api/ml_carriers/?page_size=1000&ordering=od_num').then(resp => {
        if (resp.results) {
          this.carriers = resp.results;
        }
      })
    },
  }
}
</script>

<style scoped>
.pContainer {
  margin-top: 10px;
  width: 1200px;
}
</style>