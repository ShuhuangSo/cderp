<template>
  <div>
    <div class="operate">
      <el-input size="small" placeholder="请输入内容搜索"
                clearable
                @clear="clearSearchValue"
                @keyup.enter.native="doSearch"
                tooltip-effect="dark"
                v-model="searchValue"
                style="width: 350px; margin-right: 5px">
        <el-button slot="append" icon="el-icon-search" @click="doSearch">搜索</el-button>
      </el-input>
      <el-switch
          v-model="collectStatus"
          @change="checkCollection"
          active-text="仅看收藏"
          inactive-text="全部链接">
      </el-switch>
      <el-button type="success" icon="el-icon-plus"
                 style="margin-right: 10px"
                 @click="addSeller">新增卖家
      </el-button>
    </div>
    <el-table
        ref="sellerTable"
        :data="sellers"
        :header-cell-style="{background:'#fafafa'}"
        v-loading="loading"
        style="width: 100%">
      <el-table-column
          align="center"
          header-align="center"
          label="卖家名称">
        <template slot-scope="scope">
          <div>
            <el-link :underline="false" type="success" @click="goSeller(scope.row.link)">{{scope.row.nickname}}</el-link>
          </div>
          <div style="font-size: 12px; color: #919398">{{scope.row.seller_id}}</div>
        </template>
      </el-table-column>
      <el-table-column
          align="center"
          header-align="center"
          prop="note"
          label="备注">
      </el-table-column>
      <el-table-column
          align="center"
          header-align="center"
          prop="total_items"
          label="listing数量">
      </el-table-column>
      <el-table-column
          label="订单数量">
        <template slot-scope="scope">
          <div>昨天销量: <span class="zi">{{scope.row.yesterday_sold}} </span>
          </div>
          <div>60天销量: <span class="zi">{{scope.row.sold_60d}} </span>
          </div>
          <div>总销量: <span class="zi">{{scope.row.total}}</span></div>
          <div>总取消: <span class="zi">{{scope.row.canceled}}</span></div>
        </template>
      </el-table-column>
      <el-table-column
          align="center"
          header-align="center"
          prop="level_id"
          label="信誉">
      </el-table-column>
      <el-table-column
          header-align="center"
          label="好评率">
        <template slot-scope="scope">
          <el-tooltip placement="top">
            <div slot="content">
              <div>好评：{{scope.row.positive * 100}}%</div>
              <div>中评：{{scope.row.neutral * 100}}%</div>
              <div>差评：{{scope.row.negative * 100}}%</div>
            </div>
          <el-progress :percentage="scope.row.positive * 100"></el-progress>
          </el-tooltip>
        </template>
      </el-table-column>

      <el-table-column
          align="center"
          header-align="center"
          prop="registration_date"
          label="注册日期">
      </el-table-column>

      <el-table-column
          align="center"
          header-align="center"
          label="操作"
          width="200"
      >
        <template slot-scope="scope">
          <div style="display: flex; justify-content: center">
            <div style="margin-right: 2px">
              <div><el-button
                  style="margin-bottom: 2px"
                  icon="el-icon-s-data"
                  size="mini" @click="saleChart(scope.row.id)">统计</el-button></div>
              <div v-if="!scope.row.collection"><el-button size="mini"
                                                           icon="el-icon-star-off"
                                                           @click="collectSeller(scope.row)">收藏</el-button></div>
              <div v-if="scope.row.collection"><el-button size="mini" type="success" plain
                                                          icon="el-icon-star-on"
                                                          @click="collectSeller(scope.row)">收藏</el-button></div>
              <div>
                <el-tooltip class="item" effect="dark" :content="scope.row.update_time | datetime" placement="top">
                <el-button
                  style="margin-top: 2px"
                  icon="el-icon-refresh-right"
                  :loading="reflashLoading"
                  size="mini" @click="updateSeller(scope.row)">更新</el-button>
                </el-tooltip>
              </div>
            </div>
            <div>
              <div>
                <el-button
                    v-if="!scope.row.note"
                    style="margin-bottom: 2px"
                    icon="el-icon-chat-dot-square"
                    size="mini" @click="editNote(scope.row)">备注</el-button>
                <el-button
                    v-if="scope.row.note"
                    style="margin-bottom: 2px"
                    icon="el-icon-chat-dot-square"
                    type="success" plain
                    size="mini" @click="editNote(scope.row)">备注</el-button>
              </div>

              <div><el-button size="mini"
                              style="margin-top: 2px"
                              icon="el-icon-delete"
                              type="danger" plain @click="deleteSeller(scope.row.id)">删除</el-button></div>
            </div>
          </div>


        </template>
      </el-table-column>

    </el-table>
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

    <!--    备注弹窗-->
    <el-dialog
        title="备注"
        :close-on-click-modal="false"
        :visible.sync="noteVisible"
        width="500px"
    >
      <el-input
          type="textarea"
          :rows="5"
          placeholder="请输入内容"
          v-model="seller.note">
      </el-input>
      <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="noteVisible=false">取 消</el-button>
          <el-button size="small" type="primary" @click="saveNote">保 存</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import moment from "moment";

