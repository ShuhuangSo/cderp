<template>
  <div style="display: flex; justify-content: center">
    <div class="pContainer">
      <el-card shadow="hover" style="padding-bottom: 20px">
        <div slot="header" class="clearfix">
          <el-page-header @back="cancel" :content="supplierID ? '供应商详情':'新增供应商'">
          </el-page-header>
        </div>

        <div>
          <el-form ref="supplierForm" :rules="rules" :model="supplier" label-width="180px">
            <el-form-item prop="supplier_name" label="供应商名称" required="true">
              <el-input
                  class="inputwidth"
                  placeholder="请输入供应商名称"
                  v-model="supplier.supplier_name">
              </el-input>
            </el-form-item>


            <el-form-item required="true" label="采购渠道">
              <el-select v-model="supplier.buy_way" placeholder="请选择" class="inputwidth">
                <el-option
                    v-for="item in buyWayOptions"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item prop="contact_name" label="联系人" required="true">
              <el-input
                  class="inputwidth"
                  placeholder="请输入联系人名称"
                  v-model="supplier.contact_name">
              </el-input>
            </el-form-item>

            <el-form-item label="联系电话">
              <el-input
                  class="inputwidth"
                  placeholder="请输入联系人名称"
                  v-model="supplier.phone">
              </el-input>
            </el-form-item>

            <el-form-item label="微信">
              <el-input
                  class="inputwidth"
                  placeholder="请输入微信号"
                  v-model="supplier.wechat">
              </el-input>
            </el-form-item>

            <el-form-item label="QQ">
              <el-input
                  class="inputwidth"
                  placeholder="请输入QQ号"
                  v-model="supplier.qq">
              </el-input>
            </el-form-item>

            <el-form-item label="邮箱">
              <el-input
                  class="inputwidth"
                  placeholder="请输入邮箱地址"
                  v-model="supplier.email">
              </el-input>
            </el-form-item>

            <el-form-item label="地址">
              <el-input
                  class="inputwidth"
                  placeholder="请输入联系地址"
                  v-model="supplier.address">
              </el-input>
            </el-form-item>


          </el-form>
        </div>
        <div>
          <el-button
              v-if="!supplierID"
              style="width: 200px;margin-left: 100px"
              type="primary"
              @click="submitForm">创建供应商
          </el-button>
          <el-button
              v-if="supplierID"
              style="width: 200px;margin-left: 100px"
              type="primary"
              @click="editForm">保存
          </el-button>
        </div>

      </el-card>
    </div>


  </div>
</template>

<script>
export default {
  name: "CreateSupplier",
  data() {
    return {
      supplierID: this.$route.query.id,
      supplier: {
        supplier_name: '',
        buy_way: 'FACTORY',
        address: '',
        contact_name: '',
        phone: '',
        qq: '',
        wechat: '',
        email: '',
        note: ''
      },
      buyWayOptions: [
        {name: '工厂', value: 'FACTORY'},
        {name: '1688', value: '1688'},
        {name: '其它', value: 'OTHERS'}
      ],
      rules: {
        supplier_name: [
          {required: true, message: '请输入供应商名称', trigger: 'blur'},
        ],
        buy_way: [
          {required: true, message: '请选择采购渠道', trigger: 'blur'},
        ],
        contact_name: [
          {required: true, message: '请输入联系人', trigger: 'blur'},
        ],
      },
    }
  },
  mounted() {
    if (this.supplierID) {
      this.initSupplier()
    }
  },
  methods: {
    //初始化供应商
    initSupplier() {
      let url = 'api/suppliers/' + this.supplierID + '/'
      this.getRequest(url).then(resp => {
        if (resp) {
          this.supplier = resp;
        }
      })
    },

    //修改供应商
    editForm() {
      this.$confirm('是否修改供应商信息？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$refs.supplierForm.validate((valid) => {
          if (valid) {
            this.loading = true;
            let url = 'api/suppliers/' + this.supplierID + '/'
            this.putRequest(url, this.supplier).then(resp => {
              if (resp) {
                this.$router.push('/purchaseSupplierList');
              }
              this.loading = false;
            })
            this.$message({
              type: 'success',
              message: '成功修改'
            });
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

    //创建供应商
    submitForm() {
      this.$confirm('是否创建供应商？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$refs.supplierForm.validate((valid) => {
          if (valid) {
            this.loading = true;
            this.postRequest('api/suppliers/', this.supplier).then(resp => {
              if (resp) {
                this.$router.push('/purchaseSupplierList');
              }
              this.loading = false;
            })
            this.$message({
              type: 'success',
              message: '成功创建供应商'
            });
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

    //返回
    cancel() {
      this.$router.push('/purchaseSupplierList')
    }
  }
}
</script>

<style scoped>
.pContainer {
  margin-top: 10px;
  width: 1200px;
}

.inputwidth {
  width: 400px;
}
</style>