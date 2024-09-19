<template>
  <div>
    <el-table
        ref="productTable"
        :header-cell-style="{background:'#eef1f6'}"
        :data="products"
        border
        size="mini"
        style="width: 98%; margin: 10px">
      <el-table-column
          label="图片"
          align="center"
          header-align="center"
          width="80">
        <template slot-scope="scope">
          <el-image
              style="width: 50px; height: 50px"
              :src="scope.row.image | smpic"
              :preview-src-list="[scope.row.image?scope.row.image+'?' + Math.random():'']"
              fit="fill">
          </el-image>
        </template>
      </el-table-column>
      <el-table-column
          label="状态"
          align="center"
          header-align="center"
          width="100">
        <template slot-scope="scope">
          {{ scope.row.p_status | st}}
        </template>

      </el-table-column>
      <el-table-column
          label="SKU"
          align="center"
          header-align="center"
          width="120">
        <template slot-scope="scope">
          <div :class="scope.row.main?'main':''">{{scope.row.sku}}</div>
        </template>
      </el-table-column>
      <el-table-column
          prop="cn_name"
          label="名称"
          align="left"
          header-align="left">
        <template slot-scope="scope">
          <div>{{scope.row.cn_name}}</div>
          <div>{{scope.row.en_name}}</div>
        </template>
      </el-table-column>
      <el-table-column
          label="操作"
          align="center"
          header-align="center"
          v-if="permission.devproduct_cp"
          width="120">
        <template slot-scope="scope">
          <el-button size="mini" plain @click="upcProduct(scope.row.id)">解除关联</el-button>
        </template>
      </el-table-column>

    </el-table>
  </div>
</template>

<script>
export default {
  name: "DevCp",
  props: ['productID'],
  data(){
    return{
      permission: JSON.parse(window.sessionStorage.getItem('ml_permission')),
      loading: false,
      products: []
    }
  },
  filters:{
    //格式化状态名称
    st: function (value) {
      let name = ''
      switch (value){
        case 'DRAFT':
          name = '草稿'
          break
        case 'OFFLINE':
          name = '已下线'
          break
        case 'ONLINE':
          name = '发布中'
          break
        default:
          name = '其它'
          break
      }
      return name
    },
    //图片地址格式化
    smpic: function (value) {
      if (!value) return '';
      let url = value.slice(0, value.length-4)
      return url + '_100x100.jpg/?' + Math.random()
    },
  },
  mounted() {
    this.initProducts()
  },
  methods:{
    //解除关联
    upcProduct(id){
      this.$confirm('是否确认解除关联?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        this.postRequest('api/dev_products/ucp_products/', {'id': id}).then(resp => {
          this.loading = false
          if (resp.status === 'success') {
            this.initProducts();
          }
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消'
          });
        });
      })
    },
    initProducts(){
      let url = '/api/dev_products/get_cp_list/'
      this.loading = true
      this.postRequest(url, {'id': this.productID}).then(resp => {
        this.loading = false
        if (resp) {
          this.products = resp
        }
      })
    }
  }
}
</script>

<style scoped>
.main{
  color: #409EFF;
}
</style>