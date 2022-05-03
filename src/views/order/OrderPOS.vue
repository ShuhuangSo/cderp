<template>
  <el-container style="height: 100%">
    <el-aside width="500px" class="aside" v-if="!dialogVisible">
      <div style="display: flex;justify-content: center">
        <h3>{{ this.storeName }}</h3>
      </div>

      <div>
<!--        选择客户-->
        <el-select v-model="order.customer"
                   :disabled="orderID"
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

<!--        合计、金额-->
        <el-card shadow="never" style="margin-top: 10px">
          <span style="margin-right: 20px;font-size: large;font-weight: bold">合计：<i style="color: teal;">{{ totalQuantity }}</i> 个</span>
          <span style="font-size: large;font-weight: bold">金额：<i style="color: teal;">{{ totalCost | currency }}</i> 元</span>
        </el-card>

<!--        按钮-->
        <el-button style="width: 100%; height: 50px; margin-top: 10px"
                   size="medium"
                   v-if="!orderID"
                   :disabled="order.order_detail.length===0 || !order.customer"
                   @click="placeOrder"
                   type="success">下单
        </el-button>
        <el-button style="width: 100%; height: 50px; margin-top: 10px"
                   size="medium"
                   v-if="orderID"
                   :disabled="order.order_detail.length===0 || !order.customer"
                   @click="placeEditOrder()"
                   type="success">下单
        </el-button>
        <div style="margin-top: 10px; display: flex;justify-content: space-between">
          <el-button style="width: 49%; height: 50px"
                     v-if="!orderID"
                     :disabled="order.order_detail.length===0 || !order.customer"
                     @click="holdOrder"
                     size="medium"
                     type="warning">挂单</el-button>
          <el-button style="width: 49%; height: 50px"
                     v-if="orderID"
                     :disabled="order.order_detail.length===0 || !order.customer"
                     @click="holdEditOrder"
                     size="medium"
                     type="warning">挂单</el-button>
          <el-button style="width: 49%; height: 50px"
                     v-if="!orderID"
                     :disabled="order.order_detail.length===0 || !order.customer"
                     @click="lockOrder"
                     size="medium"
                     type="primary">锁单</el-button>
          <el-button style="width: 49%; height: 50px"
                     v-if="orderID"
                     :disabled="order.order_detail.length===0 || !order.customer"
                     @click="lockEditOrder"
                     size="medium"
                     type="primary">锁单</el-button>
        </div>
        <div style="margin-top: 10px; display: flex;justify-content: space-between">
          <el-button style="width: 49%; height: 40px"
                     size="medium"
                     @click="clearOrder"
                     type="">清空订单
          </el-button>
          <el-button style="width: 49%; height: 40px"
                     size="medium"
                     @click="selectEditOrder"
                     type="">选择订单
          </el-button>
        </div>


      </div>

    </el-aside>
    <el-main style="padding: 0" v-if="!dialogVisible">
      <div class="box" >
        <!--        产品列表-->
        <div>
          <el-input v-model="scanSKU" placeholder="请扫码...."
                    ref="inputSKU"
                    style="width: 98%; margin: 20px 10px 10px 10px"
                    @keyup.enter.native="addProduct"></el-input>
          <el-alert
              v-if="not_enough_stock"
              title="库存不足！"
              type="error"
              center
              style="width: 98%;margin: 0 10px 10px 10px;"
              show-icon>
          </el-alert>

          <el-descriptions style="width: 98%; margin: 0 10px 0 10px" :colon="false" :column=3 size="medium" v-if="orderID">
            <el-descriptions-item label="订单号:">{{ order.order_number }}</el-descriptions-item>
            <el-descriptions-item label="状态:">
              <el-tag type="warning" v-if="order.order_status=='PREPARING'">{{ order.order_status | orderStatus }}</el-tag>
              <el-tag type="primary" v-if="order.order_status=='READY'">{{ order.order_status | orderStatus }}</el-tag>
              <el-tag type="success" v-if="order.order_status=='FINISHED'">{{ order.order_status | orderStatus }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间:">{{ order.create_time | datetime }}</el-descriptions-item>
          </el-descriptions>

          <el-table
              v-if="!success"
              :header-cell-style="{background:'#eef1f6'}"
              :data="order.order_detail"
              border
              size="medium"
              class="ordertable">
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
                <div v-if="!scope.row.id" style="font-weight: bold;color: teal">{{ scope.row.p_name }}</div>
                <div v-if="scope.row.id" :class="scope.row.qty>scope.row.ave_qty?'colorRed':'colorTeal' ">{{ scope.row.p_name }}</div>
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
                v-if="orderID"
                align="center"
                header-align="center"
                width="80"
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
<!--          成功结果-->
          <el-result v-if="success" icon="success"
                     style="margin-top: 200px"
                     :title="successTitle"
                     subTitle="请继续扫码下单"></el-result>

        </div>
      </div>
    </el-main>

    <el-dialog
        title="请选择订单"
        :show-close="false"
        :visible.sync="editOrderVisible"
        top="20px"
        width="600">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="挂单订单" name="PREPARING">
          <el-table
              :header-cell-style="{background:'#eef1f6'}"
              :hide-on-single-page="true"
              :data="orders"
              border
              v-loading="loading"
              style="width: 100%">
            <el-table-column
                width="170"
                prop="order_number"
                label="订单号">
            </el-table-column>
            <el-table-column
                prop="customer_name"
                label="客户">
            </el-table-column>
            <el-table-column
                :formatter="datetimeFormat"
                prop="create_time"
                label="创建时间"
                align="center"
                width="160"
                header-align="center">
            </el-table-column>
            <el-table-column
                label="操作"
                width="80"
                align="center"
                header-align="center"
            >
              <template slot-scope="scope">

                <el-button
                    @click="selectOrder(scope.row)"
                    type="success">选择</el-button>

              </template>
            </el-table-column>
          </el-table>
          <el-pagination
              background
              @current-change="currentChange"
              layout="prev, pager, next,total"
              :total="total">
          </el-pagination>
        </el-tab-pane>
        <el-tab-pane label="锁定订单" name="READY">
          <el-table
              :header-cell-style="{background:'#eef1f6'}"
              :hide-on-single-page="true"
              :data="orders"
              border
              v-loading="loading"
              style="width: 100%">
            <el-table-column
                width="170"
                prop="order_number"
                label="订单号">
            </el-table-column>
            <el-table-column
                prop="customer_name"
                label="客户">
            </el-table-column>
            <el-table-column
                :formatter="datetimeFormat"
                prop="create_time"
                label="创建时间"
                align="center"
                width="160"
                header-align="center">
            </el-table-column>
            <el-table-column
                label="操作"
                width="80"
                align="center"
                header-align="center"
            >
              <template slot-scope="scope">

                <el-button
                    @click="selectOrder(scope.row)"
                    type="success">选择</el-button>

              </template>
            </el-table-column>
          </el-table>
          <el-pagination
              background
              @current-change="currentChange"
              layout="prev, pager, next,total"
              :total="total">
          </el-pagination>
        </el-tab-pane>
      </el-tabs>

      <span slot="footer" class="dialog-footer">
    <el-button @click="editOrderVisible=false">取 消</el-button>
  </span>
    </el-dialog>

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
import moment from "moment";

export default {
  name: "OrderPOS",
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
  filters: {
    //时间日期格式化
    datetime: function (value) {
      return moment(value).format("YYYY-MM-DD HH:mm:ss");
    },

    //订单状态信息格式化
    orderStatus: function (value) {
      if (value === 'PREPARING') {
        return '已挂起'
      }
      if (value === 'READY') {
        return '已锁定'
      }
      if (value === 'FINISHED') {
        return '已完成'
      }
      return '';
    },

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
      return `¥ ${value.toFixed(2)}`;
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
      currentStoreID: null,
      dialogVisible: false,
      editOrderVisible: false,
      not_enough_stock: false,
      success: false, //成功结果
      loading: false,
      activeName: 'PREPARING',
      successTitle: '',
      scanSKU: '',
      total: 0, // 总条数
      page: 1,  // 当前页
      size: 10,  // 日志页大小
      orderID: null,
      orders: [],
      order: {
        id: null,
        store: this.currentStoreID,
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
    // 扫描框聚焦
    scanListen(){
      this.$nextTick(()=>{
        this.$refs.inputSKU.focus();
      })
    },

    // 初始化下单界面
    clearOrder(){
      this.order = {
        store: this.currentStoreID,
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
      };
      this.orderID = null;
      this.not_enough_stock = false;
    },

    //切换选项
    handleClick(){
      this.page = 1;
      this.initOrder(this.activeName)
    },

    // 格式化日期时间
    datetimeFormat: function (row, column) {
      let date = row[column.property];
      if (date == undefined) {
        return ''
      }
      return moment(date).format("YYYY-MM-DD HH:mm:ss")
    },

    // 页码
    currentChange(page) {
      this.page = page;
      this.initOrder(this.activeName);
    },

    // 选中订单
    selectOrder(obj){
      this.order = JSON.parse(JSON.stringify(obj)); // 深拷贝
      this.orderID = obj.id;
      this.currentCustomer = obj.customer;
      this.editOrderVisible = false;
      this.success = false;
    },

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
              this.not_enough_stock = true;
            } else {
              //初始化下单界面
              this.clearOrder();
              this.successTitle = '成功锁单！'
              this.success = true;
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
            } else {
              //初始化下单界面
              this.clearOrder();
              this.successTitle = '成功挂单！'
              this.success = true;
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

    //  挂单编辑订单
    holdEditOrder() {
      this.$confirm('请确认是否挂单？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {

        this.loading = true;
        this.order.customer = this.order.customer.id;
        this.order.order_status = 'PREPARING';
        this.putRequest('api/orders/order_edit/', this.order).then(resp => {
          if (resp) {
            this.loading = false;
            if ('not_enough_stock' in resp) {
              this.orderID = resp.id
              this.not_enough_stock = true;
              this.getOrder();
            } else {
              //初始化下单界面
              this.clearOrder();
              this.successTitle = '成功挂单！'
              this.success = true;
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

    //  锁单编辑订单
    lockEditOrder() {
      this.$confirm('请确认是否锁单？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {

        this.loading = true;
        this.order.customer = this.order.customer.id;
        this.order.order_status = 'READY';
        this.putRequest('api/orders/order_edit/', this.order).then(resp => {
          if (resp) {
            this.loading = false;
            if ('not_enough_stock' in resp) {
              this.orderID = resp.id
              this.not_enough_stock = true;
              this.getOrder();
            } else {
              //初始化下单界面
              this.clearOrder();
              this.successTitle = '成功锁单！'
              this.success = true;
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

    //  提交编辑订单
    placeEditOrder() {
      this.$confirm('请确认是否下单？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {

        this.loading = true;
        this.order.customer = this.order.customer.id;
        this.order.order_status = 'FINISHED';
        this.putRequest('api/orders/order_edit/', this.order).then(resp => {
          if (resp) {
            this.loading = false;
            if ('not_enough_stock' in resp) {
              this.orderID = resp.id
              this.not_enough_stock = true;
              this.getOrder();
            } else {
              //初始化下单界面
              this.clearOrder();
              this.successTitle = '成功下单！'
              this.success = true;
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
              this.not_enough_stock = true;
              this.getOrder();
            } else {
              //初始化下单界面
              this.clearOrder();
              this.successTitle = '成功下单！'
              this.success = true;
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

    test(){
      this.$message.success('testt')
    },

    // 添加产品
    addProduct() {
      this.success = false;
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
          newCurrentSKU['id'] = null; // 用来判断是新添加的还是已添加的

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
      this.currentStoreID = st.id;
      this.dialogVisible = false;
      this.scanListen();
    },

    //取消选择仓库
    cancel() {
      this.$router.push('/home')
    },

    // 获取订单
    getOrder(){
      this.loading = true;
      this.getRequest('api/orders/' + this.orderID + '/').then(resp => {
        if (resp) {
          this.loading = false;
          this.currentCustomer = resp.customer;

          this.order.id = resp.id;
          this.order.customer = resp.customer;
          this.order.pay_way = resp.pay_way;
          this.order.order_status = resp.order_status;
          this.order.order_detail = resp.order_detail;
          this.order.order_detail.forEach(item => {
            item['product'] = item.id;
          })

        }
      })
    },

    // 初始化订单
    initOrder(status){
      this.loading = true;
      let url = 'api/orders/?mode=POS&order_status='+ status+ '&store='+this.currentStoreID+
          '&page=' + this.page + '&page_size=' + this.size;
      this.getRequest(url).then(resp => {
        if (resp) {
          this.loading = false;
          this.orders = resp.results;
          this.total = resp.count;

        }
      })
    },

    // 选择编辑订单
    selectEditOrder(){
      this.initOrder('PREPARING');
      this.activeName = 'PREPARING';
      this.editOrderVisible = true;
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
.ordertable{
  width: 98%;
  margin: 0 10px 10px 10px;
}
.colorTeal {
  font-weight: bold;
  color: teal;
}
.colorRed {
  font-weight: bold;
  color: #aa0515;
}
</style>