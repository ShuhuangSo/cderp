/*
美客多FBM--产品库
*/
<template>

  <div>
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

        <el-select v-model="is_check"
                   style="width: 150px;margin-left: 5px"
                   @change="initMLProducts" placeholder="请选择筛选项">
          <el-option
              v-for="item in check_group"
              :key="item.name"
              :label="item.name"
              :value="item.value">
          </el-option>
        </el-select>

        <el-select v-model="p_status"
                   style="width: 150px;margin-left: 5px"
                   @change="initMLProducts" placeholder="请选择筛选项">
          <el-option
              v-for="item in status_group"
              :key="item.name"
              :label="item.name"
              :value="item.value">
          </el-option>
        </el-select>

      </div>

      <div>
        <el-button icon="el-icon-box"
                   style="margin-right: 10px"
                   @click="openPacking">包材管理
        </el-button>

        <el-button type="success" icon="el-icon-upload"
                   style="margin-right: 10px"
                   @click="uploadVisible=true">产品导入
        </el-button>
      </div>
    </div>

    <div style="margin-top: 5px">
      <el-table
          ref="productTable"
          :data="mlProducts"
          :header-cell-style="{background:'#fafafa'}"
          v-loading="loading"
          style="width: 100%">
        <el-table-column
            type="selection"
            width="42">
        </el-table-column>

        <el-table-column type="expand" width="40">
          <template slot-scope="props">
            <el-descriptions
                title="产品详情" :column="1" border>
              <el-descriptions-item label="FBM条码">{{ props.row.label_code }}</el-descriptions-item>
              <el-descriptions-item label="UPC">{{ props.row.upc }}</el-descriptions-item>
              <el-descriptions-item label="海关编码">{{ props.row.custom_code }}</el-descriptions-item>
              <el-descriptions-item label="中文品名">{{ props.row.cn_name }}</el-descriptions-item>
              <el-descriptions-item label="英文品名">{{ props.row.en_name }}</el-descriptions-item>
              <el-descriptions-item label="品牌">{{ props.row.brand }}</el-descriptions-item>
              <el-descriptions-item label="申报价值">{{ props.row.declared_value | dollar }}</el-descriptions-item>
              <el-descriptions-item label="中文材质">{{ props.row.cn_material }}</el-descriptions-item>
              <el-descriptions-item label="英文材质">{{ props.row.en_material }}</el-descriptions-item>
              <el-descriptions-item label="重量kg">{{ props.row.weight }}</el-descriptions-item>
              <el-descriptions-item label="长cm">{{ props.row.length }}</el-descriptions-item>
              <el-descriptions-item label="宽cm">{{ props.row.width }}</el-descriptions-item>
              <el-descriptions-item label="高cm">{{ props.row.heigth }}</el-descriptions-item>
              <el-descriptions-item label="预估头程运费">{{
                  props.row.first_ship_cost | currency
                }}
              </el-descriptions-item>
              <el-descriptions-item label="采购链接">{{ props.row.buy_url }}</el-descriptions-item>
              <el-descriptions-item label="销售链接">{{ props.row.sale_url }}</el-descriptions-item>
              <el-descriptions-item label="参考链接">{{ props.row.refer_url }}</el-descriptions-item>
              <el-descriptions-item label="备注">{{ props.row.note }}</el-descriptions-item>
            </el-descriptions>

          </template>
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
            <div style="font-weight: bold">{{ scope.row.sku }}</div>

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
            prop="site"
            label="站点"
            align="center"
            header-align="center"
            width="80">
        </el-table-column>

        <el-table-column
            prop="shop"
            label="上架店铺">
        </el-table-column>

        <el-table-column
            label="成本价"
            align="center"
            header-align="center"
            width="70">
          <template slot-scope="scope">
            <span>{{ scope.row.unit_cost | currency }}</span>
          </template>
        </el-table-column>

        <el-table-column
            label="数据"
            align="center"
            header-align="center"
            width="100">
          <template slot-scope="scope">
            <el-tag type="success" size="small" effect="plain" v-if="scope.row.is_checked">已核对</el-tag>
            <el-tag type="warning" size="small" effect="plain" v-if="!scope.row.is_checked">待核查</el-tag>
          </template>
        </el-table-column>

        <el-table-column
            label="状态"
            align="center"
            header-align="center"
            width="100">
          <template slot-scope="scope">
            <el-tag type="success" size="small" effect="plain" v-if="scope.row.p_status=='ON_SALE'">在售</el-tag>
            <el-tag type="danger" size="small" effect="plain" v-if="scope.row.p_status=='OFFLINE'">停售</el-tag>
            <el-tag type="warning" size="small" effect="plain" v-if="scope.row.p_status=='CLEAN'">清仓</el-tag>
          </template>
        </el-table-column>

        <el-table-column
            label="创建日期"
            align="center"
            header-align="center"
            width="90">
          <template slot-scope="scope">
            <span>{{ scope.row.create_time | date }}</span>
          </template>
        </el-table-column>

        <el-table-column
            label="操作"
            width="130"
        >
          <template slot-scope="scope">
            <el-dropdown @command="handleProductOp">
              <el-button type="text">
                操作<i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :command="{type:'editImage', obj:scope.row}">更换图片</el-dropdown-item>
                <el-dropdown-item :command="{type:'edit', id:scope.row.id}">编辑产品</el-dropdown-item>
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
      <MelProductDetail ref="productDetail"
                        :key="timer"
                        :productID="productID"
                        @closeProductDetail="closeProductDetail"></MelProductDetail>
      <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="productDetailVisible = false">取 消</el-button>
          <el-button size="small" type="primary" @click="productDetailUpdate">确 定</el-button>
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
            action="api/ml_products/image_upload/"
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

    <!--    包材管理弹窗-->
    <el-dialog
        title="包材管理"
        :key="timer"
        :visible.sync="packingVisible"
        :destroy-on-close="true"
        :close-on-click-modal="false"
        width="800px"
    >
      <MelPacking></MelPacking>
      <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="packingVisible = false">关 闭</el-button>
        </span>
    </el-dialog>

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
            :limit="1"
            drag
            action="api/ml_products/bulk_upload/">
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div class="el-upload__tip" slot="tip">只能上传excel文件,
            <el-link href="/media/template/ml_products_upload_ template.xlsx" target="_blank">模板下载</el-link>
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
import moment from "moment/moment";
import MelProductDetail from "@/views/app/mercado/MelProductDetail";
import MelPacking from "@/views/app/mercado/MelPacking";

