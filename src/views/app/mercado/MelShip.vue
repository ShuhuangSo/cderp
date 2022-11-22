/*
美客多FBM--发仓运单
*/
<template>
  <div>

    <div class="operate">

      <div class="filter">
        <div>

          <el-badge :value="pre_qty" :hidden="!pre_qty" class="item">
            <el-button size="small" :type="s_status==='PREPARING'?'primary':''" @click="changeStatus('PREPARING')">备货中</el-button>
          </el-badge>

          <el-badge :value="shipped_qty" :hidden="!shipped_qty" class="item">
            <el-button size="small" :type="s_status==='SHIPPED'?'primary':''" @click="changeStatus('SHIPPED')">运输中</el-button>
          </el-badge>

          <el-badge :value="booked_qty" :hidden="!booked_qty" class="item">
            <el-button size="small" :type="s_status==='BOOKED'?'primary':''" @click="changeStatus('BOOKED')">已预约</el-button>
          </el-badge>

            <el-button size="small" :type="s_status==='FINISHED'?'primary':''" @click="changeStatus('FINISHED')">已完成</el-button>

        </div>


      </div>

      <div class="filter">
        <div>
          <el-input size="small" placeholder="批次号 Envio 物流单号 备注"
                    clearable
                    @clear="clearSearchValue"
                    @keyup.enter.native="doSearch"
                    v-model="searchValue"
                    style="width: 350px; margin-right: 5px">
            <el-button slot="append" icon="el-icon-search" @click="doSearch">搜索</el-button>
          </el-input>

          <el-radio-group
              style="margin-left: 50px"
              @change="changeTarget" v-model="target">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button label="FBM">FBM入仓单</el-radio-button>
            <el-radio-button label="TRANSIT">中转仓单</el-radio-button>
          </el-radio-group>
        </div>

        <el-button type="success" icon="el-icon-plus"
                   style="margin-right: 10px"
                   @click="createShip">创建运单
        </el-button>
      </div>
    </div>

    <div style="margin-top: 5px">
      <el-table
          ref="shipTable"
          :data="ships"
          :header-cell-style="{background:'#fafafa'}"
          v-loading="loading"
          style="width: 100%">

        <!--        运单产品详情-->
        <el-table-column type="expand" width="40">

          <template slot-scope="props">
            <el-table
                :header-cell-style="{background:'#eef1f6'}"
                :data="props.row.ship_shipDetail"
                border
                size="mini"
                style="width: 98%; margin: 10px">
              <el-table-column
                  label="图片"
                  align="center"
                  header-align="center"
                  width="80">
                <template slot-scope="scope">
                  <el-image
                      style="width: 50px; height: 50px"
                      :src="scope.row.image?scope.row.image:''"
                      :preview-src-list="[scope.row.image?scope.row.image:'']"
                      fit="fill">
                  </el-image>
                </template>
              </el-table-column>

              <el-table-column
                  label="产品"
                  show-overflow-tooltip>
                <template slot-scope="scope">
                  <div>{{ scope.row.sku }}
                    <el-tag v-if="scope.row.s_type==='NEW'" type="success" size="mini" effect="dark">新入仓</el-tag>
                  </div>

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
                  prop="qty"
                  label="数量"
                  align="center"
                  header-align="center"
                  width="180">
              </el-table-column>

              <el-table-column
                  prop="box_number"
                  label="箱号"
                  align="center"
                  header-align="center"
                  width="180">
              </el-table-column>

              <el-table-column
                  label="单价"
                  align="center"
                  header-align="center"
                  width="70">
                <template slot-scope="scope">
                  <span>{{ scope.row.unit_cost | currency }}</span>
                </template>
              </el-table-column>

              <el-table-column
                  prop="note"
                  label="备注"
                  align="center"
                  header-align="center">
              </el-table-column>

            </el-table>
          </template>
        </el-table-column>

        <el-table-column
            label="批次号"
            align="center"
            header-align="center"
            width="150">
          <template slot-scope="scope">
            <div class="m_name">{{ scope.row.batch}}</div>
            <div style="margin-top: 10px">
              <el-tag size="mini" type="info" v-if="scope.row.s_status=='PREPARING'">备货中</el-tag>
              <el-tag size="mini" type="warning" v-if="scope.row.s_status=='BOOKED'">已预约</el-tag>
              <el-tag size="mini" type="success" v-if="scope.row.s_status=='BOOKED'">已完成</el-tag>
              <el-tag size="mini" v-if="scope.row.s_status=='SHIPPED'">已发货</el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column
            label="目标店铺"
            width="150"
            align="center"
            header-align="center">
          <template slot-scope="scope">
            <el-tag effect="dark" type="info">{{ scope.row.shop}}</el-tag>

          </template>
        </el-table-column>

        <el-table-column
            label="Envio号"
            align="center"
            header-align="center">
          <template slot-scope="scope">
            <div>{{ scope.row.envio_number}}</div>
            <div>{{ scope.row.target_FBM}}</div>
          </template>
        </el-table-column>

        <el-table-column
            label="预约日期"
            align="center"
            header-align="center">
          <template slot-scope="scope">
            <div>{{ scope.row.book_date}}</div>
          </template>
        </el-table-column>

        <el-table-column
            label="物流商"
            width="300">
          <template slot-scope="scope">
            <div><span class="tt">物流名称: </span>{{scope.row.carrier}}</div>
            <div><span class="tt">物流单号: </span>{{scope.row.s_number}}</div>
            <div><span class="tt">截单日期: </span>{{scope.row.end_date}}</div>
            <div><span class="tt">航班日期: </span>{{scope.row.ship_date}}</div>
            <div><span class="tt">发货方式: </span>{{scope.row.ship_type}}</div>
          </template>
        </el-table-column>

        <el-table-column
            label="包裹信息"
            width="300">
          <template slot-scope="scope">
            <div><span class="tt">总数量: </span>{{scope.row.total_qty}}</div>
            <div><span class="tt">总箱数: </span>{{scope.row.total_box}}</div>
            <div><span class="tt">总重量: </span>{{scope.row.weight}}</div>
            <div><span class="tt">总体积: </span>{{scope.row.cbm}}</div>
          </template>
        </el-table-column>

        <el-table-column
            label="操作"
            width="130"
        >
          <template slot-scope="scope">
            <el-dropdown @command="handleShipOp">
              <el-button type="text">
                操作<i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :command="{type:'packing', id:scope.row.id}">打包发货</el-dropdown-item>
                <el-dropdown-item :command="{type:'book', id:scope.row.id}">FBM预约</el-dropdown-item>
                <el-dropdown-item :command="{type:'delete', id:scope.row.id}">删除运单</el-dropdown-item>
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

    <!--    FBM预约弹窗-->
    <el-dialog
        title="FBM预约"
        :visible.sync="bookVisible"
        :destroy-on-close="true"
        :close-on-click-modal="false"
        width="300px"
    >
      <div>
        <el-date-picker
            style="width: 100%"
            v-model="book_date"
            value-format="yyyy-MM-dd"
            type="date"
            placeholder="选择预约日期">
        </el-date-picker>
      </div>
      <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="bookVisible = false">取 消</el-button>
          <el-button size="small" type="primary" :disabled="!book_date" @click="summitBookDate">确 定</el-button>
        </span>
    </el-dialog>

  </div>
