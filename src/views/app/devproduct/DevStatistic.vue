/*
产品开发，数据统计
*/
<template>
  <div>
      <el-tabs v-model="activeName">
        <el-tab-pane :lazy="true" label="开发统计" name="first">
          <el-descriptions size='medium' column="1">
            <el-descriptions-item label="7天发布数量">{{this.devData.day7_qty}}</el-descriptions-item>
            <el-descriptions-item label="15天发布数量">{{this.devData.day15_qty}}</el-descriptions-item>
            <el-descriptions-item label="30天发布数量">{{this.devData.day30_qty}}</el-descriptions-item>
            <el-descriptions-item label="总发布数量">{{this.devData.all_qty}}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>
        <el-tab-pane :lazy="true" label="上架统计" name="second">
          <el-table
              :header-cell-style="{background:'#eef1f6'}"
              :data="allUsersData"
              border
              size="mini"
              style="width: 98%; margin: 10px">
            <el-table-column
                prop="user_name"
                label="负责人"
                align="center"
                header-align="center"
                width="100">
            </el-table-column>
            <el-table-column
                prop="offline_product_qty"
                align="center"
                header-align="center"
                label="未上架产品 | 账号">
              <template slot-scope="scope">
                {{scope.row.offline_product_qty}}<el-divider direction="vertical"></el-divider>{{scope.row.offline_account_qty}}
              </template>
            </el-table-column>

            <el-table-column
                prop="day7_qty"
                align="center"
                header-align="center"
                label="7天未上架产品">
            </el-table-column>
            <el-table-column
                prop="day7_online_qty"
                align="center"
                header-align="center"
                label="7天上架产品">
            </el-table-column>
            <el-table-column
                prop="avg_days"
                align="center"
                header-align="center"
                width="120"
                label="平均上架时长(天)">
            </el-table-column>

          </el-table>
        </el-tab-pane>

      </el-tabs>

  </div>
</template>

<script>
export default {
  name: "DevStatistic",
  data(){
    return{
      activeName: 'first',
      loading: false,
      allUsersData: [], //统计数据
      devData: null, //开发数据
    }
  },
  mounted() {
    this.initDevData()
    this.initAllUserData()
  },
  methods:{
    initDevData(){
      let url = '/api/dev_products/get_dev_data/'
      this.loading = true
      this.getRequest(url).then(resp => {
        this.loading = false
        if (resp) {
          this.devData = resp
        }
      })
    },
    initAllUserData(){
      let url = '/api/dev_products/get_all_users_data/'
      this.loading = true
      this.getRequest(url).then(resp => {
        this.loading = false
        if (resp) {
          this.allUsersData = resp
        }
      })
    }
  }
}
</script>

<style scoped>

</style>