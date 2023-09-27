<template>
  <div class="productDetail">
    <el-skeleton :loading="loading" :rows="16" animated>

        <div>
          <el-tabs type="card" v-model="activeName">
            <el-tab-pane name="one" label="产品数据">
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
                    <el-form-item label="所属店铺" prop="shop">
                      <el-select style="width: 300px;" v-model="mlProduct.shop" placeholder="请选择">
                        <el-option
                            v-for="item in shops"
                            :key="item.name"
                            :label="item.name"
                            :value="item.name">
                          <span style="float: left">{{ item.name }}</span>
                          <span style="float: right; color: #8492a6; font-size: 13px">{{ item.nickname }}</span>
                        </el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>

                  <el-col :span="12">
                    <el-form-item label="平台" prop="shop">
                      <el-select v-model="mlProduct.platform" placeholder="请选择">
                        <el-option
                            v-for="item in platforms"
                            :key="item.code"
                            :label="item.name"
                            :value="item.code">
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
                    <el-form-item label="站点" prop="shop">
                      <el-select v-model="mlProduct.site" placeholder="请选择">
                        <el-option
                            v-for="item in sites"
                            :key="item.site_code"
                            :label="item.name"
                            :value="item.site_code">
                        </el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>

                  <el-col :span="12">
                    <el-form-item label="UPC"  prop="upc">
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

                  <el-col :span="5">
                    <el-form-item label="是否带电">
                      <el-switch
                          v-model="mlProduct.is_elec"
                          >
                      </el-switch>
                    </el-form-item>
                  </el-col>

<!--                  <el-col :span="5">-->
<!--                    <el-form-item label="是否带磁">-->
<!--                      <el-switch-->
<!--                          v-model="mlProduct.is_magnet"-->
<!--                          >-->
<!--                      </el-switch>-->
<!--                    </el-form-item>-->
<!--                  </el-col>-->

                  <el-col :span="5">
                    <el-form-item label="是否液体">
                      <el-switch
                          v-model="mlProduct.is_water"
                          >
                      </el-switch>
                    </el-form-item>
                  </el-col>

                  <el-col :span="24">
                    <el-form-item label="品牌" prop="brand">
                      <el-input
                          style="width: 200px;margin-bottom: 20px"
                          v-model="mlProduct.brand"
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

                  <el-col :span="24">
                    <el-form-item label="包材" prop="shop">
                      <el-select style="width: 300px;" v-model="mlProduct.packing_id" placeholder="请选择包材">
                        <el-option
                            v-for="item in packs"
                            :key="item.name"
                            :label="item.name"
                            :value="item.id">
                          <span style="float: left">{{ item.name }}</span>
                          <span style="float: right; color: #8492a6; font-size: 13px">{{ item.size }}</span>
                        </el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>

                  <el-col :span="24" style="width: 100%;margin-bottom: 20px">
                    <el-form-item label="数据是否核对">
                      <el-switch
                          v-model="mlProduct.is_checked"
                          active-color="#13ce66">
                      </el-switch>
                    </el-form-item>
                  </el-col>

                  <el-col :span="24">
                    <el-form-item label="FBM条码">
                      <el-input v-model="mlProduct.label_code"
                                class="label"
                                prop="label_code">
                      </el-input>
                    </el-form-item>
                  </el-col>

                  <el-col :span="24">
                    <el-form-item label="条码标题">
                      <el-input v-model="mlProduct.label_title"
                                class="label"
                                prop="label_code">
                      </el-input>
                    </el-form-item>
                  </el-col>

                  <el-col :span="24">
                    <el-form-item label="条码选项">
                      <el-input v-model="mlProduct.label_option"
                                class="label"
                                prop="label_code">
                      </el-input>
                    </el-form-item>
                  </el-col>

                  <el-col :span="24" style="width: 100%;margin-top: 20px">
                    <el-form-item label="采购链接1">
                      <el-input v-model="mlProduct.buy_url">
                        <template slot="prepend">Http://</template>
                      </el-input>
                    </el-form-item>
                  </el-col>

                  <el-col :span="24" style="width: 100%">
                    <el-form-item label="采购链接2">
                      <el-input v-model="mlProduct.buy_url2">
                        <template slot="prepend">Http://</template>
                      </el-input>
                    </el-form-item>
                  </el-col>

                  <el-col :span="24" style="width: 100%">
                    <el-form-item label="采购链接3">
                      <el-input v-model="mlProduct.buy_url3">
                        <template slot="prepend">Http://</template>
                      </el-input>
                    </el-form-item>
                  </el-col>

                  <el-col :span="24" style="width: 100%">
                    <el-form-item label="采购链接4">
                      <el-input v-model="mlProduct.buy_url4">
                        <template slot="prepend">Http://</template>
                      </el-input>
                    </el-form-item>
                  </el-col>

                  <el-col :span="24" style="width: 100%">
                    <el-form-item label="采购链接5">
                      <el-input v-model="mlProduct.buy_url5">
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
            </el-tab-pane>
            <el-tab-pane name="two" label="操作日志">

              <el-table
                  :header-cell-style="{background:'#eef1f6'}"
                  :data="operateLogs"
                  border
                  size="mini"
                  style="width: 98%; margin: 10px">
                <el-table-column
                    label="操作时间"
                    align="center"
                    header-align="center"
                    width="180">
                  <template slot-scope="scope">
                    <div>{{ scope.row.create_time | dateTime }}</div>
                  </template>
                </el-table-column>
                <el-table-column
                    prop="desc"
                    label="记录">
                </el-table-column>
                <el-table-column
                    prop="user_name"
                    label="操作人"
                    align="center"
                    header-align="center"
                    width="180">
                </el-table-column>

              </el-table>
              <div class="pagination">
                <el-pagination
                    background
                    :hide-on-single-page="true"
                    :page-sizes="[20, 30, 40, 50, 100]"
                    @current-change="currentChange"
                    @size-change="sizeChange"
                    layout="sizes, prev, pager, next, jumper, ->, total"
                    :current-page="page"
                    :total="total">
                </el-pagination>
              </div>

            </el-tab-pane>
          </el-tabs>


        </div>

    </el-skeleton>

  </div>
