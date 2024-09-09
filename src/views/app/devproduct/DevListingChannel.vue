<template>
  <div>
    <el-table
        :header-cell-style="{background:'#eef1f6'}"
        :data="listingChannel"
        border
        size="mini"
        style="width: 50%; margin: 10px">
      <el-table-column
          prop="platform"
          label="平台"
          align="center"
          header-align="center"
          width="180">
      </el-table-column>
      <el-table-column
          prop="site"
          label="站点"
          align="center"
          header-align="center"
          width="180">
      </el-table-column>
      <el-table-column
          align="center"
          header-align="center"
          label="是否发布">
        <template slot-scope="scope">
          <el-checkbox @change="updateChannel(scope.row)"
                       :disabled="!permission.devproduct_online_list"
                       v-model="scope.row.is_active"></el-checkbox>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: "DevListingChannel",
  props: ['productID'],
  data(){
    return{
      permission: JSON.parse(window.sessionStorage.getItem('ml_permission')),
      listingChannel: [],
      loading: false,
    }
  },
  mounted() {
    this.initListingChannel()
  },
  methods:{
    // 修改渠道
    updateChannel(row){
      this.$confirm('是否确定变更？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        let url = 'api/dev_channel/update_channel/'
        this.postRequest(url, {'id': row.id, 'is_active': row.is_active}).then(resp => {
          this.loading = false
          if (resp) {
            this.initListingChannel();
          }
        })
      }).catch(() => {
        this.initListingChannel();
        this.$message({
          type: 'info',
          message: '已取消'
        });
      });
    },
    initListingChannel(){
      this.loading = true;
      // 获取渠道数据
      this.getRequest('api/dev_channel/?dev_p__id=' + this.productID).then(resp => {
        this.loading = false;
        if (resp) {
          this.listingChannel = resp
        }
      })
    }
  }
}
</script>

<style scoped>

</style>