</template>

<script>
import moment from "moment/moment";

export default {
  name: "MelShip",
  data(){
    return{
      loading: false,
      total: 0, // 总条数
      page: 1,  // 当前页
      size: 20,  // 页大小
      searchValue: '',
      target: '',
      s_status: 'PREPARING',// 筛选状态
      ships: [],
      pre_qty: 0, // 备货运单数量
      shipped_qty: 0, // 发货运单数量
      booked_qty: 0, // 预定运单数量
      bookVisible: false, // fbm预约
      book_date: '', //预约日期
      ship_id: null,
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
    this.initShips()
  },
  methods:{
    //提交预定日期
    summitBookDate(){
      this.patchRequest('api/ml_ship/'+ this.ship_id +'/', {'book_date': this.book_date}).then(resp => {
        if (resp) {
          this.bookVisible = false;
          this.initShips()
          this.book_date = ''
          this.ship_id = null
        }
      })
    },
    // 改变筛选状态
    changeStatus(value){
      this.s_status = value
      this.initShips()
    },

    // 运单更多操作
    handleShipOp(command) {

      // 打包发货
      if (command['type'] === 'packing') {
        this.$router.push({
          path: '/shipDetail',
          query: {
            id: command['id']
          }
        });
      }

      // FBM预约
      if (command['type'] === 'book') {
        this.bookVisible = true;
        this.ship_id = command['id']
      }

      // 产品删除
      if (command['type'] === 'delete') {
        this.$confirm('删除的运单无法恢复, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          //调用删除产品
          this.deleteRequest('api/ml_ship/' + command['id'] + '/').then(resp => {
            this.initShips();
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消删除'
            });
          });
        })
      }

    },

    // 创建运单
    createShip(){
      this.$router.push('/createShip')
    },
    // 改变目标状态
    changeTarget(){
      this.s_status = ''
      this.initShips()
    },
    // 重置搜索内容
    clearSearchValue() {
      this.searchValue = '';
      this.initShips();
    },
    // 搜索
    doSearch() {
      this.page = 1;
      this.$refs.shipTable.clearFilter();
      this.initShips();
    },
    // 分页大小
    sizeChange(size) {
      this.page = 1;
      this.size = size;
      this.initShips();
    },
    // 页码
    currentChange(page) {
      this.page = page;
      this.initShips();
    },
    // 计算各状态运单数量
    calcShips(){
      this.getRequest('/api/ml_ship/calc_ships/').then(resp => {
        if (resp) {
          this.pre_qty = resp.pre_qty
          this.shipped_qty = resp.shipped_qty
          this.booked_qty = resp.booked_qty
        }
      })
    },
    initShips() {
      let url = '/api/ml_ship/?page=' + this.page + '&page_size=' + this.size
      if (this.searchValue) {
        url += '&search=' + this.searchValue;
      }
      url += '&target=' + this.target
      url += '&s_status=' + this.s_status
      url += '&ordering=-create_time'

      this.loading = true
      this.getRequest(url).then(resp => {
        this.loading = false
        if (resp.results) {
          this.ships = resp.results;
          this.total = resp.count;
        }
      })

      this.calcShips();
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
.tt{
  font-weight: bold;
}
.m_name{
  font-weight: bold;
  color: teal;
  font-size: large;
}
.item {
  margin-right: 18px;
}
</style>