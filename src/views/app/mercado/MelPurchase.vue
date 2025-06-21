/*
美客多采购管理
*/
<template>
  <div>
    <div class="operate">
      <div class="filter">
        <div>

          <el-badge is-dot :value="wait_buy_num"
                    v-if="permission.purchase_checkWaitBuy"
                    :hidden="!wait_buy_num" class="item">
            <el-button size="small" :type="p_status==='WAITBUY'?'primary':''" @click="changeStatus('WAITBUY')">待采购</el-button>
          </el-badge>
            <span class="jiantou" v-if="permission.purchase_checkWaitBuy"><i class="el-icon-d-arrow-right"></i></span>

          <el-badge is-dot :value="purchased_num"
                    v-if="permission.purchase_checkAlreadyBuy"
                    :hidden="!purchased_num" class="item">
            <el-button size="small" :type="p_status==='PURCHASED'?'primary':''" @click="changeStatus('PURCHASED')">已采购</el-button>
          </el-badge>
          <span class="jiantou" v-if="permission.purchase_checkAlreadyBuy"><i class="el-icon-d-arrow-right"></i></span>

          <el-badge is-dot :value="rec_num"
                    v-if="permission.purchase_checkReceived"
                    :hidden="!rec_num" class="item">
            <el-button size="small" :type="p_status==='RECEIVED'?'primary':''" @click="changeStatus('RECEIVED')">已到货</el-button>
          </el-badge>
          <span class="jiantou" v-if="permission.purchase_checkReceived"><i class="el-icon-d-arrow-right"></i></span>

          <el-badge is-dot :value="pack_num"
                    v-if="permission.purchase_checkPacked"
                    :hidden="!pack_num" class="item">
            <el-button size="small" :type="p_status==='PACKED'?'primary':''" @click="changeStatus('PACKED')">已打包</el-button>
          </el-badge>
          <span class="jiantou" v-if="permission.purchase_checkPacked"><i class="el-icon-d-arrow-right"></i></span>
          <el-button size="small" :type="p_status==='USED'?'primary':''"
                     v-if="permission.purchase_checkOut"
                     @click="changeStatus('USED')">已出库</el-button>

        </div>
      </div>
      <div class="filter">

      </div>

      <div class="filter">
        <div>
          <el-input size="small" placeholder="SKU 产品名称 ItemID"
                    clearable
                    @clear="clearSearchValue"
                    @keyup.enter.native="doSearch"
                    v-model="searchValue"
                    style="width: 350px; margin-right: 5px">
            <el-button slot="append" icon="el-icon-search" @click="doSearch">搜索</el-button>
          </el-input>

          <el-select v-model="shop"
                     style="width: 300px;margin-left: 5px"
                     @change="changeFilter" placeholder="请选择店铺">
            <el-option
                v-for="item in shops"
                :key="item.id"
                :label="item.name"
                :value="item.name">
              <span style="float: left">{{ item.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ item.nickname }}</span>
            </el-option>
          </el-select>

          <el-select v-model="platform"
                     style="width: 150px;margin-left: 5px; "
                     @change="changeFilter" placeholder="请选择平台">
            <el-option
                v-for="item in platforms"
                :key="item.name"
                :label="item.name"
                :value="item.value">
            </el-option>
          </el-select>

          <el-select v-model="filter_name"
                     v-if="p_status==='WAITBUY'"
                     style="width: 150px;margin-left: 5px; "
                     @change="changeFilter" placeholder="请选择筛选项">
            <el-option
                v-for="item in filter_group"
                :key="item.name"
                :label="item.name"
                :value="item.value">
            </el-option>
          </el-select>

          <el-badge  :hidden="!multipleSelection.length" :value="multipleSelection.length" class="item_main" v-if="p_status==='WAITBUY'">
            <el-button :disabled="!multipleSelection.length"
                       v-if="permission.purchase_buy"
                       :loading="op_loading"
                       @click="buyVisible=true" type="primary" plain>下单采购</el-button>
          </el-badge>

          <el-badge  :hidden="!multipleSelection.length" :value="multipleSelection.length" class="item_main" v-if="p_status==='PURCHASED'">
            <el-button :disabled="!multipleSelection.length"
                       v-if="permission.purchase_receive"
                       :loading="op_loading"
                       @click="summitRec" type="primary" plain>确认收货</el-button>
          </el-badge>

          <el-badge  :hidden="!multipleSelection.length" :value="multipleSelection.length" class="item_main" v-if="p_status==='RECEIVED'">
            <el-button :disabled="!multipleSelection.length"
                       v-if="permission.purchase_qc"
                       :loading="op_loading"
                       @click="summitQC" type="success" plain>产品质检</el-button>
          </el-badge>

          <el-badge  :hidden="!multipleSelection.length" :value="multipleSelection.length" class="item_main" v-if="p_status==='RECEIVED'">
            <el-button :disabled="!multipleSelection.length"
                       v-if="permission.purchase_pack"
                       :loading="op_loading"
                       @click="summitPack" type="primary" plain>确认打包</el-button>
          </el-badge>

        </div>

        <el-dropdown @command="handleCommand" v-if="p_status==='WAITBUY'">
          <el-button type="success" :disabled="!permission.purchase_create">
            新增采购<i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="sys">自动拉取</el-dropdown-item>
            <el-dropdown-item command="manuel">手动添加</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>

    <div style="margin-top: 5px">
      <!--      待采购表格-->
      <el-table
          v-if="p_status==='WAITBUY'"
          ref="purchaseTable"
          :data="purchaseList"
          :header-cell-style="{background:'#fafafa'}"
          v-loading="loading"
          :row-key="getRowKeys"
          @selection-change="handleSelectionChange"
          style="width: 100%">

        <el-table-column
            :reserve-selection="true"
            type="selection"
            width="42">
        </el-table-column>

        <el-table-column
            label="图片"
            align="center"
            header-align="center"
            width="100">
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
            show-overflow-tooltip>
          <template slot-scope="scope">
            <div style="font-weight: bold">
              <el-link
                  style="font-weight: bold"
                  @click.native="productDetail(scope.row.sku)"
                  :underline="false">
                {{ scope.row.sku }}
              </el-link>
              <el-tag v-if="scope.row.s_type==='NEW'" type="success" size="mini" effect="dark">新</el-tag>
            </div>
            <div>{{ scope.row.p_name }}</div>
            <div>
              <span style="margin-right: 5px" v-if="scope.row.create_type==='MANUAL'">
              <el-tag type="warning" size="mini" effect="plain">手动</el-tag>
              </span>
              <span class="plan3" v-if="scope.row.need_qty === scope.row.buy_qty">
                <i class="el-icon-circle-check"></i> 运单需求 {{ scope.row.need_qty }}</span>
              <span class="plan1" v-if="scope.row.need_qty>0 && scope.row.need_qty !== scope.row.buy_qty">
                <i class="el-icon-warning-outline"></i> 运单需求 {{ scope.row.need_qty }}</span>
              <span class="plan2" v-if="scope.row.need_qty === 0">
                <i class="el-icon-circle-close"></i> 运单需求 无</span>

              <span class="plan4" v-if="scope.row.total_onway_qty">
                在途 {{ scope.row.total_onway_qty }}</span>
              <span class="plan4" v-if="scope.row.total_rec_qty">
                库存 {{ scope.row.total_rec_qty }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column
            label="成本价"
            align="center"
            header-align="center"
            width="80">
          <template slot-scope="scope">
            <div>{{ scope.row.unit_cost | currency}}</div>
          </template>
        </el-table-column>

        <el-table-column
            label="采购建议"
            align="center"
            header-align="center"
            width="160">
          <template slot-scope="scope">
            <el-input-number v-model="scope.row.buy_qty" :min="0"></el-input-number>
          </template>
        </el-table-column>

        <el-table-column
            label="店铺"
            align="center"
            header-align="center"
            width="150">
          <template slot-scope="scope">
            <div style="margin-top: 5px">
              <el-tag
                  style="border: none"
                  :color="scope.row.shop_color?scope.row.shop_color:'#539acd'"
                  effect="dark" type="info">
                <span style="font-weight: bold">{{ scope.row.shop}}</span>
              </el-tag>
            </div>
            <div style="margin-top: 5px">
              <el-tag size="mini" effect="plain">{{ scope.row.platform | pf}}</el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column
            width="180"
            label="简要备注"
            show-overflow-tooltip>
          <template slot-scope="scope">
            <div>{{ scope.row.note }}</div>
          </template>
        </el-table-column>

        <el-table-column
            :label="timeLabel"
            align="center"
            header-align="center"
            width="150">
          <template slot-scope="scope">
            <div>{{ scope.row.create_time | date}}</div>
          </template>
        </el-table-column>

        <el-table-column
            align="center"
            header-align="center"
            label="操作"
            width="50"
        >
          <template slot-scope="scope">
            <el-dropdown @command="handleProductOp">
              <el-button type="text">
                <i class="el-icon-more"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :command="{type:'edit_note', obj:scope.row}">编辑备注</el-dropdown-item>
                <el-dropdown-item :command="{type:'delete', id:scope.row.id}"
                                  v-if="permission.purchase_delete">删除</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!--      已采购表格-->
      <el-table
          v-if="p_status==='PURCHASED'"
          ref="purchaseTable"
          :data="purchaseList"
          :header-cell-style="{background:'#fafafa'}"
          v-loading="loading"
          :row-key="getRowKeys"
          @selection-change="handleSelectionChange"
          style="width: 100%">

        <el-table-column
            :reserve-selection="true"
            type="selection"
            width="42">
        </el-table-column>

        <el-table-column
            label="图片"
            align="center"
            header-align="center"
            width="100">
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
            show-overflow-tooltip>
          <template slot-scope="scope">
            <div style="font-weight: bold">
              <el-link
                  style="font-weight: bold"
                  @click.native="productDetail(scope.row.sku)"
                  :underline="false">
                {{ scope.row.sku }}
              </el-link>
              <el-tag v-if="scope.row.s_type==='NEW'" type="success" size="mini" effect="dark">新</el-tag>
            </div>
            <div>{{ scope.row.p_name }}</div>
            <div>
              <span class="plan3" v-if="scope.row.need_qty === scope.row.buy_qty">
                <i class="el-icon-circle-check"></i> 运单需求 {{ scope.row.need_qty }}</span>
              <span class="plan1" v-if="scope.row.need_qty>0 && scope.row.need_qty !== scope.row.buy_qty">
                <i class="el-icon-warning-outline"></i> 运单需求 {{ scope.row.need_qty }}</span>
              <span class="plan2" v-if="scope.row.need_qty === 0">
                <i class="el-icon-circle-close"></i> 运单需求 无</span>

              <span class="plan4" v-if="scope.row.total_rec_qty">
                库存 {{ scope.row.total_rec_qty }}</span>

              <span class="plan5" v-if="scope.row.item_remove_status !== 100">
                <i class="el-icon-warning-outline"></i>变动状态：{{ scope.row.item_remove_status | removeStatus }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column
            label="成本价"
            align="center"
            header-align="center"
            width="80">
          <template slot-scope="scope">
            <div>{{ scope.row.unit_cost | currency}}</div>
          </template>
        </el-table-column>

        <el-table-column
            label="在途数量"
            align="center"
            header-align="center"
            width="160">
          <template slot-scope="scope">
            <div>{{ scope.row.buy_qty}}</div>
          </template>
        </el-table-column>

        <el-table-column
            v-if="p_status==='PURCHASED'"
            label="收货数量"
            align="center"
            header-align="center"
            width="160">
          <template slot-scope="scope">
            <el-input-number v-model="scope.row.rec_qty" :min="1"></el-input-number>
          </template>
        </el-table-column>

        <el-table-column
            label="店铺"
            align="center"
            header-align="center"
            width="150">
          <template slot-scope="scope">
            <div style="margin-top: 5px">
              <el-tag
                  style="border: none"
                  :color="scope.row.shop_color?scope.row.shop_color:'#539acd'"
                  effect="dark" type="info">
                <span style="font-weight: bold">{{ scope.row.shop}}</span>
              </el-tag>
            </div>
            <div style="margin-top: 5px">
              <el-tag size="mini" effect="plain">{{ scope.row.platform | pf}}</el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column
            width="180"
            label="简要备注"
            show-overflow-tooltip>
          <template slot-scope="scope">
            <div>{{ scope.row.note }}</div>
          </template>
        </el-table-column>

        <el-table-column
            :label="timeLabel"
            align="center"
            header-align="center"
            width="150">
          <template slot-scope="scope">
            <div>{{ scope.row.buy_time | date}}</div>
          </template>
        </el-table-column>

        <el-table-column
            align="center"
            header-align="center"
            label="操作"
            width="50"
        >
          <template slot-scope="scope">
            <el-dropdown @command="handleProductOp">
              <el-button type="text">
                <i class="el-icon-more"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :command="{type:'edit_note', obj:scope.row}">编辑备注</el-dropdown-item>
                <el-dropdown-item :command="{type:'delete', id:scope.row.id}"
                                  v-if="permission.purchase_delete">删除</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

<!--      已到货表格-->
      <el-table
          v-if="p_status==='RECEIVED'"
          ref="purchaseTable"
          :data="purchaseList"
          :header-cell-style="{background:'#fafafa'}"
          v-loading="loading"
          :row-key="getRowKeys"
          @selection-change="handleSelectionChange"
          style="width: 100%">

        <el-table-column
            :reserve-selection="true"
            type="selection"
            width="42">
        </el-table-column>

        <el-table-column
            label="图片"
            align="center"
            header-align="center"
            width="100">
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
            show-overflow-tooltip>
          <template slot-scope="scope">
            <div style="font-weight: bold">
              <el-link
                  style="font-weight: bold"
                  @click.native="productDetail(scope.row.sku)"
                  :underline="false">
                {{ scope.row.sku }}
              </el-link>
              <el-tag v-if="scope.row.s_type==='NEW'" type="success" size="mini" effect="dark">新</el-tag>
              <el-tag v-if="scope.row.create_type==='MOVE'"
                      style="margin-left: 5px"
                      size="mini" effect="dark">迁移</el-tag>
            </div>
            <div>{{ scope.row.p_name }}</div>
            <div class="packing">{{ scope.row.packing_name }} - {{ scope.row.packing_size }}</div>
          </template>
        </el-table-column>

        <el-table-column
            label="产品质检"
            align="center"
            header-align="center"
            width="80">
          <template slot-scope="scope">
            <el-tag type="success" size="small" effect="plain" v-if="scope.row.is_qc">已质检</el-tag>
            <el-tag type="warning" size="small" effect="plain" v-if="!scope.row.is_qc">未质检</el-tag>
          </template>
        </el-table-column>

        <el-table-column
            label="到货数量"
            align="center"
            header-align="center"
            width="160">
          <template slot-scope="scope">
            <div>{{ scope.row.rec_qty}}</div>
          </template>
        </el-table-column>

        <el-table-column
            v-if="permission.purchase_pack"
            label="打包数量"
            align="center"
            header-align="center"
            width="160">
          <template slot-scope="scope">
            <el-input-number v-model="scope.row.pack_qty" :min="1"></el-input-number>
          </template>
        </el-table-column>

        <el-table-column
            label="店铺"
            align="center"
            header-align="center"
            width="150">
          <template slot-scope="scope">
            <div style="margin-top: 5px">
              <el-tag
                  style="border: none"
                  :color="scope.row.shop_color?scope.row.shop_color:'#539acd'"
                  effect="dark" type="info">
                <span style="font-weight: bold">{{ scope.row.shop}}</span>
              </el-tag>
            </div>
            <div style="margin-top: 5px">
              <el-tag size="mini" effect="plain">{{ scope.row.platform | pf}}</el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column
            width="180"
            label="简要备注"
            show-overflow-tooltip>
          <template slot-scope="scope">
            <div>{{ scope.row.note }}</div>
          </template>
        </el-table-column>

        <el-table-column
            :label="timeLabel"
            align="center"
            header-align="center"
            width="150">
          <template slot-scope="scope">
            <div>{{ scope.row.rec_time | date}}</div>
          </template>
        </el-table-column>

        <el-table-column
            align="center"
            header-align="center"
            label="操作"
            width="50"
        >
          <template slot-scope="scope">
            <el-dropdown @command="handleProductOp">
              <el-button type="text">
                <i class="el-icon-more"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :command="{type:'edit_note', obj:scope.row}">编辑备注</el-dropdown-item>
                <el-dropdown-item :command="{type:'move', obj:scope.row}">库存迁移</el-dropdown-item>
                <el-dropdown-item :command="{type:'delete', id:scope.row.id}"
                                  v-if="permission.purchase_delete">删除</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

<!--      已打包表格-->
      <el-table
          v-if="p_status==='PACKED'"
          ref="purchaseTable"
          :data="purchaseList"
          :header-cell-style="{background:'#fafafa'}"
          v-loading="loading"
          :row-key="getRowKeys"
          @selection-change="handleSelectionChange"
          style="width: 100%">

        <el-table-column
            :reserve-selection="true"
            type="selection"
            width="42">
        </el-table-column>

        <el-table-column
            label="图片"
            align="center"
            header-align="center"
            width="100">
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
            show-overflow-tooltip>
          <template slot-scope="scope">
            <div style="font-weight: bold">
              <el-link
                  style="font-weight: bold"
                  @click.native="productDetail(scope.row.sku)"
                  :underline="false">
                {{ scope.row.sku }}
              </el-link>
              <el-tag v-if="scope.row.s_type==='NEW'" type="success" size="mini" effect="dark">新</el-tag>
            </div>
            <div>{{ scope.row.p_name }}</div>
            <div class="packing">{{ scope.row.packing_name }} - {{ scope.row.packing_size }}
              <el-tag type="warning" size="small" effect="plain" v-if="!scope.row.is_checked">数据待核查</el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column
            label="成本价"
            align="center"
            header-align="center"
            width="80">
          <template slot-scope="scope">
            <div>{{ scope.row.unit_cost | currency}}</div>
          </template>
        </el-table-column>

        <el-table-column
            label="在仓数量"
            align="center"
            header-align="center"
            width="160">
          <template slot-scope="scope">
            <div>{{ scope.row.pack_qty}}</div>
          </template>
        </el-table-column>

        <el-table-column
            label="店铺"
            align="center"
            header-align="center"
            width="150">
          <template slot-scope="scope">
            <div style="margin-top: 5px">
              <el-tag
                  style="border: none"
                  :color="scope.row.shop_color?scope.row.shop_color:'#539acd'"
                  effect="dark" type="info">
                <span style="font-weight: bold">{{ scope.row.shop}}</span>
              </el-tag>
            </div>
            <div style="margin-top: 5px">
              <el-tag size="mini" effect="plain">{{ scope.row.platform | pf}}</el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column
            width="180"
            label="简要备注"
            show-overflow-tooltip>
          <template slot-scope="scope">
            <div>{{ scope.row.note }}</div>
          </template>
        </el-table-column>

        <el-table-column
            :label="timeLabel"
            align="center"
            header-align="center"
            width="150">
          <template slot-scope="scope">
            <div>{{ scope.row.pack_time | date}}</div>
          </template>
        </el-table-column>

        <el-table-column
            align="center"
            header-align="center"
            label="操作"
            width="50"
        >
          <template slot-scope="scope">
            <el-dropdown @command="handleProductOp">
              <el-button type="text">
                <i class="el-icon-more"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :command="{type:'check_product', obj:scope.row}"
                                  v-if="permission.purchase_dataCheck">数据核查</el-dropdown-item>
                <el-dropdown-item :command="{type:'edit_note', obj:scope.row}">编辑备注</el-dropdown-item>
                <el-dropdown-item :command="{type:'move', obj:scope.row}">库存迁移</el-dropdown-item>
                <el-dropdown-item :command="{type:'delete', id:scope.row.id}"
                                  v-if="permission.purchase_delete">删除</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

<!--      已出库表格-->
      <el-table
          v-if="p_status==='USED'"
          ref="purchaseTable"
          :data="purchaseList"
          :header-cell-style="{background:'#fafafa'}"
          v-loading="loading"
          :row-key="getRowKeys"
          @selection-change="handleSelectionChange"
          style="width: 100%">

        <el-table-column
            :reserve-selection="true"
            type="selection"
            width="42">
        </el-table-column>

        <el-table-column
            label="图片"
            align="center"
            header-align="center"
            width="100">
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
            show-overflow-tooltip>
          <template slot-scope="scope">
            <div style="font-weight: bold">{{ scope.row.sku }}
              <el-tag v-if="scope.row.s_type==='NEW'" type="success" size="mini" effect="dark">新</el-tag>
            </div>
            <div>{{ scope.row.p_name }}</div>
            <div class="packing">{{ scope.row.packing_name }} - {{ scope.row.packing_size }}</div>
          </template>
        </el-table-column>

        <el-table-column
            label="使用批次"
            align="center"
            header-align="center"
            width="80">
          <template slot-scope="scope">
            <div>{{ scope.row.used_batch}}</div>
          </template>
        </el-table-column>

        <el-table-column
            label="出库数量"
            align="center"
            header-align="center"
            width="160">
          <template slot-scope="scope">
            <div>{{ scope.row.used_qty}}</div>
          </template>
        </el-table-column>

        <el-table-column
            label="店铺"
            align="center"
            header-align="center"
            width="150">
          <template slot-scope="scope">
            <div style="margin-top: 5px">
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
            width="180"
            label="简要备注"
            show-overflow-tooltip>
          <template slot-scope="scope">
            <div>{{ scope.row.note }}</div>
          </template>
        </el-table-column>

        <el-table-column
            :label="timeLabel"
            align="center"
            header-align="center"
            width="150">
          <template slot-scope="scope">
            <div>{{ scope.row.used_time | date}}</div>
          </template>
        </el-table-column>

        <el-table-column
            align="center"
            header-align="center"
            label="操作"
            width="50"
        >
          <template slot-scope="scope">
            <el-dropdown @command="handleProductOp">
              <el-button type="text">
                <i class="el-icon-more"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :command="{type:'edit_note', obj:scope.row}">编辑备注</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

    </div>

    <div class="pagination">
      <el-pagination
          background
          :page-sizes="[50, 100]"
          @current-change="currentChange"
          @size-change="sizeChange"
          layout="sizes, prev, pager, next, jumper, ->, total"
          :current-page="page"
          :total="total">
      </el-pagination>
    </div>

    <!--    下单采购弹窗-->
    <el-dialog
        title="采购列表"
        :visible.sync="buyVisible"
        :destroy-on-close="true"
        :close-on-click-modal="false"
        width="1000px"
    >
      <div>
        <el-checkbox v-model="changPrice" v-if="permission.purchase_changePrice">修改并同步价格到产品库</el-checkbox>
        <el-table
            ref="fbmTable"
            :data="multipleSelection"
            :header-cell-style="{background:'#fafafa'}"
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
                  :preview-src-list="[scope.row.image]"
                  fit="fill">
              </el-image>
            </template>
          </el-table-column>

          <el-table-column
              label="产品"
              show-overflow-tooltip>
            <template slot-scope="scope">
              <div style="font-weight: bold">{{ scope.row.sku }}</div>
              <div>{{ scope.row.p_name }}</div>
            </template>
          </el-table-column>

          <el-table-column
              label="成本价"
              align="center"
              header-align="center"
              width="160">
            <template slot-scope="scope">
              <div v-if="!changPrice">{{ scope.row.unit_cost | currency}}</div>
              <div v-if="changPrice"><el-input-number v-model="scope.row.unit_cost" :precision="2" :min="0.01"></el-input-number></div>
            </template>
          </el-table-column>

          <el-table-column
              label="采购数量"
              align="center"
              header-align="center"
              width="160">
            <template slot-scope="scope">
              <el-input-number v-model="scope.row.buy_qty" :min="1"></el-input-number>
            </template>
          </el-table-column>

        </el-table>
      </div>
      <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="buyVisible=false">取 消</el-button>
          <el-button size="small" type="primary" @click="summitBuy">确认下单</el-button>
        </span>
    </el-dialog>

    <!--    添加产品弹窗-->
    <el-dialog
        title="添加产品"
        :visible.sync="addProductVisible"
        :destroy-on-close="true"
        :close-on-click-modal="false"
        width="800px"
    >
      <MelAddProduct ref="addProduct" @func="getAddProducts"></MelAddProduct>
      <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="addProductVisible = false">取 消</el-button>
          <el-button size="small" type="primary" @click="confirmAddProduct">确 定</el-button>
        </span>
    </el-dialog>

    <!--    修改备注弹窗-->
    <el-dialog
        title="编辑备注"
        :visible.sync="noteVisible"
        :destroy-on-close="true"
        :close-on-click-modal="false"
        width="300px"
    >
      <div>
        <el-input maxlength="50" v-model="note_value" placeholder="请输入备注"></el-input>
      </div>
      <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="noteVisible = false">取 消</el-button>
          <el-button size="small" type="primary" :disabled="!noteVisible" @click="summitEditNote">确 定</el-button>
        </span>
    </el-dialog>

    <!--    产品数据核查弹窗-->
    <el-dialog
        title="数据核查"
        :visible.sync="checkVisible"
        :destroy-on-close="true"
        :close-on-click-modal="false"
        width="400px"
    >

      <el-form>
        <el-form-item prop="unit_colst" label="成本价">
          <el-input-number v-model="mlProduct.unit_cost" :precision="2" :min="0.01"></el-input-number>
        </el-form-item>
        <el-form-item prop="length">
          <el-input v-model="mlProduct.length">
            <template slot="prepend">长cm</template>
          </el-input>
        </el-form-item>
        <el-form-item prop="width">
          <el-input v-model="mlProduct.width">
            <template slot="prepend">宽cm</template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-input v-model="mlProduct.heigth">
            <template slot="prepend">高cm</template>
          </el-input>
        </el-form-item>

        <el-form-item prop="weight">
          <el-input v-model="mlProduct.weight">
            <template slot="prepend">重量kg</template>
          </el-input>
        </el-form-item>
        <el-form-item label="包材" prop="shop">
          <el-select style="width: 300px;" v-model="mlProduct.packing_id" placeholder="请选择包材">
            <el-option
                v-for="item in packs"
                :key="item.name"
                :label="item.name"
                :value="item.id">
              <span style="float: left">{{ item.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ item.size }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="数据是否核对">
          <el-switch
              v-model="mlProduct.is_checked"
              active-color="#13ce66">
          </el-switch>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="checkVisible = false">取 消</el-button>
          <el-button size="small" type="primary" @click="summitCheck">确 定</el-button>
        </span>
    </el-dialog>

    <!--    产品详情弹窗-->
    <el-dialog
        title="产品详情"
        :visible.sync="productDetailVisible"
        :destroy-on-close="true"
        :close-on-click-modal="false"
        width="1200px"
    >
      <MelProductDetail ref="productDetail"
                        :key="timer"
                        :productID="productID"
                        @closeProductDetail="closeProductDetail"></MelProductDetail>
      <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="productDetailVisible = false">取 消</el-button>
          <el-button size="small" type="primary"
                     :disabled="!permission.product_editAll"
                     @click="productDetailUpdate">确 定</el-button>
        </span>
    </el-dialog>

    <!--    迁移弹窗-->
    <el-dialog
        title="库存迁移"
        :visible.sync="moveVisible"
        :destroy-on-close="true"
        :close-on-click-modal="false"
        width="800px"
    >
      <div>


        <div>
          <span style="font-weight: bold">迁出产品：</span><br>
        </div>
        <el-table
            ref="fbmTable"
            :data="move_from_list"
            :header-cell-style="{background:'#fafafa'}"
            style="width: 100%">

          <el-table-column
              label="图片"
              align="center"
              header-align="center"
              width="80">
            <template slot-scope="scope">
              <el-image
                  style="width: 40px; height: 40px"
                  :src="scope.row.image | smpic"
                  fit="fill">
              </el-image>
            </template>
          </el-table-column>
          <el-table-column
              label="产品">
            <template slot-scope="scope">
              <div><span style="font-weight: bold">{{ scope.row.sku }} </span>
              </div>

              <div>{{ scope.row.p_name }}</div>
              <div><span class="remove">{{ scope.row.shop }} </span></div>
            </template>
          </el-table-column>

          <el-table-column
              label="库存数量"
              align="center"
              header-align="center"
              width="80">
            <template slot-scope="scope">
              <div style="font-weight: bold">{{ scope.row.qty}}</div>
            </template>
          </el-table-column>

        </el-table>

        <div style="margin-top: 20px">
          <span style="font-weight: bold">目标SKU：</span>
          <el-input v-model="target_sku"
                    @change="move_check"
                    style="width: 200px" placeholder="请输入目标SKU"></el-input>
        </div>

        <el-table
            v-if="move_target_list.length"
            ref="fbmTable"
            :data="move_target_list"
            :header-cell-style="{background:'#f0f9eb'}"
            style="width: 100%">

          <el-table-column
              label="图片"
              align="center"
              header-align="center"
              width="80">
            <template slot-scope="scope">
              <el-image
                  style="width: 40px; height: 40px"
                  :src="scope.row.image | smpic"
                  fit="fill">
              </el-image>
            </template>
          </el-table-column>
          <el-table-column
              label="产品">
            <template slot-scope="scope">
              <div><span style="font-weight: bold">{{ scope.row.sku }} </span>
              </div>

              <div>{{ scope.row.p_name }}</div>
              <div><span class="remove">{{ scope.row.shop }} </span></div>
            </template>
          </el-table-column>

          <el-table-column
              label="迁移数量"
              align="center"
              header-align="center"
              width="160">
            <template slot-scope="scope">
              <el-input-number v-model="scope.row.move_qty" :min="1"></el-input-number>
            </template>
          </el-table-column>

        </el-table>

      </div>
      <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="moveVisible=false">取 消</el-button>
          <el-button size="small" type="primary" @click="summitMove">确认迁移</el-button>
        </span>
    </el-dialog>

  </div>
</template>

<script>
import moment from "moment/moment";
import MelAddProduct from "@/views/app/mercado/MelAddProduct";
import MelProductDetail from "@/views/app/mercado/MelProductDetail";

export default {
  name: "MelPurchase",
  props: ["buyStatusName"],
  components:{MelAddProduct, MelProductDetail},
  data() {
    return {
      purchaseList: [],
      permission: JSON.parse(window.sessionStorage.getItem('ml_permission')),
      loading: false,
      op_loading: false,
      total: 0, // 总条数
      page: 1,  // 当前页
      size: 50,  // 页大小
      searchValue: '',
      p_status: 'WAITBUY',// 筛选状态
      multipleSelection: [], // 选中行
      changPrice: false, // 修改并同步价格到产品库
      buyVisible: false, // 下单采购弹窗
      shop: '全部店铺',
      shops: [],
      wait_buy_num: 0, // 待采购单数量
      purchased_num: 0, // 已采购单数量
      rec_num: 0, // 已收货单数量
      pack_num: 0, // 已打包单数量
      addProductVisible: false, // 添加产品弹窗
      noteVisible: false, // 编辑备注弹窗
      note_value: '', // 备注
      checkVisible: false, // 产品数据核查弹窗
      moveVisible: false, // 迁移弹窗
      move_from: {
        id: null,
        sku: '',
        p_name: '',
        image: '',
        qty: 0,
        shop: '',
      }, //迁移产品
      move_target: {
        sku: '',
        p_name: '',
        image: '',
        move_qty: 1,
        shop: '',
      }, //迁移产品
      move_from_list: [],
      move_target_list: [],
      target_sku: '', //迁移目标sku
      productDetailVisible: false, // 产品详情弹窗
      timer: null,
      productID: null, // 产品id
      packs: [],
      mlProduct: {
        pm_id: null,
        unit_cost: null,
        length: null,
        width: null,
        heigth: null,
        weight: null,
        is_checked: false,
        packing_id: null
      },
      filter_name: '&buy_qty__gt=0', // 库存筛选
      filter_group: [
        {
          name: '全部采购需求',
          value: ''
        },
        {
          name: '库存未满足',
          value: '&buy_qty__gt=0'
        },
        {
          name: '库存已满足',
          value: '&buy_qty=0'
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
        {
          name: 'OZON',
          value: '&platform=OZON'
        },
        {
          name: 'EMAG',
          value: '&platform=EMAG'
        },
      ],
    }
  },
  computed: {
    // 时间名称
    timeLabel() {
      if (this.p_status === 'WAITBUY') return '更新时间'
      if (this.p_status === 'PURCHASED') return '采购时间'
      if (this.p_status === 'RECEIVED') return '到货时间'
      if (this.p_status === 'PACKED') return '打包时间'
      if (this.p_status === 'USED') return '出库时间'
      return ''
    },
  },
  filters: {
    //rmb金额格式化
    currency: function (value) {
      if (!value) return 0.00;
      return `¥${value.toFixed(2)}`;
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
    //变动状态格式化
    removeStatus: function (value) {
      if (value === 0) return '待处理';
      if (value === 3) return '保留';
      return '';
    },
    //平台格式化
    pf: function (value) {
      if (value === 'MERCADO') return '美客多';
      if (value === 'NOON') return 'Noon';
      if (value === 'OZON') return 'OZON';
      if (value === 'EMAG') return 'EMAG';
      return '';
    },
  },
  mounted() {
    if (this.permission.purchase_checkWaitBuy) {
      this.p_status = this.buyStatusName?this.buyStatusName:'WAITBUY'
    } else {
      this.p_status = 'PACKED'
      this.filter_name = ''
    }
    this.inintShops()
    this.calcPurchases();
  },
  methods:{
    //提交迁移
    summitMove(){
      if (this.move_target.move_qty > this.move_from.qty) {
        this.$message.error('迁移数量有误！')
        return ''
      }
      let data ={
        'from_id': this.move_from.id,
        'from_sku': this.move_from.sku,
        'from_qty': this.move_from.qty,
        'target_sku': this.move_target.sku,
        'move_qty': this.move_target.move_qty,
      }
      this.postRequest('api/ml_purchase/move_sku/', data).then(resp => {
        if (resp.code === 'success') {
          this.moveVisible = false
          this.initPurchaseList()
        }
      })
    },
    //产品迁移检查
    move_check(){
      if (this.target_sku === this.move_from.sku) {
        this.$message.error('目标sku不能是源迁移产品！')
        return ''
      }
      this.move_target_list = []
      this.postRequest('api/ml_purchase/move_check/', {'sku': this.target_sku}).then(resp => {
        if (resp) {
          this.move_target.sku = resp.product.sku
          this.move_target.p_name = resp.product.p_name
          this.move_target.image = resp.product.image
          this.move_target.shop = resp.product.shop
          this.move_qty = 1

          this.move_target_list.push(this.move_target)
        }
      })
    },

    // 打开产品详情弹窗
    productDetail(sku){
      this.postRequest('api/ml_products/get_product_id/', {'sku': sku}).then(resp => {
        if (resp.id) {
          this.timer = new Date().getTime();
          this.productID = resp.id;
          this.productDetailVisible = true;
        } else {
          this.$message.error('产品不存在!')
        }
      })
    },
    // 产品详情弹窗更新
    productDetailUpdate() {
      this.$refs.productDetail.updateProduct();
    },

    // 成功业务处理后关闭产品详情弹窗
    closeProductDetail() {
      this.$message.success('操作成功!')
      this.initPurchaseList()
      this.productDetailVisible = false;
    },
    handleProductOp(command){
      //库存迁移
      if (command['type'] === 'move') {
        this.moveVisible = true
        this.target_sku = ''
        this.move_from_list = []
        this.move_target_list = []

        this.move_from.id = command['obj'].id
        this.move_from.sku = command['obj'].sku
        this.move_from.p_name = command['obj'].p_name
        this.move_from.image = command['obj'].image
        this.move_from.shop = command['obj'].shop
        if (command['obj'].p_status === 'RECEIVED') {
          this.move_from.qty = command['obj'].rec_qty
        } else {
          this.move_from.qty = command['obj'].pack_qty
        }
        this.move_from_list.push(this.move_from)
      }

      // 数据核查
      if (command['type'] === 'check_product') {
        this.initPacking()
        this.mlProduct.pm_id = command['obj'].id
        this.mlProduct.unit_cost = command['obj'].unit_cost
        this.mlProduct.length = command['obj'].length
        this.mlProduct.width = command['obj'].width
        this.mlProduct.heigth = command['obj'].heigth
        this.mlProduct.weight = command['obj'].weight
        this.mlProduct.is_checked = command['obj'].is_checked
        this.mlProduct.packing_id = command['obj'].packing_id
        this.checkVisible = true;
      }

      // 编辑备注
      if (command['type'] === 'edit_note') {
        this.noteVisible = true;
        this.note_value = command['obj'].note
        this.purchase_id = command['obj'].id
      }

      // 产品删除
      if (command['type'] === 'delete') {
        this.$confirm('是否删除产品?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          //调用删除产品
          this.deleteRequest('api/ml_purchase/' + command['id'] + '/').then(resp => {
            this.initPurchaseList();
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消删除'
            });
          });
        })
      }
    },
    getRowKeys(row){
      return row.id
    },
    // 处理多选
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    // 改变筛选状态
    changeStatus(value){
      this.page = 1;
      this.filter_name = ''
      this.p_status = value
      if (value === 'WAITBUY') this.filter_name = '&buy_qty__gt=0'
      this.$refs.purchaseTable.clearSelection() //清除选中的数据
      this.initPurchaseList()
    },
    //改变筛选动作
    changeFilter(){
      this.page = 1;
      this.initPurchaseList();
    },

    //新增采购
    handleCommand(command) {
      if (command === 'sys') this.pullPurchase()
      if (command === 'manuel') this.addProductVisible = true
    },
    // 重置搜索内容
    clearSearchValue() {
      this.searchValue = '';
      this.initPurchaseList();
    },
    // 搜索
    doSearch() {
      this.page = 1;
      this.$refs.purchaseTable.clearFilter();
      this.initPurchaseList();
    },
    // 分页大小
    sizeChange(size) {
      this.page = 1;
      this.size = size;
      this.initPurchaseList();
    },
    // 页码
    currentChange(page) {
      this.page = page;
      this.initPurchaseList();
    },
    // 添加产品弹窗确认
    confirmAddProduct() {
      this.$refs.addProduct.submitSelectProduct();
    },
    //获取子组件 添加产品的信息
    getAddProducts(data){
      if (data.length > 0) {
        let exist = false
        data.forEach(item=>{
          let existSKU = this.purchaseList.find(i => {
            return i.sku === item.sku;
          })
          if (existSKU) exist = true
        })
        if (!exist) {
          this.postRequest('api/ml_purchase/manuel_create_buy/', data).then(resp => {
            if (resp) {
              this.initPurchaseList();
            }
          })
        } else {
          this.$message.error('有产品已在待采购中！')
        }
      }
      this.addProductVisible = false;
    },
    summitEditNote(){
      this.patchRequest('api/ml_purchase/'+ this.purchase_id +'/', {'note': this.note_value}).then(resp => {
        if (resp) {
          this.noteVisible = false;
          this.initPurchaseList();
          this.note_value = ''
          this.purchase_id = null
        }
      })
    },
    //提交产品质检
    summitQC(){
      this.$confirm('是否已完成质检?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        //调用提交产品质检
        this.op_loading = true
        this.postRequest('api/ml_purchase/product_qc/', this.multipleSelection).then(resp => {
          this.op_loading = false
          this.multipleSelection = []
          this.$refs.purchaseTable.clearSelection() //清除选中的数据
          this.initPurchaseList();
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消质检'
          });
        });
      })
    },
    //提交确认打包
    summitPack(){
      this.$confirm('是否确认打包?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let all_qc = true
        this.multipleSelection.forEach(item=>{
          if (!item.is_qc) all_qc = false
        })
        if (all_qc) {
          //调用提交确认收货
          this.op_loading = true
          this.postRequest('api/ml_purchase/pack_buy/', this.multipleSelection).then(resp => {
            this.op_loading = false
            if(resp.status === 'success') {
              this.multipleSelection = []
              this.$refs.purchaseTable.clearSelection() //清除选中的数据
              this.initPurchaseList();
            }

          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消打包'
            });
          });
        } else {
          this.$message({
            type: 'error',
            message: '打包失败，有未质检产品！'
          });
        }
      })
    },
    //提交确认收货
    summitRec(){
      this.$confirm('是否确认收货?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        //调用提交确认收货
        this.op_loading = true
        this.postRequest('api/ml_purchase/rec_buy/', this.multipleSelection).then(resp => {
          this.op_loading = false
          if(resp.status === 'success') {
            this.multipleSelection = []
            this.$refs.purchaseTable.clearSelection() //清除选中的数据
            this.initPurchaseList();
          }

        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消收货'
          });
        });
      })
    },
    //提交产品数据核查
    summitCheck(){
      this.postRequest('api/ml_purchase/check_product/', this.mlProduct).then(resp => {
        if (resp) {
          this.checkVisible = false
          this.initPurchaseList();
        }
      })
    },
    //提交下单采购
    summitBuy(){
      this.op_loading = true
      this.postRequest('api/ml_purchase/place_buy/', {'products':this.multipleSelection, 'is_change': this.changPrice}).then(resp => {
        this.op_loading = false
        if (resp.status === 'success') {
          this.buyVisible = false
          this.changPrice = false
          this.multipleSelection = []
          this.$refs.purchaseTable.clearSelection() //清除选中的数据
          this.initPurchaseList();
        }
      })
    },
    //自动拉取采购产品
    pullPurchase(){
      this.loading = true
      this.getRequest('/api/ml_purchase/pull_purchase/').then(resp => {
        this.loading = false
        if (resp) {
          this.initPurchaseList();
        }
      })
    },
    inintShops(){
      //获取所有可选店铺
      if(window.sessionStorage.getItem('ml_shops')) {
        this.shops = JSON.parse(window.sessionStorage.getItem('ml_shops'));

      }else{
        let url = 'api/ml_shops/?warehouse_type=FBM&page_size=1000&ordering=create_time'

        this.getRequest(url).then(resp => {
          if (resp.results) {
            this.shops = resp.results;
            window.sessionStorage.setItem('ml_shops', JSON.stringify(this.shops));

          }
        })
      }
      if (this.permission.purchase_allShopCheck) {
        this.shops.unshift({'name': '全部店铺', 'id': '', 'nickname': ''})
      } else {
        this.shop = this.shops[0].name
      }
      this.initPurchaseList()

    },
    // 计算各状态运单数量
    calcPurchases(){
      this.getRequest('/api/ml_purchase/calc_purchase/').then(resp => {
        if (resp) {
          this.wait_buy_num = resp.wait_buy_num
          this.purchased_num = resp.purchased_num
          this.rec_num = resp.rec_num
          this.pack_num = resp.pack_num
        }
      })
    },
    initPacking(){
      //初始化包材
      this.getRequest('api/ml_packing/?page_size=1000').then(resp => {
        if (resp.results) {
          this.packs = resp.results;
        }
      })
    },
    //初始化采购列表
    initPurchaseList() {
      let url = '/api/ml_purchase/?page=' + this.page + '&page_size=' + this.size
      if (this.searchValue) {
        url += '&search=' + this.searchValue;
      }
      url += '&p_status=' + this.p_status

      if (this.shop!=='全部店铺') {
        url += '&shop=' + this.shop;
      }
      if (this.filter_name) {
        url += this.filter_name;
      }
      if (this.platform) {
        url += this.platform;
      }

      if (this.p_status === 'USED') {
        url += '&ordering=-used_time'
      } else {
        url += '&ordering=p_name'
      }

      this.loading = true
      this.getRequest(url).then(resp => {
        this.loading = false
        if (resp.results) {
          this.purchaseList = resp.results;
          this.total = resp.count;
        }
      })

      this.calcPurchases();
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
.jiantou{
  margin-left: 5px;
  margin-right: 5px;
  color: #6e7079;
}
.plan1{
  color: darkorange;
}
.plan2{
  color: red;
  font-weight: bold;
}
.plan3{
  color: darkseagreen;
}
.plan4{
  color: #409EFF;
  margin-left: 10px;
}
.plan5{
  color: teal;
  margin-left: 10px;
}
.packing{
  color: #99a9bf;
}
.item_main{
  margin-left: 20px;
}
.remove{
  color: #cac6c6;
}
</style>