/*
美客多FBM--编辑运单
*/
<template>
  <div style="display: flex; justify-content: center">
    <div class="pContainer">
      <el-card shadow="hover" style="padding-bottom: 20px">
        <div slot="header" class="clearfix">
          <el-page-header @back="cancel" content="编辑运单">
          </el-page-header>
        </div>
        <div>
          <el-form ref="shipForm" :rules="rules" :model="ship" label-width="180px">
            <el-form-item label="类型" prop="target">
              <el-radio-group v-model="ship.target" @input="changeTarget" disabled>
                <el-radio label="FBM">FBM入仓</el-radio>
                <el-radio label="TRANSIT">中转仓</el-radio>
              </el-radio-group>

            </el-form-item>

            <el-form-item label="全员可见" v-if="this.user.is_superuser && this.ship.target==='TRANSIT'">
              <el-switch v-model="all_see"></el-switch>
            </el-form-item>

            <el-form-item label="批次号" required prop="batch">
              <el-input v-model="ship.batch"
                        :disabled="!this.user.is_superuser && this.all_see"
                        style="width: 350px;"
                        maxlength="50"></el-input>
            </el-form-item>

            <el-form-item label="目标店铺" required prop="shop">
              <el-select v-model="ship.shop"
                         style="width: 350px;"
                         disabled
                         placeholder="请选择店铺">
                <el-option
                    v-for="item in shops"
                    :key="ship.name"
                    :label="item.name"
                    :value="item.name">
                  <span style="float: left">{{ item.name }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">{{ item.nickname }}</span>
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item
                v-if="ship.target==='FBM'"
                label="目标FBM仓库" prop="fbm_warehouse">
              <el-select v-model="ship.fbm_warehouse"
                         style="width: 350px;"
                         placeholder="请选择FBM仓库">
                <el-option
                    v-for="item in fbm_warehouses"
                    :key="ship.w_code"
                    :label="item.w_code"
                    :value="item.w_code">
                  <span style="float: left">{{ item.w_code }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">{{ item.name }}</span>
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="承运商" prop="carrier">
              <el-select v-model="ship.carrier"
                         style="width: 350px;"
                         placeholder="请选择发货物流">
                <el-option
                    v-for="item in carriers"
                    :key="item.name"
                    :label="item.name"
                    :value="item.name">
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="物流商单号" prop="s_number">
              <el-input v-model="ship.s_number"
                        style="width: 350px;"
                        maxlength="50"></el-input>
            </el-form-item>

            <el-form-item label="Envio号" prop="envio_number">
              <el-input v-model="ship.envio_number"
                        style="width: 350px;"
                        maxlength="50"></el-input>
            </el-form-item>

            <el-form-item label="发货方式" prop="ship_type">
              <el-radio-group v-model="ship.ship_type" :disabled="!this.user.is_superuser && this.all_see">
                <el-radio label="空运">空运</el-radio>
                <el-radio label="海运">海运</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="截单日期" prop="end_date">
              <el-date-picker
                  v-model="ship.end_date"
                  :disabled="!this.user.is_superuser && this.all_see"
                  value-format="yyyy-MM-dd"
                  type="date"
                  placeholder="选择日期">
              </el-date-picker>
            </el-form-item>

            <el-form-item label="航班日期" prop="end_date">
              <el-date-picker
                  v-model="ship.ship_date"
                  :disabled="!this.user.is_superuser && this.all_see"
                  value-format="yyyy-MM-dd"
                  type="date"
                  placeholder="选择日期">
              </el-date-picker>
            </el-form-item>

            <el-form-item label="备注">
              <el-input
                  style="width: 600px;"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入备注"
                  v-model="ship.note">
              </el-input>
            </el-form-item>

          </el-form>
        </div>

        <div style="display: flex; justify-content: space-between">
          <el-button type="primary" icon="el-icon-plus"
                     style="margin-left: 10px"
                     :disabled="!ship.shop || ship.s_status!=='PREPARING'"
                     @click="addProduct">添加产品
          </el-button>

          <el-button icon="el-icon-edit-outline"
                     :type="show_plan?'warning':''"
                     style="margin-right: 15px"
                     :disabled="!ship.shop"
                     @click="changePlan">FBM计划
          </el-button>
        </div>
        <el-table
            :header-cell-style="{background:'#eef1f6'}"
            :data="ship.ship_shipDetail"
            :row-class-name="tableRowClassName"
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
                  :class="scope.row.can_see?'color_photo':'gray_photo'"
                  :src="scope.row.image | smpic"
                  fit="fill">
              </el-image>
            </template>
          </el-table-column>
          <el-table-column
              label="产品"
              show-overflow-tooltip
              width="300">
            <template slot-scope="scope">
              <div style="font-weight: bold">{{ scope.row.sku }}</div>

              <div>{{ scope.row.p_name }}</div>

              <div>
                <el-input-number v-if="show_plan" size="mini" v-model="scope.row.plan_qty" :min="0"></el-input-number>
                <span class="plan3" v-if="scope.row.plan_qty>0 && scope.row.plan_qty === scope.row.qty">
                <i class="el-icon-circle-check"></i> 计划 {{ scope.row.plan_qty }}</span>
                <span class="plan1" v-if="scope.row.plan_qty>0 && scope.row.plan_qty !== scope.row.qty">
                <i class="el-icon-warning-outline"></i> 计划 {{ scope.row.plan_qty }}</span>
                <span class="plan2" v-if="scope.row.plan_qty === 0">
                <i class="el-icon-circle-close"></i> 计划 无</span>
              </div>

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
              v-if="ship.target==='TRANSIT'"
              label="FBM店铺"
              align="center"
              header-align="center"
              show-overflow-tooltip
              width="100">
            <template slot-scope="scope">
              <div>{{ scope.row.target_FBM }}</div>
            </template>
          </el-table-column>

          <el-table-column
              label="数量"
              align="center"
              header-align="center"
              width="160">
            <template slot-scope="scope">
              <el-input-number v-if="ship.s_status==='PREPARING'"
                               :disabled="!scope.row.can_see"
                               v-model="scope.row.qty" :min="1"></el-input-number>
              <span v-if="ship.s_status!=='PREPARING'">{{scope.row.qty}}</span>
            </template>
          </el-table-column>

          <el-table-column
              label="简要备注">
            <template slot-scope="scope">
              <el-input maxlength=20 :disabled="!scope.row.can_see" v-model="scope.row.note"></el-input>
            </template>
          </el-table-column>

          <el-table-column
              label="操作"
              width="100"
              align="center"
              header-align="center"
          >
            <template slot-scope="scope">
<!--              <el-button-->
<!--                  v-if="scope.row.s_type === 'NEW'"-->
<!--                  title="取消标新"-->
<!--                  @click="changeType(scope.row)"-->
<!--                  type="success" size="mini" circle>新</el-button>-->
<!--              <el-button-->
<!--                  v-if="scope.row.s_type === 'REFILL'"-->
<!--                  title="标记为新产品"-->
<!--                  @click="changeType(scope.row)"-->
<!--                  type="" size="mini" circle>新</el-button>-->
              <el-button
                  v-if="ship.s_status==='PREPARING'"
                  :disabled="!scope.row.can_see"
                  @click="removeProduct(scope.row.sku)"
                  type="" size="mini" icon="el-icon-delete" circle></el-button>

            </template>
          </el-table-column>
        </el-table>

        <div style="margin-left: 10px" v-if="removeItems.length > 0">
          <h4>变动清单</h4>
        </div>
        <el-table
            v-if="removeItems.length > 0"
            :header-cell-style="{background:'#eef1f6'}"
            :data="removeItems"
            border
            size="mini"
            style="width: 650px; margin: 10px">
          <el-table-column
              label="图片"
              align="center"
              header-align="center"
              width="80">
            <template slot-scope="scope">
              <el-image
                  style="width: 40px; height: 40px"
                  :src="scope.row.image | smpic"
                  fit="fill">
              </el-image>
            </template>
          </el-table-column>
          <el-table-column
              label="产品"
              show-overflow-tooltip
              width="300">
            <template slot-scope="scope">
              <div><span class="remove">{{ scope.row.sku }} </span>
                <el-tag type="danger" size="mini" v-if="scope.row.item_type==='REMOVE'">移除</el-tag>
                <el-tag type="warning" size="mini" v-if="scope.row.item_type==='REDUCE'">减量</el-tag>
              </div>

              <div class="remove">{{ scope.row.p_name }}</div>
            </template>
          </el-table-column>

          <el-table-column
              label="计划数量"
              align="center"
              header-align="center"
              width="80">
            <template slot-scope="scope">
              <div>{{ scope.row.plan_qty }}</div>
            </template>
          </el-table-column>

          <el-table-column
              label="实发数量"
              align="center"
              header-align="center"
              width="80">
            <template slot-scope="scope">
              <div>{{ scope.row.send_qty }}</div>
            </template>
          </el-table-column>

          <el-table-column
              align="center"
              header-align="center"
              label="操作">
            <template slot-scope="scope">
            </template>
          </el-table-column>

        </el-table>

        <div class="total" v-if="ship.ship_shipDetail.length">
          <div style="float: left; width: 250px">
            <h3>FBM计划SKU数：<span style="color: darkorange;">{{ totalPlanSKU }}</span> 个</h3>
            <h3>FBM计划总数量：<span style="color: darkorange;">{{ totalPlanQuantity }}</span> 个</h3>
            <h3>运单SKU数：<span style="color: green">{{ ship.ship_shipDetail.length }}</span> 个</h3>
            <h3>运单总数量：<span style="color: green">{{ totalQuantity }}</span> 个</h3>
            <div v-if="percent"><h4>超出计划：<span style="color: red">{{ percent }}%</span></h4></div>
          </div>
        </div>

        <div STYLE="display: flex;justify-content: right;margin-right: 20px">
          <el-button type="success"
                     :disabled="!ship.ship_shipDetail.length"
                     @click="submitForm('WAIT_CONFIRM')">保存运单
          </el-button>

        </div>

      </el-card>

      <div style="margin-top: 20px">
        <MelShipAttachment :shipID="shipID"></MelShipAttachment>
      </div>

      <div style="margin-top: 20px">
        <ShipLog :shipID="shipID"></ShipLog>
      </div>
    </div>

    <!--    添加产品弹窗-->
    <el-dialog
        title="添加产品"
        :visible.sync="addProductVisible"
        :destroy-on-close="true"
        :close-on-click-modal="false"
        width="800px"
    >
      <MelAddProduct ref="addProduct" @func="getAddProducts"></MelAddProduct>
      <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="addProductVisible = false">取 消</el-button>
          <el-button size="small" type="primary" @click="confirmAddProduct">确 定</el-button>
        </span>
    </el-dialog>

  </div>
</template>

<script>
import MelAddProduct from "@/views/app/mercado/MelAddProduct";
import moment from "moment/moment";
import ShipLog from "@/components/app/mercado/ShipLog";
import MelShipAttachment from "@/components/app/mercado/MelShipAttachment";

export default {
  name: "MelEditShip",
  components:{
    MelAddProduct, ShipLog, MelShipAttachment
  },
  data(){
    return{
      user: JSON.parse(window.sessionStorage.getItem('user')),
      shipID: this.$route.query.id, // 运单id
      click_from: this.$route.query.click_from, // 从哪点击过来
      loading: false,
      ship: {
        target: 'FBM',
        shop: '',
        ship_type: '空运',
        carrier: '',
        fbm_warehouse: '',
        end_date: '',
        ship_date: '',
        note: '',
        ship_shipDetail: [],
      },
      all_see: false,
      shops: [], //可选店铺
      carriers: [], //可选物流商
      fbm_warehouses: [], //可选fbm仓库
      removeItems: [], //遗弃清单
      show_plan: false, // 计划数量修改框可见状态
      addProductVisible: false,
      rules: {
        shop: [
          {required: true, message: '请选择目标店铺', trigger: 'blur'},
        ],
        carrier: [
          {required: true, message: '请选择发货物流', trigger: 'blur'},
        ],
        batch: [
          {required: true, message: '批次号必填', trigger: 'blur'},
        ]
      },
    }
  },
  filters: {
    //图片地址格式化
    smpic: function (value) {
      if (!value) return '';
      let url = value.slice(0, value.length-4)
      return url + '_100x100.jpg/?' + Math.random()
    },
  },
  mounted() {
    this.initShip();
    this.inintShops();
    this.initCarriers();
    this.inintFBMWarehouses();
    this.initRemoveItem()
  },
  computed: {
    // 总数量
    totalQuantity() {
      let qty = 0;
      this.ship.ship_shipDetail.forEach(item => {
        qty += item.qty;
      })
      return qty
    },
    // fbm计划总数量
    totalPlanQuantity() {
      let qty = 0;
      this.ship.ship_shipDetail.forEach(item => {
        qty += item.plan_qty;
      })
      return qty
    },
    // fbm计划总sku
    totalPlanSKU() {
      let qty = 0;
      this.ship.ship_shipDetail.forEach(item => {
        if (item.plan_qty > 0) qty += 1
      })
      return qty
    },
    // 运单数量超出比例
    percent() {
      let qty = 0;
      let plan_qty = 0;
      this.ship.ship_shipDetail.forEach(item => {
        qty += item.qty;
        plan_qty += item.plan_qty;
      })
      if (qty > plan_qty) {
        let p = (qty - plan_qty) / plan_qty * 100
        return p.toFixed(2)
      } else {
        return 0
      }
    },
  },
  methods:{
    //隐藏行
    tableRowClassName({row, rowIndex}) {
      if (!row.can_see) {
        return 'row-hide'
      }else {
        return ''
      }
    },

    //  保存运单
    submitForm() {
      this.$confirm('是否提交并保存运单？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$refs.shipForm.validate((valid) => {
          if (valid) {
            this.loading = true;
            this.ship['all_see'] = this.all_see
            this.postRequest('api/ml_ship/edit_ship/', this.ship).then(resp => {
              this.loading = false;
              if (resp.status === 'success') {
                this.$router.push({
                  path: '/melManage',
                  query: {
                    activeName: 'ship',
                    partName: this.click_from
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

    //改变计划数量编辑框可见状态
    changePlan(){
      this.show_plan = !this.show_plan
    },

    // 改变标新状态
    changeType(row){
      if (row.s_type === 'REFILL') {
        row.s_type = 'NEW'
      } else {
        row.s_type = 'REFILL'
      }
    },
    // 删除产品
    removeProduct(sku) {
      let index = this.ship.ship_shipDetail.findIndex(item => {
        return item.sku === sku
      });
      this.ship.ship_shipDetail.splice(index, 1)
    },

    // 添加产品弹窗确认
    confirmAddProduct() {
      this.$refs.addProduct.submitSelectProduct();
    },
    //获取子组件 添加产品的信息
    getAddProducts(data){
      if (data.length > 0) {
        let exist = false
        let not_match = false
        data.forEach(item=>{
          let existSKU = this.ship.ship_shipDetail.find(i => {
            return i.sku === item.sku;
          })
          // 产品不存在才添加，发中转仓下，产品存在也可以添加
          if (!existSKU || this.ship.target === 'TRANSIT'){
            // 如果产品需要在当前目标店铺 或 发中转仓 才能添加
            if (item.shop === this.ship.shop || this.ship.target === 'TRANSIT'){
              let p = {}
              p['qty'] = 1; // 添加数量1
              p['plan_qty'] = 1; // 计划数量1
              p['sku'] = item.sku;
              p['p_name'] = item.p_name;
              p['item_id'] = item.item_id;
              p['image'] = item.image;
              p['shop'] = item.shop;
              p['can_see'] = true;
              p['note'] = '';
              p['s_type'] = 'REFILL';

              this.ship.ship_shipDetail.push(p)
            } else {
              not_match = true
            }
          } else {
            exist = true
          }

        })
        if (exist) this.$message.error('产品重复添加！')
        if (not_match) this.$message.error('产品与目标店铺不匹配！')
      }
      this.addProductVisible = false;
    },
    // 添加产品
    addProduct(){
      this.addProductVisible = true
    },
    // 修改目标
    changeTarget(){
      this.ship.shop = ''
      this.inintShops()
    },
    // 取消并返回
    cancel() {
      this.$router.push({
        path: '/melManage',
        query: {
          activeName: 'ship',
          partName: this.click_from
        }
      });
    },
    // 初始化运单信息
    initShip() {
      this.loading = true;
      this.getRequest('api/ml_ship/' + this.shipID + '/').then(resp => {
        this.loading = false;
        if (resp) {
          this.ship = resp;
          if (resp.user_id === 0) this.all_see = true

          this.ship.ship_shipDetail.forEach(item=>{
            if (item.user_id === this.user.id || this.user.is_superuser) {
              item['can_see'] = true
            } else {
              item['can_see'] = false
            }

          })
        }
      })
    },

    // 初始化遗弃清单
    initRemoveItem(){
      this.getRequest('api/ml_ship_item_remove/?ship='+ this.shipID +'&page_size=1000&ordering=-item_type').then(resp => {
        if (resp.results) {
          this.removeItems = resp.results;
        }
      })
    },

    inintShops(){
      //获取所有可选店铺
      let url = 'api/ml_shops/?warehouse_type='+ this.ship.target + '&page_size=1000&ordering=create_time'
      if (!this.user.is_superuser && this.ship.target==='FBM') {
        url += '&user=' + this.user.id;
      }
      this.getRequest(url).then(resp => {
        if (resp.results) {
          this.shops = resp.results;
        }
      })
    },
    inintFBMWarehouses(){
      //获取所有可选fbm仓库
      this.getRequest('api/ml_fbm_warehouse/?page_size=1000&ordering=create_time').then(resp => {
        if (resp.results) {
          this.fbm_warehouses = resp.results;
        }
      })
    },
    initCarriers(){
      //获取所有物流商
      this.getRequest('api/ml_carriers/?page_size=1000&ordering=od_num').then(resp => {
        if (resp.results) {
          this.carriers = resp.results;
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
.total {
  display: flex;
  justify-content: flex-end;
  margin-right: 50px;
  margin-bottom: 20px;
}
.plan1{
  color: darkorange;
}
.plan2{
  color: red;
  font-weight: bold;
}
.plan3{
  color: darkseagreen;
}
.remove{
  color: #cac6c6;
}
.color_photo {
  width: 40px; height: 40px;
}
.gray_photo {
  width: 40px; height: 40px; filter: grayscale(100%)
}
::v-deep .el-table__body .row-hide{
  /*display: none;*/
  color: lightgrey;
}
</style>