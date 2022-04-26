<template>
  <div>
    仪表盘
  </div>
</template>

<script>
export default {
  name: "Dashboard",
  mounted() {
    // 如果是供应商角色，就跳转到供应商页面
    let user = JSON.parse(window.sessionStorage.getItem('user'));
    if (user.role === 'SUPPLIER'){
      this.$router.replace('/supplierHome');

    }
  },
}
</script>

<style scoped>

</style>