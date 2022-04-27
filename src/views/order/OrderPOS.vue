<template>
  <el-container style="height: 100%">
    <el-aside width="500px" class="aside" v-if="!dialogVisible">
      <div style="display: flex;justify-content: center">
        <h3>{{ this.storeName }}</h3>
      </div>

      <div>
        <el-select v-model="order.customer"
                   filterable
                   remote
                   default-first-option
                   clearable
                   :remote-method="searchCustomer"
                   :loading="loading"
                   @change="selectCustomer"
                   @clear="clearCustomer"
                   style="width: 100%;"
                   placeholder="请选择客户">
          <el-option
              v-for="item in customers"
              :key="item.id"
              :label="item.company_name"
              :value="item.id">
            <span style="float: left">{{ item.company_name }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{ item.customer_code }}</span>
          </el-option>
        </el-select>

        <el-card shadow="never" style="margin-top: 10px">
          <div>
            <el-descriptions :colon="false" :column=1 size="medium" title="客户信息">
              <el-descriptions-item label="客户编号:">{{ this.currentCustomer.customer_code }}</el-descriptions-item>
              <el-descriptions-item label="客户名称:">{{ this.currentCustomer.company_name }}</el-descriptions-item>
              <el-descriptions-item label="结算方式:">{{ this.currentCustomer.pay_way | payWay }}</el-descriptions-item>
              <el-descriptions-item label="客户级别:">
                <el-rate style="margin-top: 2px" disabled v-model="currentCustomer.level"></el-rate>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>

        <!--            折扣优惠信息-->
        <el-table
            :header-cell-style="{background:'#eef1f6'}"
            :data="currentCustomer.customer_discount"
            empty-text="无折扣"
            border
            size="mini"
            style="width: 100%; margin-top: 10px">
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

        <el-button style="width: 100%; height: 50px; margin-top: 10px"
                   size="medium"
                   :disabled="order.order_detail.length===0 || !order.customer"
                   @click="placeOrder"
                   type="success">下单
        </el-button>
        <div style="margin-top: 10px; display: flex;justify-content: space-between">
          <el-button style="width: 49%; height: 50px"
                     :disabled="order.order_detail.length===0 || !order.customer"
                     @click="holdOrder"
                     size="medium"
                     type="warning">挂单</el-button>
          <el-button style="width: 49%; height: 50px"
                     :disabled="order.order_detail.length===0 || !order.customer"
                     @click="lockOrder"
                     size="medium"
                     type="primary">锁单</el-button>
        </div>
        <el-button style="width: 100%; height: 40px; margin-top: 50px"
                   size="medium"
                   @click="placeOrder"
                   type="">选择订单
        </el-button>

      </div>

    </el-aside>
    <el-main style="padding: 0" v-if="!dialogVisible">
      <div class="box">
        <!--        产品列表-->
        <div>
          <el-input v-model="scanSKU" placeholder="请扫码...."
                    style="width: 98%; margin: 20px 10px 0 10px"
                    @keyup.enter.native="addProduct"></el-input>
          <el-table
              :header-cell-style="{background:'#eef1f6'}"
              :data="order.order_detail"
              border
              size="medium"
              max-height="550"
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
                label="SKU | 产品名称">
              <template slot-scope="scope">
                <div style="font-weight: bold">{{ scope.row.sku }}</div>
                <div style="font-weight: bold;color: teal">{{ scope.row.p_name }}</div>
              </template>
            </el-table-column>
            <el-table-column
                align="center"
                header-align="center"
                width="100"
                label="单价">
              <template slot-scope="scope">
                <span
                    v-if="scope.row.unit_price>scope.row.sold_price">
                  <div style="text-decoration:line-through">{{ scope.row.unit_price | currency }}</div>
                  <div style="color: #aa0515">{{ scope.row.sold_price | currency }}</div>
                </span>
                <span v-if="scope.row.unit_price===scope.row.sold_price">{{ scope.row.unit_price | currency }}</span>
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
                width="70"
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

        </div>
      </div>
    </el-main>

    <el-dialog
        title="请选择店铺"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :show-close="false"
        :visible.sync="dialogVisible"
        width="30%">
      <el-select v-model="order.store"
                 style="width: 100%;"
                 placeholder="请选择">
        <el-option
            v-for="item in stores"
            :key="item.id"
            :label="item.store_name"
            :value="item.id">
        </el-option>
      </el-select>
      <span slot="footer" class="dialog-footer">
    <el-button @click="cancel">取 消</el-button>
    <el-button type="primary" @click="selectStore">确 定</el-button>
  </span>
    </el-dialog>
  </el-container>
</template>

