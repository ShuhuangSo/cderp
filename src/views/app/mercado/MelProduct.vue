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
      </div>

      <div>
        <el-button type="success" icon="el-icon-plus"
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

        <el-table-column type="expand">
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
            width="150">
          <template slot-scope="scope">
            <el-image
                style="width: 50px; height: 50px"
                :src="scope.row.image"
                :preview-src-list="[scope.row.image]"
                fit="fill">
            </el-image>
          </template>
        </el-table-column>

        <el-table-column
            label="产品"
            show-overflow-tooltip
            width="300">
          <template slot-scope="scope">
            <div>{{ scope.row.sku }}</div>

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
            prop="note"
            label="备注">
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
          <div class="el-upload__tip" slot="tip">只能上传excel文件, <el-link href="/media/template/device models upload template.xlsx" target="_blank">模板下载</el-link></div>
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

export default {
  name: "MelProduct",
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
  },
  mounted() {
    this.initMLProducts();
  },
  methods: {
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

</style>