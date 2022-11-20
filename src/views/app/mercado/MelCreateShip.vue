/*
美客多FBM--创建运单
*/
<template>
  <div style="display: flex; justify-content: center">
    <div class="pContainer">
      <el-card shadow="hover" style="padding-bottom: 20px">
        <div slot="header" class="clearfix">
          <el-page-header @back="cancel" content="创建运单">
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
                    :key="ship.target"
                    :label="item.name"
                    :value="item.name">
                  <span style="float: left">{{ item.name }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">{{ item.nickname }}</span>
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="承运商" prop="shop">
              <el-select v-model="ship.carrier"
                         style="width: 300px;"
                         placeholder="请选择发货物流">
                <el-option
                    v-for="item in carriers"
                    :label="item.name"
                    :value="item.name">
                </el-option>
              </el-select>
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
                  type="date"
                  placeholder="选择日期">
              </el-date-picker>
            </el-form-item>

            <el-form-item label="航班日期" prop="end_date">
              <el-date-picker
                  v-model="ship.ship_date"
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
            :data="ship.ship_detail"
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
                  v-if="scope.row.urgent"
                  title="取消加急"
                  @click="changeUrgent(scope.row)"
                  type="danger" size="mini" circle>急</el-button>
              <el-button
                  v-if="!scope.row.urgent"
                  title="加急"
                  @click="changeUrgent(scope.row)"
                  type="" size="mini" circle>急</el-button>
              <el-button
                  @click="removeProduct(scope.row.sku)"
                  type="" size="mini" icon="el-icon-delete" circle></el-button>

            </template>
          </el-table-column>
        </el-table>

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
  name: "MelCreateShip",
  components:{
    MelAddProduct
  },
  data(){
    return{
      ship: {
        target: 'FBM',
        shop: '',
        ship_type: '空运',
        carrier: '',
        end_date: '',
        ship_date: '',
        note: '',
        ship_detail: [],
      },
      shops: null, //可选店铺
      carriers: null, //可选物流商
      addProductVisible: false,
    }
  },
  mounted() {
    this.inintShops();
    this.initCarriers();
  },
  methods:{
    // 添加产品弹窗确认
    confirmAddProduct() {
      this.$refs.addProduct.submitSelectProduct();
    },
    //获取子组件 添加产品的信息
    getAddProducts(data){
      if (data.length > 0) {
        data.forEach(item=>{
          let existSKU = this.ship.ship_detail.find(i => {
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
              p['image'] = item.image;
              p['shop'] = item.shop;

              this.ship.ship_detail.push(p)
            }
          }

        })
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
</style>