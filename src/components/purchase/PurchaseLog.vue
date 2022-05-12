<template>
  <div>
    <el-card shadow="hover">
      <div slot="header" class="clearfix">
        <span style="font-weight: bold"><i class="el-icon-s-order"></i>操作日志</span>
      </div>
      <div>
        <el-table
            :header-cell-style="{background:'#eef1f6'}"
            :data="opLog"
            border
            size="mini"
            style="width: 98%; margin: 10px">
          <el-table-column
              prop="create_time"
              label="操作时间"
              :formatter="datetimeFormat"
              width="180">
          </el-table-column>
          <el-table-column
              prop="op_log"
              label="记录">
          </el-table-column>
          <el-table-column
              prop="user_name"
              label="操作人"
              width="180">
          </el-table-column>

        </el-table>
        <div>
          <el-pagination
              background
              :hide-on-single-page="true"
              :page-sizes="[20, 30, 40, 50, 100]"
              @current-change="opCurrentChange"
              @size-change="opSizeChange"
              layout="sizes, prev, pager, next, jumper, ->, total"
              :total="opTotal">
          </el-pagination>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import moment from "moment";

export default {
  name: "PurchaseLog",
  props: ['purchaseID'],
  data(){
    return{
      opLog: [], // 操作日志
      opTotal: 0, // 操作日志总条数
      opPage: 1,  // 操作日志当前页
      opSize: 20,  // 操作日志页大小
    }
  },
  mounted() {
    this.initLog();
  },
  methods:{
    // 分页大小
    opSizeChange(size) {
      this.opSize = size;
      this.initLog();
    },
    // 页码
    opCurrentChange(page) {
      this.opPage = page;
      this.initLog();
    },

    // 格式化日期时间
    datetimeFormat: function (row, column) {
      let date = row[column.property];

      if (date == undefined) {
        return ''
      }
      return moment(date).format("YYYY-MM-DD HH:mm:ss")

    },

    initLog(){
      //获取采购操作日志
      this.getRequest('/api/settings/op_logs/?op_type=PURCHASE&target_id=' + this.purchaseID +
          '&page=' + this.opPage + '&page_size=' + this.opSize).then(resp => {
        if (resp.results) {
          this.opLog = resp.results;
          this.opTotal = resp.count;
        }
      })
    }
  }
}
</script>

<style scoped>

</style>