<template>
  <div class="supplierList">
    <div class="operate">
      <div>
        <el-input size="small" placeholder="请输入供应商名称搜索"
                  clearable
                  @clear="clearSearchValue"
                  @keyup.enter.native="doSearch"
                  v-model="searchValue"
                  style="width: 350px; margin-right: 5px">
          <el-button slot="append" icon="el-icon-search" @click="doSearch">搜索</el-button>
        </el-input>
      </div>
      <div>
        <el-button type="success" icon="el-icon-plus" @click="createSupplier">新增供应商</el-button>
      </div>
    </div>

    <!--    供应商列表-->
    <div style="margin-top: 5px">
      <el-table
          ref="suppliersTable"
          :data="suppliers"
          :header-cell-style="{background:'#fafafa'}"
          v-loading="loading"
          style="width: 100%">
        <el-table-column
            prop="supplier_name"
            label="供应商名称"
            min-width="250">
        </el-table-column>
        <el-table-column
            prop="contact_name"
            label="联系人"
            width="180">
        </el-table-column>
        <el-table-column
            prop="wechat"
            label="微信"
            width="180">
        </el-table-column>
        <el-table-column
            prop="phone"
            label="电话"
            width="180">
        </el-table-column>
        <el-table-column
            :formatter="buyWayFormat"
            prop="buy_way"
            label="采购渠道">
        </el-table-column>
        <el-table-column
            label="操作"
            width="100"
            align="center"
            header-align="center"
        >
          <template slot-scope="scope">
            <el-button
                @click="checkSupplier(scope.row.id)"
                type="text"
                size="small">
              查看
            </el-button>
          </template>
        </el-table-column>

      </el-table>
    </div>

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
</template>

<script>
export default {
  name: "PurchaseSupplierList",
  data(){
    return{
      suppliers:[],
      total: 0,
      page: 1,
      size: 20,
      loading: false,
      searchValue: '',
    }
  },
  mounted() {
    this.initSuppliers();
  },
  methods:{
    // 采购渠道信息格式化
    buyWayFormat: function (row, column) {

      let value = row[column.property];

      if (value === '1688') {
        return '1688'
      }
      if (value === 'FACTORY') {
        return '工厂'
      }
      if (value === 'OTHERS') {
        return '其它'
      }
      return '';
    },

    //查看编辑供应商
    checkSupplier(id){
      this.$router.push({
        path: '/createSupplier',
        query: {
          id: id
        }
      });
    },

    //创建供应商
    createSupplier(){
      this.$router.push('/createSupplier');
    },

    // 分页大小
    sizeChange(size) {
      this.size = size;
      this.initSuppliers();
    },
    // 页码
    currentChange(page) {
      this.page = page;
      this.initSuppliers();
    },

    // 搜索
    doSearch() {
      this.$refs.suppliersTable.clearFilter();
      this.initSuppliers();
    },
    // 重置搜索内容
    clearSearchValue() {
      this.searchValue = '';
      this.initSuppliers();
    },

    //初始化供应商列表
    initSuppliers(){
      let url = 'api/suppliers/?page=' + this.page + '&page_size=' + this.size;

      if (this.searchValue) {
        url += '&search=' + this.searchValue;
      }
      this.getRequest(url).then(resp => {
        if (resp.results) {
          this.suppliers = resp.results;
          this.total = resp.count;
          this.loading = false;
        }
      })
    }

  }
}
</script>

<style scoped>
.supplierList {
  padding: 10px;
  background-color: white;
  margin-top: 10px;
}
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