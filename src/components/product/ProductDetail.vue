<template>
  <div class="productDetail">
    <el-skeleton :loading="loading" :rows="16" animated>
      <el-card shadow="hover" style="padding-bottom: 20px">
        <div slot="header" class="clearfix">
          <span style="font-weight: bold"><i class="el-icon-s-data"></i>基本资料</span>
        </div>
        <div>

          <el-form ref="productForm" :model="product" :rules="rules"
                   label-position="right" label-width="100px" class="basicProduct">
            <el-row>
              <el-col :span="12">
                <el-form-item label="SKU" required prop="sku">
                  <el-tag type="success" effect="plain" v-if="!isNewProduct">{{ this.product.sku }}</el-tag>
                  <el-input v-model="product.sku"
                            maxlength="30"
                            v-if="isNewProduct"
                            show-word-limit></el-input>

                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="状态" required  prop="status">
                  <el-select v-model="product.status" placeholder="请选择">
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
                  <el-input v-model="product.p_name"
                            maxlength="30"
                            show-word-limit></el-input>
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="品牌" required prop="brand">
                  <el-select v-model="product.brand" placeholder="请选择">
                    <el-option
                        v-for="item in brand"
                        :key="item.name"
                        :label="item.name"
                        :value="item.name">
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="标签名称">
                  <el-input v-model="product.label_name"
                            maxlength="18"
                            prop="label_name"
                            show-word-limit>
                  </el-input>
                </el-form-item>
              </el-col>


              <el-col :span="12">
                <el-form-item label="产品系列" required prop="series">
                  <el-select v-model="product.series" placeholder="请选择">
                    <el-option
                        v-for="item in series"
                        :key="item.name"
                        :label="item.name"
                        :value="item.name">
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="成本价" required prop="unit_cost">
                  <el-input v-model="product.unit_cost"></el-input>
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="产品类型">
                  <el-select v-model="product.p_type" placeholder="请选择">
                    <el-option
                        v-for="item in pType"
                        :key="item.name"
                        :label="item.name"
                        :value="item.name">
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="销售价" required prop="sale_price">
                  <el-input v-model="product.sale_price"></el-input>
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="尺寸">
                  <el-row>
                    <el-col :span="8">
                      <el-form-item prop="length">
                        <el-input v-model="product.length">
                          <template slot="prepend">长cm</template>
                        </el-input>
                      </el-form-item>
                    </el-col>

                    <el-col :span="8">
                      <el-form-item prop="width">
                        <el-input v-model="product.width">
                          <template slot="prepend">宽cm</template>
                        </el-input>
                      </el-form-item>
                    </el-col>

                    <el-col :span="8" prop="heigth">
                      <el-form-item>
                        <el-input v-model="product.heigth">
                          <template slot="prepend">高cm</template>
                        </el-input>
                      </el-form-item>
                    </el-col>
                  </el-row>
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="重量" prop="weight">
                  <el-input v-model="product.weight">
                    <template slot="prepend">kg</template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="24" style="width: 100%">
                <el-form-item label="产品链接">
                  <el-input v-model="product.url">
                    <template slot="prepend">Http://</template>
                  </el-input>
                </el-form-item>
              </el-col>

              <el-col :span="24" style="width: 100%">
                <el-form-item label="备注">
                  <el-input
                      type="textarea"
                      :rows="2"
                      placeholder="请输入内容"
                      v-model="product.note">
                  </el-input>
                </el-form-item>
              </el-col>

              <el-col :span="24">
                <el-form-item label="开启补货推荐">
                  <el-switch
                      v-model="product.is_auto_promote"
                      active-color="#13ce66"
                      inactive-color="#ff4949">
                  </el-switch>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="备货策略">
                  <el-select v-model="product.stock_strategy" placeholder="请选择">
                    <el-option
                        v-for="item in strategyOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                        :disabled="item.disabled">
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="备货天数">
                  <el-input-number v-model="product.stock_days" :min="0" controls-position="right"></el-input-number>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="警戒库存">
                  <el-input-number v-model="product.alert_qty" :min="0" controls-position="right"></el-input-number>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="警戒天数">
                  <el-input-number v-model="product.alert_days" :min="0" controls-position="right"></el-input-number>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="最小采购量">
                  <el-input-number v-model="product.mini_pq" :min="0" controls-position="right"></el-input-number>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="采购上限">
                  <el-input-number v-model="product.max_pq" :min="0" controls-position="right"></el-input-number>
                </el-form-item>
              </el-col>

            </el-row>

          </el-form>

          <div v-if="!isNewProduct">
            <el-divider content-position="left" >兼容手机型号</el-divider>
            <el-tag
                style="margin-right: 5px"
                :key="model.phone_model"
                :type="model.phone_model"
                v-for="model in product.product_comp_model"
                closable
                :disable-transitions="false">
              {{ model.phone_model }}
            </el-tag>

            <el-divider content-position="left">标签</el-divider>
            <el-tag
                style="margin-right: 5px;border: none"
                :key="tag.tag_name"
                :color="tag.color"
                effect="dark"
                v-for="tag in product.product_p_tag"
                closable
                @close="deleteTag(tag.id)"
                :disable-transitions="false">
              {{ tag.tag_name }}
            </el-tag>
            <el-popover
                @show="showTagSelect"
                placement="right"
                width="300"
                trigger="click">
              <SelectTag :key="timer" v-if="isShow"
                         @selectedTag="initTag"
                         :obj="{'id':productID,'tag_type':'PRODUCT','existTag':product.product_p_tag}"></SelectTag>
              <el-button size="mini" type="text" slot="reference">+ 添加标签</el-button>
            </el-popover>
          </div>

        </div>
      </el-card>

      <el-card shadow="hover" v-if="!isNewProduct">
        <div slot="header" class="clearfix">
          <span style="font-weight: bold"><i class="el-icon-s-home"></i>仓库/店铺</span>
        </div>
        <div>
          <el-table
              :header-cell-style="{background:'#eef1f6'}"
              :data="product.product_stock"
              border
              size="mini"
              style="width: 98%; margin: 10px">
            <el-table-column
                prop="store_name"
                label="仓库/店铺"
                width="180">
            </el-table-column>
            <el-table-column
                prop="qty"
                label="库存"
                width="180">
            </el-table-column>
            <el-table-column
                prop="lock_qty"
                label="锁仓">
            </el-table-column>
            <el-table-column
                prop="recent_7d_sales"
                label="7天销量">
            </el-table-column>
            <el-table-column
                prop="recent_30d_sales"
                label="30天销量">
            </el-table-column>
            <el-table-column
                prop="last_sale_time"
                label="最后销售时间">
            </el-table-column>
          </el-table>
        </div>
      </el-card>

      <el-card shadow="hover" v-if="!isNewProduct">
        <div slot="header" class="clearfix">
          <span style="font-weight: bold"><i class="el-icon-s-order"></i>操作日志</span>
        </div>
        <div>
          <el-table
              :header-cell-style="{background:'#eef1f6'}"
              :data="opLog"
              border
              size="mini"
              style="width: 98%; margin: 10px">
            <el-table-column
                prop="create_time"
                label="操作时间"
                :formatter="datetimeFormat"
                width="180">
            </el-table-column>
            <el-table-column
                prop="op_log"
                label="记录">
            </el-table-column>
            <el-table-column
                prop="user_name"
                label="操作人"
                width="180">
            </el-table-column>

          </el-table>
          <div>
            <el-pagination
                background
                :hide-on-single-page="true"
                :page-sizes="[20, 30, 40, 50, 100]"
                @current-change="opCurrentChange"
                @size-change="opSizeChange"
                layout="sizes, prev, pager, next, jumper, ->, total"
                :total="opTotal">
            </el-pagination>
          </div>
        </div>
      </el-card>

    </el-skeleton>

  </div>
