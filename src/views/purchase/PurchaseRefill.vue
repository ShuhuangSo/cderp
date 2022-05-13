<template>
  <div class="mainList">
    <div class="operate">
      <div>
        <el-input size="small" placeholder="请输入SKU/产品名称搜索"
                  clearable
                  @clear="clearSearchValue"
                  @keyup.enter.native="doSearch"
                  tooltip-effect="dark"
                  v-model="searchValue"
                  style="width: 350px; margin-right: 5px">
          <el-button slot="append" icon="el-icon-search" @click="doSearch">搜索</el-button>
        </el-input>
        <el-button type="primary" icon="el-icon-shopping-cart-2"
                   :disabled="multipleSelection.length===0"
                   @click="createPurchase">生成采购单
        </el-button>
      </div>
      <div>
        <span
            v-if="createTime"
            style="font-size: 12px; color: #919398;margin-right: 10px">更新时间 {{
            this.createTime | datetimeFormat
          }}</span>
        <el-button type="success" icon="el-icon-refresh"
                   :loading="calcLoading"
                   @click="calcRefill">{{ this.calcLoading ? '正在计算' : '重新计算' }}
        </el-button>
        <el-button type="" icon="el-icon-setting"
                   style="margin-right: 5px"
                   @click="calcRefill">
        </el-button>
      </div>
    </div>

    <div style="margin-top: 5px">
      <el-table
          ref="refillTable"
          :data="refillPromote"
          :header-cell-style="{background:'#fafafa'}"
          v-loading="loading"
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
            width="60">
          <template slot-scope="scope">
            <el-image
                style="width: 40px; height: 40px"
                :src="scope.row.image"
                :preview-src-list="[scope.row.image]"
                fit="fill">
            </el-image>
          </template>
        </el-table-column>
        <el-table-column
            prop="sku"
            label="SKU"
            width="80">
        </el-table-column>
        <el-table-column
            prop="p_name"
            label="产品名称"
            min-width="250"
            show-overflow-tooltip>
        </el-table-column>
        <el-table-column
            prop="total_qty"
            label="当前库存"
            align="center"
            header-align="center"
            width="100">
        </el-table-column>
        <el-table-column
            prop="total_lock_qty"
            label="当前锁仓"
            align="center"
            header-align="center"
            width="100">
        </el-table-column>
        <el-table-column
            prop="total_7d_sold"
            label="近7天销量"
            align="center"
            header-align="center"
            width="100">
        </el-table-column>
        <el-table-column
            prop="total_30d_sold"
            label="近30天销量"
            align="center"
            header-align="center"
            width="100">
        </el-table-column>
        <el-table-column
            label="推荐补货"
            align="center"
            header-align="center"
            width="160">
          <template slot-scope="scope">
            <el-input-number v-model="scope.row.qty" :min="1"></el-input-number>
          </template>
        </el-table-column>
        <el-table-column
            label="操作"
            width="120"
            align="center"
            header-align="center"
        >
          <template slot-scope="scope">

            <el-dropdown @command="handleOp">
              <el-button type="text">
                操作<i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :command="{'name':'product',obj:scope.row}">查看产品详情</el-dropdown-item>
                <el-dropdown-item :command="{'name':'no',obj:scope.row}">不再推荐</el-dropdown-item>
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
          :total="total">
      </el-pagination>
    </div>

    <!--    生成采购单弹框-->
    <el-dialog
        title="生成采购单"
        :destroy-on-close="true"
        :visible.sync="dialogVisible"
        width="500">
      <el-form ref="purchaseForm" label-width="180px">
        <el-form-item label="供应商" prop="supplier">
          <el-select v-model="purchaseOrder.supplier" placeholder="请选择" class="inputwidth">
            <el-option
                v-for="item in suppliers"
                :key="item.id"
                :label="item.supplier_name"
                :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="收货仓库/店铺" prop="store">
          <el-select v-model="purchaseOrder.store"
                     @change="selectStore"
                     placeholder="请选择" class="inputwidth">
            <el-option
                v-for="item in stores"
                :key="item.id"
                :label="item.store_name"
                :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="收货人" v-if="purchaseOrder.store">
          <el-input
              class="inputwidth"
              placeholder="请输入收货联系人"
              v-model="purchaseOrder.rec_name">
          </el-input>
        </el-form-item>

        <el-form-item label="电话" v-if="purchaseOrder.store">
          <el-input
              class="inputwidth"
              placeholder="请输入联系电话"
              v-model="purchaseOrder.rec_phone">
          </el-input>
        </el-form-item>

        <el-form-item label="收货地址" v-if="purchaseOrder.store">
          <el-input
              placeholder="请输入收货地址"
              v-model="purchaseOrder.rec_address">
          </el-input>
        </el-form-item>

      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="dialogVisible = false">取 消</el-button>
    <el-button type="primary"
               :disabled="!purchaseOrder.supplier || !purchaseOrder.store"
               @click="submitForm">确 定</el-button>

  </span>
    </el-dialog>

    <!--      产品详情弹框-->
    <el-dialog
        title="产品详情"
        :visible.sync="productDetailVisible"
        :destroy-on-close="true"
        :close-on-click-modal="false"
        top="20px"
        width="1200px"
    >
      <div>
        <product-detail ref="productDetail"
                        :key="timer"
                        :productID="productID"></product-detail>
      </div>
      <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="closeProductDetail">关 闭</el-button>
        </span>
    </el-dialog>

  </div>
