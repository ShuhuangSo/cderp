<template>
  <div class="productList">

    <div class="operate">
      <div>
        <el-input size="small" placeholder="请输入SKU / 产品名称搜索"
                  clearable
                  @clear="clearSearchValue"
                  @keyup.enter.native="doSearch"
                  v-model="searchValue"
                  style="width: 350px; margin-right: 5px">
          <el-button slot="append" icon="el-icon-search" @click="doSearch">搜索</el-button>
        </el-input>

        <el-dropdown type="primary" style="margin-right: 5px" @command="handleBulkEdit">
          <el-button size="small" type="primary" :disabled="multipleSelection.length==0">
            批量操作<i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="all">修改产品详情</el-dropdown-item>
            <el-dropdown-item command="image">修改默认图片</el-dropdown-item>
            <el-dropdown-item command="status">修改状态</el-dropdown-item>
            <el-dropdown-item command="tag">添加标签</el-dropdown-item>
            <el-dropdown-item command="note">添加备注</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>

        <el-button size="small" type="info" plain icon="el-icon-circle-plus"
                   @click="expendChange"
                   v-if="expandStatus">全部展开
        </el-button>
        <el-button size="small" type="info" plain icon="el-icon-remove"
                   @click="expendChange"
                   v-if="!expandStatus">全部收起
        </el-button>

      </div>

      <div>
        <el-button style="margin-right: 5px" size="small" @click="createProduct">创建产品</el-button>
        <el-dropdown @command="productUploadVisible = true">
          <el-button size="small" type="success">
            导入/导出<i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>批量导入</el-dropdown-item>
            <el-dropdown-item disabled>批量导出</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>

    <!--    筛选条件显示-->
    <div class="filterShow" v-if="pStatus || pTag || pSeries || ordering">
      <span>已选择筛选：</span>
      <el-tag size="small" closable effect="dark" v-if="pStatus=='UN_LISTED'" @close="colseFilter('status')">状态: 未上市
      </el-tag>
      <el-tag size="small" closable effect="dark" v-if="pStatus=='ON_SALE'" @close="colseFilter('status')">状态: 在售
      </el-tag>
      <el-tag size="small" closable effect="dark" v-if="pStatus=='OFFLINE'" @close="colseFilter('status')">状态: 停售
      </el-tag>
      <el-tag size="small" closable effect="dark" v-if="pStatus=='PRIVATE'" @close="colseFilter('status')">状态: 私模
      </el-tag>
      <el-tag size="small" closable effect="dark" v-if="pStatus=='CLEAN'" @close="colseFilter('status')">状态: 清仓</el-tag>

      <el-tag size="small" closable effect="dark" v-if="pTag" @close="colseFilter('tag')">标签: {{ this.pTag }}</el-tag>

      <el-tag size="small" closable effect="dark" v-if="pSeries" @close="colseFilter('series')">系列: {{
          this.pSeries
        }}
      </el-tag>

      <el-tag size="small" closable type="success" effect="dark" v-if="ordering=='-sku'"
              @close="colseFilter('ordering')">
        排序: SKU <i class="el-icon-bottom"></i>
      </el-tag>
      <el-tag size="small" closable type="success" effect="dark" v-if="ordering=='sku'"
              @close="colseFilter('ordering')">
        排序: SKU <i class="el-icon-top"></i>
      </el-tag>
      <el-tag size="small" closable type="success" effect="dark" v-if="ordering=='-p_name'"
              @close="colseFilter('ordering')">
        排序: 名称 <i class="el-icon-bottom"></i>
      </el-tag>
      <el-tag size="small" closable type="success" effect="dark" v-if="ordering=='p_name'"
              @close="colseFilter('ordering')">
        排序: 名称 <i class="el-icon-top"></i>
      </el-tag>

      <el-button type="text" size="small" @click="colseFilter()">全部清除</el-button>
    </div>

    <div style="margin-top: 5px;">
      <el-table
          :header-cell-style="{background:'#fafafa'}"
          v-loading="loading"
          size="small"
          ref="multipleTable"
          :data="products"
          tooltip-effect="dark"
          style="width: 100%"
          @filter-change="filterChange"
          @sort-change="handleSort"
          @selection-change="handleSelectionChange">
        <el-table-column
            type="selection"
            width="42">
        </el-table-column>


        <!--        产品各仓库库存-->
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
                :data="props.row.product_stock"
                border
                size="mini"
                style="width: 98%; margin: 10px">
              <el-table-column
                  prop="store_name"
                  label="仓库/店铺"
                  width="180">
              </el-table-column>
              <el-table-column
                  prop="qty"
                  label="库存"
                  width="180">
              </el-table-column>
              <el-table-column
                  prop="lock_qty"
                  label="锁仓">
              </el-table-column>
              <el-table-column
                  prop="recent_7d_sales"
                  label="7天销量">
              </el-table-column>
              <el-table-column
                  prop="recent_30d_sales"
                  label="30天销量">
              </el-table-column>
              <el-table-column
                  prop="last_sale_time"
                  :formatter="datetimeFormat"
                  label="最后销售时间">
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>

        <el-table-column
            label="图片"
            align="center"
            header-align="center"
            width="60">
          <template slot-scope="scope">
            <el-image
                style="width: 40px; height: 40px"
                :src="scope.row.image"
                :preview-src-list="[scope.row.image]"
                fit="fill">
            </el-image>
          </template>
        </el-table-column>
        <el-table-column
            label="SKU"
            show-overflow-tooltip
            min-width="250">
          <template slot-scope="scope">
            <el-button
                type="text"
                @click="productDetail(scope.row.id)"
                size="small">
              {{scope.row.sku}}
            </el-button>

            <div>{{scope.row.p_name}}</div>
          </template>
        </el-table-column>

        <el-table-column
            label="状态"
            align="center"
            header-align="center"
            :filter-multiple="false"
            :filters="statusFilters"
            column-key="filterStatus"
            width="100">
          <template slot-scope="scope">
            <el-tag type="info" size="small" effect="plain" v-if="scope.row.status=='UN_LISTED'">未上市</el-tag>
            <el-tag type="success" size="small" effect="plain" v-if="scope.row.status=='ON_SALE'">在售</el-tag>
            <el-tag type="danger" size="small" effect="plain" v-if="scope.row.status=='OFFLINE'">停售</el-tag>
            <el-tag type="" size="small" effect="plain" v-if="scope.row.status=='PRIVATE'">私模</el-tag>
            <el-tag type="warning" size="small" effect="plain" v-if="scope.row.status=='CLEAN'">清仓</el-tag>
          </template>
        </el-table-column>
        <el-table-column
            prop="series"
            label="产品系列"
            :filter-multiple="false"
            :filters="seriesFilters"
            column-key="filterSeries"
            min-width="90">
        </el-table-column>
        <el-table-column
            prop="total_qty"
            label="总库存"
            align="center"
            header-align="center"
            width="80">
        </el-table-column>
        <el-table-column
            prop="total_lock_qty"
            label="总锁仓"
            align="center"
            header-align="center"
            width="80">
        </el-table-column>
        <el-table-column
            label="售价"
            align="center"
            header-align="center"
            width="70">
          <template slot-scope="scope">
            <span>{{ scope.row.sale_price | currency}}</span>
          </template>
        </el-table-column>
        <el-table-column
            label="标签"
            :filter-multiple="false"
            :filters="tagFilters"
            column-key="filterTag"
            min-width="180">
          <template slot-scope="scope">
            <el-tag
                v-for="item in scope.row.product_p_tag"
                :key="item.tag_name"
                :color="item.color"
                :closable="editTag"
                @close="deleteTag(item.id)"
                size="mini"
                effect="dark"
                style="margin-right: 5px;border: none">
              {{ item.tag_name }}
            </el-tag>
          </template>

        </el-table-column>
        <el-table-column
            label="操作"
            width="130"
        >
          <template slot-scope="scope">
            <el-button
                type="text"
                @click="productDetail(scope.row.id)"
                size="small">
              编辑
            </el-button>
            <el-divider direction="vertical"></el-divider>
            <el-dropdown @command="handleProductOp">
              <el-button type="text">
                操作<i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item disabled>打印条码</el-dropdown-item>
                <el-dropdown-item :command="{type:'addTag', obj:scope.row}">添加标签</el-dropdown-item>
                <el-dropdown-item v-if="!editTag" :command="{type:'editTag', obj:scope.row}">编辑标签</el-dropdown-item>
                <el-dropdown-item v-if="editTag" :command="{type:'editTag', obj:scope.row}">取消标签编辑</el-dropdown-item>
                <el-dropdown-item :command="{type:'delete', id:scope.row.id}">删除产品</el-dropdown-item>
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
          :total="total">
      </el-pagination>
    </div>

    <!--      产品详情弹框-->
    <div v-if="productDetailVisible">
      <el-dialog
          :title="this.productID ? '产品详情' : '创建产品'"
          :visible.sync="productDetailVisible"
          :destroy-on-close="true"
          :close-on-click-modal="false"
          top="20px"
          width="1200px"
      >
        <div>
          <product-detail ref="productDetail" :productID="productID"
                          @closeProductDetail="closeProductDetail"></product-detail>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="productDetailVisible = false">取 消</el-button>
          <el-button size="small" type="primary" @click="productDetailUpdate">确 定</el-button>
        </span>
      </el-dialog>
    </div>

    <!--      产品上传弹框-->
    <div>
      <el-dialog
          title="产品上传"
          :visible.sync="productUploadVisible"
          :destroy-on-close="true"
          :close-on-click-modal="false"
          width="500px"
      >
        <div>
          <el-upload
              v-loading="uploadLoading"
              style="margin-left: 50px;"
              ref="upload"
              name="excel"
              :headers="headers"
              :on-success="onSuccess"
              :on-error="onError"
              :auto-upload="false"
              :before-upload="beforeUpload"
              :limit="1"
              drag
              action="api/products/bulk_upload/">
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <div class="el-upload__tip" slot="tip">只能上传excel文件</div>
          </el-upload>

          <div v-if="uploadResult">
            <el-result icon="warning" v-if="errList.length">
              <template slot="extra">
                <h2>成功上传 <span style="color: green ">{{ this.successCount }}</span> 条，失败 <span style="color: crimson ">{{
                    this.failCount
                  }}</span> 条</h2>
              </template>
            </el-result>

            <el-result icon="success" v-if="!failCount">
              <template slot="extra">
                <h2>成功上传 <span style="color: green ">{{ this.successCount }}</span> 条</h2>
              </template>
            </el-result>

            <el-table
                v-if="errList.length"
                :data="errList"
                border
                size="mini"
                style="width: 100%">
              <el-table-column
                  prop="row"
                  label="问题行"
                  width="180">
              </el-table-column>
              <el-table-column
                  prop="msg"
                  label="错误原因">
              </el-table-column>

            </el-table>
          </div>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="productUploadVisible = false">取 消</el-button>
          <el-button size="small" type="primary" @click="submitUpload">开始导入</el-button>
        </span>
      </el-dialog>
    </div>

