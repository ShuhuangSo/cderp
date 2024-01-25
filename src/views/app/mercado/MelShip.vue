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
              style="margin-left: 50px"
              @change="changeTarget" v-model="target">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button label="FBM">FBM入仓单</el-radio-button>
            <el-radio-button label="TRANSIT">中转仓单</el-radio-button>
          </el-radio-group>

          <el-select v-model="platform"
                     style="width: 150px;margin-left: 5px; "
                     @change="changeTarget" placeholder="请选择平台">
            <el-option
                v-for="item in platforms"
                :key="item.name"
                :label="item.name"
                :value="item.value">
            </el-option>
          </el-select>

          <el-select v-model="sort"
                     style="width: 150px;margin-left: 5px;margin-right: 30px"
                     @change="changeTarget" placeholder="请选择排序项">
            <el-option
                v-for="item in ordering_group"
                :key="item.name"
                :label="item.name"
                :value="item.value">
            </el-option>
          </el-select>

          <el-badge :value="remove_items_count" :hidden="!remove_items_count" type="primary" class="item">
            <el-button size="small" @click="goShipInfo">变动清单管理</el-button>
          </el-badge>

          <el-dropdown @command="carrierOp"
                       v-if="this.user.is_superuser"
                       style="margin-left: 30px">
            <el-button type="primary" plain round>
              <i class="el-icon-arrow-down"></i> 物流操作
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item :disabled="s_status!=='PREPARING'" :command="{type:'refresh_order'}">刷新状态</el-dropdown-item>
              <el-dropdown-item :disabled="s_status==='PREPARING' || s_status==='FINISHED'"
                                :command="{type:'refresh_tracking'}">刷新跟踪</el-dropdown-item>
              <el-dropdown-item v-if="this.user.is_superuser" :command="{type:'bill_input'}">物流对账</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>

<!--          <el-button-->
<!--              style="margin-left: 30px"-->
<!--              v-if="this.user.is_superuser"-->
<!--              :disabled="s_status==='PREPARING' || s_status==='FINISHED'"-->
<!--              :loading="trackLoading"-->
<!--              @click="bulkUpdateTracking"-->
<!--              size="mini" type="primary" plain round icon="el-icon-refresh">刷新跟踪</el-button>-->


        </div>

        <el-button type="success" icon="el-icon-plus"
                   :disabled="!permission.ship_create"
                   style="margin-right: 10px"
                   @click="createShip">创建运单
        </el-button>
      </div>
    </div>

    <div class="filterShow" v-if="filterBatch || filterShop || filterSort || platform">
      <span>已选择条件：</span>
      <el-tag size="small" closable effect="dark" v-if="platform" @close="colseFilter('platform')">平台：{{ this.platform | pf }}
      </el-tag>
      <el-tag size="small" closable effect="dark" v-if="filterBatch" @close="colseFilter('batch')">批次：{{ this.filterBatch }}
      </el-tag>
      <el-tag size="small" closable effect="dark" v-if="filterShop" @close="colseFilter('shop')">目标店铺：{{ this.filterShop }}
      </el-tag>
      <el-tag size="small" closable effect="dark" v-if="filterSort" @close="colseFilter('sort')">排序：{{ this.filterSort }}
      </el-tag>

      <el-button type="text" size="small" @click="colseFilter('all')">全部清除</el-button>
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
                  width="180">
                <template slot-scope="scope">
                  <div>{{ scope.row.item_id }}</div>
                </template>
              </el-table-column>

              <el-table-column
                  label="数量"
                  align="center"
                  header-align="center"
                  width="100">
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
                  @click="selectValue('shop', scope.row.shop)"
                  :title="'负责人:' + scope.row.manager"
                  :color="scope.row.shop_color?scope.row.shop_color:'#539acd'"
                  effect="dark" type="info">
                <span style="font-weight: bold">{{ scope.row.shop}}</span>
              </el-tag>
            </div>

            <div style="font-size: 16px;margin-top: 10px">
              <el-tag size="mini" type="warning" v-if="scope.row.is_remove_items" title="发货数量有变动">变</el-tag>
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
              <el-link @click.native="selectValue('batch', scope.row.batch)"
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
            <div style="font-weight: bold; font-size: 20px" v-if="scope.row.envio_number">{{ scope.row.envio_number}}</div>
            <div v-if="!scope.row.envio_number && scope.row.target==='FBM'"><p style="color: #aa0515"><i class="el-icon-warning-outline"></i> 入仓号待补...</p></div>
            <div v-if="!scope.row.fbm_warehouse && scope.row.target==='FBM'"><p style="color: #aa0515"><i class="el-icon-warning-outline"></i> 仓库待补...</p></div>
            <el-popover
                v-if="scope.row.fbm_warehouse"
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
              <el-link
                  style="margin-bottom: 2px; font-weight: normal; font-size: 12px"
                  @click.native="checkShipTrack(scope.row.s_number)"
                  :underline="false">
                {{scope.row.s_number}}
              </el-link>

            </div>

            <div><span class="tt">截单日期: </span>{{scope.row.end_date}}</div>
            <div><span class="tt">航班日期: </span>{{scope.row.ship_date}}</div>
            <div><span class="tt_msg">{{scope.row.latest_track | ellipsis}}</span></div>
            <div v-if="scope.row.s_status ==='PREPARING'">
              <el-tag effect="plain" size="mini" v-if="scope.row.carrier_order_status==='WAIT'">待受理</el-tag>
              <el-tag type="success" size="mini" effect="plain" v-if="scope.row.carrier_order_status==='ACCEPTED'">已受理</el-tag>
            </div>
