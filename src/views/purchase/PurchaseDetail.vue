<template>
  <div style="display: flex; justify-content: center">
    <div class="pContainer">
      <el-card shadow="hover" style="padding-bottom: 20px">

        <div slot="header" class="clearfix">
          <el-page-header @back="cancel" content="采购单详情">
          </el-page-header>
        </div>

        <div class="step">
          <el-steps :space="200" :active="orderStep"
                    finish-status="success">
            <el-step title="创建采购单"></el-step>
            <el-step title="供应商确认"></el-step>
            <el-step title="生产"></el-step>
            <el-step title="发货"></el-step>
            <el-step title="收货完成"></el-step>
          </el-steps>
        </div>

        <div style="padding-left: 50px; padding-right: 50px">
          <el-descriptions :colon="false" :column=2 size="medium" title="订单信息">
            <el-descriptions-item label="批次号:">{{ this.purchaseOrder.p_number }}</el-descriptions-item>
            <el-descriptions-item label="供应商:">{{ this.purchaseOrder.supplier_name }}</el-descriptions-item>
            <el-descriptions-item label="收货仓库/店铺:">{{ this.purchaseOrder.store_name }}</el-descriptions-item>
            <el-descriptions-item label="收货人:">{{ this.purchaseOrder.rec_name }}</el-descriptions-item>
            <el-descriptions-item label="电话:">{{ this.purchaseOrder.rec_phone }}</el-descriptions-item>
            <el-descriptions-item label="收货地址:">{{ this.purchaseOrder.rec_address }}</el-descriptions-item>
            <el-descriptions-item label="操作人:">{{ this.purchaseOrder.username }}</el-descriptions-item>
            <el-descriptions-item label="运费:">{{ this.purchaseOrder.postage }}</el-descriptions-item>
            <el-descriptions-item label="创建时间:">{{ create_time }}</el-descriptions-item>
            <el-descriptions-item></el-descriptions-item>
            <el-descriptions-item label="内部备注:">
              <el-input
                  style="width: 400px;"
                  type="textarea"
                  :rows="2"
                  placeholder="请输入备注，内容仅公司内部可见"
                  @change="changeNote"
                  v-model="purchaseOrder.note">
              </el-input>
            </el-descriptions-item>

            <el-descriptions-item label="供应商Tips:">
              <el-input
                  style="width: 400px;"
                  type="textarea"
                  :rows="2"
                  placeholder="请输入供应商备注，供应商可见"
                  @change="changeSupTips"
                  v-model="purchaseOrder.sup_tips">
              </el-input>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="block" v-if="purchaseOrder.purchase_post_info">
          <h4>发货信息</h4>
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

        <div
            v-if="purchaseOrder.order_status === 'PART_SENT'"
            style="width: 98%; margin: 10px">
          <el-alert
              center
              show-icon
              :closable="false"
              :title="'订单部分发货，在途总数量：'+ this.purchaseOrder.total_onway_qty "
              type="warning">
          </el-alert>
        </div>
        <div>
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
                label="产品名称">
              <template slot-scope="scope">
                <span style="margin-right: 5px">{{ scope.row.p_name }}</span>
                <el-tag type="danger" effect="dark" size="mini" v-if="scope.row.urgent">加急</el-tag>
              </template>
            </el-table-column>
            <el-table-column
                align="center"
                header-align="center"
                width="80"
                label="采购价">
              <template slot-scope="scope">
                {{ scope.row.unit_cost | currency }}
              </template>
            </el-table-column>

            <el-table-column
                v-if="isSupply"
                align="center"
                header-align="center"
                width="80"
                label="提供内壳">
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

            <el-table-column
                prop="qty"
                align="center"
                header-align="center"
                width="80"
                label="数量">
            </el-table-column>

            <el-table-column
                prop="subTotal"
                :formatter="moneyFormat"
                label="小计"
                align="center"
                header-align="center"
                width="80">
            </el-table-column>

            <el-table-column
                v-if="purchaseOrder.total_onway_qty>0"
                prop="onway_qty"
                align="center"
                header-align="center"
                width="80"
                label="在途">
            </el-table-column>

            <el-table-column
                v-if="purchaseOrder.order_status!=='WAIT_CONFIRM' && purchaseOrder.order_status!=='IN_PRODUCTION'"
                prop="already_rec_qty"
                align="center"
                header-align="center"
                width="80"
                label="已收货">
            </el-table-column>

            <el-table-column
                v-if="purchaseOrder.order_status==='PART_SENT' || purchaseOrder.order_status==='SENT'"
                label="收货数量"
                align="center"
                header-align="center"
                width="160">
              <template slot-scope="scope">
                <el-input-number
                    :disabled="scope.row.already_rec_qty==scope.row.qty"
                    v-model="scope.row.received_qty" :min="0"></el-input-number>
              </template>
            </el-table-column>

            <el-table-column
                v-if="purchaseOrder.total_paid_qty"
                prop="already_paid_qty"
                align="center"
                header-align="center"
                width="80"
                label="已结算">
            </el-table-column>

            <el-table-column
                v-if="purchaseOrder.order_status==='FINISHED' && purchaseOrder.paid_status!=='FULL_PAID'"
                label="结算数量"
                align="center"
                header-align="center"
                width="160">
              <template slot-scope="scope">
                <el-input-number
                    :disabled="scope.row.already_paid_qty>=scope.row.received_qty"
                    v-model="scope.row.paid_qty" :min="0"></el-input-number>
              </template>
            </el-table-column>

          </el-table>

          <div class="total">
            <div style="float: left; width: 250px">
              <h3>总数量：<span style="color: green">{{ this.purchaseOrder.total_buy_qty }}</span> 个</h3>
              <h3>总金额：<span style="color: green">{{ this.purchaseOrder.total_cost | currency }}</span> 元</h3>
              <h3 v-if="purchaseOrder.total_paid">结算金额：<span style="color: green">{{ this.purchaseOrder.total_paid | currency }}</span> 元</h3>
            </div>
          </div>

          <div

              STYLE="display: flex;justify-content: right;margin-right: 20px">
            <el-button
                      v-if="purchaseOrder.order_status==='WAIT_CONFIRM'"
                      type="primary" icon="el-icon-edit"
                      @click="goCreatePurchase('PRE_SUMMIT')">打回草稿箱
            </el-button>
            <el-button
                       v-if="purchaseOrder.order_status==='WAIT_CONFIRM'"
                       type="" icon="el-icon-delete"
                       @click="cancelPurchase('CANCEL')">作废采购单
            </el-button>
            <el-button
                type="primary" icon="el-icon-check"
                v-if="purchaseOrder.order_status==='PART_SENT' || purchaseOrder.order_status==='SENT'"
                @click="doReceivedPurchase(purchaseOrder.order_status)">确认收货
            </el-button>

            <el-button
                type="primary" icon="el-icon-check"
                v-if="purchaseOrder.order_status==='FINISHED' && purchaseOrder.paid_status!=='FULL_PAID'"
                @click="doCheckout(purchaseOrder.order_status)">确认结算
            </el-button>

          </div>

        </div>

      </el-card>

      <div style="margin-top: 20px">
        <PurchaseLog :purchaseID="this.purchaseID"></PurchaseLog>
      </div>
    </div>
  </div>
