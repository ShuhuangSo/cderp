/*
产品开发app
*/
<template>
  <div class="mainList">
<!--    数据统计-->
    <div style="display: flex;">
      <el-card class="small-card" shadow="never">
        <div style="display: flex;justify-content: space-between">
          <span class="chartTitle">我的待处理</span>
          <span>
            <i class="el-icon-loading" v-if="myDataLoading"></i>
            <el-link type="info"
                     v-if="!myDataLoading"
                     @click.native="getMyData"
                     :underline="false"
                     icon="el-icon-refresh-right"></el-link>
          </span>
        </div>

        <div style="display: flex;justify-content: space-between; padding-top: 5px">
          <div style="width: 290px;text-align:center">
            <div class="title">未上架产品</div>
            <div class="zTitle2">
              <el-link class="zTitle2" @click.native="filterDevProducts(myData.offline_product_ids)">
              <animate-number ref="stockNum" from="0" :to="myData.offline_product_qty" :key="myData.offline_product_qty"
                              duration="500"></animate-number>
              </el-link>
            </div>
          </div>

          <div style="text-align:center; width: 290px">
            <div class="title">未上架账号</div>
            <div class="zTitle2">
              <el-link class="zTitle2" @click.native="filterDevProducts(myData.offline_account_ids)">
              <animate-number ref="stockNum2" from="0" :to="myData.offline_account_qty" :key="myData.offline_account_qty"
                                                  duration="500"></animate-number>
              </el-link>
            </div>
          </div>

          <div style="text-align:center; width: 290px">
            <div class="title">7天未上架产品</div>
            <div class="zTitle2">
              <el-link class="zTitle2" @click.native="filterDevProducts(myData.day7_product_ids)">
              <animate-number ref="stockNum7" from="0" :to="myData.day7_qty" :key="myData.day7_qty"
                                                  duration="500"></animate-number>
              </el-link>
            </div>
          </div>


          <div style="width: 290px;text-align:center"  v-if="myData.price_notify">
            <div class="title">调价确认</div>
            <div>
              <el-link class="zTitle2_red" @click.native="filterDevProducts(myData.price_notify_ids)">
              <animate-number ref="stockNum3" from="0" :to="myData.price_notify" :key="myData.price_notify"
                              duration="500"></animate-number>
              </el-link>
            </div>
          </div>

          <div style="text-align:center; width: 290px" v-if="myData.pause_notify">
            <div class="title">暂停确认</div>
            <div>
              <el-link class="zTitle2_red" @click.native="filterDevProducts(myData.pause_notify_ids)">
              <animate-number ref="stockNum4" from="0" :to="myData.pause_notify" :key="myData.pause_notify"
                                                  duration="500"></animate-number>
              </el-link>
            </div>
          </div>
          <div style="text-align:center; width: 290px" v-if="myData.restore_notify">
            <div class="title">恢复确认</div>
            <div>
              <el-link class="zTitle2_red" @click.native="filterDevProducts(myData.restore_notify_ids)">
              <animate-number ref="stockNum4" from="0" :to="myData.restore_notify" :key="myData.restore_notify"
                                                  duration="500"></animate-number>
              </el-link>
            </div>
          </div>
          <div style="text-align:center; width: 290px" v-if="myData.relist_notify">
            <div class="title">翻新确认</div>
            <div>
              <el-link class="zTitle2_red" @click.native="filterDevProducts(myData.relist_notify_ids)">
              <animate-number ref="stockNum4" from="0" :to="myData.relist_notify" :key="myData.relist_notify"
                                                  duration="500"></animate-number>
              </el-link>
            </div>
          </div>
          <div style="text-align:center; width: 290px" v-if="myData.end_notify">
            <div class="title">下架确认</div>
            <div>
              <el-link class="zTitle2_red" @click.native="filterDevProducts(myData.end_notify_ids)">
              <animate-number ref="stockNum4" from="0" :to="myData.end_notify" :key="myData.end_notify"
                                                  duration="500"></animate-number>
              </el-link>
            </div>
          </div>

        </div>
      </el-card>

      <el-card class="small-card" shadow="never">
        <div style="display: flex;justify-content: space-between">
          <span class="chartTitle">备货情况</span>
          <span>
            <i class="el-icon-loading" v-if="tStockLoading"></i>
            <el-link type="info"
                     v-if="!tStockLoading"
                     @click.native="getBuyData"
                     :underline="false"
                     icon="el-icon-refresh-right"></el-link>
          </span>
        </div>

        <div style="display: flex;justify-content: space-between; padding-top: 5px">
          <div style="width: 290px;text-align:center">
            <div class="title">审批中</div>
            <div class="zTitle2">
              <el-link class="zTitle2" @click.native="filterBuyDevProducts('REQUEST')">
              <animate-number ref="stockNum" from="0" :to="buyData.checking_qty" :key="buyData.checking_qty"
                              duration="500"></animate-number>
              </el-link>
            </div>
          </div>

          <div style="text-align:center; width: 290px">
            <div class="title">待采购</div>
            <div class="zTitle2">
              <el-link class="zTitle2" @click.native="filterBuyDevProducts('APPROVED')">
              <animate-number ref="stockNum2" from="0" :to="buyData.wait_buy_qty" :key="buyData.wait_buy_qty"
                                                  duration="500"></animate-number>
              </el-link>
            </div>
          </div>

          <div style="text-align:center; width: 290px">
            <div class="title">待收货</div>
            <div class="zTitle2">
              <el-link class="zTitle2" @click.native="filterBuyDevProducts('BUYING')">
              <animate-number ref="stockNum7" from="0" :to="buyData.wait_rec_qty" :key="buyData.wait_rec_qty"
                                                  duration="500"></animate-number>
              </el-link>
            </div>
          </div>

          <div style="text-align:center; width: 290px">
            <div class="title">审批不通过</div>
            <div class="zTitle2">
              <el-link class="zTitle2" @click.native="filterBuyDevProducts('REJECTED')">
              <animate-number ref="stockNum8" from="0" :to="buyData.rejected_qty" :key="buyData.rejected_qty"
                                                  duration="500"></animate-number>
              </el-link>
            </div>
          </div>

        </div>
      </el-card>
    </div>
