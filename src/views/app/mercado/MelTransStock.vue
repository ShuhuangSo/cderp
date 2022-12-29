/*
美客多FBM--中转仓
*/
<template>
  <div>
    <div class="operate">
      <div>
        <el-input size="small" placeholder="SKU 名称 ItemID UPC ML代码"
                  clearable
                  @clear="clearSearchValue"
                  @keyup.enter.native="doSearch"
                  v-model="searchValue"
                  style="width: 350px; margin-right: 5px">
          <el-button slot="append" icon="el-icon-search" @click="doSearch">搜索</el-button>
        </el-input>
        <el-badge  :hidden="!multipleSelection.length" :value="multipleSelection.length" class="item">
          <el-button :disabled="!multipleSelection.length" @click="fbmVisible=true" type="primary">FBM发仓</el-button>
        </el-badge>

        <el-button style="margin-left: 20px" icon="el-icon-refresh"
                   :disabled="!shopID"
                   @click="initTransStock"></el-button>

      </div>

      <div>
        <el-select v-model="shopID"
                   style="width: 300px;"
                   @change="changeShop" placeholder="请选择中转仓库">
          <el-option
              v-for="item in shops"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            <span style="float: left">{{ item.name }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{ item.nickname }}</span>
          </el-option>
        </el-select>
      </div>
    </div>

    <div style="margin-top: 5px">
      <el-table
          ref="productTable"
          :data="shopStocks"
          :header-cell-style="{background:'#fafafa'}"
          v-loading="loading"
          :row-key="getRowKeys"
          @selection-change="handleSelectionChange"
          style="width: 100%">

        <el-table-column
            :reserve-selection="true"
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
                style="width: 80px; height: 80px"
                :src="scope.row.image | smpic"
                :preview-src-list="[scope.row.image?scope.row.image+'?' + Math.random():'']"
                fit="fill">
            </el-image>
          </template>
        </el-table-column>

        <el-table-column
            label="产品"
            width="300"
            show-overflow-tooltip>
          <template slot-scope="scope">
            <div style="font-weight: bold">{{ scope.row.sku }}
              <el-tag size="mini" @click="selectGroup(scope.row.box_number)" v-if="scope.row.group">拼箱({{scope.row.group}})</el-tag>
              <el-tag size="mini" type="info" effect="dark"
                      style="margin-left: 5px"
                      v-if="scope.row.group">{{scope.row.box_number}}</el-tag>
              <el-link @click.native="copyText(scope.row.sku)"
                       style="margin-left: 5px;margin-bottom: 3px"
                       :underline="false"><i class="el-icon-copy-document"></i></el-link>
            </div>

            <div>{{ scope.row.p_name }}</div>
            <div>{{ scope.row.item_id }}
              <el-link @click.native="copyText(scope.row.item_id)"
                       style="margin-left: 5px;margin-bottom: 2px"
                       :underline="false"><i class="el-icon-copy-document"></i></el-link>
            </div>
          </template>
        </el-table-column>

        <el-table-column
            align="center"
            header-align="center"
            label="所属店铺">
          <template slot-scope="scope">
            <el-tag
                style="margin-right: 5px;border: none"
                :color="scope.row.shop_color?scope.row.shop_color:'#539acd'"
                effect="dark">
              {{ scope.row.listing_shop}}
            </el-tag>

          </template>
        </el-table-column>

        <el-table-column
            width="80"
            align="center"
            header-align="center"
            label="库存">
          <template slot-scope="scope">
            <span class="zz_qty">{{ scope.row.qty}}</span>
          </template>
        </el-table-column>

        <el-table-column
            align="center"
            header-align="center"
            label="入仓批次">
          <template slot-scope="scope">
            {{ scope.row.batch}}
          </template>
        </el-table-column>

        <el-table-column
            align="center"
            header-align="center"
            label="运单编号">
          <template slot-scope="scope">
            {{ scope.row.s_number}}
          </template>
        </el-table-column>

        <el-table-column
            align="center"
            header-align="center"
            label="箱唛号">
          <template slot-scope="scope">
            {{ scope.row.carrier_box_number}}
          </template>
        </el-table-column>

        <el-table-column
            align="center"
            header-align="center"
            width="150"
            label="重量 | 体积">
          <template slot-scope="scope">
            {{ scope.row.box_weight}}
            <el-divider direction="vertical"></el-divider>
            {{ scope.row.box_cbm | cbm}}
          </template>
        </el-table-column>

        <el-table-column
            align="center"
            header-align="center"
            label="到仓日期 | 库龄">
          <template slot-scope="scope">
            {{ scope.row.arrived_date | date}}
            <el-divider direction="vertical"></el-divider>
            {{ scope.row.stock_days}}
          </template>
        </el-table-column>


        <el-table-column
            align="center"
            header-align="center"
            label="均摊成本 | 均摊头程">
          <template slot-scope="scope">
            {{ scope.row.unit_cost | currency}}
            <el-divider direction="vertical"></el-divider>
            {{ scope.row.first_ship_cost | currency}}
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

    <!--    确认发仓产品弹窗-->
    <el-dialog
        title="发仓列表"
        :visible.sync="fbmVisible"
        :destroy-on-close="true"
        :close-on-click-modal="false"
        width="1000px"
    >
      <div>
        <el-table
            ref="fbmTable"
            :data="multipleSelection"
            :header-cell-style="{background:'#fafafa'}"
            style="width: 100%">

          <el-table-column
              label="图片"
              align="center"
              header-align="center"
              width="100">
            <template slot-scope="scope">
              <el-image
                  style="width: 80px; height: 80px"
                  :src="scope.row.image | smpic"
                  :preview-src-list="[scope.row.image]"
                  fit="fill">
              </el-image>
            </template>
          </el-table-column>

          <el-table-column
              label="产品"
              width="300"
              show-overflow-tooltip>
            <template slot-scope="scope">
              <div>{{ scope.row.sku }}
                <el-tag size="mini" v-if="scope.row.group">拼箱({{scope.row.group}})</el-tag>
                <el-tag size="mini" type="info" effect="dark"
                        style="margin-left: 5px"
                        v-if="scope.row.group">{{scope.row.box_number}}</el-tag>
              </div>

              <div>{{ scope.row.p_name }}</div>
              <div>{{ scope.row.item_id }}</div>
            </template>
          </el-table-column>

          <el-table-column
              width="100"
              align="center"
              header-align="center"
              label="所属店铺">
            <template slot-scope="scope">
              <el-tag
                  style="margin-right: 5px;border: none"
                  :color="scope.row.shop_color?scope.row.shop_color:'#539acd'"
                  effect="dark">
                {{ scope.row.listing_shop}}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column
              align="center"
              header-align="center"
              label="运单编号">
            <template slot-scope="scope">
              {{ scope.row.s_number}}
            </template>
          </el-table-column>

          <el-table-column
              align="center"
              header-align="center"
              label="箱唛号">
            <template slot-scope="scope">
              {{ scope.row.carrier_box_number}}
            </template>
          </el-table-column>

          <el-table-column
              width="80"
              align="center"
              header-align="center"
              label="数量">
            <template slot-scope="scope">
              {{ scope.row.qty}}
            </template>
          </el-table-column>

        </el-table>
      </div>
      <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="fbmVisible=false">取 消</el-button>
          <el-button size="small" type="primary" @click="summitFBM">确认发仓</el-button>
        </span>
    </el-dialog>

  </div>
