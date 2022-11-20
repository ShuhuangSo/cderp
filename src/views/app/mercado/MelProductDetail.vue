<template>
  <div class="productDetail">
    <el-skeleton :loading="loading" :rows="16" animated>

        <div>
          <el-form ref="productForm" :model="mlProduct" :rules="rules"
                   label-position="right" label-width="100px" class="basicProduct">
            <el-row>

              <el-col :span="12">
                <el-form-item label="SKU" prop="sku">
                  <el-tag type="success" effect="plain">{{ this.mlProduct.sku }}</el-tag>

                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="状态" prop="status">
                  <el-select v-model="mlProduct.p_status" placeholder="请选择">
                    <el-option
                        v-for="item in statusOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="产品名称" required prop="p_name">
                  <el-input v-model="mlProduct.p_name"
                            maxlength="50"
                            show-word-limit></el-input>
                </el-form-item>
              </el-col>



              <el-col :span="12">
                <el-form-item label="UPC" required prop="upc">
                  <el-input v-model="mlProduct.upc"
                            maxlength="30">
                  </el-input>
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="ItemID" prop="item_id">
                  <el-input v-model="mlProduct.item_id"
                            maxlength="30"
                            prop="item_id">
                  </el-input>
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="FBM条码">
                  <el-input v-model="mlProduct.label_code"
                            maxlength="30"
                            prop="label_code">
                  </el-input>
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="成本价" prop="unit_cost">
                  <el-input v-model="mlProduct.unit_cost"></el-input>
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="预估头程运费" prop="first_ship_cost">
                  <el-input v-model="mlProduct.first_ship_cost"></el-input>
                </el-form-item>
              </el-col>


              <el-col :span="12">
                <el-form-item label="海关编码">
                  <el-input v-model="mlProduct.custom_code"
                            maxlength="30"
                            prop="custom_code">
                  </el-input>
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="中文品名">
                  <el-input v-model="mlProduct.cn_name"
                            maxlength="30"
                            prop="cn_name">
                  </el-input>
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="英文品名">
                  <el-input v-model="mlProduct.en_name"
                            maxlength="30"
                            prop="en_name">
                  </el-input>
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="申报价值USD" prop="declared_value">
                  <el-input v-model="mlProduct.declared_value"
                            maxlength="30">
                  </el-input>
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="中文材质">
                  <el-input v-model="mlProduct.cn_material"
                            maxlength="30">
                  </el-input>
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="英文材质">
                  <el-input v-model="mlProduct.en_material"
                            maxlength="30">
                  </el-input>
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="用途(Enlish)">
                  <el-input v-model="mlProduct.use"
                            maxlength="40">
                  </el-input>
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="品牌" prop="brand">
                  <el-input v-model="mlProduct.brand"
                            maxlength="50"></el-input>
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="尺寸">
                  <el-row>
                    <el-col :span="8">
                      <el-form-item prop="length">
                        <el-input v-model="mlProduct.length">
                          <template slot="prepend">长cm</template>
                        </el-input>
                      </el-form-item>
                    </el-col>

                    <el-col :span="8">
                      <el-form-item prop="width">
                        <el-input v-model="mlProduct.width">
                          <template slot="prepend">宽cm</template>
                        </el-input>
                      </el-form-item>
                    </el-col>

                    <el-col :span="8" prop="heigth">
                      <el-form-item>
                        <el-input v-model="mlProduct.heigth">
                          <template slot="prepend">高cm</template>
                        </el-input>
                      </el-form-item>
                    </el-col>
                  </el-row>
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="重量" prop="weight">
                  <el-input v-model="mlProduct.weight">
                    <template slot="prepend">kg</template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="24" style="width: 100%">
                <el-form-item label="采购链接">
                  <el-input v-model="mlProduct.buy_url">
                    <template slot="prepend">Http://</template>
                  </el-input>
                </el-form-item>
              </el-col>

              <el-col :span="24" style="width: 100%">
                <el-form-item label="销售链接">
                  <el-input v-model="mlProduct.sale_url">
                    <template slot="prepend">Http://</template>
                  </el-input>
                </el-form-item>
              </el-col>

              <el-col :span="24" style="width: 100%">
                <el-form-item label="参考链接">
                  <el-input v-model="mlProduct.refer_url">
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
                      v-model="mlProduct.note">
                  </el-input>
                </el-form-item>
              </el-col>


            </el-row>

          </el-form>

        </div>

    </el-skeleton>

  </div>
