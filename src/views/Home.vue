<template>

    <el-container  style="height: 100%">
      <el-header class="headerMenu">

        <div style="display: flex; justify-content: left">
          <router-link to="/home">
            <el-tooltip class="item" effect="light" content="系统版本: v0.91" placement="bottom">
              <img src="../assets/logo-m.png" alt="CaseDance"  class="logo">
            </el-tooltip>

          </router-link>

<!--          导航菜单-->
          <el-menu
              router
              mode="horizontal"
              background-color="#313132"
              text-color="#d6d6d6"
              active-text-color="#409EFF">
            <el-submenu :index="index+''" v-for="(item, index) in routes" :key="index"
                        v-if="!item.hidden">
              <template slot="title">{{ item.name }}</template>
              <el-menu-item :index="children.path" v-for="(children, indexj) in item.children" :key="indexj">
                {{ children.name }}
              </el-menu-item>
            </el-submenu>
          </el-menu>
        </div>

        <div class="avatar">
          <el-dropdown style="margin-bottom: 10px" @command="commandHandler">
          <span class="el-dropdown-link">
            <i class="el-icon-user"></i>{{ user.name }}<i class="el-icon-arrow-down el-icon--right"></i>
          </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="userinfo">用户信息</el-dropdown-item>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>

      </el-header>

      <el-main>
        <el-breadcrumb separator-class="el-icon-arrow-right" v-if="this.$router.currentRoute.path!='/home' && this.$router.currentRoute.path!='/orderPOS' && this.$router.currentRoute.path!='/dashboard'">
          <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>{{ this.$router.currentRoute.name }}</el-breadcrumb-item>
        </el-breadcrumb>
        <router-view/>
      </el-main>
      <el-backtop target=".el-main" :bottom="100"></el-backtop>
    </el-container>

</template>

<script>
export default {
  name: "Home",
  computed: {
    routes() {
      return this.$store.state.routes;
    }
  },
  data() {
    return {
      user: JSON.parse(window.sessionStorage.getItem('user'))
    }
  },

  methods:{
    commandHandler(command){
      if(command=='logout'){
        this.$confirm('是否注销退出系统?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          // 清空用户信息
          window.localStorage.removeItem('tokenStr');
          window.sessionStorage.removeItem('user');
          //清空vuex里的菜单信息
          this.$store.commit('initRoutes', []);
          //跳转到登录页
          this.$router.replace('/');
          this.$message({
            type: 'success',
            message: '注销成功!'
          });
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消'
          });
        });

      }
    }
  }
}
</script>

<style scoped>
.headerMenu {
  margin: 0px;
  padding: 0px;
  display: flex;
  justify-content: space-between;
  background-color: #313132;
}

.avatar {
  margin-top: 17px;
  margin-right: 150px;
}

.el-dropdown-link {
  cursor: pointer;
  color: #d6d6d6;
}

.el-icon-arrow-down {
  font-size: 12px;
}
.el-icon-user{
  margin-right: 5px;
  margin-top: 2px;
}
.logo{
  height: 30px;
  margin-top: 15px;
  margin-right: 50px;
  margin-left: 50px;
}
</style>