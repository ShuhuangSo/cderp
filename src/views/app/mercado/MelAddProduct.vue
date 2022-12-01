/*
美客多FBM--添加产品
*/
<template>
  <div>
    <el-input size="small" placeholder="SKU 名称 ItemID UPC ML代码"
              clearable
              @clear="clearSearchValue"
              @keyup.enter.native="doSearch"
              v-model="searchValue"
              style="width: 350px; margin-right: 5px">
      <el-button slot="append" icon="el-icon-search" @click="doSearch">搜索</el-button>
    </el-input>

    <el-table
        ref="productTable"
        :header-cell-style="{background:'#eef1f6'}"
        :data="mlProducts"
        @selection-change="handleSelectionChange"
        border
        size="mini"
        style="width: 100%; margin-top: 10px">
      <el-table-column
          type="selection"
          width="42">
      </el-table-column>
      <el-table-column
          label="图片"
          align="center"
          header-align="center"
          width="80">
        <template slot-scope="scope">
          <el-image
              style="width: 40px; height: 40px"
              :src="scope.row.image"
              fit="fill">
          </el-image>
        </template>
      </el-table-column>
      <el-table-column
          prop="sku"
          label="SKU"
          align="center"
          header-align="center"
          width="80">
      </el-table-column>
      <el-table-column
          prop="p_name"
          label="产品名称">
      </el-table-column>

      <el-table-column
          prop="item_id"
          label="ItemID">
      </el-table-column>

    </el-table>

    <div class="pagination">
      <el-pagination
          background
          small
          :page-sizes="[20, 30, 40, 50, 100]"
          @current-change="currentChange"
          @size-change="sizeChange"
          layout="sizes, prev, pager, next, jumper, ->, total"
          :total="total">
      </el-pagination>
    </div>


  </div>
</template>

<script>
export default {
  name: "MelAddProduct",
  data(){
    return{
      loading: false,
      total: 0, // 总条数
      page: 1,  // 当前页
      size: 20,  // 页大小
      searchValue: '',
      mlProducts: [],
      multipleSelection: [] // 选中行
    }
  },
  methods:{
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    //提交选中的产品
    submitSelectProduct(){
      this.$emit('func',this.multipleSelection)
    },
    // 重置搜索内容
    clearSearchValue() {
      this.searchValue = '';
      this.initMLProducts();
    },
    // 搜索
    doSearch() {
      this.page = 1;
      this.$refs.productTable.clearFilter();
      this.initMLProducts();
    },
    // 分页大小
    sizeChange(size) {
      this.page = 1;
      this.size = size;
      this.initMLProducts();
    },
    // 页码
    currentChange(page) {
      this.page = page;
      this.initMLProducts();
    },
    initMLProducts() {
      let url = '/api/ml_products/?page=' + this.page + '&page_size=' + this.size
      if (this.searchValue) {
        url += '&search=' + this.searchValue;
      }
      url += '&ordering=-create_time,item_id'

      this.loading = true
      this.getRequest(url).then(resp => {
        this.loading = false
        if (resp.results) {
          this.mlProducts = resp.results;
          this.total = resp.count;
        }
      })
    }
  }
}
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}
</style>