</template>

<script>
export default {
  name: "MelProductDetail",
  props: ['productID'],
  data(){
    return{
      mlProduct:{
        id: null,
        sku: '',
        p_name: '',
        label_code: '',
        upc: '',
        item_id: '',
        custom_code: '',
        cn_name: '',
        en_name: '',
        brand: '',
        declared_value: null,
        cn_material: null,
        en_material: null,
        use: null,
        p_status: null,
        image: null,
        site: null,
        shop: null,
        length: null,
        width: null,
        heigth: null,
        weight: null,
        unit_cost: null,
        first_ship_cost: null,
        buy_url: '',
        sale_url: '',
        refer_url: '',
        note: '',
        create_time: null,
      },
      statusOptions: [{
        value: 'ON_SALE',
        label: '在售'
      }, {
        value: 'OFFLINE',
        label: '停售'
      }, {
        value: 'CLEAN',
        label: '清仓'
      }],
      loading: false,
      rules: {
        p_name: [
          {required: true, message: '请输入产品名称', trigger: 'blur'},
          {min: 3, max: 80, message: '产品名称长度有误', trigger: 'blur'}
        ],
        upc: [
          {required: true, message: '请输入UPC', trigger: 'blur'},
        ],
        unit_cost: [
          {required: false, message: '成本价不能为空', trigger: 'blur'},
          {pattern: /^([1-9]\d{0,9}|0)(\.\d{1,2})?$/, message: '请输入正确金额', trigger: 'blur'}
          /*
            输入金额的要求：整数位最多十位，小数为最多为两位，可以无小数位
          */
        ],
        declared_value: [
          {pattern: /^([1-9]\d{0,9}|0)(\.\d{1,2})?$/, message: '请输入正确金额', trigger: 'blur'}
          /*
            输入金额的要求：整数位最多十位，小数为最多为两位，可以无小数位
          */
        ],
        first_ship_cost: [
          {pattern: /^([1-9]\d{0,9}|0)(\.\d{1,2})?$/, message: '请输入正确金额', trigger: 'blur'}
          /*
            输入金额的要求：整数位最多十位，小数为最多为两位，可以无小数位
          */
        ],
        length: [
          {pattern: /^[0-9]+([.]{0,1}[0-9]+){0,1}$/, message: '请输入正确尺寸', trigger: 'blur'}
        ],
        width: [
          {pattern: /^[0-9]+([.]{0,1}[0-9]+){0,1}$/, message: '请输入正确尺寸', trigger: 'blur'}
        ],
        heigth: [
          {pattern: /^[0-9]+([.]{0,1}[0-9]+){0,1}$/, message: '请输入正确尺寸', trigger: 'blur'}
        ],
        weight: [
          {pattern: /^[0-9]+([.]{0,1}[0-9]+){0,1}$/, message: '请输入正确重量', trigger: 'blur'}
        ],
      },
    }
  },
  created() {
    this.initProduct();
  },
  methods:{
    //修改产品
    updateProduct() {
      this.$refs.productForm.validate((valid) => {
        if (valid) {
            delete this.mlProduct.create_time
            delete this.mlProduct.image
            this.putRequest('api/ml_products/' + this.productID + '/', this.mlProduct).then(resp => {
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
      this.getRequest('api/ml_products/' + this.productID + '/').then(resp => {
        this.loading = false;
        if (resp) {
          this.mlProduct = resp
        }
      })
    }
  }
}
</script>

<style scoped>

</style>