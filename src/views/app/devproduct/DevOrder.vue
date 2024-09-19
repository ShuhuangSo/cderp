<template>
  <div class="mainList">
    <div style="margin-left: 10px">
      <el-button icon="el-icon-files"
                 @click="$router.push({
                            path: '/devProduct',
                          });"
                 plain size="medium">产品管理</el-button>
      <el-button icon="el-icon-user-solid"
                 @click="$router.push({
                            path: '/devListingManage',
                          });"
                 plain size="medium">账号刊登管理</el-button>
    </div>

    <div class="operate">

      <div>
        <el-input size="small" placeholder="产品名称 SKU itemID 订单号"
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
                   @change="initOrders" placeholder="请选择账号">
          <el-option
              v-for="item in account_group"
              :key="item.name"
              :label="item.name"
              :value="item.name">
          </el-option>
        </el-select>
        <el-select v-model="site"
                   style="width: 100px;margin-left: 5px"
                   @change="initOrders" placeholder="请选择筛选项">
          <el-option
              v-for="item in site_group"
              :key="item.name"
              :label="item.name"
              :value="item.value">
          </el-option>
        </el-select>
        <el-select v-model="filter_name"
                   style="width: 150px;margin-left: 5px; margin-right: 5px"
                   @change="changeFilter" placeholder="请选择筛选项">
          <el-option
              v-for="item in filter_group"
              :key="item.name"
              :label="item.name"
              :value="item.value">
          </el-option>
        </el-select>
        <el-date-picker
            v-model="cus_date"
            :editable="false"
            :clearable="false"
            type="daterange"
            align="right"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            style="width: 250px"
            @change="changeFilter"
            :picker-options="pickerOptions">
        </el-date-picker>

      </div>
      <div>
        <el-button
            type="success" icon="el-icon-upload"
            @click="uploadVisible=true"
            >导入订单</el-button>
      </div>
    </div>

    <div :class="uploadNotify.upload_status === 'ERROR'?'filterShow_red':'filterShow_blue'" v-if="uploadNotify.upload_status === 'LOADING' || uploadNotify.upload_status === 'ERROR'">
      <div v-if="uploadNotify.upload_status !== 'ERROR'">
        <span class="upload_zi">{{this.uploadNotify.create_time | date}}</span>
        <span class="upload_zi">{{this.uploadNotify.desc}}</span>
        <el-button style="margin-left: 10px" type="text" @click="getUploadNotify">刷新状态</el-button>
      </div>
      <div v-if="uploadNotify.upload_status === 'ERROR'">
        <span class="upload_zi_red">{{this.uploadNotify.create_time | date}}</span>
        <span class="upload_zi_red">上传失败，{{this.uploadNotify.desc}}</span>
        <el-button style="margin-left: 10px" type="text" @click="uploadVisible=true">重新上传</el-button>
      </div>
    </div>

    <el-table
        ref="orderTable"
        :header-cell-style="{background:'#fafafa'}"
        :data="orders"
        v-loading="loading"
        style="width: 98%; margin: 10px">

      <el-table-column
          label="图片"
          align="center"
          header-align="center"
          width="80">
        <template slot-scope="scope">
          <el-image
              style="width: 70px; height: 70px"
              :src="scope.row.image | smpic"
              :preview-src-list="[scope.row.image?scope.row.image+'?' + Math.random():'']"
              fit="fill">
          </el-image>
        </template>
      </el-table-column>

      <el-table-column
          label="产品"
          min-width="200"
          show-overflow-tooltip>
        <template slot-scope="scope">
          <div style="font-weight: bold">{{ scope.row.sku }}
            <el-link @click.native="copyText(scope.row.sku)"
                     style="margin-bottom: 3px"
                     :underline="false"><i class="el-icon-copy-document"></i></el-link>
          </div>

          <div>{{ scope.row.cn_name }}</div>
          <div class="gray_zi">{{ scope.row.item_id }}
            <el-link :href="scope.row.sale_url"
                     title="查看平台链接"
                     :underline="false" target="_blank"><i class="el-icon-link"></i></el-link>
            <el-link @click.native="selectItemID(scope.row.item_id)"
                     style="margin-left: 5px"
                     title="筛选当前ItemID"
                     :underline="false"><i class="el-icon-connection"></i></el-link>
            <el-link @click.native="copyText(scope.row.item_id)"
                     style="margin-left: 5px"
                     title="复制"
                     :underline="false"><i class="el-icon-copy-document"></i></el-link>
          </div>
        </template>
      </el-table-column>

      <el-table-column
          label="订单号"
          width="150">
        <template slot-scope="scope">
          <div>
            <el-link
                style="margin-bottom: 2px; font-weight: normal; font-size: 12px"
                @click.native="checkOrderDetail(scope.row)"
                :underline="false">
              {{ scope.row.order_number }}
            </el-link>
          </div>
          <el-tag v-if="scope.row.is_ad" type="warning" size="mini" effect="dark">广告</el-tag>
          <el-tag v-if="scope.row.is_combined"
                  style="margin-left: 5px"
                  type=""
                  size="mini">
            合并</el-tag>
          <el-tag v-if="scope.row.is_resent"
                  style="margin-left: 5px"
                  type="danger"
                  size="mini">
            重发</el-tag>
          <el-tag v-if="!scope.row.is_settled"
                  style="margin-left: 5px"
                  type="warning"
                  size="mini">
            待结算</el-tag>
        </template>
      </el-table-column>

      <el-table-column
          align="center"
          header-align="center"
          width="150"
          label="账号">
        <template slot-scope="scope">
          <div>{{scope.row.account_name}}</div>
          <div class="gray_zi">{{ scope.row.platform }}
            <el-divider direction="vertical"></el-divider>
            {{ scope.row.site }}</div>

        </template>
      </el-table-column>

      <el-table-column
          label="数量"
          align="center"
          header-align="center"
          width="60">
        <template slot-scope="scope">
          <div>{{ scope.row.qty }}</div>
        </template>
      </el-table-column>

      <el-table-column
          label="币种"
          align="center"
          header-align="center"
          width="50">
        <template slot-scope="scope">
          <div>{{ scope.row.currency }}</div>
        </template>
      </el-table-column>

      <el-table-column
          label="售价"
          align="center"
          header-align="center"
          width="80">
        <template slot-scope="scope">
          <div>{{ scope.row.item_price }}</div>
        </template>
      </el-table-column>
      <el-table-column
          label="收取运费"
          align="center"
          header-align="center"
          width="80">
        <template slot-scope="scope">
          <div>{{ scope.row.postage_price }}</div>
        </template>
      </el-table-column>
      <el-table-column
          label="总价"
          align="center"
          header-align="center"
          width="80">
        <template slot-scope="scope">
          <div>{{ scope.row.total_price }}</div>
        </template>
      </el-table-column>
      <el-table-column
          label="发货运费"
          align="center"
          header-align="center"
          width="80">
        <template slot-scope="scope">
          <div>{{ scope.row.postage | currency }}</div>
        </template>
      </el-table-column>

      <el-table-column
          label="毛利润"
          align="center"
          header-align="center"
          width="120">
        <template slot-scope="scope">
          <div v-if="scope.row.profit > 0" class="positive">{{ scope.row.profit | currency}}</div>
          <div v-if="scope.row.profit <= 0" class="negitive">{{ scope.row.profit | currency}}</div>
        </template>
      </el-table-column>

      <el-table-column
          label="毛利率"
          align="center"
          header-align="center"
          width="120">
        <template slot-scope="scope">
          <div v-if="scope.row.profit_rate > 0" class="positive">{{ scope.row.profit_rate | rate}}</div>
          <div v-if="scope.row.profit_rate <= 0" class="negitive">{{ scope.row.profit_rate | rate}}</div>
        </template>
      </el-table-column>

      <el-table-column
          label="订单日期"
          align="center"
          header-align="center"
          width="150">
        <template slot-scope="scope">
          {{scope.row.order_time | date}}
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

    <!--    批量上传弹窗-->
    <el-dialog
        title="批量上传"
        :visible.sync="uploadVisible"
        :destroy-on-close="true"
        :close-on-click-modal="false"
        width="500px"
    >
      <div>
        <el-upload
            v-loading="loading"
            style="margin-left: 50px;"
            ref="upload"
            name="excel"
            :headers="headers"
            :on-success="onSuccess"
            :auto-upload="false"
            :before-upload="beforeUpload"
            accept=".xlsx,.xls"
            :limit="1"
            drag
            action="api/dev_order/bulk_upload2/">
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div class="el-upload__tip" slot="tip">只能上传excel文件,
            <el-link href="/media/template/dev_orders_upload_template.xlsx" target="_blank">模板下载</el-link>
          </div>

        </el-upload>

      </div>
      <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="uploadVisible = false">取 消</el-button>
          <el-button size="small" type="primary" :disabled="loading" @click="submitUpload">开始导入</el-button>
        </span>
    </el-dialog>

    <!--    订单详情弹窗-->
    <el-dialog
        title="销售订单详情"
        :visible.sync="orderVisible"
        :destroy-on-close="true"
        :close-on-click-modal="false"
        width="800px"
    >
      <div style="padding-left: 30px;padding-right: 30px">

        <h3 style="color: #409EFF">订单详情</h3>
        <el-descriptions :column="1" size="medium" :label-style="LS">
          <el-descriptions-item label="订单状态"><el-tag>
            {{ this.orderDetail.is_settled | status }}</el-tag></el-descriptions-item>
          <el-descriptions-item label="订单编号">{{ this.orderDetail.order_number }}</el-descriptions-item>
        </el-descriptions>

        <h3 style="color: #409EFF">财务统计</h3>
        <el-collapse :value="['1', '2', '3', '4']">
          <el-collapse-item title="销售费用" name="1">
            <div style="width: 500px">
              <el-descriptions :column="1" size="medium" :label-style="LS">
                <el-descriptions-item label="平台">{{ this.orderDetail.platform }}</el-descriptions-item>
                <el-descriptions-item label="站点">{{ this.orderDetail.site }}</el-descriptions-item>
                <el-descriptions-item label="订单总价">{{ this.orderDetail.total_price | f_currency }}</el-descriptions-item>
                <el-descriptions-item label="销售单价">{{ this.orderDetail.item_price | f_currency }}</el-descriptions-item>
                <el-descriptions-item label="数量">{{ this.orderDetail.qty }}</el-descriptions-item>
                <el-descriptions-item label="收取运费">{{ this.orderDetail.postage_price | f_currency }}</el-descriptions-item>
                <el-descriptions-item label="广告费">{{ this.orderDetail.ad_fee | currency }}</el-descriptions-item>
                <el-descriptions-item label="币种">{{ this.orderDetail.currency }}</el-descriptions-item>
                <el-descriptions-item label="即时汇率">{{ this.orderDetail.ex_rate }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </el-collapse-item>
          <el-collapse-item title="产品成本" name="2">
            <div style="width: 500px">
              <el-descriptions :column="1"  size="medium" :label-style="LS">
                <el-descriptions-item label="采购成本">{{ this.orderDetail.unit_cost | currency}}</el-descriptions-item>
                <el-descriptions-item label="发货邮费">{{ this.orderDetail.postage | currency }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </el-collapse-item>
          <el-collapse-item title="利润" name="3">
            <div style="width: 500px">
              <el-descriptions :column="1"  size="medium" :label-style="LS">
                <el-descriptions-item label="毛利润">{{ this.orderDetail.profit | currency }}</el-descriptions-item>
                <el-descriptions-item label="毛利率">{{ this.orderDetail.profit_rate | rate }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </el-collapse-item>

        </el-collapse>

      </div>
      <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="orderVisible = false">关 闭</el-button>
        </span>
    </el-dialog>

  </div>
</template>

<script>
import moment from "moment/moment";

export default {
  name: "DevOrder",
  data(){
    return{
      loading: false,
      total: 0, // 总条数
      page: 1,  // 当前页
      size: 20,  // 页大小
      searchValue: '',
      orders: [],
      uploadVisible: false,
      // 批量上传认证
      headers: {
        Authorization: window.localStorage.getItem('tokenStr'),
      },
      uploadNotify: {
        'upload_status': null,
        'desc': null,
        'create_time': null,
      },
      account: '全部账号',
      account_group: [],
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
      filter_name: '', // 库存筛选
      filter_group: [
        {
          name: '全部订单',
          value: ''
        },
        {
          name: '有广告',
          value: '&is_ad=True'
        },
        {
          name: '无广告',
          value: '&is_ad=False'
        },
        {
          name: '重发订单',
          value: '&is_resent=True'
        },
        {
          name: '未结算',
          value: '&is_settled=False'
        },
        {
          name: '已结算',
          value: '&is_settled=True'
        },
        {
          name: '合并订单',
          value: '&is_combined=True'
        },
      ],
      orderVisible: false, //订单详情弹窗
      LS: {
        width: '150px',
      },
      cus_date: '', // 订单日期筛选
      orderDetail: {}, //订单详情
      start_date: '', // 订单日期筛选
      end_date: '', // 订单日期筛选
      pickerOptions: {
        shortcuts: [{
          text: '昨天',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 1);
            end.setTime(end.getTime() - 3600 * 1000 * 24 * 1);
            picker.$emit('pick', [start, end]);
          }
        },
          {
            text: '最近一周',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          },
          {
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
  filters:{
    //百分比格式化
    status: function (value) {
      if (value) return '已结算'
      return '未结算'
    },
    //百分比格式化
    rate: function (value) {
      if (!value) return 0;
      value = value * 100
      return `${value.toFixed(1)}%`;
    },
    //rmb金额格式化
    currency: function (value) {
      if (!value) return 0.00;
      return `¥ ${value.toFixed(2)}`;
    },
    //rmb金额格式化
    f_currency: function (value) {
      if (!value) return `$ 0.00`;
      if (value < 0) return `-$ ${Math.abs(value).toFixed(2)}`;
      return `$ ${value.toFixed(2)}`;
    },
    //时间日期格式化
    date: function (value) {
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
    //设置默认订单统计时间
    this.startSaleDate = new Date();
    this.endSaleDate = new Date();
    this.startSaleDate.setTime(this.startSaleDate.getTime() - 3600 * 1000 * 24 * 30);
    this.cus_date = [this.startSaleDate, this.endSaleDate]

    this.initAccountList()
    this.initOrders()
  },
  methods:{
    // 打开订单详情弹窗
    checkOrderDetail(obj){
      this.orderDetail = obj
      this.orderVisible = true
    },
    //改变筛选动作
    changeFilter(){
      this.page = 1;
      this.initOrders();
    },
    //快速筛选itemID
    selectItemID(item_id){
      this.page = 1;
      this.searchValue = item_id
      this.initOrders();
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
    // 型号上传前的回调
    beforeUpload() {
      this.loading = true;
    },
    // 上传成功之后的回调
    onSuccess(response, file, fileList) {
      this.loading = false;
      this.$refs.upload.clearFiles();
      if (response.status === 'error') {
        this.$message.error(response.msg)
      }

      this.initOrders();
      this.uploadVisible = false;
    },
    // 上传
    submitUpload() {
      this.$refs.upload.submit();
    },
    // 分页大小
    sizeChange(size) {
      this.page = 1;
      this.size = size;
      this.initOrders();
    },
    // 页码
    currentChange(page) {
      this.page = page;
      this.initOrders();
    },
    // 重置搜索内容
    clearSearchValue() {
      this.searchValue = '';
      this.initOrders();
    },
    // 搜索
    doSearch() {
      this.page = 1;
      this.$refs.orderTable.clearFilter();
      this.initOrders();
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
    //获取订单上传状态
    getUploadNotify(){
      let url = 'api/ml_file_upload_notify/get_upload_result/'
      this.postRequest(url, {'id': 0}).then(resp => {
        if (resp) {
          this.uploadNotify.upload_status = resp.upload_status
          this.uploadNotify.desc = resp.desc
          this.uploadNotify.create_time = resp.create_time

          if (resp.upload_status === 'SUCCESS') {
            this.$message.success('订单成功导入！')
            this.initOrders()
          }
          if (resp.upload_status === 'LOADING') {
            this.$message.info('仍在处理中，请稍候')
          }

        }
      })
    },
    //更新订单上传状态
    updateUploadNotify(){
      let url = 'api/ml_file_upload_notify/get_upload_result/'
      this.postRequest(url, {'id': 0}).then(resp => {
        if (resp) {
          this.uploadNotify.upload_status = resp.upload_status
          this.uploadNotify.desc = resp.desc
          this.uploadNotify.create_time = resp.create_time
        }
      })
    },
    initOrders(){
      let url = '/api/dev_order/?page=' + this.page + '&page_size=' + this.size
      if (this.searchValue) {
        url += '&search=' + this.searchValue;
      }
      if (this.account!=='全部账号') {
        url += '&account_name=' + this.account;
      }
      if (this.site!=='') {
        url += '&site=' + this.site;
      }
      if (this.filter_name) {
        url += this.filter_name;
      }
      this.start_date =String(moment(this.cus_date[0]).format("YYYY-MM-DD"))+' 00:00:00'
      this.end_date = String(moment(this.cus_date[1]).format("YYYY-MM-DD"))+' 23:59:59'
      url += '&order_time__gte='+ this.start_date + '&order_time__lte=' + this.end_date

      url += '&ordering=-order_time'

      this.loading = true
      this.getRequest(url).then(resp => {
        this.loading = false
        this.updateUploadNotify() // 获取上传订单结果
        if (resp.results) {
          this.orders = resp.results;
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
.operate {
  margin-top: 10px;
  margin-left: 10px;
  margin-right: 20px;
  display: flex;
  justify-content: space-between;
}
.positive {
  font-weight: bold;
  color: green;
}
.negitive {
  font-weight: bold;
  color: #aa0515;
}
.gray_zi{
  color: #99a9bf;
}
.filterShow_blue {
  background-color: #ecf5ff;
  border: 1px solid #409EFF;
  margin-top: 5px;
  padding: 3px 3px 3px 50px;
  font-size: 14px;
  color: #303133;
}
.filterShow_red {
  background-color: #fff2f2;
  border: 1px solid #ff3131;
  margin-top: 5px;
  padding: 3px 3px 3px 50px;
  font-size: 14px;
  color: #303133;
}
.upload_zi {
  margin-right: 15px;
  font-size: 12px;
  color: #8492a6;
}
.upload_zi_red {
  margin-right: 15px;
  font-size: 12px;
  color: #aa0515;
}
</style>