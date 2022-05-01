<template>
  <div style="display: flex; justify-content: center">
    <div class="pContainer">
      <el-card shadow="hover" style="padding-bottom: 20px">
        <div slot="header" class="clearfix">
          <el-page-header @back="cancel" :content="'用户权限: '+ $route.query.name">
          </el-page-header>
        </div>

        <div>
          <el-tree
              ref="tree"
              :data="menu"
              default-expand-all
              show-checkbox
              node-key="id"
              :props="defaultProps">
          </el-tree>
          <el-button
              style="width: 200px;margin-left: 100px"
              type="primary"
              @click="createUserMenu">保存
          </el-button>
        </div>

      </el-card>

    </div>
  </div>
</template>

<script>

export default {
  name: "UserPermission",
  data() {
    return {
      menu: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
    }
  },
  mounted() {
    this.initMenu(); // 初始化基础菜单

  },
  methods: {
    //创建用户菜单
    createUserMenu() {
      let ids = this.$refs.tree.getCheckedKeys()
      this.postRequest('api/settings/user_menu/' + this.$route.query.id + '/create_menu/', ids).then(data => {
        if (data) {
          console.log(data)
        }
      })
    },

    //初始化菜单
    initMenu() {
      this.getRequest('api/settings/all_menu/').then(data => {
        if (data) {
          this.menu = data
          this.initUserMenu();  // 初始化用户选中菜单
        }
      })
    },

    //初始化选中用户菜单
    initUserMenu() {
      this.getRequest('api/settings/user_menu/?id=' + this.$route.query.id).then(data => {
        if (data) {
          let userMenuList = [];
          let basicList = []
          //将激活的用户菜单加进来
          data.forEach(item => {
            item.children.forEach(i => {
              if (i.is_active) {
                userMenuList.push({name: i.name, id: i.id})
              }
            })
          })

          this.menu.forEach(item => {
            item.children.forEach(i => {
              userMenuList.forEach(u => {
                if (i.name === u.name) {
                  basicList.push(i.id)
                }
              })
            })
          })
          this.$refs.tree.setCheckedKeys(basicList)

        }
      })
    },

    //返回
    cancel() {
      this.$router.push('/settingUsers')
    }
  }
}
</script>

<style scoped>
.pContainer {
  margin-top: 10px;
  width: 1200px;
}
</style>