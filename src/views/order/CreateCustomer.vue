<template>
  <div style="display: flex; justify-content: center">
    <div class="pContainer">
      <el-card shadow="hover" style="padding-bottom: 20px">
        <div slot="header" class="clearfix">
          <el-page-header @back="cancel" :content="customerID ? '客户详情':'新增客户'">
          </el-page-header>
        </div>

        <div>
          <div class="title">
            <h4>基本信息</h4>
          </div>
          <el-form ref="customerForm" :rules="rules" :model="customer" label-width="180px">
            <el-form-item prop="company_name" label="公司名称" required>
              <el-input
                  class="inputwidth"
                  placeholder="请输入公司名称"
                  v-model="customer.company_name">
              </el-input>
            </el-form-item>

            <el-form-item label="客户编号" v-if="customerID">
              <el-tag>{{ customer.customer_code }}</el-tag>
            </el-form-item>


            <el-form-item required label="结算类型" prop="pay_way">
              <el-select v-model="customer.pay_way" placeholder="请选择" class="inputwidth">
                <el-option
                    v-for="item in payWayOptions"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item prop="contact_name" label="联系人" required>
              <el-input
                  class="inputwidth"
                  placeholder="请输入联系人名称"
                  v-model="customer.contact_name">
              </el-input>
            </el-form-item>

            <el-form-item label="联系电话">
              <el-input
                  class="inputwidth"
                  placeholder="请输入联系人名称"
                  v-model="customer.phone">
              </el-input>
            </el-form-item>

            <el-form-item label="微信">
              <el-input
                  class="inputwidth"
                  placeholder="请输入微信号"
                  v-model="customer.wechat">
              </el-input>
            </el-form-item>

            <el-form-item label="QQ">
              <el-input
                  class="inputwidth"
                  placeholder="请输入QQ号"
                  v-model="customer.qq">
              </el-input>
            </el-form-item>

            <el-form-item label="邮箱">
              <el-input
                  class="inputwidth"
                  placeholder="请输入邮箱地址"
                  v-model="customer.email">
              </el-input>
            </el-form-item>

            <el-form-item label="地址">
              <el-input
                  class="inputwidth"
                  placeholder="请输入联系地址"
                  v-model="customer.address">
              </el-input>
            </el-form-item>

            <el-form-item label="客户评级">
              <el-rate style="margin-top: 6px" v-model="customer.level"></el-rate>
            </el-form-item>

            <el-form-item label="备注">
              <el-input
                  class="inputwidth"
                  type="textarea"
                  :rows="2"
                  placeholder="请输入备注"
                  v-model="customer.note">
              </el-input>
            </el-form-item>


          </el-form>
        </div>


        <div>
          <el-button
              v-if="!customerID"
              style="width: 200px;margin-left: 100px"
              type="primary"
              @click="submitForm">创建客户
          </el-button>
          <el-button
              v-if="customerID"
              style="width: 200px;margin-left: 100px"
              type="primary"
              @click="editForm">保存
          </el-button>
        </div>

      </el-card>


      <el-card
          v-if="customerID"
          shadow="hover" style="padding-bottom: 20px; margin-top: 20px">
        <div slot="header" class="clearfix">
          <span style="font-weight: bold">折扣信息</span>
          <el-button style="float: right; " type="success" @click="addDiscount">添加折扣</el-button>
        </div>
        <div>
          <el-table
              :header-cell-style="{background:'#eef1f6'}"
              :data="customer.customer_discount"
              border
              size="mini"
              style="width: 98%; margin: 10px">
            <el-table-column
                prop="series_name"
                label="产品系列">
            </el-table-column>
            <el-table-column
                prop="discount_type"
                label="折扣类型">
              <template slot-scope="scope">
                <el-tag :type="scope.row.discount_type===1? 'success':'warning'">
                  {{ scope.row.discount_type | discountType }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
                :formatter="moneyFormat"
                align="center"
                header-align="center"
                prop="discount_money"
                label="优惠额度"
                width="180">
            </el-table-column>
            <el-table-column
                :formatter="percentFormat"
                prop="discount_percent"
                align="center"
                header-align="center"
                label="优惠比例"
                width="180">
            </el-table-column>
            <el-table-column
                label="操作"
                width="100"
                align="center"
                header-align="center"
            >
              <template slot-scope="scope">
                <el-button
                    @click="addDiscount(scope.row)"
                    type="text"
                    size="small">
                  修改
                </el-button>
                <el-divider direction="vertical"></el-divider>
                <el-popconfirm @confirm="deleteDiscount(scope.row.id)" title="确定要删除该折扣吗？" >
                  <el-button
                      slot="reference"
                      type="text"
                      size="small">
                    删除
                  </el-button>
                </el-popconfirm>

              </template>
            </el-table-column>

          </el-table>
        </div>

        <el-dialog
            :title="customerDiscount.id? '修改折扣':'添加折扣'"
            :visible.sync="discountVisible"
            width="30%">
          <div>
            <el-form ref="discountForm"
                     :rules="discountRules"
                     label-position="top"
                     :model="customerDiscount">
              <el-form-item label="产品系列" prop="p_series" v-if="!customerDiscount.id">
                <el-select v-model="customerDiscount.p_series" placeholder="请选择" style="width: 100%">
                  <el-option
                      v-for="item in productSeries"
                      :disabled="item.disabled"
                      :key="item.id"
                      :label="item.name"
                      :value="item.id">
                  </el-option>
                </el-select>
              </el-form-item>

              <el-form-item label="折扣类型" prop="discount_type">
                <el-select
                    @change="discountTypeChange"
                    v-model="customerDiscount.discount_type" placeholder="请选择" style="width: 100%">
                  <el-option
                      v-for="item in discountTypeOptions"
                      :key="item.value"
                      :label="item.name"
                      :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>

              <el-form-item
                  v-if="customerDiscount.discount_type===1"
                  required label="优惠额度" prop="discount_money">
                <el-input-number v-model="customerDiscount.discount_money" :precision="2" :min="0" :step="1"></el-input-number>
              </el-form-item>

              <el-form-item
                  v-if="customerDiscount.discount_type===0"
                  required label="优惠比例 %" prop="discount_percent">
                <el-slider
                    v-model="customerDiscount.discount_percent"
                    show-input>
                </el-slider>
              </el-form-item>

            </el-form>

          </div>
          <span slot="footer" class="dialog-footer">
    <el-button @click="discountVisible = false">取 消</el-button>
    <el-button  v-if="!customerDiscount.id" type="primary" @click="createDiscount">确 定</el-button>
      <el-button  v-if="customerDiscount.id" type="primary" @click="editDiscount">保 存</el-button>
  </span>
        </el-dialog>

      </el-card>

      <div style="margin-top: 20px" v-if="customerID">
        <CustomerLog :customerID="this.customerID"></CustomerLog>
      </div>
    </div>


  </div>
</template>

<script>
import CustomerLog from "@/components/customer/CustomerLog";

export default {
  name: "CreateCustomer",
  data() {
    return {
      customerID: this.$route.query.id,
      discountVisible: false,
      loading: false,
      productSeries: [],
      customerDiscount: {
        p_series: '',
        discount_type: 1,
        discount_money: 0,
        discount_percent: 0
      },
      customer: {
        company_name: '',
        pay_way: 'PAY_NOW',
        address: '',
        contact_name: '',
        phone: '',
        qq: '',
        wechat: '',
        email: '',
        level: 1,
        note: '',
        is_active: true,
        customer_discount: [],
        customer_tag: []
      },
      payWayOptions: [
        {name: '现结', value: 'PAY_NOW'},
        {name: '约定付款', value: 'CONTRACT'}
      ],
      discountTypeOptions: [
        {name: '金额数', value: 1},
        {name: '百分比', value: 0}
      ],
      discountRules: {
        p_series: [
          {required: true, message: '请选择产品系列', trigger: 'blur'},
        ],
      },
      rules: {
        company_name: [
          {required: true, message: '请输入公司名称', trigger: 'blur'},
        ],
        pay_way: [
          {required: true, message: '请选择结算方式', trigger: 'blur'},
        ],
        contact_name: [
          {required: true, message: '请输入联系人', trigger: 'blur'},
        ],
      }
    }
  },
  filters: {
    //折扣类型信息格式化
    discountType: function (value) {
      if (value === 0) {
        return '百分比'
      }
      if (value === 1) {
        return '金额数'
      }
      return '';
    },

  },
  components: {
    CustomerLog
  },
  mounted() {
    if (this.customerID) {
      this.initCustomer()
    }
  },
  methods: {

    // 优惠金额信息格式化
    moneyFormat: function (row, column) {

      let value = row[column.property];

      if (value == undefined) {
        return '--'
      }
      if (!value) {
        return '--'
      }
      return `¥ ${value.toFixed(2)}`;
    },

    // 优惠比例信息格式化
    percentFormat: function (row, column) {

      let value = row[column.property];

      if (value == undefined) {
        return '--'
      }
      if (!value) {
        return '--'
      }
      return value +"%";
    },

    //删除折扣
    deleteDiscount(id){
      let url = 'api/customer_discount/' + id + '/'
      this.deleteRequest(url).then(resp => {
        this.initCustomer();
      })
    },

    //折扣类型变化回调
    discountTypeChange(){
      this.customerDiscount.discount_money = 0;
      this.customerDiscount.discount_percent = 0;
    },

    // 打开添加/编辑产品折扣对话框
    addDiscount(row) {
      if(row) {
        Object.assign(this.customerDiscount, row)
      }else {
        this.customerDiscount.p_series = '';
        this.customerDiscount.discount_type = 1;
        this.customerDiscount.discount_money = 0;
        this.customerDiscount.discount_percent = 0;
      }
      this.initProductSeries();
      this.discountVisible = true;
    },

    // 修改产品折扣
    editDiscount(){
      this.putRequest('api/customer_discount/' + this.customerDiscount.id + '/', this.customerDiscount).then(resp => {
        if (resp) {
          this.initCustomer();
          this.discountVisible = false;
          this.$message({
            type: 'success',
            message: '成功修改'
          });
        }
      })
    },

    // 添加产品折扣
    createDiscount(){
      this.$refs.discountForm.validate((valid) => {
        if (valid) {
          this.customerDiscount['customer'] = this.customerID;
          this.postRequest('api/customer_discount/', this.customerDiscount).then(resp => {
            if (resp) {
              this.initCustomer();
              this.discountVisible = false;
            }
          })
        } else {
          return false;
        }
      });

    },

    //初始化客户
    initCustomer() {
      let url = 'api/customers/' + this.customerID + '/'
      this.getRequest(url).then(resp => {
        if (resp) {
          this.customer = resp;
        }
      })
    },

    //初始化产品系列
    initProductSeries() {
      let url = 'api/product_extra_info/?type=SERIES'
      this.getRequest(url).then(resp => {
        if (resp.results) {
          this.productSeries = resp.results;
          //将已存在的产品系列设为不可用
          this.productSeries.forEach(item=>{
            item['disabled'] = false;
            this.customer.customer_discount.forEach(i=>{
              if(item.id===i.p_series) item.disabled = true;
            })
          })

        }
      })
    },

    //修改客户
    editForm() {
      this.$confirm('是否修改客户信息？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$refs.customerForm.validate((valid) => {
          if (valid) {
            this.loading = true;
            let url = 'api/customers/' + this.customerID + '/'
            this.putRequest(url, this.customer).then(resp => {
              if (resp) {
                this.$router.push('/orderCustomerList');
              }
              this.loading = false;
            })
            this.$message({
              type: 'success',
              message: '成功修改'
            });
          } else {
            return false;
          }
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        });
      });

    },

    //创建客户
    submitForm() {
      this.$confirm('是否创建客户？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$refs.customerForm.validate((valid) => {
          if (valid) {
            this.loading = true;
            this.postRequest('api/customers/', this.customer).then(resp => {
              if (resp) {
                this.$router.push('/orderCustomerList');
              }
              this.loading = false;
            })
            this.$message({
              type: 'success',
              message: '成功创建'
            });
          } else {
            return false;
          }
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        });
      });

    },

    //返回
    cancel() {
      this.$router.push('/orderCustomerList')
    }


  }
}
</script>

<style scoped>
.pContainer {
  margin-top: 10px;
  width: 1200px;
}

.inputwidth {
  width: 400px;
}

.title {
  margin-left: 100px;
}
</style>