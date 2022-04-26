<template>
  <div style="display: flex; justify-content: center">
    <div class="inoutContainer">

      <el-card shadow="hover" style="padding-bottom: 20px">
        <div slot="header" class="clearfix">
          <el-page-header @back="cancel" :content="title">
          </el-page-header>
        </div>
        <div>
          <el-form ref="inoutForm" :rules="rules" :model="stockInout" label-width="180px" class="inoutForm">
            <el-form-item label="源仓库/店铺" required prop="origin_store" v-if="ioType==='MOVE'">
              <el-select v-model="stockInout.origin_store" placeholder="请选择">
                <el-option
                    v-for="item in storeOptions"
                    :key="item.id"
                    :label="item.store_name"
                    :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item :label="ioType==='OUT'?'仓库/店铺':'目标仓库/店铺'" required prop="target_store">
              <el-select v-model="stockInout.target_store" placeholder="请选择">
                <el-option
                    v-for="item in storeOptions"
                    :key="item.id"
                    :label="item.store_name"
                    :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="入库原因" required prop="reason_in" v-if="ioType==='IN'">
              <el-select v-model="stockInout.reason_in" placeholder="请选择">
                <el-option
                    v-for="item in reasonInOptions"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="出库原因" required prop="reason_out" v-if="ioType==='OUT'">
              <el-select v-model="stockInout.reason_out" placeholder="请选择">
                <el-option
                    v-for="item in reasonOutOptions"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="调拨原因" required prop="reason_move" v-if="ioType==='MOVE'">
              <el-select v-model="stockInout.reason_move" placeholder="请选择">
                <el-option
                    v-for="item in reasonMoveOptions"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="备注">
              <el-input
                  style="width: 400px;"
                  type="textarea"
                  :rows="2"
                  placeholder="请输入内容"
                  v-model="stockInout.note">
              </el-input>
            </el-form-item>

          </el-form>
        </div>

        <div>
          <el-input v-model="scanSKU" placeholder="请扫码...."
                    style="width: 98%; margin: 0 10px 0 10px"
                    @keyup.enter.native="addProduct"></el-input>
          <el-table
              :header-cell-style="{background:'#eef1f6'}"
              :data="stockInout.inout_detail"
              border
              size="mini"
              style="width: 98%; margin: 10px">
            <el-table-column
                label="图片"
                align="center"
                header-align="center"
                width="80">
              <template slot-scope="scope">
                <el-image
                    style="width: 40px; height: 40px"
                    :src="scope.row.image"
                    fit="fill">
                </el-image>
              </template>
            </el-table-column>
            <el-table-column
                prop="sku"
                label="SKU"
                align="center"
                header-align="center"
                width="180">
            </el-table-column>
            <el-table-column
                prop="p_name"
                label="产品名称">
            </el-table-column>
            <el-table-column
                label="数量"
                align="center"
                header-align="center"
                width="200">
              <template slot-scope="scope">
                <el-input-number v-model="scope.row.qty" :min="1"></el-input-number>
              </template>
            </el-table-column>
            <el-table-column
                label="操作"
                width="80"
                align="center"
                header-align="center"
            >
              <template slot-scope="scope">
                <el-button
                    type="text"
                    @click="removeProduct(scope.row.sku)"
                    size="small">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div STYLE="display: flex;justify-content: right;margin-right: 20px">
          <el-button type="primary"
                     :disabled="!stockInout.inout_detail.length"
                     v-if="ioType==='IN'"
                     @click="submitForm">提交入库单
          </el-button>
          <el-button type="primary"
                     :disabled="!stockInout.inout_detail.length"
                     v-if="ioType==='OUT'"
                     @click="submitForm">提交出库单
          </el-button>
          <el-button type="primary"
                     :disabled="!stockInout.inout_detail.length"
                     v-if="ioType==='MOVE'"
                     @click="submitForm">提交调拨单
          </el-button>
        </div>
      </el-card>
    </div>
  </div>

</template>

