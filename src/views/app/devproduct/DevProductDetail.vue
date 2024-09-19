<template>
  <div>
    <el-skeleton :loading="loading" :rows="16" animated>
      <el-tabs type="border-card" v-model="activeName">
        <el-tab-pane :lazy="true" label="基本资料" name="first">
          <el-form ref="productForm" :model="devProduct" :rules="rules"
                   label-position="right" label-width="100px" class="basicProduct">
            <el-row>

              <el-col :span="24">
                <el-col :span="8">
                  <el-form-item label="SKU" prop="sku">
                    <el-tag type="success" effect="plain">{{ this.devProduct.sku }}</el-tag>

                  </el-form-item>

                  <el-form-item label="产品状态" prop="status">
                    <el-select v-model="devProduct.p_status" disabled placeholder="请选择">
                      <el-option
                          v-for="item in statusOptions"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value">
                      </el-option>
                    </el-select>
                  </el-form-item>

                  <el-form-item label="在仓状态" prop="is_stock">
                    <el-tag v-if="devProduct.is_stock" type="success" effect="plain">有库存</el-tag>
                    <el-tag v-if="!devProduct.is_stock" type="warning" effect="plain">无库存</el-tag>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-image
                      style="width: 140px; height: 140px"
                      :src="devProduct.image"
                      :preview-src-list="[devProduct.image?devProduct.image+'?' + Math.random():'']"
                      fit="fill">
                  </el-image>
                </el-col>

              </el-col>

              <el-col :span="24">
                <el-form-item label="产品打分" prop="rate">
                  <el-rate style="margin-top: 6px" v-model="devProduct.rate"></el-rate>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item required label="产品目录" prop="rate">
                  <el-select v-model="devProduct.local_category">
                    <el-option
                        v-for="item in category_group"
                        :key="item.name"
                        :label="item.name"
                        :value="item.value">
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="中文名称" required prop="cn_name">
                  <el-input v-model="devProduct.cn_name"
                            maxlength="80"
                            show-word-limit></el-input>
                </el-form-item>
              </el-col>

              <el-col :span="24">
                <el-form-item label="英文名称" required prop="en_name">
                  <el-input v-model="devProduct.en_name"
                            maxlength="80"
                            show-word-limit></el-input>
                </el-form-item>
              </el-col>

              <el-col :span="24">
                <el-form-item label="搜索关键词" prop="keywords">
                  <el-input v-model="devProduct.keywords"
                            maxlength="80"
                            show-word-limit></el-input>
                </el-form-item>
              </el-col>

              <el-col :span="24">
                <el-form-item label="产品类目" prop="category">
                  <el-input v-model="devProduct.category"
                            maxlength="80"
                            show-word-limit></el-input>
                </el-form-item>
              </el-col>

              <el-col :span="24">
                <el-form-item label="产品包装清单" prop="package_included">
                  <el-input v-model="devProduct.package_included"
                            maxlength="80"
                            show-word-limit></el-input>
                </el-form-item>
              </el-col>

              <el-col :span="24" style="width: 100%">
                <el-form-item label="产品描述">
                  <el-input
                      type="textarea"
                      :rows="10"
                      placeholder="请输入内容"
                      v-model="devProduct.desc">
                  </el-input>
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="尺寸">
                  <el-row>
                    <el-col :span="8">
                      <el-form-item prop="length">
                        <el-input v-model="devProduct.p_length">
                          <template slot="prepend">长cm</template>
                        </el-input>
                      </el-form-item>
                    </el-col>

                    <el-col :span="8">
                      <el-form-item prop="width">
                        <el-input v-model="devProduct.p_width">
                          <template slot="prepend">宽cm</template>
                        </el-input>
                      </el-form-item>
                    </el-col>

                    <el-col :span="8" prop="heigth">
                      <el-form-item>
                        <el-input v-model="devProduct.p_height">
                          <template slot="prepend">高cm</template>
                        </el-input>
                      </el-form-item>
                    </el-col>
                  </el-row>
                </el-form-item>
              </el-col>

              <el-col :span="6">
                <el-form-item label="重量" prop="weight">
                  <el-input v-model="devProduct.p_weight">
                    <template slot="prepend">g</template>
                  </el-input>
                </el-form-item>
              </el-col>

              <el-col :span="6">
                <el-form-item label="数据已核对">
                  <el-switch
                      v-model="devProduct.is_confirm_data"
                      active-color="#13ce66">
                  </el-switch>
                </el-form-item>
              </el-col>

              <el-col :span="24">

                <el-col :span="4">
                  <el-form-item label="是否带电">
                    <el-switch v-model="devProduct.is_elec"></el-switch>
                  </el-form-item>
                </el-col>
                <el-col :span="4">
                  <el-form-item label="是否带磁">
                    <el-switch v-model="devProduct.is_magnet"></el-switch>
                  </el-form-item>
                </el-col>
                <el-col :span="4">
                  <el-form-item label="是否液体">
                    <el-switch v-model="devProduct.is_water"></el-switch>
                  </el-form-item>
                </el-col>
                <el-col :span="4">
                  <el-form-item label="是否粉末">
                    <el-switch v-model="devProduct.is_dust"></el-switch>
                  </el-form-item>
                </el-col>
              </el-col>

              <el-col :span="12">
                <el-form-item label="成本价" prop="unit_cost">
                  <el-input v-model="devProduct.unit_cost">
                    <template slot="prepend">rmb</template>
                  </el-input>
                </el-form-item>
              </el-col>

              <el-col :span="24">
                <el-form-item label="采购链接1">
                  <el-input maxlength="500" v-model="devProduct.buy_url1">
                    <template slot="prepend">Http://</template>
                  </el-input>
                </el-form-item>
              </el-col>

              <el-col :span="24" style="width: 100%">
                <el-form-item label="采购链接2">
                  <el-input maxlength="500" v-model="devProduct.buy_url2">
                    <template slot="prepend">Http://</template>
                  </el-input>
                </el-form-item>
              </el-col>

              <el-col :span="24" style="width: 100%">
                <el-form-item label="采购链接3">
                  <el-input maxlength="500" v-model="devProduct.buy_url3">
                    <template slot="prepend">Http://</template>
                  </el-input>
                </el-form-item>
              </el-col>

              <el-col :span="24" style="width: 100%">
                <el-form-item label="采购链接4">
                  <el-input maxlength="500" v-model="devProduct.buy_url4">
                    <template slot="prepend">Http://</template>
                  </el-input>
                </el-form-item>
              </el-col>

              <el-col :span="24" style="width: 100%">
                <el-form-item label="采购链接5">
                  <el-input maxlength="500" v-model="devProduct.buy_url5">
                    <template slot="prepend">Http://</template>
                  </el-input>
                </el-form-item>
              </el-col>

              <el-col :span="24" style="width: 100%">
                <el-form-item label="销售参考1">
                  <el-input maxlength="500" v-model="devProduct.refer_url1">
                    <template slot="prepend">Http://</template>
                  </el-input>
                </el-form-item>
              </el-col>

              <el-col :span="24" style="width: 100%">
                <el-form-item label="销售参考2">
                  <el-input maxlength="500" v-model="devProduct.refer_url2">
                    <template slot="prepend">Http://</template>
                  </el-input>
                </el-form-item>
              </el-col>

              <el-col :span="24" style="width: 100%">
                <el-form-item label="备注">
                  <el-input
                      type="textarea"
                      :rows="5"
                      placeholder="请输入内容"
                      v-model="devProduct.note">
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="24" style="width: 100%">
                <el-form-item label="开发人">
                  {{ devProduct.user_name}}
                </el-form-item>
              </el-col>


            </el-row>

          </el-form>
        </el-tab-pane>
        <el-tab-pane :lazy="true" label="关联产品" name="cp">
          <DevCp :productID="productID"></DevCp>
        </el-tab-pane>
        <el-tab-pane :lazy="true" label="产品定价" name="second">
          <DevPrice :productID="productID"></DevPrice>
        </el-tab-pane>
        <el-tab-pane :lazy="true" label="发布渠道" name="third"
                     v-if="permission.devproduct_online_check && devProduct.p_status !== 'DRAFT'">
          <DevListingChannel :productID="productID"></DevListingChannel>
        </el-tab-pane>
        <el-tab-pane :lazy="true"
                     v-if="devProduct.p_status !== 'DRAFT'"
                     label="上架账号" name="forth">
          <DevListingAccount :productID="productID"></DevListingAccount>
        </el-tab-pane>
        <el-tab-pane :lazy="true"
                     v-if="devProduct.p_status !== 'DRAFT'"
                     label="销售订单" name="order">
          <DevAccountOrder :productID="productID"></DevAccountOrder>
        </el-tab-pane>
        <el-tab-pane :lazy="true" label="操作日志" name="five">
          <DevProductLog :productID="productID"></DevProductLog>
        </el-tab-pane>

      </el-tabs>

    </el-skeleton>
  </div>
