<template>
  <div style="display: flex; justify-content: center">
    <div class="pContainer">
      <el-card shadow="hover" style="padding-bottom: 20px">
        <div slot="header" class="clearfix">
          <el-page-header @back="cancel" content="订单详情">
          </el-page-header>
        </div>

        <div class="step">
          <el-steps :space="200" :active="orderStep" finish-status="success">
            <el-step title="创建订单" ></el-step>
            <el-step title="锁仓待发货"></el-step>
            <el-step title="完成"></el-step>
          </el-steps>
        </div>

        <div style="padding-left: 50px; padding-right: 50px">
          <el-descriptions :colon="false" :column=2 size="medium" title="订单信息">
            <el-descriptions-item label="订单号:">{{ this.order.order_number }}</el-descriptions-item>
            <el-descriptions-item label="店铺:">{{ this.order.store_name }}</el-descriptions-item>
            <el-descriptions-item label="客户:">{{ this.order.customer_name }}</el-descriptions-item>
            <el-descriptions-item label="付款方式:">
              <el-tag type="primary" v-if="this.order.pay_way=='PAY_NOW'">{{ this.order.pay_way | payWay }}</el-tag>
              <el-tag type="" v-if="this.order.pay_way=='CONTRACT'">{{ this.order.pay_way | payWay }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="发货方式:">{{ this.order.order_type | sendType }}</el-descriptions-item>
            <el-descriptions-item label="收货人:"
                                  v-if="order.order_type==='EXPRESS' || order.order_type==='SELLER_SEND'"
            >{{ this.order.contact_name }}</el-descriptions-item>
            <el-descriptions-item label="电话:"
                                  v-if="order.order_type==='EXPRESS' || order.order_type==='SELLER_SEND'"
            >{{ this.order.phone }}</el-descriptions-item>
            <el-descriptions-item label="收货地址:"
                                  v-if="order.order_type==='EXPRESS' || order.order_type==='SELLER_SEND'"
            >{{ this.order.address }}</el-descriptions-item>
            <el-descriptions-item label="运费:"
                                  v-if="order.order_type==='EXPRESS' || order.order_type==='SELLER_SEND'"
            >{{ this.order.postage }}</el-descriptions-item>
            <el-descriptions-item label="处理人:">{{ this.order.username }}</el-descriptions-item>
            <el-descriptions-item label="创建时间:">{{ create_time }}</el-descriptions-item>
            <el-descriptions-item></el-descriptions-item>
            <el-descriptions-item label="备注:">
              <el-input
                  style="width: 400px;"
                  type="textarea"
                  :rows="2"
                  placeholder="请输入备注"
                  @change="changeNote"
                  v-model="order.note">
              </el-input>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!--            折扣优惠信息-->
        <el-table
            :header-cell-style="{background:'#eef1f6'}"
            :data="order.customer.customer_discount"
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

        <div>
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
                v-if="order.customer.customer_discount.length>0"
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
                    <el-tag type="warning" size="small" v-if="scope.row.ave_qty<30 && scope.row.ave_qty>=10">{{ scope.row.ave_qty }}</el-tag>
                    <el-tag type="success" size="small" v-if="scope.row.ave_qty>=30">{{ scope.row.ave_qty }}</el-tag>
                  </div>
                </el-popover>
              </template>
            </el-table-column>

            <el-table-column
                prop="qty"
                label="数量"
                align="center"
                header-align="center"
                width="100">
            </el-table-column>

          </el-table>

          <div class="total">
            <div style="float: left; width: 250px">
              <h3>总数量：<span style="color: green">{{ this.order.total_qty }}</span> 个</h3>
              <h3>总金额：<span style="color: green">{{ this.order.total_sold_price | currency }}</span> 元</h3>
            </div>
          </div>

        </div>

        <div STYLE="display: flex;justify-content: right;margin-right: 20px">
          <el-button
              v-if="order.order_status === 'READY'"
              @click="clickSend"
              type="primary" icon="el-icon-check" style="width: 200px">发货
          </el-button>
          <el-button
              v-if="order.order_status === 'READY'"
              @click="goEditOrder"
              type="" icon="el-icon-edit"  style="width: 200px">解锁库存修改订单
          </el-button>
          <el-button
              type="primary" icon="el-icon-check"
              v-if="order.order_status === 'FINISHED' && order.paid_status === 'UNPAID'"
              @click="doCheckout">确认结算
          </el-button>

        </div>


      </el-card>

      <div style="margin-top: 20px">
        <OrderLog :orderID="this.orderID"></OrderLog>
      </div>

<!--      发货物流信息填写弹窗-->
      <el-dialog
          title="订单发货"
          :close-on-click-modal="false"
          :visible.sync="dialogVisible"
          width="500px">
        <el-form ref="form" label-position="top">
          <el-form-item label="物流">
            <el-select v-model="order.logistic" placeholder="请选择物流">
              <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="单号">
            <el-input v-model="order.tracking_number" placeholder="请填写单号"></el-input>
          </el-form-item>

        </el-form>



        <span slot="footer" class="dialog-footer">
    <el-button @click="dialogVisible = false">取 消</el-button>
    <el-button
        type="primary" @click="doSent">确 定</el-button>
  </span>
      </el-dialog>

    </div>
  </div>
</template>

<script>
import moment from "moment";
import OrderLog from "@/components/order/OrderLog";

export default {
  name: "OrderDetail",
  computed: {
    create_time() {
      return moment(this.order.create_time).format("YYYY-MM-DD HH:mm:ss");
    },
    orderStep() {
      if (this.order.order_status === 'READY') return 1;
      if (this.order.order_status === 'FINISHED') return 3;
      if (this.order.order_status === 'PART_SENT') return 1;

    },
  },
  data(){
    return{
      order:{
        customer:{
          customer_discount:[]
        }
      },
      orderID: this.$route.query.id,
      dialogVisible: false,
      options: [{
        value: 'Shunfeng',
        label: '顺丰快递'
      }, {
        value: 'Yuantong',
        label: '圆通快递'
      }, {
        value: 'Yunda',
        label: '韵达快递'
      }, {
        value: 'Others',
        label: '其它物流'
      }],

    }
  },
  components: {
    OrderLog
  },
  filters:{
    //发货方式信息格式化
    sendType: function (value) {
      if (value === 'PICKUP') {
        return '门店自提'
      }
      if (value === 'EXPRESS') {
        return '快递'
      }
      if (value === 'SELLER_SEND') {
        return '卖家送货'
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
    currency: function(value){
      if(!value) return 0.00;
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
  mounted() {
    this.initOrder();
  },
  methods:{
    // 确认结算
    doCheckout(){
      this.$confirm('是否进行订单结算，请确认？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.order.customer = this.order.customer.id;
        this.order.order_detail.forEach(item=>{
          item.paid_qty = item.sent_qty
        })
        console.log(this.order)
        this.loading = true;
        this.putRequest('api/orders/order_edit/', this.order).then(resp => {
          if (resp) {
            this.loading = false;
            this.$router.push('/orderManage');
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        });
      });

    },

    // 点击发货
    clickSend(){
      if(this.order.order_type==='EXPRESS'){
        this.dialogVisible = true;
      }else {
        this.$confirm('订单发货，请确认？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.doSent();
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消'
          });
        });

      }
    },

    // 确认发货
    doSent(){
      this.order.customer = this.order.customer.id;
      this.order.order_status = 'FINISHED';
      this.order.order_detail.forEach(item=>{
        item.sent_qty = item.qty
      })
      this.loading = true;
      this.putRequest('api/orders/order_edit/', this.order).then(resp => {
        if (resp) {
          this.loading = false;
          this.$router.push('/orderManage');
        }
      })
    },

    //保存改变的备注信息
    changeNote(string) {
      this.order.note = string;
      let obj = {id: this.order.id, note: string}
      this.patchRequest('api/orders/'+ this.order.id + '/', obj).then(resp => {
        if (resp) {
          this.$message.success('修改成功！')
        }
      })
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
      return value +"%";
    },

    // 取消并返回
    cancel() {
      this.$router.push('/orderManage');
    },

    // 解锁编辑订单
    goEditOrder() {
      this.$confirm('提交后后库存将会解锁，请确认？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true;
        this.order.order_status = 'PREPARING';
        this.putRequest('api/orders/' + this.orderID + '/', this.order).then(resp => {
          if (resp) {
            this.loading = false;
            this.$router.push({
              path: '/createOrder',
              query: {
                id: this.order.id
              }
            })
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        });
      });

    },

    //初始化产品
    initOrder(){
      this.loading = true;
      this.getRequest('api/orders/' + this.orderID + '/').then(resp => {
        if (resp) {
          this.loading = false;
          this.order = resp;
        }
      })
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

.step {
  padding-left: 300px;
  margin-bottom: 50px;
  margin-top: 50px;
}
.block{
  width: 50%;
  padding-left: 50px;

}
</style>