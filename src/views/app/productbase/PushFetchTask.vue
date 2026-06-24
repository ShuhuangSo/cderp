<template>
  <div>
    <div class="operate">
      <div>
        <el-input size="small" placeholder="链接id"
                  clearable
                  @clear="clearSearchValue"
                  @keyup.enter.native="doSearch"
                  v-model="searchValue"
                  style="width: 350px; margin-right: 5px">
          <el-button slot="append" icon="el-icon-search" @click="doSearch">搜索</el-button>
        </el-input>

        <el-select v-model="user"
                   style="width: 150px;margin-left: 5px"
                   @change="changeFilter" placeholder="请选择筛选项">
          <el-option
              v-for="item in users"
              :key="item.first_name"
              :label="item.first_name"
              :value="item.username">
          </el-option>
        </el-select>

      </div>

    </div>
    <div style="margin-top: 5px">
      <el-table
          ref="taskTable"
          :data="taskList"
          :header-cell-style="{background:'#fafafa'}"
          v-loading="loading"
          style="width: 100%">

        <el-table-column
            label="操作人"
            align="center"
            header-align="center"
            width="120">
          <template slot-scope="scope">
            <div>{{ scope.row.creator}}</div>
          </template>
        </el-table-column>

        <el-table-column
            label="平台"
            align="center"
            header-align="center"
            width="120">
          <template slot-scope="scope">
            <div>{{ scope.row.platform }}</div>
          </template>
        </el-table-column>

        <el-table-column
            label="链接ID"
            align="center"
            header-align="center"
            width="180">
          <template slot-scope="scope">
            <div>{{ scope.row.item_id }}</div>
          </template>
        </el-table-column>

        <el-table-column
            label="任务进展">
          <template slot-scope="scope">
            <div>{{ scope.row.log }}</div>
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

  </div>
</template>

<script>
import moment from "moment/moment";

export default {
  name: "PushFetchTask",
  data(){
    return{
      taskList: [],
      loading: false,
      total: 0, // 总条数
      page: 1,  // 当前页
      size: 20,  // 页大小
      searchValue: '',
      users: [],
      user: null, //选择操作人
    }
  },
  filters: {
    //时间日期格式化
    dateTime: function (value) {
      return moment(value).format("YYYY-MM-DD HH:mm");
    },
  },
  mounted() {
    this.initTask()
    this.initUsers();
  },
  methods:{
    //改变筛选动作
    changeFilter(){
      this.page = 1;
      this.initTask();
    },
    // 重置搜索内容
    clearSearchValue() {
      this.searchValue = '';
      this.initTask();
    },
    // 搜索
    doSearch() {
      this.page = 1;
      this.$refs.taskTable.clearFilter();
      this.initTask();
    },
    // 分页大小
    sizeChange(size) {
      this.page = 1;
      this.size = size;
      this.initTask();
    },
    // 页码
    currentChange(page) {
      this.page = page;
      this.initTask();
    },
    //初始化用户列表
    initUsers() {
      let url = 'api/settings/users/?is_active=True&last_name=STAFF&&page_size=1000'
      this.getRequest(url).then(resp => {
        if (resp) {
          this.users = resp;
          this.users.unshift({'first_name': '全部用户', 'username': null})
        }
      })
    },
    initTask(){
      let url = '/api/fetch_tasks/?page=' + this.page + '&page_size=' + this.size
      if (this.user) {
        url += '&creator=' + this.user;
      }
      if (this.searchValue) {
        url += '&search=' + this.searchValue;
      }
      this.loading = true
      this.getRequest(url).then(resp => {
        this.loading = false
        if (resp.results) {
          this.taskList = resp.results;
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