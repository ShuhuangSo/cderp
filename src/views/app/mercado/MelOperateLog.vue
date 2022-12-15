<template>
  <div>
    <el-table
        ref="logsTable"
        :data="operateLogs"
        :header-cell-style="{background:'#fafafa'}"
        v-loading="loading"
        style="width: 100%">

      <el-table-column
          label="操作人"
          align="center"
          header-align="center"
          width="120">
        <template slot-scope="scope">
          <div>{{ scope.row.user_name}}</div>
        </template>
      </el-table-column>

      <el-table-column
          label="操作模块"
          align="center"
          header-align="center"
          width="120">
        <template slot-scope="scope">
          <div>{{ scope.row.op_module | m_name }}</div>
        </template>
      </el-table-column>

      <el-table-column
          label="操作对象"
          align="center"
          header-align="center"
          width="180">
        <template slot-scope="scope">
          <div>{{ scope.row.target_name }}</div>
        </template>
      </el-table-column>

      <el-table-column
          label="操作描述">
        <template slot-scope="scope">
          <div>{{ scope.row.desc }}</div>
        </template>
      </el-table-column>

      <el-table-column
          label="操作时间"
          align="center"
          header-align="center"
          width="180">
        <template slot-scope="scope">
          <div>{{ scope.row.create_time | dateTime }}</div>
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
          :current-page="page"
          :total="total">
      </el-pagination>
    </div>
  </div>
</template>

<script>
import moment from "moment";

export default {
  name: "MelOperateLog",
  data(){
    return{
      operateLogs: [],
      loading: false,
      total: 0, // 总条数
      page: 1,  // 当前页
      size: 20,  // 页大小
      searchValue: '',
    }
  },
  filters: {
    //时间日期格式化
    dateTime: function (value) {
      return moment(value).format("YYYY-MM-DD HH:mm");
    },
    //操作模块格式化
    m_name: function (value) {
      if (!value) return '';
      if (value === 'PRODUCT') return '产品库';
      if (value === 'SHIP') return '发仓运单';
      if (value === 'FBM') return 'FBM库存';
      if (value === 'ORDER') return '销售订单';
      if (value === 'FINANCE') return '财务管理';
    },
  },
  mounted() {
    this.initOperateLogs()
  },
  methods:{
    // 重置搜索内容
    clearSearchValue() {
      this.searchValue = '';
      this.initOperateLogs();
    },
    // 搜索
    doSearch() {
      this.page = 1;
      this.$refs.logsTable.clearFilter();
      this.initOperateLogs();
    },
    // 分页大小
    sizeChange(size) {
      this.page = 1;
      this.size = size;
      this.initOperateLogs();
    },
    // 页码
    currentChange(page) {
      this.page = page;
      this.initOperateLogs();
    },
    initOperateLogs(){
      let url = '/api/ml_operate_log/?page=' + this.page + '&page_size=' + this.size

      this.loading = true
      this.getRequest(url).then(resp => {
        this.loading = false
        if (resp.results) {
          this.operateLogs = resp.results;
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