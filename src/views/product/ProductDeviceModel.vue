<template>
  <div class="mainList">
    <div class="operate">
      <div>
        <el-input size="small" placeholder="请输入型号/备注搜索"
                  clearable
                  @clear="clearSearchValue"
                  @keyup.enter.native="doSearch"
                  tooltip-effect="dark"
                  v-model="searchValue"
                  style="width: 350px; margin-right: 5px">
          <el-button slot="append" icon="el-icon-search" @click="doSearch">搜索</el-button>
        </el-input>
        <el-badge :value="cpDeviceModels.length" :hidden="cpDeviceModels.length===0">
          <el-button type="" icon="el-icon-attract"
                     @click="bandModels2">兼容对比
          </el-button>
        </el-badge>

      </div>
      <div>
        <el-button type="success" icon="el-icon-plus"
                   style="margin-right: 10px"
                   @click="createDevice">新增型号
        </el-button>
        <el-dropdown @command="uploadVisible = true">
          <el-button size="small" type="">
            导入/导出<i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>批量导入</el-dropdown-item>
            <el-dropdown-item disabled>批量导出</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>

    <div style="margin-top: 5px">
      <el-table
          ref="deviceTable"
          :data="deviceModels"
          @filter-change="filterChange"
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
            width="150">
          <template slot-scope="scope">
            <el-image
                style="width: 100px; height: 133px"
                :src="scope.row.image"
                :preview-src-list="[scope.row.image]"
                fit="fill">
            </el-image>
          </template>
        </el-table-column>
        <el-table-column
            :filter-multiple="false"
            :filters="brandFilters"
            column-key="filterBrand"
            label="品牌型号"
            width="230">
          <template slot-scope="scope">
            <div class="m_name">{{scope.row.brand}}</div>
            <el-tooltip effect="dark" :content="scope.row.create_time | datetime" placement="top">
            <div class="m_name">
              {{scope.row.model}}
              <el-tag v-if="scope.row.is_new" size="mini" effect="dark" type="danger">新款</el-tag></div>
            </el-tooltip>
          </template>
        </el-table-column>

        <el-table-column
            label="参数"
            width="350">
          <template slot-scope="scope">
            <div><span v-if="scope.row.announced" class="tt">Announced: </span>{{scope.row.announced}}</div>
            <div><span v-if="scope.row.status" class="tt">Status: </span>{{scope.row.status}}</div>
            <div><span v-if="scope.row.dimensions" class="tt">Size: </span>{{scope.row.dimensions}}</div>
            <div><span v-if="scope.row.weight" class="tt">Weight: </span>{{scope.row.weight}}</div>
            <div><span v-if="scope.row.detail_model" class="tt">Models: </span>{{scope.row.detail_model}}</div>
          </template>
        </el-table-column>

        <el-table-column
            label="兼容型号">
          <template slot-scope="scope">
            <el-tag
                v-for="item in scope.row.cp_model"
                :key="item.model"
                type="info"
                size="mini"
                effect="dark"
                style="margin-right: 5px">
              {{ item.model }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
            prop="note"
            label="备注">
        </el-table-column>
        <el-table-column
            label="操作"
            width="100"
        >
          <template slot-scope="scope">

            <el-dropdown @command="handleOp">
              <el-button type="text">
                操作<i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :command="{'name':'update',obj:scope.row}">更新参数</el-dropdown-item>
                <el-dropdown-item :command="{'name':'gsm',obj:scope.row}">GSM详情</el-dropdown-item>
                <el-dropdown-item :command="{'name':'edit',obj:scope.row}">修改</el-dropdown-item>
                <el-dropdown-item :command="{'name':'band',obj:scope.row}">加入对比</el-dropdown-item>
                <el-dropdown-item :disabled="scope.row.cp_model.length===0" :command="{'name':'unband',obj:scope.row}">解绑</el-dropdown-item>
                <el-dropdown-item :command="{'name':'delete',obj:scope.row}">删除</el-dropdown-item>
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

    <!--    新建型号弹窗-->
    <el-dialog
        :title="device.id? '修改型号':'增加型号'"
        :destroy-on-close="true"
        :close-on-click-modal="false"
        :before-close="cancel"
        :visible.sync="createVisible"
        width="500">
      <el-form ref="modelForm" :rules="rules" :model="device" label-width="100px">

        <el-form-item required label="品牌" prop="brand">
          <el-select v-model="device.brand" placeholder="请选择" class="inputwidth">
            <el-option
                v-for="item in brandOptions"
                :key="item.brand_name"
                :label="item.brand_name"
                :value="item.brand_name">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item required prop="model" label="型号">
          <el-input
              class="inputwidth"
              placeholder="请输入型号"
              v-model="device.model">
          </el-input>
        </el-form-item>

        <el-form-item label="备注">
          <el-input
              class="inputwidth"
              type="textarea"
              :rows="2"
              placeholder="请输入备注"
              v-model="device.note">
          </el-input>
        </el-form-item>

      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="cancel">取 消</el-button>
    <el-button v-if="!device.id" type="primary" @click="submitForm">确 定</el-button>
        <el-button v-if="device.id" type="primary" @click="editForm">保 存</el-button>

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
            action="api/device_models/bulk_upload/">
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

<!--    加入对比弹框-->
    <el-dialog
        title="兼容对比"
        :before-close="cancelBand"
        :close-on-click-modal="false"
        :visible.sync="cp2Visible"
        width="90%"
    >
      <el-table
          :data="cpDeviceModels"
          :header-cell-style="{background:'#fafafa'}"
          style="width: 100%">
        <el-table-column
            label="图片"
            align="center"
            header-align="center"
            width="150">
          <template slot-scope="scope">
            <el-image
                style="width: 100px; height: 133px"
                :src="scope.row.image"
                :preview-src-list="[scope.row.image]"
                fit="fill">
            </el-image>
          </template>
        </el-table-column>
        <el-table-column
            :filter-multiple="false"
            :filters="brandFilters"
            column-key="filterBrand"
            label="品牌型号"
            width="230">
          <template slot-scope="scope">
            <div class="m_name">{{scope.row.brand}}</div>
            <el-tooltip effect="dark" :content="scope.row.create_time | datetime" placement="top">
              <div class="m_name">
                {{scope.row.model}}
                <el-tag v-if="scope.row.is_new" size="mini" effect="dark" type="danger">新款</el-tag></div>
            </el-tooltip>
          </template>
        </el-table-column>

        <el-table-column
            label="参数"
            width="310">
          <template slot-scope="scope">
            <div><span v-if="scope.row.announced" class="tt">Announced: </span>{{scope.row.announced}}</div>
            <div><span v-if="scope.row.status" class="tt">Status: </span>{{scope.row.status}}</div>
            <div><span v-if="scope.row.dimensions" class="tt">Size: </span>{{scope.row.dimensions}}</div>
            <div><span v-if="scope.row.weight" class="tt">Weight: </span>{{scope.row.weight}}</div>
            <div><span v-if="scope.row.detail_model" class="tt">Models: </span>{{scope.row.detail_model}}</div>
          </template>
        </el-table-column>

        <el-table-column
            label="兼容型号">
          <template slot-scope="scope">
            <el-tag
                v-for="item in scope.row.cp_model"
                :key="item.model"
                type="info"
                size="mini"
                effect="dark"
                style="margin-right: 5px">
              {{ item.model }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
            align="center"
            header-align="center"
            label="操作"
            width="100"
        >
          <template slot-scope="scope">
            <el-button @click="removeCP(scope.row.id)" type="text">
              移除对比
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="cancelBand">取 消</el-button>
          <el-button :disabled="cpDeviceModels.length<2" size="small" type="primary" @click="band">绑 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import moment from "moment";

export default {
  name: "ProductDeviceModel",
  data() {
    return {
      // 批量上传认证
      headers: {
        Authorization: window.localStorage.getItem('tokenStr'),
      },
      deviceModels: [],
      cpDeviceModels: [],
      total: 0, // 总条数
      page: 1,  // 当前页
      size: 20,  // 页大小
      searchValue: '',
      uploadVisible: false,
      loading: false,
      modelLoading: false,
      createVisible: false,
      cp2Visible: false,
      cp_ids: [],
      multipleSelection: [], // 选中行
      brandFilters: [],  // 品牌过滤项
      brandTag: '', // 品牌筛选
      device: {
        id: null,
        brand: '',
        type: '',
        model: '',
        note: '',
        cp_id: null,
        dimensions: '',
        weight: '',
        link: '',
        announced: '',
        image: '',
        status: '',
        detail_model: ''
      },
      brandOptions: [],
      rules: {
        brand: [
          {required: true, message: '请选择品牌', trigger: 'blur'},
        ],
        model: [
          {required: true, message: '请输入型号', trigger: 'blur'},
        ],
      },
    }
  },
  filters: {
    //时间日期格式化
    datetime: function (value) {
      return '更新时间：' + moment(value).format("YYYY-MM-DD HH:mm:ss");
    },
  },
  mounted() {
    this.initDeviceModels();
    this.initDeviceBrands();
  },
  methods: {
    //移除对比
    removeCP(id){
      let index = this.cpDeviceModels.findIndex(item => {
        return item.id === id
      });
      this.cpDeviceModels.splice(index, 1)
    },

    //选行
    handleSelectionChange(val) {
      this.multipleSelection = val;

    },

    handleOp(command){
      //跳转GSM页面
      if (command.name === 'gsm') {
        window.open(command.obj.link, '_blank');
      }
      //更新信息
      if (command.name === 'update') {
        this.$confirm('是否更新参数信息？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$message.info('正在更新，请稍候')
          this.getRequest('/api/device_models/'+ command.obj.id +'/get_model_info/').then(resp => {
            if (resp){
              this.initDeviceModels();
            }
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消'
          });
        });
      }
      //解绑
      if (command.name === 'unband') {
        this.$confirm('是否将该型号解除绑定？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.postRequest('/api/device_models/cp_unband/', {'id': command.obj.id}).then(resp => {
            this.initDeviceModels();
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消'
          });
        });
      }
      //绑定
      if (command.name === 'band') {
        this.cpDeviceModels.push(command.obj)
        this.$message.success('型号已加入')
      }
      if (command.name === 'edit') {
        this.device = Object.assign({},command.obj)
        this.createVisible = true;
      }
      if (command.name === 'delete') {

        this.$confirm('是否删除型号？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.deleteRequest('api/device_models/'+ command.obj.id+'/').then(resp => {
            this.initDeviceModels();
            this.createVisible = false;
            this.loading = false;
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消'
          });
        });
      }
    },

    // 监听筛选项的变化
    filterChange(filterObj) {
      // 监听品牌字段
      if (filterObj.filterBrand) {
        this.brandTag = filterObj.filterBrand[0];
      }
      this.initDeviceModels();
    },

    band(){
      this.$confirm('是否绑定型号？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.submitBand()
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        });
      });
    },


    //提交绑定
    submitBand(){
      this.cpDeviceModels.forEach(item=>{
        this.cp_ids.push(item.id)
      })
      let ids = {'ids': this.cp_ids}
      let url = '/api/device_models/cp_band/'

      this.postRequest(url, ids).then(resp => {
        if (resp) {
          this.initDeviceModels();
          this.cp2Visible = false;
          this.cp_ids = []
          this.cpDeviceModels = []
        }
      })
    },

    // 打开型号对比
    bandModels2(){
      this.cp2Visible = true;

      if (this.cpDeviceModels.length===0){
        this.multipleSelection.forEach(item=>{
          this.cpDeviceModels.push(item)
        })
      } else {
        let existItems = JSON.parse(JSON.stringify(this.cpDeviceModels))
        this.multipleSelection.forEach(item=>{
          let ex = false
          existItems.forEach(i=>{
            if (i.id === item.id) {
              ex = true
            }
          })
          if (!ex) this.cpDeviceModels.push(item)
        })
      }


    },

    //取消绑定
    cancelBand(){
      this.cp_ids=[]
      this.$refs.deviceTable.clearSelection();
      this.cp2Visible = false;
    },

    // 型号上传前的回调
    beforeUpload() {
      this.loading = true;
    },
    // 上传成功之后的回调
    onSuccess(response, file, fileList) {
      this.loading = false;
      this.$refs.upload.clearFiles();
      this.initDeviceModels();
      this.uploadVisible = false;
    },
    // 上传
    submitUpload() {
      this.$refs.upload.submit();
    },

    //修改型号
    editForm(){
      this.$confirm('是否修改型号？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$refs.modelForm.validate((valid) => {
          if (valid) {
            this.loading = true;
            this.putRequest('api/device_models/'+ this.device.id+'/', this.device).then(resp => {
              if (resp) {
                this.initDeviceModels();
                this.createVisible = false;
                this.$message({
                  type: 'success',
                  message: '成功修改'
                });
              }
              this.loading = false;
            })
          } else {
            return false;
          }
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        });
      });
    },

    //创建型号
    submitForm(){
      this.$confirm('是否创建型号？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$refs.modelForm.validate((valid) => {
          if (valid) {
            this.loading = true;
            this.postRequest('api/device_models/', this.device).then(resp => {
              if (resp) {
                this.initDeviceModels();
                this.createVisible = false;
                this.$message({
                  type: 'success',
                  message: '成功创建'
                });
              }
              this.loading = false;
            })
          } else {
            return false;
          }
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        });
      });
    },

    cancel(){
      this.createVisible = false
      this.device = {
        brand: '',
        type: '',
        model: '',
        note: '',
        cp_id: null,
      }
    },

    //新增型号
    createDevice() {
      this.device = {
        brand: '',
        type: '',
        model: '',
        note: '',
        cp_id: null,
      }
      this.createVisible = true;
    },
    // 搜索
    doSearch() {
      this.page = 1;
      this.brandTag = ''
      this.$refs.deviceTable.clearFilter();
      this.initDeviceModels();
    },
    // 重置搜索内容
    clearSearchValue() {
      this.searchValue = '';
      this.brandTag = ''
      this.$refs.deviceTable.clearFilter();
      this.initDeviceModels();
    },

    // 分页大小
    sizeChange(size) {
      this.size = size;
      this.initDeviceModels();
    },
    // 页码
    currentChange(page) {
      this.page = page;
      this.initDeviceModels();
    },

    //初始化手机品牌
    initDeviceBrands() {
      let url = '/api/device_brands/'
      this.getRequest(url).then(resp => {
        if (resp) {
          this.brandOptions = resp;
          this.brandOptions.forEach(item=>{
            this.brandFilters.push({'text':item.brand_name,'value':item.brand_name})
          })
        }
      })
    },

    //初始化兼容型号
    initDeviceModels() {
      let url = '/api/device_models/?page=' + this.page + '&page_size=' + this.size
      if (this.searchValue) {
        url += '&search=' + this.searchValue;
      }
      if (this.brandTag) {
        url += '&brand=' + this.brandTag;
      }
      this.loading = true
      this.getRequest(url).then(resp => {
        if (resp.results) {
          this.deviceModels = resp.results;
          this.total = resp.count;
          this.loading = false
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
.inputwidth{
  width: 90%;
}
.tt{
  font-weight: bold;
}
.m_name{
  font-weight: bold;
  color: teal;
}
/deep/ .el-transfer-panel{
  width: 300px !important;
}
</style>