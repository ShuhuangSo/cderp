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

        <div>
          <h4 style="margin-left: 10px">包装箱</h4>
          <el-button @click="addBoxVisible=true" style="margin-left: 10px">新增包装箱</el-button>
          <el-table
              :header-cell-style="{background:'#eef1f6'}"
              :data="boxes"
              border
              size="mini"
              style="width: 98%; margin: 10px">

            <el-table-column
                prop="box_number"
                label="箱号"
                align="center"
                header-align="center"
                width="120">
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
                width="180">
              <template slot-scope="scope">
                <div>{{ scope.row.length | CM}} x {{ scope.row.width | CM}} x {{ scope.row.heigth | CM}}</div>
              </template>
            </el-table-column>

            <el-table-column
                prop="note"
                label="备注">
            </el-table-column>

            <el-table-column
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

    </div>
  </div>
</template>

<script>
import moment from "moment/moment";

export default {
  name: "MelShipDetail",
  data(){
    return{
      shipID: this.$route.query.id, // 运单id
      ship: null,
      loading: false,
      boxes: [], //包装箱
      addBoxVisible: false,
      box: {
        ship: this.$route.query.id,
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
      return `${value} kg`;
    },
    //尺寸格式化
    CM: function (value) {
      return `${value} cm`;
    },
  },
  mounted() {
    this.initShip();
    this.initBox();
  },
  methods:{
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
        this.deleteRequest('api/ml_ship_box/' + id + '/').then(resp => {
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
            this.putRequest('api/ml_ship_box/' + this.box.id + '/', this.box).then(resp => {
              if (resp) {
                this.addBoxVisible = false
                this.initBox();
              }
            })
          } else {
            this.postRequest('api/ml_ship_box/', this.box).then(resp => {
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