</template>

<script>
import DevPrice from "@/views/app/devproduct/DevPrice";
import DevListingChannel from "@/views/app/devproduct/DevListingChannel";
import DevListingAccount from "@/views/app/devproduct/DevListingAccount";
import DevProductLog from "@/views/app/devproduct/DevProductLog";
import DevCp from "@/views/app/devproduct/DevCp";
import DevAccountOrder from "@/views/app/devproduct/DevAccountOrder";
export default {
  name: "DevProductDetail",
  props: ['productID', 'tab'],
  components: {
    DevPrice, DevListingChannel, DevListingAccount, DevProductLog, DevCp, DevAccountOrder
  },
  data(){
    return{
      permission: JSON.parse(window.sessionStorage.getItem('ml_permission')),
      activeName: this.tab,
      devProduct:{
        id: null,
        sku: '',
        cn_name: '',
        en_name: '',
        image: null,
        p_status: null,
        buy_status: null,
        is_elec: false,
        is_magnet: false,
        is_water: false,
        is_dust: false,
        is_confirm_data: false,
        is_stock: false,
        keywords: null,
        package_included: null,
        p_length: null,
        p_width: null,
        p_height: null,
        p_weight: null,
        unit_cost: null,
        desc: null,
        note: null,
        category: null,
        qty: null,
        percent: null,
        rate: null,
        buy_url1: '',
        buy_url2: '',
        buy_url3: '',
        buy_url4: '',
        buy_url5: '',
        refer_url1: '',
        refer_url2: '',
        create_time: null,
        user_id: null,
        online_time: null,
        offline_time: null,
        tag_name: null,
        tag_color: null,
        local_category: null,
      },
      loading: false,
      statusOptions: [{
        value: 'DRAFT',
        label: '草稿'
      }, {
        value: 'OFFLINE',
        label: '已下线'
      }, {
        value: 'ONLINE',
        label: '已发布'
      }],
      category_group: [
        {
          name: '3C电子与配件',
          value: 1
        },
        {
          name: '汽配摩配',
          value: 2
        },
        {
          name: '家居、建材',
          value: 3
        },
        {
          name: '时尚、服饰、箱包',
          value: 4
        },
        {
          name: '运动',
          value: 5
        },
        {
          name: '健康美容',
          value: 6
        },
        {
          name: '儿童玩具',
          value: 7
        },
        {
          name: '工业专业产品',
          value: 8
        },
        {
          name: '其它',
          value: 0
        }
      ],
      rules: {
        cn_name: [
          {required: true, message: '请输入产品中文名称', trigger: 'blur'},
          {min: 3, max: 80, message: '产品名称长度有误', trigger: 'blur'}
        ],
        en_name: [
          {required: true, message: '请输入产品英文名称', trigger: 'blur'},
          {min: 3, max: 80, message: '产品名称长度有误', trigger: 'blur'}
        ],
        unit_cost: [
          {required: false, message: '成本价不能为空', trigger: 'blur'},
          {pattern: /^([1-9]\d{0,9}|0)(\.\d{1,2})?$/, message: '请输入正确金额', trigger: 'blur'}
          /*
            输入金额的要求：整数位最多十位，小数为最多为两位，可以无小数位
          */
        ],
        p_length: [
          {pattern: /^[0-9]+([.]{0,1}[0-9]+){0,1}$/, message: '请输入正确尺寸', trigger: 'blur'}
        ],
        p_width: [
          {pattern: /^[0-9]+([.]{0,1}[0-9]+){0,1}$/, message: '请输入正确尺寸', trigger: 'blur'}
        ],
        p_height: [
          {pattern: /^[0-9]+([.]{0,1}[0-9]+){0,1}$/, message: '请输入正确尺寸', trigger: 'blur'}
        ],
        p_weight: [
          {pattern: /^[0-9]+([.]{0,1}[0-9]+){0,1}$/, message: '请输入正确重量', trigger: 'blur'}
        ],
      },
    }
  },
  mounted() {
    this.initProduct()
  },
  methods:{
    updateProduct(){
      if (this.activeName === 'first') {
        this.doUpdateProduct()
      }
      else {
        // 调用父组件的关闭窗口方法
        this.$emit('closeProductDetail');
      }
    },
    //修改产品
    doUpdateProduct() {
      this.$refs.productForm.validate((valid) => {
        if (valid) {
          delete this.devProduct.create_time
          delete this.devProduct.offline_time
          delete this.devProduct.online_time
          delete this.devProduct.image
          delete this.devProduct.percent
          delete this.devProduct.dev_price
          delete this.devProduct.dev_listing_account
          delete this.devProduct.dev_listing_channel
          this.putRequest('api/dev_products/' + this.productID + '/', this.devProduct).then(resp => {
            if (resp) {
              // 调用父组件的关闭窗口方法
              this.$emit('closeProductDetail');
            }
          })

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
    initProduct(){
      this.loading = true;
      // 获取产品数据
      this.getRequest('api/dev_products/' + this.productID + '/').then(resp => {
        this.loading = false;
        if (resp) {
          this.devProduct = resp
        }
      })
    }
  }
}
</script>

<style scoped>

</style>