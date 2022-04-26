<template>
  <div class="stockInOutList">
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

        <el-radio-group v-model="inOutType" @change="initStockInOut">
          <el-radio-button label="">全部</el-radio-button>
          <el-radio-button label="IN">入库</el-radio-button>
          <el-radio-button label="OUT">出库</el-radio-button>
          <el-radio-button label="MOVE">调拨</el-radio-button>
        </el-radio-group>
      </div>
      <div>
        <el-button type="success" icon="el-icon-plus" @click="addStockInoutDetail('IN')">手工入库</el-button>
        <el-button type="danger" icon="el-icon-plus" @click="addStockInoutDetail('OUT')">手工出库</el-button>
        <el-button type="warning" icon="el-icon-plus" @click="addStockInoutDetail('MOVE')">库存调拨</el-button>
      </div>
    </div>

    <div style="margin-top: 5px">
      <el-table
          :header-cell-style="{background:'#fafafa'}"
          :data="stockInOut"
          v-loading="loading"
          @sort-change="handleSort"
          ref="stockInOutTable"
          tooltip-effect="dark"
          style="width: 100%">
        <el-table-column
            prop="type"
            label="类型"
            align="center"
            header-align="center"
            width="150">
          <template slot-scope="scope">
            <el-tag type="success" size="small" effect="plain" v-if="scope.row.type==='IN'">入库</el-tag>
            <el-tag type="danger" size="small" effect="plain" v-if="scope.row.type==='OUT'">出库</el-tag>
            <el-tag type="warning" size="small" effect="plain" v-if="scope.row.type==='MOVE'">调拨</el-tag>
          </template>
        </el-table-column>
        <el-table-column
            prop="batch_number"
            label="批次号"
            width="180">
        </el-table-column>
        <el-table-column
            prop="target_store_name"
            align="center"
            header-align="center"
            width="150"
            label="目标仓库/店铺">
        </el-table-column>
        <el-table-column
            prop="sku_num"
            align="center"
            header-align="center"
            width="100"
            label="SKU个数">
        </el-table-column>
        <el-table-column
            prop="note"
            align="center"
            header-align="center"
            label="备注">
        </el-table-column>
        <el-table-column
            prop="create_time"
            sortable="custom"
            :formatter="datetimeFormat"
            width="120"
            label="处理时间">
        </el-table-column>
        <el-table-column
            prop="username"
            width="120"
            label="操作人">
        </el-table-column>
        <el-table-column
            label="操作"
            width="100"
        >
          <template slot-scope="scope">
            <el-button
                type="text"
                @click="goStockInoutView(scope.row.id)"
                size="small">
              查看
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
  name: "ProductStockInout",
  data() {
    return {
      stockInOut: [],
      inOutType: '', // 出入单类型
      searchValue: '', // 搜索框值
      ordering: '', // 排序
      loading: false,
      total: 0,
      page: 1,
      size: 20,
    }
  },
  mounted() {
    this.initStockInOut(); // 初始化出入库单列表
  },
  methods: {
    // 查看详情
    goStockInoutView(id){
      this.$router.push({
        path: '/stockInoutView',
        query: {
          id: id
        }
      });
    },
    // 添加新出入库单
    addStockInoutDetail(type) {
      this.$router.push({
        path: '/stockInoutDetail',
        query: {
          type: type
        }
      });
    },

    // 分页大小
    sizeChange(size) {
      this.size = size;
      this.initStockInOut();
    },
    // 页码
    currentChange(page) {
      this.page = page;
      this.initStockInOut();
    },
    // 搜索
    doSearch() {

      this.$refs.stockInOutTable.clearFilter();
      this.initStockInOut();
    },
    // 重置搜索内容
    clearSearchValue() {
      this.searchValue = '';
      this.initStockInOut();
    },
    // 排序
    handleSort(obj) {
      if (obj.order == 'descending') {
        this.ordering = '-' + obj.prop;
      }
      if (obj.order == 'ascending') {
        this.ordering = obj.prop;
      }
      if (!obj.order) {
        this.ordering = '';
      }
      this.initStockInOut();
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

    // 初始化出入库单
    initStockInOut() {
      this.loading = true;
      let url = 'api/stock_in_out/?page=' + this.page + '&page_size=' + this.size;

      if (this.searchValue) {
        url += '&search=' + this.searchValue;
      }
      if (this.inOutType) {
        url += '&type=' + this.inOutType;
      }
      if (this.ordering) {
        url += '&ordering=' + this.ordering;
      }
      this.getRequest(url).then(resp => {
        if (resp.results) {
          this.stockInOut = resp.results;
          this.total = resp.count;
          this.loading = false;
        }
      })
    },
  }
}
</script>


<style scoped>
.stockInOutList {
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
  display: flex;
  justify-content: space-between;
}
</style>