<script>
export default {
  name: "AddStockInout",
  computed: {
    // 从vuex中取出所有产品
    allProducts() {
      return this.$store.state.products;
    },
    title(){
      let title = '';
      if(this.ioType==='IN'){
        title = '手工入库'
      }
      if(this.ioType==='OUT'){
        title = '手工出库'
      }
      if(this.ioType==='MOVE'){
        title = '库存调拨'
      }
      return title;
    }
  },
  data() {
    return {
      ioType: this.$route.query.type, // 路由传参的出入库单类型
      storeOptions: [], // 所有仓库
      loading: false,
      scanSKU: '',
      reasonInOptions: [
        {
          name: '客户退货',
          value: 'RETURN'
        },
        {
          name: '其它原因',
          value: 'OTHERS'
        }
      ],
      reasonOutOptions: [
        {
          name: '非销售出库',
          value: 'GIFT'
        },
        {
          name: '丢失',
          value: 'LOST'
        },
        {
          name: '其它原因',
          value: 'OTHERS'
        }
      ],
      reasonMoveOptions: [
        {
          name: '库存支援',
          value: 'SUPPORT'
        },
        {
          name: '其它原因',
          value: 'OTHERS'
        }
      ],
      stockInout: {
        origin_store: null,
        target_store: null,
        username: '',
        type: '',
        reason_in: '',
        reason_out: '',
        reason_move: '',
        note: '',
        inout_detail: []
      },
      rules: {
        origin_store: [
          {required: true, message: '请选择仓库', trigger: 'blur'},
        ],
        target_store: [
          {required: true, message: '请选择仓库', trigger: 'blur'},
        ],
        reason_in: [
          {required: true, message: '请选择入库原因', trigger: 'blur'},
        ],
        reason_out: [
          {required: true, message: '请选择出库原因', trigger: 'blur'},
        ],
        reason_move: [
          {required: true, message: '请选择调拨原因', trigger: 'blur'},
        ],
      }

    }
  },
  mounted() {

    this.stockInout.type = this.ioType; // 设置出入库单类型
    this.initSettings(); // 初始化初始设置

  },
  methods: {
    //  提交出入库单
    submitForm() {
      this.$confirm('是否确认提交?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$refs.inoutForm.validate((valid) => {
          if (valid) {
            this.loading = true;
            this.postRequest('api/stock_in_out/', this.stockInout).then(resp => {
              if (resp) {
                this.loading = false;
                this.$router.push('/productStockInout');
              }
            })
          }
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        });
      });


    },
    // 取消并返回
    cancel() {
      this.$router.push('/productStockInout');
    },
    // 添加产品
    addProduct() {
      // 查看这个sku是否已添加
      let existSKU = this.stockInout.inout_detail.find(item => {
        return item.sku === this.scanSKU
      })
      // 如果存在，则数量加1
      if (existSKU) {
        existSKU.qty += 1;
        this.scanSKU = '';
      } else {
        // 不存在则到VUEX中查找出这个sku
        let currentSKU = this.allProducts.find(item => {
          return item.sku === this.scanSKU
        })
        // 找到就复制过来，设初始数量为1
        if (currentSKU) {
          let newCurrentSKU = JSON.parse(JSON.stringify(currentSKU)); // 深拷贝
          newCurrentSKU['qty'] = 1;
          this.stockInout.inout_detail.push(newCurrentSKU);
          this.scanSKU = '';
        } else {
          this.$message.error('该产品不存在！');
          this.scanSKU = '';
        }
      }
    },

    // 删除产品
    removeProduct(sku) {
      let index = this.stockInout.inout_detail.findIndex(item => {
        return item.sku === sku
      });
      this.stockInout.inout_detail.splice(index, 1)
    },

    // 初始化设置
    initSettings() {
      //获取所有可选仓库
      if (window.sessionStorage.getItem('stores')) {
        this.storeOptions = JSON.parse(window.sessionStorage.getItem('stores'));
      } else {
        this.getRequest('api/stores/?page_size=1000').then(resp => {
          if (resp.results) {
            this.storeOptions = resp.results;
            window.sessionStorage.setItem('stores', JSON.stringify(this.storeOptions));
          }
        })
      }

    },

  }

}
</script>

<style scoped>
.inoutContainer {
  margin-top: 10px;
  width: 1200px;
}

.inoutForm .el-select {
  width: 400px;
}

</style>