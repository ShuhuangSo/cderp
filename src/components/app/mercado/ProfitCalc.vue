/*
产品利润计算工具组件
*/
<template>
  <div>
    <el-tabs activeName="ebay" >
      <el-tab-pane label="eBay" name="ebay">
        <div style="display: flex">
          <!--    左侧-->
          <div class="left_side">
            <el-form ref="calcForm" label-width="120px">

              <el-form-item label="站点" prop="site">
                <el-select v-model="site" @change="changeSite" placeholder="请选择">
                  <el-option
                      v-for="item in siteOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>

              <el-form-item label="账号类型" prop="account_type">
                <el-radio-group v-model="account_type" @input="initSettings">
                  <el-radio label="LOCAL">本土号</el-radio>
                  <el-radio label="CHINA">跨境号</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="店铺类型">
                <el-radio-group v-model="store_type" @input="initSettings">
                  <el-radio label="NO_STORE">无店铺</el-radio>
                  <el-radio label="BASIC">基础店铺</el-radio>
                  <el-radio label="FEATURED">中级店铺</el-radio>
                  <el-radio label="ANCHOR">高级店铺</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="产品尺寸(cm)" >
                <el-col :span="7">
                  <el-form-item prop="p_length">
                    <el-input v-model.number="p_length"
                              oninput="value=value.replace(/^(0+)|[^\d]+/g,'')"
                              @input="initProfit"
                              class="size_width">
                      <template slot="prepend">长</template>
                    </el-input>
                  </el-form-item>
                </el-col>

                <el-col :span="7">
                  <el-form-item prop="p_width">
                    <el-input v-model.number="p_width"
                              oninput="value=value.replace(/^(0+)|[^\d]+/g,'')"
                              @input="initProfit"
                              class="size_width">
                      <template slot="prepend">宽</template>
                    </el-input>
                  </el-form-item>
                </el-col>

                <el-col :span="7">
                  <el-form-item prop="p_height">
                    <el-input v-model.number="p_height"
                              oninput="value=value.replace(/^(0+)|[^\d]+/g,'')"
                              @input="initProfit"
                              class="size_width">
                      <template slot="prepend">高</template>
                    </el-input>
                  </el-form-item>
                </el-col>


              </el-form-item>

              <el-form-item label="重量(g)" prop="p_weight" >
                <el-input-number
                    v-model="p_weight"
                    @change="initProfit"
                    controls-position="right"
                    :min="0"></el-input-number>
              </el-form-item>

              <el-form-item label="成本价(RMB)" prop="p_cost" >
                <el-input-number
                    v-model="p_cost"
                    @change="initProfit"
                    :precision="2"
                    controls-position="right"
                    :min="0"></el-input-number>
              </el-form-item>

              <el-form-item :label="`售价(${this.currency})`" prop="price" >
                <el-input-number
                    v-model="price"
                    @change="initProfit"
                    :precision="2"
                    controls-position="right"
                    :min="0"></el-input-number>
              </el-form-item>

              <el-form-item :label="`收取运费(${this.currency})`">
                <el-input-number
                    v-model="postage"
                    @change="initProfit"
                    :precision="2"
                    controls-position="right"
                    :min="0"></el-input-number>
              </el-form-item>

              <el-form-item label="广告费率">
                <el-slider
                    v-model="ad"
                    @change="initProfit"
                    show-input>
                </el-slider>
              </el-form-item>

              <el-form-item label="类目" prop="category">
                <el-select placeholder="请选择" v-model="category"
                           @change="initSettings"
                           filterable style="width: 100%">
                  <el-option
                      v-for="item in categoryList"
                      :key="item.value"
                      :label="item.name"
                      :value="item">
                  </el-option>
                </el-select>
              </el-form-item>

              <el-form-item label="物流" prop="category">
                <el-select v-model="carrier" placeholder="请选择" style="width: 100%">
                  <el-option
                      v-for="item in carrierList"
                      :key="item.value"
                      :label="item.name"
                      :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>

              <div style="display: flex;justify-content: center">
                <el-button type="primary"
                           @click="getShippingCost"
                           style="width: 200px;margin-left: 20px">计算利润
                </el-button>
                <el-button
                           @click="saveTemplate"
                           style="width: 100px;margin-left: 20px">保存模板
                </el-button>
              </div>

            </el-form>

            <div v-if="templateList.length">
              <el-divider content-position="center">自定义模板列表</el-divider>
              <el-button-group :key="item.title"
                               v-for="item in templateList"
                                style="margin-right: 10px; margin-top: 10px">
              <el-button
                  round
                  :type="template_id===item.id?'primary':''"
                  size="mini"
                  @click="clickTemplate(item.id)"
                  >
                {{ item.title }}
              </el-button>
              <el-button type="danger"
                         v-if="template_id===item.id"
                         @click="deleteTemplate(item.id)"
                         round
                         size="mini"
                         icon="el-icon-delete" ></el-button>
              </el-button-group>
            </div>

          </div>
          <!--    右侧-->
          <div class="right_side">
            <div class="sales">
              <div class="main_title">销售</div>
              <div style="display: flex">
                <div class="item_title">币种</div>
                <div class="line"></div>
                <div class="item_price">{{ this.currency }}</div>
              </div>

              <div style="display: flex">
                <div class="item_title">售价</div>
                <div class="line"></div>
                <div class="item_price">{{ this.price | dollar_currency }}</div>
              </div>

              <div style="display: flex" v-if="postage">
                <div class="item_title">运费</div>
                <div class="line"></div>
                <div class="item_price">{{ this.postage | dollar_currency }}</div>
              </div>


              <div style="display: flex" v-if="site === 'UK'">
                <div class="item_subtitle">VAT {{ this.uk_vat_rate | percent }}</div>
                <div class="line"></div>
                <div class="item_sub_price">{{ this.ukVatFee | neg_dollar_currency }}</div>
              </div>

              <div style="display: flex">
                <div class="item_subtitle">类目佣金 {{ this.category_rate | percent }}</div>
                <div class="line"></div>
                <div class="item_sub_price">{{ this.categoryFee | neg_dollar_currency }}</div>
              </div>

              <div style="display: flex">
                <div class="item_subtitle">固定佣金 {{ this.category_fixed_fee }}/单</div>
                <div class="line"></div>
                <div class="item_sub_price">{{ this.category_fixed_fee | neg_dollar_currency }}</div>
              </div>

              <div style="display: flex" v-if="ad">
                <div class="item_subtitle" v-if="site === 'AU' && account_type === 'LOCAL'">广告 {{ this.ad }}% + 10%GST</div>
                <div class="item_subtitle" v-if="site === 'UK' && account_type === 'LOCAL'">广告 {{ this.ad }}%</div>
                <div class="item_subtitle" v-if="account_type === 'CHINA'">广告 {{ this.ad }}% + 2.5%货币兑换费</div>
                <div class="line"></div>
                <div class="item_sub_price">{{ this.adFee | neg_dollar_currency }}</div>
              </div>

              <div style="display: flex" v-if="site === 'UK'">
                <div class="item_subtitle">监管运营费 {{ this.operating_fee_rate | percent }}</div>
                <div class="line"></div>
                <div class="item_sub_price">{{ this.ukOperatingFee | neg_dollar_currency }}</div>
              </div>

              <div style="display: flex" v-if="account_type === 'CHINA'">
                <div class="item_subtitle">国际费用 {{ this.international_fee_rate | percent }}</div>
                <div class="line"></div>
                <div class="item_sub_price">{{ this.internationalFee | neg_dollar_currency }}</div>
              </div>

              <div style="display: flex" v-if="account_type === 'CHINA'">
                <div class="item_subtitle">非美金货币兑换费 {{ this.dollar_change_fee_rate | percent }}</div>
                <div class="line"></div>
                <div class="item_sub_price">{{ this.dollarChangeFee | neg_dollar_currency }}</div>
              </div>

              <div class="total_line"></div>

              <div style="display: flex; justify-content: right">
                <div>结算</div>
                <div style="margin-left: 50px">{{ this.subtotal | dollar_currency }}</div>
              </div>

            </div>

            <div class="sales">
              <div class="main_title">结汇</div>
              <div style="display: flex">
                <div class="item_title">汇率 {{this.ex_rate_update}}</div>
                <div class="line"></div>
                <div class="item_price">{{this.ex_rate}}</div>
              </div>

              <div style="display: flex">
                <div class="item_title">结汇金额</div>
                <div class="line"></div>
                <div class="item_price">{{ this.subtotal | dollar_currency }}</div>
              </div>

              <div style="display: flex">
                <div class="item_subtitle">手续费 {{ this.ex_fee_rate | percent }}</div>
                <div class="line"></div>
                <div class="item_sub_price">{{ this.ex_fees | neg_dollar_currency }}</div>
              </div>

              <div class="total_line"></div>

              <div style="display: flex; justify-content: right">
                <div>人民币收款</div>
                <div style="margin-left: 50px">{{ this.rec_rmb | rmb_currency }}</div>
              </div>

            </div>

            <div class="profit">
              <div style="padding: 0 40px">
                <div class="main_title">利润</div>
                <div style="display: flex">
                  <div class="item_title">产品成本</div>
                  <div class="line"></div>
                  <div class="item_price">{{ this.p_cost | rmb_currency }}</div>
                </div>

                <div style="display: flex">
                  <div class="item_title">发货运费</div>
                  <div class="line"></div>
                  <div class="item_price">见列表</div>
                </div>

                <div class="total_line"></div>
              </div>

              <div>
                <el-table
                    :header-cell-style="{background:'#eef1f6'}"
                    :data="shippingCostList"
                    size="mini"
                    style="width: 100%;border-radius: 15px;">
                  <el-table-column
                      label="物流名称"
                      align="center"
                      header-align="center"
                      width="120">
                    <template slot-scope="scope">
                      <div>{{ scope.row.name }}</div>
                    </template>
                  </el-table-column>
                  <el-table-column
                      label="区域"
                      align="center"
                      header-align="center">
                    <template slot-scope="scope">
                      <div>{{ scope.row.area | area }}</div>
                    </template>
                  </el-table-column>
                  <el-table-column
                      label="计费重量g"
                      align="center"
                      header-align="center">
                    <template slot-scope="scope">
                      <div>{{ scope.row.calc_weight }}</div>
                    </template>
                  </el-table-column>
                  <el-table-column
                      label="运费"
                      align="center"
                      header-align="center">
                    <template slot-scope="scope">
                      <div>{{ scope.row.cost | rmb_currency }}</div>
                    </template>
                  </el-table-column>
                  <el-table-column
                      label="利润"
                      align="center"
                      header-align="center">
                    <template slot-scope="scope">
                      <div style="color: green" v-if="scope.row.profit > 0">{{ scope.row.profit | rmb_currency }}</div>
                      <div style="color: #aa0515" v-if="scope.row.profit <= 0">{{ scope.row.profit | rmb_currency }}</div>
                    </template>
                  </el-table-column>
                  <el-table-column
                      label="毛利率"
                      align="center"
                      header-align="center">
                    <template slot-scope="scope">
                      <div style="color: green" v-if="scope.row.gross_margin > 0">{{ scope.row.gross_margin | interPercent }}</div>
                      <div style="color: #aa0515" v-if="scope.row.gross_margin <= 0">{{ scope.row.gross_margin | interPercent }}</div>
                    </template>
                  </el-table-column>


                </el-table>
              </div>

            </div>

          </div>
        </div>
      </el-tab-pane>
