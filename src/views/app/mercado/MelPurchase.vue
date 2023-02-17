/*
美客多采购管理
*/
<template>
  <div>

    <div class="operate">
      <div class="filter">
        <div>

            <el-button size="small" :type="p_status==='WAITBUY'?'primary':''" @click="changeStatus('WAITBUY')">待采购</el-button>
            <span class="jiantou"><i class="el-icon-d-arrow-right"></i></span>

            <el-button size="small" :type="p_status==='PURCHASED'?'primary':''" @click="changeStatus('PURCHASED')">已采购</el-button>
          <span class="jiantou"><i class="el-icon-d-arrow-right"></i></span>

            <el-button size="small" :type="p_status==='RECEIVED'?'primary':''" @click="changeStatus('RECEIVED')">已到货</el-button>
          <span class="jiantou"><i class="el-icon-d-arrow-right"></i></span>

          <el-button size="small" :type="p_status==='PACKED'?'primary':''" @click="changeStatus('PACKED')">已打包</el-button>
          <span class="jiantou"><i class="el-icon-d-arrow-right"></i></span>
          <el-button size="small" :type="p_status==='USED'?'primary':''" @click="changeStatus('USED')">已出库</el-button>

        </div>
      </div>
      <div class="filter">

      </div>

      <div class="filter">
        <div>
          <el-input size="small" placeholder="SKU 产品名称 ItemID"
                    clearable
                    @clear="clearSearchValue"
                    @keyup.enter.native="doSearch"
                    v-model="searchValue"
                    style="width: 350px; margin-right: 5px">
            <el-button slot="append" icon="el-icon-search" @click="doSearch">搜索</el-button>
          </el-input>
          <el-badge  :hidden="!multipleSelection.length" :value="multipleSelection.length" class="item">
            <el-button :disabled="!multipleSelection.length" @click="buyVisible=true" type="primary" plain>下单采购</el-button>
          </el-badge>

        </div>

        <el-dropdown @command="handleCommand">
          <el-button type="success">
            新增采购<i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="sys">自动拉取</el-dropdown-item>
            <el-dropdown-item command="manuel">手动添加</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>

    <div style="margin-top: 5px">
      <el-table
          ref="purchaseTable"
          :data="purchaseList"
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
              <el-tag v-if="scope.row.s_type==='NEW'" type="success" size="mini" effect="dark">新入仓</el-tag>
            </div>
            <div>{{ scope.row.p_name }}</div>
            <div>
              <span style="margin-right: 5px" v-if="scope.row.create_type==='MANUAL'">
              <el-tag type="warning" size="mini" effect="plain">手动</el-tag>
              </span>
              <span class="plan3" v-if="scope.row.need_qty === scope.row.buy_qty">
                <i class="el-icon-circle-check"></i> 运单需求 {{ scope.row.need_qty }}</span>
              <span class="plan1" v-if="scope.row.need_qty !== scope.row.buy_qty">
                <i class="el-icon-warning-outline"></i> 运单需求 {{ scope.row.need_qty }}</span>
              <span class="plan2" v-if="scope.row.need_qty === 0">
                <i class="el-icon-circle-close"></i> 运单需求 无</span>

              <span class="plan4" v-if="scope.row.total_onway_qty">
                在途 {{ scope.row.total_onway_qty }}</span>
              <span class="plan4" v-if="scope.row.total_rec_qty">
                库存 {{ scope.row.total_rec_qty }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column
            label="成本价"
            align="center"
            header-align="center"
            width="80">
          <template slot-scope="scope">
            <div>{{ scope.row.unit_cost | currency}}</div>
          </template>
        </el-table-column>

        <el-table-column
            v-if="p_status==='WAITBUY'"
            label="采购数量"
            align="center"
            header-align="center"
            width="160">
          <template slot-scope="scope">
            <el-input-number v-model="scope.row.buy_qty" :min="1"></el-input-number>
          </template>
        </el-table-column>

        <el-table-column
            v-if="p_status==='PURCHASED'"
            label="采购数量"
            align="center"
            header-align="center"
            width="160">
          <template slot-scope="scope">
            <div>{{ scope.row.buy_qty}}</div>
          </template>
        </el-table-column>

        <el-table-column
            label="源批次|店铺"
            align="center"
            header-align="center"
            width="150">
          <template slot-scope="scope">
            <div>{{ scope.row.from_batch }}</div>
            <div style="margin-top: 5px">
              <el-tag
                  style="border: none"
                  :color="scope.row.shop_color?scope.row.shop_color:'#539acd'"
                  effect="dark" type="info">
                <span style="font-weight: bold">{{ scope.row.shop}}</span>
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column
            width="180"
            label="简要备注"
            show-overflow-tooltip>
          <template slot-scope="scope">
            <div>{{ scope.row.note }}</div>
          </template>
        </el-table-column>

        <el-table-column
            :label="timeLabel"
            align="center"
            header-align="center"
            width="150">
          <template slot-scope="scope">
            <div v-if="p_status==='WAITBUY'">{{ scope.row.create_time | date}}</div>
            <div v-if="p_status==='PURCHASED'">{{ scope.row.buy_time | date}}</div>
          </template>
        </el-table-column>

        <el-table-column
            align="center"
            header-align="center"
            label="操作"
            width="50"
        >
          <template slot-scope="scope">
            <el-dropdown @command="handleProductOp">
              <el-button type="text">
                <i class="el-icon-more"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :command="{type:'editQty', obj:scope.row}">知会更新</el-dropdown-item>
                <el-dropdown-item :command="{type:'delete', id:scope.row.id}">删除</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
    </div>

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

    <!--    下单采购弹窗-->
    <el-dialog
        title="采购列表"
        :visible.sync="buyVisible"
        :destroy-on-close="true"
        :close-on-click-modal="false"
        width="1000px"
    >
      <div>
        <el-checkbox v-model="changPrice">修改并同步价格到产品库</el-checkbox>
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
              show-overflow-tooltip>
            <template slot-scope="scope">
              <div style="font-weight: bold">{{ scope.row.sku }}</div>
              <div>{{ scope.row.p_name }}</div>
              <div>
                <span class="plan3" v-if="scope.row.need_qty === scope.row.buy_qty">
                <i class="el-icon-circle-check"></i> 运单需求 {{ scope.row.need_qty }}</span>
                <span class="plan1" v-if="scope.row.need_qty !== scope.row.buy_qty">
                <i class="el-icon-warning-outline"></i> 运单需求 {{ scope.row.need_qty }}</span>
                <span class="plan2" v-if="scope.row.need_qty === 0">
                <i class="el-icon-circle-close"></i> 运单需求 无</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column
              label="成本价"
              align="center"
              header-align="center"
              width="160">
            <template slot-scope="scope">
              <div v-if="!changPrice">{{ scope.row.unit_cost | currency}}</div>
              <div v-if="changPrice"><el-input-number v-model="scope.row.unit_cost" :precision="2" :min="0.01"></el-input-number></div>
            </template>
          </el-table-column>

          <el-table-column
              label="采购数量"
              align="center"
              header-align="center"
              width="160">
            <template slot-scope="scope">
              <el-input-number v-model="scope.row.buy_qty" :min="1"></el-input-number>
            </template>
          </el-table-column>

        </el-table>
      </div>
      <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="buyVisible=false">取 消</el-button>
          <el-button size="small" type="primary" @click="summitBuy">确认下单</el-button>
        </span>
    </el-dialog>


  </div>
</template>

<script>
import moment from "moment/moment";

export default {
  name: "MelPurchase",
  data() {
    return {
      purchaseList: [],
      loading: false,
      total: 0, // 总条数
      page: 1,  // 当前页
      size: 20,  // 页大小
      searchValue: '',
      p_status: 'WAITBUY',// 筛选状态
      multipleSelection: [], // 选中行
      changPrice: false, // 修改并同步价格到产品库
      buyVisible: false, // 下单采购弹窗
    }
  },
  computed: {
    // 时间名称
    timeLabel() {
      if (this.p_status === 'WAITBUY') return '更新时间'
      if (this.p_status === 'PURCHASED') return '采购时间'
      if (this.p_status === 'RECEIVED') return '到货时间'
      if (this.p_status === 'PACKED') return '打包时间'
      if (this.p_status === 'USED') return '出库时间'
      return ''
    },
  },
  filters: {
    //rmb金额格式化
    currency: function (value) {
      if (!value) return 0.00;
      return `¥${value.toFixed(2)}`;
    },
    //时间日期格式化
    date: function (value) {
      return moment(value).format("YYYY-MM-DD HH:mm");
    },
    //图片地址格式化
    smpic: function (value) {
      if (!value) return '';
      let url = value.slice(0, value.length-4)
      return url + '_100x100.jpg/?' + Math.random()
    },
  },
  mounted() {
    this.initPurchaseList()
  },
  methods:{
    handleProductOp(command){
      // 产品删除
      if (command['type'] === 'delete') {
        this.$confirm('是否删除产品?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          //调用删除产品
          this.deleteRequest('api/ml_purchase/' + command['id'] + '/').then(resp => {
            this.initPurchaseList();
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消删除'
            });
          });
        })
      }
    },
    getRowKeys(row){
      return row.id
    },
    // 处理多选
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    // 改变筛选状态
    changeStatus(value){
      this.page = 1;
      this.p_status = value
      this.$refs.purchaseTable.clearSelection() //清除选中的数据
      this.initPurchaseList()
    },

    //新增采购
    handleCommand(command) {
      if (command === 'sys') this.pullPurchase()
    },
    // 重置搜索内容
    clearSearchValue() {
      this.searchValue = '';
      this.initPurchaseList();
    },
    // 搜索
    doSearch() {
      this.page = 1;
      this.$refs.purchaseTable.clearFilter();
      this.initPurchaseList();
    },
    // 分页大小
    sizeChange(size) {
      this.page = 1;
      this.size = size;
      this.initPurchaseList();
    },
    // 页码
    currentChange(page) {
      this.page = page;
      this.initPurchaseList();
    },
    //提交下单采购
    summitBuy(){
      this.postRequest('api/ml_purchase/place_buy/', {'products':this.multipleSelection, 'is_change': this.changPrice}).then(resp => {
        if (resp) {
          this.buyVisible = false
          this.changPrice = false
          this.multipleSelection = []
          this.$refs.purchaseTable.clearSelection() //清除选中的数据
          this.initPurchaseList();
        }
      })
    },
    //自动拉取采购产品
    pullPurchase(){
      this.loading = true
      this.getRequest('/api/ml_purchase/pull_purchase/').then(resp => {
        this.loading = false
        if (resp) {
          this.initPurchaseList();
        }
      })
    },
    //初始化采购列表
    initPurchaseList() {
      let url = '/api/ml_purchase/?page=' + this.page + '&page_size=' + this.size
      if (this.searchValue) {
        url += '&search=' + this.searchValue;
      }
      url += '&p_status=' + this.p_status
      url += '&ordering=shop,item_id'

      this.loading = true
      this.getRequest(url).then(resp => {
        this.loading = false
        if (resp.results) {
          this.purchaseList = resp.results;
          this.total = resp.count;
        }
      })

      // this.calcShips();
    }
  }
}
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.operate {
  margin-top: 10px;
}
.filter{
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
}
.jiantou{
  margin-left: 5px;
  margin-right: 5px;
  color: #6e7079;
}
.plan1{
  color: darkorange;
}
.plan2{
  color: red;
  font-weight: bold;
}
.plan3{
  color: darkseagreen;
}
.plan4{
  color: #409EFF;
  margin-left: 10px;
}
</style>