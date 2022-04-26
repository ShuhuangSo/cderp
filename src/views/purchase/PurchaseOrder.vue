<template>
  <div class="purchaseOrderList">

    <div class="operate">
      <div>
        <el-input size="small" placeholder="请输入批次号搜索"
                  clearable
                  @clear="clearSearchValue"
                  @keyup.enter.native="doSearch"
                  v-model="searchValue"
                  style="width: 350px; margin-right: 5px">
          <el-button slot="append" icon="el-icon-search" @click="doSearch">搜索</el-button>
        </el-input>
      </div>
      <div class="filter">
        <div>
          <el-radio-group v-model="orderStatus" style="margin-right: 20px" @change="initPurchaseOrder">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button label="WAIT_CONFIRM">待确认</el-radio-button>
            <el-radio-button label="IN_PRODUCTION">生产中</el-radio-button>
            <el-radio-button label="SENT">已发货</el-radio-button>
            <el-radio-button label="PART_SENT">部分发货</el-radio-button>
            <el-radio-button label="FINISHED">已完成</el-radio-button>
          </el-radio-group>

          <el-radio-group v-model="payStatus" @change="initPurchaseOrder">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button label="UNPAID">未结算</el-radio-button>
            <el-radio-button label="PART_PAID">部分结算</el-radio-button>
            <el-radio-button label="FULL_PAID">已结算</el-radio-button>
          </el-radio-group>


        </div>
        <div>
          <el-button type="success" icon="el-icon-plus" @click="createPurchase">新增采购单</el-button>

          <el-button type="info"  icon="el-icon-edit" @click="changeListStatus('PRE_SUMMIT')">草稿箱</el-button>

          <el-button type=""  icon="el-icon-delete" @click="changeListStatus('CANCEL')">回收站</el-button>
        </div>
      </div>

    </div>

    <!--    采购单列表-->
    <div style="margin-top: 5px">
      <el-table
          :header-cell-style="{background:'#fafafa'}"
          :data="purchaseOrder"
          v-loading="loading"
          @filter-change="filterChange"
          ref="purchaseOrderTable"
          tooltip-effect="dark"
          style="width: 100%">


        <el-table-column
            prop="order_status"
            align="center"
            header-align="center"
            min-width="100"
            label="订单状态">
          <template slot-scope="scope">
            <el-tag type="info" size="small" effect="plain" v-if="scope.row.order_status=='CANCEL'">作废</el-tag>
            <el-tag type="info" size="small" effect="plain" v-if="scope.row.order_status=='PRE_SUMMIT'">未提交</el-tag>
            <el-tag type="" size="small" effect="plain" v-if="scope.row.order_status=='WAIT_CONFIRM'">待确认</el-tag>
            <el-tag type="" size="small" effect="plain" v-if="scope.row.order_status=='IN_PRODUCTION'">生产中</el-tag>
            <el-tag type="" size="small" effect="plain" v-if="scope.row.order_status=='SENT'">已发货</el-tag>
            <el-tag type="warning" size="small" effect="plain" v-if="scope.row.order_status=='PART_SENT'">部分发货</el-tag>
            <el-tag type="warning" size="small" effect="plain" v-if="scope.row.order_status=='PART_REC'">部分收货</el-tag>
            <el-tag type="success" size="small" effect="plain" v-if="scope.row.order_status=='FINISHED'">已完成</el-tag>
            <el-tag type="danger" size="small" effect="plain" v-if="scope.row.order_status=='EXCEPTION'">异常</el-tag>
          </template>
        </el-table-column>

        <el-table-column
            prop="p_number"
            label="批次号"
            min-width="150">
        </el-table-column>
        <el-table-column
            prop="store_name"
            align="center"
            header-align="center"
            min-width="140"
            label="目标仓库/店铺">
        </el-table-column>

        <el-table-column
            align="center"
            header-align="center"
            label="采购量">
          <el-table-column
              prop="total_buy_qty"
              align="center"
              header-align="center"
              min-width="70"
              label="总数量">
          </el-table-column>
          <el-table-column
              prop="total_cost"
              :formatter="moneyFormat"
              align="center"
              header-align="center"
              min-width="70"
              label="总金额">
          </el-table-column>
        </el-table-column>

        <el-table-column
            v-if="orderStatus!=='WAIT_CONFIRM' && orderStatus!=='IN_PRODUCTION' && orderStatus!=='PRE_SUMMIT' && orderStatus!=='CANCEL'"
            align="center"
            header-align="center"
            label="收货情况">
          <el-table-column
              prop="total_onway_qty"
              align="center"
              header-align="center"
              min-width="70"
              label="在途量">
          </el-table-column>
          <el-table-column
              prop="total_rec_qty"
              align="center"
              header-align="center"
              min-width="70"
              label="已收货">
          </el-table-column>
        </el-table-column>

        <el-table-column
            v-if="orderStatus!=='WAIT_CONFIRM' && orderStatus!=='IN_PRODUCTION' && orderStatus!=='PRE_SUMMIT' && orderStatus!=='CANCEL'"
            align="center"
            header-align="center"
            label="结算情况">
          <el-table-column
              prop="paid_status"
              align="center"
              header-align="center"
              min-width="90"
              label="结算状态">
            <template slot-scope="scope">
              <el-tag type="info" size="small" effect="plain" v-if="scope.row.paid_status=='UNPAID'">未结算</el-tag>
              <el-tag type="warning" size="small" effect="plain" v-if="scope.row.paid_status=='PART_PAID'">部分结算</el-tag>
              <el-tag type="success" size="small" effect="plain" v-if="scope.row.paid_status=='FULL_PAID'">已结算</el-tag>
            </template>
          </el-table-column>
          <el-table-column
              prop="total_paid"
              :formatter="moneyFormat"
              align="center"
              header-align="center"
              min-width="70"
              label="结算金额">
          </el-table-column>
          <el-table-column
              prop="total_paid_qty"
              align="center"
              header-align="center"
              min-width="70"
              label="结算数量">
          </el-table-column>
        </el-table-column>


        <el-table-column
            label="标签"
            header-align="center"
            :filter-multiple="false"
            :filters="tagFilters"
            min-width="120"
            column-key="filterTag">
          <template slot-scope="scope">
            <el-tag
                v-for="item in scope.row.purchase_p_tag"
                :key="item.tag_name"
                :type="item.color"
                size="small"
                effect="light"
                style="margin-right: 5px">
              {{ item.tag_name }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
            prop="create_time"
            :formatter="datetimeFormat"
            align="center"
            header-align="center"
            width="100"
            label="创建时间">
        </el-table-column>
        <el-table-column
            prop="username"
            align="center"
            header-align="center"
            width="80"
            label="操作人">
        </el-table-column>
        <el-table-column
            label="操作"
            width="100"
            align="center"
            header-align="center"
        >
          <template slot-scope="scope">
            <el-button
                v-if="scope.row.order_status!=='PRE_SUMMIT' && scope.row.order_status!=='CANCEL'"
                @click="goPurchaseDetail(scope.row.id)"
                type="text"
                size="small">
              查看
            </el-button>
            <el-button
                v-if="scope.row.order_status=='PRE_SUMMIT'"
                @click="goCreatePurchase(scope.row.id)"
                type="text"
                size="small">
              编辑
            </el-button>
            <el-button
                v-if="scope.row.order_status=='CANCEL'"
                @click="restoreCreatePurchase(scope.row)"
                type="text"
                size="small">
              恢复
            </el-button>
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

  </div>
</template>

<script>
import moment from "moment";

export default {
  name: "PurchaseOrder",
  data() {
    return {
      purchaseOrder: [],
      tagFilters: [],  // 产品标签过滤项
      orderStatus: '', // 订单状态筛选
      payStatus: '', // 订单支付状态筛选
      purchaseTag: '', // 标签筛选
      searchValue: '', // 搜索框值
      ordering: '', // 排序
      loading: false,
      total: 0,
      page: 1,
      size: 20,
    }
  },
  mounted() {
    this.initPurchaseOrder();
    this.initSettings();
  },
  methods: {
    // 金额日期时间
    moneyFormat: function (row, column) {

      let value = row[column.property];

      if (value == undefined) {
        return ''
      }
      if (!value) {
        return 0
      }
      return `¥${value.toFixed(2)}`;
    },

    //  恢复到草稿箱
    restoreCreatePurchase(obj) {
      this.$confirm('是否将采购单恢复？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true;
        obj.order_status = 'PRE_SUMMIT';
        this.putRequest('api/purchase_orders/'+obj.id+'/', obj).then(resp => {
          if (resp) {
            this.loading = false;
            this.$router.push({
              path: '/createPurchase',
              query: {
                id: obj.id
              }
            });
          }
        })
      }).catch(() => {
        this.loading = false;
        this.$message({
          type: 'info',
          message: '已取消'
        });
      });

    },

    // 草稿箱编辑采购单
    goCreatePurchase(id){
      this.$router.push({
        path: '/createPurchase',
        query: {
          id: id
        }
      });
    },

    // 查看采购单详情
    goPurchaseDetail(id) {
      this.$router.push({
        path: '/purchaseDetail',
        query: {
          id: id
        }
      });
    },

    // 创建采购单
    createPurchase(){
      this.$router.push('/createPurchase')
    },
    // 监听筛选项的变化
    filterChange(filterObj) {
      // 监听产品标签字段
      if (filterObj.filterTag) {
        this.purchaseTag = filterObj.filterTag[0];
        }
      this.initPurchaseOrder();
      },

    // 草稿箱,回收站
    changeListStatus(status){
      this.orderStatus = status;
      this.initPurchaseOrder();
    },

    // 分页大小
    sizeChange(size) {
      this.size = size;
      this.initPurchaseOrder();
    },
    // 页码
    currentChange(page) {
      this.page = page;
      this.initPurchaseOrder();
    },

    // 搜索
    doSearch() {
      this.$refs.purchaseOrderTable.clearFilter();
      this.initPurchaseOrder();
    },
    // 重置搜索内容
    clearSearchValue() {
      this.searchValue = '';
      this.initPurchaseOrder();
    },

    // 格式化日期时间
    datetimeFormat: function (row, column) {

      var date = row[column.property];

      if (date == undefined) {
        return ''
      }
      ;
      return moment(date).format("YYYY-MM-DD")
    },

    // 初始化采购单
    initPurchaseOrder() {
      this.loading = true;
      let url = 'api/purchase_orders/?page=' + this.page + '&page_size=' + this.size;

      if (this.searchValue) {
        url += '&search=' + this.searchValue;
      }

      if (this.orderStatus) {
        url += '&order_status=' + this.orderStatus;
      }

      if (this.payStatus) {
        url += '&paid_status=' + this.payStatus;
      }

      if (this.purchaseTag) {
        url += '&purchase_p_tag__tag__tag_name=' + this.purchaseTag;
      }

      this.getRequest(url).then(resp => {
        if (resp.results) {
          this.purchaseOrder = resp.results;
          this.total = resp.count;
          this.loading = false;
        }
      })
    },

    initSettings(){
      // 获取所有产品标签
      this.getRequest('api/settings/tags/?type=PURCHASE').then(resp => {
        if (resp) {
          resp.results.forEach(i => {
            this.tagFilters.push({text: i.tag_name, value: i.tag_name, tagID: i.id})
          })
        }
      })
    }

  }
}
</script>

<style scoped>
.purchaseOrderList {
  padding: 10px;
  background-color: white;
  margin-top: 10px;
}

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
</style>