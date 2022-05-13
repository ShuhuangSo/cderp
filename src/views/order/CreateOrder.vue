<template>
  <div style="display: flex; justify-content: center">
    <div class="pContainer">
      <el-card shadow="hover" style="padding-bottom: 20px">
        <div slot="header" class="clearfix">
          <el-page-header @back="cancel" :content="orderID ? '编辑订单':'创建订单'">
          </el-page-header>
        </div>

        <div class="step">
          <el-steps :space="200" :active="0" finish-status="success">
            <el-step title="创建订单" v-if="!orderID"></el-step>
            <el-step title="编辑订单" v-if="orderID"></el-step>
            <el-step title="锁仓待发货"></el-step>
            <el-step title="完成"></el-step>
          </el-steps>
        </div>

        <div>
          <el-form ref="orderForm" :rules="rules" :model="order" label-width="180px">

            <el-form-item label="店铺" required prop="store">
              <el-select v-model="order.store"
                         placeholder="请选择" class="inputwidth">
                <el-option
                    v-for="item in stores"
                    :key="item.id"
                    :label="item.store_name"
                    :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item required label="客户" prop="customer">
              <el-select v-model="order.customer"
                         filterable
                         remote
                         default-first-option
                         clearable
                         :remote-method="searchCustomer"
                         :loading="loading"
                         @change="selectCustomer"
                         @clear="clearCustomer"
                         placeholder="请选择客户" class="inputwidth">
                <el-option
                    v-for="item in customers"
                    :key="item.id"
                    :label="item.company_name"
                    :value="item.id">
                  <span style="float: left">{{ item.company_name }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">{{ item.customer_code }}</span>
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="客户评级" v-if="currentCustomer.level">
              <el-rate style="margin-top: 6px" disabled v-model="currentCustomer.level"></el-rate>
            </el-form-item>

            <el-form-item label="付款方式" required prop="pay_way">
              <el-select v-model="order.pay_way"
                         placeholder="请选择" class="inputwidth">
                <el-option
                    v-for="item in payWays"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="发货方式" required prop="order_type">
              <el-select v-model="order.order_type"
                         placeholder="请选择" class="inputwidth">
                <el-option
                    v-for="item in orderTypes"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="收货人" v-if="order.order_type==='EXPRESS' || order.order_type==='SELLER_SEND'">
              <el-input
                  class="inputwidth"
                  placeholder="请输入收货联系人"
                  v-model="order.contact_name">
              </el-input>
            </el-form-item>

            <el-form-item label="电话" v-if="order.order_type==='EXPRESS' || order.order_type==='SELLER_SEND'">
              <el-input
                  class="inputwidth"
                  placeholder="请输入联系电话"
                  v-model="order.phone">
              </el-input>
            </el-form-item>

            <el-form-item label="收货地址" v-if="order.order_type==='EXPRESS' || order.order_type==='SELLER_SEND'">
              <el-input
                  style="width: 600px;"
                  placeholder="请输入收货地址"
                  v-model="order.address">
              </el-input>
            </el-form-item>

            <el-form-item label="备注">
              <el-input
                  style="width: 600px;"
                  type="textarea"
                  :rows="2"
                  placeholder="请输入备注"
                  v-model="order.note">
              </el-input>
            </el-form-item>

            <el-form-item label="运费" v-if="order.order_type==='EXPRESS' || order.order_type==='SELLER_SEND'">
              <el-input-number
                  v-model="order.postage"
                  :precision="2"
                  controls-position="right"
                  :min="0"></el-input-number>
            </el-form-item>

            <!--            折扣优惠信息-->
            <el-table
                :header-cell-style="{background:'#eef1f6'}"
                :data="currentCustomer.customer_discount"
                empty-text="无折扣"
                border
                size="mini"
                style="width: 30%; margin: 10px">
              <el-table-column
                  prop="series_name"
                  label="产品系列"
                  align="center"
                  header-align="center">
              </el-table-column>
              <el-table-column
                  prop="discount_type"
                  label="折扣类型"
                  align="center"
                  header-align="center">
                <template slot-scope="scope">
                  <el-tag :type="scope.row.discount_type===1? 'success':'warning'">
                    {{ scope.row.discount_type | discountType }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column
                  :formatter="moneyFormat"
                  prop="discount_money"
                  label="优惠金额"
                  align="center"
                  header-align="center">
              </el-table-column>
              <el-table-column
                  :formatter="percentFormat"
                  prop="discount_percent"
                  label="优惠比例"
                  align="center"
                  header-align="center">
              </el-table-column>
            </el-table>

          </el-form>
        </div>

        <!--        产品列表-->
        <div>
          <el-input v-model="scanSKU" placeholder="请扫码...."
                    style="width: 98%; margin: 20px 10px 0 10px"
                    @keyup.enter.native="addProduct"></el-input>
          <el-table
              :header-cell-style="{background:'#eef1f6'}"
              :data="order.order_detail"
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
                label="单价">
              <template slot-scope="scope">
                <span style="text-decoration:line-through"
                      v-if="scope.row.unit_price>scope.row.sold_price">
                  {{ scope.row.unit_price | currency }}</span>
                <span v-if="scope.row.unit_price===scope.row.sold_price">{{ scope.row.unit_price | currency }}</span>
              </template>
            </el-table-column>
            <el-table-column
                v-if="currentCustomer.customer_discount.length>0"
                align="center"
                header-align="center"
                width="100"
                label="优惠价">
              <template slot-scope="scope">
                {{ scope.row.sold_price | currency }}
              </template>
            </el-table-column>

            <el-table-column
                label="小计"
                align="center"
                header-align="center"
                width="85">
              <template slot-scope="scope">
                {{ scope.row.qty * scope.row.sold_price | currency }}
              </template>
            </el-table-column>

            <el-table-column
                v-if="orderID"
                align="center"
                header-align="center"
                width="70"
                label="可用库存">
              <template slot-scope="scope">
                <el-popover trigger="hover" placement="top">
                  <p>店铺库存: {{ scope.row.stock_qty }}</p>
                  <p>店铺锁仓: {{ scope.row.lock_qty }}</p>
                  <div slot="reference" class="name-wrapper">
                    <el-tag type="danger" size="small" v-if="scope.row.ave_qty<10">{{ scope.row.ave_qty }}</el-tag>
                    <el-tag type="warning" size="small" v-if="scope.row.ave_qty<30 && scope.row.ave_qty>=10">
                      {{ scope.row.ave_qty }}
                    </el-tag>
                    <el-tag type="success" size="small" v-if="scope.row.ave_qty>=30">{{ scope.row.ave_qty }}</el-tag>
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
                    @click="removeProduct(scope.row.sku)"
                    type="" size="mini" icon="el-icon-delete" circle></el-button>

              </template>
            </el-table-column>
          </el-table>

          <div class="total" v-if="order.order_detail.length">
            <div style="float: left; width: 250px">
              <h3>总数量：<span style="color: green">{{ totalQuantity }}</span> 个</h3>
              <h3>总金额：<span style="color: green">{{ totalCost | currency }}</span> 元</h3>
            </div>
          </div>


        </div>

        <div STYLE="display: flex;justify-content: right;margin-right: 20px">
          <el-button type="primary"
                     v-if="!orderID"
                     :disabled="!order.order_detail.length"
                     @click="submitForm">提交并锁定库存
          </el-button>
          <el-button type="primary"
                     v-if="orderID"
                     :disabled="!order.order_detail.length"
                     @click="editForm">提交并锁定库存
          </el-button>
          <el-button type=""
                     v-if="!orderID"
                     :disabled="!order.order_detail.length"
                     @click="presubmitForm">放入草稿箱
          </el-button>
          <el-button type="" icon="el-icon-delete"
                     v-if="orderID"
                     @click="cancelOrder">作废订单
          </el-button>

        </div>

      </el-card>

      <div style="margin-top: 20px" v-if="orderID">
        <OrderLog :orderID="this.orderID"></OrderLog>
      </div>

    </div>
  </div>
</template>

<script>
import OrderLog from "@/components/order/OrderLog";

export default {
  name: "CreateOrder",
  computed: {
    // 从vuex中取出所有产品
    allProducts() {
      return this.$store.state.products;
    },
    // 总数量
    totalQuantity() {
      let qty = 0;
      this.order.order_detail.forEach(item => {
        qty += item.qty;
      })
      return qty
    },
    // 总金额
    totalCost() {
      let cost = 0;
      this.order.order_detail.forEach(item => {
        cost += item.qty * item.sold_price;
      })
      return cost + this.order.postage;
    },
  },
  data() {
    return {
      order: {
        store: null,
        customer: null,
        mode: 'STANDARD',
        postage: 0,
        order_type: 'PICKUP',
        pay_way: 'PAY_NOW',
        address: '',
        contact_name: '',
        phone: '',
        note: '',
        order_detail: []
      },
      stores: [], //店铺列表
      customers: [], //客户列表
      currentCustomer: {
        customer_discount: []
      }, // 当前选中的客户
      orderTypes: [
        {name: '门店自提', value: 'PICKUP'},
        {name: '快递', value: 'EXPRESS'},
        {name: '卖家送货', value: 'SELLER_SEND'},
      ],
      payWays: [
        {name: '现结', value: 'PAY_NOW'},
        {name: '约定付款', value: 'CONTRACT'},
      ],
      scanSKU: '',
      loading: false,
      orderID: this.$route.query.id,
      rules: {
        customer: [
          {required: true, message: '请选择客户', trigger: 'blur'},
        ],
        store: [
          {required: true, message: '请选择店铺', trigger: 'blur'},
        ],
        pay_way: [
          {required: true, message: '请选择付款方式', trigger: 'blur'},
        ],
        order_type: [
          {required: true, message: '请选择发货方式', trigger: 'blur'},
        ]
      }
    }
  },

  filters: {
    //金额格式化
    currency: function (value) {
      if (!value) return 0.00;
      return `¥${value.toFixed(2)}`;
    },
    //折扣类型信息格式化
    discountType: function (value) {
      if (value === 0) {
        return '百分比'
      }
      if (value === 1) {
        return '金额数'
      }
      return '';
    },
  },
  components: {
    OrderLog
  },
  mounted() {
    this.initBasicSetting();
    if (this.orderID) {
      this.initOrder();
    }
  },
  methods: {
    // 优惠金额信息格式化
    moneyFormat: function (row, column) {

      let value = row[column.property];

      if (value == undefined) {
        return '--'
      }
      if (!value) {
        return '--'
      }
      return `¥ ${value.toFixed(2)}`;
    },

    // 优惠比例信息格式化
    percentFormat: function (row, column) {

      let value = row[column.property];

      if (value == undefined) {
        return '--'
      }
      if (!value) {
        return '--'
      }
      return value + "%";
    },


    //  作废订单
    cancelOrder(order_status) {
      this.$confirm('是否作废订单？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$refs.orderForm.validate((valid) => {
          if (valid) {
            this.loading = true;
            this.order.order_status = 'CANCEL';
            this.putRequest('api/orders/order_edit/', this.order).then(resp => {
              if (resp) {
                this.loading = false;
                this.$router.push('/orderManage')
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

    //  提交修改订单
    editForm(order_status) {
      this.$confirm('提交后订单后库存将会锁定，请确认？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$refs.orderForm.validate((valid) => {
          if (valid) {
            this.loading = true;
            this.order.order_status = 'READY';
            this.putRequest('api/orders/order_edit/', this.order).then(resp => {
              if (resp) {
                this.loading = false;
                if ('not_enough_stock' in resp) {
                  this.orderID = resp.id
                  this.initOrder();
                } else {
                  this.$router.push({
                    path: '/orderDetail',
                    query: {
                      id: this.order.id
                    }
                  })
                }
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

    //  提交新建订单
    submitForm(order_status) {
      this.$confirm('提交后订单后库存将会锁定，请确认？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$refs.orderForm.validate((valid) => {
          if (valid) {
            this.loading = true;
            this.order.order_status = 'READY';
            this.postRequest('api/orders/', this.order).then(resp => {
              if (resp) {
                console.log(resp)
                this.loading = false;
                if ('not_enough_stock' in resp) {
                  this.orderID = resp.id
                  this.initOrder();
                } else {
                  this.$router.push({
                    path: '/orderDetail',
                    query: {
                      id: resp.id
                    }
                  })
                }

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

    //  提交订单放入草稿箱
    presubmitForm(order_status) {
      this.$confirm('提交后订单放入草稿箱，请确认？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.order.order_status = 'PREPARING';
        this.$refs.orderForm.validate((valid) => {
          if (valid) {
            this.loading = true;
            this.postRequest('api/orders/', this.order).then(resp => {
              if (resp) {
                this.loading = false;
                this.$router.push('/orderManage');
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

    //选中客户时回调
    selectCustomer(value) {
      if (value) {
        let cs = this.customers.find(item => {
          return item.id === value
        })
        this.order.contact_name = cs.contact_name;
        this.order.phone = cs.phone;
        this.order.address = cs.address;
        this.order.pay_way = cs.pay_way;
        this.currentCustomer = cs;

        //切换客户时优惠信息变动
        if (cs.customer_discount.length > 0 && this.order.order_detail.length > 0) {
          this.order.order_detail.forEach(item => {
            let new_cs = cs.customer_discount.find(i => {
              return i.series_name === item.series;
            })
            if (new_cs){
              if (new_cs.discount_type === 1) {
                item.sold_price = item.sale_price - new_cs.discount_money;
              }
              if (new_cs.discount_type === 0) {
                item.sold_price = item.sale_price * (100 - new_cs.discount_percent) / 100;
              }
            }

          })
        } else {
          // 清空产品折扣
          this.order.order_detail.forEach(item => {
            item.sold_price = item.unit_price;
          })
        }

      }
    },

    // 清除客户时的回调
    clearCustomer() {
      this.order.contact_name = '';
      this.order.phone = '';
      this.order.address = '';
      this.currentCustomer = {};

      // 清空产品折扣
      this.order.order_detail.forEach(item => {
        item.sold_price = item.unit_price;
      })
    },

    // 添加产品
    addProduct() {
      // 查看这个sku是否已添加
      let existSKU = this.order.order_detail.find(item => {
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
          newCurrentSKU['product'] = newCurrentSKU.id; // 修改sku id为product
          newCurrentSKU['unit_price'] = newCurrentSKU.sale_price

          // 如果有折扣信息，折减去折扣
          if (this.order.customer && this.currentCustomer.customer_discount.length > 0) {
            let ccs = this.currentCustomer.customer_discount.find(item => {
              return item.series_name === newCurrentSKU.series;
            })
            if(ccs){
              if (ccs.discount_type === 1) {
                newCurrentSKU['sold_price'] = newCurrentSKU.sale_price - ccs.discount_money;
              }
              if (ccs.discount_type === 0) {
                newCurrentSKU['sold_price'] = newCurrentSKU.sale_price * (100 - ccs.discount_percent) / 100;
              }
            } else {
              newCurrentSKU['sold_price'] = newCurrentSKU.sale_price;
            }

          } else {
            newCurrentSKU['sold_price'] = newCurrentSKU.sale_price;
          }

          delete newCurrentSKU.id; // 删除sku id

          this.order.order_detail.push(newCurrentSKU);
          this.scanSKU = '';

        } else {
          this.$message.error('该产品不存在！');
          this.scanSKU = '';
        }
      }
    },

    // 删除产品
    removeProduct(sku) {
      let index = this.order.order_detail.findIndex(item => {
        return item.sku === sku
      });
      this.order.order_detail.splice(index, 1)
    },


    // 返回
    cancel() {
      this.$router.push('/orderManage');
    },

    //搜索客户
    searchCustomer(query) {
      if (query !== '') {
        this.getRequest('api/customers/?search=' + query).then(resp => {
          if (resp.results) {
            this.customers = resp.results;
          }
        })
      } else {
        this.customers = [];
      }

    },

    //初始化产品
    initOrder() {
      this.loading = true;
      this.getRequest('api/orders/' + this.orderID + '/').then(resp => {
        if (resp) {
          this.loading = false;
          if (resp.order_status !== 'PREPARING') this.$router.push('/orderManage');
          this.customers.push(resp.customer);
          this.currentCustomer = resp.customer;

          this.order = resp;
          this.order.customer = resp.customer.id;
          this.order.order_detail.forEach(item => {
            item['product'] = item.id;
          })

        }
      })
    },

    // 初始化初始设置信息
    initBasicSetting() {

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

.inputwidth {
  width: 220px;
}

.step {
  padding-left: 300px;
  margin-bottom: 50px;
  margin-top: 50px;
}
</style>