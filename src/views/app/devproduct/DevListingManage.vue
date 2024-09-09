<template>
  <div class="mainList">
    <div style="margin-left: 10px">
      <el-button icon="el-icon-files"
                 @click="$router.push({
                            path: '/devProduct',
                          });"
                 plain size="medium">产品管理</el-button>
    </div>
    <div class="operate">

      <div>
        <el-input size="small" placeholder="产品名称 SKU itemID"
                  clearable
                  @clear="clearSearchValue"
                  @keyup.enter.native="doSearch"
                  v-model="searchValue"
                  style="width: 300px; margin-right: 5px">
          <el-button slot="append" icon="el-icon-search" @click="doSearch">搜索</el-button>
        </el-input>
        <el-select v-model="account"
                   filterable
                   style="width: 120px;margin-left: 5px"
                   @change="initListingAccount" placeholder="请选择账号">
          <el-option
              v-for="item in account_group"
              :key="item.name"
              :label="item.name"
              :value="item.name">
          </el-option>
        </el-select>


        <el-select v-model="manager"
                   style="width: 120px;margin-left: 5px"
                   @change="initListingAccount" placeholder="请选择筛选项">
          <el-option
              v-for="item in manager_group"
              :key="item.name"
              :label="item.name"
              :value="item.name">
          </el-option>
        </el-select>

        <el-select v-model="site"
                   style="width: 100px;margin-left: 5px"
                   @change="initListingAccount" placeholder="请选择筛选项">
          <el-option
              v-for="item in site_group"
              :key="item.name"
              :label="item.name"
              :value="item.value">
          </el-option>
        </el-select>


        <el-select v-model="ac_status"
                   style="width: 100px;margin-left: 5px"
                   @change="initListingAccount" placeholder="请选择筛选项">
          <el-option
              v-for="item in ac_status_group"
              :key="item.name"
              :label="item.name"
              :value="item.value">
          </el-option>
        </el-select>
        <el-switch
            style="margin-left: 10px"
            v-model="selectedUser"
            @change="initListingAccount"
            active-text="仅看我的账号">
        </el-switch>
      </div>
      <div>
        <el-button
            icon="el-icon-sold-out"
            @click="bulkEndListing"
            :disabled="!multipleSelection.length">批量下架</el-button>
      </div>
    </div>
    <el-table
        ref="accountTable"
        :header-cell-style="{background:'#fafafa'}"
        :data="listingAccount"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        style="width: 98%; margin: 10px">

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
              style="width: 50px; height: 50px"
              :src="scope.row.image | smpic"
              :preview-src-list="[scope.row.image?scope.row.image+'?' + Math.random():'']"
              fit="fill">
          </el-image>
        </template>
      </el-table-column>

      <el-table-column
          label="产品"
          show-overflow-tooltip
          width="300">
        <template slot-scope="scope">
          <div>
            <el-link
                style="font-weight: bold"
                @click.native="productDetail(scope.row.dev_p, 'first')"
                :underline="false">
              {{ scope.row.sku }}
            </el-link>
            <el-link @click.native="copyText(scope.row.sku)"
                     style="margin-left: 5px"
                     :underline="false"><i class="el-icon-copy-document"></i></el-link>

          </div>
          <div>{{ scope.row.cn_name }}</div>
          <div>{{ scope.row.en_name }}</div>
          <div class="gray_zi">
            {{ scope.row.platform }}
            <el-divider direction="vertical"></el-divider>
            {{ scope.row.site }}
            <el-divider direction="vertical"></el-divider>
            {{ scope.row.price }}
          </div>

        </template>
      </el-table-column>


      <el-table-column
          align="center"
          header-align="center"
          width="150"
          label="账号">
        <template slot-scope="scope">
          <div>{{scope.row.account_name}}</div>
          <div class="gray_zi">{{scope.row.user_name}}</div>
        </template>
      </el-table-column>

      <el-table-column
          align="center"
          header-align="center"
          width="80"
          label="状态">
        <template slot-scope="scope">
          <el-tag
              v-if="scope.row.is_online && !scope.row.is_paused"
              style="border: none"
              effect="dark" type="success">
            <span style="font-weight: bold">在线</span>
          </el-tag>
          <el-tag
              v-if="scope.row.is_online && scope.row.is_paused"
              style="border: none"
              effect="dark" type="warning">
            <span style="font-weight: bold">暂停</span>
          </el-tag>
          <el-tag
              v-if="!scope.row.is_online"
              style="border: none"
              effect="dark" type="info">
            <span style="font-weight: bold">未上架</span>
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
          label="产品链接"
          align="center"
          header-align="center">
        <template slot-scope="scope">
          <div v-if="scope.row.item_id">
            {{scope.row.item_id}}
            <el-link :href="scope.row.sale_url"
                     title="查看平台链接"
                     :underline="false" target="_blank"><i class="el-icon-link"></i></el-link>
            <el-link @click.native="openUpdateWindow(scope.row)"
                     title="修改"
                     style="margin-left: 5px"
                     :underline="false" target="_blank"><i class="el-icon-edit-outline"></i></el-link>
            <el-tooltip effect="dark" :disabled='!scope.row.note' :content="scope.row.note" placement="top">
              <el-link @click.native="openUpdateWindow(scope.row)"
                       title="备注"
                       :class="scope.row.note?'small_icon_true':'small_icon'"
                       :underline="false"><i class="el-icon-chat-line-square"></i></el-link>
            </el-tooltip>
            <el-tag
                style="margin-left: 15px"
                v-if="scope.row.notify === 1"
                type="danger">
              <i class="el-icon-warning"></i> 产品定价变动
            </el-tag>
            <el-tag
                style="margin-left: 15px"
                v-if="scope.row.notify === 2"
                type="danger">
              <i class="el-icon-warning"></i> 产品要求暂停
            </el-tag>
            <el-tag
                style="margin-left: 15px"
                v-if="scope.row.notify === 3"
                type="danger">
              <i class="el-icon-warning"></i> 产品要求翻新
            </el-tag>
            <el-tag
                style="margin-left: 15px"
                v-if="scope.row.notify === 4"
                type="danger">
              <i class="el-icon-warning"></i> 产品要求恢复
            </el-tag>
            <el-tag
                style="margin-left: 15px"
                v-if="scope.row.notify === 5"
                type="danger">
              <i class="el-icon-warning"></i> 产品要求下架
            </el-tag>
            <el-button v-if="scope.row.notify"
                       style="margin-left: 5px"
                       @click="confirmChanged(scope.row.id, scope.row.notify)"
                       size="mini" plain >确认</el-button>
          </div>
        </template>
      </el-table-column>

      <el-table-column
          align="center"
          header-align="center"
          width="130"
          label="发布|上架时间">
        <template slot-scope="scope">
          <div v-if="scope.row.online_time">{{scope.row.online_time | dateT}}</div>
          <div v-if="!scope.row.online_time"><i class="el-icon-time"></i></div>
          <div>{{scope.row.create_time | dateT}}</div>
        </template>
      </el-table-column>

      <el-table-column
          align="center"
          header-align="center"
          width="150"
          label="操作">
        <template slot-scope="scope">
          <el-button v-if="!scope.row.is_online"
                     @click="openCreateWindow(scope.row)"
                     size="mini" plain type="primary">上架</el-button>

          <el-button v-if="scope.row.is_online"
                     @click="pauseListing(scope.row.id, scope.row.is_paused)"
                     size="mini" plain :type="scope.row.is_paused?'success':'warning'">{{ scope.row.is_paused? '恢复': '暂停'}}</el-button>
          <el-button v-if="scope.row.is_online"
                     @click="endListing(scope.row.id)"
                     size="mini" plain type="danger">下架</el-button>

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
          :current-page="page"
          :total="total">
      </el-pagination>
    </div>

    <!--    产品详情弹窗-->
    <el-dialog
        title="产品详情"
        :visible.sync="productDetailVisible"
        :destroy-on-close="true"
        :close-on-click-modal="false"
        width="1200px"
    >
      <DevProductDetail ref="productDetail"
                        :key="timer"
                        :productID="productID"
                        :tab="tab"></DevProductDetail>
      <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="productDetailVisible=false">关 闭</el-button>
        </span>
    </el-dialog>

    <!--    上架弹窗-->
    <el-dialog
        title="产品上架"
        :visible.sync="listingVisible"
        :destroy-on-close="true"
        :close-on-click-modal="false"
        append-to-body
        width="500px"
    >
      <el-form ref="listingForm" label-width="100px">
        <el-form-item  label="itemID" prop="itemID">
          <el-input v-model="listingItem.item_id" class="inputwidth"></el-input>
        </el-form-item>
        <el-form-item  label="备注" prop="note">
          <el-input type="textarea" v-model="listingItem.note" class="inputwidth"></el-input>
        </el-form-item>

      </el-form>

      <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="closeWindow">取 消</el-button>
          <el-button size="small"
                     v-if="!listingItem.is_online"
                     :disabled="!listingItem.item_id"
                     @click="createListing" type="primary">上 架</el-button>
          <el-button size="small"
                     v-if="listingItem.is_online"
                     :disabled="!listingItem.item_id"
                     @click="updateListing" type="primary">修 改</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import DevProductDetail from "@/views/app/devproduct/DevProductDetail";