export default {
  name: "MelProduct",
  components: {
    MelProductDetail, MelPacking
  },
  data() {
    return {
      loading: false,
      total: 0, // 总条数
      page: 1,  // 当前页
      size: 20,  // 页大小
      searchValue: '',
      mlProducts: [],
      uploadVisible: false, //上传窗口显示状态
      // 批量上传认证
      headers: {
        Authorization: window.localStorage.getItem('tokenStr'),
      },
      productDetailVisible: false, //产品详情弹窗
      productID: 0, // 产品id
      imageVisible: false, // 图片修改弹窗
      packingVisible: false, // 包材弹窗
      imageUrl: null,
      imageID: null,
      timer: null,
      version: Math.random(),
      is_check: '',
      p_status: '',
      check_group: [
        {
          name: '全部数据',
          value: ''
        },
        {
          name: '已核对',
          value: '&is_checked=true'
        },
        {
          name: '待核查',
          value: '&is_checked=false'
        }
      ],
      status_group: [
        {
          name: '全部状态',
          value: ''
        },
        {
          name: '在售',
          value: '&p_status=ON_SALE'
        },
        {
          name: '清仓',
          value: '&p_status=CLEAN'
        },
        {
          name: '停售',
          value: '&p_status=OFFLINE'
        }
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
    //usd金额格式化
    dollar: function (value) {
      if (!value) return 0.00;
      return `USD ${value.toFixed(2)}`;
    },
    //图片地址格式化
    smpic: function (value) {
      if (!value) return '';
      let url = value.slice(0, value.length-4)
      return url + '_100x100.jpg/?' + Math.random()
    },
  },
  mounted() {
    this.initMLProducts();
  },
  methods: {
    //打开包材管理弹窗
    openPacking(){
      this.timer = new Date().getTime();
      this.packingVisible = true
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
      this.initMLProducts();
      this.imageVisible = false;
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
        this.timer = new Date().getTime();
        this.productDetail(command['id'])
      }

      // 产品删除
      if (command['type'] == 'delete') {
        this.$confirm('删除的产品无法恢复, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          //调用删除产品
          this.deleteRequest('api/ml_products/' + command['id'] + '/').then(resp => {
            this.initMLProducts();
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消删除'
            });
          });
        })
      }

    },
    // 打开产品详情弹窗
    productDetail(id) {
      this.productID = id;
      this.productDetailVisible = true;
    },
    // 产品详情弹窗更新
    productDetailUpdate() {
      this.$refs.productDetail.updateProduct();
    },

    // 成功业务处理后关闭产品详情弹窗
    closeProductDetail() {
      this.$message.success('操作成功')
      this.initMLProducts();
      this.productDetailVisible = false;
    },
    // 型号上传前的回调
    beforeUpload() {
      this.loading = true;
    },
    // 上传成功之后的回调
    onSuccess(response, file, fileList) {
      this.loading = false;
      this.$refs.upload.clearFiles();
      // this.$message.success(response.msg)
      this.initMLProducts();
      this.uploadVisible = false;
    },
    // 上传
    submitUpload() {
      this.$refs.upload.submit();
    },

    // 重置搜索内容
    clearSearchValue() {
      this.searchValue = '';
      this.initMLProducts();
    },
    // 搜索
    doSearch() {
      this.page = 1;
      this.$refs.productTable.clearFilter();
      this.initMLProducts();
    },
    // 分页大小
    sizeChange(size) {
      this.page = 1;
      this.size = size;
      this.initMLProducts();
    },
    // 页码
    currentChange(page) {
      this.page = page;
      this.initMLProducts();
    },
    initMLProducts() {
      let url = '/api/ml_products/?page=' + this.page + '&page_size=' + this.size
      if (this.searchValue) {
        url += '&search=' + this.searchValue;
      }
      if (this.is_check!=='') {
        url += '&is_check=' + this.is_check;
      }
      if (this.p_status!=='') {
        url += '&p_status=' + this.p_status;
      }
      url += '&ordering=-create_time,item_id'

      this.loading = true
      this.getRequest(url).then(resp => {
        this.loading = false
        if (resp.results) {
          this.mlProducts = resp.results;
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
  display: flex;
  justify-content: space-between;
}

.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>