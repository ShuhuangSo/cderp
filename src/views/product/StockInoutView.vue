<template>
  <div style="display: flex; justify-content: center">
    <el-skeleton :loading="loading" :rows="16" animated>
      <div class="inoutContainer">

        <el-card shadow="hover" style="padding-bottom: 20px">
          <div slot="header" class="clearfix">
            <el-page-header @back="cancel" :content="title">
            </el-page-header>
          </div>
          <div>
            <el-form ref="inoutForm" :model="stockInout" label-width="180px" class="inoutForm">
              <el-form-item label="类型" prop="origin_store">
                <el-tag type="success" size="small" effect="dark" v-if="stockInout.type==='IN'">入库</el-tag>
                <el-tag type="danger" size="small" effect="dark" v-if="stockInout.type==='OUT'">出库</el-tag>
                <el-tag type="warning" size="small" effect="dark" v-if="stockInout.type==='MOVE'">调拨</el-tag>
                <el-tag type="info" size="small" effect="dark" v-if="stockInout.type==='TAKING'">盘点</el-tag>
              </el-form-item>

              <el-form-item label="源仓库/店铺" prop="origin_store" v-if="stockInout.type==='MOVE'">
                <el-tag>{{ stockInout.origin_store_name }}</el-tag>
              </el-form-item>

              <el-form-item :label="stockInout.type==='OUT'?'仓库/店铺':'目标仓库/店铺'" prop="target_store">
                <el-tag>{{ stockInout.target_store_name }}</el-tag>
              </el-form-item>

              <el-form-item label="操作人" prop="origin_store">
                <el-tag>{{ stockInout.username }}</el-tag>
              </el-form-item>

              <el-form-item label="处理时间" prop="origin_store">
                <el-tag>{{ create_time }}</el-tag>
              </el-form-item>

              <el-form-item label="入库原因" prop="reason_in" v-if="stockInout.type==='IN'">
                <el-select v-model="stockInout.reason_in"
                           disabled>
                  <el-option
                      v-for="item in reasonInOptions"
                      :key="item.value"
                      :label="item.name"
                      :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>

              <el-form-item label="出库原因" prop="reason_out" v-if="stockInout.type==='OUT'">
                <el-select v-model="stockInout.reason_out"
                           disabled>
                  <el-option
                      disabled
                      v-for="item in reasonOutOptions"
                      :key="item.value"
                      :label="item.name"
                      :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>

              <el-form-item label="调拨原因" prop="reason_move" v-if="stockInout.type==='MOVE'">
                <el-select v-model="stockInout.reason_move"
                           disabled>
                  <el-option
                      disabled
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
                  prop="stock_before"
                  label="操作前库存"
                  align="center"
                  header-align="center"
                  width="200">
              </el-table-column>
              <el-table-column
                  prop="qty"
                  :label="qtyLabel"
                  align="center"
                  header-align="center"
                  width="200">
              </el-table-column>

            </el-table>
          </div>

          <div STYLE="display: flex;justify-content: right;margin-right: 20px">
            <el-button type="primary" @click="doUpdate">提交修改
            </el-button>
          </div>
        </el-card>
      </div>
    </el-skeleton>

  </div>
</template>

<script>
import moment from "moment";

export default {
  name: "StockInoutView",
  computed: {
    create_time() {
      return moment(this.stockInout.create_time).format("YYYY-MM-DD HH:mm:ss");
    },
    qtyLabel(){
      if (this.stockInout.type ==='IN'){
        return '入库数量'
      }else if(this.stockInout.type ==='OUT'){
        return '出库数量'
      }else if(this.stockInout.type ==='MOVE'){
        return '调拨数量'
      }else if(this.stockInout.type ==='TAKING'){
        return '盘点数量'
      }else {
        return '数量'
      }
    },
    title(){
      let title = '';
      if(this.stockInout.type==='IN'){
        title = '手工入库单'
      }
      if(this.stockInout.type==='OUT'){
        title = '手工出库单'
      }
      if(this.stockInout.type==='MOVE'){
        title = '库存调拨单'
      }
      if(this.stockInout.type==='TAKING'){
        title = '盘点记录单'
      }
      return title;
    }
  },
  data() {
    return {
      stockInout: {},
      loading: false,
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
    }
  },
  mounted() {
    this.initStockInOut();
  },
  methods: {
    doUpdate() {
      this.putRequest('api/stock_in_out/' + this.$route.query.id + '/', this.stockInout).then(resp => {
        if (resp) {
          this.$router.push('/productStockInout');
        }
      })
    },
    cancel() {
      this.$router.push('/productStockInout');
    },
    // 初始化出入库单详情
    initStockInOut() {
      this.loading = true;
      this.getRequest('api/stock_in_out/' + this.$route.query.id + '').then(resp => {
        if (resp) {
          this.loading = false;
          this.stockInout = resp;
        }
      })
    }

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