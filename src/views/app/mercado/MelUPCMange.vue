/*
upc号码池
*/
<template>
  <div class="mainList">
    <div class="operate">
      <div>
        <el-button type="success" icon="el-icon-plus"
                   style="margin-right: 10px"
                   @click="requestVisible=true">申请号码
        </el-button>

        <el-select v-model="onlyToday"
                   :disabled="!is_used"
                   style="width: 150px;margin-left: 5px"
                   @change="initUPC" placeholder="请选择筛选项">
          <el-option
              v-for="item in today_group"
              :key="item.name"
              :label="item.name"
              :value="item.value">
          </el-option>
        </el-select>

        <el-select v-model="is_used"
                   v-if="this.user.is_superuser"
                   style="width: 150px;margin-left: 5px"
                   @change="initUPC" placeholder="请选择筛选项">
          <el-option
              v-for="item in use_group"
              :key="item.name"
              :label="item.name"
              :value="item.value">
          </el-option>
        </el-select>
      </div>
      <div>
        <el-button icon="el-icon-plus"
                   v-if="this.user.is_superuser"
                   style="margin-right: 10px"
                   @click="uploadVisible=true">批量导入
        </el-button>
      </div>
    </div>

    <div style="margin-top: 5px">
      <el-table
          ref="deviceTable"
          :data="upcManage"
          :header-cell-style="{background:'#fafafa'}"
          v-loading="loading"
          highlight-current-row
          style="width: 100%">

        <el-table-column
            label="UPC码">
          <template slot-scope="scope">
            <div>{{ scope.row.number }}
              <el-link @click.native="copyText(scope.row.number)"
                       title="复制upc号"
                       class="small_icon"
                       :underline="false"><i class="el-icon-copy-document"></i></el-link>
            </div>
          </template>
        </el-table-column>

        <el-table-column
            align="center"
            header-align="center"
            width="250"
            label="申请人">
          <template slot-scope="scope">
            <div>{{ scope.row.user_name }}</div>
          </template>
        </el-table-column>

        <el-table-column
            align="center"
            header-align="center"
            width="250"
            label="使用时间">
          <template slot-scope="scope">
            <div>{{ scope.row.use_time | date }}</div>
          </template>
        </el-table-column>

        <el-table-column
            v-if="this.user.is_superuser"
            align="center"
            header-align="center"
            width="250"
            label="上传时间">
          <template slot-scope="scope">
            <div>{{ scope.row.create_time | date }}</div>
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
            action="api/upc_manage/bulk_upload/">
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

    <!--    申请号码弹窗-->
    <el-dialog
        title="申请数量"
        :visible.sync="requestVisible"
        :destroy-on-close="true"
        :close-on-click-modal="false"
        width="300px"
    >
      <div>
        <el-input-number
            style="width: 100%"
            v-model="request_qty"
            :precision="0"
            :min="1"></el-input-number>
      </div>
      <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="requestVisible=false">取 消</el-button>
          <el-button size="small" type="primary" @click="summitRequest">确 定</el-button>
        </span>
    </el-dialog>

  </div>
</template>

<script>
import moment from "moment/moment";

export default {
  name: "MelUPCMange",
  data(){
    return{
      user: JSON.parse(window.sessionStorage.getItem('user')),
      // 批量上传认证
      headers: {
        Authorization: window.localStorage.getItem('tokenStr'),
      },
      upcManage: [],
      total: 0, // 总条数
      page: 1,  // 当前页
      size: 20,  // 页大小
      loading: false,
      uploadVisible: false,
      requestVisible: false,
      is_used: true,
      onlyToday: true,
      request_qty: 1,
      use_group: [
        {
          name: '已使用',
          value: true
        },
        {
          name: '未使用',
          value: false
        }
      ],
      today_group: [
        {
          name: '仅查看今天',
          value: true
        },
        {
          name: '所有申请',
          value: false
        }
      ],
    }
  },
  filters: {
    //时间日期格式化
    date: function (value) {
      if (!value) return ''
      return moment(value).format("YYYY-MM-DD HH:mm");
    },
  },
  mounted() {
    this.initUPC()
  },
  methods:{
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
      this.initUPC();
      this.uploadVisible = false;
    },
    // 上传
    submitUpload() {
      this.$refs.upload.submit();
    },
    // 分页大小
    sizeChange(size) {
      this.size = size;
      this.initUPC();
    },
    // 页码
    currentChange(page) {
      this.page = page;
      this.initUPC();
    },
    // 申请upc号码
    summitRequest(){
      this.postRequest('api/upc_manage/request_upc/', {'qty': this.request_qty}).then(resp => {
        if (resp) {
          this.requestVisible = false;
          this.initUPC()
        }
      })
    },
    //初始化UPC
    initUPC() {
      let url = '/api/upc_manage/?page=' + this.page + '&page_size=' + this.size
      url += '&is_used=' + this.is_used;
      if (!this.is_used) this.onlyToday = false
      if (this.onlyToday) {
        let start_time = String(moment(new Date()).format("YYYY-MM-DD"))+' 00:00:00'
        let end_time = String(moment(new Date()).format("YYYY-MM-DD"))+' 23:59:59'
        url += '&use_time__gte=' + start_time;
        url += '&use_time__lte=' + end_time;
      }
      if (!this.user.is_superuser) {
        url += '&user=' + this.user.id;
      }
      url += '&ordering=-use_time'
      this.loading = true
      this.getRequest(url).then(resp => {
        this.loading = false
        if (resp) {
          this.upcManage = resp.results;
          this.total = resp.count;
        }
      })
    },

  }
}
</script>

<style scoped>
.mainList {
  padding: 10px;
  background-color: white;
  margin-top: 10px;
}

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

.small_icon{
  color: #99a9bf;
  margin-left: 5px;
}

::v-deep .el-table__body tr.current-row>td {
  /*color: #fff;*/
  background: #f0f9eb!important;
}
</style>