<!--    筛选信息-->
    <div style="display: flex;justify-content: space-between">
      <div>
        <el-radio-group v-model="devStatus" style="margin-right: 20px" size="medium" @change="initDevProducts">
          <el-radio-button label="DRAFT"><i class="el-icon-edit"></i> 草稿箱</el-radio-button>
          <el-radio-button label="ONLINE"><i class="el-icon-tickets"></i> 已发布</el-radio-button>
          <el-radio-button label="OFFLINE"><i class="el-icon-sold-out"></i> 已下线</el-radio-button>
        </el-radio-group>
        <el-button icon="el-icon-user-solid"
                   @click="$router.push({
                            path: '/devListingManage',
                          });"
                   plain size="medium">账号刊登管理</el-button>
      </div>
      <div>
        <el-button type="" icon="el-icon-connection"
                   style="margin-right: 10px"
                   v-if="permission.devproduct_cp"
                   :disabled="!multipleSelection.length"
                   @click="cpProducts">关联
        </el-button>

        <el-button type="success" icon="el-icon-upload"
                   style="margin-right: 10px"
                   v-if="permission.devproduct_import"
                   @click="uploadVisible=true">产品导入
        </el-button>
      </div>
    </div>
    <div class="operate">
      <div>
        <el-input size="small" placeholder="SKU 名称"
                  clearable
                  @clear="clearSearchValue"
                  @keyup.enter.native="doSearch"
                  v-model="searchValue"
                  style="width: 300px; margin-right: 5px">
          <el-button slot="append" icon="el-icon-search" @click="doSearch">搜索</el-button>
        </el-input>

        <el-select v-model="local_category"
                   style="width: 120px;margin-left: 5px"
                   @change="initDevProducts" placeholder="请选择筛选项">
          <el-option
              v-for="item in category_group"
              :key="item.name"
              :label="item.name"
              :value="item.value">
          </el-option>
        </el-select>
        <el-select v-model="is_stock"
                   style="width: 100px;margin-left: 5px"
                   @change="initDevProducts" placeholder="请选择筛选项">
          <el-option
              v-for="item in stock_group"
              :key="item.name"
              :label="item.name"
              :value="item.value">
          </el-option>
        </el-select>

        <el-select v-model="percent"
                   style="width: 120px;margin-left: 5px"
                   @change="initDevProducts" placeholder="请选择筛选项">
          <el-option
              v-for="item in percent_group"
              :key="item.name"
              :label="item.name"
              :value="item.value">
          </el-option>
        </el-select>
        <el-select v-model="rate"
                   style="width: 120px;margin-left: 5px"
                   @change="initDevProducts" placeholder="请选择筛选项">
          <el-option
              v-for="item in rate_group"
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
            style="width: 250px;margin-left: 5px"
            @change="changeFilter"
            :picker-options="pickerOptions">
        </el-date-picker>

        <el-link @click.native="clearFilter"
                 style="margin-left: 10px;"
                 :underline="false"><i class="el-icon-delete"></i></el-link>

        <el-link type="info"
                 style="margin-left: 10px"
                 v-if="permission.devproduct_check_statistic"
                 @click.native="statisticVisible=true"
                 :underline="false"
                 icon="el-icon-s-data"></el-link>

      </div>


    </div>