<!--    产品标签弹窗-->
    <el-dialog
        title="添加标签"
        :visible.sync="tagVisible"
        width="500px"
    >
      <SelectTag @selectedTag="initTag"
                 v-if="isShow"
                 :key="timer"
                 :obj="{'id':productID,'tag_type':'PRODUCT','existTag':currentTag}"></SelectTag>

    </el-dialog>


    <!--      产品批量修改弹框-->
    <div>
      <el-dialog
          v-loading="loading"
          :title="'产品批量修改 已选 ' + this.multipleSelection.length + ' 条'"
          :visible.sync="bulkEditVisible"
          :destroy-on-close="true"
          :close-on-click-modal="false"
          @close="closeBulkEdit"
          width="800px"
      >
        <div class="bulkChange">
          <div v-if="showAllEdit || showEditType==='image'">
            <el-checkbox v-model="isBulkImage">默认图片</el-checkbox>
            <el-select
                v-model="bulkImage" placeholder="请选择"
                :disabled="!isBulkImage">
              <el-option
                  v-for="item in imageOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
              </el-option>
            </el-select>
            <el-divider></el-divider>
          </div>

          <div v-if="showAllEdit || showEditType==='status'">
            <el-checkbox v-model="isBulkStatus">产品状态</el-checkbox>
            <el-select
                v-model="bulkStatus" placeholder="请选择"
                :disabled="!isBulkStatus">
              <el-option
                  v-for="item in statusFilters"
                  :key="item.value"
                  :label="item.text"
                  :value="item.value">
              </el-option>
            </el-select>
            <el-divider></el-divider>
          </div>

          <div v-if="showAllEdit">
            <el-checkbox v-model="isBulkP_type">产品类型</el-checkbox>
            <el-select
                v-model="bulkP_type" placeholder="请选择"
                :disabled="!isBulkP_type">
              <el-option
                  v-for="item in pType"
                  :key="item.name"
                  :label="item.name"
                  :value="item.name">
              </el-option>
            </el-select>
            <el-divider></el-divider>
          </div>

          <div v-if="showAllEdit">
            <el-checkbox v-model="isBulkUnit_cost">成本价</el-checkbox>
            <el-input-number v-model="bulkUnit_cost"
                             :disabled="!isBulkUnit_cost"
                             controls-position="right"
                             :precision="2" :step="1" :min="0">
            </el-input-number>
            <el-divider></el-divider>
          </div>

          <div v-if="showAllEdit">
            <el-checkbox v-model="isBulkSale_price">销售价</el-checkbox>
            <el-input-number v-model="bulkSale_price"
                             :disabled="!isBulkSale_price"
                             controls-position="right"
                             :precision="2" :step="1" :min="0">
            </el-input-number>
            <el-divider></el-divider>
          </div>

          <div v-if="showAllEdit">
            <el-checkbox v-model="isBulkSize">尺寸</el-checkbox>
            长cm
            <el-input-number v-model="bulkLength"
                             :disabled="!isBulkSize"
                             controls-position="right"
                             :precision="1" :step="1" :min="0">
            </el-input-number>
            宽cm
            <el-input-number v-model="bulkWidth"
                             :disabled="!isBulkSize"
                             controls-position="right"
                             :precision="1" :step="1" :min="0">
            </el-input-number>
            高cm
            <el-input-number v-model="bulkHeigth"
                             :disabled="!isBulkSize"
                             controls-position="right"
                             :precision="1" :step="1" :min="0">
            </el-input-number>
            <el-divider></el-divider>
          </div>

          <div v-if="showAllEdit">
            <el-checkbox v-model="isBulkWeight">重量kg</el-checkbox>
            <el-input-number v-model="bulkWeight"
                             :disabled="!isBulkWeight"
                             controls-position="right"
                             :precision="3" :step="0.01" :min="0">
            </el-input-number>
            <el-divider></el-divider>
          </div>

          <div v-if="showAllEdit">
            <el-checkbox v-model="isBulkIs_auto_promote">采购推荐</el-checkbox>
            <el-select
                v-model="bulkIs_auto_promote" placeholder="请选择"
                :disabled="!isBulkIs_auto_promote">
              <el-option :key="true" label="开启" :value="true"></el-option>
              <el-option :key="false" label="关闭" :value="false"></el-option>
            </el-select>
            <el-divider></el-divider>
          </div>

          <div v-if="showAllEdit">
            <el-checkbox v-model="isBulkStock_strategy">采购策略</el-checkbox>
            <el-select
                v-model="bulkStock_strategy" placeholder="请选择"
                :disabled="!isBulkStock_strategy">
              <el-option
                  v-for="item in strategyOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
              </el-option>
            </el-select>
            <el-divider></el-divider>
          </div>

          <div v-if="showAllEdit">
            <el-checkbox v-model="isBulkStock_days">备货天数</el-checkbox>
            <el-input-number v-model="bulkStock_days"
                             :disabled="!isBulkStock_days"
                             controls-position="right"
                             :step="1" :min="0">
            </el-input-number>
            <el-divider></el-divider>
          </div>

          <div v-if="showAllEdit">
            <el-checkbox v-model="isBulkAlert_qty">警戒库存</el-checkbox>
            <el-input-number v-model="bulkAlert_qty"
                             :disabled="!isBulkAlert_qty"
                             controls-position="right"
                             :step="1" :min="0">
            </el-input-number>
            <el-divider></el-divider>
          </div>

          <div v-if="showAllEdit">
            <el-checkbox v-model="isBulkAlert_days">警戒天数</el-checkbox>
            <el-input-number v-model="bulkAlert_days"
                             :disabled="!isBulkAlert_days"
                             controls-position="right"
                             :step="1" :min="0">
            </el-input-number>
            <el-divider></el-divider>
          </div>

          <div v-if="showAllEdit">
            <el-checkbox v-model="isBulkMini_pq">最小采购量</el-checkbox>
            <el-input-number v-model="bulkMini_pq"
                             :disabled="!isBulkMini_pq"
                             controls-position="right"
                             :step="1" :min="0">
            </el-input-number>
            <el-divider></el-divider>
          </div>

          <div v-if="showAllEdit">
            <el-checkbox v-model="isBulkMax_pq">采购上限</el-checkbox>
            <el-input-number v-model="bulkMax_pq"
                             :disabled="!isBulkMax_pq"
                             controls-position="right"
                             :step="1" :min="0">
            </el-input-number>
            <el-divider></el-divider>
          </div>

          <div v-if="showAllEdit || showEditType==='tag'">
            <el-checkbox v-model="isBulkTag">标签</el-checkbox>
            <el-select
                v-model="bulkTag" placeholder="请选择"
                :disabled="!isBulkTag">
              <el-option
                  v-for="item in tagFilters"
                  :key="item.tagID"
                  :label="item.text"
                  :value="item.tagID">
              </el-option>
            </el-select>
            <el-divider></el-divider>
          </div>

          <div v-if="showAllEdit || showEditType==='note'">
            <el-checkbox v-model="isBulkNote">备注</el-checkbox>
            <el-input
                :disabled="!isBulkNote"
                type="textarea"
                :rows="2"
                placeholder="请输入内容"
                v-model="bulkNote">
            </el-input>
          </div>

        </div>
        <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="bulkEditVisible = false">取 消</el-button>
          <el-button size="small" type="primary"
                     @click="submitBulkEdit">确 认</el-button>
        </span>
      </el-dialog>
    </div>


  </div>

