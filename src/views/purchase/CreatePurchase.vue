<template>
  <div style="display: flex; justify-content: center">
    <div class="pContainer">
      <el-card shadow="hover" style="padding-bottom: 20px">
        <div slot="header" class="clearfix">
          <el-page-header @back="cancel" :content="purchaseID ? '编辑采购单':'创建采购单'">
          </el-page-header>
        </div>


        <div class="step">
          <el-steps :space="200" :active="0" finish-status="success">
            <el-step title="创建采购单" v-if="!purchaseID"></el-step>
            <el-step title="编辑采购单" v-if="purchaseID"></el-step>
            <el-step title="等待供应商确认"></el-step>
            <el-step title="生产"></el-step>
            <el-step title="发货"></el-step>
            <el-step title="收货完成"></el-step>
          </el-steps>
        </div>

        <div>
          <el-form ref="purchaseForm" :rules="rules" :model="purchaseOrder" label-width="180px">
            <el-form-item label="供应商" required prop="supplier">
              <el-select v-model="purchaseOrder.supplier" placeholder="请选择" class="inputwidth">
                <el-option
                    v-for="item in suppliers"
                    :key="item.id"
                    :label="item.supplier_name"
                    :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="收货仓库/店铺" required prop="store">
              <el-select v-model="purchaseOrder.store"
                         @change="selectStore"
                         placeholder="请选择" class="inputwidth">
                <el-option
                    v-for="item in stores"
                    :key="item.id"
                    :label="item.store_name"
                    :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="收货人" v-if="purchaseOrder.store">
              <el-input
                  class="inputwidth"
                  placeholder="请输入收货联系人"
                  v-model="purchaseOrder.rec_name">
              </el-input>
            </el-form-item>

            <el-form-item label="电话" v-if="purchaseOrder.store">
              <el-input
                  class="inputwidth"
                  placeholder="请输入联系电话"
                  v-model="purchaseOrder.rec_phone">
              </el-input>
            </el-form-item>

            <el-form-item label="收货地址" v-if="purchaseOrder.store">
              <el-input
                  style="width: 600px;"
                  placeholder="请输入收货地址"
                  v-model="purchaseOrder.rec_address">
              </el-input>
            </el-form-item>

            <el-form-item label="供应商Tips">
              <el-input
                  style="width: 600px;"
                  type="textarea"
                  :rows="2"
                  placeholder="请输入供应商备注，供应商可见"
                  v-model="purchaseOrder.sup_tips">
              </el-input>
            </el-form-item>

            <el-form-item label="内部备注">
              <el-input
                  style="width: 600px;"
                  type="textarea"
                  :rows="2"
                  placeholder="请输入备注，内容仅公司内部可见"
                  v-model="purchaseOrder.note">
              </el-input>
            </el-form-item>

            <el-form-item label="运费">
              <el-input-number
                  v-model="purchaseOrder.postage"
                  :precision="2"
                  controls-position="right"
                  :min="0"></el-input-number>
            </el-form-item>

            <el-form-item label="单项简短备注">
              <el-switch
                  v-model="isShortNote"
                  active-color="#13ce66">
              </el-switch>
            </el-form-item>

            <el-form-item label="提供素材壳">
              <el-switch
                  @change="changeCaseValue"
                  v-model="isSupply"
                  active-color="#13ce66">
              </el-switch>
            </el-form-item>

            <el-form-item label="内壳价格" v-if="isSupply">
              <el-input-number
                  v-model="purchaseOrder.inner_case_price"
                  @change="changeCost"
                  :precision="2"
                  controls-position="right"
                  :min="0"></el-input-number>
            </el-form-item>

          </el-form>
        </div>

        <div>
          <el-input v-model="scanSKU" placeholder="请扫码...."
                    style="width: 98%; margin: 20px 10px 0 10px"
                    @keyup.enter.native="addProduct"></el-input>
          <el-table
              :header-cell-style="{background:'#eef1f6'}"
              :data="purchaseOrder.purchase_detail"
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
                width="80">
            </el-table-column>
            <el-table-column
                prop="p_name"
                label="产品名称">
            </el-table-column>
            <el-table-column
                align="center"
                header-align="center"
                width="100"
                label="采购价">
              <template slot-scope="scope">
                <el-input-number
                    style="width: 70px"
                    v-model="scope.row.unit_cost"
                    :precision="1"
                    :controls="false"
                    :min="0.1"></el-input-number>
              </template>
            </el-table-column>

            <el-table-column
                label="小计"
                align="center"
                header-align="center"
                width="85">
              <template slot-scope="scope">
                {{ scope.row.qty * scope.row.unit_cost | currency }}
              </template>
            </el-table-column>

            <el-table-column
                v-if="isSupply"
                align="center"
                header-align="center"
                width="80"
                label="提供内壳">
              <template slot="header" slot-scope="scope">
                <el-checkbox
                    size="mini"
                    @change="checkBoxAll">
                  <span style="font-size: 12px; color: #919398">素材</span></el-checkbox>
              </template>
              <template slot-scope="scope">
                <el-checkbox
                    @change="checkBoxChangeCost"
                    v-model="scope.row.is_supply_case">
                  <span style="font-size: 12px; color: #919398">提供</span></el-checkbox>
              </template>
            </el-table-column>
            <el-table-column
                v-if="isShortNote"
                label="简要备注">
              <template slot-scope="scope">
                <el-input maxlength=20 v-model="scope.row.short_note"></el-input>
              </template>
            </el-table-column>
            <el-table-column
                align="center"
                header-align="center"
                width="70"
                label="可用库存">
              <template slot-scope="scope">
                <el-popover trigger="hover" placement="top">
                  <p>总库存: {{ scope.row.total_qty }}</p>
                  <p>总锁仓: {{ scope.row.total_lock_qty }}</p>
                  <div slot="reference" class="name-wrapper">
                    <el-tag type="danger" size="small" v-if="scope.row.ava_qty<10">{{ scope.row.ava_qty }}</el-tag>
                    <el-tag type="warning" size="small" v-if="scope.row.ava_qty<30 && scope.row.ava_qty>=10">{{ scope.row.ava_qty }}</el-tag>
                    <el-tag type="success" size="small" v-if="scope.row.ava_qty>=30">{{ scope.row.ava_qty }}</el-tag>
                  </div>
                </el-popover>
              </template>
            </el-table-column>
            <el-table-column
                label="数量"
                align="center"
                header-align="center"
                width="160">
              <template slot-scope="scope">
                <el-input-number v-model="scope.row.qty" :min="1"></el-input-number>
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
                    v-if="scope.row.urgent"
                    title="取消加急"
                    @click="changeUrgent(scope.row)"
                    type="danger" size="mini" circle>急</el-button>
                <el-button
                    v-if="!scope.row.urgent"
                    title="加急"
                    @click="changeUrgent(scope.row)"
                    type="" size="mini" circle>急</el-button>
                <el-button
                    @click="removeProduct(scope.row.sku)"
                    type="" size="mini" icon="el-icon-delete" circle></el-button>

              </template>
            </el-table-column>
          </el-table>

          <div class="total" v-if="purchaseOrder.purchase_detail.length">
            <div style="float: left; width: 250px">
              <h3>总数量：<span style="color: green">{{ totalQuantity }}</span> 个</h3>
              <h3>总金额：<span style="color: green">{{ totalCost | currency }}</span> 元</h3>
            </div>
          </div>


        </div>

        <div STYLE="display: flex;justify-content: right;margin-right: 20px">
          <el-button type="primary"
                     v-if="!purchaseID"
                     :disabled="!purchaseOrder.purchase_detail.length"
                     @click="submitForm('WAIT_CONFIRM')">提交并发送给供应商
          </el-button>
          <el-button type="primary"
                     v-if="purchaseID"
                     :disabled="!purchaseOrder.purchase_detail.length"
                     @click="submitEditForm('WAIT_CONFIRM')">提交并发送给供应商
          </el-button>
          <el-button type=""
                     v-if="!purchaseID"
                     :disabled="!purchaseOrder.purchase_detail.length"
                     @click="preSubmitForm('PRE_SUMMIT')">放入草稿箱
          </el-button>
          <el-button type="" icon="el-icon-delete"
                     v-if="purchaseID"
                     @click="cancelPurchase('CANCEL')">作废采购单
          </el-button>

        </div>

      </el-card>

      <div style="margin-top: 20px" v-if="purchaseID">
        <PurchaseLog :purchaseID="this.purchaseID"></PurchaseLog>
      </div>
    </div>
  </div>