<!--数据表格-->
    <div style="margin-top: 5px">
      <el-table
          ref="productTable"
          :data="devProducts"
          :header-cell-style="{background:'#fafafa'}"
          v-loading="loading"

          @selection-change="handleSelectionChange"
          style="width: 100%">

        <el-table-column
            type="selection"
            width="42">
        </el-table-column>

        <el-table-column
            label="图片"
            align="center"
            header-align="center"
            width="120">
          <template slot-scope="scope">
            <el-image
                style="width: 100px; height: 100px"
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
                  @click.native="productDetail(scope.row.id, 'first')"
                  :underline="false">
                {{ scope.row.sku }}
              </el-link>
              <el-link @click.native="copyText(scope.row.sku)"
                       style="margin-left: 5px"
                       :underline="false"><i class="el-icon-copy-document"></i></el-link>

            </div>
            <div>{{ scope.row.cn_name }}</div>
            <div>{{ scope.row.en_name }}</div>
            <div><el-rate v-if="scope.row.rate" disabled v-model="scope.row.rate"></el-rate></div>
            <div class="gray_zi">{{ scope.row.local_category | c_name }}</div>
            <div>
              <el-tag v-if="scope.row.is_stock" size="mini" type="success">有库存</el-tag>
              <el-tag v-if="!scope.row.is_stock && scope.row.buy_status"
                      @click="openBuyStockWindow(scope.row)"
                      :type="scope.row.buy_status==='REJECTED'?'danger':''"
                      size="mini">{{scope.row.buy_status | buyStatus}}</el-tag>
              <el-tag size="mini"
                      style="margin-left: 5px;"
                      :type="tag_type(scope.row.cp_id)"
                      @click="selectGroup(scope.row.cp_id)"
                      v-if="scope.row.cp_count"><i class="el-icon-connection"></i>关联({{scope.row.cp_count}})</el-tag>
              <el-tag
                  style="margin-left: 5px"
                  v-if="scope.row.notify"
                  @click="productDetail(scope.row.id,'forth')"
                  type="danger">
                <i class="el-icon-warning"></i> 信息需确认
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column
            label="定价"
            align="left"
            header-align="left">
          <template slot-scope="scope">
            <div v-for="i in scope.row.dev_price">
              {{i.site}}<el-divider direction="vertical"></el-divider>{{i.currency}} {{i.price}}
            </div>
          </template>
        </el-table-column>

        <el-table-column
            label="成本价"
            align="center"
            header-align="center">
          <template slot-scope="scope">
            <div>{{ scope.row.unit_cost | rmb_currency }}</div>
          </template>
        </el-table-column>