export default {
  name: "Seller",
  props: ['siteID'],
  data(){
    return{
      sellers: [],
      total: 0, // 总条数
      page: 1,  // 当前页
      size: 20,  // 页大小
      searchValue: '',
      loading: false,
      reflashLoading: false,
      siteID: '',
      collectStatus: false,
      noteVisible: false,
      seller: {
        id: null,
        note: null
      },
    }
  },
  filters: {
    //时间日期格式化
    datetime: function (value) {
      return '上次更新:' + moment(value).format("YYYY-MM-DD HH:mm:SS");
    },

  },
  mounted() {
    this.initSellers();
  },
  methods:{
    deleteSeller(id){
      this.$confirm('是否删除卖家？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        this.deleteRequest('api/med_seller/'+ id+'/').then(resp => {
          this.initSellers();
          this.loading = false;
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        });
      });
    },
    saveNote(){
      this.loading = true
      this.patchRequest('api/med_seller/'+ this.seller.id+'/', {'note': this.seller.note}).then(resp => {
        this.noteVisible = false
        this.initSellers();
        this.loading = false;
      })
    },
    editNote(row){
      Object.assign(this.seller, row)
      this.noteVisible = true
    },
    //添加卖家
    addSeller(){
      this.$prompt('请输入卖家名称', '添加卖家', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        closeOnClickModal: false
      }).then(({ value }) => {
        let seller_info = value.trim()
        this.loading = true;
        this.getRequest('api/med_seller/create_seller/?seller_info=' + seller_info + '&site_id=' + this.siteID).then(resp => {
          this.loading = false;
          if (resp) {
            this.initSellers();
          }

        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        });
      });
    },
    //跳转卖家店铺页面
    goSeller(url){
      window.open(url, '_blank');
    },
    //更新卖家信息
    updateSeller(row){
      this.reflashLoading = true
      this.getRequest('api/med_seller/update_seller/?seller_id=' + row.seller_id).then(resp => {
        this.initSellers();
        this.reflashLoading = false;
      })
    },
    //收藏
    collectSeller(row){
      this.loading = true
      this.patchRequest('api/med_seller/'+ row.id+'/', {'collection': !row.collection}).then(resp => {
        this.initSellers();
        this.loading = false;
      })
    },
    checkCollection(){
      this.page = 1
      this.initSellers();
    },
    // 搜索
    doSearch() {
      this.page = 1;
      this.initSellers();
    },
    // 重置搜索内容
    clearSearchValue() {
      this.searchValue = '';
      this.initSellers();
    },
    // 分页大小
    sizeChange(size) {
      this.size = size;
      this.initSellers();
    },
    // 页码
    currentChange(page) {
      this.page = page;
      this.initSellers();
    },
    initSellers(){
      let url = 'api/med_seller/?page=' + this.page + '&page_size=' + this.size
      if (this.searchValue) {
        url += '&search=' + this.searchValue;
      }
      if (this.siteID) {
        url += '&site_id=' + this.siteID;
      }
      if (this.collectStatus) {
        url += '&collection=' + this.collectStatus;
      }
      this.loading = true
      this.getRequest(url).then(resp => {
        this.loading = false
        if (resp.results) {
          this.sellers = resp.results;
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
  margin-bottom: 5px;
  display: flex;
  justify-content: space-between;
}
.zi {
  font-weight: bold;
  color: #E6A23C;
}
</style>