</template>

<script>
import moment from "moment";

export default {
  name: "MelProductDetail",
  props: ['productID'],
  data(){
    return{
      user: JSON.parse(window.sessionStorage.getItem('user')),
      shops: [],
      sites: [],
      packs: [],
      platforms: [{
        code: 'MERCADO',
        name: '美客多'
      },
        {
          code: 'NOON',
          name: 'Noon'
        }], //平台
      activeName: 'one',
      mlProduct:{
        id: null,
        sku: '',
        p_name: '',
        platform: '',
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
        is_elec: false,
        is_magnet: false,
        is_water: false,
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
        buy_url2: '',
        buy_url3: '',
        buy_url4: '',
        buy_url5: '',
        is_checked: false,
        sale_url: '',
        refer_url: '',
        note: '',
        create_time: null,
        packing_id: null,
        label_title: null,
        label_option: null,
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
      operateLogs: [],
      total: 0, // 总条数
      page: 1,  // 当前页
      size: 20,  // 页大小
    }
  },
  filters: {
    //时间日期格式化
    dateTime: function (value) {
      return moment(value).format("YYYY-MM-DD HH:mm");
    },
  },
  created() {
    this.initProduct();
    this.inintShops()
    this.inintSites()
    this.initPacking()
    this.initOperateLogs()
  },
  methods:{
    // 分页大小
    sizeChange(size) {
      this.page = 1;
      this.size = size;
      this.initOperateLogs();
    },
    // 页码
    currentChange(page) {
      this.page = page;
      this.initOperateLogs();
    },
    initOperateLogs(){
      let url = '/api/ml_operate_log/?target_type=PRODUCT&page=' + this.page + '&page_size=' + this.size
      url += '&target_id=' + this.productID
      this.getRequest(url).then(resp => {
        if (resp.results) {
          this.operateLogs = resp.results;
          this.total = resp.count;
        }
      })
    },

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
    inintShops(){
      //获取所有可选店铺
      if(window.sessionStorage.getItem('ml_shops')) {
        this.shops = JSON.parse(window.sessionStorage.getItem('ml_shops'));
      }else{
        let url = 'api/ml_shops/?warehouse_type=FBM&page_size=1000&ordering=create_time'
        if (!this.user.is_superuser) {
          url += '&user_id=' + this.user.id;
        }
        this.getRequest(url).then(resp => {
          if (resp.results) {
            this.shops = resp.results;
            window.sessionStorage.setItem('ml_shops', JSON.stringify(this.shops));
          }
        })
      }
    },
    inintSites(){
      //获取所有站点
      if(window.sessionStorage.getItem('ml_sites')) {
        this.sites = JSON.parse(window.sessionStorage.getItem('ml_sites'));
      }else{
        this.getRequest('api/ml_site/?page_size=1000').then(resp => {
          if (resp.results) {
            this.sites = resp.results;
            window.sessionStorage.setItem('ml_sites', JSON.stringify(this.sites));
          }
        })
      }
    },
    initPacking(){
      //初始化包材
      this.getRequest('api/ml_packing/?page_size=1000').then(resp => {
        if (resp.results) {
          this.packs = resp.results;
        }
      })
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
.label{
  width: 500px;
}
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}
</style>