</template>

<script>
import moment from "moment/moment";

export default {
  name: "MelTransStock",
  data(){
    return{
      user: JSON.parse(window.sessionStorage.getItem('user')),
      shops: null,
      shopID: null,
      shopStocks: null,
      loading: false,
      total: 0, // 总条数
      page: 1,  // 当前页
      size: 20,  // 页大小
      searchValue: '',
      multipleSelection: [], // 选中行
      fbmVisible: false, //弹窗
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
    //体积格式化
    cbm: function (value) {
      if (!value) return 0;
      return `${value.toFixed(4)}`;
    },
    //图片地址格式化
    smpic: function (value) {
      if (!value) return '';
      let url = value.slice(0, value.length-4)
      return url + '_100x100.jpg/?' + Math.random()
    },
  },
  mounted() {
    this.inintShops();
  },
  methods:{
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

    //筛选拼箱产品
    selectGroup(num){
      this.searchValue = num
      this.initTransStock();
    },
    //提交fbm送仓
    summitFBM(){
      this.postRequest('api/ml_trans_stock/send_fbm/', this.multipleSelection).then(resp => {
        if (resp) {
          this.fbmVisible = false
          this.multipleSelection = []
          this.initTransStock();
        }
      })
    },
    getRowKeys(row){
      return row.id
    },
    // 处理多选
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },

    // 重置搜索内容
    clearSearchValue() {
      this.searchValue = '';
      this.initTransStock();
    },
    // 搜索
    doSearch() {
      this.page = 1;
      this.$refs.productTable.clearFilter();
      this.initTransStock();
    },
    // 分页大小
    sizeChange(size) {
      this.page = 1;
      this.size = size;
      this.initTransStock();
    },
    // 页码
    currentChange(page) {
      this.page = page;
      this.initTransStock();
    },
    //改变店铺动作
    changeShop(){
      this.page = 1;
      this.initTransStock();
    },
    inintShops(){
      //获取所有可选店铺
      if(window.sessionStorage.getItem('ml_trans_shops')) {
        this.shops = JSON.parse(window.sessionStorage.getItem('ml_trans_shops'));
      }else{
        let url = 'api/ml_shops/?warehouse_type=TRANSIT&page_size=1000&ordering=create_time'
        this.getRequest(url).then(resp => {
          if (resp.results) {
            this.shops = resp.results;
            window.sessionStorage.setItem('ml_trans_shops', JSON.stringify(this.shops));
          }
        })
      }
      if (this.shops.length) {
        this.shopID = this.shops[0].id
        this.filter_name = ''
        this.initTransStock()
      }
    },
    initTransStock(){
      let url = '/api/ml_trans_stock/?shop=' + this.shopID + '&page=' + this.page + '&page_size=' + this.size
      if (this.searchValue) {
        url += '&search=' + this.searchValue;
      }
      if (!this.user.is_superuser) {
        url += '&user_id=' + this.user.id;
      }
      url += '&ordering=arrived_date,item_id'

      this.loading = true
      this.getRequest(url).then(resp => {
        this.loading = false
        if (resp.results) {
          this.shopStocks = resp.results;
          this.total = resp.count;
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
.zz_qty {
  font-weight: bold;
  color: cornflowerblue;
}
</style>