<template>
  <div class="mainList">
    <div class="contain">

      <el-tabs type="card" v-model="user_type" @tab-click="handleClick">
        <el-tab-pane label="内部账号" name="STAFF">
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
                <el-radio-button :label="false">禁用</el-radio-button>
              </el-radio-group>
            </div>
            <div>
              <el-button type="success" icon="el-icon-plus" @click="dialogVisible=true">注册用户</el-button>
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
                  label="用户名/手机号"
                  min-width="250">
              </el-table-column>
              <el-table-column
                  prop="first_name"
                  label="姓名"
                  align="center"
                  header-align="center"
                  width="180">
              </el-table-column>
              <el-table-column
                  :formatter="datetimeFormat"
                  prop="date_joined"
                  label="注册日期"
                  align="center"
                  header-align="center"
                  width="180">
              </el-table-column>
              <el-table-column
                  label="管理员"
                  align="center"
                  header-align="center"
                  width="180">
                <template slot-scope="scope">
                  <el-tag v-if="scope.row.is_superuser" type="success">管理员</el-tag>
                  <el-tag v-if="!scope.row.is_superuser">普通用户</el-tag>
                </template>
              </el-table-column>

              <el-table-column
                  label="操作"
                  width="300"
                  align="center"
                  header-align="center"
              >
                <template slot-scope="scope">
                  <el-button
                      @click="checkUser(scope.row)"
                      type="text"
                      size="small">
                    查看
                  </el-button>
                  <el-divider direction="vertical"></el-divider>
                  <el-button
                      @click="goUserPermission(scope.row)"
                      type="text"
                      size="small">
                    菜单权限
                  </el-button>
                  <el-divider direction="vertical"></el-divider>
                  <el-button
                      @click="goMLPermission(scope.row)"
                      type="text"
                      size="small">
                    美客多权限
                  </el-button>
                  <el-divider direction="vertical"></el-divider>
                  <el-button
                      @click="goGuiShu(scope.row)"
                      type="text"
                      size="small">
                    归属权转移
                  </el-button>
                </template>
              </el-table-column>

            </el-table>
          </div>
        </el-tab-pane>
        <el-tab-pane label="供应商账号" name="SUPPLIER">
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
                <el-radio-button :label="false">禁用</el-radio-button>
              </el-radio-group>
            </div>
            <div>
              <el-button type="success" icon="el-icon-plus" @click="dialogVisible=true">注册用户</el-button>
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
                  label="用户名/手机号"
                  min-width="250">
              </el-table-column>
              <el-table-column
                  prop="first_name"
                  label="姓名"
                  align="center"
                  header-align="center"
                  width="180">
              </el-table-column>
              <el-table-column
                  :formatter="datetimeFormat"
                  prop="date_joined"
                  label="注册日期"
                  align="center"
                  header-align="center"
                  width="180">
              </el-table-column>
              <el-table-column
                  label="管理员"
                  align="center"
                  header-align="center"
                  width="180">
                <template slot-scope="scope">
                  <el-tag v-if="scope.row.is_superuser" type="success">管理员</el-tag>
                  <el-tag v-if="!scope.row.is_superuser">普通用户</el-tag>
                </template>
              </el-table-column>

              <el-table-column
                  label="操作"
                  width="200"
                  align="center"
                  header-align="center"
              >
                <template slot-scope="scope">
                  <el-button
                      @click="checkUser(scope.row)"
                      type="text"
                      size="small">
                    查看
                  </el-button>
                  <el-divider direction="vertical"></el-divider>
                  <el-button
                      @click="goUserPermission(scope.row)"
                      type="text"
                      size="small">
                    菜单权限
                  </el-button>
                </template>
              </el-table-column>

            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>


