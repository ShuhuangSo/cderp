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
                 @click="addListing">新增跟踪商品
      </el-button>
    </div>
    <el-table
        ref="deviceTable"
        :data="listings"
        :header-cell-style="{background:'#fafafa'}"
        v-loading="loading"
        style="width: 100%">
      <el-table-column
          label="图片"
          align="center"
          header-align="center"
          width="100">
        <template slot-scope="scope">
          <el-image
              :src="scope.row.image"
              :preview-src-list="[scope.row.image]"
              fit="fill">
          </el-image>
        </template>
      </el-table-column>
      <el-table-column
          label="商品名称">
        <template slot-scope="scope">
          <div><el-link :underline="false" type="success" @click="goListing(scope.row.link)">{{scope.row.item_id}}</el-link></div>
          <div>{{scope.row.title}}</div>
        </template>
      </el-table-column>
      <el-table-column
          label="售价"
          align="center"
          header-align="center"
          width="120">
        <template slot-scope="scope">
          <div class="zi">{{scope.row.currency}}  {{scope.row.price}}</div>
          <el-tag v-if="scope.row.is_free_shipping" size="mini">包邮</el-tag>
        </template>
      </el-table-column>

      <el-table-column
          label="销量">
        <template slot-scope="scope">
          <div>昨天销量: <span class="zi">{{scope.row.yesterday_sold}} </span>
            <span v-if="scope.row.yesterday_sold_grow>0" class="up"><i class="el-icon-top"></i>{{ scope.row.yesterday_sold_grow | grow }}</span>
            <span v-if="scope.row.yesterday_sold_grow<0" class="down"><i class="el-icon-bottom"></i>{{ scope.row.yesterday_sold_grow | grow }}</span>
            <span v-if="scope.row.yesterday_sold_grow==0">{{ scope.row.yesterday_sold_grow | grow }}</span>
          </div>
          <div>7天销量: <span class="zi">{{scope.row.sold_7d}} </span>
            <span v-if="scope.row.sold_7d_grow>0" class="up"><i class="el-icon-top"></i>{{ scope.row.sold_7d_grow | grow }}</span>
            <span v-if="scope.row.sold_7d_grow<0" class="down"><i class="el-icon-bottom"></i>{{ scope.row.sold_7d_grow | grow }}</span>
            <span v-if="scope.row.sold_7d_grow==0">{{ scope.row.sold_7d_grow | grow }}</span>
          </div>
          <div>30天销量: <span class="zi">{{scope.row.sold_30d}} </span>
            <span v-if="scope.row.sold_30d_grow>0" class="up"><i class="el-icon-top"></i>{{ scope.row.sold_30d_grow | grow }}</span>
            <span v-if="scope.row.sold_30d_grow<0" class="down"><i class="el-icon-bottom"></i>{{ scope.row.sold_30d_grow | grow }}</span>
            <span v-if="scope.row.sold_30d_grow==0">{{ scope.row.sold_30d_grow | grow }}</span>
          </div>
          <div>总销量: <span class="zi">{{scope.row.total_sold}}</span></div>
        </template>
      </el-table-column>
      <el-table-column
          align="center"
          header-align="center"
          label="利润估算">
        <template slot-scope="scope">
          <div>
            <el-popover
                :ref="`popover-${scope.row.id}`"
                @show="popoverShow(scope.row.cost)"
                @hide="popoverHide(scope.row.cost)"
                placement="top"
                title="设置商品成本"
                width="200"
                trigger="click">
              <el-input-number v-model="cost"
                               controls-position="right" class="inputwidth"
                               :precision="2" :min="0" :step="1"></el-input-number>
              <el-button style="margin-left: 5px"
                         :disabled="!cost"
                         @click="changeCost(scope.row)"
                         type="primary" >保存</el-button>

              <el-button style="font-size: 14px" v-if="scope.row.cost" type="text" slot="reference">￥{{scope.row.profit}}</el-button>
              <el-button v-if="!scope.row.cost" size="mini" plain slot="reference">添加成本</el-button>
            </el-popover>
            <div v-if="scope.row.cost" class="cost">成本：￥{{scope.row.cost}}</div>

          </div>
        </template>
      </el-table-column>

      <el-table-column
          align="center"
          header-align="center"
          label="评论数|评分|健康度">
        <template slot-scope="scope">
          {{ scope.row.reviews}}
          <el-divider direction="vertical"></el-divider>
          {{ scope.row.rating_average}}
          <el-divider direction="vertical"></el-divider>
          {{ scope.row.health}}
        </template>
      </el-table-column>
      <el-table-column
          align="center"
          header-align="center"
          label="日期">
        <template slot-scope="scope">
          <div>上架日期:{{scope.row.start_date}}</div>
          <div>数据更新:{{scope.row.update_time | datetime}}</div>
          <div>{{scope.row.listing_status==='active'? '在售' : '停售'}}</div>
        </template>
      </el-table-column>
      <el-table-column
          align="center"
          header-align="center"
          prop="ship_type"
          label="物流">
      </el-table-column>
      <el-table-column
          align="center"
          header-align="center"
          label="卖家">
        <template slot-scope="scope">
          <div>{{scope.row.seller_name}}</div>
          <div><el-tag v-if="scope.row.is_cbt" size="mini">CBT</el-tag></div>
        </template>
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
                                                           @click="collectListing(scope.row)">收藏</el-button></div>
              <div v-if="scope.row.collection"><el-button size="mini" type="success" plain
                                                          icon="el-icon-star-on"
                                                          @click="collectListing(scope.row)">收藏</el-button></div>
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
                              type="danger" plain @click="deleteListing(scope.row.id)">删除</el-button></div>
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
          v-model="listing.note">
      </el-input>
      <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="noteVisible=false">取 消</el-button>
          <el-button size="small" type="primary" @click="saveNote">保 存</el-button>
      </span>
    </el-dialog>

    <!--    销量图表弹窗-->
    <el-dialog
        title="销量统计"
        :close-on-click-modal="false"
        :visible.sync="saleVisible"
        width="80%"
    >
      <div>
        <el-date-picker
            v-model="dateR"
            :picker-options="pickerOptions"
            value-format="yyyy-MM-dd"
            type="daterange"
            align="right"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期">
        </el-date-picker>
      </div>
      <div class="chart">
        <SaleChart :dateR="dateR" :listingID="listingID"></SaleChart>
      </div>
      <div class="chart">
        <PriceChart :dateR="dateR" :listingID="listingID"></PriceChart>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import moment from "moment";
