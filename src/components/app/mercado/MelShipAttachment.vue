<template>
  <div>
    <el-card shadow="hover">
      <div slot="header" class="clearfix">
        <span style="font-weight: bold; margin-right: 10px"><i class="el-icon-paperclip"></i>运单附件</span>
        <el-button size="mini"
                   v-if="permission.ship_attach_create"
                   @click="uploadVisible = true">上传附件</el-button>
      </div>
      <el-table
          :header-cell-style="{background:'#eef1f6'}"
          :data="attachments"
          border
          size="mini"
          style="width: 98%; margin: 10px">
        <el-table-column
            label="附件类型"
            align="center"
            header-align="center"
            width="150">
          <template slot-scope="scope">
            <div>{{ scope.row.a_type | type }}</div>
          </template>
        </el-table-column>
        <el-table-column
            label="附件名称">
          <template slot-scope="scope">
            <div>
              <el-link :href="scope.row.link" target="_blank" type="primary"><i class="el-icon-paperclip"></i> {{ scope.row.name }}</el-link>
              </div>
          </template>
        </el-table-column>
        <el-table-column
            label="操作"
            align="center"
            header-align="center"
            width="100">
          <template slot-scope="scope">
            <el-button type="text" style="color: #6e7079"
                       v-if="permission.ship_attach_delete"
                       @click="deleteSA(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>

      </el-table>
      <div class="pagination">
        <el-pagination
            background
            :hide-on-single-page="true"
            :page-sizes="[20, 30, 40, 50, 100]"
            @current-change="currentChange"
            @size-change="sizeChange"
            layout="sizes, prev, pager, next, jumper, ->, total"
            :current-page="page"
            :total="total">
        </el-pagination>
      </div>

    </el-card>

    <!--    批量上传弹窗-->
    <el-dialog
        title="附件上传"
        :visible.sync="uploadVisible"
        :destroy-on-close="true"
        :close-on-click-modal="false"
        append-to-body
        width="500px"
    >
      <div>
        <el-upload
            v-loading="loading"
            style="margin-left: 50px;"
            ref="upload"
            name="file"
            :data="{'id': this.shipID, 'a_type': this.a_type}"
            :headers="headers"
            :on-success="onSuccess"
            :auto-upload="false"
            :before-upload="beforeUpload"
            multiple
            :limit="5"
            drag
            action="api/ml_ship_attachment/bulk_upload/">
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div class="el-upload__tip" slot="tip">
            <div style="margin-top: 15px">
              <el-radio v-model="a_type" label="SKU_LABEL">产品标签</el-radio>
              <el-radio v-model="a_type" label="BOX_LABEL">美客多箱唛</el-radio>
              <el-radio v-model="a_type" label="BOOK">美客多预约单</el-radio>
            </div>
            <div style="margin-top: 15px">
              <el-radio v-model="a_type" label="LOGI">物流商附件</el-radio>
              <el-radio v-model="a_type" label="OTHERS">其它附件</el-radio>
            </div>


          </div>

        </el-upload>

      </div>
      <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="uploadVisible = false">取 消</el-button>
          <el-button size="small" type="primary" :disabled="loading" @click="submitUpload">开始上传</el-button>
        </span>
    </el-dialog>

  </div>
</template>

<script>
import moment from "moment";

export default {
  name: "MelShipAttachment",
  props: ['shipID'],
  data(){
    return{
      permission: JSON.parse(window.sessionStorage.getItem('ml_permission')),
      attachments: [],
      loading: false,
      total: 0, // 总条数
      page: 1,  // 当前页
      size: 20,  // 页大小
      uploadVisible: false,
      a_type: 'SKU_LABEL',
      // 批量上传认证
      headers: {
        Authorization: window.localStorage.getItem('tokenStr'),
      },
    }
  },
  filters: {
    //时间日期格式化
    dateTime: function (value) {
      return moment(value).format("YYYY-MM-DD HH:mm");
    },
    //信息格式化
    type: function (value) {
      if (value==='SKU_LABEL') return '产品标签';
      if (value==='BOX_LABEL') return '美客多箱唛';
      if (value==='BOOK') return '美客多预约单';
      if (value==='LOGI') return '物流附件';
      if (value==='OTHERS') return '其它附件';
    },
  },
  mounted() {
    this.initAttachment()
  },

  methods:{
    // 删除附件
    deleteSA(id){
      this.$confirm('删除的附件无法恢复, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.postRequest('api/ml_ship_attachment/sa_delete/', {'id': id}).then(resp => {
          this.initAttachment();
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
      })
    },
    // 型号上传前的回调
    beforeUpload() {
      this.loading = true;
    },
    // 上传成功之后的回调
    onSuccess(response, file, fileList) {
      this.loading = false;
      this.$refs.upload.clearFiles();
      this.initAttachment();
      this.uploadVisible = false;
    },
    // 上传
    submitUpload() {
      this.$refs.upload.submit();
    },

    // 分页大小
    sizeChange(size) {
      this.page = 1;
      this.size = size;
      this.initOperateLogs();
    },
    // 页码
    currentChange(page) {
      this.page = page;
      this.initOperateLogs();
    },
    initAttachment(){
      let url = '/api/ml_ship_attachment/?page=' + this.page + '&page_size=' + this.size
      url += '&ship=' + this.shipID
      url += '&ordering=create_time'
      this.loading = true
      this.getRequest(url).then(resp => {
        this.loading = false
        if (resp.results) {
          this.attachments = resp.results;
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
</style>