<!--      用户资料弹窗-->
      <el-dialog
          :title="user.id? '用户资料':'注册用户'"
          top="60px"
          :destroy-on-close="true"
          :visible.sync="dialogVisible"
          width="400">
        <el-form ref="userForm" status-icon :rules="rules" :model="user" label-width="100px">
          <el-form-item v-if="!user.id" prop="username" label="手机号" required>
            <el-input
                class="inputwidth"
                placeholder="请输入手机号"
                :disabled="user.id"
                v-model="user.username">
            </el-input>
          </el-form-item>
          <el-form-item v-if="user.id" label="手机号">
            <el-input
                class="inputwidth"
                placeholder="请输入手机号"
                :disabled="user.id"
                v-model="user.username">
            </el-input>
          </el-form-item>

          <el-form-item v-if="!user.id" prop="password" label="密码" required>
            <el-input
                type="password"
                show-password
                class="inputwidth"
                placeholder="请输入密码"
                v-model="user.password">
            </el-input>
          </el-form-item>

          <el-form-item v-if="user.id" label="密码" >
            <el-input
                show-password
                type="password"
                class="inputwidth"
                placeholder="修改密码"
                v-model="user.password">
            </el-input>
          </el-form-item>

          <el-form-item v-if="!user.id" prop="password2" label="确认密码" required>
            <el-input
                type="password"
                class="inputwidth"
                show-password
                placeholder="请再次确认密码"
                v-model="user.password2">
            </el-input>
          </el-form-item>

          <el-form-item prop="first_name" label="姓名" required>
            <el-input
                class="inputwidth"
                placeholder="请输入姓名"
                v-model="user.first_name">
            </el-input>
          </el-form-item>

          <el-form-item label="账号类型">
            <el-select v-model="user.last_name" placeholder="请选择">
              <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item prop="email" label="邮箱">
            <el-input
                class="inputwidth"
                placeholder="请输入邮箱地址"
                v-model="user.email">
            </el-input>
          </el-form-item>

          <el-form-item label="是否管理员">
            <el-switch
                v-model="user.is_superuser">
            </el-switch>
          </el-form-item>

          <el-form-item v-if="user.id" label="激活">
            <el-switch
                active-color="#13ce66"
                inactive-color="#ff4949"
                v-model="user.is_active">
            </el-switch>
          </el-form-item>

        </el-form>
        <span slot="footer" class="dialog-footer">
    <el-button @click="dialogVisible=false">取 消</el-button>
    <el-button v-if="!user.id" type="primary" @click="submitForm">确 定</el-button>
          <el-button v-if="user.id" type="primary" @click="editForm">保 存</el-button>
  </span>
      </el-dialog>

      <!--      归属权转移弹窗-->
      <el-dialog
          title="归属权转移"
          top="60px"
          :destroy-on-close="true"
          :visible.sync="guishuVisible"
          width="400">
        <el-form label-width="100px">
          <el-alert
              title="本次操作将转移所有产品库，未完成运单，中转仓库产品的归属权，请谨慎操作！"
              type="warning"
              :closable="false"
              show-icon>
          </el-alert>

          <el-form-item style="margin-top: 15px" label="转出用户" >
            {{this.user.first_name}}
          </el-form-item>

          <el-form-item label="目标用户">
            <el-select v-model="guishu.target_id" placeholder="请选择">
              <el-option
                  v-for="item in users"
                  :key="item.id"
                  :label="item.first_name"
                  :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>


          <el-form-item label="确认转移">
            <el-switch
                v-model="guishu.check_status">
            </el-switch>
          </el-form-item>

        </el-form>
        <span slot="footer" class="dialog-footer">
    <el-button @click="guishuVisible=false">取 消</el-button>
    <el-button type="primary" :disabled="!guishu.check_status || !guishu.target_id"
               :loading="guishu_loading"
               @click="submit_guishu">确 定</el-button>

  </span>
      </el-dialog>
    </div>

  </div>
</template>

<script>
import moment from "moment";

