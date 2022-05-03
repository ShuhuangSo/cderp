<template>
  <div  class="mainList">
    <div class="operate">
      <div>
        <el-input size="small" placeholder="请输入型号/备注搜索"
                  clearable
                  @clear="clearSearchValue"
                  @keyup.enter.native="doSearch"
                  tooltip-effect="dark"
                  v-model="searchValue"
                  style="width: 350px; margin-right: 5px">
          <el-button slot="append" icon="el-icon-search" @click="doSearch">搜索</el-button>
        </el-input>
      </div>
      <div>
        <el-button type="success" icon="el-icon-plus"
                   style="margin-right: 10px"
                   @click="createDevice">新增型号</el-button>
        <el-dropdown @command="uploadVisible = true">
          <el-button size="small" type="">
            导入/导出<i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>批量导入</el-dropdown-item>
            <el-dropdown-item disabled>批量导出</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>

    <div style="margin-top: 5px">
      <el-table
          ref="deviceTable"
          :data="deviceModels"
          :header-cell-style="{background:'#fafafa'}"
          v-loading="loading"
          style="width: 100%">
        <el-table-column
            prop="model"
            label="型号"
            width="250">
        </el-table-column>
        <el-table-column
            prop="brand"
            label="品牌"
            width="100">
        </el-table-column>
        <el-table-column
            prop="type"
            label="类型"
            width="100">
        </el-table-column>

        <el-table-column
            label="兼容型号">
          <template slot-scope="scope">
            <el-tag
                v-for="item in scope.row.cp_model"
                :key="item.model"
                size="mini"
                effect="dark"
                style="margin-right: 5px">
              {{ item.model }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
            prop="note"
            label="备注">
        </el-table-column>
        <el-table-column
            label="操作"
            width="120"
        >
          <template slot-scope="scope">

            <el-dropdown @command="handleOp">
              <el-button type="text">
                操作<i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item >修改</el-dropdown-item>
                <el-dropdown-item >删除</el-dropdown-item>
                <el-dropdown-item >编辑备注</el-dropdown-item>
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
export default {
  name: "ProductDeviceModel",
  data(){
    return{
      deviceModels: [],
      total: 0, // 总条数
      page: 1,  // 当前页
      size: 20,  // 页大小
      searchValue: '',
      uploadVisible: false,
      loading: false,
    }
  },
  mounted() {
    this.initDeviceModels();
  },
  methods:{
    //新增型号
    createDevice(){

    },
    // 搜索
    doSearch() {
      this.$refs.deviceTable.clearFilter();
      this.initDeviceModels();
    },
    // 重置搜索内容
    clearSearchValue() {
      this.searchValue = '';
      this.initDeviceModels();
    },

    // 分页大小
    sizeChange(size) {
      this.size = size;
      this.initDeviceModels();
    },
    // 页码
    currentChange(page) {
      this.page = page;
      this.initDeviceModels();
    },

    //初始化兼容型号
    initDeviceModels(){
      let url = '/api/device_models/?page=' + this.page + '&page_size=' + this.size
      if (this.searchValue) {
        url += '&search=' + this.searchValue;
      }
      this.loading = true
      this.getRequest(url).then(resp => {
        if (resp.results) {
          this.deviceModels = resp.results;
          this.total = resp.count;
          this.loading = false
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
</style>