/*
美客多FBM--补货推荐
*/
<template>
  <div>
    <div class="operate">
      <div>
        <el-input size="small" placeholder="SKU 名称 ItemID 订单编号"
                  clearable
                  @clear="clearSearchValue"
                  @keyup.enter.native="doSearch"
                  v-model="searchValue"
                  style="width: 350px; margin-right: 5px">
          <el-button slot="append" icon="el-icon-search" @click="doSearch">搜索</el-button>
        </el-input>
        <el-badge  :hidden="!multipleSelection.length"
                   :value="multipleSelection.length" class="item">
          <el-button icon="el-icon-truck"
                     type="primary"
                     @click="createShip"
                     :disabled="!multipleSelection.length"
                     style="margin-left: 5px">生成运单
          </el-button>
        </el-badge>

      </div>

      <div>
        <el-select v-model="shopID"
                   @change="changeShop"
                   style="width: 300px;margin-right: 10px"
                   placeholder="请选择店铺">
          <el-option
              v-for="item in shops"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            <span style="float: left">{{ item.name }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{ item.nickname }}</span>
          </el-option>
        </el-select>
        <el-select v-model="ship_type"
                   style="width: 80px;margin-right: 10px"
                   placeholder="请选择筛选项">
          <el-option
              v-for="item in ship_group"
              :key="item.name"
              :label="item.name"
              :value="item.value">
          </el-option>
        </el-select>

        <el-date-picker
            v-model="end_date"
            style="width: 130px;margin-right: 10px"
            value-format="yyyy-MM-dd"
            type="date"
            placeholder="截单日期">
        </el-date-picker>

        <el-button icon="el-icon-refresh"
                   type="success"
                   @click="calcRefill"
                   :loading="c_loading"
                   :disabled="!end_date || !shopID"
                   style="margin-right: 10px">补货计算
        </el-button>
      </div>
    </div>

    <div style="margin-top: 5px">
      <el-table
          ref="refillTable"
          :data="refills"
          :header-cell-style="{background:'#fafafa'}"
          v-loading="loading"
          :row-key="getRowKeys"
          @selection-change="handleSelectionChange"
          style="width: 100%">
        <el-table-column
            type="selection"
            width="42">
        </el-table-column>
        <el-table-column
            label="图片"
            align="center"
            header-align="center"
            width="100">
          <template slot-scope="scope">
            <el-image
                style="width: 70px; height: 70px"
                :src="scope.row.image | smpic"
                :preview-src-list="[scope.row.image?scope.row.image+'?' + Math.random():'']"
                fit="fill">
            </el-image>
          </template>
        </el-table-column>

        <el-table-column
            label="产品"
            show-overflow-tooltip>
          <template slot-scope="scope">
            <div style="font-weight: bold">{{ scope.row.sku }}
              <el-link @click.native="copyText(scope.row.sku)"
                       style="margin-bottom: 3px"
                       :underline="false"><i class="el-icon-copy-document"></i></el-link>
            </div>

            <div>{{ scope.row.p_name }}</div>
            <div>{{ scope.row.item_id }}
            </div>
          </template>
        </el-table-column>

        <el-table-column
            align="center"
            header-align="center"
            label="FBM库存 | 在途 | 中转仓">
          <template slot-scope="scope">
            <el-popover
                @show="showTagSelect"
                placement="top"
                width="500"
                trigger="click">
              <MelStockDetail
                  :obj="{'sku': scope.row.sku, 'op_type': 'FINISH'}"
                  :key="timer" v-if="isShow"></MelStockDetail>
              <el-button type="text" slot="reference" class="stock_qty">{{ scope.row.fbm_qty }}</el-button>
            </el-popover>
            <el-divider direction="vertical"></el-divider>
            <el-popover
                @show="showTagSelect"
                placement="top"
                width="500"
                trigger="click">
              <MelStockDetail
                  :obj="{'sku': scope.row.sku, 'op_type': 'ONWAY'}"
                  :key="timer" v-if="isShow"></MelStockDetail>
              <el-button type="text" slot="reference" class="onway_qty">{{ scope.row.onway_qty }}</el-button>
            </el-popover>

            <el-divider direction="vertical"></el-divider>
            <el-popover
                @show="showTagSelect"
                placement="top"
                width="500"
                trigger="click">
              <MelStockDetail
                  :obj="{'sku': scope.row.sku, 'op_type': 'TRANS'}"
                  :key="timer" v-if="isShow"></MelStockDetail>
              <el-button type="text" slot="reference" class="zz_qty">{{ scope.row.trans_qty }}</el-button>
            </el-popover>
          </template>
        </el-table-column>

        <el-table-column
            label="销量">
          <template slot-scope="scope">
            <div>7天销量: <span class="zi">{{scope.row.days7_sold}} </span>
            </div>
            <div>15天销量: <span class="zi">{{scope.row.days15_sold}} </span>
            </div>
            <div>30天销量: <span class="zi">{{scope.row.days30_sold}} </span>
            </div>
            <div>累计销量: <span class="zi">{{scope.row.all_sold}}</span></div>
          </template>
        </el-table-column>

        <el-table-column
            label="日均销量"
            align="center"
            header-align="center"
            width="80">
          <template slot-scope="scope">
            <div>{{ scope.row.avg_sale | num }}</div>
          </template>
        </el-table-column>

        <el-table-column
            label="库存维持"
            align="center"
            header-align="center"
            width="80">
          <template slot-scope="scope">
            <div>{{ scope.row.keep_days | keep }}</div>
          </template>
        </el-table-column>

        <el-table-column
            label="备货情况"
            align="center"
            header-align="center"
            width="180">
          <template slot-scope="scope">
            <div>运单备货：{{ scope.row.prepare_qty }}</div>
            <div>采购到货：{{ scope.row.own_qty }}</div>
          </template>
        </el-table-column>

        <el-table-column
            label="补货建议"
            align="center"
            header-align="center"
            width="180">
          <template slot-scope="scope">
            <div v-if="scope.row.min_send !== scope.row.full_send">建议数量：{{ scope.row.min_send }}~{{ scope.row.full_send }}</div>
            <div v-if="scope.row.min_send === scope.row.full_send">建议数量：{{ scope.row.min_send }}</div>
            <div>{{ scope.row.advice }}</div>
          </template>
        </el-table-column>

        <el-table-column
            label="补货数量"
            align="center"
            header-align="center"
            width="160">
          <template slot-scope="scope">
            <el-input-number v-model="scope.row.qty" :min="0"></el-input-number>
          </template>
        </el-table-column>

      </el-table>

      <div class="pagination">
        <el-pagination
            background
            :page-sizes="[20, 30, 40, 50, 100]"
            @current-change="currentChange"
            @size-change="sizeChange"
            layout="sizes, prev, pager, next, jumper, ->, total"
            :current-page="page"
            :total="total">
        </el-pagination>
      </div>
    </div>

  </div>