</template>

<script>
import ProductDetail from "@/components/product/ProductDetail";
import SelectTag from "@/components/setting/SelectTag";
import moment from "moment";

export default {
  name: "productList",
  data() {
    return {
      // 产品上传认证
      headers: {
        Authorization: window.localStorage.getItem('tokenStr'),
      },
      uploadLoading: false, //上传loading
      uploadResult: false, // 上传结果显示
      errList: [], // 错误列表
      failCount: 0, // 错误数
      successCount: 0, // 成功数
      productDetailVisible: false, // 产品详情对话框
      productUploadVisible: false, // 产品上传对话框
      bulkEditVisible: false, // 产品批量修改对话框
      productID: 0, // 产品id
      searchValue: '', // 搜索框值
      pStatus: '', // 产品状态筛选值
      pTag: '', // 产品标签筛选值
      pSeries: '', // 产品系列筛选值
      ordering: '', // 排序
      select: '',
      loading: false,
      total: 0,
      page: 1,
      size: 20,
      expandStatus: true, // 所有行展开状态
      products: [],
      tagVisible: false,
      currentTag:[],
      isShow: false,
      timer: '',
      editTag: false,
      statusFilters: [
        {text: '在售', value: 'ON_SALE'},
        {text: '停售', value: 'OFFLINE'},
        {text: '未上市', value: 'UN_LISTED'},
        {text: '私模', value: 'PRIVATE'},
        {text: '清仓', value: 'CLEAN'},
      ],
      imageOptions: [{
        value: 'product_image/001bk.jpg',
        label: '华尔兹001-黑色'
      }, {
        value: 'product_image/001bu.jpg',
        label: '华尔兹001-蓝色'
      }, {
        value: 'product_image/001gn.jpg',
        label: '华尔兹001-绿色'
      }, {
        value: 'product_image/001rd.jpg',
        label: '华尔兹001-酒红'
      }],
      strategyOptions: [{
        value: 'RADICAL',
        label: '激进'
      }, {
        value: 'STANDARD',
        label: '标准'
      }, {
        value: 'CONSERVE',
        label: '保守'
      }],
      pType: [], // 产品类型
      bulkImage: '',
      bulkStatus: '',
      bulkP_type: '',
      bulkUnit_cost: 0,
      bulkSale_price: 0,
      bulkLength: 0,
      bulkWidth: 0,
      bulkHeigth: 0,
      bulkWeight: 0,
      bulkIs_auto_promote: null,
      bulkStock_strategy: '',
      bulkStock_days: 0,
      bulkAlert_qty: 0,
      bulkAlert_days: 0,
      bulkMini_pq: 0,
      bulkMax_pq: 0,
      bulkTag: null,
      bulkNote: '',

      isBulkP_type: false,
      isBulkUnit_cost: false,
      isBulkSale_price: false,
      isBulkSize: false,
      isBulkWeight: false,
      isBulkIs_auto_promote: false,
      isBulkStock_strategy: false,
      isBulkStock_days: false,
      isBulkAlert_qty: false,
      isBulkAlert_days: false,
      isBulkMini_pq: false,
      isBulkMax_pq: false,
      isBulkTag: false,
      isBulkNote: false,

      isBulkImage: false, // 是否批量修改产品图片
      isBulkStatus: false, // 是否批量修改产品状态
      tagFilters: [],  // 产品标签过滤项
      seriesFilters: [],  // 产品系列过滤项
      showAllEdit: false,
      showEditType: '',
      allBulk: {
        ids: [], // 选中行产品id
        changeItems: {} // 批量修改的值
      },
      multipleSelection: [] // 选中行
    }
  },
  mounted() {
    this.initProducts(); // 初始化产品列表
    this.initProductSettings(); // 初始化产品基础资料
  },
  components: {
    ProductDetail,SelectTag
  },
  filters: {
    //金额格式化
    currency: function (value) {
      if (!value) return 0.00;
      return `¥${value.toFixed(2)}`;
    },
  },
  methods: {
    // 格式化日期时间
    datetimeFormat: function (row, column) {
      let date = row[column.property];

      if (date == undefined) {
        return ''
      }
      return moment(date).format("YYYY-MM-DD HH:mm:ss")

    },

    // 删除标签
    deleteTag(id){
      this.deleteRequest('api/product_tags/'+id+'/').then(resp => {
        this.initProducts()
      })
    },

    //重新加载标签
    initTag(test){
      this.initProducts()
      this.tagVisible = false
    },

    // 关闭批量修改对话框回调
    closeBulkEdit() {
      this.bulkImage = ''
      this.bulkStatus = ''
      this.bulkP_type = ''
      this.bulkUnit_cost = 0
      this.bulkSale_price = 0
      this.bulkLength = 0
      this.bulkWidth = 0
      this.bulkHeigth = 0
      this.bulkWeight = 0
      this.bulkIs_auto_promote = null
      this.bulkStock_strategy = ''
      this.bulkStock_days = 0
      this.bulkAlert_qty = 0
      this.bulkAlert_days = 0
      this.bulkMini_pq = 0
      this.bulkMax_pq = 0
      this.bulkTag = null
      this.bulkNote = ''

      this.isBulkP_type = false
      this.isBulkUnit_cost = false
      this.isBulkSale_price = false
      this.isBulkSize = false
      this.isBulkWeight = false
      this.isBulkIs_auto_promote = false
      this.isBulkStock_strategy = false
      this.isBulkStock_days = false
      this.isBulkAlert_qty = false
      this.isBulkAlert_days = false
      this.isBulkMini_pq = false
      this.isBulkMax_pq = false
      this.isBulkTag = false
      this.isBulkNote = false
      this.isBulkImage = false
      this.isBulkStatus = false
      this.showAllEdit = false
      this.showEditType = ''
    },
    // 打开批量修改对话框
    handleBulkEdit(command) {
      this.multipleSelection.forEach(item => {
        this.allBulk.ids.push(item.id)
      })
      if (command === 'all') {
        this.showAllEdit = true;
      } else {
        this.showEditType = command;
      }

      this.bulkEditVisible = true;
    },
    // 提交批量修改
    submitBulkEdit() {
      if (this.isBulkImage && this.bulkImage) {
        this.allBulk.changeItems['image'] = this.bulkImage;
      }
      if (this.isBulkStatus && this.bulkStatus) {
        this.allBulk.changeItems['status'] = this.bulkStatus
      }
      if (this.isBulkP_type && this.bulkP_type) {
        this.allBulk.changeItems['p_type'] = this.bulkP_type
      }
      if (this.isBulkUnit_cost && this.bulkUnit_cost) {
        this.allBulk.changeItems['unit_cost'] = this.bulkUnit_cost
      }
      if (this.isBulkSale_price && this.bulkUnit_cost) {
        this.allBulk.changeItems['sale_price'] = this.bulkSale_price
      }
      if (this.isBulkSize && this.bulkUnit_cost) {
        if (this.bulkLength) {
          this.allBulk.changeItems['length'] = this.bulkLength
        }
        if (this.bulkWidth) {
          this.allBulk.changeItems['width'] = this.bulkWidth
        }
        if (this.bulkHeigth) {
          this.allBulk.changeItems['heigth'] = this.bulkHeigth
        }
      }
      if (this.isBulkWeight && this.bulkWeight) {
        this.allBulk.changeItems['weight'] = this.bulkWeight
      }
      if (this.isBulkIs_auto_promote && this.bulkIs_auto_promote != null) {
        this.allBulk.changeItems['is_auto_promote'] = this.bulkIs_auto_promote
      }
      if (this.isBulkStock_strategy && this.bulkStock_strategy) {
        this.allBulk.changeItems['stock_strategy'] = this.bulkStock_strategy
      }
      if (this.isBulkStock_days && this.bulkStock_days) {
        this.allBulk.changeItems['stock_days'] = this.bulkStock_days
      }
      if (this.isBulkAlert_qty && this.bulkAlert_qty) {
        this.allBulk.changeItems['alert_qty'] = this.bulkAlert_qty
      }
      if (this.isBulkAlert_days && this.bulkAlert_days) {
        this.allBulk.changeItems['alert_days'] = this.bulkAlert_days
      }
      if (this.isBulkMini_pq && this.bulkMini_pq) {
        this.allBulk.changeItems['mini_pq'] = this.bulkMini_pq
      }
      if (this.isBulkMax_pq && this.bulkMax_pq) {
        this.allBulk.changeItems['max_pq'] = this.bulkMax_pq
      }
      if (this.isBulkTag && this.bulkTag) {
        this.allBulk.changeItems['tag'] = this.bulkTag
      }
      if (this.isBulkNote && this.bulkNote) {
        this.allBulk.changeItems['note'] = this.bulkNote
      }

      if (this.allBulk.ids.length && JSON.stringify(this.allBulk.changeItems)!=='{}') {
        this.$confirm('此操作将修改 '+this.multipleSelection.length +' 条记录是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          // 提交批量修改
          this.loading = true;
          this.postRequest('api/products/bulk_edit/', this.allBulk).then(resp => {
            if (resp) {
              this.loading = false;
              this.initProducts();
              this.allBulk.ids = [];
              this.allBulk.changeItems = {};
              this.bulkEditVisible = false;
            }
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消'
          });
        });

      }

    },

    // 产品更多操作
    handleProductOp(command) {
      // 产品删除
      if (command['type'] == 'delete') {
        this.$confirm('已被关联使用的产品将无法删除, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          //调用删除产品
          this.deleteRequest('api/products/' + command['id'] + '/').then(resp => {
            this.initProducts();
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消删除'
            });
          });
        })
      }

      //添加标签
      if (command['type'] == 'addTag') {
        this.isShow = false
        this.timer = new Date().getTime();
        this.productID=command['obj'].id
        this.currentTag=command['obj'].product_p_tag
        this.isShow = true
        this.tagVisible = true
      }

      //编辑标签
      if (command['type'] == 'editTag') {
        this.editTag = !this.editTag
      }

    },
    // 产品上传前的回调
    beforeUpload() {
      this.uploadLoading = true;
      this.uploadResult = false;
      this.errList = [];
      this.failCount = 0;
      this.successCount = 0
    },
    // 产品上传错误功之后的回调
    onError() {
      this.uploadLoading = false;
      this.$refs.upload.clearFiles();
    },
    // 产品上传成功之后的回调
    onSuccess(response, file, fileList) {
      this.uploadLoading = false;
      this.$refs.upload.clearFiles();
      this.uploadResult = true;
      this.successCount = response.success_count;
      if (response.fail_count) {
        this.errList = response.err_list;
        this.failCount = response.fail_count;
      }
      if (this.successCount) {
        this.initProducts();
      }
    },
    // 上传产品
    submitUpload() {
      this.$refs.upload.submit();
    },

    // 创建新产品
    createProduct() {
      this.productID = 0;
      this.productDetailVisible = true;
    },
    // 成功业务处理后关闭产品详情弹窗
    closeProductDetail() {
      this.initProducts();
      this.productDetailVisible = false;
    },
    // 产品详情弹窗更新
    productDetailUpdate() {
      this.$refs.productDetail.updateProduct();
    },

    // 打开产品详情弹窗
    productDetail(id) {
      this.productID = id;
      this.productDetailVisible = true;
    },

    // 排序
    handleSort(obj) {
      if (obj.order == 'descending') {
        this.ordering = '-' + obj.prop;
      }
      if (obj.order == 'ascending') {
        this.ordering = obj.prop;
      }
      if (!obj.order) {
        this.ordering = '';
      }
      this.initProducts();
    },

    // 关闭筛选项/排序项
    colseFilter(type) {
      if (type == 'tag') {
        this.pTag = '';
        this.$refs.multipleTable.clearFilter('filterTag');
      } else if (type == 'status') {
        this.pStatus = '';
        this.$refs.multipleTable.clearFilter('filterStatus');
      } else if (type == 'series') {
        this.pSeries = '';
        this.$refs.multipleTable.clearFilter('filterSeries');
      } else if (type == 'ordering') {
        this.ordering = '';
        this.$refs.multipleTable.clearSort();
      } else {
        this.pTag = '';
        this.pStatus = '';
        this.pSeries = '';
        this.ordering = '';
        this.$refs.multipleTable.clearFilter();
        this.$refs.multipleTable.clearSort();
      }
      this.initProducts();
    },

    // 监听筛选项的变化
    filterChange(filterObj) {
      // 监听产品状态字段
      if (filterObj.filterStatus) {
        this.pStatus = filterObj.filterStatus[0];
      }
      // 监听产品标签字段
      if (filterObj.filterTag) {
        this.pTag = filterObj.filterTag[0];
      }
      // 监听产品系列字段
      if (filterObj.filterSeries) {
        this.pSeries = filterObj.filterSeries[0];
      }

      this.initProducts();
    },
    // 搜索
    doSearch() {
      // 当有过滤项时，先清除过滤项再搜索
      this.pStatus = '';
      this.pTag = '';
      this.pSeries = '';
      this.page = 1;
      this.$refs.multipleTable.clearFilter();
      this.initProducts();
    },
    // 重置搜索内容
    clearSearchValue() {
      this.searchValue = '';
      this.initProducts();
    },
    // 循环设置行展开、收起
    forArr(arr, isExpand) {
      arr.forEach(i => {
        this.$refs.multipleTable.toggleRowExpansion(i, isExpand);
        if (i.children) {
          this.forArr(i.children, isExpand);
        }
      })
    },
    // 行是否展开切换
    expendChange() {
      this.forArr(this.products, this.expandStatus);
      this.expandStatus = !this.expandStatus;
    },
    // 分页大小
    sizeChange(size) {
      this.size = size;
      this.initProducts();
    },
    // 页码
    currentChange(page) {
      this.page = page;
      this.initProducts();
    },
    // 调用产品列表接口数据
    initProducts() {
      this.loading = true;
      // 拼接分页，搜索，过滤url
      let url = 'api/products/?page=' + this.page + '&page_size=' + this.size;
      if (this.searchValue) {
        url += '&search=' + this.searchValue;
      }
      if (this.pStatus) {
        url += '&status=' + this.pStatus;
      }
      if (this.pSeries) {
        url += '&series=' + this.pSeries;
      }
      if (this.pTag) {
        url += '&product_p_tag__tag__tag_name=' + this.pTag;
      }
      if (this.ordering) {
        url += '&ordering=' + this.ordering;
      }

      this.getRequest(url).then(resp => {
        if (resp.results) {
          this.products = resp.results;
          this.total = resp.count;
          this.loading = false;
        }
      })
    },
    // 调用接口拿到所有产品标签，产品系列
    initProductSettings() {
      //获取所有可选产品类型
      if (window.sessionStorage.getItem('pType')) {
        this.pType = JSON.parse(window.sessionStorage.getItem('pType'));
      } else {
        this.getRequest('api/product_extra_info/?type=P_TYPE').then(resp => {
          if (resp.results) {
            this.pType = resp.results;
            window.sessionStorage.setItem('pType', JSON.stringify(this.pType));
          }
        })
      }

      // 获取所有产品标签
      this.getRequest('api/settings/tags/?type=PRODUCT').then(resp => {
        if (resp) {
          resp.results.forEach(i => {
            this.tagFilters.push({text: i.tag_name, value: i.tag_name, tagID: i.id})
          })
        }
      })

      //获取所有可选产品系列
      this.getRequest('api/product_extra_info/?type=SERIES').then(resp => {
        if (resp.results) {
          resp.results.forEach(i => {
            this.seriesFilters.push({text: i.name, value: i.name})
          })
        }
      })

    },


    toggleSelection(rows) {
      if (rows) {
        rows.forEach(row => {
          this.$refs.multipleTable.toggleRowSelection(row);
        });
      } else {
        this.$refs.multipleTable.clearSelection();
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;

    }
  }
}
</script>


<style scoped>
.productList {
  padding: 10px;
  background-color: white;
  margin-top: 10px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.operate {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
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

.bulkChange .el-checkbox {
  margin-right: 30px;
  margin-left: 30px;
}
</style>