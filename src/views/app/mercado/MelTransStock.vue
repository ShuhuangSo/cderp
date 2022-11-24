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
          <el-button :disabled="!multipleSelection.length" type="primary">FBM发仓</el-button>
        </el-badge>

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
                :src="scope.row.image"
                :preview-src-list="[scope.row.image]"
                fit="fill">
            </el-image>
          </template>
        </el-table-column>

        <el-table-column
            label="产品"
            show-overflow-tooltip>
          <template slot-scope="scope">
            <div>{{ scope.row.sku }}</div>

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
            label="重量 | 体积">
          <template slot-scope="scope">
            {{ scope.row.box_weight}}
            <el-divider direction="vertical"></el-divider>
            {{ scope.row.box_cbm}}
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
            label="库存">
          <template slot-scope="scope">
            {{ scope.row.qty}}
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

        <el-table-column
            label="状态"
            align="center"
            header-align="center"
            width="100">
          <template slot-scope="scope">
            <el-tag size="small" effect="plain" v-if="scope.row.p_status=='NORMAL'">普通</el-tag>
            <el-tag type="success" size="small" effect="plain" v-if="scope.row.p_status=='HOT_SALE'">热卖</el-tag>
            <el-tag type="danger" size="small" effect="plain" v-if="scope.row.p_status=='OFFLINE'">停售</el-tag>
            <el-tag type="warning" size="small" effect="plain" v-if="scope.row.p_status=='CLEAN'">清仓</el-tag>
          </template>
        </el-table-column>

      </el-table>

      <div class="pagination">
        <el-pagination
            background
            :page-sizes="[10, 30, 40, 50, 100]"
            @current-change="currentChange"
            @size-change="sizeChange"
            layout="sizes, prev, pager, next, jumper, ->, total"
            :total="total">
        </el-pagination>
      </div>
    </div>

  </div>
</template>

<script>
import moment from "moment/moment";

export default {
  name: "MelTransStock",
  data(){
    return{
      shops: null,
      shopID: null,
      shopStocks: null,
      loading: false,
      total: 0, // 总条数
      page: 1,  // 当前页
      size: 10,  // 页大小
      searchValue: '',
      multipleSelection: [] // 选中行
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
  },
  mounted() {
    this.inintShops();
  },
  methods:{
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
        this.getRequest('api/ml_shops/?warehouse_type=TRANSIT&page_size=1000&ordering=create_time').then(resp => {
          if (resp.results) {
            this.shops = resp.results;
            window.sessionStorage.setItem('ml_trans_shops', JSON.stringify(this.shops));
          }
        })
      }
    },
    initTransStock(){
      let url = '/api/ml_trans_stock/?shop=' + this.shopID + '&page=' + this.page + '&page_size=' + this.size
      if (this.searchValue) {
        url += '&search=' + this.searchValue;
      }
      url += '&ordering=-create_time,item_id'

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
</style>