<template>
  <el-container style="height: 100%">
    <el-aside width="500px" class="aside" v-if="!dialogVisible">
      <div style="display: flex;justify-content: center">
        <h3>{{ this.storeName }}</h3>
      </div>
      <el-divider></el-divider>

      <div>
        <el-select v-model="order.customer"
                   filterable
                   remote
                   default-first-option
                   clearable
                   :remote-method="searchCustomer"
                   :loading="loading"
                   @change="selectCustomer"
                   @clear="clearCustomer"
                   style="width: 100%;"
                   placeholder="请选择客户">
          <el-option
              v-for="item in customers"
              :key="item.id"
              :label="item.company_name"
              :value="item.id">
            <span style="float: left">{{ item.company_name }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{ item.customer_code }}</span>
          </el-option>
        </el-select>

        <el-card shadow="never" style="margin-top: 10px">
          <div>
            <el-descriptions :colon="false" :column=1 size="medium" title="客户信息">
              <el-descriptions-item label="客户编号:">{{ this.currentCustomer.customer_code }}</el-descriptions-item>
              <el-descriptions-item label="客户名称:">{{ this.currentCustomer.company_name }}</el-descriptions-item>
              <el-descriptions-item label="结算方式:">{{ this.currentCustomer.pay_way | payWay }}</el-descriptions-item>
              <el-descriptions-item label="客户级别:">
                <el-rate style="margin-top: 2px" disabled v-model="currentCustomer.level"></el-rate>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>

        <!--            折扣优惠信息-->
        <el-table
            :header-cell-style="{background:'#eef1f6'}"
            :data="currentCustomer.customer_discount"
            empty-text="无折扣"
            border
            size="mini"
            style="width: 100%; margin-top: 10px">
          <el-table-column
              prop="series_name"
              label="产品系列"
              align="center"
              header-align="center">
          </el-table-column>
          <el-table-column
              prop="discount_type"
              label="折扣类型"
              align="center"
              header-align="center">
            <template slot-scope="scope">
              <el-tag :type="scope.row.discount_type===1? 'success':'warning'">
                {{ scope.row.discount_type | discountType }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
              :formatter="moneyFormat"
              prop="discount_money"
              label="优惠金额"
              align="center"
              header-align="center">
          </el-table-column>
          <el-table-column
              :formatter="percentFormat"
              prop="discount_percent"
              label="优惠比例"
              align="center"
              header-align="center">
          </el-table-column>
        </el-table>
      </div>

    </el-aside>
    <el-main style="padding: 0" v-if="!dialogVisible">
      <div class="box">

      </div>
    </el-main>

    <el-dialog
        title="请选择店铺"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :show-close="false"
        :visible.sync="dialogVisible"
        width="30%">
      <el-select v-model="order.store"
                 style="width: 100%;"
                 placeholder="请选择">
        <el-option
            v-for="item in stores"
            :key="item.id"
            :label="item.store_name"
            :value="item.id">
        </el-option>
      </el-select>
      <span slot="footer" class="dialog-footer">
    <el-button @click="cancel">取 消</el-button>
    <el-button type="primary" @click="selectStore">确 定</el-button>
  </span>
    </el-dialog>
  </el-container>
</template>

<script>
export default {
  name: "OrderPOS",
  filters: {
    //结算方式信息格式化
    payWay: function (value) {
      if (value === 'PAY_NOW') {
        return '现结'
      }
      if (value === 'CONTRACT') {
        return '约定付款'
      }
      return '';
    },
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

  data() {
    return {
      stores: [], // 仓库列表
      customers: [], //客户列表
      storeName: '', // 当前仓库名称
      currentCustomer: {},
      dialogVisible: false,
      loading: false,
      order: {
        store: 1,
        customer: null,
        mode: 'POS',
        pay_way: '',
      }
    }
  },
  mounted() {
    this.initStores();
    this.dialogVisible = true;
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
      return value + "%";
    },

    // 清除客户时的回调
    clearCustomer() {
      this.currentCustomer = {};
    },

    //选中客户时回调
    selectCustomer(value) {
      if (value) {
        let cs = this.customers.find(item => {
          return item.id === value
        })
        this.order.pay_way = cs.pay_way;
        this.currentCustomer = cs;

      }
    },

    //搜索客户
    searchCustomer(query) {
      if (query !== '') {
        this.getRequest('api/customers/?search=' + query).then(resp => {
          if (resp.results) {
            this.customers = resp.results;
          }
        })
      } else {
        this.customers = [];
      }

    },

    //选择店铺
    selectStore() {
      let st = this.stores.find(item => {
        return item.id === this.order.store;
      })
      this.storeName = st.store_name;
      this.dialogVisible = false;
    },

    //取消选择仓库
    cancel(){
      this.$router.push('/home')
    },

    // 初始化所有可选仓库
    initStores() {

      if (window.sessionStorage.getItem('stores')) {
        this.stores = JSON.parse(window.sessionStorage.getItem('stores'));
      } else {
        this.getRequest('api/stores/?page_size=1000').then(resp => {
          if (resp.results) {
            this.stores = resp.results;
            window.sessionStorage.setItem('stores', JSON.stringify(this.stores));
          }
        })
      }

    }

  }
}
</script>

<style scoped>
.aside {
  padding-left: 15px;
  padding-right: 15px;
  height: 100%;
  background: #ffffff;
}

.box {
  height: 100%;
  margin: 0 0 0 10px;
  background: #ffffff;
}
</style>