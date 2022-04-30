<template>
  <div class="mainList">
    <div class="contain">
      <div class="operate">
        <div>
          <el-input size="small" placeholder="请输入用户名/姓名搜索"
                    clearable
                    @clear="clearSearchValue"
                    @keyup.enter.native="doSearch"
                    tooltip-effect="dark"
                    v-model="searchValue"
                    style="width: 350px; margin-right: 5px">
            <el-button slot="append" icon="el-icon-search" @click="doSearch">搜索</el-button>
          </el-input>

          <el-radio-group v-model="is_active" style="margin-right: 20px" @change="initUsers">
            <el-radio-button :label="true">已激活</el-radio-button>
            <el-radio-button :label="false">未激活</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <!--    用户列表-->
      <div style="margin-top: 5px">
        <el-table
            ref="userTable"
            :data="users"
            :header-cell-style="{background:'#fafafa'}"
            v-loading="loading"
            style="width: 100%">
          <el-table-column
              prop="username"
              label="用户名"
              min-width="250">
          </el-table-column>
          <el-table-column
              prop="first_name"
              label="姓名"
              width="180">
          </el-table-column>
          <el-table-column
              :formatter="datetimeFormat"
              prop="last_login"
              label="上次登录"
              width="180">
          </el-table-column>
          <el-table-column
              label="管理员"
              align="center"
              header-align="center"
              width="180">
            <template slot-scope="scope">
              <el-tag v-if="scope.row.is_superuser" type="success">管理员</el-tag>
              <el-tag v-if="!scope.row.is_superuser" >普通用户</el-tag>
            </template>
          </el-table-column>

          <el-table-column
              label="操作"
              width="100"
              align="center"
              header-align="center"
          >
            <template slot-scope="scope">
              <el-button
                  @click="goUserPermission(scope.row.id)"
                  type="text"
                  size="small">
                权限设置
              </el-button>
            </template>
          </el-table-column>

        </el-table>
      </div>
    </div>

  </div>
</template>

<script>
import moment from "moment";

export default {
  name: "SettingUsers",
  data() {
    return {
      users: [],
      loading: false,
      searchValue: '',
      is_active: true,
    }
  },
  mounted() {
    this.initUsers();
  },
  methods:{
    //查看用户权限
    goUserPermission(id) {
      this.$router.push({
        path: '/userPermission',
        query: {
          id: id
        }
      })
    },

    // 格式化日期时间
    datetimeFormat: function (row, column) {

      let date = row[column.property];

      if (date == undefined) {
        return ''
      }
      return moment(date).format("YYYY-MM-DD HH:mm:ss")

    },

    // 搜索
    doSearch() {
      this.$refs.userTable.clearFilter();
      this.initUsers();
    },
    // 重置搜索内容
    clearSearchValue() {
      this.searchValue = '';
      this.initUsers();
    },

    //初始化用户列表
    initUsers(){
      this.loading = true;
      let url = 'api/settings/users/?is_active=' + this.is_active
      if (this.searchValue) {
        url += '&search=' + this.searchValue;
      }
      this.getRequest(url).then(resp => {
        if (resp) {
          this.users = resp;
          this.loading = false;
        }
      })
    }
  }
}
</script>

<style scoped>
.mainList {
  display: flex;
  justify-content: center;
}
.contain{
  padding: 10px;
  background-color: white;
  margin-top: 10px;
  width: 1200px;
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