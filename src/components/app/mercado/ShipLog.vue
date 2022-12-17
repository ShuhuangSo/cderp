<template>
  <div>
    <el-card shadow="hover">
      <div slot="header" class="clearfix">
        <span style="font-weight: bold"><i class="el-icon-s-order"></i>操作日志</span>
      </div>
    <el-table
        :header-cell-style="{background:'#eef1f6'}"
        :data="operateLogs"
        border
        size="mini"
        style="width: 98%; margin: 10px">
      <el-table-column
          label="操作时间"
          align="center"
          header-align="center"
          width="180">
        <template slot-scope="scope">
          <div>{{ scope.row.create_time | dateTime }}</div>
        </template>
      </el-table-column>
      <el-table-column
          prop="desc"
          label="记录">
      </el-table-column>
      <el-table-column
          prop="user_name"
          label="操作人"
          align="center"
          header-align="center"
          width="180">
      </el-table-column>

    </el-table>
      <div class="pagination">
        <el-pagination
            background
            :hide-on-single-page="true"
            :page-sizes="[20, 30, 40, 50, 100]"
            @current-change="currentChange"
            @size-change="sizeChange"
            layout="sizes, prev, pager, next, jumper, ->, total"
            :current-page="page"
            :total="total">
        </el-pagination>
      </div>

    </el-card>


  </div>
</template>

<script>
import moment from "moment/moment";

export default {
  name: "ShipLog",
  props: ['shipID'],
  data(){
    return{
      operateLogs: [],
      loading: false,
      total: 0, // 总条数
      page: 1,  // 当前页
      size: 20,  // 页大小
    }
  },
  filters: {
    //时间日期格式化
    dateTime: function (value) {
      return moment(value).format("YYYY-MM-DD HH:mm");
    },
  },
  mounted() {
    this.initOperateLogs()
  },
  methods:{
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
      let url = '/api/ml_operate_log/?target_type=SHIP&page=' + this.page + '&page_size=' + this.size
      url += '&target_id=' + this.shipID
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
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}
</style>