export default {
  name: "SettingUsers",
  data() {

    // 设置手机号的验证规则
    const phone = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入联系方式'))
      } else {
        const reg = /^1[3|4|5|6|7|8][0-9]\d{8}$/
        // const phoneReg = /^1[34578]\d{9}$/
        if (reg.test(value)) {
          callback()
        } else {
          return callback(new Error('请输入正确的手机号'))
        }
      }
    };

    let validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'));
      } else if (value !== this.user.password) {
        callback(new Error('两次输入密码不一致!'));
      } else {
        callback();
      }
    };
    return {
      users: [],
      loading: false,
      guishu_loading: false,
      searchValue: '',
      is_active: true,
      dialogVisible: false,
      guishuVisible: false, //归属弹窗
      guishu: {
        target_id: null,
        check_status: false
      },
      user_type: 'STAFF',
      user: {
        id: null,
        username: '',
        password: '',
        password2: '',
        first_name: '',
        last_name: 'STAFF',
        email: '',
        is_superuser: false,
        is_active: false
      },
      options: [{
        value: 'STAFF',
        label: '内部员工'
      }, {
        value: 'SUPPLIER',
        label: '供应商'
      }],
      rules: {
        username: [
          {required: true, message: '请输入手机号', trigger: 'blur'},
          {validator: phone, trigger: 'blur'},
        ],
        password: [
          {required: true, message: '请输入密码', trigger: 'blur'},
        ],
        password2: [
          {validator: validatePass, trigger: 'blur'}
        ],
        first_name: [
          {required: true, message: '请输入姓名', trigger: 'blur'},
        ],
      },

    }
  },
  mounted() {
    this.initUsers();
  },
  methods: {
    //提交归属转移
    submit_guishu(){
      this.guishu_loading = true
      this.postRequest('api/settings/all_ml_permission/guishu/', {'from_id':this.user.id, 'target_id': this.guishu.target_id}).then(resp => {
        this.guishu_loading = false
        if (resp) {
          this.guishuVisible = false

        }
      })
    },
    // 点击tab事件
    handleClick(tab, event) {
      this.user_type = tab.name;
      this.initUsers()
    },

    //查看用户
    checkUser(obj) {
      this.user = Object.assign({}, obj)
      this.dialogVisible = true;
    },

    //编辑用户
    editForm() {
      this.$confirm('是否确认修改？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$refs.userForm.validate((valid) => {
          if (valid) {
            this.loading = true;
            this.putRequest('api/settings/users/edit_user/', this.user).then(resp => {
              if (resp) {
                this.dialogVisible = false;
                this.initUsers();

              }
              this.loading = false;
            })
          } else {
            return false;
          }
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        });
      });
    },

    //注册用户
    submitForm() {
      this.$confirm('是否确认注册？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$refs.userForm.validate((valid) => {
          if (valid) {
            this.loading = true;
            this.postRequest('api/settings/users/create_user/', this.user).then(resp => {
              if (resp) {
                if (resp.success) {
                  this.dialogVisible = false;
                  this.$router.push({
                    path: '/userPermission',
                    query: {
                      id: resp.id,
                      name: resp.name
                    }
                  })
                }

              }
              this.loading = false;
            })
          } else {
            return false;
          }
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        });
      });
    },

    //查看用户权限
    goUserPermission(obj) {
      this.$router.push({
        path: '/userPermission',
        query: {
          id: obj.id,
          name: obj.first_name
        }
      })
    },

    //查看用户权限
    goMLPermission(obj) {
      this.$router.push({
        path: '/mlPermission',
        query: {
          id: obj.id,
          name: obj.first_name
        }
      })
    },

    //归属权转移
    goGuiShu(obj) {
      this.user = Object.assign({}, obj)
      this.guishuVisible = true
    },

    // 格式化日期时间
    datetimeFormat: function (row, column) {

      let date = row[column.property];

      if (date == undefined) {
        return ''
      }
      return moment(date).format("YYYY-MM-DD")

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
    initUsers() {
      this.loading = true;
      let url = 'api/settings/users/?is_active=' + this.is_active
      if (this.searchValue) {
        url += '&search=' + this.searchValue;
      }
      if (this.user_type) {
        url += '&last_name=' + this.user_type;
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

.contain {
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

.inputwidth {
  width: 80%;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}
</style>