<!--      <el-tab-pane label="OZON" name="ozon">ozon</el-tab-pane>-->

    </el-tabs>
  </div>
</template>

<script>
import el from "element-ui/src/locale/lang/el";

let _this = this   //**定义全局变量**
export default {
  name: "ProfitCalc",
  data(){
    return{
      p_width: null,
      p_height: null,
      p_length: null,
      p_weight: null,
      p_cost: null, // 成本价
      site: 'AU', //站点
      currency_symbol: '$', //货币符号
      account_type: 'LOCAL', //账号类型
      store_type: 'FEATURED', //店铺类型
      currency: 'AUD', //店铺类型
      price: 10, //售价
      postage: null, //运费
      carrier: 'ALL', //物流
      ad: 0, //广告
      international_fee_rate: 0.014, //国际费用
      dollar_change_fee_rate: 0.025, //非美金货币兑换费
      category_rate: null, //类目佣金率
      category_fixed_fee: null, //固定佣金
      ex_rate: 0, //汇率
      ex_rate_update: '', //汇率更新时间
      ex_fee_rate: 0.01, //结汇手续费费率
      uk_vat_rate: 0.2, //英国税率
      operating_fee_rate: 0.0035, //英国监管运营费
      category: null, //类目
      siteOptions: [{
        value: 'AU',
        label: '澳洲'
      }, {
        value: 'UK',
        label: '英国'
      }],
      categoryList: [], //类目列表
      carrierList: [], // 物流列表
      au_carriers: [{
        name: '全部物流',
        value: 'ALL'
      },{
        name: '中通-澳邮信封',
        value: 'ZMAU-L'
      },{
        name: 'UBI澳邮挂号(普货)',
        value: 'UBI_AUS_POST'
      },{
        name: 'UBI澳邮挂号(带电)',
        value: 'UBI_AUS_POST_E'
      },{
        name: 'UBI Aramex(普货)',
        value: 'UBI_ARAMEX'
      },{
        name: 'UBI Aramex(带电)',
        value: 'UBI_ARAMEX_E'
      }], //澳洲物流
      uk_carriers: [{
        name: '全部物流',
        value: 'ALL'
      },{
        name: '联邮通(普货)',
        value: '4PX_WBP'
      },{
        name: '联邮通(带电)',
        value: '4PX_WBP_E'
      }], //英国物流
      shippingCostList:[], //运费和利润列表
      templateList:[], //模板列表
      template_id: null, //选中模板id

    }
  },
  beforeCreate() {
    _this = this;
  },
  filters:{
    //外汇金额格式化
    dollar_currency: function (value) {
      if (!value) return 0.00;
      if (value > 0) {
        return `${_this.currency_symbol}${value.toFixed(2)}`;
      } else {
        return `-${_this.currency_symbol}${Math.abs(value).toFixed(2)}`;
      }
    },
    //负数外汇金额格式化
    neg_dollar_currency: function (value) {
      if (!value) return 0.00;
      return `-${_this.currency_symbol}${value.toFixed(2)}`;
    },
    //人民币金额格式化
    rmb_currency: function (value) {
      if (!value) return 0.00;
      if (value > 0) {
        return `¥${value.toFixed(2)}`;
      } else {
        return `-¥${Math.abs(value).toFixed(2)}`;
      }
    },
    //百分比
    percent: function (value) {
      if (!value) return '';
      value = value * 100
      return `${value.toFixed(2)}%`;
    },
    //整百分比
    interPercent: function (value) {
      if (!value) return '';
      value = value * 100
      return `${value.toFixed(0)}%`;
    },
    //格式化分区
    area: function (value) {
      if (value === 'NO'){
        return '不分区'
      } else {
        return value
      }
    },
  },
  computed: {
    // 类目佣金
    categoryFee() {
      return (this.price + this.postage) * this.category_rate
    },
    // 广告费
    adFee() {
      if (this.site === 'AU' && this.account_type === 'LOCAL') {
        return ((this.price + this.postage) * this.ad / 100) * 1.1
      } else if(this.site === 'UK' && this.account_type === 'LOCAL'){
        return ((this.price + this.postage) * this.ad / 100)
      }
      else {
        return ((this.price + this.postage) * this.ad / 100) * 1.025
      }
    },
    // 结算费
    subtotal() {
      return this.price + this.postage - this.categoryFee - this.category_fixed_fee - this.adFee -this.internationalFee
          - this.dollarChangeFee - this.ukVatFee - this.ukOperatingFee
    },
    // 国际费用
    internationalFee() {
      return (this.price + this.postage) * this.international_fee_rate
    },
    // 非美金货币兑换费
    dollarChangeFee() {
      return (this.price + this.postage) * this.dollar_change_fee_rate
    },
    // 英国vat税费
    ukVatFee() {
      return (this.price + this.postage) -  (this.price + this.postage)/(1 + this.uk_vat_rate)
    },
    // 英国监管运营费
    ukOperatingFee() {
      return (this.price + this.postage) * this.operating_fee_rate
    },
    // 结汇手续费
    ex_fees() {
      return this.subtotal * this.ex_fee_rate
    },
    // 人民币收款
    rec_rmb() {
      return (this.subtotal - this.ex_fees)  * this.ex_rate
    },
  },

  mounted() {
    // 获取自定义模板列表
    if(window.localStorage.getItem('templateList')) {
      this.templateList = JSON.parse(window.localStorage.getItem('templateList'));
    }
    this.initSettings()
    // this.initCategoryList()
    // this.initExRate()
  },
  methods:{
    //删除模板
    deleteTemplate(id){
      //删除列表指定对象
      this.templateList.forEach((item, index) => {
        if (item.id === id) {
          this.templateList.splice(index, 1);
        }
      });
      window.localStorage.setItem('templateList', JSON.stringify(this.templateList));
      this.$message.success('已删除')

    },
    //点击载入模板
    clickTemplate(id){
      const foundObject = this.templateList.find(item => item.id === id);
      this.site = foundObject.site
      this.account_type = foundObject.account_type
      this.store_type = foundObject.store_type

      this.p_length = foundObject.p_length
      this.p_width = foundObject.p_width
      this.p_height = foundObject.p_height
      this.p_weight = foundObject.p_weight
      this.price = foundObject.price
      this.p_cost = foundObject.p_cost
      this.currency = foundObject.currency
      this.postage = foundObject.postage
      this.carrier = foundObject.carrier
      this.ad = foundObject.ad
      this.category = foundObject.category
      this.currency_symbol = foundObject.currency_symbol

      this.template_id = id
      this.initSettings()
      this.$message.success('成功载入模板 ' + foundObject.title)

    },
    // 保存模板
    saveTemplate(){
      if (this.p_width && this.p_height && this.p_height && this.p_weight && this.p_cost && this.price && this.category_rate){
        this.$prompt('请输入模板名称', '保存模板', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
        }).then(({ value }) => {
          this.templateList.push({
            title: value,
            id: new Date().getTime().toString(),
            p_length: this.p_length,
            p_width: this.p_width,
            p_height: this.p_height,
            p_weight: this.p_weight,
            price: this.price,
            p_cost: this.p_cost,
            site: this.site,
            account_type: this.account_type,
            store_type: this.store_type,
            currency: this.currency,
            postage: this.postage,
            carrier: this.carrier,
            ad:this.ad,
            category: this.category,
            category_rate: this.category_rate,
            category_fixed_fee: this.category_fixed_fee,
            currency_symbol: this.currency_symbol
          })
          window.localStorage.setItem('templateList', JSON.stringify(this.templateList));
          this.$message.success('已保存')
        })
      }else {
        this.$message.error('数据不全，请检查填写!')
      }
          },
    //利润表重置
    initProfit(){
      this.shippingCostList=[]
    },

    // 物流数据变动
    changeCarrierData(){
      this.carrierList = []
      this.carrier = 'ALL'
      if (this.site === 'AU') {
        this.carrierList = this.au_carriers
      }
      if (this.site === 'UK') {

        this.carrierList = this.uk_carriers
      }
    },

    //参数初始化设置
    initSettings(){
      this.international_fee_rate = 0 //国际费用
      this.dollar_change_fee_rate = 0 //非美金货币兑换费
      this.uk_vat_rate = 0 //英国vat
      this.operating_fee_rate = 0 //英国监管运营费
      //判断站点
      if (this.site === 'UK') {
        this.currency = 'GBP'
        this.currency_symbol = '£'
        this.uk_vat_rate = 0.2
        this.operating_fee_rate = 0.0035
        //如果是跨境号
        if (this.account_type === 'CHINA') {
          this.international_fee_rate = 0.0145; // 国际费用
          this.dollar_change_fee_rate = 0.025; //非美金货币兑换费
        }
        //类目佣金分配
        if (this.category) {
          this.category_rate = this.category.fee1
          this.category_fixed_fee = this.category.fixed_fee1 //有开店铺固定佣金
        }
      }
      if (this.site === 'AU') {
        this.currency = 'AUD'
        this.currency_symbol = '$'
        //如果是跨境号
        if (this.account_type === 'CHINA') {
          this.international_fee_rate = 0.014; // 国际费用
          this.dollar_change_fee_rate = 0.025; //非美金货币兑换费
        }
        //类目佣金分配
        if (this.category) {
          this.category_fixed_fee = this.category.fixed_fee1 //有开店铺固定佣金
          if (this.store_type ==='NO_STORE') {
            this.category_rate = this.category.fee0
            this.category_fixed_fee = this.category.fixed_fee0
          }
          if (this.store_type ==='BASIC') this.category_rate = this.category.fee1
          if (this.store_type ==='FEATURED') this.category_rate = this.category.fee2
          if (this.store_type ==='ANCHOR') this.category_rate = this.category.fee3
        }
      }

      this.initExRate() //获取汇率
      this.initCategoryList() //更新类目列表
      this.changeCarrierData() //物流数据更新
      this.initProfit() //利润表重置

    },

    //站点变动
    changeSite(){
      //类目佣金清空
      this.category = null
      this.category_rate = 0
      this.category_fixed_fee = 0
      this.initSettings()
    },
    //获取物流运费和利润
    getShippingCost(){
      if (this.p_width && this.p_height && this.p_height && this.p_weight && this.p_cost && this.price && this.category_rate) {
        let url = 'api/platform_category/get_shipping_price/'
        let data = {
          site: this.site,
          p_width: parseFloat(this.p_width),
          p_height: parseFloat(this.p_height),
          p_length: parseFloat(this.p_length),
          p_weight: this.p_weight,
          p_cost: this.p_cost,
          carrier_code: this.carrier,
          rec_rmb: this.rec_rmb,
          price: this.price,
          ex_rate: this.ex_rate,
        }
        this.postRequest(url, data).then(resp => {
          if (resp) {
            this.shippingCostList = resp
          }
        })
      } else {
        this.$message.error('数据不全，请检查填写!')
      }

    },
    // 获取汇率
    initExRate(){
      let url = 'api/platform_category/get_ex_rate/'
      let data = {
        currency: this.currency
      }
      this.postRequest(url, data).then(resp => {
        if (resp) {
          this.ex_rate = resp.value
          this.ex_rate_update = resp.update
        }
      })
    },
    //初始化类目费率列表
    initCategoryList(){
      this.categoryList = []
      let url = 'api/platform_category/?page_size=5000&platform=ebay'
      url += '&site=' + this.site;
      this.getRequest(url).then(resp => {
        if (resp.results) {
          resp.results.forEach(item=>{
            this.categoryList.push({
              name: `${item.first_category}-${item.en_name} (${item.cn_name})`,
              value: item.id,
              fixed_fee0: item.fixed_fee0,
              fixed_fee1: item.fixed_fee1,
              fee0: item.fee0,
              fee1: item.fee1,
              fee2: item.fee2,
              fee3: item.fee3,
            })
          })

        }
      })
    }
  }
}
</script>