</template>

<script>

import MelStockDetail from "@/components/app/mercado/MelStockDetail";

export default {
  name: "MelRefill",
  components:{MelStockDetail},
  data(){
    return{
      refills: [],
      loading: false,
      c_loading: false,
      total: 0, // 总条数
      page: 1,  // 当前页
      size: 20,  // 页大小
      searchValue: '',
      shopID: '',
      shops: null,
      end_date: '',
      ship_type: 'FLY',
      ship_group: [
        {
          name: '空运',
          value: 'FLY'
        },
        {
          name: '海运',
          value: 'SEA'
        },
      ],
      timer: '',
      isShow: true,
      multipleSelection: [], // 选中行
    }
  },
  filters: {
    //图片地址格式化
    smpic: function (value) {
      if (!value) return '';
      let url = value.slice(0, value.length-4)
      return url + '_100x100.jpg/?' + Math.random()
    },
    //rmb金额格式化
    num: function (value) {
      if (!value) return 0;
      return value.toFixed(2)
    },
    //维持天数格式化
    keep: function (value) {
      if (!value) return 0;
      return `${value}天`;
    },
  },
  mounted() {
    this.inintShops()

  },
  methods:{
    // 生成发货运单
    createShip(){
      this.$confirm('是否确认生成运单?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let shopName = ''
        let platform = ''
        this.shops.forEach(item =>{
          if (this.shopID === item.id) {
            shopName = item.name
            platform = item.platform
          }
        })
        let ship = {
          target: 'FBM',
          shop: shopName,
          platform: platform,
          ship_type: this.ship_type === 'FLY'?'空运':'海运',
          carrier: '',
          end_date: this.end_date,
          ship_date: '',
          note: '',
          all_see: false,
          ship_detail: [],
        }
        this.multipleSelection.forEach(item => {
          ship.ship_detail.push({
            'qty': item.qty,
            'sku': item.sku,
            'p_name': item.p_name,
            'item_id': item.item_id,
            'image': item.image,
            'shop': this.shopID,
            'note': '',
            's_type': 'REFILL'
          });
        })
        this.$router.push({
          path: '/createShip',
          query: {
            obj: JSON.stringify(ship)
          }
        });
      })
    },
    // 补货计算
    calcRefill(){
      let data = {'shop_id': this.shopID, 'ship_type': this.ship_type, 'end_date': this.end_date}
      this.c_loading = true
      this.postRequest('/api/ml_refill/create_refill/', data).then(resp => {
        this.c_loading = false
        if (resp) {
          this.initRefills()
        }
      })
    },
    //切换选择店铺
    changeShop(){
      this.$refs.refillTable.clearSelection() //清除选中的数据
      this.refills = []
    },
    getRowKeys(row){
      return row.id
    },
    // 处理多选
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    //触发子组件更新
    showTagSelect(){
      this.isShow = false;
      this.timer = new Date().getTime();
      this.isShow = true;
    },
    //点击复制
    copyText(value){
      let text = value;
      if (navigator.clipboard) {
        // clipboard api 复制
        navigator.clipboard.writeText(text);
      } else {
        let textarea = document.createElement('textarea');
        document.body.appendChild(textarea);
        // 隐藏此输入框
        textarea.style.position = 'fixed';
        textarea.style.clip = 'rect(0 0 0 0)';
        textarea.style.top = '10px';
        // 赋值
        textarea.value = text;
        // 选中
        textarea.select();
        // 复制
        document.execCommand('copy', true);
        // 移除输入框
        document.body.removeChild(textarea);
      }
      this.$message.success('已复制！')
    },
    // 重置搜索内容
    clearSearchValue() {
      this.searchValue = '';
      this.initRefills();
    },
    // 搜索
    doSearch() {
      this.page = 1;
      this.$refs.refillTable.clearFilter();
      this.initRefills();
    },
    // 分页大小
    sizeChange(size) {
      this.page = 1;
      this.size = size;
      this.initRefills();
    },
    // 页码
    currentChange(page) {
      this.page = page;
      this.initRefills();
    },
    inintShops(){
      //获取所有可选店铺
      if(window.sessionStorage.getItem('ml_shops')) {
        this.shops = JSON.parse(window.sessionStorage.getItem('ml_shops'));
      }else{
        let url = 'api/ml_shops/?warehouse_type=FBM&page_size=1000&ordering=create_time'

        this.getRequest(url).then(resp => {
          if (resp.results) {
            this.shops = resp.results;
            window.sessionStorage.setItem('ml_shops', JSON.stringify(this.shops));

          }
        })
      }

    },
    //初始化数据
    initRefills(){
      let url = '/api/ml_refill/?shop=' + this.shopID + '&page=' + this.page + '&page_size=' + this.size
      if (this.searchValue) {
        url += '&search=' + this.searchValue;
      }
      this.loading = true
      this.getRequest(url).then(resp => {
        this.loading = false
        if (resp.results) {
          this.refills = resp.results;
          this.total = resp.count;
          if (this.refills.length) {
            this.refills.forEach(item=>{
              item['qty'] = 10
            })
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.operate {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
}
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}
.stock_qty {
  font-weight: bold;
  color: teal;
}
.onway_qty {
  font-weight: bold;
  color: #E6A23C;
}
.zi {
  font-weight: bold;
  color: green;
}
.zz_qty {
  font-weight: bold;
  color: cornflowerblue;
}
</style>