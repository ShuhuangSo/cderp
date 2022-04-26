<template>
  <div>
    <el-card shadow="hover" style="padding-bottom: 20px">

      <div slot="header" class="clearfix">
        <el-page-header @back="backToIndex" :content="orderStatus">
        </el-page-header>
      </div>
      <el-skeleton :loading="loading" :rows="10" :throttle="500" animated>

              <el-alert
                  v-if="purchaseOrder.sup_tips"
                  title="订单备注"
                  type="success"
                  :description="purchaseOrder.sup_tips"
                  effect="dark"
                  :closable="false">
              </el-alert>

        <div style="padding-left: 50px; padding-right: 50px; margin-top: 20px">
          <el-descriptions :colon="false" :column=2 size="medium">
            <el-descriptions-item label="批次号:">{{ this.purchaseOrder.p_number }}</el-descriptions-item>
            <el-descriptions-item label="下单时间:">{{ create_time }}</el-descriptions-item>
            <el-descriptions-item label="收货人:">{{ this.purchaseOrder.rec_name }}</el-descriptions-item>
            <el-descriptions-item label="联系电话:">{{ this.purchaseOrder.rec_phone }}</el-descriptions-item>
            <el-descriptions-item label="收货地址:">{{ this.purchaseOrder.rec_address }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="block" v-if="purchaseOrder.order_status==='PART_SENT' || purchaseOrder.order_status==='SENT'">
          <p>发货信息</p>
          <el-timeline>
            <el-timeline-item
                v-for="item in purchaseOrder.purchase_post_info"
                :key="item.id"
                icon="el-icon-s-promotion"
                size="large"
                color="#0bbd87"
                :timestamp="item.post_time | dateFormat"
                placement="top">
              <el-card>
                <el-descriptions :column=1 size="medium">
                  <el-descriptions-item label="物流名称">{{ item.logistic }}</el-descriptions-item>
                  <el-descriptions-item label="物流单号">{{ item.tracking_number }}</el-descriptions-item>
                  <el-descriptions-item label="包裹数">{{ item.package_count }}</el-descriptions-item>
                </el-descriptions>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>

        <div>
          <el-table
              :header-cell-style="{background:'#eef1f6'}"
              :data="purchaseOrder.purchase_detail"
              v-loading="loading"
              border>
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
                label="产品名称">
              <template slot-scope="scope">
                <span style="margin-right: 5px">{{ scope.row.p_name }}</span>
                <el-tag type="danger" effect="dark" size="mini" v-if="scope.row.urgent">加急</el-tag>
              </template>
            </el-table-column>

            <el-table-column
                prop="qty"
                align="center"
                header-align="center"
                width="80"
                label="数量">
            </el-table-column>

            <el-table-column
                v-if="isSupply"
                align="center"
                header-align="center"
                width="80"
                label="提供素材">
              <template slot-scope="scope">
                <el-tag type="" v-if="scope.row.is_supply_case">提供</el-tag>
              </template>
            </el-table-column>
            <el-table-column
                v-if="isShortNote"
                label="简要备注">
              <template slot-scope="scope">
                <p>{{ scope.row.short_note }}</p>
              </template>
            </el-table-column>

            <!--            待发货状态下-->
            <el-table-column
                v-if="purchaseOrder.order_status==='IN_PRODUCTION'"
                label="发货数量"
                align="center"
                header-align="center"
                width="160">
              <template slot-scope="scope">
                <el-input-number v-model="scope.row.sent_qty" :min="0"></el-input-number>
              </template>
            </el-table-column>

            <!--            部分发货和已发货状态下-->
            <el-table-column
                v-if="purchaseOrder.order_status==='PART_SENT' || purchaseOrder.order_status==='SENT'"
                prop="already_sent_qty"
                label="已发货"
                align="center"
                header-align="center"
                width="60">
            </el-table-column>
            <!--            部分发货状态下-->
            <el-table-column
                v-if="purchaseOrder.order_status==='PART_SENT'"
                label="发货数量"
                align="center"
                header-align="center"
                width="160">
              <template slot-scope="scope">
                <el-input-number :disabled="scope.row.is_sent" v-model="scope.row.sent_qty" :min="0"></el-input-number>
              </template>
            </el-table-column>


          </el-table>

<!--          待确认状态下-->
          <div class="total" v-if="purchaseOrder.order_status==='WAIT_CONFIRM' || purchaseOrder.order_status==='SENT'">
            <div style="float: left; width: 200px">
              <h3>总数量：<span style="color: green">{{ this.purchaseOrder.total_buy_qty }}</span> 个</h3>
            </div>
          </div>

<!--          待发货状态下-->
          <div class="total" v-if="purchaseOrder.order_status==='IN_PRODUCTION'">
            <div style="float: left; width: 200px">
              <h3>订单总数量：<span style="color: green">{{ purchaseOrder.total_buy_qty }}</span> 个 </h3>
              <h3>总发货数量：<span style="color: green">{{ total_send }}</span> 个</h3>
            </div>
          </div>

          <!--          部分发货状态下-->
          <div class="total" v-if="purchaseOrder.order_status==='PART_SENT'">
            <div style="float: left; width: 200px">
              <h3>订单总数量：<span style="color: green">{{ purchaseOrder.total_buy_qty }}</span> 个 </h3>
            </div>
          </div>

          <div STYLE="display: flex;justify-content: right;margin-right: 20px">
            <el-button type="primary" icon="el-icon-check"
                       @click="doConfirm"
                       v-if="purchaseOrder.order_status==='WAIT_CONFIRM'">
              确认订单
            </el-button>

            <el-button type="" icon="el-icon-printer"  v-if="purchaseOrder.order_status==='WAIT_CONFIRM'">打印订单
            </el-button>

            <el-button type="success" icon="el-icon-truck"
                       :disabled="!total_send"
                       @click="doConfirmSent"
                       v-if="purchaseOrder.order_status==='IN_PRODUCTION' || purchaseOrder.order_status==='PART_SENT'">
              确认发货
            </el-button>

          </div>

        </div>
      </el-skeleton>
    </el-card>

    <el-dialog
        title="订单发货"
        :close-on-click-modal="false"
        :visible.sync="dialogVisible"
        width="500px">
      <el-form ref="form" label-position="top">
        <el-form-item label="物流">
          <el-select v-model="purchaseOrder.logistic" placeholder="请选择物流">
            <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="单号">
          <el-input v-model="purchaseOrder.tracking_number" placeholder="请填写单号"></el-input>
        </el-form-item>

        <el-form-item label="箱数">
          <el-input-number v-model="purchaseOrder.package_count" :min="1"></el-input-number>
        </el-form-item>
      </el-form>



      <span slot="footer" class="dialog-footer">
    <el-button @click="dialogVisible = false">取 消</el-button>
    <el-button
        v-if="purchaseOrder.order_status==='IN_PRODUCTION'"
        type="primary" @click="doSent">确 定</el-button>
    <el-button
        v-if="purchaseOrder.order_status==='PART_SENT'"
        type="primary" @click="doPartSent">确 定</el-button>
  </span>
    </el-dialog>

  </div>
</template>

<script>
import moment from "moment";

export default {
  name: "SupplierOrderDetail",
  computed: {
    create_time() {
      return moment(this.purchaseOrder.create_time).format("YYYY年MM月DD日");
    },
    orderStatus() {
      if (this.purchaseOrder.order_status === 'WAIT_CONFIRM') return '请确认订单';
      if (this.purchaseOrder.order_status === 'IN_PRODUCTION') return '请填写发货数量';
      if (this.purchaseOrder.order_status === 'PART_SENT') return '请填写剩余发货数量';
      if (this.purchaseOrder.order_status === 'SENT') return '已发货订单';
      return ''
    },
    // 总发货数量
    total_send(){
      let total = 0;
      this.purchaseOrder.purchase_detail.forEach(item=>{
        total += item.sent_qty
      });
      return total;
    }
  },
  data() {
    return {
      purchaseOrder: {},
      loading: false,
      isSupply: false,
      isShortNote: false,
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
  mounted() {
    this.initPurchase();
  },
  filters:{
    //日期格式化
    dateFormat: function(value){
      return moment(value).format("YYYY年MM月DD日");
    }
  },
  methods: {
    // 返回
    backToIndex() {
      this.$router.push('/supplierIndex');
    },

    // 确认发货打开对话框
    doConfirmSent(){
      this.dialogVisible = true;
    },

    // 部分发货状态下的确认发货
    doPartSent(){
      this.$confirm('是否确认发货', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 检查订单的发货状态
        this.purchaseOrder.order_status = 'SENT'; // 操作类型，发货后转入已发货

        this.purchaseOrder['operate'] = 'SEND' // 操作标志是发货
        this.purchaseOrder.purchase_detail.forEach(item=>{
          if(item.sent_qty<item.qty) this.purchaseOrder.order_status = 'PART_SENT';

        })

        this.putRequest('api/purchase_orders/purchase_edit/', this.purchaseOrder).then(resp => {
          if (resp) {
            this.loading = false;

            this.$emit("reloadList"); // 通知父路由刷新列表
            this.dialogVisible = false;

            this.$router.push('/supplierIndex');

          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        });
      });
    },

    // 确认发货
    doSent(){
      this.$confirm('是否确认发货', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 检查订单的发货状态
        this.purchaseOrder.order_status = 'SENT'; // 操作类型，发货后转入已发货

        this.purchaseOrder['operate'] = 'SEND' // 操作标志是发货
        this.purchaseOrder.purchase_detail.forEach(item=>{

          // 只要有一行发货数量小于采购数量，则为部分发货
          if(item.sent_qty<item.qty) this.purchaseOrder.order_status = 'PART_SENT';

        })

        this.putRequest('api/purchase_orders/purchase_edit/', this.purchaseOrder).then(resp => {
          if (resp) {
            this.loading = false;

            this.$emit("reloadList"); // 通知父路由刷新列表
            this.dialogVisible = false;

            this.$router.push('/supplierIndex');

          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        });
      });
    },

    // 确认订单
    doConfirm(){
      this.$confirm('是否确认订单', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.purchaseOrder.order_status = 'IN_PRODUCTION'; // 操作类型，确认订单后转入生产中
        this.putRequest('api/purchase_orders/'+this.purchaseOrder.id+'/', this.purchaseOrder).then(resp => {
          if (resp) {
            this.loading = false;
            this.$message({
              type: 'success',
              message: '订单已确认！等待发货'
            });

            this.$emit("reloadList"); // 通知父路由刷新列表

            this.$router.push('/supplierIndex');
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        });
      });
    },

    // 初始化采购单信息
    initPurchase() {
      this.loading = true;
      this.getRequest('api/purchase_orders/' + this.$route.query.id + '/').then(resp => {
        if (resp) {
          this.loading = false;
          this.purchaseOrder = resp;
          this.purchaseOrder.package_count = 1; //默认数量1
          this.purchaseOrder.purchase_detail.forEach(item => {
            if (this.purchaseOrder.order_status == 'IN_PRODUCTION'){
              item.sent_qty = item.qty;
            }
            if (this.purchaseOrder.order_status == 'PART_SENT' || this.purchaseOrder.order_status == 'SENT'){
              item['already_sent_qty'] = item.sent_qty
              // 在部分发货模式下，如果有行已经发货，则把行标上已发货
              item['is_sent'] = false;
              if (item.sent_qty >= item.qty) {
                item['is_sent'] = true;
              } else {
                item.sent_qty = item.qty - item.sent_qty
              }
            }
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

  }
}
</script>

<style scoped>
.total {
  display: flex;
  justify-content: flex-end;
  margin-right: 50px;
  margin-bottom: 20px;
}
.block{
  width: 50%;
}
</style>