import SaleChart from "@/components/app/mercado/SaleChart";
import PriceChart from "@/components/app/mercado/PriceChart";

export default {
  name: "Listing",
  props: {siteID: String},
  components:{
    SaleChart, PriceChart
  },
  data() {
    return {
      listings: [],
      total: 0, // 总条数
      page: 1,  // 当前页
      size: 20,  // 页大小
      searchValue: '',
      loading: false,
      item_id: null,
      cost: null,
      collectStatus: false,
      noteVisible: false,
      saleVisible: false,
      listingID: null,
      dateR: [],
      listing: {
        id: null,
        note: null
      },
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
            picker.$emit('pick', [start, end]);
          }
        }]
      },
    }
  },
  filters: {
    //时间日期格式化
    datetime: function (value) {
      return moment(value).format("YYYY-MM-DD");
    },
    //增长状态格式化
    grow: function (value) {
      if (value > 0){
        return value + '%'
      }
      if (value < 0){
        return Math.abs(value) + '%'
      }
      if (value === 0){
        return '=='
      }
    },
  },
  mounted() {
    this.initListings();
    this.getDefaultTime()
  },
  watch: {
    siteID:{
      handler(val){
        this.initListings();
      }

    }
  },
  methods:{
    // 设置默认的开始与结束时间
    getDefaultTime() {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      this.dateR[0] = moment(start).format("YYYY-MM-DD"); // 开始时间
      this.dateR[1] = moment(end).format("YYYY-MM-DD"); // 结束时间
    },
    saleChart(id){
      this.listingID = id
      this.saleVisible = true
    },
    checkCollection(){
      this.page = 1
      this.initListings();
    },
    saveNote(){
      this.loading = true
      this.patchRequest('api/med_listing/'+ this.listing.id+'/', {'note': this.listing.note}).then(resp => {
        this.initListings();
        this.loading = false;
        this.noteVisible = false
      })
    },
    editNote(row){
      Object.assign(this.listing, row)
      this.noteVisible = true
    },
    collectListing(row){
      this.loading = true
      this.patchRequest('api/med_listing/'+ row.id+'/', {'collection': !row.collection}).then(resp => {
        this.initListings();
        this.loading = false;
      })
    },
    deleteListing(id){
      this.$confirm('是否删除链接？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        this.deleteRequest('api/med_listing/'+ id+'/').then(resp => {
          this.initListings();
          this.loading = false;
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        });
      });
    },
    popoverShow(cost){
      this.cost = cost
    },
    popoverHide(cost){
      this.cost = null
    },
    // 搜索
    doSearch() {
      this.page = 1;
      this.initListings();
    },
    // 重置搜索内容
    clearSearchValue() {
      this.searchValue = '';
      this.initListings();
    },
    // 分页大小
    sizeChange(size) {
      this.size = size;
      this.initListings();
    },
    // 页码
    currentChange(page) {
      this.page = page;
      this.initListings();
    },
    //跳转产品链接页面
    goListing(url){
      window.open(url, '_blank');
    },
    changeCost(row){
      this.postRequest('api/med_listing/calc_profit/', {'id': row.id, 'cost': this.cost}).then(resp => {
        if (resp) {
          // 关闭 doClose()
          this.$refs[`popover-${row.id}`].doClose();
          this.initListings();
        }

      })},
    //添加跟踪商品
    addListing(){
      this.$prompt('请输入商品ID', '添加跟踪商品', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        closeOnClickModal: false
      }).then(({ value }) => {
        let reg= /^[A-Za-z]+$/
        let site = value.slice(0, 3)
        if (reg.test(site)) {
          this.item_id = value
        } else {
          this.item_id = this.siteID + value
        }
        this.loading = true;
        this.postRequest('api/med_listing/create_listing/', {'item_id': this.item_id}).then(resp => {
          this.loading = false;
          if (resp) {
            this.initListings();
          }

        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        });
      });
    },
    initListings(){
      let url = 'api/med_listing/?page=' + this.page + '&page_size=' + this.size
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
          this.listings = resp.results;
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
.up{
  color: red;
}
.down{
  color: green;
}
.cost{
  color: #919398;
}
.chart{
  height: 500px;
}
</style>