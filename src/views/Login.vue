<template>
  <div>
    <el-form :rules="rules" ref="loginForm" :model="loginForm" class="loginContainer">
      <div class="loginTitle">
        <img src="../assets/logo-m2.png" alt="CaseDance"  class="logo">
      </div>

      <el-form-item prop="username">
        <el-input prefix-icon="el-icon-user"
                  size="medium"
                  @keyup.enter.native="submitLogin('loginForm')"
                  v-model="loginForm.username" placeholder="手机号/用户名"></el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input prefix-icon="el-icon-lock" type="password"
                  size="medium"
                  show-password
                  @keyup.enter.native="submitLogin('loginForm')"
                  v-model="loginForm.password" placeholder="密码"></el-input>
      </el-form-item>
      <el-button type="primary" style="width: 100%"
                 size="medium"
                 :loading="loading"
                 @click="submitLogin('loginForm')">登录
      </el-button>
    </el-form>

  </div>
</template>

<script>

export default {
  name: "Login",
  data() {
    return {
      loginForm: {
        username: "",
        password: ""
      },
      loading: false,
      rules: {
        username: [
          {required: true, message: '请输入手机号/用户名', trigger: 'blur'},
        ],
        password: [
          {required: true, message: '请输入密码', trigger: 'blur'},
        ],
      }
    }
  },
  methods: {
    submitLogin(formName) {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.loading = true;
          this.postRequest('api-token-auth/', this.loginForm).then(resp => {
            if (resp) {
              this.loading = false;
              // 存储用户token
              const tokenStr = 'JWT ' + resp.token;
              window.localStorage.setItem('tokenStr', tokenStr);
              // 跳转未登录前页面
              let path = this.$route.query.redirect;
              this.$router.replace((path == '/' || path == undefined) ? '/home' : path);
            }
            this.loading = false;
          })
        } else {
          return false;
        }
      });
    }
  }
}
</script>

<style scoped>
.loginContainer {
  border-radius: 15px;
  background-clip: padding-box;
  margin: 280px auto;
  width: 400px;
  padding: 15px 35px 40px 35px;
  background: #fff;
  border: 1px solid #eaeaea;
  box-shadow: 0 0 25px #cac6c6;
}

.loginTitle {
  margin: 0px auto 10px auto;
  text-align: center;
}
.logo{
  height: 30px;
}
</style>