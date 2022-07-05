<template>
    <el-card class="card" shadow="never">
      <span class="chartTitle">统计月份</span>
      <el-button style="float: right " type="success"
                 :disabled="multipleSelection.length===0"
                 @click="openExport">下载提成数据</el-button>
      <el-table
          :data="months"
          v-loading="loading"
          ref="monthsTable"
          @selection-change="handleSelectionChange"
          style="width: 100%">
        <el-table-column
            type="selection"
            width="42">
        </el-table-column>
        <el-table-column
            align="center"
            header-align="center"
            label="月份">
          <template slot-scope="scope">
            <span>{{scope.row.month | monthFormat}}</span>
          </template>
        </el-table-column>
        <el-table-column
            align="center"
            header-align="center"
            label="操作">
          <template slot-scope="scope">
            <el-button v-if="scope.row.status" size="mini" plain type="primary" @click="checkMonth(scope.row.month)">详情</el-button>
            <el-button v-if="!scope.row.status" size="mini" plain type="warning" @click="checkMonth(scope.row.month)">待录入</el-button>
          </template>
        </el-table-column>

      </el-table>
      <el-pagination
          style="margin-top: 10px"
          background
          small
          :hide-on-single-page="true"
          layout="prev, pager, next, ->, total"
          @current-change="currentChange"
          :page-size="size"
          :total="total">
      </el-pagination>

      <el-dialog
          title="提成数据导出"
          :close-on-click-modal="false"
          :visible.sync="exportVisible"
          width="400px"
      >
        <el-select v-model="manager" placeholder="请选择员工名称" class="inputwidth">
          <el-option
              v-for="item in managers"
              :key="item.id"
              :label="item.name"
              :value="item.name">
          </el-option>
        </el-select>
        <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="exportVisible=false">取 消</el-button>
          <el-button :disabled="!manager" size="small" type="primary"
                     :loading="loading"
                     @click="downloadExcel">下 载</el-button>
      </span>
      </el-dialog>
    </el-card>

</template>

<script>
export default {
  name: "MonthList",
  data(){
    return{
      months: [],
      loading: false,
      total: 0, // 总条数
      page: 1,  // 当前页
      size: 10,  // 页大小
      multipleSelection: [], // 选中行
      exportVisible: false,
      managers: [],
      manager: null,
    }
  },
  filters: {
    //信息格式化
    monthFormat: function (value) {
      let year = value.substring(0,4)
      let mon = value.substring(4)
      return year + '年' + mon + '月'
    },
  },
  mounted() {
    this.initMonths();
  },
  methods:{
    //下载报表
    downloadExcel(){
      let all_months = []
      this.multipleSelection.forEach(item=>{
        all_months.push({"month": item.month})
      })
      let data = {"months": all_months, "manager": this.manager}
      let url = 'api/bo_account_bonus/export_bonus/'
      this.loading = true
      this.postRequest(url, data).then(resp => {
        this.loading = false
        if (resp) {
          this.exportVisible=false
          this.$refs.monthsTable.clearSelection();
          window.open(resp.url, '_blank')
        }
      })
    },
    // 打开下载报表窗口
    openExport(){
      this.initManagers();
      this.exportVisible=true
    },
    //查看详细月份
    checkMonth(month){
      this.$router.push({
        path: '/monthDetail',
        query: {
          month: month
        }
      });
    },
    // 页码
    currentChange(page) {
      this.page = page;
      this.initMonths();
    },
    //选行
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    initManagers(){
      let url = 'api/bo_manager/'
      this.getRequest(url).then(resp => {
        if (resp) {
          this.managers = resp
        }
      })
    },

    initMonths(){
      this.loading = true
      let url = 'api/bo_month_list/?page=' + this.page + '&page_size=' + this.size;
      this.getRequest(url).then(resp => {
        this.loading = false
        if (resp.results) {
          this.months = resp.results;
          this.total = resp.count;
        }
      })
    }
  }
}
</script>

<style scoped>
.chartTitle {
  font-weight: bold;
  margin-right: 20px
}
.inputwidth{
  width: 100%;
}
</style>