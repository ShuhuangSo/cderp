/*
美客多FBM库存
*/
<template>
  <div>
    <div v-if="permission.fbmStock_shopData">
      <el-card class="small-card" shadow="never">
        <div style="display: flex;justify-content: space-between">
          <span class="chartTitle">店铺数据</span>
          <span>
            <i class="el-icon-loading" v-if="tStockLoading"></i>
            <el-link type="info"
                     v-if="!tStockLoading"
                     @click.native="getTodayStock"
                     :underline="false"
                     icon="el-icon-refresh-right"></el-link>
          </span>
        </div>

        <div style="display: flex;justify-content: space-between; padding-top: 5px">
          <div style="width: 290px;text-align:center">
            <div class="title">库存</div>
            <div class="zTitle2">
              <animate-number ref="stockNum" from="0" :to="todayStockQty" :key="todayStockQty"
                              duration="1000"></animate-number>
            </div>
          </div>

          <div style="text-align:center; width: 290px">
            <div class="title">FBM库存占用</div>
            <div class="zTitle2">￥<animate-number ref="stockNum2" from="0" :to="todayStockAmount" :key="todayStockAmount"
                                                  duration="1000"></animate-number>
            </div>
          </div>

          <div style="text-align:center; width: 290px">
            <div class="title">在途占用</div>
            <div class="zTitle2">￥<animate-number ref="stockNum7" from="0" :to="onway_amount" :key="onway_amount"
                                                  duration="1000"></animate-number>
            </div>
          </div>

          <div style="text-align:center; width: 290px">
            <div class="title">中转占用</div>
            <div class="zTitle2">￥<animate-number ref="stockNum8" from="0" :to="trans_amount" :key="trans_amount"
                                                  duration="1000"></animate-number>
            </div>
          </div>

          <div style="width: 290px;text-align:center">
            <div class="title">30天销量</div>
            <div class="zTitle2">
              <animate-number ref="stockNum3" from="0" :to="sold_qty" :key="sold_qty"
                              duration="1000"></animate-number>
            </div>
          </div>

          <div style="text-align:center; width: 290px">
            <div class="title">30天销售额</div>
            <div class="zTitle2">$<animate-number ref="stockNum4" from="0" :to="sold_amount" :key="sold_amount"
                                                  duration="1000"></animate-number>
            </div>
          </div>

          <div style="text-align:center; width: 290px">
            <div class="title">30天毛利润</div>
            <div class="zTitle2">￥<animate-number ref="stockNum5" from="0" :to="sold_profit" :key="sold_profit"
                                                  duration="1000"></animate-number>
            </div>
          </div>

          <div style="text-align:center; width: 290px">
            <div class="title">30天净利润</div>
            <div class="zTitle2">￥<animate-number ref="stockNum6" from="0" :to="real_profit" :key="real_profit"
                                                  duration="1000"></animate-number>
            </div>
          </div>

        </div>
      </el-card>
    </div>
    <div class="operate">
      <div>
        <el-input size="small" placeholder="SKU 名称 ItemID UPC ML代码"
                  clearable
                  @clear="clearSearchValue"
                  @keyup.enter.native="doSearch"
                  v-model="searchValue"
                  style="width: 350px; margin-right: 5px">
          <el-button slot="append" icon="el-icon-search" @click="doSearch">搜索</el-button>
        </el-input>

        <el-select v-model="shopID"
                   style="width: 300px;"
                   @change="changeShop" placeholder="请选择店铺">
          <el-option
              v-for="item in shops"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            <span style="float: left">{{ item.name }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{ item.nickname }}</span>
          </el-option>
        </el-select>

        <el-select v-model="filter_name"
                   style="width: 150px;margin-left: 5px"
                   :disabled="!shopID"
                   @change="changeFilter" placeholder="请选择筛选项">
          <el-option
              v-for="item in filter_group"
              :key="item.name"
              :label="item.name"
              :value="item.value">
          </el-option>
        </el-select>

        <el-select v-model="sort"
                   style="width: 150px;margin-left: 5px"
                   :disabled="!shopID"
                   @change="changeFilter" placeholder="请选择排序项">
          <el-option
              v-for="item in ordering_group"
              :key="item.name"
              :label="item.name"
              :value="item.value">
          </el-option>
        </el-select>
      </div>

      <div>
        <el-button icon="el-icon-upload"
                   v-if="permission.fbmStock_import"
                   style="margin-right: 10px"
                   :disabled="!shopID"
                   @click="uploadVisible=true">FBM库存导入
        </el-button>
      </div>
    </div>

    <div style="margin-top: 5px">
      <el-table
          ref="productTable"
          :data="shopStocks"
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
                style="width: 80px; height: 80px"
                :src="scope.row.image | smpic"
                :preview-src-list="[scope.row.image?scope.row.image+'?' + Math.random():'']"
                fit="fill">
            </el-image>
          </template>
        </el-table-column>

        <el-table-column
            label="产品"
            min-width="120"
            show-overflow-tooltip>
          <template slot-scope="scope">
            <div style="font-weight: bold">{{ scope.row.sku }}
              <el-link @click.native="copyText(scope.row.sku)"
                       style="margin-bottom: 3px"
                       :underline="false"><i class="el-icon-copy-document"></i></el-link>
            </div>

            <div>{{ scope.row.p_name }}</div>
            <div>{{ scope.row.item_id }}
              <el-link :href="scope.row.sale_url"
                       title="查看平台链接"
                       :underline="false" target="_blank"><i class="el-icon-link"></i></el-link>
              <el-link @click.native="selectItemID(scope.row.item_id)"
                       title="筛选当前ItemID"
                       style="margin-left: 5px"
                       :underline="false"><i class="el-icon-connection"></i></el-link>
            </div>
            <div>
              <el-tag size="small" effect="plain" v-if="scope.row.p_status=='NORMAL'">普通</el-tag>
              <el-tag type="success" size="small" effect="plain" v-if="scope.row.p_status=='HOT_SALE'">热卖</el-tag>
              <el-tag type="danger" size="small" effect="plain" v-if="scope.row.p_status=='OFFLINE'">停售</el-tag>
              <el-tag type="warning" size="small" effect="plain" v-if="scope.row.p_status=='CLEAN'">清仓</el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column
            label="FBM库存">
          <template slot-scope="scope">

          <div style="display: flex;padding-top: 10px">
            <div style="width: 50px;text-align:center">
              <div>
                <el-popover
                    @show="showTagSelect"
                    placement="top"
                    width="500"
                    trigger="click">
                  <MelStockDetail
                      :obj="{'sku': scope.row.sku, 'op_type': 'FINISH'}"
                      :key="timer" v-if="isShow"></MelStockDetail>
                  <el-button type="text" slot="reference" class="stock_qty">{{ scope.row.qty }}</el-button>
                </el-popover>
              </div>
              <div>
                <div  class="small_zi">FBM</div>
              </div>
            </div>

            <div style="width: 50px;text-align:center">
              <div>
                <el-popover
                    @show="showTagSelect"
                    placement="top"
                    width="500"
                    trigger="click">
                  <MelStockDetail
                      :obj="{'sku': scope.row.sku, 'op_type': 'FBM_ONWAY'}"
                      :key="timer" v-if="isShow"></MelStockDetail>
                  <el-button type="text" slot="reference" class="onway_qty">{{ scope.row.fbm_onway_qty }}</el-button>
                </el-popover>
              </div>
              <div>
                <div  class="small_zi">FBM在途</div>
              </div>
            </div>
          </div>


          </template>
        </el-table-column>

        <el-table-column
            label="中转仓">
          <template slot-scope="scope">

            <div style="display: flex;padding-top: 10px">

              <div style="width: 50px;text-align:center">
                <div>
                  <el-popover
                      @show="showTagSelect"
                      placement="top"
                      width="500"
                      trigger="click">
                    <MelStockDetail
                        :obj="{'sku': scope.row.sku, 'op_type': 'TRANS'}"
                        :key="timer" v-if="isShow"></MelStockDetail>
                    <el-button type="text" slot="reference" class="zz_qty">{{ scope.row.trans_qty }}</el-button>
                  </el-popover>
                </div>
                <div>
                  <div  class="small_zi">中转</div>
                </div>
              </div>

              <div style="width: 50px;text-align:center">
                <div>
                  <el-popover
                      @show="showTagSelect"
                      placement="top"
                      width="500"
                      trigger="click">
                    <MelStockDetail
                        :obj="{'sku': scope.row.sku, 'op_type': 'TRANS_ONWAY'}"
                        :key="timer" v-if="isShow"></MelStockDetail>
                    <el-button type="text" slot="reference" class="onway_qty">{{ scope.row.trans_onway_qty }}</el-button>
                  </el-popover>
                </div>
                <div>
                  <div  class="small_zi">中转在途</div>
                </div>
              </div>
            </div>


          </template>
        </el-table-column>

        <el-table-column
            label="备货中 | 采购中 | 采购到货">
          <template slot-scope="scope">

            <div style="display: flex;padding-top: 10px">

              <div style="width: 50px;text-align:center">
                <div>
                  <el-button type="text" class="stock_qty">{{ scope.row.preparing_qty }}</el-button>
                </div>
                <div>
                  <div  class="small_zi">备货中</div>
                </div>
              </div>

              <div style="width: 50px;text-align:center">
                <div>
                  <el-button type="text" class="onway_qty">{{ scope.row.p_onway_qty }}</el-button>
                </div>
                <div>
                  <div  class="small_zi">采购中</div>
                </div>
              </div>

              <div style="width: 50px;text-align:center">
                <div>
                  <el-button type="text" class="zz_qty">{{ scope.row.p_rec_qty }}</el-button>
                </div>
                <div>
                  <div  class="small_zi">采购到货</div>
                </div>
              </div>
            </div>


          </template>
        </el-table-column>

        <el-table-column
            width="120"
            label="销量">
          <template slot-scope="scope">
            <div>7天销量: <span class="zi">{{scope.row.day7_sold}} </span>
            </div>
            <div>15天销量: <span class="zi">{{scope.row.day15_sold}} </span>
            </div>
            <div>30天销量: <span class="zi">{{scope.row.day30_sold}} </span>
            </div>
            <div>累计销量: <span class="zi">{{scope.row.total_sold}}</span></div>
          </template>
        </el-table-column>

        <el-table-column
            width="150"
            label="利润">
          <template slot-scope="scope">
            <div>平均毛利润: <span class="zi">{{scope.row.avg_profit | currency}} </span>
            </div>
            <div>平均毛利率: <span class="zi">{{scope.row.avg_profit_rate | rate}} </span>
            </div>
            <div>累计利润: <span class="zi">{{scope.row.total_profit | currency}}</span></div>
          </template>
        </el-table-column>

        <el-table-column
            align="center"
            header-align="center"
            width="60"
            label="退款率">
          <template slot-scope="scope">
            <div><span class="zi">{{scope.row.refund_rate | rate}} </span></div>
          </template>
        </el-table-column>

        <el-table-column
            align="center"
            header-align="center"
            label="均摊成本 | 均摊头程">
          <template slot-scope="scope">
            {{ scope.row.unit_cost | currency}}
            <el-divider direction="vertical"></el-divider>
            {{ scope.row.first_ship_cost | currency}}
          </template>
        </el-table-column>


        <el-table-column
            label="操作"
            align="center"
            header-align="center"
            width="50"
        >
          <template slot-scope="scope">
            <el-dropdown @command="handleProductOp">
              <el-button type="text">
                <i class="el-icon-more"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :disabled="!permission.fbmStock_pandian"
                                  :command="{type:'editQty', obj:scope.row}">盘点数量</el-dropdown-item>
                <el-dropdown-item :disabled="!permission.fbmStock_changeStatus"
                                  :command="{type:'editStatus', obj:scope.row}">修改状态</el-dropdown-item>
                <el-dropdown-item
                                  :command="{type:'stockLog', obj:scope.row}">库存日志</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
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
            :data="{'id': this.shopID}"
            :headers="headers"
            :on-success="onSuccess"
            :auto-upload="false"
            :before-upload="beforeUpload"
            :limit="1"
            drag
            action="api/ml_shopstock/fbm_upload/">
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div class="el-upload__tip" slot="tip">只能上传excel文件,
            <el-link href="/media/template/shop_stock_template.xlsx" target="_blank">模板下载</el-link>
          </div>
        </el-upload>

      </div>
      <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="uploadVisible = false">取 消</el-button>
          <el-button size="small" type="primary" @click="submitUpload">开始导入</el-button>
        </span>
    </el-dialog>

    <!--    库存盘点弹窗-->
    <el-dialog
        title="库存盘点"
        :visible.sync="changeStockVisible"
        :destroy-on-close="true"
        :close-on-click-modal="false"
        width="300px"
    >
      <div>
        盘点数量：
        <el-input-number
            style="width: 100%; margin-bottom: 20px"
            v-model="changeStockQty"
            :precision="0"
            controls-position="right"
            :min="0"></el-input-number>
      </div>
      <div>
        盘点原因：
        <el-select v-model="reason"
                   style="width: 100%"
                   placeholder="请选择原因">
          <el-option
              v-for="item in reason_group"
              :key="item.name"
              :label="item.name"
              :value="item.value">
          </el-option>
        </el-select>
      </div>

      <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="changeStockVisible = false">取 消</el-button>
          <el-button size="small" type="primary"
                     :disabled="!reason"
                     :loading="tStockLoading"
                     @click="submitChangeStock">确认修改</el-button>
        </span>
    </el-dialog>

    <!--    修改状态弹窗-->
    <el-dialog
        title="库存产品状态"
        :visible.sync="changeStatusVisible"
        :destroy-on-close="true"
        :close-on-click-modal="false"
        width="300px"
    >
      <div>
        <el-select v-model="changeStatus"
                   style="width: 100%"
                   placeholder="请选择产品状态">
          <el-option
              v-for="item in status_group"
              :key="item.name"
              :label="item.name"
              :value="item.value">
          </el-option>
        </el-select>
      </div>

      <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="changeStatusVisible = false">取 消</el-button>
          <el-button size="small" type="primary"
                     :disabled="!changeStatus"
                     :loading="tStockLoading"
                     @click="submitChangeStatus">确认修改</el-button>
        </span>
    </el-dialog>

    <!--    库存日志弹窗-->
    <el-dialog
        title="库存日志"
        :visible.sync="stockLogVisible"
        :destroy-on-close="true"
        :close-on-click-modal="false"
        width="800"
    >
      <div>
        <MLStockLog
            :key="timer"
            :obj="{'id':p_id,'type': 'SHOP_STOCK'}" ></MLStockLog>
      </div>

      <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="stockLogVisible = false">取 消</el-button>
          <el-button size="small" type="primary"
                     :disabled="!changeStatus"
                     :loading="tStockLoading"
                     @click="submitChangeStatus">确认修改</el-button>
        </span>
    </el-dialog>

  </div>
