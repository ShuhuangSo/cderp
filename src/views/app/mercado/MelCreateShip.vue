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

            <el-form-item label="全员可见" v-if="this.user.is_superuser && this.ship.target==='TRANSIT'">
              <el-switch v-model="ship.all_see"></el-switch>
            </el-form-item>

            <el-form-item label="平台" required prop="platform">
              <el-select v-model="ship.platform"
                         @change="changeTarget"
                         style="width: 300px;"
                         placeholder="请选择平台">
                <el-option
                    v-for="item in platforms"
                    :key="ship.code"
                    :label="item.name"
                    :value="item.code">
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="目标店铺" required prop="shop">
              <el-select v-model="ship.shop"
                         @change="changeShop"
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
                  @click="removeProduct(scope.row.sku)"
                  type="" size="mini" icon="el-icon-delete" circle></el-button>

            </template>
          </el-table-column>
        </el-table>

        <div class="total" v-if="ship.ship_detail.length">
          <div style="float: left; width: 250px">
            <h3>总数量：<span style="color: green">{{ totalQuantity }}</span> 个</h3>
          </div>
        </div>

        <div STYLE="display: flex;justify-content: right;margin-right: 20px">
          <el-button type="success"
                     :loading="loading"
                     :disabled="!ship.ship_detail.length"
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
      <MelAddProduct ref="addProduct"
                     :shopName="shopName"
                     @func="getAddProducts"></MelAddProduct>
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
      user: JSON.parse(window.sessionStorage.getItem('user')),
      obj: this.$route.query.obj?JSON.parse(this.$route.query.obj):'', // 补货推荐传递数据
      loading: false,
      shopName: '', //店铺名称
      ship: {
        platform: 'MERCADO',
        target: 'FBM',
        shop: '',
        ship_type: '空运',
        carrier: '',
        end_date: '',
        ship_date: '',
        note: '',
        all_see: false,
        ship_detail: [],
      },
      shops: [], //可选店铺
      carriers: [], //可选物流商
      platforms: [
        {
          code: 'MERCADO',
          name: '美客多'
        },
        {
          code: 'NOON',
          name: 'Noon'
        },
        {
          code: 'OZON',
          name: 'OZON'
        },
        {
          code: 'EMAG',
          name: 'EMAG'
        }
      ], //平台
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
  filters: {
    //图片地址格式化
    smpic: function (value) {
      if (!value) return '';
      let url = value.slice(0, value.length-4)
      return url + '_100x100.jpg/?' + Math.random()
    },
  },
  mounted() {
    this.inintShops();
    this.initCarriers();
    if (this.obj) this.ship = this.obj
  },
  computed: {
    // 总数量
    totalQuantity() {
      let qty = 0;
      this.ship.ship_detail.forEach(item => {
        qty += item.qty;
      })
      return qty
    },
  },
  methods:{
    //目标店铺变动
    changeShop(){
      if (this.ship.target === 'FBM') {
        this.shopName = this.ship.shop
      }else {
        this.shopName = ''
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
            this.postRequest('api/ml_ship/create_ship/', this.ship).then(resp => {
              this.loading = false;
              if (resp.status === 'success') {
                this.$router.push({
                  path: '/melManage',
                  query: {
                    activeName: 'ship'
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
      let index = this.ship.ship_detail.findIndex(item => {
        return item.sku === sku
      });
      this.ship.ship_detail.splice(index, 1)
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
          let existSKU = this.ship.ship_detail.find(i => {
            return i.sku === item.sku;
          })
          // 产品不存在才添加，发中转仓下，产品存在也可以添加
          if (!existSKU || this.ship.target === 'TRANSIT'){
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

              this.ship.ship_detail.push(p)
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
          activeName: 'ship'
        }
      });
    },
    inintShops(){
      //获取所有可选店铺
      let url = 'api/ml_shops/?warehouse_type='+ this.ship.target + '&page_size=1000&ordering=create_time'
      if (!this.user.is_superuser && this.ship.target==='FBM') {
        url += '&user=' + this.user.id;
      }
      url += '&platform=' + this.ship.platform;
      this.getRequest(url).then(resp => {
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