<!--            <div><span class="tt">发货方式: </span>{{scope.row.ship_type}}</div>-->
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
                  @click.native="editTagWindow(scope.row)"
                  style="border: none"
                  :color="scope.row.tag_color"
                  effect="dark" type="info">
                <span style="font-weight: bold">{{ scope.row.tag_name }}</span>
              </el-tag>
            <el-link @click.native="editTagWindow(scope.row)"
                     v-if="!scope.row.tag_name"
                     title="添加标签"
                     class="small_icon"
                     :underline="false"><i class="el-icon-edit-outline"></i></el-link>
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
                  :loading="in_warehouse_loading"
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
                  <el-dropdown-item :disabled="!permission.ship_delete || !user.is_superuser && scope.row.user_id === 0"
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
                  <el-dropdown-item :command="{type:'export_wc', id:scope.row.id}">导出微草申报单</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>

            <div style="margin-top: 5px" v-if="scope.row.s_status==='PREPARING' && permission.ship_carrier_place">
              <el-dropdown @command="handleShipOp">
                <el-button size="mini" type="danger" plain round>
                  <i class="el-icon-arrow-down"></i> 物流
                </el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item :disabled="scope.row.carrier !== '盛德物流'" :command="{type:'place_order', obj:scope.row}">物流交运</el-dropdown-item>
                  <el-dropdown-item :disabled="scope.row.carrier_order_status !== 'ACCEPTED'" :command="{type:'print_receipt', num:scope.row.s_number}">打印物流交运单</el-dropdown-item>
                  <el-dropdown-item :disabled="scope.row.carrier_order_status !== 'ACCEPTED'" :command="{type:'print_box', num:scope.row.s_number}">打印物流箱唛</el-dropdown-item>
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

      <el-divider>常用标签</el-divider>
      <div>
        <el-tag color="#ff8c00"
                @click="set_tag('已提交', '#ff8c00')"
                size="medium" effect="dark" style="border: none">已提交</el-tag>
        <el-tag color="#00ced1"
                @click="set_tag('已确认预约', '#00ced1')"
                size="medium" effect="dark" style="border: none; margin-left: 5px">已确认预约</el-tag>
        <el-tag color="#90ee90"
                @click="set_tag('已签收', '#90ee90')"
                size="medium" effect="dark" style="border: none; margin-left: 5px">已签收</el-tag>
        <el-tag color="#c71585"
                @click="set_tag('已截单', '#c71585')"
                size="medium" effect="dark" style="border: none; margin-left: 5px">已截单</el-tag>
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

    <!--    物流跟踪弹窗-->
    <el-dialog
        :title="'物流跟踪 '+this.trackNum"
        :visible.sync="trackVisible"
        :destroy-on-close="true"
        :close-on-click-modal="false"
        width="500px"
    >
      <div>
        <el-button style="margin-left: 40px; margin-bottom: 20px"
                   @click="updateTracking"
                   :loading="trackLoading"
                   icon="el-icon-refresh"
                   size="mini" round>刷新跟踪</el-button>
        <span class="track_update" v-if="this.trackUpdateTime">更新时间 {{this.trackUpdateTime}}</span>
        <el-timeline>
          <el-timeline-item
              v-for="(activity, index) in trackMessageList"
              :key="index"
              :color="activity.color"
              :timestamp="activity.time">
            <span style="color: #0bbd87" v-if="activity.color">{{activity.context}}</span>
            <span v-if="!activity.color">{{activity.context}}</span>
          </el-timeline-item>
        </el-timeline>
      </div>
      <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="closeTrackWindows">关 闭</el-button>
        </span>
    </el-dialog>

    <!--    物流商交运弹窗-->
    <el-dialog
        title="物流在线交运"
        :visible.sync="carrierOrderVisible"
        :key="timer"
        :destroy-on-close="true"
        :close-on-click-modal="false"
        width="800px"
    >
      <div>
        <ShengDeCreateOrder ref="place_order"
                            @placeOrderLoadingTrue="carrierOrderLoading=true"
                            @placeOrderLoadingFalse="carrierOrderLoading=false"
                            @closePlaceOrderWindow="closePlaceOrderWindow"
                            :ship_obj="ship_obj"></ShengDeCreateOrder>
      </div>
      <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="carrierOrderVisible=false">关 闭</el-button>
        <el-button size="small" type="primary" :loading="carrierOrderLoading" @click="submitPlaceOrder">确认交运</el-button>
        </span>
    </el-dialog>

    <!--    盛德对账弹窗-->
    <el-dialog
        title="物流对账（盛德）"
        :visible.sync="sdBillVisible"
        :destroy-on-close="true"
        :close-on-click-modal="false"
        width="1000px"
    >
      <div>
        <el-input
            v-if="this.bill_win==='INPUT'"
            type="textarea"
            :rows="5"
            placeholder="Excel复制粘贴 SO号	FBM号	件数	计费重量	单价	运费"
            v-model="sdBillInput">
        </el-input>

        <el-table
            ref="billTable"
            v-if="this.bill_win==='CHECK'"
            size="mini"
            :data="billCheckShips"
            :header-cell-style="{background:'#fafafa'}"
            style="width: 100%">

          <el-table-column
              align="center"
              header-align="center"
              label="Envio/SO号">
            <template slot-scope="scope">
              <div>{{ scope.row.in_envio_number}}</div>
              <div>{{ scope.row.in_s_number}}</div>
              <div v-if="!scope.row.id"><el-tag type="danger">运单不存在！</el-tag></div>
            </template>
          </el-table-column>

          <el-table-column
              align="center"
              header-align="center"
              label="批次号/店铺">
            <template slot-scope="scope">
              <div>{{ scope.row.batch}}</div>
              <div>{{ scope.row.shop}}</div>
              <el-link
                       title="物流结算"
                       :class="scope.row.logi_fee_clear?'small_icon_true':'small_icon'"
                       :underline="false"><i class="el-icon-money"></i></el-link>

              <el-tooltip effect="dark" :disabled='!scope.row.note' :content="scope.row.note" placement="top">
                <el-link @click.native="openNote(scope.row)"
                         title="备注"
                         :class="scope.row.note?'small_icon_true':'small_icon'"
                         :underline="false"><i class="el-icon-chat-line-square"></i></el-link>
              </el-tooltip>
            </template>
          </el-table-column>

          <el-table-column
              align="center"
              header-align="center"
              label="运单状态">
            <template slot-scope="scope">
              {{ scope.row.s_status | ship_status}}
            </template>
          </el-table-column>

          <el-table-column
              width="80"
              align="center"
              header-align="center"
              label="件数">
            <template slot-scope="scope">
              <div style="font-weight: bold">{{ scope.row.in_total_box}}</div>
              <div style="font-weight: bold">{{ scope.row.total_box}}</div>
            </template>
          </el-table-column>

          <el-table-column
              width="80"
              align="center"
              header-align="center"
              label="运价">
            <template slot-scope="scope">
              <div style="font-weight: bold">{{ scope.row.in_price}}</div>
            </template>
          </el-table-column>

          <el-table-column
              width="80"
              align="center"
              header-align="center"
              label="计费重量">
            <template slot-scope="scope">
              <div style="font-weight: bold">{{ scope.row.in_weight}}</div>
              <div style="font-weight: bold">{{ scope.row.weight}}</div>
            </template>
          </el-table-column>

          <el-table-column
              width="150"
              align="center"
              header-align="center"
              label="运费">
            <template slot-scope="scope">
              <el-input-number
                  style="width: 100%"
                  v-model="scope.row.in_shipping_fee"
                  :precision="2"
                  controls-position="right"
                  :min="0"></el-input-number>
            </template>
          </el-table-column>

          <el-table-column
              width="100"
              align="center"
              header-align="center"
              label="对账">
            <template slot-scope="scope">
              <el-switch
                  v-model="scope.row.confirmed">
              </el-switch>
            </template>
          </el-table-column>

        </el-table>
      </div>
      <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="sdBillVisible=false">关 闭</el-button>
        <el-button size="small" type="primary"
                   v-if="this.bill_win==='INPUT'"
                   :loading="billLoading"
                   @click="submitBillInput">检 查</el-button>
        <el-button size="small" type="primary"
                   v-if="this.bill_win==='CHECK'"
                   :loading="billLoading"
                   @click="submitBillCheck">确认对账</el-button>
        </span>
    </el-dialog>

  </div>