<!--        <el-table-column-->
<!--            label="评分"-->
<!--            align="center"-->
<!--            header-align="center">-->
<!--          <template slot-scope="scope">-->
<!--            <el-rate v-if="scope.row.rate" disabled v-model="scope.row.rate"></el-rate>-->
<!--          </template>-->
<!--        </el-table-column>-->
        <el-table-column
            v-if="devStatus==='ONLINE'"
            label="上架率"
            width="110"
            align="center"
            header-align="center">
          <template slot-scope="scope">
            <el-link class="zTitle2" :underline="false" @click.native="productDetail(scope.row.id,'forth')">
            <el-progress type="circle" :width="100"
                         :color="scope.row.percent===100?'#13ce66':''"
                         :percentage="scope.row.percent"></el-progress>
            </el-link>
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
            v-if="devStatus==='DRAFT'"
            label="创建日期"
            align="center"
            header-align="center"
            width="100">
          <template slot-scope="scope">
            <span>{{ scope.row.create_time | date }}</span>
          </template>
        </el-table-column>
        <el-table-column
            v-if="devStatus==='ONLINE'"
            label="发布日期"
            align="center"
            header-align="center"
            width="100">
          <template slot-scope="scope">
            <span>{{ scope.row.online_time | date }}</span>
          </template>
        </el-table-column>
        <el-table-column
            v-if="devStatus==='OFFLINE'"
            label="下架日期"
            align="center"
            header-align="center"
            width="100">
          <template slot-scope="scope">
            <span>{{ scope.row.offline_time | date }}</span>
          </template>
        </el-table-column>

        <el-table-column
            label="操作"
            align="center"
            header-align="center"
            width="130"
        >
          <template slot-scope="scope">
            <div v-if="devStatus==='DRAFT' && permission.devproduct_online_list">
              <el-button
                  @click="listProductWindow(scope.row.id)"
                  size="mini" type="primary" plain round><i class="el-icon-sell"></i> 发布</el-button>
            </div>
            <div v-if="devStatus==='ONLINE'">
              <el-button
                  @click="productDetail(scope.row.id,'forth')"
                  size="mini" type="primary" plain round><i class="el-icon-user"></i> 账号</el-button>
            </div>
            <div v-if="devStatus==='OFFLINE' && permission.devproduct_relist">
              <el-button
                  @click="relistProduct(scope.row.id)"
                  size="mini" type="primary" plain round><i class="el-icon-sell"></i> 恢复</el-button>
            </div>
            <div style="margin-top: 5px">
              <el-button
                  @click="openBuyStockWindow(scope.row)"
                  size="mini" type="info" plain round><i class="el-icon-shopping-cart-full"></i> 备货</el-button>
            </div>
            <div style="margin-top: 5px">
              <el-button
                  @click="productDetail(scope.row.id,'second')"
                  size="mini" type="success" plain round><i class="el-icon-money"></i> 定价</el-button>
            </div>
            <div style="margin-top: 5px" v-if="permission.devproduct_edit">
              <el-dropdown @command="handleProductOp">
                <el-button size="mini" type="warning" plain round>
                  <i class="el-icon-arrow-down"></i> 编辑
                </el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item :command="{type:'editImage', obj:scope.row}">更换图片</el-dropdown-item>
                  <el-dropdown-item :command="{type:'edit', id:scope.row.id}">编辑产品</el-dropdown-item>
                  <el-dropdown-item v-if="permission.devproduct_cp" :command="{type:'ucp', id:scope.row.id}">解除关联</el-dropdown-item>
                  <el-dropdown-item v-if="devStatus==='DRAFT' && permission.devproduct_delete" :command="{type:'delete', id:scope.row.id}">删除产品</el-dropdown-item>
                  <el-dropdown-item v-if="devStatus==='ONLINE' && permission.devproduct_offline" :command="{type:'end', id:scope.row.id}">下架产品</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
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
            :current-page="page"
            :total="total">
        </el-pagination>
      </div>

    </div>

    <!--    数据统计弹窗-->
    <el-dialog
        title="数据统计"
        :visible.sync="statisticVisible"
        :destroy-on-close="true"
        :close-on-click-modal="false"
        width="800px"
    >
      <DevStatistic></DevStatistic>
      <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="statisticVisible = false">关 闭</el-button>
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
                @click="set_tag('高利润', '#ff8c00')"
                size="medium" effect="dark" style="border: none">高利润</el-tag>
        <el-tag color="#00ced1"
                @click="set_tag('竞争小', '#00ced1')"
                size="medium" effect="dark" style="border: none; margin-left: 5px">竞争小</el-tag>
        <el-tag color="#90ee90"
                @click="set_tag('大件货', '#90ee90')"
                size="medium" effect="dark" style="border: none; margin-left: 5px">大件货</el-tag>
        <el-tag color="#c71585"
                @click="set_tag('可发信封', '#c71585')"
                size="medium" effect="dark" style="border: none; margin-left: 5px">可发信封</el-tag>
      </div>
      <span slot="footer" class="dialog-footer">
    <el-button @click="tagVisible = false">取 消</el-button>
    <el-button :disabled="tag.tag_name===''" type="primary" @click="saveTag">确 定</el-button>
  </span>
    </el-dialog>

    <!--    产品备货弹窗-->
    <el-dialog
        title="产品备货"
        :visible.sync="buyStockVisible"
        :destroy-on-close="true"
        :close-on-click-modal="false"
        width="600px"
    >
      <div class="step">
        <el-steps :space="200" :active="buyStock.step" finish-status="success">
          <el-step title="申请备货"></el-step>
          <el-step title="等待审核"></el-step>
          <el-step title="待采购"></el-step>
          <el-step title="待收货"></el-step>
          <el-step title="收货完成"></el-step>
        </el-steps>
      </div>
      <div style="display: flex; justify-content: center">
        <div style="width: 50%">
          <el-button type="success"
                     v-if="buyStock.step===0 && permission.devproduct_buy_req"
                     @click="doBuyStock('REQUEST')"
                     style="width: 100%; margin-bottom: 10px">申请</el-button>
          <el-button type="success"
                     v-if="buyStock.step===2 && permission.devproduct_buy_make"
                     @click="doBuyStock('BUYING')"
                     style="width: 100%; margin-bottom: 10px">已采购</el-button>
          <el-button type="success"
                     v-if="buyStock.step===3 && permission.devproduct_buy_make"
                     @click="doBuyStock('ARRIVED')"
                     style="width: 100%; margin-bottom: 10px">确认收货</el-button>
          <div v-if="buyStock.step===1 && permission.devproduct_buy_check" style="display: flex;justify-content: center">
            <el-button type="success"
                       @click="doBuyStock('APPROVED')"
                       style="width: 50%; margin-bottom: 10px">批准</el-button>
            <el-button type="danger"
                       @click="doBuyStock('REJECTED')"
                       style="width: 50%; margin-bottom: 10px">拒绝</el-button>
          </div>
          <el-input type="textarea"
                    v-if="buyStock.step!==5"
                    v-model="buyStock.note" placeholder="简要备注"></el-input>
        </div>

      </div>
      <div>
        <el-table
            :header-cell-style="{background:'#eef1f6'}"
            :data="buyStockLogList"
            border
            size="mini"
            style="width: 98%; margin: 10px">
          <el-table-column
              prop="user_name"
              label="经手人"
              align="center"
              header-align="center"
              width="100">
          </el-table-column>
          <el-table-column
              prop="desc"
              label="说明">
          </el-table-column>
          <el-table-column
              label="时间"
              align="center"
              header-align="center"
              width="150">
            <template slot-scope="scope">
              {{scope.row.create_time | dateT}}
            </template>
          </el-table-column>

        </el-table>
      </div>
      <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="buyStockVisible = false">关 闭</el-button>
        </span>
    </el-dialog>

    <!--    产品发布弹窗-->
    <el-dialog
        title="发布渠道"
        :visible.sync="listingChannelVisible"
        :destroy-on-close="true"
        :close-on-click-modal="false"
        width="500px"
    >
      <div>
        <el-table
            :data="ListingChannel"
            size="mini"
            style="width: 98%; margin: 10px">
          <el-table-column
              prop="platform"
              label="平台"
              align="center"
              header-align="center"
              width="100">
          </el-table-column>
          <el-table-column
              prop="site"
              label="站点"
              align="center"
              header-align="center"
              width="100">
          </el-table-column>
          <el-table-column
              align="center"
              header-align="center"
              label="选择">
            <template slot-scope="scope">
              <el-checkbox v-model="scope.row.default_active"></el-checkbox>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="listingChannelVisible = false">取 消</el-button>
          <el-button size="small" type="primary"
                     :disabled="!is_can_list"
                     @click="listProduct">发 布</el-button>
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
      <DevProductDetail ref="productDetail"
                        :key="timer"
                        :productID="productID"
                        :tab="tab"
                        @closeProductDetail="closeProductDetail"></DevProductDetail>
      <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="closeProductDetailWindow">关 闭</el-button>
          <el-button size="small" type="primary"
                     v-if="permission.devproduct_edit"
                     @click="productDetailUpdate">确 定</el-button>
        </span>
    </el-dialog>

    <!--    更换图片弹窗-->
    <el-dialog
        title="产品图片"
        :visible.sync="imageVisible"
        :destroy-on-close="true"
        :close-on-click-modal="false"
        width="500px"
    >
      <div style="text-align: center">
        <el-upload
            class="avatar-uploader"
            action="api/dev_products/image_upload/"
            :show-file-list="false"
            name="pic"
            :data="{'id': this.imageID}"
            :headers="headers"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload">
          <img v-if="imageUrl" :src="imageUrl" class="avatar">
          <i v-else class="el-icon-plus avatar-uploader-icon"></i>
        </el-upload>
      </div>
      <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="imageVisible = false">取 消</el-button>
        </span>
    </el-dialog>

    <!--    产品批量上传弹窗-->
    <el-dialog
        title="产品上传"
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
            :limit="1"
            drag
            action="api/dev_products/bulk_upload/">
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div class="el-upload__tip" slot="tip">只能上传excel文件,
            <el-link href="/media/template/dev_products_upload_ template.xlsx" target="_blank">模板下载</el-link>
          </div>
        </el-upload>

      </div>
      <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="uploadVisible = false">取 消</el-button>
          <el-button size="small" type="primary" @click="submitUpload">开始导入</el-button>
        </span>
    </el-dialog>

  </div>
