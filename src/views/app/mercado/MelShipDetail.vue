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
            <el-descriptions-item label="类型:">{{ this.ship.target | target }}</el-descriptions-item>
            <el-descriptions-item label="批次号:">{{ this.ship.batch }}</el-descriptions-item>
            <el-descriptions-item label="平台:">{{ this.ship.platform }}</el-descriptions-item>
            <el-descriptions-item label="目标店铺:">{{ this.ship.shop }}</el-descriptions-item>
            <el-descriptions-item label="FBM仓库:">{{ this.ship.fbm_warehouse }}</el-descriptions-item>
            <el-descriptions-item label="Envio号:">{{ this.ship.envio_number }}</el-descriptions-item>
            <el-descriptions-item label="承运商:">{{ this.ship.carrier }}</el-descriptions-item>
            <el-descriptions-item label="物流商单号:">{{ this.ship.s_number }}</el-descriptions-item>
            <el-descriptions-item label="发货方式:">{{ this.ship.ship_type }}</el-descriptions-item>
            <el-descriptions-item label=""></el-descriptions-item>
            <el-descriptions-item label="截单日期:">{{ this.ship.end_date }}</el-descriptions-item>
            <el-descriptions-item label="航班日期:">{{ this.ship.ship_date }}</el-descriptions-item>

            <el-descriptions-item label="内部备注:">
              <el-input
                  style="width: 400px;"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入备注"
                  @change="changeNote"
                  v-model="ship.note">
              </el-input>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div>
          <h4 style="margin-left: 10px">包装箱</h4>
          <el-button v-if="!action" @click="createBox" style="margin-left: 10px">新增包装箱</el-button>
          <el-table
              :header-cell-style="{background:'#eef1f6'}"
              :data="boxes"
              border
              :summary-method="getSummaries"
              show-summary
              size="mini"
              style="width: 98%; margin: 10px">

            <el-table-column
                label="箱号"
                align="center"
                header-align="center"
                width="120">
              <template slot-scope="scope">
                <div>{{ scope.row.box_number}}
                  <el-tag v-if="scope.row.size_weight > scope.row.weight && ship.ship_type==='空运'" size="mini" effect="dark" type="danger">抛</el-tag>
                </div>
              </template>
            </el-table-column>

            <el-table-column
                prop="carrier_box_number"
                label="物流商箱唛号"
                align="center"
                header-align="center"
                width="180">
            </el-table-column>

            <el-table-column
                label="重量"
                align="center"
                header-align="center"
                width="120">
              <template slot-scope="scope">
                <div>{{ scope.row.weight | KG }}</div>
              </template>
            </el-table-column>

            <el-table-column
                label="尺寸"
                align="center"
                header-align="center"
                width="200">
              <template slot-scope="scope">
                <div>{{ scope.row.length | CM}} x {{ scope.row.width | CM}} x {{ scope.row.heigth | CM}}</div>
              </template>
            </el-table-column>

            <el-table-column
                label="体积"
                align="center"
                header-align="center"
                width="120">
              <template slot-scope="scope">
                <div>{{ scope.row.cbm | cbm }}</div>
              </template>
            </el-table-column>

            <el-table-column
                v-if="ship.ship_type==='空运'"
                label="体积重"
                align="center"
                header-align="center"
                width="120">
              <template slot-scope="scope">
                <div>{{ scope.row.size_weight | KG }}</div>
              </template>
            </el-table-column>

            <el-table-column
                prop="note"
                label="备注">
            </el-table-column>

            <el-table-column
                v-if="user.is_superuser"
                label="操作"
                width="100"
                align="center"
                header-align="center"
            >
              <template slot-scope="scope">

                <el-button
                    title="编辑"
                    @click="changeBox(scope.row)"
                    type="" size="mini" icon="el-icon-edit" circle></el-button>

                <el-button
                    v-if="!action"
                    title="删除"
                    @click="removeBox(scope.row.id)"
                    type="" size="mini" icon="el-icon-delete" circle></el-button>

              </template>
            </el-table-column>
          </el-table>
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
              <div><span style="font-weight: bold">{{ scope.row.sku }} </span>
                <el-tag v-if="scope.row.s_type==='NEW'" type="success" size="mini" effect="dark">新</el-tag>
              </div>

              <div>{{ scope.row.p_name }}</div>
              <div class="packing">{{ scope.row.packing_name }} - {{ scope.row.packing_size }}</div>
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
              label="成本价"
              align="center"
              header-align="center"
              width="80">
            <template slot-scope="scope">
              <div>{{ scope.row.unit_cost | currency}}</div>
            </template>
          </el-table-column>

          <el-table-column
              v-if="!action"
              label="计划数量"
              align="center"
              header-align="center"
              width="80">
            <template slot-scope="scope">
              <div>{{ scope.row.plan_qty }}</div>
            </template>
          </el-table-column>

          <el-table-column
              v-if="action"
              label="发货数量"
              align="center"
              header-align="center"
              width="80">
            <template slot-scope="scope">
              <div>{{ scope.row.qty }}</div>
            </template>
          </el-table-column>

          <el-table-column
              v-if="!action"
              label="发货数量"
              align="center"
              header-align="center"
              width="160">
            <template slot-scope="scope">
              <el-input-number v-model="scope.row.qty" :min="0"></el-input-number>
            </template>
          </el-table-column>

          <el-table-column
              v-if="action"
              label="箱号"
              align="center"
              header-align="center"
              width="120">
            <template slot-scope="scope">
              <div>{{ scope.row.box_number }}</div>
            </template>
          </el-table-column>

          <el-table-column
              v-if="!action"
              label="箱号"
              align="center"
              header-align="center"
              width="120">
            <template slot-scope="scope">
              <el-select v-model="scope.row.box_number" placeholder="请选择">
                <el-option
                    v-for="item in boxes"
                    :key="item.id"
                    :label="item.box_number"
                    :value="item.box_number">
                </el-option>
              </el-select>
            </template>
          </el-table-column>

          <el-table-column
              v-if="action"
              label="简要备注">
            <template slot-scope="scope">
              {{scope.row.note}}
            </template>
          </el-table-column>

          <el-table-column
              v-if="!action"
              label="简要备注">
            <template slot-scope="scope">
              <el-input maxlength=20 v-model="scope.row.note"></el-input>
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
            style="width: 80%; margin: 10px">
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
              label="备注">
            <template slot-scope="scope">
              <el-input maxlength=20
                        v-if="!action"
                        @change="changeRemoveItemsNote(scope.row.id, scope.row.note)"
                        v-model="scope.row.note"></el-input>
              <div v-if="action">{{ scope.row.note }}</div>
            </template>
          </el-table-column>

          <el-table-column
              align="center"
              header-align="center"
              width="80"
              label="操作">
            <template slot-scope="scope">
              <el-button type="text" style="color: darkolivegreen"
                         @click="restoreRemove(scope.row.id)"
                         v-if="scope.row.item_type==='REMOVE' && !action">恢复</el-button>
            </template>
          </el-table-column>

        </el-table>

        <div class="total" v-if="ship.ship_shipDetail.length">
          <div style="float: left; width: 250px">
            <h3>SKU数：<span style="color: green">{{ ship.ship_shipDetail.length }}</span> 个</h3>
            <h3>总数量：<span style="color: green">{{ totalQuantity }}</span> 个</h3>
            <h3>总成本：<span style="color: green">{{ totalCost | currency }}</span> 元</h3>
          </div>
        </div>

        <div
            v-if="!action"
            STYLE="display: flex;justify-content: right;margin-right: 20px">
          <el-button type="primary"
                     style="width: 200px"
                     :loading="loading"
                     @click="saveShip">保 存
          </el-button>

          <el-button type="success"
                     style="width: 200px"
                     :loading="loading"
                     :disabled="submitStatus"
                     @click="sendShip">发 货
          </el-button>

        </div>

      </el-card>

      <!--    添加包装箱弹窗-->
      <el-dialog
          title="新增包装箱"
          :visible.sync="addBoxVisible"
          :destroy-on-close="true"
          :close-on-click-modal="false"
          width="550px"
      >
        <div>
          <el-form ref="boxForm" :model="box" :rules="rules"
                   label-position="right" label-width="100px" class="basicProduct">
            <el-row>

              <el-col :span="24">
                <el-form-item required label="箱号" prop="box_number">
                  <el-input v-model="box.box_number"
                            maxlength="30"></el-input>
                </el-form-item>
              </el-col>

              <el-col :span="24">
                <el-form-item required label="尺寸">
                  <el-row>
                    <el-col :span="8">
                      <el-form-item prop="length">
                        <el-input v-model="box.length">
                          <template slot="prepend">长cm</template>
                        </el-input>
                      </el-form-item>
                    </el-col>

                    <el-col :span="8">
                      <el-form-item prop="width">
                        <el-input v-model="box.width">
                          <template slot="prepend">宽cm</template>
                        </el-input>
                      </el-form-item>
                    </el-col>

                    <el-col :span="8" prop="heigth">
                      <el-form-item>
                        <el-input v-model="box.heigth">
                          <template slot="prepend">高cm</template>
                        </el-input>
                      </el-form-item>
                    </el-col>
                  </el-row>
                </el-form-item>
              </el-col>

              <el-col :span="24">
                <el-form-item label="重量" prop="weight">
                  <el-input v-model="box.weight">
                    <template slot="prepend">kg</template>
                  </el-input>
                </el-form-item>
              </el-col>

              <el-col :span="24">
                <el-form-item label="物流商箱唛" prop="carrier_box_number">
                  <el-input v-model="box.carrier_box_number"
                            maxlength="50"></el-input>
                </el-form-item>
              </el-col>

              <el-col :span="24" style="width: 100%">
                <el-form-item label="备注">
                  <el-input
                      type="textarea"
                      :rows="2"
                      placeholder="请输入内容"
                      v-model="box.note">
                  </el-input>
                </el-form-item>
              </el-col>

            </el-row>


          </el-form>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="addBoxVisible = false">取 消</el-button>
          <el-button size="small" type="primary" @click="summitBox">确 定</el-button>
        </span>
      </el-dialog>

      <div style="margin-top: 20px">
        <MelShipAttachment :shipID="shipID"></MelShipAttachment>
      </div>

      <div style="margin-top: 20px">
        <ShipLog :shipID="shipID"></ShipLog>
      </div>

    </div>

  </div>
