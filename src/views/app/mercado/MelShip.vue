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
          <span class="jiantou"><i class="el-icon-d-arrow-right"></i></span>

          <el-badge :value="shipped_qty" :hidden="!shipped_qty" class="item">
            <el-button size="small" :type="s_status==='SHIPPED'?'primary':''" @click="changeStatus('SHIPPED')">运输中</el-button>
          </el-badge>
          <span class="jiantou"><i class="el-icon-d-arrow-right"></i></span>

          <el-badge :value="booked_qty" :hidden="!booked_qty" class="item">
            <el-button size="small" :type="s_status==='BOOKED'?'primary':''" @click="changeStatus('BOOKED')">已预约</el-button>
          </el-badge>
          <span class="jiantou"><i class="el-icon-d-arrow-right"></i></span>

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

          <span style="font-size: 12px; color: #303133;margin-left: 10px;margin-right: 5px" v-if="s_status==='BOOKED'">入仓核查</span>
          <el-switch
              v-if="s_status==='BOOKED'"
              @change="initShips"
              v-model="wait_check">
          </el-switch>

          <el-radio-group
              style="margin-left: 50px;margin-right: 30px"
              @change="changeTarget" v-model="target">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button label="FBM">FBM入仓单</el-radio-button>
            <el-radio-button label="TRANSIT">中转仓单</el-radio-button>
          </el-radio-group>

          <el-select v-model="sort"
                     style="width: 150px;margin-left: 5px"
                     @change="changeTarget" placeholder="请选择排序项">
            <el-option
                v-for="item in ordering_group"
                :key="item.name"
                :label="item.name"
                :value="item.value">
            </el-option>
          </el-select>

        </div>

        <el-button type="success" icon="el-icon-plus"
                   :disabled="!permission.ship_create"
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
          highlight-current-row
          style="width: 100%">

        <!--        运单产品详情-->
        <el-table-column type="expand" width="40">
          <template slot="header" slot-scope="scope">
            <el-button size="medium" type="text" icon="el-icon-circle-plus"
                       @click="expendChange"
                       v-if="expandStatus">
            </el-button>
            <el-button size="medium" type="text" icon="el-icon-remove"
                       @click="expendChange"
                       v-if="!expandStatus">
            </el-button>
          </template>
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
                      :src="scope.row.image | smpic"
                      :preview-src-list="[scope.row.image?scope.row.image+'?' + Math.random():'']"
                      fit="fill">
                  </el-image>
                </template>
              </el-table-column>

              <el-table-column
                  label="产品"
                  show-overflow-tooltip>
                <template slot-scope="scope">
                  <div><span style="font-weight: bold">{{ scope.row.sku }} </span>
                    <el-tag v-if="scope.row.s_type==='NEW'" type="success" size="mini" effect="dark">新</el-tag>
                  </div>

                  <div>{{ scope.row.p_name }}</div>
                  <div v-if="s_status==='PREPARING'">
                    <span class="plan4" v-if="scope.row.total_onway_qty">
                <i class="el-icon-truck"></i>在途 {{ scope.row.total_onway_qty }}</span>
                    <span class="plan3" v-if="scope.row.total_rec_qty">
                <i class="el-icon-receiving"></i>到货 {{ scope.row.total_rec_qty }}</span>
                    <span class="plan5" v-if="!scope.row.total_rec_qty && !scope.row.total_onway_qty">
                <i class="el-icon-warning-outline"></i>未采购</span>
                  </div>
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
                  label="数量"
                  align="center"
                  header-align="center"
                  width="180">
                <template slot-scope="scope">
                  <div class="zi">{{ scope.row.qty }}</div>
                </template>
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
                  label="分摊运费"
                  align="center"
                  header-align="center"
                  width="70">
                <template slot-scope="scope">
                  <span>{{ scope.row.avg_ship_fee | currency }}</span>
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
            label="批次号 | 目标店铺"
            align="center"
            header-align="center"
            width="150">
          <template slot-scope="scope">
            <div>
              <el-link
                  class="m_name"
                  @click.native="checkShipDetail(scope.row.id)"
                  :underline="false">
                {{ scope.row.batch }}
              </el-link>

            </div>
            <div style="margin-top: 10px">
              <el-tag
                  style="border: none"
                  @click="selectValue(scope.row.shop)"
                  :title="'负责人:' + scope.row.manager"
                  :color="scope.row.shop_color?scope.row.shop_color:'#539acd'"
                  effect="dark" type="info">
                <span style="font-weight: bold">{{ scope.row.shop}}</span>
              </el-tag>
            </div>
            <div style="font-size: 16px;margin-top: 10px">
              <el-tag size="mini" v-if="scope.row.send_from === 'LOCAL'" title="本土中转入仓">转</el-tag>
              <el-link @click.native="openAttachment(scope.row)"
                       title="附件"
                       :class="scope.row.is_attach?'small_icon_true':'small_icon'"
                       :underline="false"><i class="el-icon-paperclip"></i></el-link>
              <el-link @click.native="changeLogiFeeStatus(scope.row)"
                       title="物流结算"
                       v-if="permission.ship_logi_fee"
                       :class="scope.row.logi_fee_clear?'small_icon_true':'small_icon'"
                       :underline="false"><i class="el-icon-money"></i></el-link>
              <el-tooltip effect="dark" :disabled='!scope.row.note' :content="scope.row.note" placement="top">
                <el-link @click.native="openNote(scope.row)"
                         title="备注"
                         :class="scope.row.note?'small_icon_true':'small_icon'"
                         :underline="false"><i class="el-icon-chat-line-square"></i></el-link>
              </el-tooltip>
              <el-link @click.native="selectValue(scope.row.batch)"
                       title="筛选同批次运单"
                       class="small_icon"
                       :underline="false"><i class="el-icon-connection"></i></el-link>
              <el-link @click.native="copyText(scope.row.batch)"
                       title="复制批次号"
                       class="small_icon"
                       :underline="false"><i class="el-icon-copy-document"></i></el-link>

            </div>
          </template>
        </el-table-column>


        <el-table-column
            width="200"
            label="Envio号"
            align="center"
            header-align="center">
          <template slot-scope="scope">
            <div style="font-weight: bold; font-size: 20px">{{ scope.row.envio_number}}</div>
            <el-popover
                placement="bottom"
                :title="scope.row.fbm_name"
                width="400"
                trigger="hover"
                :content="scope.row.fbm_address">
              <el-button size="mini" type="text" slot="reference">{{ scope.row.fbm_warehouse}}</el-button>
            </el-popover>

          </template>
        </el-table-column>

        <el-table-column
            v-if="s_status==='BOOKED' || s_status==='FINISHED'"
            label="预约日期"
            align="center"
            header-align="center">
          <template slot-scope="scope">
            <el-tag
                style="border: none"
                color="#539acd"
                effect="dark" type="info">
              <span style="font-weight: bold">{{ scope.row.book_date}}</span>
            </el-tag>
            <div
                v-if="scope.row.book_days > 0"
                style="font-weight: bold;margin-top: 10px; font-size: 20px">
              <i class="el-icon-time"></i>
              {{ scope.row.book_days}}</div>
            <div
                v-if="scope.row.book_days === 0"
                style="font-weight: bold;margin-top: 10px; font-size: 20px; color: #FFAE00">
              <i class="el-icon-time"></i>
              送仓日</div>
            <div
                v-if="scope.row.book_days < 0 && scope.row.s_status !=='FINISHED'"
                style="font-weight: bold;margin-top: 10px; font-size: 20px; color: #E0050C">
              <i class="el-icon-time"></i>
              </div>
          </template>
        </el-table-column>

        <el-table-column
            label="物流商"
            width="200">
          <template slot-scope="scope">
            <div><span class="tt">物流名称: </span>{{scope.row.carrier}}</div>
            <div><span class="tt">物流单号: </span>
              <el-link @click.native="fastEditSNumber(scope.row)"
                       v-if="!scope.row.s_number"
                       title="添加物流单号"
                       class="small_icon"
                       :underline="false"><i class="el-icon-edit-outline"></i></el-link>
              {{scope.row.s_number}}
            </div>
            <div><span class="tt">截单日期: </span>{{scope.row.end_date}}</div>
            <div><span class="tt">航班日期: </span>{{scope.row.ship_date}}</div>
            <div><span class="tt">发货方式: </span>{{scope.row.ship_type}}</div>
          </template>
        </el-table-column>

        <el-table-column
            label="包裹信息"
            width="140">
          <template slot-scope="scope">
            <div><span class="tt">总数量: </span><span class="zi">{{scope.row.total_qty}}</span></div>
            <div><span class="tt">总箱数: </span><span class="zi">{{scope.row.total_box}}</span></div>
            <div><span class="tt">总重量: </span><span class="zi">{{scope.row.weight | kg}}</span></div>
            <div><span class="tt">总净量: </span><span class="zi">{{scope.row.products_weight | kg}}</span></div>
            <div><span class="tt">总体积: </span><span class="zi">{{scope.row.cbm | cbm}}</span></div>
          </template>
        </el-table-column>

        <el-table-column
            label="费用">
          <template slot-scope="scope">
            <div><span class="tt">货品: </span><span class="zi">{{scope.row.products_cost | currency}}</span></div>
            <div><span class="tt">运费: </span><span class="zi">{{scope.row.shipping_fee | currency}}</span></div>
            <div><span class="tt">杂费: </span><span class="zi">{{scope.row.extra_fee | currency}}</span></div>
          </template>
        </el-table-column>

        <el-table-column
            label="标签"
            align="center"
            header-align="center">
          <template slot-scope="scope">
              <el-tag
                  v-if="scope.row.tag_name"
                  style="border: none"
                  :color="scope.row.tag_color"
                  effect="dark" type="info">
                <span style="font-weight: bold">{{ scope.row.tag_name }}</span>
              </el-tag>
          </template>
        </el-table-column>

        <el-table-column
            label="操作"
            width="130"
            align="center"
            header-align="center"
        >
          <template slot-scope="scope">
            <div v-if="scope.row.s_status==='PREPARING'">
              <el-button
                  :disabled="!permission.ship_packing"
                  @click="packAndSend(scope.row.id)"
                  size="mini" type="primary" plain round><i class="el-icon-box"></i> 打包</el-button>
            </div>
            <div v-if="scope.row.s_status==='BOOKED'">
              <el-button
                  v-if="permission.ship_inwarehouse"
                  :disabled="!scope.row.shipping_fee && scope.row.send_from!=='LOCAL'"
                  key="test"
                  @click="confirmInWarehouse(scope.row.id)"
                  size="mini" type="primary" plain round><i class="el-icon-circle-check"></i> 入仓</el-button>
            </div>
            <div v-if="scope.row.s_status==='SHIPPED'">
              <el-button
                  :disabled="!permission.ship_book"
                  @click="createBook(scope.row.id)"
                  size="mini" type="primary" plain round><i class="el-icon-date"></i> 预约</el-button>
            </div>
            <div v-if="scope.row.s_status==='BOOKED'"  style="margin-top: 5px">
              <el-button
                  :disabled="!permission.ship_rebook"
                  @click="editeBook(scope.row)"
                  size="mini" type="danger" plain round><i class="el-icon-date"></i> 改约</el-button>
            </div>

            <div style="margin-top: 5px">
              <el-dropdown @command="handleShipOp">
                <el-button size="mini" type="warning" plain round>
                  <i class="el-icon-arrow-down"></i> 编辑
                </el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item v-if="scope.row.s_status!=='FINISHED'"
                                    :disabled="!permission.ship_edit"
                                    :command="{type:'edit', id:scope.row.id}">编辑运单</el-dropdown-item>
                  <el-dropdown-item :command="{type:'tag', obj:scope.row}">编辑标签</el-dropdown-item>
                  <el-dropdown-item :disabled="!permission.ship_delete"
                                    v-if="scope.row.s_status==='PREPARING'"
                                    :command="{type:'delete', id:scope.row.id}">删除运单</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>

            <div style="margin-top: 5px" v-if="scope.row.s_status==='PREPARING'">
              <el-dropdown @command="handleShipOp">
                <el-button :disabled="!permission.ship_export" size="mini" type="info" plain round>
                  <i class="el-icon-arrow-down"></i> 导出
                </el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item :command="{type:'export_purchase', id:scope.row.id}">导出采购单</el-dropdown-item>
                  <el-dropdown-item :command="{type:'export_qc', id:scope.row.id}">导出质检单</el-dropdown-item>
                  <el-dropdown-item :command="{type:'export_sd', id:scope.row.id}">导出盛德申报单</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>

            <div style="margin-top: 5px" v-if="scope.row.s_status!=='PREPARING'">
              <el-dropdown @command="handleShipOp">
                <el-button size="mini"
                           :disabled="!permission.ship_fees"
                           :type="scope.row.shipping_fee? 'success': ''" plain round>
                  <i class="el-icon-arrow-down"></i> 费用
                </el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item
                      v-if="!scope.row.shipping_fee"
                      :command="{type:'postage', row:scope.row}">录入头程运费</el-dropdown-item>
                  <el-dropdown-item
                      v-if="scope.row.shipping_fee"
                      :command="{type:'edit_postage', row:scope.row}">修改头程运费</el-dropdown-item>
                  <el-dropdown-item
                      :command="{type:'extra_fee', row:scope.row}">录入杂费</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>

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
          :current-page="page"
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

    <!--    录入运费弹窗-->
    <el-dialog
        title="运单运费"
        :visible.sync="postageVisible"
        :destroy-on-close="true"
        :close-on-click-modal="false"
        width="300px"
    >
      <div>
        <el-input-number
            style="width: 100%"
            v-model="shipping_fee"
            :precision="2"
            controls-position="right"
            :min="0"></el-input-number>
      </div>
      <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="closePostage">取 消</el-button>
          <el-button size="small" type="primary" :disabled="!shipping_fee" @click="summitPostage">确 定</el-button>
        </span>
    </el-dialog>

    <!--    录入杂费弹窗-->
    <el-dialog
        title="运单杂费"
        :visible.sync="extraVisible"
        :destroy-on-close="true"
        :close-on-click-modal="false"
        width="300px"
    >
      <div>
        <el-input-number
            style="width: 100%"
            v-model="extra_fee"
            :precision="2"
            controls-position="right"
            :min="0"></el-input-number>
      </div>
      <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="extraVisible = false">取 消</el-button>
          <el-button size="small" type="primary" :disabled="!extra_fee" @click="summitExtrafee">确 定</el-button>
        </span>
    </el-dialog>

    <!--    添加标签弹窗-->
    <el-dialog
        title="添加标签"
        :visible.sync="tagVisible"
        width="400px">
      <div style="display: flex">
        <el-color-picker v-model="tag.tag_color" :predefine="predefineColors" style="margin-right: 5px"></el-color-picker>
        <el-input v-model="tag.tag_name" maxlength="8" placeholder="请输入标签名称"></el-input>

      </div>
      <div>
        <p>预览</p>
        <el-tag :color="tag.tag_color"
                v-if="tag.tag_name"
                size="medium" effect="dark" style="border: none">{{ tag.tag_name }}</el-tag>
      </div>
      <span slot="footer" class="dialog-footer">
    <el-button @click="tagVisible = false">取 消</el-button>
    <el-button :disabled="tag.tag_name===''" type="primary" @click="saveTag">确 定</el-button>
  </span>
    </el-dialog>

    <!--    添加运单附件弹窗-->
    <el-dialog
        :title="current_shop"
        :key="timer"
        :visible.sync="attachVisible"
        :destroy-on-close="true"
        :close-on-click-modal="false"
        width="800px">
      <div>
        <MelShipAttachment :shipID="current_ship_id"></MelShipAttachment>
      </div>
      <span slot="footer" class="dialog-footer">
    <el-button @click="closeAttach">关 闭</el-button>
  </span>
    </el-dialog>

    <!--    修改备注弹窗-->
    <el-dialog
        title="运单备注"
        :visible.sync="noteVisible"
        :destroy-on-close="true"
        :close-on-click-modal="false"
        width="500px"
    >
      <div>
        <el-input :rows="6" type="textarea" v-model="shipNote"></el-input>
      </div>
      <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="noteVisible=false">取 消</el-button>
          <el-button size="small" type="primary" @click="summitNote">保 存</el-button>
        </span>
    </el-dialog>

  </div>