</template>

<script>
import moment from "moment";
import ProductDetail from "@/components/product/ProductDetail";

export default {
  name: "PurchaseRefill",
  data() {
    return {
      refillPromote: [],
      createTime: null,
      total: 0, // 总条数
      page: 1,  // 当前页
      size: 20,  // 页大小
      searchValue: '',
      loading: false,
      calcLoading: false,
      dialogVisible: false,
      productDetailVisible: false,
      productID: null,
      multipleSelection: [], // 选中行
      suppliers: [], // 供应商列表
      stores: [], //仓库列表
      ids: [],
      timer: '',
      purchaseOrder: {
        supplier: null,
        store: null,
        postage: 0,
        note: '',
        sup_tips: '',
        order_status: '',
        inner_case_price: 0,
        purchase_detail: [],
        rec_name: '',
        rec_phone: '',
        rec_address: ''
      },
    }
  },
  components:{
    ProductDetail
  },
  mounted() {
    this.initRefillPromote();
    this.initBasicSetting();
  },
  filters: {
    //日期时间格式化
    datetimeFormat: function (date) {
      if (date == undefined) {
        return ''
      }
      return moment(date).format("YYYY年MM月DD日 HH:mm:ss");
    },
  },
  methods: {
    //生成采购单
    createPurchase() {
      this.dialogVisible = true
    },

    //  提交新建采购单
    submitForm() {
      this.$confirm('是否确认生成采购单？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.purchaseOrder.order_status = 'PRE_SUMMIT';
        this.multipleSelection.forEach(item => {
          this.purchaseOrder.purchase_detail.push({
            'qty': item.qty,
            'is_supply_case': false,
            'short_note': '',
            'product_id': item.product,
            'urgent': false,
            'unit_cost': item.unit_cost
          });
          this.ids.push(item.id) // 重置采购推荐数量的id组
        })

        this.loading = true;
        this.postRequest('api/purchase_orders/', this.purchaseOrder).then(resp => {
          if (resp) {
            this.postRequest('api/refill_promote/re_set/', {'ids': this.ids}).then(rp => {
              if (rp) {
                this.loading = false;
                this.$router.push({
                  path: '/createPurchase',
                  query: {
                    id: resp.id
                  }
                });
              }
            })

          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        });
      });

    },

    // 选择仓库回调
    selectStore(value) {
      let st = this.stores.find(item => {
        return item.id === value;
      });
      this.purchaseOrder.rec_name = st.contact_name;
      this.purchaseOrder.rec_phone = st.phone;
      this.purchaseOrder.rec_address = st.address;
    },

    //操作
    handleOp(command) {
      //不再推荐
      if (command.name === 'no') {
        this.$confirm('是否将不再推荐此产品补货？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.patchRequest('/api/products/' + command.obj.product + '/', {'is_auto_promote': false}).then(resp => {
            this.$message.success('操作成功')
            this.initRefillPromote();
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消'
          });
        });
      }
      //查看产品详情
      if (command.name === 'product') {
        this.productID = command.obj.product
        this.timer = new Date().getTime();
        this.productDetailVisible = true
      }
    },
    //选行
    handleSelectionChange(val) {
      this.multipleSelection = val;

    },
    //关闭产品详情对话框
    closeProductDetail(){
      this.productDetailVisible = false
      this.productID = null
    },

    // 搜索
    doSearch() {
      this.$refs.refillTable.clearFilter();
      this.initRefillPromote();
    },
    // 重置搜索内容
    clearSearchValue() {
      this.searchValue = '';
      this.initRefillPromote();
    },

    // 分页大小
    sizeChange(size) {
      this.size = size;
      this.initRefillPromote();
    },
    // 页码
    currentChange(page) {
      this.page = page;
      this.initRefillPromote();
    },

    //重新计算推荐数量
    calcRefill() {
      this.calcLoading = true
      this.getRequest('api/refill_promote/re_calc/').then(resp => {
        if (resp) {
          this.initRefillPromote();
          this.calcLoading = false
        }
      })
    },

    // 初始化初始设置信息
    initBasicSetting() {
      //获取所有可选供应商
      if (window.sessionStorage.getItem('suppliers')) {
        this.suppliers = JSON.parse(window.sessionStorage.getItem('suppliers'));
      } else {
        this.getRequest('api/suppliers/?page_size=1000').then(resp => {
          if (resp.results) {
            this.suppliers = resp.results;
            window.sessionStorage.setItem('suppliers', JSON.stringify(this.suppliers));
          }
        })
      }
      //获取所有可选仓库
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

    },

    //初始化推荐数据
    initRefillPromote() {
      let url = '/api/refill_promote/?page=' + this.page + '&page_size=' + this.size
      if (this.searchValue) {
        url += '&search=' + this.searchValue;
      }
      this.loading = true
      this.getRequest(url).then(resp => {
        this.loading = false
        if (resp) {
          this.refillPromote = resp.results;
          this.createTime = this.refillPromote[0].create_time
          this.total = resp.count
        }
      })
    }

  }
}
</script>

<style scoped>
.mainList {
  padding: 10px;
  background-color: white;
  margin-top: 10px;
}

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

.inputwidth {
  width: 220px;
}
</style>