import moment from "moment";

export default {
  name: "DevListingManage",
  components:{DevProductDetail},
  data(){
    return{
      user: JSON.parse(window.sessionStorage.getItem('user')),
      loading: false,
      total: 0, // 总条数
      page: 1,  // 当前页
      size: 20,  // 页大小
      searchValue: '',
      selectedUser: false, //仅看自己账号
      listingAccount: [],
      listingVisible: false, //弹窗
      listingItem: {
        id: null,
        item_id: null,
        note: '',
      }, //上架项
      site: '', //选中站点
      site_group: [
        {
          name: '全部站点',
          value: ''
        },
        {
          name: '澳洲',
          value: 'AU'
        },
        {
          name: '英国',
          value: 'UK'
        }
      ],
      ac_status: '', //选中站点
      ac_status_group: [
        {
          name: '全部状态',
          value: ''
        },
        {
          name: '在线',
          value: '&is_online=true&is_paused=false'
        },
        {
          name: '未上架',
          value: '&is_online=false'
        },
        {
          name: '暂停',
          value: '&is_paused=true'
        }
      ],
      account: '全部账号',
      account_group: [],
      manager: '全部负责人',
      manager_group: [],
      productDetailVisible: false, //产品详情弹窗
      productID: 0, // 产品id
      timer: null,
      tab: 'first', //弹窗定位tab
      multipleSelection: [], // 选中行
    }
  },
  filters:{
    //时间日期格式化
    dateT: function (value) {
      if (!value) return ''
      return moment(value).format("YYYY-MM-DD HH:mm");
    },
    //图片地址格式化
    smpic: function (value) {
      if (!value) return '';
      let url = value.slice(0, value.length-4)
      return url + '_100x100.jpg/?' + Math.random()
    },
  },
  mounted() {
    this.initAccountList()
    this.initManagers()
    this.initListingAccount()
  },
  methods:{
    // 处理多选
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    //打开产品详情弹窗
    productDetail(id,tab){
      this.timer = new Date().getTime();
      this.productID = id;
      this.tab = tab;
      this.productDetailVisible = true;
    },
    //点击复制
    copyText(value){
      let text = value;
      if (navigator.clipboard) {
        // clipboard api 复制
        navigator.clipboard.writeText(text);
      } else {
        let textarea = document.createElement('textarea');
        document.body.appendChild(textarea);
        // 隐藏此输入框
        textarea.style.position = 'fixed';
        textarea.style.clip = 'rect(0 0 0 0)';
        textarea.style.top = '10px';
        // 赋值
        textarea.value = text;
        // 选中
        textarea.select();
        // 复制
        document.execCommand('copy', true);
        // 移除输入框
        document.body.removeChild(textarea);
      }
      this.$message.success('已复制！')
    },
    //关闭上架窗口
    closeWindow(){
      this.listingItem.item_id = ''
      this.listingItem.note = ''
      this.listingVisible = false
    },
    //确认变动通知
    confirmChanged(id, notify){
      this.loading = true
      let url = 'api/dev_listing_account/confirm_notify/'
      this.postRequest(url, {'id': id, 'notify': notify}).then(resp => {
        this.loading = false
        if (resp.status === 'success') {
          this.initListingAccount();
        }
      })
    },
    //暂停
    pauseListing(id, status){
      this.$confirm(status?'是否确定恢复？':'是否确定暂停？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        let url = 'api/dev_listing_account/pause_listing/'
        this.postRequest(url, {'id': id, 'status': status}).then(resp => {
          this.loading = false
          if (resp.status === 'success') {
            this.initListingAccount();
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        });
      });
    },
    //批量下架
    bulkEndListing(){
      let ids = []
      this.multipleSelection.forEach(item=>{
        ids.push(item.id)
      })
      this.$confirm('是否确定批量下架？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        let url = 'api/dev_listing_account/bulk_end_listing/'
        this.postRequest(url, {'ids': ids}).then(resp => {
          this.loading = false
          if (resp.status === 'success') {
            this.initListingAccount();
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        });
      });
    },
    //下架
    endListing(id){
      this.$confirm('是否确定下架？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        let url = 'api/dev_listing_account/end_listing/'
        this.postRequest(url, {'id': id}).then(resp => {
          this.loading = false
          if (resp) {
            this.initListingAccount();
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        });
      });
    },
    //上架弹窗
    openCreateWindow(row){
      this.listingItem = row
      this.listingVisible = true
    },
    //修改弹窗
    openUpdateWindow(row){
      Object.assign(this.listingItem, row)
      this.listingVisible = true
    },
    // 分页大小
    sizeChange(size) {
      this.page = 1;
      this.size = size;
      this.initListingAccount();
    },
    // 页码
    currentChange(page) {
      this.page = page;
      this.initListingAccount();
    },
    // 重置搜索内容
    clearSearchValue() {
      this.searchValue = '';
      this.initListingAccount();
    },
    // 搜索
    doSearch() {
      this.page = 1;
      this.$refs.accountTable.clearFilter();
      this.initListingAccount();
    },
    //上架
    createListing(){
      this.loading = true
      let url = 'api/dev_listing_account/create_listing/'
      this.postRequest(url, this.listingItem).then(resp => {
        this.loading = false
        if (resp.status === 'success') {
          this.initListingAccount();
          this.listingVisible = false;
        }
      })
    },
    //上架
    updateListing(){
      this.loading = true
      let url = 'api/dev_listing_account/update_listing/'
      this.postRequest(url, this.listingItem).then(resp => {
        this.loading = false
        if (resp.status === 'success') {
          this.initListingAccount();
          this.listingVisible = false;
        }
      })
    },
    //初始化负责人
    initManagers(){
      let url = 'api/bo_manager/?is_active=true'
      this.getRequest(url).then(resp => {
        if (resp) {
          this.manager_group = resp
          this.manager_group.unshift({'name': '全部负责人'})
        }
      })
    },
    //初始化账号列表
    initAccountList(){
      this.loading = true
      let url = 'api/bo_bonus_accounts/?is_active=true&page_size=1000'
      this.getRequest(url).then(resp => {
        this.loading = false
        if (resp.results) {
          this.account_group = resp.results;
          this.account_group.unshift({'name': '全部账号'})
        }
      })
    },
    initListingAccount(){
      let url = '/api/dev_listing_account/?page=' + this.page + '&page_size=' + this.size
      if (this.searchValue) {
        url += '&search=' + this.searchValue;
      }
      if (this.selectedUser) {
        url += '&user_id=' + this.user.id;
      }
      if (this.site!=='') {
        url += '&site=' + this.site;
      }
      if (this.account!=='全部账号') {
        url += '&account_name=' + this.account;
      }
      if (this.manager!=='全部负责人') {
        url += '&user_name=' + this.manager;
      }
      if (this.ac_status!=='') {
        url += this.ac_status;
      }
      url += '&dev_p__p_status=ONLINE'
      url += '&ordering=-create_time'

      this.loading = true
      this.getRequest(url).then(resp => {
        this.loading = false
        if (resp.results) {
          this.listingAccount = resp.results;
          this.total = resp.count;
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
  border-radius: 15px;
}
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}
.inputwidth {
  width: 300px;
}
.small_icon{
  color: #99a9bf;
  margin-left: 5px;
}
.small_icon_true{
  color: #aa0515;
  margin-left: 5px;
}
.operate {
  margin-top: 10px;
  margin-left: 10px;
  margin-right: 20px;
  display: flex;
  justify-content: space-between;
}
.gray_zi{
  color: #99a9bf;
}
</style>