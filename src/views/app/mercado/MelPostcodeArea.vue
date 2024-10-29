<template>
  <div>
    <div style="margin: 10px;display: flex; justify-content: space-between">
      <div>
        <el-input size="medium" placeholder="邮编"
                  clearable
                  @clear="clearSearchValue"
                  @keyup.enter.native="doSearch"
                  v-model="postcode"
                  style="width: 300px; margin-right: 5px">
          <el-button slot="append" icon="el-icon-search" @click="doSearch">查询</el-button>
        </el-input>
        <span style="font-size: 14px; color: #8a8a8a; margin-left: 15px">计算运费</span>
        <el-switch
            style="margin-left: 5px"
            size="medium"
            @change="doSearch"
            v-model="postage"
        >
        </el-switch>
        <span v-if="postage" style="font-size: 14px; color: #8a8a8a; margin-left: 15px">重量g</span>
        <el-input-number v-model="weight"
                         v-if="postage"
                         style="margin-left: 5px"
                         size="mini"
                         controls-position="right" :min="1"></el-input-number>
      </div>
      <div>
        <el-button @click="uploadVisible=true">批量查询分区</el-button>
      </div>

    </div>
    <div v-if="data_list.length">
      <el-table
          :header-cell-style="{background:'#eef1f6'}"
          :data="data_list"
          size="medium"
          v-loading="loading"
          style="width: 98%; margin: 10px">
        <el-table-column
            prop="country"
            label="国家"
            align="center"
            header-align="center"
            width="60">
        </el-table-column>
        <el-table-column
            prop="carrier_name"
            label="物流名称"
            align="center"
            header-align="center"
            width="200">
        </el-table-column>
        <el-table-column
            align="center"
            header-align="center"
            width="100"
            label="邮编">
          <template slot-scope="scope">
            {{ scope.row.postcode}}
          </template>
        </el-table-column>
        <el-table-column
            align="center"
            header-align="center"
            width="100"
            label="分区">
          <template slot-scope="scope">
            {{ scope.row.area}}
          </template>
        </el-table-column>
        <el-table-column
            v-if="postage"
            align="center"
            header-align="center"
            width="100"
            label="运费">
          <template slot-scope="scope">
            {{ scope.row.cost | rmb_currency}}
          </template>
        </el-table-column>
        <el-table-column
            align="left"
            header-align="left"
            label="服务">
          <template slot-scope="scope">
              <el-tag v-if="scope.row.is_avaiable" type="success">可送达</el-tag>
              <el-tag v-if="!scope.row.is_avaiable" type="danger">不可送达</el-tag>
              <span
                  style="color: #99a9bf; margin-left: 20px; font-size: 12px"
                  v-if="scope.row.note">{{scope.row.note}} {{scope.row.update_time | dateT}}</span>
          </template>
        </el-table-column>
        <el-table-column
            align="center"
            header-align="center"
            width="100">
          <template slot-scope="scope">
            <el-button style="color: #99a9bf;"
                       @click="changeTag(scope.row)"
                       type="text">修改服务</el-button>
          </template>
        </el-table-column>

      </el-table>
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
            :data="{'carrier_code': this.carrier, 'is_remote': this.is_remote}"
            :on-success="onSuccess"
            :auto-upload="false"
            :before-upload="beforeUpload"
            accept=".xlsx"
            :limit="1"
            drag
            action="api/platform_category/bulk_get_postcode_area/">
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div class="el-upload__tip" slot="tip">只能上传excel文件,
            <el-link href="/media/template/bulk_get_postcode_upload_template.xlsx" target="_blank">模板下载</el-link>
            <div>
              请选择要查询分区的渠道：
              <el-select v-model="carrier"
                         style="width: 100px;margin-left: 5px"
                         placeholder="请选择筛选项">
                <el-option
                    v-for="item in carrier_group"
                    :key="item.name"
                    :label="item.name"
                    :value="item.value">
                </el-option>
              </el-select>
            </div>
            <div>
              仅筛选3,4偏远分区
              <el-switch
                  v-model="is_remote"
                  active-color="#13ce66"
                  inactive-color="#ff4949">
              </el-switch>
            </div>
          </div>


        </el-upload>

      </div>
      <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="uploadVisible = false">取 消</el-button>
          <el-button size="small" type="primary" :disabled="loading" @click="submitUpload">开始导入</el-button>
        </span>
    </el-dialog>

  </div>
</template>

<script>
import moment from "moment";

export default {
  name: "MelPostcodeArea",
  data(){
    return{
      postcode: '',
      data_list: [],
      loading: false,
      postage: false,
      weight: 100,
      uploadVisible: false,
      // 批量上传认证
      headers: {
        Authorization: window.localStorage.getItem('tokenStr'),
      },
      carrier: 'UBI_AUS_POST',
      is_remote: true, //仅查看偏远分区
      carrier_group: [
        {
          name: '澳邮',
          value: 'UBI_AUS_POST'
        },
        {
          name: 'Aramex',
          value: 'UBI_ARAMEX'
        }
      ],
    }
  },
  filters:{
    //时间日期格式化
    dateT: function (value) {
      return moment(value).format("YYYY-MM-DD HH:mm");
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
  },
  methods:{
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
      this.uploadVisible = false;
      if (response.status === 'success') {
        window.open(response.url, '_blank')
        this.$message.success(response.msg)
      }

    },
    // 上传
    submitUpload() {
      this.$refs.upload.submit();
    },
    clearSearchValue(){
      this.postcode = ''
      this.data_list = []
    },
    //重新标记
    changeTag(row){
      let msg = ''
      if (row.is_avaiable) {
        msg = '是否要将服务修改为不可达?'
      } else {
        msg = '是否要将服务修改为可达?'
      }
      this.$confirm(msg, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        let url = 'api/platform_category/change_postcode_tag/'
        this.postRequest(url, row).then(resp => {
          this.loading = false
          if (resp.status === 'success') {
            this.doSearch()
          }
        })
      })
    },
    doSearch(){
      if (this.postcode) {
        this.loading = true
        let url = 'api/platform_category/get_postcode_area/'
        this.postRequest(url, {'postcode': this.postcode, 'postage': this.postage, 'weight': this.weight}).then(resp => {
          this.loading = false
          if (resp) {
            this.data_list = resp
          }
        })
      }
    }
  }
}
</script>

<style scoped>

</style>