<script>
export default {
  name: "OrderPOS",
  computed: {
    // 从vuex中取出所有产品
    allProducts() {
      return this.$store.state.products;
    },
  },
  filters: {
    //结算方式信息格式化
    payWay: function (value) {
      if (value === 'PAY_NOW') {
        return '现结'
      }
      if (value === 'CONTRACT') {
        return '约定付款'
      }
      return '';
    },
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

  data() {
    return {
      stores: [], // 仓库列表
      customers: [], //客户列表
      storeName: '', // 当前仓库名称
      currentCustomer: {
        customer_discount: [],
      },
      dialogVisible: false,
      loading: false,
      scanSKU: '',
      order: {
        store: 1,
        customer: null,
        mode: 'POS',
        pay_way: 'PAY_NOW',
        order_status: 'PREPARING',
        order_type: 'PICKUP',
        address: '',
        postage: 0,
        contact_name: '',
        phone: '',
        note: '',
        order_detail: [],
      }
    }
  },
  mounted() {
    this.initStores();
    this.dialogVisible = true;
  },
  methods: {
    //  提交锁单
    lockOrder() {
      this.$confirm('请确认是否锁单？确认后产品库存将被锁定', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true;
        this.order.order_status = 'READY';
        this.postRequest('api/orders/', this.order).then(resp => {
          if (resp) {
            this.loading = false;
            if ('not_enough_stock' in resp) {
              this.orderID = resp.id
              // this.initOrder();
            } else {
              //初始化下单界面
              this.order = {
                store: 1,
                customer: null,
                mode: 'POS',
                pay_way: 'PAY_NOW',
                order_status: 'PREPARING',
                order_type: 'PICKUP',
                address: '',
                postage: 0,
                contact_name: '',
                phone: '',
                note: '',
                order_detail: [],
              };
              this.currentCustomer = {
                customer_discount: [],
              }
            }

          }
        })

      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        });
      });

    },

    //  提交挂单
    holdOrder() {
      this.$confirm('请确认是否挂单？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true;
        this.postRequest('api/orders/', this.order).then(resp => {
          if (resp) {
            this.loading = false;
            if ('not_enough_stock' in resp) {
              this.orderID = resp.id
              // this.initOrder();
            } else {
              //初始化下单界面
              this.order = {
                store: 1,
                customer: null,
                mode: 'POS',
                pay_way: 'PAY_NOW',
                order_status: 'PREPARING',
                order_type: 'PICKUP',
                address: '',
                postage: 0,
                contact_name: '',
                phone: '',
                note: '',
                order_detail: [],
              };
              this.currentCustomer = {
                customer_discount: [],
              }
            }

          }
        })

      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        });
      });

    },

    //  提交新建订单
    placeOrder() {
      this.$confirm('请确认是否下单？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true;
        this.order.order_status = 'FINISHED';
        this.postRequest('api/orders/', this.order).then(resp => {
          if (resp) {
            this.loading = false;
            if ('not_enough_stock' in resp) {
              this.orderID = resp.id
              // this.initOrder();
            } else {
              //初始化下单界面
              this.order = {
                store: 1,
                customer: null,
                mode: 'POS',
                pay_way: 'PAY_NOW',
                order_status: 'PREPARING',
                order_type: 'PICKUP',
                address: '',
                postage: 0,
                contact_name: '',
                phone: '',
                note: '',
                order_detail: [],
              };
              this.currentCustomer = {
                customer_discount: [],
              }
            }

          }
        })

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
            if (ccs) {
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

          this.order.order_detail.unshift(newCurrentSKU);
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

    // 清除客户时的回调
    clearCustomer() {
      this.currentCustomer = {};
      // 清空产品折扣
      this.order.order_detail.forEach(item => {
        item.sold_price = item.unit_price;
      })
    },

    //选中客户时回调
    selectCustomer(value) {
      if (value) {
        let cs = this.customers.find(item => {
          return item.id === value
        })
        this.order.pay_way = cs.pay_way;
        this.currentCustomer = cs;

        //切换客户时优惠信息变动
        if (cs.customer_discount.length > 0 && this.order.order_detail.length > 0) {
          this.order.order_detail.forEach(item => {
            let new_cs = cs.customer_discount.find(i => {
              return i.series_name === item.series;
            })
            if (new_cs.discount_type === 1) {
              item.sold_price = item.sale_price - new_cs.discount_money;
            }
            if (new_cs.discount_type === 0) {
              item.sold_price = item.sale_price * (100 - new_cs.discount_percent) / 100;
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

    //选择店铺
    selectStore() {
      let st = this.stores.find(item => {
        return item.id === this.order.store;
      })
      this.storeName = st.store_name;
      this.dialogVisible = false;
    },

    //取消选择仓库
    cancel() {
      this.$router.push('/home')
    },

    // 初始化所有可选仓库
    initStores() {

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
.aside {
  padding-left: 15px;
  padding-right: 15px;
  height: 100%;
  background: #ffffff;
}

.box {
  height: 100%;
  margin: 0 0 0 10px;
  background: #ffffff;
}
</style>