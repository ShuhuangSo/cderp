<template>
  <div class="orderList">

    <div>
      <el-input size="small" placeholder="请输入客户名称/订单号搜索"
                clearable
                @clear="clearSearchValue"
                @keyup.enter.native="doSearch"
                tooltip-effect="dark"
                v-model="searchValue"
                style="width: 350px; margin-right: 5px">
        <el-button slot="append" icon="el-icon-search" @click="doSearch">搜索</el-button>
      </el-input>
    </div>
    <div class="operate">
      <div>
        <el-radio-group fill="#82cab5" v-model="mode" style="margin-right: 20px" @change="initOrders">
          <el-radio-button label="STANDARD">标准订单</el-radio-button>
          <el-radio-button label="POS">POS订单</el-radio-button>
        </el-radio-group>

        <el-radio-group v-model="orderStatus" style="margin-right: 20px" @change="initOrders">
          <el-radio-button label="">全部</el-radio-button>
          <el-radio-button label="READY">待发货</el-radio-button>
          <el-radio-button label="FINISHED">已完成</el-radio-button>
        </el-radio-group>

        <el-radio-group v-model="payStatus" @change="initOrders">
          <el-radio-button label="">全部</el-radio-button>
          <el-radio-button label="UNPAID">未结算</el-radio-button>
          <el-radio-button label="FULL_PAID">已结算</el-radio-button>
        </el-radio-group>


      </div>
      <div>
        <el-button type="success" icon="el-icon-plus" @click="createOrder">新建订单</el-button>
        <el-button type="info"  icon="el-icon-edit" @click="changeListStatus('PREPARING')">草稿箱</el-button>

        <el-button type=""  icon="el-icon-delete" @click="changeListStatus('CANCEL')">回收站</el-button>
      </div>
    </div>

    <div style="margin-top: 5px">
      <el-table
          ref="orderTable"
          :data="orders"
          @filter-change="filterChange"
          :header-cell-style="{background:'#fafafa'}"
          v-loading="loading"
          style="width: 100%">
        <el-table-column
            align="center"
            header-align="center"
            label="订单状态"
            width="100">
          <template slot-scope="scope">
            <el-tag type="info" v-if="scope.row.order_status=='PREPARING'">{{
                scope.row.order_status | orderStatus
              }}
            </el-tag>
            <el-tag type="primary" v-if="scope.row.order_status=='READY'">{{
                scope.row.order_status | orderStatus
              }}
            </el-tag>
            <el-tag type="info" v-if="scope.row.order_status=='PART_SENT'">{{
                scope.row.order_status | orderStatus
              }}
            </el-tag>
            <el-tag type="success" v-if="scope.row.order_status=='FINISHED'">{{
                scope.row.order_status | orderStatus
              }}
            </el-tag>
            <el-tag type="warning" v-if="scope.row.order_status=='EXCEPTION'">{{
                scope.row.order_status | orderStatus
              }}
            </el-tag>
            <el-tag type="danger" v-if="scope.row.order_status=='CANCEL'">{{
                scope.row.order_status | orderStatus
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
            prop="order_number"
            label="订单号"
            min-width="200">
        </el-table-column>
        <el-table-column
            prop="customer_name"
            label="客户名称"
            width="180">
        </el-table-column>
        <el-table-column
            align="center"
            header-align="center"
            label="结算方式"
            width="100">
          <template slot-scope="scope">
            <el-tag type="primary" v-if="scope.row.pay_way=='PAY_NOW'">{{ scope.row.pay_way | payWay }}</el-tag>
            <el-tag type="" v-if="scope.row.pay_way=='CONTRACT'">{{ scope.row.pay_way | payWay }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
            align="center"
            header-align="center"
            label="结算状态"
            width="100">
          <template slot-scope="scope">
            <el-tag type="info" v-if="scope.row.paid_status=='UNPAID'">{{
                scope.row.paid_status | payStatus
              }}
            </el-tag>
            <el-tag type="warning" v-if="scope.row.paid_status=='PART_PAID'">{{
                scope.row.paid_status | payStatus
              }}
            </el-tag>
            <el-tag type="success" v-if="scope.row.paid_status=='FULL_PAID'">{{
                scope.row.paid_status | payStatus
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
            prop="total_qty"
            align="center"
            header-align="center"
            label="总数量"
            width="80">
        </el-table-column>
        <el-table-column
            align="center"
            header-align="center"
            label="总金额"
            width="80">
          <template slot-scope="scope">
            <span>{{ scope.row.total_sold_price | currency}}</span>
          </template>
        </el-table-column>

        <el-table-column
            :filter-multiple="false"
            :filters="tagFilters"
            column-key="filterTag"
            label="标签">
          <template slot-scope="scope">
            <el-tag
                v-for="item in scope.row.order_tag"
                :key="item.tag_name"
                :color="item.color"
                :closable="editTag"
                @close="removeTag(item.id)"
                size="mini"
                effect="dark"
                style="margin-right: 5px;border: none">
              {{ item.tag_name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
            label="操作"
            width="120"
            align="center"
            header-align="center"
        >
          <template slot-scope="scope">
            <el-button
                v-if="scope.row.order_status!=='PREPARING' && scope.row.order_status!=='CANCEL'"
                @click="goOrderDetail(scope.row.id)"
                type="text"
                size="small">
              查看
            </el-button>
            <el-button
                v-if="scope.row.order_status==='PREPARING'"
                @click="goCreateOrder(scope.row.id)"
                type="text"
                size="small">
              编辑
            </el-button>
            <el-button
                v-if="scope.row.order_status=='CANCEL'"
                @click="restoreCreateOrder(scope.row)"
                type="text"
                size="small">
              恢复
            </el-button>
            <el-divider direction="vertical"></el-divider>
            <el-dropdown @command="handleOp">
              <el-button type="text">
                操作<i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :command="{type:'addTag', obj:scope.row}">添加标签</el-dropdown-item>
                <el-dropdown-item v-if="!editTag" :command="{type:'editTag', obj:scope.row}">编辑标签</el-dropdown-item>
                <el-dropdown-item v-if="editTag" :command="{type:'editTag', obj:scope.row}">取消标签编辑</el-dropdown-item>
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
    <!--    订单标签弹窗-->
    <el-dialog
        title="添加标签"
        :visible.sync="tagVisible"
        width="500px"
    >
      <SelectTag @selectedTag="initTag"
                 v-if="isShow"
                 :key="timer"
                 :obj="{'id':orderID,'tag_type':'ORDER','existTag':currentTag}"></SelectTag>

    </el-dialog>
  </div>
</template>

<script>

import SelectTag from "@/components/setting/SelectTag";

export default {
  name: "OrderManage",
  data() {
    return {
      orders: [],
      mode: 'STANDARD', // 订单模式筛选
      payStatus: '', // 订单支付状态筛选
      orderStatus: 'READY', //订单状态筛选
      total: 0,
      page: 1,
      size: 20,
      loading: false,
      searchValue: '',
      orderType: 'STANDARD',
      editTag: false,
      tagVisible: false,
      isShow: false,
      timer: '',
      orderID: null,
      currentTag:[],
      tagFilters: [],  // 标签过滤项
      orderTag: '', // 标签筛选
    }
  },
  filters: {
    //金额格式化
    currency: function(value){
      if(!value) return 0.00;
      return `¥${value.toFixed(2)}`;
    },
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
    //结算状态信息格式化
    payStatus: function (value) {
      if (value === 'UNPAID') {
        return '未结算'
      }
      if (value === 'PART_PAID') {
        return '部分结算'
      }
      if (value === 'FULL_PAID') {
        return '已结算'
      }
      return '';
    },
    //订单状态信息格式化
    orderStatus: function (value) {
      if (value === 'PREPARING') {
        return '未提交'
      }
      if (value === 'READY') {
        return '已备货'
      }
      if (value === 'PART_SENT') {
        return '部分发货'
      }
      if (value === 'FINISHED') {
        return '已完成'
      }
      if (value === 'EXCEPTION') {
        return '异常完成'
      }
      if (value === 'CANCEL') {
        return '已取消'
      }
      return '';
    },

  },
  mounted() {
    this.initOrders();
    this.initSettings();
  },
  components:{
    SelectTag
  },
  methods: {
    // 监听筛选项的变化
    filterChange(filterObj) {
      // 监听产品标签字段
      if (filterObj.filterTag) {
        this.orderTag = filterObj.filterTag[0];
      }
      this.initOrders();
    },

    // 删除标签操作
    removeTag(id){
      this.deleteRequest('api/order_tags/'+id+'/').then(resp => {
        this.initOrders()
      })
    },

    //更多操作
    handleOp(command) {
      //添加标签
      if (command['type'] == 'addTag') {
        this.isShow = false
        this.timer = new Date().getTime();
        this.orderID=command['obj'].id
        this.currentTag=command['obj'].order_tag
        this.isShow = true
        this.tagVisible = true
      }
      //编辑标签
      if (command['type'] == 'editTag') {
        this.editTag = !this.editTag
      }
    },

    //重新加载标签
    initTag(test){
      this.initOrders()
      this.tagVisible = false
    },

    // 草稿箱,回收站
    changeListStatus(status){
      this.orderStatus = status;
      this.initOrders();
    },

    //  恢复到草稿箱
    restoreCreateOrder(obj) {
      this.$confirm('是否将订单恢复？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true;
        obj.order_status = 'PREPARING';
        this.putRequest('api/orders/'+obj.id+'/', obj).then(resp => {
          if (resp) {
            this.loading = false;
            this.$router.push({
              path: '/createOrder',
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


    //查看编辑订单
    goCreateOrder(id) {
      this.$router.push({
        path: '/createOrder',
        query: {
          id: id
        }
      })
    },

    //查看订单详情
    goOrderDetail(id) {
      this.$router.push({
        path: '/orderDetail',
        query: {
          id: id
        }
      })
    },

    // 新建订单
    createOrder() {
      this.$router.push('/createOrder');
    },

    // 分页大小
    sizeChange(size) {
      this.size = size;
      this.initOrders();
    },
    // 页码
    currentChange(page) {
      this.page = page;
      this.initOrders();
    },

    // 搜索
    doSearch() {
      this.page = 1;
      this.$refs.orderTable.clearFilter();
      this.initOrders();
    },
    // 重置搜索内容
    clearSearchValue() {
      this.searchValue = '';
      this.initOrders();
    },

    initSettings(){
      // 获取所有客户标签
      this.getRequest('api/settings/tags/?type=ORDER').then(resp => {
        if (resp) {
          resp.results.forEach(i => {
            this.tagFilters.push({text: i.tag_name, value: i.tag_name, tagID: i.id})
          })
        }
      })
    },

    // 初始化订单列表
    initOrders() {
      this.loading = true;
      let url = 'api/orders/?page=' + this.page + '&page_size=' + this.size;

      if (this.searchValue) {
        url += '&search=' + this.searchValue;
      }
      if (this.mode) {
        url += '&mode=' + this.mode;
      }
      if (this.payStatus) {
        url += '&paid_status=' + this.payStatus;
      }
      if (this.orderStatus) {
        url += '&order_status=' + this.orderStatus;
      }
      if (this.orderTag) {
        url += '&order_tag__tag__tag_name=' + this.orderTag;
      }
      this.getRequest(url).then(resp => {
        if (resp.results) {
          this.orders = resp.results;
          this.total = resp.count;
          this.loading = false;
        }
      })
    }
  }
}
</script>

<style scoped>
.orderList {
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
</style>