</template>

<script>
import PurchaseLog from "@/components/purchase/PurchaseLog";

export default {
  name: "CreatePurchase",
  computed: {
    // 从vuex中取出所有产品
    allProducts() {
      return this.$store.state.products;
    },
    // 总数量
    totalQuantity() {
      let qty = 0;
      this.purchaseOrder.purchase_detail.forEach(item => {
        qty += item.qty;
      })
      return qty
    },
    // 总金额
    totalCost() {
      let cost = 0;
      this.purchaseOrder.purchase_detail.forEach(item => {
        cost += item.qty * item.unit_cost;
      })
      return cost + this.purchaseOrder.postage;
    },
  },
  filters:{
    //金额格式化
    currency: function(value){
      if(!value) return 0.00;
      return `¥${value.toFixed(2)}`;
    }
  },
  data() {
    return {
      purchaseOrder: {
        supplier: null,
        store: null,
        postage: 0,
        note: '',
        sup_tips: '',
        order_status: '',
        inner_case_price: 0,
        purchase_detail: [],
        rec_name: '',
        rec_phone: '',
        rec_address: ''
      },
      suppliers: [], // 供应商列表
      stores: [], //仓库列表
      purchaseID: this.$route.query.id, // 采购单id
      loading: false,
      scanSKU: '',
      isSupply: false,
      isShortNote: false,

      rules: {
        supplier: [
          {required: true, message: '请选择供应商', trigger: 'blur'},
        ],
        store: [
          {required: true, message: '请选择仓库/店铺', trigger: 'blur'},
        ]
      },

    }
  },
  components: {
    PurchaseLog
  },
  mounted() {
    this.initBasicSetting();
    // 如果有id传进，则进入编辑状态
    if (this.$route.query.id){
      this.initPurchase();
    }
  },
  methods: {
    // 改变加急状态
    changeUrgent(row){
      row.urgent = !row.urgent
    },

    // 选择仓库回调
    selectStore(value){
      let st = this.stores.find(item => {
        return item.id === value;
      });
      this.purchaseOrder.rec_name = st.contact_name;
      this.purchaseOrder.rec_phone = st.phone;
      this.purchaseOrder.rec_address = st.address;
    },

    //  作废采购单
    cancelPurchase(order_status) {
      this.$confirm('是否作废采购订单？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }).then(() => {
        this.purchaseOrder.order_status = order_status; // 操作类型
        this.putRequest('api/purchase_orders/'+this.purchaseID+'/', this.purchaseOrder).then(resp => {
          if (resp) {
            this.loading = false;
            this.$router.push('/purchaseOrder');
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        });
      });

    },

    // 全选勾选框回调
    checkBoxAll(isChecked) {
      this.purchaseOrder.purchase_detail.forEach(item => {
        item.is_supply_case = isChecked;
      })
      this.checkBoxChangeCost(isChecked);
    },
    // 勾选框回调
    checkBoxChangeCost(isChecked) {
      if (isChecked) {
        this.purchaseOrder.purchase_detail.forEach(item => {
          if (item.is_supply_case) {
            item.unit_cost = item.oldCost - this.purchaseOrder.inner_case_price;
          }
        })
      } else {
        this.purchaseOrder.purchase_detail.forEach(item => {
          if (!item.is_supply_case) {
            item.unit_cost = item.oldCost;
          }
        })
      }
    },
    // 内壳输入价格回调
    changeCost(num) {
      if (num >= 0) {
        this.purchaseOrder.purchase_detail.forEach(item => {
          if (item.is_supply_case) {
            item.unit_cost = item.oldCost - num;
          }
        })
      }
    },
    //提供内壳开关回调
    changeCaseValue(isSupply) {
      if (!isSupply) {
        this.purchaseOrder.inner_case_price = 0;
        this.purchaseOrder.purchase_detail.forEach(item => {
          item.unit_cost = item.oldCost;
          item.is_supply_case = false;

        })
      }
    },

    //  放入草稿箱
    preSubmitForm(order_status) {
      this.$confirm('是否将采购单放入草稿箱？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.purchaseOrder.order_status = order_status; // 操作类型
        this.$refs.purchaseForm.validate((valid) => {
          if (valid) {
            this.loading = true;
            this.postRequest('api/purchase_orders/', this.purchaseOrder).then(resp => {
              if (resp) {
                this.loading = false;
                this.$router.push('/purchaseOrder');
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

    //  提交新建采购单
    submitForm(order_status) {
      this.$confirm('提交后采购单将发送给供应商，请确认？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.purchaseOrder.order_status = order_status; // 操作类型
        this.$refs.purchaseForm.validate((valid) => {
          if (valid) {
            this.loading = true;
            this.postRequest('api/purchase_orders/', this.purchaseOrder).then(resp => {
              if (resp) {
                this.loading = false;
                this.$router.push({
                  path: '/purchaseDetail',
                  query: {
                    id: resp.id
                  }
                });
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

    //  提交编辑的采购单
    submitEditForm(order_status) {
      this.$confirm('提交后采购单将发送给供应商，请确认？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.purchaseOrder.order_status = order_status; // 操作类型
        this.$refs.purchaseForm.validate((valid) => {
          if (valid) {
            this.loading = true;
            this.putRequest('api/purchase_orders/purchase_edit/', this.purchaseOrder).then(resp => {
              if (resp) {
                this.loading = false;
                this.$router.push({
                  path: '/purchaseDetail',
                  query: {
                    id: this.purchaseID
                  }
                });
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

    // 添加产品
    addProduct() {
      // 查看这个sku是否已添加
      let existSKU = this.purchaseOrder.purchase_detail.find(item => {
        return item.sku === this.scanSKU.trim();
      })
      // 如果存在，则数量加1
      if (existSKU) {
        existSKU.qty += 1;
        this.scanSKU = '';
      } else {
        // 不存在则到VUEX中查找出这个sku
        let currentSKU = this.allProducts.find(item => {
          return item.sku === this.scanSKU.trim();
        })
        // 找到就复制过来，设初始数量为1
        if (currentSKU) {
          let newCurrentSKU = JSON.parse(JSON.stringify(currentSKU)); // 深拷贝
          newCurrentSKU['qty'] = 1; // 添加数量1
          newCurrentSKU['is_supply_case'] = false;
          newCurrentSKU['oldCost'] = newCurrentSKU.unit_cost
          newCurrentSKU['short_note'] = '';
          newCurrentSKU['product_id'] = newCurrentSKU.id; // 修改sku id为product_id， 防止冲突
          newCurrentSKU['urgent'] = false; // 把加急状态添加进去
          delete newCurrentSKU.id; // 删除sku id

          // 获取产品数据
          this.getRequest('api/products/'+ newCurrentSKU.product_id+'/').then(resp => {
            if (resp) {
              newCurrentSKU['total_lock_qty'] = resp.total_lock_qty;
              newCurrentSKU['total_qty'] = resp.total_qty;
              newCurrentSKU['ava_qty'] = resp.total_qty - resp.total_lock_qty;
              this.purchaseOrder.purchase_detail.push(newCurrentSKU);
              this.scanSKU = '';
            }
          })

        } else {
          this.$message.error('该产品不存在！');
          this.scanSKU = '';
        }
      }
    },

    // 删除产品
    removeProduct(sku) {
      let index = this.purchaseOrder.purchase_detail.findIndex(item => {
        return item.sku === sku
      });
      this.purchaseOrder.purchase_detail.splice(index, 1)
    },

    // 取消并返回
    cancel() {
      this.$router.push('/purchaseOrder');
    },

    // 初始化采购单信息
    initPurchase() {
      this.loading = true;
      this.getRequest('api/purchase_orders/' + this.purchaseID + '/').then(resp => {
        if (resp) {
          this.loading = false;
          this.purchaseOrder = resp;
          this.purchaseOrder.purchase_detail.forEach(item => {
            // VUEX中查找出这个sku
            let currentSKU = this.allProducts.find(i => {
              return i.sku === item.sku;
            })
            item['oldCost'] = currentSKU.unit_cost; // 把原价添加进去

            if (item.is_supply_case) {
              this.isSupply = true;
            }
            if (item.short_note) {
              this.isShortNote = true;
            }
          })

        }
      })
    },


    // 初始化初始设置信息
    initBasicSetting() {
      //获取所有可选供应商
      if (window.sessionStorage.getItem('suppliers')) {
        this.suppliers = JSON.parse(window.sessionStorage.getItem('suppliers'));
      } else {
        this.getRequest('api/suppliers/?page_size=1000').then(resp => {
          if (resp.results) {
            this.suppliers = resp.results;
            window.sessionStorage.setItem('suppliers', JSON.stringify(this.suppliers));
          }
        })
      }
      //获取所有可选仓库
      if (window.sessionStorage.getItem('stores')) {
        this.stores = JSON.parse(window.sessionStorage.getItem('stores'));
      } else {
        this.getRequest('api/stores/?page_size=1000').then(resp => {
          if (resp.results) {
            this.stores = resp.results;
            window.sessionStorage.setItem('stores', JSON.stringify(this.stores));
          }
        })
      }

    }


  }
}
</script>

<style scoped>
.pContainer {
  margin-top: 10px;
  width: 1200px;
}

.total {
  display: flex;
  justify-content: flex-end;
  margin-right: 50px;
  margin-bottom: 20px;
}
.step{
  /*display: flex;*/
  /*justify-content: center;*/
  padding-left: 150px;
  margin-bottom: 50px;
  margin-top: 50px;
}
.inputwidth {
  width: 220px;
}
</style>