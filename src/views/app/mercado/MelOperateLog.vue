<template>
  <div>
    <div class="operate">
      <div>
        <el-input size="small" placeholder="操作描述"
                  clearable
                  @clear="clearSearchValue"
                  @keyup.enter.native="doSearch"
                  v-model="searchValue"
                  style="width: 350px; margin-right: 5px">
          <el-button slot="append" icon="el-icon-search" @click="doSearch">搜索</el-button>
        </el-input>

        <el-select v-model="module_name"
                   style="width: 150px;margin-left: 5px"
                   @change="changeFilter" placeholder="请选择筛选项">
          <el-option
              v-for="item in module_group"
              :key="item.name"
              :label="item.name"
              :value="item.value">
          </el-option>
        </el-select>

        <el-select v-model="type_name"
                   style="width: 150px;margin-left: 5px"
                   @change="changeFilter" placeholder="请选择筛选项">
          <el-option
              v-for="item in type_group"
              :key="item.name"
              :label="item.name"
              :value="item.value">
          </el-option>
        </el-select>

        <el-select v-model="user"
                   style="width: 150px;margin-left: 5px"
                   @change="changeFilter" placeholder="请选择筛选项">
          <el-option
              v-for="item in users"
              :key="item.first_name"
              :label="item.first_name"
              :value="item.id">
          </el-option>
        </el-select>

        <el-date-picker
            v-model="cus_date"
            :editable="false"
            :clearable="false"
            type="datetimerange"
            align="right"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd HH:mm:ss"
            style="margin-left: 5px"
            @change="changeFilter"
            :default-time="['00:00:00', '23:59:59']">
        </el-date-picker>

        <el-link @click.native="clearFilter"
                 style="margin-left: 10px;"
                 :underline="false"><i class="el-icon-delete"></i></el-link>

      </div>

    </div>

    <div style="margin-top: 5px">
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

  </div>
</template>

<script>
import moment from "moment";

export default {
  name: "MelOperateLog",
  data(){
    return{
      operateLogs: [],
      users: [],
      user: null, //选择操作人
      loading: false,
      total: 0, // 总条数
      page: 1,  // 当前页
      size: 20,  // 页大小
      searchValue: '',
      module_name: '', //操作模块
      type_name: '', //操作类型
      cus_date: '', //日期时间
      module_group: [
        {
          name: '全部模块',
          value: ''
        },
        {
          name: '产品库',
          value: '&op_module=PRODUCT'
        },
        {
          name: '采购管理',
          value: '&op_module=PURCHASE'
        },
        {
          name: '发仓运单',
          value: '&op_module=SHIP'
        },
        {
          name: 'FBM库存',
          value: '&op_module=FBM'
        },
        {
          name: '中转仓',
          value: '&op_module=TRANS'
        },
        {
          name: '销售订单',
          value: '&op_module=ORDER'
        },
        {
          name: '财务管理',
          value: '&op_module=FINANCE'
        },
      ],
      type_group: [
        {
          name: '全部操作',
          value: ''
        },
        {
          name: '创建',
          value: '&op_type=CREATE'
        },
        {
          name: '修改',
          value: '&op_type=EDIT'
        },
        {
          name: '删除',
          value: '&op_type=DEL'
        },
        {
          name: '查看',
          value: '&op_type=GET'
        },
      ],
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
      if (value === 'TRANS') return '中转仓';
      if (value === 'ORDER') return '销售订单';
      if (value === 'FINANCE') return '财务管理';
      if (value === 'PURCHASE') return '采购管理';
      if (value === 'SYSTEM') return '系统管理';
    },
  },
  mounted() {
    this.initOperateLogs()
    this.initUsers();
  },
  methods:{
    //改变筛选动作
    changeFilter(){
      this.page = 1;
      this.initOperateLogs();
    },
    clearFilter(){
      this.page = 1;
      this.user = null;
      this.cus_date = ''
      this.module_name = ''
      this.type_name = ''
      this.initOperateLogs();
    },
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
    //初始化用户列表
    initUsers() {
      let url = 'api/settings/users/?is_active=True&last_name=STAFF&&page_size=1000'
      this.getRequest(url).then(resp => {
        if (resp) {
          this.users = resp;
          this.users.unshift({'first_name': '全部用户', 'id': null})
        }
      })
    },

    initOperateLogs(){
      let url = '/api/ml_operate_log/?page=' + this.page + '&page_size=' + this.size
      if (this.searchValue) {
        url += '&search=' + this.searchValue;
      }
      if (this.module_name) {
        url += this.module_name;
      }
      if (this.type_name) {
        url += this.type_name;
      }
      if (this.user) {
        url += '&user=' + this.user;
      }
      if (this.cus_date) {
        url += '&create_time__gte=' + this.cus_date[0];
        url += '&create_time__lte=' + this.cus_date[1];
      }
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