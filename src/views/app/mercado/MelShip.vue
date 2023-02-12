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

          <el-badge :value="shipped_qty" :hidden="!shipped_qty" class="item">
            <el-button size="small" :type="s_status==='SHIPPED'?'primary':''" @click="changeStatus('SHIPPED')">运输中</el-button>
          </el-badge>

          <el-badge :value="booked_qty" :hidden="!booked_qty" class="item">
            <el-button size="small" :type="s_status==='BOOKED'?'primary':''" @click="changeStatus('BOOKED')">已预约</el-button>
          </el-badge>

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

          <el-radio-group
              style="margin-left: 50px"
              @change="changeTarget" v-model="target">
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
            <div class="m_name">{{ scope.row.batch}}</div>
            <div style="margin-top: 10px">
              <el-tag
                  style="border: none"
                  :color="scope.row.shop_color?scope.row.shop_color:'#539acd'"
                  effect="dark" type="info">
                <span style="font-weight: bold">{{ scope.row.shop}}</span>
              </el-tag>
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
            <div><span class="tt">物流单号: </span>{{scope.row.s_number}}</div>
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
        >
          <template slot-scope="scope">
            <el-dropdown @command="handleShipOp">
              <el-button type="text">
                操作<i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-if="scope.row.s_status==='BOOKED'"
                                  :disabled="!scope.row.shipping_fee && !scope.row.send_from"
                                  :command="{type:'in_warehouse', id:scope.row.id}">确认入仓</el-dropdown-item>
                <el-dropdown-item v-if="scope.row.s_status==='PREPARING'" :command="{type:'packing', id:scope.row.id}">打包发货</el-dropdown-item>
                <el-dropdown-item v-if="scope.row.s_status!=='PREPARING'" :command="{type:'detail', id:scope.row.id}">查看运单详情</el-dropdown-item>
                <el-dropdown-item :command="{type:'tag', id:scope.row.id}">编辑标签</el-dropdown-item>
                <el-dropdown-item v-if="scope.row.s_status!=='FINISHED'" :command="{type:'edit', id:scope.row.id}">编辑运单</el-dropdown-item>
                <el-dropdown-item v-if="scope.row.s_status==='SHIPPED'" :command="{type:'book', id:scope.row.id}">FBM预约</el-dropdown-item>
                <el-dropdown-item v-if="scope.row.s_status==='BOOKED'" :command="{type:'edit_book', row:scope.row}">修改预约日期</el-dropdown-item>
                <el-dropdown-item
                    v-if="(scope.row.s_status==='SHIPPED' || scope.row.s_status==='BOOKED') && !scope.row.shipping_fee"
                    :command="{type:'postage', row:scope.row}">录入头程运费</el-dropdown-item>
                <el-dropdown-item
                    v-if="(scope.row.s_status==='SHIPPED' || scope.row.s_status==='BOOKED') && scope.row.shipping_fee"
                    :command="{type:'edit_postage', row:scope.row}">修改头程运费</el-dropdown-item>
                <el-dropdown-item
                    v-if="scope.row.s_status==='SHIPPED' || scope.row.s_status==='BOOKED'"
                    :command="{type:'extra_fee', row:scope.row}">录入杂费</el-dropdown-item>
                <el-dropdown-item :command="{type:'export_purchase', id:scope.row.id}">导出采购单</el-dropdown-item>
                <el-dropdown-item :command="{type:'export_sd', id:scope.row.id}">导出盛德申报单</el-dropdown-item>
                <el-dropdown-item :command="{type:'delete', id:scope.row.id}">删除运单</el-dropdown-item>
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
    <el-button :disabled="tag.tag_name.trim()===''" type="primary" @click="saveTag">确 定</el-button>
  </span>
    </el-dialog>

  </div>
</template>

<script>
import moment from "moment/moment";

export default {
  name: "MelShip",
  data(){
    return{
      user: JSON.parse(window.sessionStorage.getItem('user')),
      loading: false,
      total: 0, // 总条数
      page: 1,  // 当前页
      size: 20,  // 页大小
      searchValue: '',
      target: '',
      s_status: 'PREPARING',// 筛选状态
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
      tag: {
        tag_color: '#409EFF',
        tag_name: '',
      },
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
  },
  methods:{
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
    // 改变筛选状态
    changeStatus(value){
      this.s_status = value
      this.initShips()
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

      // 添加标签
      if (command['type'] === 'tag') {
        this.tagVisible = true
        this.ship_id = command['id']
      }

      // 查看运单详情
      if (command['type'] === 'detail') {
        this.$router.push({
          path: '/shipDetail',
          query: {
            id: command['id'],
            action: 'DETAIL',
          }
        });
      }

      // 编辑
      if (command['type'] === 'edit') {
        this.$router.push({
          path: '/editShip',
          query: {
            id: command['id']
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
      if (!this.user.is_superuser) {
        url += '&user_id=' + this.user.id;
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
  color: teal;
  font-size: 20px;
}
.item {
  margin-right: 18px;
}
.zi {
  font-weight: bold;
  color: #E6A23C;
}
</style>