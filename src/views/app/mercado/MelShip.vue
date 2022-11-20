/*
美客多FBM--发仓运单
*/
<template>
  <div>

    <div class="operate">
      <div>
        <el-input size="small" placeholder="批次号 Envio 物流单号 备注"
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
          <el-radio-group v-model="s_status" style="margin-right: 20px" @change="initShips">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button label="PREPARING">备货中<br /></el-radio-button>
            <el-radio-button label="SHIPPED">已发货</el-radio-button>
            <el-radio-button label="BOOKED">已预约</el-radio-button>
            <el-radio-button label="FINISHED">已完成</el-radio-button>
          </el-radio-group>

          <el-radio-group @change="changeTarget" v-model="target">
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
                  prop="s_type"
                  label="发货类型"
                  align="center"
                  header-align="center"
                  width="180">
              </el-table-column>

            </el-table>
          </template>
        </el-table-column>

        <el-table-column
            prop="batch"
            label="批次号"
            align="center"
            header-align="center">
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
            label="物流商"
            width="350">
          <template slot-scope="scope">
            <div><span class="tt">物流名称: </span>{{scope.row.carrier}}</div>
            <div><span class="tt">物流单号: </span>{{scope.row.s_number}}</div>
            <div><span class="tt">截单日期: </span>{{scope.row.end_date}}</div>
            <div><span class="tt">航班日期: </span>{{scope.row.ship_date}}</div>
            <div><span class="tt">运单类型: </span>{{scope.row.ship_type}}</div>
          </template>
        </el-table-column>

        <el-table-column
            label="包裹信息"
            width="350">
          <template slot-scope="scope">
            <div><span class="tt">总数量: </span>{{scope.row.total_qty}}</div>
            <div><span class="tt">总箱数: </span>{{scope.row.total_box}}</div>
            <div><span class="tt">总重量: </span>{{scope.row.weight}}</div>
            <div><span class="tt">总体积: </span>{{scope.row.cbm}}</div>
          </template>
        </el-table-column>

        <el-table-column
            prop="shop"
            label="目标店铺"
            align="center"
            header-align="center">
        </el-table-column>

        <el-table-column
            label="创建日期"
            align="center"
            header-align="center"
            width="90">
          <template slot-scope="scope">
            <span>{{ scope.row.create_time | date }}</span>
          </template>
        </el-table-column>

        <el-table-column
            label="操作"
            width="130"
        >
          <template slot-scope="scope">
            <el-dropdown @command="handleProductOp">
              <el-button type="text">
                操作<i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :command="{type:'editImage', obj:scope.row}">更换图片</el-dropdown-item>
                <el-dropdown-item :command="{type:'edit', id:scope.row.id}">编辑产品</el-dropdown-item>
                <el-dropdown-item :command="{type:'delete', id:scope.row.id}">删除产品</el-dropdown-item>
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
      s_status: '',
      ships: [],
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
</style>