</template>

<script>
import moment from 'moment'
import SelectTag from "@/components/setting/SelectTag";

export default {
  name: "ProductDetail",
  props: ['productID'],
  components:{
    SelectTag
  },
  data() {
    return {
      // 产品
      product: {
        id: null,
        sku: '',
        p_name: '',
        label_name: '',
        status: '',
        brand: '',
        series: '',
        p_type: '',
        unit_cost: null,
        sale_price: null,
        length: null,
        width: null,
        heigth: null,
        weight: null,
        url: '',
        is_auto_promote: true,
        stock_strategy: 'STANDARD',
        stock_days: null,
        alert_qty: null,
        alert_days: null,
        mini_pq: null,
        max_pq: null,
        product_comp_model: [],
        product_p_tag: [],
        note: '',
        product_stock: [],
      },
      rules: {
        p_name: [
          {required: true, message: '请输入产品名称', trigger: 'blur'},
          {min: 3, max: 80, message: '产品名称长度有误', trigger: 'blur'}
        ],
        sku: [
          {required: true, message: '请输入sku', trigger: 'blur'},
          {min: 3, max: 30, message: 'sku长度有误', trigger: 'blur'}
        ],
        status: [
          {required: true, message: '请选择产品状态', trigger: 'blur'}
        ],
        brand: [
          {required: true, message: '请选择品牌', trigger: 'blur'}
        ],
        series: [
          {required: true, message: '请选择产品系列', trigger: 'blur'}
        ],
        unit_cost: [
          {required: true, message: '成本价不能为空', trigger: 'blur'},
          {pattern: /^([1-9]\d{0,9}|0)(\.\d{1,2})?$/, message: '请输入正确金额', trigger: 'blur'}
          /*
            输入金额的要求：整数位最多十位，小数为最多为两位，可以无小数位
          */
        ],
        sale_price: [
          {required: true, message: '销售价不能为空', trigger: 'blur'},
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
      loading: false,
      allTags: [], // 所有可选的产品标签
      brand: [], // 所有可选品牌
      series: [], // 所有可选产品系列
      pType: [], // 所有可选产品类型
      opLog: [], // 产品操作日志
      opTotal: 0, // 操作日志总条数
      opPage: 1,  // 操作日志当前页
      opSize: 20,  // 操作日志页大小
      isNewProduct: false, // 是否新建产品
      timer: '',
      isShow: true,
      statusOptions: [{
        value: 'ON_SALE',
        label: '在售'
      }, {
        value: 'OFFLINE',
        label: '停售'
      }, {
        value: 'UN_LISTED',
        label: '未上市'
      }, {
        value: 'PRIVATE',
        label: '私模'
      }, {
        value: 'CLEAN',
        label: '清仓'
      }],
      strategyOptions: [{
        value: 'RADICAL',
        label: '激进'
      }, {
        value: 'STANDARD',
        label: '标准'
      }, {
        value: 'CONSERVE',
        label: '保守'
      }],
    }
  },
  created() {
    // 判断是新建产品还是编辑产品
    if(this.productID){
      this.initProduct(); // 产品数据
      this.initSettings(); // 基础菜单数据
    } else{
      this.isNewProduct = true;
      this.initSettings(); // 基础菜单数据
    }
  },
  methods: {
    // 删除标签
    deleteTag(id){
      this.deleteRequest('api/product_tags/'+id+'/').then(resp => {
        this.initProduct()
      })
    },

    //重新加载标签
    initTag(test){
      this.initProduct()
    },

    //触发子组件更新
    showTagSelect(){
      this.isShow = false;
      this.timer = new Date().getTime();
      this.isShow = true;
    },

    //修改、新增产品
    updateProduct() {
      this.$refs.productForm.validate((valid) => {
        if (valid) {
          //如果不是新建产品，就调用更新方法
          if(!this.isNewProduct){
            this.putRequest('api/products/' + this.productID + '/', this.product).then(resp => {
              if (resp) {
                // 调用父组件的关闭窗口方法
                this.$emit('closeProductDetail');
              }
            })
          }else {
            this.postRequest('api/products/', this.product).then(resp => {
              if (resp) {
                // 调用父组件的关闭窗口方法
                this.$emit('closeProductDetail');
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
    // 分页大小
    opSizeChange(size) {
      this.opSize = size;
      this.initProduct();
    },
    // 页码
    opCurrentChange(page) {
      this.opPage = page;
      this.initProduct();
    },

    // 格式化日期时间
    datetimeFormat: function (row, column) {

      var date = row[column.property];

      if (date == undefined) {
        return ''
      };

      return moment(date).format("YYYY-MM-DD HH:mm:ss")

    },

    // 调用产品详情接口数据
    initProduct() {
      this.loading = true;
      // 获取产品数据
      this.getRequest('api/products/' + this.productID + '/').then(resp => {
        if (resp) {

          this.product.id = resp.id;
          this.product.sku = resp.sku;
          this.product.p_name = resp.p_name;
          this.product.label_name = resp.label_name;
          this.product.status = resp.status;
          this.product.brand = resp.brand;
          this.product.series = resp.series;
          this.product.p_type = resp.p_type;
          this.product.unit_cost = resp.unit_cost;
          this.product.sale_price = resp.sale_price;
          this.product.length = resp.length;
          this.product.width = resp.width;
          this.product.heigth = resp.heigth;
          this.product.weight = resp.weight;
          this.product.url = resp.url;
          this.product.is_auto_promote = resp.is_auto_promote;
          this.product.stock_strategy = resp.stock_strategy;
          this.product.stock_days = resp.stock_days;
          this.product.alert_qty = resp.alert_qty;
          this.product.alert_days = resp.alert_days;
          this.product.mini_pq = resp.mini_pq;
          this.product.max_pq = resp.max_pq;
          this.product.product_comp_model = resp.product_comp_model;
          this.product.product_p_tag = resp.product_p_tag;
          this.product.note = resp.note;
          this.product.product_stock = resp.product_stock;

          this.loading = false;
        }
      })
      //获取所有可设置的产品标签
      this.getRequest('api/settings/tags/?type=PRODUCT').then(resp => {
        if (resp.results) {
          this.allTags = resp.results;
        }
      })

      //获取产品操作日志
      this.getRequest('/api/settings/op_logs/?op_type=PRODUCT&target_id=' + this.productID +
          '&page=' + this.opPage + '&page_size=' + this.opSize).then(resp => {
        if (resp.results) {
          this.opLog = resp.results;
          this.opTotal = resp.count;
        }
      })

    },

    // 调用基础设置信息
    initSettings(){

      //获取所有可选品牌
      if(window.sessionStorage.getItem('brand')) {
        this.brand = JSON.parse(window.sessionStorage.getItem('brand'));
      }else{
        this.getRequest('api/product_extra_info/?type=BRAND&page_size=1000').then(resp => {
          if (resp.results) {
            this.brand = resp.results;
            window.sessionStorage.setItem('brand', JSON.stringify(this.brand));
          }
        })
      }


      //获取所有可选产品系列
      if(window.sessionStorage.getItem('pSeries')) {
        this.series = JSON.parse(window.sessionStorage.getItem('pSeries'));
      }else{
        this.getRequest('api/product_extra_info/?type=SERIES&page_size=1000').then(resp => {
          if (resp.results) {
            this.series = resp.results;
            window.sessionStorage.setItem('pSeries', JSON.stringify(this.series));
          }
        })
      }


      //获取所有可选产品类型
      if(window.sessionStorage.getItem('pType')) {
        this.pType = JSON.parse(window.sessionStorage.getItem('pType'));
      }else{
        this.getRequest('api/product_extra_info/?type=P_TYPE&page_size=1000').then(resp => {
          if (resp.results) {
            this.pType = resp.results;
            window.sessionStorage.setItem('pType', JSON.stringify(this.pType));
          }
        })
      }

    }
  }
}
</script>

<style scoped>
.productDetail .el-card {
  margin-bottom: 20px;
}

.basicProduct .el-input {
  width: 100%;
}
</style>