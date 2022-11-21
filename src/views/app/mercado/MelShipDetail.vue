/*
美客多FBM--运单详情
*/
<template>
  <div style="display: flex; justify-content: center">
    <div class="pContainer">
      <el-card shadow="hover" style="padding-bottom: 20px">
        <div slot="header" class="clearfix">
          <el-page-header @back="cancel" content="运单详情">
          </el-page-header>
        </div>

        <div style="padding-left: 50px; padding-right: 50px">
          <el-descriptions :colon="false" :column=2 size="medium" title="运单信息">
            <el-descriptions-item label="类型:">{{ this.ship.target }}</el-descriptions-item>
            <el-descriptions-item label="批次号:">{{ this.ship.batch }}</el-descriptions-item>
            <el-descriptions-item label="目标店铺:">{{ this.ship.shop }}</el-descriptions-item>
            <el-descriptions-item label="Envio号:">{{ this.ship.envio_number }}</el-descriptions-item>
            <el-descriptions-item label="FBM仓库:">{{ this.ship.target_FBM }}</el-descriptions-item>
            <el-descriptions-item label="承运商:">{{ this.ship.carrier }}</el-descriptions-item>
            <el-descriptions-item label="发货方式:">{{ this.ship.ship_type }}</el-descriptions-item>
            <el-descriptions-item label="截单日期:">{{ this.ship.end_date }}</el-descriptions-item>
            <el-descriptions-item label="航班日期:">{{ this.ship.ship_date }}</el-descriptions-item>
            <el-descriptions-item></el-descriptions-item>
            <el-descriptions-item label="内部备注:">
              <el-input
                  style="width: 400px;"
                  type="textarea"
                  :rows="2"
                  placeholder="请输入备注"
                  @change="changeNote"
                  v-model="ship.note">
              </el-input>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="block">
          <h4>包装箱</h4>
          <el-button>新增包装箱</el-button>
            <el-card v-for="item in boxes" :key="item.id" class="box">
              <div slot="header" class="clearfix">
                <span>{{ item.box_number }}</span>
                <el-button style="float: right; padding: 3px 0" type="text">编辑</el-button>
              </div>
              <el-descriptions :column=1 size="medium">
                <el-descriptions-item label="箱号">{{ item.box_number }}</el-descriptions-item>
                <el-descriptions-item label="物流商箱唛号">{{ item.carrier_box_number }}</el-descriptions-item>
              </el-descriptions>
            </el-card>
        </div>

        <div style="margin-left: 10px">
          <h4>产品信息</h4>
        </div>
        <el-table
            :header-cell-style="{background:'#eef1f6'}"
            :data="ship.ship_shipDetail"
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
              label="产品"
              show-overflow-tooltip
              width="300">
            <template slot-scope="scope">
              <div>{{ scope.row.sku }}
                <el-tag v-if="scope.row.s_type==='NEW'" type="success" size="mini" effect="dark">新入仓</el-tag>
              </div>

              <div>{{ scope.row.p_name }}</div>
            </template>
          </el-table-column>

          <el-table-column
              label="ItemID"
              show-overflow-tooltip
              width="120">
            <template slot-scope="scope">
              <div>{{ scope.row.item_id }}</div>
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
              label="简要备注">
            <template slot-scope="scope">
              <el-input maxlength=20 v-model="scope.row.note"></el-input>
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
                  v-if="scope.row.s_type === 'NEW'"
                  title="取消标新"
                  @click="changeType(scope.row)"
                  type="success" size="mini" circle>新</el-button>
              <el-button
                  v-if="scope.row.s_type === 'REFILL'"
                  title="标记为新产品"
                  @click="changeType(scope.row)"
                  type="" size="mini" circle>新</el-button>
              <el-button
                  @click="removeProduct(scope.row.sku)"
                  type="" size="mini" icon="el-icon-delete" circle></el-button>

            </template>
          </el-table-column>
        </el-table>

      </el-card>
    </div>
  </div>
</template>

<script>
export default {
  name: "MelShipDetail",
  data(){
    return{
      shipID: this.$route.query.id, // 运单id
      ship: null,
      loading: false,
      boxes: [], //包装箱
    }
  },
  mounted() {
    this.initShip();
    this.initBox();
  },
  methods:{
    // 取消并返回
    cancel() {
      this.$router.push({
        path: '/melManage',
        query: {
          activeName: 'second'
        }
      });
    },

    // 初始化运单信息
    initShip() {
      this.loading = true;
      this.getRequest('api/ml_ship/' + this.shipID + '/').then(resp => {
        if (resp) {
          this.loading = false;
          this.ship = resp;
        }
      })
    },
    // 初始化包装箱
    initBox(){
      this.getRequest('api/ml_ship_box/?ship='+ this.shipID +'&page_size=1000&ordering=id').then(resp => {
        if (resp.results) {
          this.boxes = resp.results;
        }
      })
    },

  }
}
</script>

<style scoped>
.pContainer {
  margin-top: 10px;
  width: 1200px;
}

.block{
  width: 50%;
  padding-left: 50px;

}
.box{
  width: 400px;
  margin-top: 10px;
  margin-right: 10px;
}
</style>