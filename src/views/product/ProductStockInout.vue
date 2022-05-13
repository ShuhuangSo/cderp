<template>
  <div class="stockInOutList">
    <div class="operate">
      <div>
        <el-input size="small" placeholder="请输入批次号、sku搜索"
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
          <el-radio-button label="TAKING">盘点</el-radio-button>
        </el-radio-group>
      </div>
      <div>
        <el-button type="success" icon="el-icon-plus" @click="addStockInoutDetail('IN')">手工入库</el-button>
        <el-button type="danger" icon="el-icon-plus" @click="addStockInoutDetail('OUT')">手工出库</el-button>
        <el-button type="warning" icon="el-icon-plus" @click="addStockInoutDetail('MOVE')">库存调拨</el-button>
        <el-button type="" icon="el-icon-plus" @click="takingVisible=true">库存盘点</el-button>
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
            <el-tag type="" size="small" effect="plain" v-if="scope.row.type==='TAKING'">盘点</el-tag>
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

<!--    库存盘点弹窗-->
    <div>
      <el-dialog
          title="库存盘点"
          :visible.sync="takingVisible"
          :destroy-on-close="true"
          :close-on-click-modal="false"
          width="500px"
      >
        <div style="display: flex; justify-content: center;margin-bottom: 20px">
          <el-tag size="medium" effect="dark" style="margin-top: 3px;margin-right: 5px">盘点仓库</el-tag>
          <el-select style="width: 50%" v-model="target_store" placeholder="请选择盘点仓库">
            <el-option
                v-for="item in storeOptions"
                :key="item.id"
                :label="item.store_name"
                :value="item.id">
            </el-option>
          </el-select>
        </div>
        <div>

          <el-upload
              v-loading="uploadLoading"
              style="margin-left: 50px;"
              ref="upload"
              name="excel"
              :headers="headers"
              :data="{'target_store':target_store}"
              :on-success="onSuccess"
              :on-error="onError"
              :auto-upload="false"
              :before-upload="beforeUpload"
              :limit="1"
              drag
              action="api/stock_in_out/stock_taking/">
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <div class="el-upload__tip" slot="tip">只能上传excel文件,
              <el-link href="/media/template/stock-taking.xlsx" target="_blank">模板下载</el-link>
            </div>
          </el-upload>

          <div v-if="uploadResult">
            <el-result icon="warning" v-if="errList.length">
              <template slot="extra">
                <h2>成功上传 <span style="color: green ">{{ this.successCount }}</span> 条，失败 <span style="color: crimson ">{{
                    this.failCount
                  }}</span> 条</h2>
              </template>
            </el-result>

            <el-result icon="success" v-if="!failCount">
              <template slot="extra">
                <h2>成功上传 <span style="color: green ">{{ this.successCount }}</span> 条</h2>
              </template>
            </el-result>

            <el-table
                v-if="errList.length"
                :data="errList"
                border
                size="mini"
                style="width: 100%">
              <el-table-column
                  prop="row"
                  label="问题行"
                  width="180">
              </el-table-column>
              <el-table-column
                  prop="msg"
                  label="错误原因">
              </el-table-column>

            </el-table>
          </div>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="cancelTaking">取 消</el-button>
          <el-button size="small" type="primary"
                     :disabled="!target_store"
                     @click="submitUpload">开始导入</el-button>
        </span>
      </el-dialog>
    </div>

  </div>
</template>

<script>
import moment from "moment";

export default {
  name: "ProductStockInout",
  data() {
    return {
      // 盘点上传认证
      headers: {
        Authorization: window.localStorage.getItem('tokenStr'),
      },
      stockInOut: [],
      storeOptions: [], // 所有仓库
      target_store: null, //盘点目标仓库
      inOutType: '', // 出入单类型
      searchValue: '', // 搜索框值
      ordering: '', // 排序
      loading: false,
      total: 0,
      page: 1,
      size: 20,
      takingVisible: false,
      uploadLoading: false, //上传loading
      uploadResult: false, // 上传结果显示
      errList: [], // 错误列表
      failCount: 0, // 错误数
      successCount: 0, // 成功数
    }
  },
  mounted() {
    this.initStockInOut(); // 初始化出入库单列表
    this.initSettings();
  },
  methods: {
    // 盘点上传前的回调
    beforeUpload() {
      this.uploadLoading = true;
      this.uploadResult = false;
      this.errList = [];
      this.failCount = 0;
      this.successCount = 0
    },
    // 盘点上传错误功之后的回调
    onError() {
      this.uploadLoading = false;
      this.$refs.upload.clearFiles();
    },
    // 盘点上传成功之后的回调
    onSuccess(response, file, fileList) {
      this.uploadLoading = false;
      this.$refs.upload.clearFiles();
      this.uploadResult = true;
      this.successCount = response.success_count;
      if (response.fail_count) {
        this.errList = response.err_list;
        this.failCount = response.fail_count;
      }
      if (this.successCount) {
        this.initStockInOut();
      }

    },
    // 上传盘点
    submitUpload() {
      this.$refs.upload.submit();
    },
    //取消盘点对话框
    cancelTaking() {
      this.takingVisible = false
      this.uploadResult = false
      this.target_store = null;
    },

    // 查看详情
    goStockInoutView(id) {
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

    // 初始化设置
    initSettings() {
      //获取所有可选仓库
      if (window.sessionStorage.getItem('stores')) {
        this.storeOptions = JSON.parse(window.sessionStorage.getItem('stores'));
      } else {
        this.getRequest('api/stores/?page_size=1000').then(resp => {
          if (resp.results) {
            this.storeOptions = resp.results;
            window.sessionStorage.setItem('stores', JSON.stringify(this.storeOptions));
          }
        })
      }

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