<style scoped>
.left_side{
  width: 50%;
  margin-right: 10px;
}
.right_side{
  width: 50%;
  border: 1px solid #dadada; /* 设置边框大小、样式和颜色 */
  border-radius: 15px;
}
.size_width {
  width: 120px;
  margin-right: 10px;
}
.sales {
  margin: 10px;
  padding: 10px 50px;
  background-color: #f7f7f7;
  border-radius: 15px;
}
.profit {
  margin: 10px;
  padding: 10px 10px;
  background-color: #f7f7f7;
  border-radius: 15px;
}
.line {
  width: 100%;
  border-top: 1px dashed #8a8a8a; /* 横线，可以替换为hr */
  margin: auto; /* 横线上下居中 */
}
.item_title {
  flex-shrink: 0;
  margin-right: 10px;
}
.item_subtitle {
  flex-shrink: 0;
  color: #99a9bf;
  margin-right: 10px;
  margin-left: 10px;
}
.item_price {
  flex-shrink: 0;
  margin-left: 10px;
}
.item_sub_price {
  flex-shrink: 0;
  color: #99a9bf;
  margin-left: 10px;
}
.main_title{
  font-size: 20px;
  font-weight: bold;
  text-align: center;
}
.total_line{
  border-top: 1px solid #8a8a8a;
  margin-top: 20px;
  margin-bottom: 20px;
}
</style>