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
            <el-form ref="calcForm" label-width="100px">


              <el-form-item label="产品尺寸(cm)">
                <el-input v-model="p_length" class="size_width">
                  <template slot="prepend">长</template>
                </el-input>
                <el-input v-model="p_width" class="size_width">
                  <template slot="prepend">宽</template>
                </el-input>
                <el-input v-model="p_height" class="size_width">
                  <template slot="prepend">高</template>
                </el-input>
              </el-form-item>

              <el-form-item label="重量(g)">
                <el-input-number
                    v-model="p_weight"
                    controls-position="right"
                    :min="0"></el-input-number>
              </el-form-item>

              <el-form-item label="成本价">
                <el-input-number
                    v-model="p_cost"
                    :precision="2"
                    controls-position="right"
                    :min="0"></el-input-number>
              </el-form-item>

              <el-form-item label="站点" prop="site">
                <el-select v-model="site" placeholder="请选择">
                  <el-option
                      v-for="item in siteOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>

              <el-form-item label="账号类型" prop="account_type">
                <el-radio-group v-model="account_type">
                  <el-radio label="LOCAL">本土号</el-radio>
                  <el-radio label="CHINA">跨境号</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="店铺类型">
                <el-radio-group v-model="store_type">
                  <el-radio label="NO_STORE">无店铺</el-radio>
                  <el-radio label="BASIC">基础店铺</el-radio>
                  <el-radio label="FEATURED">中级店铺</el-radio>
                  <el-radio label="ANCHOR">高级店铺</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="售价">
                <el-input-number
                    v-model="price"
                    :precision="2"
                    controls-position="right"
                    :min="0"></el-input-number>
              </el-form-item>

              <el-form-item label="运费">
                <el-input-number
                    v-model="postage"
                    :precision="2"
                    controls-position="right"
                    :min="0"></el-input-number>
              </el-form-item>

              <el-form-item label="广告费率">
                <el-slider
                    v-model="ad"
                    show-input>
                </el-slider>
              </el-form-item>

              <el-form-item label="类目" prop="category">
                <el-select placeholder="请选择" style="width: 100%">
                  <el-option
                      v-for="item in categoryList"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>

              <el-form-item label="物流" prop="category">
                <el-select v-model="carrier" placeholder="请选择" style="width: 100%">
                  <el-option
                      v-for="item in carrierList"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>

              <div style="display: flex;justify-content: center">
                <el-button type="primary"
                           style="width: 200px;margin-left: 20px">计算利润
                </el-button>
              </div>

            </el-form>

          </div>
          <!--    右侧-->
          <div class="right_side">
            <div class="sales">
              <div class="main_title">销售</div>
              <div style="display: flex">
                <div class="item_title">币种</div>
                <div class="line"></div>
                <div class="item_price">AUD</div>
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


              <div style="display: flex">
                <div class="item_subtitle">类目佣金 11.77%</div>
                <div class="line"></div>
                <div class="item_sub_price">-$1.65</div>
              </div>

              <div style="display: flex">
                <div class="item_subtitle">固定佣金 0.33/单</div>
                <div class="line"></div>
                <div class="item_sub_price">-$0.33</div>
              </div>

              <div style="display: flex">
                <div class="item_subtitle">广告 10% + 10%GST</div>
                <div class="line"></div>
                <div class="item_sub_price">-$1.54</div>
              </div>

              <div class="total_line"></div>

              <div style="display: flex; justify-content: right">
                <div>结算</div>
                <div style="margin-left: 50px">$10.33</div>
              </div>

            </div>

            <div class="sales">
              <div class="main_title">结汇</div>
              <div style="display: flex">
                <div class="item_title">汇率 20240430</div>
                <div class="line"></div>
                <div class="item_price">4.74</div>
              </div>

              <div style="display: flex">
                <div class="item_title">结汇金额</div>
                <div class="line"></div>
                <div class="item_price">$10.33</div>
              </div>

              <div style="display: flex">
                <div class="item_subtitle">手续费 1%</div>
                <div class="line"></div>
                <div class="item_sub_price">-$0.10</div>
              </div>

              <div class="total_line"></div>

              <div style="display: flex; justify-content: right">
                <div>人民币收款</div>
                <div style="margin-left: 50px">¥48.96</div>
              </div>

            </div>

            <div class="sales">
              <div class="main_title">利润</div>
              <div style="display: flex">
                <div class="item_title">产品成本</div>
                <div class="line"></div>
                <div class="item_price">¥12</div>
              </div>

              <div style="display: flex">
                <div class="item_title">运费</div>
                <div class="line"></div>
                <div class="item_price">见列表</div>
              </div>

              <div class="total_line"></div>

              <div>
                <el-table
                    :header-cell-style="{background:'#eef1f6'}"
                    :data="shippingCostList"
                    size="mini"
                    style="width: 100%;">
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
                      <div>{{ scope.row.area }}</div>
                    </template>
                  </el-table-column>
                  <el-table-column
                      label="计费重量"
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
                      <div>{{ scope.row.cost }}</div>
                    </template>
                  </el-table-column>
                  <el-table-column
                      label="利润"
                      align="center"
                      header-align="center">
                    <template slot-scope="scope">
                      <div>{{ scope.row.profit }}</div>
                    </template>
                  </el-table-column>


                </el-table>
              </div>

            </div>

          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="OZON" name="ozon">ozon</el-tab-pane>

    </el-tabs>
  </div>
</template>

<script>
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
      account_type: 'LOCAL', //账号类型
      store_type: 'FEATURED', //店铺类型
      price: null, //售价
      postage: null, //运费
      carrier: '0', //物流
      ad: 0, //广告
      category: {
        category_id: null,
        fixed_fee0: null,
        fixed_fee1: null,
        fee0: null,
        fee1: null,
        fee2: null,
        fee3: null,
      }, //类目
      siteOptions: [{
        value: 'AU',
        label: '澳洲'
      }, {
        value: 'UK',
        label: '英国'
      }],
      categoryList: [{
        value: '1',
        label: 'Technology devices -- Vintage Movie & Photography(复古电影和摄影)'
      }, {
        value: '2',
        label: 'Technology accessories -- Computer Cables & Connectors(计算机电缆和连接器)'
      }],
      carrierList: [{
        value: '0',
        label: '全部物流'
      },{
        value: '1',
        label: 'UBI澳邮挂号'
      }, {
        value: '2',
        label: 'Fastway'
      }, {
        value: '3',
        label: '中通-澳邮信封'
      }],
      shippingCostList:[
        {
          name: 'Fastway',
          area: '1区',
          calc_weight: 0.1,
          cost: 24,
          profit: 10,
        },
        {
          name: 'Fastway',
          area: '2区',
          calc_weight: 0.1,
          cost: 25,
          profit: 9,
        },
        {
          name: 'Fastway',
          area: '3区',
          calc_weight: 0.1,
          cost: 26,
          profit: 8,
        },
        {
          name: '中通-澳邮信封',
          area: '不分区',
          calc_weight: 0.1,
          cost: 18,
          profit: 12,
        },
        {
          name: 'UBI澳邮挂号',
          area: '1区',
          calc_weight: 0.1,
          cost: 28,
          profit: 5,
        },
      ],

    }
  },
  filters:{
    //外汇金额格式化
    dollar_currency: function (value) {
      if (!value) return 0.00;
      return `$${value.toFixed(2)}`;
    },
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