</template>

<script>
import moment from "moment/moment";
import MelShipAttachment from "@/components/app/mercado/MelShipAttachment";

export default {
  name: "MelShip",
  props: ["shipStatusName", 'shipWaitCheck'],
  components: {MelShipAttachment},
  data(){
    return{
      user: JSON.parse(window.sessionStorage.getItem('user')),
      permission: JSON.parse(window.sessionStorage.getItem('ml_permission')),
      loading: false,
      total: 0, // 总条数
      page: 1,  // 当前页
      size: 20,  // 页大小
      searchValue: '',
      target: '',
      s_status: this.shipStatusName? this.shipStatusName : 'PREPARING',// 筛选状态
      ships: [],
      pre_qty: 0, // 备货运单数量
      shipped_qty: 0, // 发货运单数量
      booked_qty: 0, // 预定运单数量
      bookVisible: false, // fbm预约
      book_date: '', //预约日期
      ship_id: null,
      postageVisible: false, // 运费弹窗
      shipping_fee: 0, // 运费
      extraVisible: false, //杂费弹窗
      extra_fee: 0, // 运费
      expandStatus: true, // 所有行展开状态
      tagVisible: false, //标签弹窗
      attachVisible: false, //运单附件弹窗
      noteVisible: false, //运单备注弹窗
      shipNote: null, //运单备注内容
      current_ship_id: null, //当前运单id
      current_shop: null, //当前目标店铺
      timer: null,
      wait_check: this.shipWaitCheck?true:false, // 入仓核查
      sort: '-create_time', //排序变量
      tag: {
        tag_color: '#409EFF',
        tag_name: '',
      },
      ordering_group: [
        {
          name: '默认排序',
          value: '-create_time'
        },
        {
          name: '店铺名称↓',
          value: '-shop'
        },
        {
          name: '预约日期↓',
          value: '-book_date'
        },

      ],
      predefineColors: [
        '#ff4500',
        '#ff8c00',
        '#ffd700',
        '#90ee90',
        '#00ced1',
        '#1e90ff',
        '#c75450',
        '#c71585',
        '#8526F1',
        '#E475EE'
      ],
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
    //体积格式化
    cbm: function (value) {
      if (!value) return 0;
      return `${value.toFixed(4)} cbm`;
    },
    //重量格式化
    kg: function (value) {
      if (!value) return 0;
      return `${value.toFixed(2)} kg`;
    },
    //图片地址格式化
    smpic: function (value) {
      if (!value) return '';
      let url = value.slice(0, value.length-4)
      return url + '_100x100.jpg/?' + Math.random()
    },
  },
  mounted() {
    this.initShips()
    this.checkNotify()
  },
  methods:{
    //检查相关通知
    checkNotify(){
      this.getRequest('api/ml_ship/check_ship_change/').then(resp => {
        if (resp.is_exist) {
          this.$notify({
            title: '你有 '+ resp.qty +' 票运单发货数量变动',
            message: resp.desc,
            type: 'warning',
          });
        }
      })

    },
    // 关闭附件弹窗
    closeAttach(){
      this.attachVisible = false;
      this.initShips()
    },
    // 快速增加物流单号
    fastEditSNumber(row){
      let title = row.batch + '-' + row.shop
      this.$prompt('请输入物流单号', title, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      }).then(({ value }) => {

        this.patchRequest('api/ml_ship/'+ row.id +'/', {'s_number': value}).then(resp => {
          if (resp) {
            this.initShips()
          }
        })

      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消修改'
        });
      });
    },
    //快速筛选
    selectValue(batch){
      this.page = 1;
      this.searchValue = batch
      this.initShips();
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

    //打开上传附件弹窗
    openAttachment(row){
      this.timer = new Date().getTime();
      this.current_ship_id = row.id
      this.current_shop = row.batch + '-' + row.shop
      this.attachVisible = true
    },
    //保存标签
    saveTag(){
      this.patchRequest('api/ml_ship/'+ this.ship_id +'/', this.tag).then(resp => {
        if (resp) {
          this.tagVisible = false;
          this.initShips()
          this.ship_id = null
        }
      })
    },

    // 循环设置行展开、收起
    forArr(arr, isExpand) {
      arr.forEach(i => {
        this.$refs.shipTable.toggleRowExpansion(i, isExpand);
        if (i.children) {
          this.forArr(i.children, isExpand);
        }
      })
    },
    // 行是否展开切换
    expendChange() {
      this.forArr(this.ships, this.expandStatus);
      this.expandStatus = !this.expandStatus;
    },

    closePostage(){
      this.postageVisible = false
      this.shipping_fee = 0
    },

    // 提交杂费
    summitExtrafee(){
      this.postRequest('api/ml_ship/extra_fee/', {'extra_fee': this.extra_fee, 'id': this.ship_id}).then(resp => {
        if (resp) {
          this.extraVisible = false;
          this.initShips()
          this.ship_id = null
        }
      })
    },

    // 提交运费
    summitPostage(){
      this.postRequest('api/ml_ship/postage/', {'shipping_fee': this.shipping_fee, 'id': this.ship_id}).then(resp => {
        if (resp) {
          this.postageVisible = false;
          this.initShips()
          this.shipping_fee = 0
          this.ship_id = null
        }
      })
    },
    //提交预定日期
    summitBookDate(){
      this.patchRequest('api/ml_ship/'+ this.ship_id +'/', {'book_date': this.book_date, 's_status': 'BOOKED'}).then(resp => {
        if (resp) {
          this.bookVisible = false;
          this.initShips()
          this.book_date = ''
          this.ship_id = null
        }
      })
    },
    //提交修改备注
    summitNote(){
      this.patchRequest('api/ml_ship/'+ this.current_ship_id +'/', {'note': this.shipNote}).then(resp => {
        if (resp) {
          this.noteVisible = false;
          this.initShips()
          this.current_ship_id = null
        }
      })
    },
    // 改变筛选状态
    changeStatus(value){
      this.page = 1;
      this.s_status = value
      this.wait_check = false
      this.initShips()
    },

    // 打包发货
    packAndSend(id){
      this.$router.push({
        path: '/shipDetail',
        query: {
          id: id
        }
      });
    },

    // FBM预约
    createBook(id){
      this.bookVisible = true;
      this.ship_id = id
    },

    // 修改FBM预约
    editeBook(row){
      this.bookVisible = true;
      this.book_date = row.book_date
      this.ship_id = row.id
    },

    // 查看运单详情
    checkShipDetail(id){
      // 查看运单详情
      this.$router.push({
        path: '/shipDetail',
        query: {
          id: id,
          action: 'DETAIL',
          click_from: this.s_status
        }
      });
    },

    // 确认入仓
    confirmInWarehouse(id){
      this.$confirm('是否确认入仓?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        //确认入仓
        this.postRequest('api/ml_ship/in_warehouse/', {'id': id}).then(resp => {
          this.initShips();
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消入仓'
          });
        });
      })
    },

    // 标记物流运费结算
    changeLogiFeeStatus(obj){
      let title = obj.logi_fee_clear?'是否取消结算状态?':'是否确认物流费用已结算?'
      this.$confirm(title, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        //确认入仓
        this.postRequest('api/ml_ship/change_logi_fee_status/', {'id': obj.id, 'logi_fee_clear': !obj.logi_fee_clear}).then(resp => {
          this.initShips();
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消'
          });
        });
      })
    },

    //修改运单备注
    openNote(obj){
      this.shipNote = obj.note
      this.current_ship_id = obj.id
      this.noteVisible = true
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

      // 导出盛德申报单
      if (command['type'] === 'export_sd') {
        this.$confirm('是否导出盛德申报单?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let url = 'api/ml_ship/export_logistic_decl/'
          this.postRequest(url, {'id': command['id'], 'name': 'SHENGDE'}).then(resp => {
            if (resp) {
              window.open(resp.url, '_blank')
            }
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消'
            });
          });
        })

      }

      // 导出采购单
      if (command['type'] === 'export_purchase') {
        this.$confirm('是否导出采购单?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.postRequest('api/ml_ship/export_purchase/', {'id': command['id']}).then(resp => {
            if (resp) {
              window.open(resp.url, '_blank')
            }
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消'
            });
          });
        })

      }

      // 导出质检单
      if (command['type'] === 'export_qc') {
        this.$confirm('是否导出质检单?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.postRequest('api/ml_ship/export_qc/', {'id': command['id']}).then(resp => {
            if (resp) {
              window.open(resp.url, '_blank')
            }
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消'
            });
          });
        })

      }

      // 添加标签
      if (command['type'] === 'tag') {
        this.tagVisible = true
        this.ship_id = command['obj'].id
        this.tag.tag_color = command['obj'].tag_color?command['obj'].tag_color:'#409EFF'
        this.tag.tag_name = command['obj'].tag_name
      }

      // 查看运单详情
      if (command['type'] === 'detail') {
        this.$router.push({
          path: '/shipDetail',
          query: {
            id: command['id'],
            action: 'DETAIL',
            click_from: this.s_status
          }
        });
      }

      // 编辑
      if (command['type'] === 'edit') {
        this.$router.push({
          path: '/editShip',
          query: {
            id: command['id'],
            click_from: this.s_status
          }
        });
      }

      // 确认入仓
      if (command['type'] === 'in_warehouse') {
        this.$confirm('是否确认入仓?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          //确认入仓
          this.postRequest('api/ml_ship/in_warehouse/', {'id': command['id']}).then(resp => {
            this.initShips();
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消删除'
            });
          });
        })

      }

      // FBM预约
      if (command['type'] === 'book') {
        this.bookVisible = true;
        this.ship_id = command['id']
      }

      // 修改FBM预约
      if (command['type'] === 'edit_book') {
        this.bookVisible = true;
        this.book_date = command['row'].book_date
        this.ship_id = command['row'].id
      }

      // 添加运费
      if (command['type'] === 'postage') {
        this.postageVisible = true;
        this.ship_id = command['row'].id
      }

      // 修改运费
      if (command['type'] === 'edit_postage') {
        this.postageVisible = true;
        this.ship_id = command['row'].id
        this.shipping_fee = command['row'].shipping_fee
      }

      // 添加杂费
      if (command['type'] === 'extra_fee') {
        this.extraVisible = true;
        this.extra_fee = command['row'].extra_fee
        this.ship_id = command['row'].id
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
      this.page = 1;
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
      if (!this.permission.ship_allShopCheck) {
        url += '&user_id=' + this.user.id;
      }
      if (this.wait_check) {
        let today = moment(new Date()).format("YYYY-MM-DD")
        url += '&book_date__lt=' + today
      }
      url += '&target=' + this.target
      url += '&s_status=' + this.s_status
      url += '&ordering=' + this.sort

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
  font-size: 20px;
}

.zi {
  font-weight: bold;
  color: #E6A23C;
}
.jiantou{
  margin-left: 8px;
  margin-right: 8px;
  color: #6e7079;
}
.plan4{
  color: #409EFF;
  margin-right: 10px;
}
.plan3{
  color: darkseagreen;
}
.plan5{
  color: darkorange;
}
.small_icon{
  color: #99a9bf;
  margin-right: 5px;
}
.small_icon_true{
  color: #aa0515;
  margin-right: 5px;
}
::v-deep .el-table__body tr.current-row>td {
  /*color: #fff;*/
  background: #f0f9eb!important;
}
</style>