</template>

<script>
import moment from "moment/moment";
import MelStockDetail from "@/components/app/mercado/MelStockDetail";
import MLStockLog from "@/components/app/mercado/MLStockLog";

export default {
  name: "MelShopStock",
  components:{MelStockDetail, MLStockLog},
  data(){
    return{
      user: JSON.parse(window.sessionStorage.getItem('user')),
      permission: JSON.parse(window.sessionStorage.getItem('ml_permission')),
      shops: null,
      shopID: null,
      p_id: null, // 库存产品id
      shopStocks: null,
      loading: false,
      total: 0, // 总条数
      page: 1,  // 当前页
      size: 20,  // 页大小
      searchValue: '',
      uploadVisible: false,
      sort: '', //排序变量
      filter_name: '&p_status__in=NORMAL,HOT_SALE,CLEAN', // 库存筛选
      tStockLoading: false,
      todayStockQty: 0, // 今日库存量
      sold_qty: 0, // 30天销量
      todayStockAmount: 0.0, // 今日FBM库存金额
      onway_amount: 0.0, // 在途金额
      trans_amount: 0.0, // 中转仓库存金额
      sold_amount: 0.0, // 30天销量额
      sold_profit: 0.0, // 30天毛利润
      real_profit: 0.0, // 30天净利润
      stockVisible: false, //在途库存情况
      changeStockVisible: false, //库存盘点弹窗显示
      changeStatusVisible: false, //库存状态弹窗显示
      stockLogVisible: false, //库存日志弹窗显示
      changeStockQty: null, // 盘点数量
      changeStockID: null, // 盘点的sku id
      changeStatus: null, // 修改状态
      reason: '', // 盘点理由
      timer: '',
      isShow: true,
      filter_group: [
        {
          name: '全部产品',
          value: ''
        },
        {
          name: '在售产品',
          value: '&p_status__in=NORMAL,HOT_SALE,CLEAN'
        },
        {
          name: '停售产品',
          value: '&p_status=OFFLINE'
        },
        {
          name: '清仓产品',
          value: '&p_status=CLEAN'
        },
        {
          name: '有货产品',
          value: '&qty__gt=0'
        },
        {
          name: '缺货产品',
          value: '&qty__lte=0'
        },
        {
          name: '在途产品',
          value: '&onway_qty__gt=0'
        },
        {
          name: '中转仓有货产品',
          value: '&trans_qty__gt=0'
        },
      ],
      ordering_group: [
        {
          name: '默认排序',
          value: ''
        },
        {
          name: 'FBM库存数量↓',
          value: '-qty'
        },
        {
          name: '在途数量↓',
          value: '-onway_qty'
        },
        {
          name: '中转仓数量↓',
          value: '-trans_qty'
        },
        {
          name: '总销量↓',
          value: '-total_sold'
        },
        {
          name: '30天销量↓',
          value: '-day30_sold'
        },
        {
          name: '15天销量↓',
          value: '-day15_sold'
        },
        {
          name: '退款率↓',
          value: '-refund_rate'
        },
        {
          name: '累计利润↓',
          value: '-total_profit'
        },
        {
          name: '毛利润↓',
          value: '-avg_profit'
        },
        {
          name: '毛利率↓',
          value: '-avg_profit_rate'
        },
      ],
      reason_group: [
        {
          name: '产品下架，库存销毁',
          value: '产品下架，库存销毁'
        },
        {
          name: '销售出入',
          value: '销售出入'
        },
      ],
      status_group: [
        {
          name: '普通',
          value: 'NORMAL'
        },
        {
          name: '热卖',
          value: 'HOT_SALE'
        },
        {
          name: '清仓',
          value: 'CLEAN'
        },
        {
          name: '停售',
          value: 'OFFLINE'
        },
      ],
      // 批量上传认证
      headers: {
        Authorization: window.localStorage.getItem('tokenStr'),
      },
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
    //rmb金额格式化
    rate: function (value) {
      if (!value) return 0;
      value = value * 100
      return `${value.toFixed(1)}%`;
    },
    //图片地址格式化
    smpic: function (value) {
      if (!value) return '';
      let url = value.slice(0, value.length-4)
      return url + '_100x100.jpg/?' + Math.random()
    },
  },
  mounted() {
    this.inintShops();
    this.getTodayStock() // 计算库存
  },
  methods:{
    // 盘点库存
    submitChangeStock(){
      this.tStockLoading = true
      let url = 'api/ml_shopstock/change_stock/'
      this.postRequest(url, {'id': this.changeStockID, 'qty': this.changeStockQty, 'reason': this.reason}).then(resp => {
        this.tStockLoading = false
        if (resp) {
          this.initShopStock();
          this.changeStockVisible = false
        }
      })
    },
    // 修改状态
    submitChangeStatus(){
      this.tStockLoading = true
      let url = 'api/ml_shopstock/change_status/'
      this.postRequest(url, {'id': this.changeStockID, 'status': this.changeStatus}).then(resp => {
        this.tStockLoading = false
        if (resp) {
          this.initShopStock();
          this.changeStatusVisible = false
        }
      })
    },
    // 产品更多操作
    handleProductOp(command) {
      // 编辑图片
      if (command['type'] === 'editQty') {
        this.changeStockQty = command['obj'].qty
        this.changeStockID = command['obj'].id
        this.reason = ''
        this.changeStockVisible = true
      }

      // 编辑产品状态
      if (command['type'] === 'editStatus') {
        this.changeStatus= command['obj'].p_status
        this.changeStockID = command['obj'].id
        this.changeStatusVisible = true
      }

      // 库存日志
      if (command['type'] === 'stockLog') {
        this.p_id = command['obj'].id
        this.timer = new Date().getTime();
        this.stockLogVisible = true
      }
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

    //快速筛选itemID
    selectItemID(item_id){
      this.page = 1;
      this.searchValue = item_id
      this.initShopStock();
    },
    //触发子组件更新
    showTagSelect(){
      this.isShow = false;
      this.timer = new Date().getTime();
      this.isShow = true;
    },
    // 型号上传前的回调
    beforeUpload() {
      this.loading = true;
    },
    // 上传成功之后的回调
    onSuccess(response, file, fileList) {
      this.loading = false;
      this.$refs.upload.clearFiles();
      this.initShopStock();
      this.uploadVisible = false;
    },
    // 上传
    submitUpload() {
      this.$refs.upload.submit();
    },

    // 重置搜索内容
    clearSearchValue() {
      this.searchValue = '';
      this.initShopStock();
    },
    // 搜索
    doSearch() {
      this.page = 1;
      this.$refs.productTable.clearFilter();
      this.initShopStock();
    },
    // 分页大小
    sizeChange(size) {
      this.page = 1;
      this.size = size;
      this.initShopStock();
    },
    // 页码
    currentChange(page) {
      this.page = page;
      this.initShopStock();
    },
    //改变筛选动作
    changeFilter(){
      this.page = 1;
      this.initShopStock();
    },
    //改变店铺动作
    changeShop(){
      this.page = 1;
      this.filter_name = '&p_status__in=NORMAL,HOT_SALE,CLEAN'
      this.initShopStock();
      this.getTodayStock() // 计算库存
    },

    //获取今日库存
    getTodayStock() {
      this.tStockLoading = true
      let url = 'api/ml_shopstock/calc_stock/'
      this.postRequest(url, {'id': this.shopID}).then(resp => {
        this.tStockLoading = false
        if (resp) {
          this.todayStockQty = resp.todayStockQty
          this.todayStockAmount = resp.todayStockAmount
          this.sold_qty = resp.sold_qty
          this.sold_amount = resp.sold_amount
          this.sold_profit = resp.sold_profit
          this.real_profit = resp.real_profit
          this.onway_amount = resp.onway_amount
          this.trans_amount = resp.trans_amount
          this.$nextTick(() => {
            this.$refs.stockNum.start()
            this.$refs.stockNum2.start()
            this.$refs.stockNum3.start()
            this.$refs.stockNum4.start()
            this.$refs.stockNum5.start()
            this.$refs.stockNum6.start()
            this.$refs.stockNum7.start()
            this.$refs.stockNum8.start()
          })
        }
      })
    },

    inintShops(){
      //获取所有可选店铺
      if(window.sessionStorage.getItem('ml_shops')) {
        this.shops = JSON.parse(window.sessionStorage.getItem('ml_shops'));

        if (this.shops.length) {
          this.shopID = this.shops[0].id
          this.filter_name = '&p_status__in=NORMAL,HOT_SALE,CLEAN'
          this.initShopStock()
        }
      }else{
        let url = 'api/ml_shops/?warehouse_type=FBM&page_size=1000&ordering=create_time'
        if (!this.user.is_superuser) {
          url += '&user=' + this.user.id;
        }
        this.getRequest(url).then(resp => {
          if (resp.results) {
            this.shops = resp.results;
            window.sessionStorage.setItem('ml_shops', JSON.stringify(this.shops));

            if (this.shops.length) {
              this.shopID = this.shops[0].id
              this.filter_name = '&p_status__in=NORMAL,HOT_SALE,CLEAN'
              this.initShopStock()
            }
          }
        })
      }

    },
    initShopStock(){
      let url = '/api/ml_shopstock/?shop=' + this.shopID + '&page=' + this.page + '&page_size=' + this.size
      if (this.searchValue) {
        url += '&search=' + this.searchValue;
      }
      if (this.filter_name) {
        url += this.filter_name;
      }
      url += '&ordering=' + this.sort + ',item_id'

      this.loading = true
      this.getRequest(url).then(resp => {
        this.loading = false
        if (resp.results) {
          this.shopStocks = resp.results;
          this.total = resp.count;
        }
      })
    }
  }
}
</script>

<style scoped>
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
.stock_qty {
  font-weight: bold;
  color: teal;
}
.onway_qty {
  font-weight: bold;
  color: #E6A23C;
}
.zi {
  font-weight: bold;
  color: green;
}
.zz_qty {
  font-weight: bold;
  color: cornflowerblue;
}
.small-card {
  width: 99%;
  height: 130px;
  margin-left: 5px;
  margin-right: 5px;
  margin-bottom: 10px;
}
.chartTitle {
  font-weight: bold;
  margin-right: 20px
}
.zTitle2 {
  font-weight: bold;
  font-size: 25px;
  color: #4f6782;
}
.title{
  color: #6e7079;
  font-size: 14px;
}
.small_zi {
  color: #8c939d;
  font-size: 10px
}
</style>