</template>

<script>
import DevProductDetail from "@/views/app/devproduct/DevProductDetail";
import DevStatistic from "@/views/app/devproduct/DevStatistic";
import moment from "moment/moment";
export default {
  name: "DevProduct",
  components: {
    DevProductDetail, DevStatistic
  },
  data(){
    return{
      permission: JSON.parse(window.sessionStorage.getItem('ml_permission')),
      loading: false,
      total: 0, // 总条数
      page: 1,  // 当前页
      size: 20,  // 页大小
      searchValue: '',
      devStatus: 'ONLINE', //产品状态
      devProducts: [], //开发产品列表
      ListingChannel: [], //产品发布渠道
      uploadVisible: false, //上传窗口显示状态
      // 批量上传认证
      headers: {
        Authorization: window.localStorage.getItem('tokenStr'),
      },
      imageVisible: false, // 图片修改弹窗
      imageUrl: null,
      imageID: null,
      productDetailVisible: false, //产品详情弹窗
      listingChannelVisible: false, //产品发布弹窗
      productID: 0, // 产品id
      timer: null,
      multipleSelection: [], // 选中行
      tab: 'first', //弹窗定位tab
      is_stock: 'ALL', //库存状态
      buyStockVisible: false, //备货弹窗
      buyStockLogList: [], //备货日志记录
      buyStock: {
        id: null,
        note: '',
        action: '',
        step: 0
      }, //采购备注
      stock_group: [
        {
          name: '全部库存',
          value: 'ALL'
        },
        {
          name: '有库存',
          value: true
        },
        {
          name: '无库存',
          value: false
        }
      ],
      percent: '', //上架率
      percent_group: [
        {
          name: '全部上架率',
          value: ''
        },
        {
          name: '已完成',
          value: '&percent=100'
        },
        {
          name: '未完成',
          value: '&percent__lt=100'
        }
      ],
      rate: '', //打分
      rate_group: [
        {
          name: '全部评分',
          value: ''
        },
        {
          name: '1星',
          value: 1
        },
        {
          name: '2星',
          value: 2
        },
        {
          name: '3星',
          value: 3
        },
        {
          name: '4星',
          value: 4
        },
        {
          name: '5星',
          value: 5
        },
      ],
      local_category: '',
      category_group: [
        {
          name: '全部目录',
          value: ''
        },
        {
          name: '3C电子与配件',
          value: 1
        },
        {
          name: '汽配摩配',
          value: 2
        },
        {
          name: '家居、建材',
          value: 3
        },
        {
          name: '时尚、服饰、箱包',
          value: 4
        },
        {
          name: '运动',
          value: 5
        },
        {
          name: '健康美容',
          value: 6
        },
        {
          name: '儿童玩具',
          value: 7
        },
        {
          name: '工业专业产品',
          value: 8
        },
        {
          name: '其它',
          value: 0
        }
      ],
      tStockLoading: false,
      myDataLoading: false,
      filterIds: '', //筛选的产品id
      myData:{
        offline_product_qty: null, // 未上架产品
        offline_product_ids: '', // 未上架产品 过滤id
        offline_account_qty: null, // 未上架账号
        offline_account_ids: '', // 未上架账号 过滤id
        day7_qty: null, // 未上架账号
        day7_product_ids: '', // 未上架账号 过滤id
        price_notify: null, // 调价确认
        price_notify_ids: '', // 调价确认 过滤id
        pause_notify: null, // 暂停确认
        pause_notify_ids: '', // 暂停确认 过滤id
      }, //我的数据
      filterBuyStatus: '', //备货状态
      buyData:{
        checking_qty: null, // 审批中产品
        wait_buy_qty: null, // 待采购产品
        wait_rec_qty: null, // 待收货产品
        rejected_qty: null, // 审批不通过产品
      }, //备货数据
      statisticVisible: false, //数据统计弹窗
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
      cus_date: '', // 日期筛选
      start_date: '', // 日期筛选
      end_date: '', // 日期筛选
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
  computed: {
    //检查是否有勾选发布站点
    is_can_list(){
      let status = false
      this.ListingChannel.forEach(item=>{
        if (item.default_active) status = true
      })
      return status
    }
  },
  filters:{
    //格式化目录名称
    c_name: function (value) {
      let name = ''
      switch (value){
        case 1:
          name = '3C电子与配件'
          break
        case 2:
          name = '汽配摩配'
          break
        case 3:
          name = '家居、建材'
          break
        case 4:
          name = '时尚、服饰、箱包'
          break
        case 5:
          name = '运动'
          break
        case 6:
          name = '健康美容'
          break
        case 7:
          name = '儿童玩具'
          break
        case 8:
          name = '工业专业产品'
          break
        default:
          name = '其它'
          break
      }
      return name
    },
    //格式化采购装提
    buyStatus: function (value) {
      let name = ''
      switch (value){
        case 'REQUEST':
          name = '备货审批中'
          break
        case 'APPROVED':
          name = '待采购'
          break
        case 'BUYING':
          name = '待收货'
          break
        case 'REJECTED':
          name = '备货不通过'
          break
        default:
          break
      }
      return name
    },
    //时间日期格式化
    dateT: function (value) {
      return moment(value).format("YYYY-MM-DD HH:mm");
    },
    //时间日期格式化
    date: function (value) {
      if (value) return moment(value).format("YYYY-MM-DD");
      return ''
    },
    //人民币金额格式化
    rmb_currency: function (value) {
      if (!value) return 0.00;
      if (value > 0) {
        return `¥${value.toFixed(2)}`;
      } else {
        return `-¥${Math.abs(value).toFixed(2)}`;
      }
    },
    //图片地址格式化
    smpic: function (value) {
      if (!value) return '';
      let url = value.slice(0, value.length-4)
      return url + '_100x100.jpg/?' + Math.random()
    },
  },
  mounted() {
    this.initDevProducts()
    this.getMyData()
    this.getBuyData()
  },
  methods:{
    //关联tag颜色
    tag_type(num){
      let typeGroup = ['', 'success', 'info', 'warning', 'warning']
      let type = ''
      type = typeGroup[num % 5]
      return type
    },
    //筛选关联产品
    selectGroup(num){
      this.searchValue = num
      this.initDevProducts();
    },
    //关联产品
    cpProducts(){
      let ids = []
      this.multipleSelection.forEach(item=>{
        ids.push(item.id)
      })
      this.loading = true
      let url = 'api/dev_products/cp_products/'
      this.postRequest(url, {'ids': ids}).then(resp => {
        this.loading = false
        if (resp.status === 'success') {
          this.initDevProducts();
        }
      })
      this.multipleSelection = []
    },

    // 处理多选
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    //保存标签
    saveTag(){
      this.patchRequest('api/dev_products/'+ this.productID +'/', this.tag).then(resp => {
        if (resp) {
          this.tagVisible = false;
          this.initDevProducts()
          this.productID = null
        }
      })
    },
    //设置标签
    set_tag(name, color){
      this.tag.tag_name = name
      this.tag.tag_color = color
    },
    //编辑标签弹窗
    editTagWindow(obj){
      this.tagVisible = true
      this.productID = obj.id
      this.tag.tag_color = obj.tag_color?obj.tag_color:'#409EFF'
      this.tag.tag_name = obj.tag_name
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
    // 重置搜索内容
    clearSearchValue() {
      this.searchValue = '';
      this.initDevProducts();
    },
    // 搜索
    doSearch() {
      this.page = 1;
      this.$refs.productTable.clearFilter();
      this.initDevProducts();
    },
    // 分页大小
    sizeChange(size) {
      this.page = 1;
      this.size = size;
      this.initDevProducts();
    },
    // 页码
    currentChange(page) {
      this.page = page;
      this.initDevProducts();
    },
    //改变筛选动作
    changeFilter(){
      this.page = 1;
      this.initDevProducts();
    },
    clearFilter(){
      this.page = 1;
      this.cus_date = ''
      this.percent = ''
      this.searchValue = ''
      this.is_stock = 'ALL'
      this.initDevProducts();
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

      this.initDevProducts();
      this.uploadVisible = false;
    },
    // 上传
    submitUpload() {
      this.$refs.upload.submit();
    },
    // 图片上传前
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg';
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error('上传图片只能是 JPG 格式!');
      }
      if (!isLt2M) {
        this.$message.error('上传图片大小不能超过 2MB!');
      }
      return isJPG && isLt2M;
    },
    handleAvatarSuccess(res, file) {
      this.initDevProducts();
      this.imageVisible = false;
    },
    // 打开产品详情弹窗
    productDetail(id, tab) {
      this.timer = new Date().getTime();
      this.productID = id;
      this.tab = tab;
      this.productDetailVisible = true;
    },
    // 产品详情弹窗更新
    productDetailUpdate() {
      this.$refs.productDetail.updateProduct();
    },
    //只关闭窗口
    closeProductDetailWindow(){
      this.initDevProducts();
      this.productDetailVisible = false;
    },
    // 成功业务处理后关闭产品详情弹窗
    closeProductDetail() {
      this.$message.success('操作成功')
      this.initDevProducts();
      this.productDetailVisible = false;
    },
    //打开发布窗口
    listProductWindow(id){
      this.productID = id
      this.loading = true
      this.getRequest('/api/dev_channel_data/').then(resp => {
        this.loading = false
        if (resp) {
          this.ListingChannel = resp;
        }
      })
      this.listingChannelVisible = true
    },
    // 打开备货弹窗
    openBuyStockWindow(row){
      this.buyStock.id = row.id
      this.buyStock.note = ''
      this.buyStock.step = 0
      this.initBuyStockLogList(row.id)
      switch (row.buy_status){
        case 'REQUEST':
          this.buyStock.step = 1
          break
        case 'APPROVED':
          this.buyStock.step = 2
          break
        case 'BUYING':
          this.buyStock.step = 3
          break
        case 'ARRIVED':
          this.buyStock.step = 5
          break
        default:
          break
      }
      this.buyStockVisible = true
    },
    //申请备货
    doBuyStock(action){
      this.$confirm('是否确定操作?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.buyStock.action = action
        this.loading = true
        let url = 'api/dev_products/buy_stock/'
        this.postRequest(url, this.buyStock).then(resp => {
          this.loading = false
          if (resp.status === 'success') {
            this.buyStock.note = ''
            this.initDevProducts();
            this.buyStockVisible = false
          }
        })
      })

    },
    //初始化备货操作记录
    initBuyStockLogList(id){
      this.loading = true
      let url = 'api/ml_operate_log/?op_module=DEVP&target_type=DEVP_BUY&target_id=' + id
      this.getRequest(url).then(resp => {
        this.loading = false
        if (resp.results) {
          this.buyStockLogList = resp.results;
        }
      })
    },
    // 产品更多操作
    handleProductOp(command) {
      // 编辑图片
      if (command['type'] === 'editImage') {
        this.imageUrl = command['obj'].image,
            this.imageID = command['obj'].id,
            this.imageVisible = true
      }

      // 编辑产品
      if (command['type'] === 'edit') {
        this.productDetail(command['id'], 'first')
      }

      // 产品解除关联
      if (command['type'] === 'ucp') {
        this.$confirm('是否确认解除关联?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.loading = true
          this.postRequest('api/dev_products/ucp_products/', {'id': command['id']}).then(resp => {
            this.loading = false
            if (resp.status === 'success') {
              this.initDevProducts();
            }
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消'
            });
          });
        })
      }
      // 产品删除
      if (command['type'] === 'delete') {
        this.$confirm('删除的产品无法恢复, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          //调用删除产品
          this.deleteRequest('api/dev_products/' + command['id'] + '/').then(resp => {
            this.initDevProducts();
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消删除'
            });
          });
        })
      }
      // 产品下架
      if (command['type'] === 'end') {
        this.$confirm('是否确定下架?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.loading = true
          let url = 'api/dev_products/end_product/'
          this.postRequest(url, {'id': command['id']}).then(resp => {
            this.loading = false
            if (resp.status === 'success') {
              this.initDevProducts();
            }
          })
        })
      }

    },
    //重新上架产品
    relistProduct(id){
      this.$confirm('是否重新上架产品?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        let url = 'api/dev_products/relist_product/'
        this.postRequest(url, {'id': id}).then(resp => {
          this.loading = false
          if (resp.status === 'success') {
            this.initDevProducts();
          }
        })
      })
    },
    //发布产品
    listProduct(){
      this.loading = true
      let url = 'api/dev_products/list_product/'
      this.postRequest(url, {'listingChannel': this.ListingChannel, 'id': this.productID}).then(resp => {
        this.loading = false
        if (resp.status === 'success') {
          this.initDevProducts();
          this.listingChannelVisible = false;
        }
      })
    },
    //获取我的数据
    getMyData(){
      let url = '/api/dev_products/get_my_data/'
      this.myDataLoading = true
      this.getRequest(url).then(resp => {
        this.myDataLoading = false
        if (resp) {
          this.myData.offline_product_qty = resp.offline_product_qty;
          this.myData.offline_product_ids = resp.offline_product_ids;
          this.myData.offline_account_qty = resp.offline_account_qty;
          this.myData.offline_account_ids = resp.offline_account_ids;
          this.myData.day7_qty = resp.day7_qty;
          this.myData.day7_product_ids = resp.day7_product_ids;
          this.myData.price_notify = resp.price_notify;
          this.myData.price_notify_ids = resp.price_notify_ids;
          this.myData.pause_notify = resp.pause_notify;
          this.myData.pause_notify_ids = resp.pause_notify_ids;
          this.myData.restore_notify = resp.restore_notify;
          this.myData.restore_notify_ids = resp.restore_notify_ids;
          this.myData.relist_notify = resp.relist_notify;
          this.myData.relist_notify_ids = resp.relist_notify_ids;
          this.myData.end_notify = resp.end_notify;
          this.myData.end_notify_ids = resp.end_notify_ids;
        }
      })
    },
    //获取我的备货情况
    getBuyData(){
      let url = '/api/dev_products/get_purchase/'
      this.tStockLoading = true
      this.getRequest(url).then(resp => {
        this.tStockLoading = false
        if (resp) {
          this.buyData.checking_qty = resp.checking_qty;
          this.buyData.wait_buy_qty = resp.wait_buy_qty;
          this.buyData.wait_rec_qty = resp.wait_rec_qty;
          this.buyData.rejected_qty = resp.rejected_qty;

        }
      })
    },
    //过滤采购状态
    filterBuyDevProducts(status){
      this.filterBuyStatus = status
      this.initDevProducts()
    },
    //根据条件过滤开发产品
    filterDevProducts(ids){
      this.filterIds = ids
      this.initDevProducts()
    },
    initDevProducts() {
      let url = '/api/dev_products/?page=' + this.page + '&page_size=' + this.size
      if (this.searchValue) {
        url += '&search=' + this.searchValue;
      }
      //筛选
      url += '&p_status=' + this.devStatus
      if(this.is_stock !== 'ALL') {
        url += '&is_stock=' + this.is_stock
      }
      if(this.percent) {
        url += this.percent
      }
      if(this.rate) {
        url += '&rate=' + this.rate
      }
      if(this.local_category) {
        url += '&local_category=' + this.local_category
      }

      if (this.cus_date){
        this.start_date =String(moment(this.cus_date[0]).format("YYYY-MM-DD"))+' 00:00:00'
        this.end_date = String(moment(this.cus_date[1]).format("YYYY-MM-DD"))+' 23:59:59'
        if (this.devStatus === 'ONLINE'){
          url += '&online_time__gte='+ this.start_date + '&online_time__lte=' + this.end_date
        } else if (this.devStatus === 'DRAFT') {
          url += '&create_time__gte='+ this.start_date + '&create_time__lte=' + this.end_date
        } else {
          url += '&offline_time__gte='+ this.start_date + '&offline_time__lte=' + this.end_date
        }
      }
      if (this.filterIds) url += '&id__in=' + this.filterIds //筛选id产品
      if (this.filterBuyStatus) url += '&buy_status=' + this.filterBuyStatus //筛选备货状态

      //排序
      if (this.devStatus === 'ONLINE'){
        url += '&ordering=-online_time'
      } else if (this.devStatus === 'DRAFT') {
        url += '&ordering=-create_time'
      } else {
        url += '&ordering=-offline_time'
      }


      this.loading = true
      this.getRequest(url).then(resp => {
        this.loading = false
        if (resp.results) {
          this.devProducts = resp.results;
          this.total = resp.count;
          this.filterIds = ''
          this.filterBuyStatus = ''
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
.operate {
  margin-top: 10px;
  /*display: flex;*/
  /*justify-content: space-between;*/
}
.step{
  /*display: flex;*/
  /*justify-content: center;*/
  padding-left: 50px;
  margin-bottom: 50px;
  /*margin-top: 50px;*/
}
.small-card {
  width: 99%;
  height: 130px;
  margin-left: 5px;
  margin-right: 5px;
  margin-bottom: 10px;
  border-radius: 15px;
}
.zTitle2 {
  font-weight: bold;
  font-size: 25px;
  color: #4f6782;
}
.zTitle2_red {
  font-weight: bold;
  font-size: 25px;
  color: red;
}
.title{
  color: #6e7079;
  font-size: 14px;
}
.chartTitle {
  font-weight: bold;
  margin-right: 20px
}
.gray_zi{
  color: #99a9bf;
}
</style>