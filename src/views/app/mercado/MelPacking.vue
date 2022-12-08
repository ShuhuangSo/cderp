/*
美客多FBM--包材管理
*/
<template>
  <div>
    <el-button type="success" icon="el-icon-plus"
               style="margin-right: 10px; margin-bottom: 5px"
               @click="createPack">增加包材
    </el-button>

    <el-table
        ref="packTable"
        :data="packs"
        :header-cell-style="{background:'#fafafa'}"
        v-loading="loading"
        style="width: 100%">

      <el-table-column
          label="名称"
          align="center"
          header-align="center">
        <template slot-scope="scope">
          <div>{{ scope.row.name }}</div>
        </template>
      </el-table-column>

      <el-table-column
          label="尺寸"
          align="center"
          header-align="center">
        <template slot-scope="scope">
          <div>{{ scope.row.size }}</div>
        </template>
      </el-table-column>

      <el-table-column
          label="重量g"
          align="center"
          header-align="center">
        <template slot-scope="scope">
          <div>{{ scope.row.weight }}</div>
        </template>
      </el-table-column>

      <el-table-column
          label="创建时间"
          align="center"
          header-align="center"
          width="180">
        <template slot-scope="scope">
          <div>{{ scope.row.create_time | date }}</div>
        </template>
      </el-table-column>

      <el-table-column
          label="操作"
          align="center"
          header-align="center">
        <template slot-scope="scope">
          <el-button
              @click="editPack(scope.row)"
              type="" size="mini" icon="el-icon-edit" circle></el-button>
          <el-button
              @click="removePack(scope.row.id)"
              type="" size="mini" icon="el-icon-delete" circle></el-button>
        </template>
      </el-table-column>

    </el-table>

    <!--    包材编辑弹窗-->
    <el-dialog
        title="增加包材"
        :visible.sync="addVisible"
        :destroy-on-close="true"
        :close-on-click-modal="false"
        width="500px"
        append-to-body
    >
      包材名称：
      <el-input class="ff" v-model="pack.name" placeholder="请输入内容"></el-input>
      尺寸：
      <el-input class="ff" v-model="pack.size" placeholder="请输入内容"></el-input>
      重量g：
      <el-input-number
          style="width: 100%;margin-bottom: 10px"
          v-model="pack.weight"
          controls-position="right"
          :min="0"></el-input-number>
      备注：
      <el-input class="ff" type="textarea" v-model="pack.note" placeholder="请输入内容"></el-input>

      <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="addVisible = false">关 闭</el-button>
          <el-button
              :disabled="!pack.name || !pack.size"
              type="primary" size="small" @click="confirmPack">确 认</el-button>
        </span>
    </el-dialog>
  </div>
</template>

<script>
import moment from "moment";

export default {
  name: "MelPacking",
  data(){
    return{
      packs: [],
      loading: false,
      addVisible: false,
      pack:{
        name: '',
        size: '',
        weight: null,
        note: null,
      },
      op_status: ''
    }
  },
  filters: {
    //时间日期格式化
    date: function (value) {
      return moment(value).format("YYYY-MM-DD");
    },
  },
  mounted() {
    this.initPacks()
  },
  methods:{
    removePack(id){
      this.$confirm('删除的包材无法恢复, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        //调用删除产品
        this.deleteRequest('api/ml_packing/' + id + '/').then(resp => {
          this.initPacks();
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
      })
    },
    createPack(){
      this.op_status = ''
      this.pack.name = ''
      this.pack.size = ''
      this.pack.weight = null
      this.pack.note = null
      this.addVisible = true
    },
    // 编辑
    editPack(row){
      this.pack = Object.assign({},row )
      this.addVisible = true
      this.op_status = 'EDIT'
    },
    //确认提交
    confirmPack(){
      if (this.op_status === 'EDIT'){
        this.loading = true;
        this.putRequest('api/ml_packing/' + this.pack.id + '/', this.pack).then(resp => {
              this.loading = false;
              if (resp) {
                this.initPacks()
                this.addVisible = false
              }
            }
        )
      } else {
        this.loading = true;
        this.postRequest('api/ml_packing/', this.pack).then(resp => {
              this.loading = false;
              if (resp) {
                this.initPacks()
                this.addVisible = false
              }
            }
        )
      }

    },
    initPacks(){
      this.loading = true;
      // 获取包材数据
      this.getRequest('api/ml_packing/?page_size=1000').then(resp => {
        this.loading = false;
        if (resp) {
          this.packs = resp.results
        }
      })
    }
  }
}
</script>

<style scoped>
.ff{
  margin-bottom: 10px;
}
</style>