</template>

<script>
import moment from "moment/moment";
import MelShipAttachment from "@/components/app/mercado/MelShipAttachment";
import ShengDeCreateOrder from "@/components/app/mercado/ShengDeCreateOrder";

export default {
  name: "MelShip",
  props: ["shipStatusName", 'shipWaitCheck', ],
  components: {MelShipAttachment, ShengDeCreateOrder},
  data(){
    return{
      user: JSON.parse(window.sessionStorage.getItem('user')),
      permission: JSON.parse(window.sessionStorage.getItem('ml_permission')),
      loading: false,
      in_warehouse_loading: false, // 确认入仓loading
      total: 0, // 总条数
      page: 1,  // 当前页
      size: 20,  // 页大小
      searchValue: '',
      filterBatch: '', // 筛选批次
      filterShop: '', // 筛选店铺
      filterSort: '', // 排序名称
      target: '',
      s_status: this.shipStatusName? this.shipStatusName : 'PREPARING',// 筛选状态
      ships: [],
      pre_qty: 0, // 备货运单数量
      shipped_qty: 0, // 发货运单数量
      booked_qty: 0, // 预定运单数量
      bookVisible: false, // fbm预约
      book_date: '', //预约日期
      ship_id: null,
      ship_obj: null, // 选中的运单
      carrierOrderVisible: false, // 物流交运弹窗
      carrierOrderLoading: false, // 物流交运loading
      postageVisible: false, // 运费弹窗
      shipping_fee: 0, // 运费
      extraVisible: false, //杂费弹窗
      extra_fee: 0, // 运费
      expandStatus: true, // 所有行展开状态
      tagVisible: false, //标签弹窗
      attachVisible: false, //运单附件弹窗
      noteVisible: false, //运单备注弹窗
      shipNote: null, //运单备注内容
      sdBillVisible: false, //盛德对账弹窗
      billLoading: false, //盛德对账loading
      sdBillInput: '', //盛德对账输入
      bill_win: 'INPUT', //对账窗口显示
      billCheckShips: [], // 对账数据
      trackVisible: false, //物流跟踪弹窗
      trackLoading: false, //物流跟踪loading
      trackMessageList: null, //跟踪信息
      trackNum: null, //跟踪号
      trackUpdateTime: null, //跟踪更新时间
      current_ship_id: null, //当前运单id
      current_shop: null, //当前目标店铺
      timer: null,
      wait_check: this.shipWaitCheck?true:false, // 入仓核查
      remove_items_count: 0, //变动清单待处理数量
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
      platform: '', //平台
      platforms: [
        {
          name: '全部平台',
          value: ''
        },
        {
          name: '美客多',
          value: '&platform=MERCADO'
        },
        {
          name: 'Noon',
          value: '&platform=NOON'
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
    //文字数超出时，超出部分使用...
    ellipsis(value) {
      if (!value) return ''
      if (value.length > 14) {
        return value.slice(0, 14) + '...'
      }
      return value
    },
    //平台格式化
    pf: function (value) {
      if (value === '&platform=MERCADO') return '美客多';
      if (value === '&platform=NOON') return 'Noon';
      return '';
    },
    //平台格式化
    ship_status: function (value) {
      if (value === 'PREPARING') return '备货中';
      if (value === 'SHIPPED') return '已发货';
      if (value === 'BOOKED') return '已预约';
      if (value === 'FINISHED') return '已完成';
      if (value === 'ERROR') return '异常';
      return '';
    },

  },

  mounted() {
    this.initShipSetting()
    this.initShips()
    this.checkNotify()
  },
  methods:{
    //提交物流对账输入
    submitBillInput(){
      let ships = []
      let res = this.sdBillInput.split(" \n") //分隔回车
      res.forEach(item=>{
        let it = item.split("\t"); //分隔excel列
        ships.push({
          'in_s_number': it[0],
          'in_envio_number': it[1],
          'in_total_box': it[2],
          'in_weight': it[3],
          'in_price': it[4],
          'in_shipping_fee': it[5],
        })
      })
      this.billLoading = true
      this.postRequest('api/ml_ship/bill_check/', {'ships': ships}).then(resp => {
      this.billLoading = false
        if (resp) {
          this.billCheckShips = resp.ships
          this.bill_win = 'CHECK'
        }
      })
    },

    //提交物流对账
    submitBillCheck(){
      this.billLoading = true
      this.postRequest('api/ml_ship/bill_submit/', {'ships': this.billCheckShips}).then(resp => {
        this.billLoading = false
        if (resp.ships) {
          this.billCheckShips = resp.ships
        }
      })
    },

    //设置标签
    set_tag(name, color){
      this.tag.tag_name = name
      this.tag.tag_color = color
    },
    // 运单物流交运
    submitPlaceOrder() {
      this.$refs.place_order.submitOrder();
    },
    //关闭物流交运窗口
    closePlaceOrderWindow(){
      this.carrierOrderVisible = false
      this.initShips()
    },

    // 批量更新物流跟踪
    bulkUpdateTracking(){
      const loading = this.$loading({
        lock: true,
        text: '正在刷新中...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      this.getRequest('/api/ml_ship/bulk_update_tracking/').then(resp => {
        loading.close();
        if (resp) {
          this.initShips()
        }
      })
    },
    //关闭物流跟踪窗口
    closeTrackWindows(){
      this.trackVisible = false
      this.initShips()
    },
    //刷新跟踪
    updateTracking(){
      this.trackLoading = true
      this.postRequest('api/ml_ship/ship_tracking/', {'track_num': this.trackNum}).then(resp => {
        this.trackLoading = false
        if (resp) {
          this.initTracking(this.trackNum)
        }
      })
    },
    // 物流跟踪弹窗
    checkShipTrack(num){
      this.trackUpdateTime = null
      this.trackMessageList = null
      if (num) {
        this.trackNum = num
        this.initTracking(num)
      }
      this.trackVisible = true
    },
    //获取跟踪信息
    initTracking(num){
      let url = '/api/ml_ship_tracking/?page_size=1000'
      url += '&carrier_number=' + num;
      url += '&ordering=-time'
      this.getRequest(url).then(resp => {
        if (resp.results) {
          this.trackMessageList = resp.results;
          let n = 0
          this.trackMessageList.forEach(item=>{
            item.time = moment(item.time).format("YYYY-MM-DD HH:mm:SS")
            if (n===0) {
              item['color'] = '#0bbd87'
              this.trackUpdateTime = moment(item.create_time).format("YYYY-MM-DD HH:mm:SS")
            }
            n += 1
          })
        }
      })
    },
    // 初始化设置
    initShipSetting(){
      if(window.sessionStorage.getItem('ml_ship_platform')) {
        this.platform = JSON.parse(window.sessionStorage.getItem('ml_ship_platform'));
      }
      if(window.sessionStorage.getItem('ml_ship_filterBatch')) {
        this.filterBatch = JSON.parse(window.sessionStorage.getItem('ml_ship_filterBatch'));
      }
      if(window.sessionStorage.getItem('ml_ship_filterShop')) {
        this.filterShop = JSON.parse(window.sessionStorage.getItem('ml_ship_filterShop'));
      }
      if(window.sessionStorage.getItem('ml_ship_filterSort')) {
        this.filterSort = JSON.parse(window.sessionStorage.getItem('ml_ship_filterSort'));
        if (this.filterSort) {
          let select_sort = this.ordering_group.find(item => item.name === this.filterSort)
          this.sort = select_sort.value
        }
      }
    },
    //检查相关通知
    checkNotify(){
      this.getRequest('api/ml_ship/check_ship_change/').then(resp => {
        if (resp.remove_items_count) {
          this.remove_items_count = resp.remove_items_count
          this.$notify({
            title: '发货数量变动',
            message: '你有 '+ resp.remove_items_count +' 条变动产品待处理',
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
    selectValue(type, value){
      if (type ==='batch') {
        this.filterBatch = value
      } else {
        this.filterShop = value
      }
      this.page = 1;
      this.initShips();
    },
    // 关闭筛选项/排序项
    colseFilter(type) {
      if (type === 'batch') this.filterBatch = ''
      if (type === 'shop') this.filterShop = ''
      if (type === 'platform') this.platform = ''
      if (type === 'sort') {
        this.filterSort = ''
        this.sort = '-create_time'
      }

      if (type === 'all') {
        this.platform = ''
        this.filterBatch = ''
        this.filterShop = ''
        this.filterSort = ''
        this.sort = '-create_time'
      }

      this.page = 1;
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
    //编辑标签弹窗
    editTagWindow(obj){
      this.tagVisible = true
      this.ship_id = obj.id
      this.tag.tag_color = obj.tag_color?obj.tag_color:'#409EFF'
      this.tag.tag_name = obj.tag_name
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
        this.in_warehouse_loading = true
        this.postRequest('api/ml_ship/in_warehouse/', {'id': id}).then(resp => {
          this.in_warehouse_loading = false
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

    //物流操作
    carrierOp(command){
      // 盛德对账
      if (command['type'] === 'bill_input') {
        this.bill_win = 'INPUT'
        this.sdBillVisible = true
      }

      // 刷新状态
      if (command['type'] === 'refresh_order') {
        const loading = this.$loading({
          lock: true,
          text: '正在刷新中...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        });
        this.getRequest('/api/ml_ship/check_sd_order_status/').then(resp => {
          loading.close();
          if (resp) {
            this.initShips()
          }
        })
      }

      // 刷新跟踪
      if (command['type'] === 'refresh_tracking') {
        this.bulkUpdateTracking()
      }
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
            if (resp.status === 'success') {
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

      // 导出微草申报单
      if (command['type'] === 'export_wc') {
        this.$confirm('是否导出微草申报单?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let url = 'api/ml_ship/export_logistic_decl/'
          this.postRequest(url, {'id': command['id'], 'name': 'WEICAO'}).then(resp => {
            if (resp.status === 'success') {
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

      // 打印盛德交运单
      if (command['type'] === 'print_receipt') {
        const loading = this.$loading({
          lock: true,
          text: '正在生成标签',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        });
        this.postRequest('api/ml_ship/carrier_label/', {'s_number': command['num'], 'label_type': 'RECEIPT'}).then(resp => {
          loading.close();
          if (resp.status === 'success') {
            window.open(resp.link, '_blank')
          }
        })
      }

      // 打印盛德箱唛
      if (command['type'] === 'print_box') {
        const loading = this.$loading({
          lock: true,
          text: '正在生成标签',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        });
        this.postRequest('api/ml_ship/carrier_label/', {'s_number': command['num'], 'label_type': 'BOX'}).then(resp => {
          loading.close();
          if (resp.status === 'success') {
            window.open(resp.link, '_blank')
          }
        })
      }

      // 盛德物流交运
      if (command['type'] === 'place_order') {
        if (command['obj'].carrier_order_status) {
          this.$confirm('运单已经交运，是否再次交运?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.timer = new Date().getTime();
            this.ship_obj = command['obj']
            this.carrierOrderVisible = true
          })
        } else {

          this.timer = new Date().getTime();
          this.ship_obj = command['obj']
          this.carrierOrderVisible = true

        }

      }

      // 添加标签
      if (command['type'] === 'tag') {
        this.editTagWindow(command['obj'])
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
      if (this.sort !=='-create_time') {
        let select_sort = this.ordering_group.find(item => item.value === this.sort)
        this.filterSort = select_sort.name
      } else {
        this.filterSort = ''
      }

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
    //跳转运单信息中心
    goShipInfo() {
      this.$router.push('/shipInfo')
    },
    initShips() {
      let url = '/api/ml_ship/?page=' + this.page + '&page_size=' + this.size
      if (this.searchValue) {
        url += '&search=' + this.searchValue;
      }
      if (this.filterBatch) {
        url += '&batch=' + this.filterBatch;
      }
      if (this.filterShop) {
        url += '&shop=' + this.filterShop;
      }
      if (this.platform) {
        url += this.platform;
      }
      if (!this.permission.ship_allShopCheck) {
        url += '&user_id__in=0,' + this.user.id;
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

      //保存过滤参数
      window.sessionStorage.setItem('ml_ship_filterBatch', JSON.stringify(this.filterBatch));
      window.sessionStorage.setItem('ml_ship_platform', JSON.stringify(this.platform));
      window.sessionStorage.setItem('ml_ship_filterShop', JSON.stringify(this.filterShop));
      window.sessionStorage.setItem('ml_ship_filterSort', JSON.stringify(this.filterSort));

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
.tt_msg{
  color: #409EFF;
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
.track_update{
  margin-left: 10px;
  color: #99a9bf;
}
.filterShow {
  background-color: #ecf5ff;
  border: 1px solid #409EFF;
  margin-top: 5px;
  padding: 3px 3px 3px 50px;
  font-size: 14px;
  color: #303133;
}
.filterShow .el-tag {
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