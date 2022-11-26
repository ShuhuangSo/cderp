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
              <el-radio-group v-model="ship.target" @input="changeTarget">
                <el-radio label="FBM">FBM入仓</el-radio>
                <el-radio label="TRANSIT">中转仓</el-radio>
              </el-radio-group>

            </el-form-item>

            <el-form-item label="目标店铺" required prop="shop">
              <el-select v-model="ship.shop"
                         style="width: 300px;"
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

            <el-form-item label="承运商" prop="carrier">
              <el-select v-model="ship.carrier"
                         style="width: 300px;"
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
                        style="width: 300px;"
                        maxlength="50"></el-input>
            </el-form-item>

            <el-form-item label="Envio号" prop="envio_number">
              <el-input v-model="ship.envio_number"
                        style="width: 300px;"
                        maxlength="50"></el-input>
            </el-form-item>

            <el-form-item label="发货方式" prop="ship_type">
              <el-radio-group v-model="ship.ship_type">
                <el-radio label="空运">空运</el-radio>
                <el-radio label="海运">海运</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="截单日期" prop="end_date">
              <el-date-picker
                  v-model="ship.end_date"
                  value-format="yyyy-MM-dd"
                  type="date"
                  placeholder="选择日期">
              </el-date-picker>
            </el-form-item>

            <el-form-item label="航班日期" prop="end_date">
              <el-date-picker
                  v-model="ship.ship_date"
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

        <el-button type="primary" icon="el-icon-plus"
                   style="margin-left: 10px"
                   :disabled="!ship.shop"
                   @click="addProduct">添加产品
        </el-button>
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
              <div>{{ scope.row.sku }}</div>

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

        <div class="total" v-if="ship.ship_shipDetail.length">
          <div style="float: left; width: 250px">
            <h3>总数量：<span style="color: green">{{ totalQuantity }}</span> 个</h3>
          </div>
        </div>

        <div STYLE="display: flex;justify-content: right;margin-right: 20px">
          <el-button type="success"
                     :disabled="!ship.ship_shipDetail.length"
                     @click="submitForm('WAIT_CONFIRM')">保存运单
          </el-button>

        </div>

      </el-card>
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

export default {
  name: "MelEditShip",
  components:{
    MelAddProduct
  },
  data(){
    return{
      shipID: this.$route.query.id, // 运单id
      loading: false,
      ship: {
        target: 'FBM',
        shop: '',
        ship_type: '空运',
        carrier: '',
        end_date: '',
        ship_date: '',
        note: '',
        ship_shipDetail: [],
      },
      shops: [], //可选店铺
      carriers: [], //可选物流商
      addProductVisible: false,
      rules: {
        shop: [
          {required: true, message: '请选择目标店铺', trigger: 'blur'},
        ],
        carrier: [
          {required: true, message: '请选择发货物流', trigger: 'blur'},
        ]
      },
    }
  },
  mounted() {
    this.initShip();
    this.inintShops();
    this.initCarriers();
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
  },
  methods:{

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
            this.postRequest('api/ml_ship/edit_ship/', this.ship).then(resp => {
              if (resp) {
                this.loading = false;
                this.$router.push({
                  path: '/melManage',
                  query: {
                    activeName: 'second'
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
          // 产品不存在才添加
          if (!existSKU){
            // 如果产品需要在当前目标店铺 或 发中转仓 才能添加
            if (item.shop === this.ship.shop || this.ship.target === 'TRANSIT'){
              let p = {}
              p['qty'] = 1; // 添加数量1
              p['sku'] = item.sku;
              p['p_name'] = item.p_name;
              p['item_id'] = item.item_id;
              p['image'] = item.image;
              p['shop'] = item.shop;
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
          activeName: 'second'
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
          console.log(this.ship)
        }
      })
    },
    inintShops(){
      //获取所有可选店铺
      this.getRequest('api/ml_shops/?warehouse_type='+ this.ship.target + '&page_size=1000&ordering=create_time').then(resp => {
        if (resp.results) {
          this.shops = resp.results;
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
</style>