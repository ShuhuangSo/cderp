/*
美客多FBM库存
*/
<template>
  <div>
    <div class="operate">
      <div>
        <el-input size="small" placeholder="SKU 名称 ItemID UPC ML代码"
                  clearable
                  @clear="clearSearchValue"
                  @keyup.enter.native="doSearch"
                  v-model="searchValue"
                  style="width: 350px; margin-right: 5px">
          <el-button slot="append" icon="el-icon-search" @click="doSearch">搜索</el-button>
        </el-input>
      </div>

      <div>
        <el-button type="success" icon="el-icon-plus"
                   style="margin-right: 10px"
                   @click="uploadVisible=true">产品导入
        </el-button>
      </div>
    </div>

    <div style="margin-top: 5px">
      <el-table
          ref="productTable"
          :data="shopStocks"
          :header-cell-style="{background:'#fafafa'}"
          v-loading="loading"
          style="width: 100%">

        <el-table-column
            label="图片"
            align="center"
            header-align="center"
            width="60">
          <template slot-scope="scope">
            <el-image
                style="width: 50px; height: 50px"
                :src="scope.row.image"
                :preview-src-list="[scope.row.image]"
                fit="fill">
            </el-image>
          </template>
        </el-table-column>

        <el-table-column
            label="产品"
            show-overflow-tooltip>
          <template slot-scope="scope">
            <div>{{ scope.row.sku }}</div>

            <div>{{ scope.row.p_name }}</div>
          </template>
        </el-table-column>

        <el-table-column
            label="ItemID"
            show-overflow-tooltip
            width="120">
          <template slot-scope="scope">
            <div>{{ scope.row.item_id }}</div>
          </template>
        </el-table-column>

      </el-table>

      <div class="pagination">
        <el-pagination
            background
            :page-sizes="[20, 30, 40, 50, 100]"
            @current-change="currentChange"
            @size-change="sizeChange"
            layout="sizes, prev, pager, next, jumper, ->, total"
            :total="total">
        </el-pagination>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  name: "MelShopStock",
  data(){
    return{
      shops: null,
      shopStocks: null,
      loading: false,
      total: 0, // 总条数
      page: 1,  // 当前页
      size: 20,  // 页大小
      searchValue: '',
    }
  },
  mounted() {
    this.initShopStock();
  },
  methods:{
    // 重置搜索内容
    clearSearchValue() {
      this.searchValue = '';
      this.initShopStock();
    },
    // 搜索
    doSearch() {
      this.page = 1;
      this.$refs.productTable.clearFilter();
      this.initShopStock();
    },
    // 分页大小
    sizeChange(size) {
      this.page = 1;
      this.size = size;
      this.initShopStock();
    },
    // 页码
    currentChange(page) {
      this.page = page;
      this.initShopStock();
    },
    initShopStock(){
      let url = '/api/ml_shopstock/?shop=1&page=' + this.page + '&page_size=' + this.size
      if (this.searchValue) {
        url += '&search=' + this.searchValue;
      }
      url += '&ordering=-create_time,item_id'

      this.loading = true
      this.getRequest(url).then(resp => {
        this.loading = false
        if (resp.results) {
          this.shopStocks = resp.results;
          this.total = resp.count;
        }
      })
    }
  }
}
</script>

<style scoped>
.operate {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
}
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}
</style>