</template>

<script>
import moment from "moment";
import PurchaseLog from "@/components/purchase/PurchaseLog";

export default {
  name: "PurchaseDetail",
  computed: {
    create_time() {
      return moment(this.purchaseOrder.create_time).format("YYYY-MM-DD HH:mm:ss");
    },
    orderStep() {
      if (this.purchaseOrder.order_status === 'WAIT_CONFIRM') return 1;
      if (this.purchaseOrder.order_status === 'IN_PRODUCTION') return 2;
      if (this.purchaseOrder.order_status === 'SENT') return 4;
      if (this.purchaseOrder.order_status === 'PART_SENT') return 3;
      if (this.purchaseOrder.order_status === 'FINISHED') return 5;

    },
  },
  data() {
    return {
      purchaseID: this.$route.query.id, // 采购单id
      loading: false,
      isSupply: false,
      isShortNote: false,
      purchaseOrder: {},
    }
  },
  filters: {
    //金额格式化
    currency: function (value) {
      if (!value) return 0.00;
      return `¥${value.toFixed(2)}`;
    },
    //日期格式化
    dateFormat: function(value) {
      return moment(value).format("YYYY年MM月DD日 HH:mm");
    }
  },
  mounted() {
    this.initPurchase();
  },
  components: {
    PurchaseLog
  },
  methods: {
    // 金额日期时间
    moneyFormat: function (row, column) {

      let value = row[column.property];

      if (value == undefined) {
        return ''
      }
      return `¥${value.toFixed(2)}`;
    },

    //  作废采购单
    cancelPurchase(order_status) {
      this.$confirm('是否作废采购订单？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }).then(() => {
        this.purchaseOrder.order_status = order_status; // 操作类型
        this.putRequest('api/purchase_orders/' + this.purchaseID + '/', this.purchaseOrder).then(resp => {
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

    //  放回草稿箱
    goCreatePurchase(order_status) {
      this.$confirm('是否将采购单打回草稿箱？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.purchaseOrder.order_status = order_status; // 操作类型

        this.putRequest('api/purchase_orders/' + this.purchaseID + '/', this.purchaseOrder).then(resp => {
          if (resp) {
            this.loading = false;
            this.$router.push({
              path: '/createPurchase',
              query: {
                id: this.purchaseID
              }
            });
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        });
      });

    },

    // 确认结算
    doCheckout(){
      this.$confirm('是否确认结算所选数量？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.purchaseOrder['operate'] = 'CHECKOUT'; // 操作标志是结算
        this.loading = true;
        this.putRequest('api/purchase_orders/purchase_edit/', this.purchaseOrder).then(resp => {
          if (resp) {
            this.loading = false;
            this.initPurchase();
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        });
      });

    },

    //  提交确认收货
    doReceivedPurchase(order_status) {
      this.$confirm('是否确认收货？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.purchaseOrder.order_status = order_status; // 操作类型
        this.purchaseOrder['operate'] = 'RECEIVE'; // 操作标志是收货
        this.loading = true;
        this.putRequest('api/purchase_orders/purchase_edit/', this.purchaseOrder).then(resp => {
          if (resp) {
            this.loading = false;
            this.initPurchase();
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        });
      });

    },

    //保存改变的备注信息
    changeNote(string) {
      this.purchaseOrder.note = string;
      this.putRequest('api/purchase_orders/' + this.purchaseID + '/', this.purchaseOrder).then(resp => {
        if (resp) {
          this.$message.success('修改成功！')
        }
      })
    },

    //保存改变的备注信息
    changeSupTips(string) {
      this.purchaseOrder.sup_tips = string;
      this.putRequest('api/purchase_orders/' + this.purchaseID + '/', this.purchaseOrder).then(resp => {
        if (resp) {
          this.$message.success('修改成功！')
        }
      })
    },

    // 初始化采购单信息
    initPurchase() {
      this.loading = true;
      this.getRequest('api/purchase_orders/' + this.purchaseID + '/').then(resp => {
        if (resp) {
          this.loading = false;
          this.purchaseOrder = resp;
          this.purchaseOrder.purchase_detail.forEach(item => {
            item['subTotal'] = item.qty * item.unit_cost;
            if (this.purchaseOrder.order_status !== 'WAIT_CONFIRM' || this.purchaseOrder.order_status !== 'IN_PRODUCTION'){
              item['already_rec_qty'] = item.received_qty;
            }

            // 显示时将在途数量默认填到收货数量上
            if (this.purchaseOrder.order_status === 'PART_SENT'){
              item.received_qty = item.onway_qty;
            }

            // 显示已结算数量
            if(this.purchaseOrder.total_paid_qty>0){
              item['already_paid_qty'] = item.paid_qty
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

    // 取消并返回
    cancel() {
      this.$router.push('/purchaseOrder');
    },
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
  padding-left: 150px;
  margin-bottom: 50px;
  margin-top: 50px;
}
.block{
  width: 50%;
  padding-left: 50px;

}
</style>