</template>

<script>
import moment from "moment/moment";
import ShipLog from "@/components/app/mercado/ShipLog";
import MelShipAttachment from "@/components/app/mercado/MelShipAttachment";

export default {
  name: "MelShipDetail",
  components:{ShipLog, MelShipAttachment},
  data(){
    return{
      user: JSON.parse(window.sessionStorage.getItem('user')),
      shipID: this.$route.query.id, // 运单id
      action: this.$route.query.action,
      click_from: this.$route.query.click_from, // 从哪点击过来
      ship: null,
      loading: false,
      removeItems: [], //遗弃清单
      boxes: [], //包装箱
      addBoxVisible: false,
      box: {
        ship: this.$route.query.id,
        carrier_box_number: '',
        note: '',
        box_number: null,
        weight: null,
        length: null,
        width: null,
        heigth: null,
      }, //新包装箱
      rules: {
        box_number: [
          {required: true, message: '请输入箱号', trigger: 'blur'},
          {min: 1, max: 30, message: '箱号长度有误', trigger: 'blur'}
        ],
        length: [
          {required: true, message: '长度不能为空', trigger: 'blur'},
          {pattern: /^[0-9]+([.]{0,1}[0-9]+){0,1}$/, message: '请输入正确尺寸', trigger: 'blur'}
        ],
        width: [
          {required: true, message: '宽度不能为空', trigger: 'blur'},
          {pattern: /^[0-9]+([.]{0,1}[0-9]+){0,1}$/, message: '请输入正确尺寸', trigger: 'blur'}
        ],
        heigth: [
          {required: true, message: '高度不能为空', trigger: 'blur'},
          {pattern: /^[0-9]+([.]{0,1}[0-9]+){0,1}$/, message: '请输入正确尺寸', trigger: 'blur'}
        ],
        weight: [
          {pattern: /^[0-9]+([.]{0,1}[0-9]+){0,1}$/, message: '请输入正确重量', trigger: 'blur'}
        ],
      },
    }
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
    // 总成本
    totalCost() {
      let cost = 0;
      this.ship.ship_shipDetail.forEach(item => {
        cost += item.qty * item.unit_cost;
      })
      return cost
    },
    // 箱子总重
    totalWeight() {
      let w = 0;
      this.boxes.forEach(item => {
        w += item.weight;
      })
      return w
    },
    // 箱子总体积重
    totalSizeWeight() {
      let w = 0;
      this.boxes.forEach(item => {
        w += item.size_weight;
      })
      return w.toFixed(2)
    },
    // 箱子总体积
    totalCBM() {
      let c = 0;
      this.boxes.forEach(item => {
        c += item.cbm;
      })
      return c
    },
    // 提交按钮状态
    submitStatus() {
      let status = false;
      this.ship.ship_shipDetail.forEach(item => {
        if (!item.box_number) status = true
      })
      if (!this.boxes.length) status = true
      return status
    },
  },
  filters: {
    //时间日期格式化
    date: function (value) {
      return moment(value).format("YYYY-MM-DD");
    },
    //rmb金额格式化
    currency: function (value) {
      if (!value) return 0.00;
      return `¥${value.toFixed(2)}`;
    },
    //重量格式化
    KG: function (value) {
      if (!value) return ''
      return `${value.toFixed(2)} kg`;
    },
    //尺寸格式化
    CM: function (value) {
      return `${value} cm`;
    },
    //体积格式化
    cbm: function (value) {
      if (!value) return 0;
      return `${value.toFixed(4)} cbm`;
    },
    //target格式化
    target: function (value) {
      if (value==='FBM') return 'FBM入仓'
      if (value==='TRANSIT') return '中转仓'
    },
    //图片地址格式化
    smpic: function (value) {
      if (!value) return '';
      let url = value.slice(0, value.length-4)
      return url + '_100x100.jpg/?' + Math.random()
    },
  },
  mounted() {
    this.initShip();
    this.initBox();
    this.initRemoveItem()
  },
  methods:{
    getSummaries(param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '汇总';
          return;
        }
        if (index === 2) {
          sums[index] = this.totalWeight + ' kg';
          return;
        }
        if (index === 4) {
          sums[index] = this.totalCBM.toFixed(4) + ' cbm';
          return;
        }
        if (index === 5) {
          sums[index] = this.totalSizeWeight + ' kg';
          return;
        }
      });

      return sums;
    },

    //保存改变的备注信息
    changeNote(string) {
      this.ship.note = string;
      this.patchRequest('api/ml_ship/' + this.shipID + '/', {'note': this.ship.note}).then(resp => {
        if (resp) {
          this.$message.success('修改成功！')
        }
      })
    },

    //保存改变的变动清单备注
    changeRemoveItemsNote(id, string) {
      this.patchRequest('api/ml_ship_item_remove/' + id + '/', {'note': string}).then(resp => {
        if (resp) {
          this.$message.success('修改成功！')
        }
      })
    },

    //新增包装箱
    createBox(){
      this.addBoxVisible = true
      this.box.ship = this.shipID
      this.box.carrier_box_number = ''
      this.box.box_number = null
      this.box.weight = null
      this.box.length = null
      this.box.width = null
      this.box.heigth = null
      this.box.note = null
      this.box.id = null

    },
    //恢复删除项
    restoreRemove(id){
      this.$confirm('是否恢复该产品?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.postRequest('api/ml_ship_item_remove/restore_remove/', {'id': id}).then(resp => {
          this.initShip()
          this.initRemoveItem()
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消恢复'
          });
        });
      })
    },
    //保存运单
    saveShip(){
      this.ship['action'] = 'PREPARING'
      this.loading = true;
      this.postRequest('api/ml_ship/send_ship/', this.ship).then(resp => {
        this.loading = false;
        if (resp) {
          this.initShip()
          this.initRemoveItem()
        }
      })
    },
    //发货
    sendShip(){
      this.$confirm('是否确认发货?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.ship['action'] = 'SHIPPED'
        this.loading = true;
        this.postRequest('api/ml_ship/send_ship/', this.ship).then(resp => {
          this.loading = false;
          if (resp.status === 'success') {
            this.$router.push({
              path: '/melManage',
              query: {
                activeName: 'ship'
              }
            });
          }
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
      })
    },

    // 修改箱子
    changeBox(row){
      this.addBoxVisible = true;
      this.box= Object.assign({},row);
    },
    // 删除箱子
    removeBox(id){
      this.$confirm('是否删除包装箱?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        //调用删除箱子
        this.postRequest('api/ml_ship_box/delete_shipbox/', {'id': id, 'ship_id': this.shipID}).then(resp => {
          this.initBox();
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
      })
    },
    // 提交箱子
    summitBox() {
      this.$refs.boxForm.validate((valid) => {
        if (valid) {
          if (this.box.id) {
            this.putRequest('api/ml_ship_box/update_shipbox/', this.box).then(resp => {
              if (resp) {
                this.addBoxVisible = false
                this.initBox();
              }
            })
          } else {
            this.postRequest('api/ml_ship_box/add_shipbox/', this.box).then(resp => {
              if (resp) {
                this.addBoxVisible = false
                this.initBox();
              }
            })
          }


        } else {
          this.$message({
            showClose: true,
            message: '保存失败，请检查错误项',
            type: 'error'
          });
          return false;
        }
      });

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
        if (resp) {
          this.loading = false;
          this.ship = resp;
          this.ship.ship_shipDetail.forEach(item=>{
            item['plan_qty'] = item.qty
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

.total {
  display: flex;
  justify-content: flex-end;
  margin-right: 50px;
  margin-bottom: 20px;
}
.packing{
  color: #99a9bf;
}
.remove{
  color: #cac6c6;
}
</style>