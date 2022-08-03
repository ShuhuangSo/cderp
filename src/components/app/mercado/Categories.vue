<template>
  <div style="display: flex">

    <div class="categ">
      <el-tree v-loading="cate_loading"
               element-loading-text="类目加载中"
               element-loading-spinner="el-icon-loading"
               :load="loadNode"
               empty-text=" "
               node-key="categ_id"
               ref="tree"
               lazy
               @node-click="handleNodeClick"
               :default-expanded-keys="[0]"
               :props="defaultProps">
      <span
          style="font-size: 14px"
          slot-scope="{ data }"
      >
       <span>{{data.name}} <span>{{data.t_name}}</span></span>
   </span>
      </el-tree>
    </div>
    <div style="width: 100%; margin-left: 5px">
      <div style="font-size: 14px; color: teal">
        <el-link v-if="path_from_root" @click="backToSite" style="margin-bottom: 4px" type="info">返回整站</el-link>
        当前目录：{{this.path_from_root?this.path_from_root: '整站'}}</div>
      <el-table
          ref="keywordsTable"
          :data="keywords"
          :header-cell-style="{background:'#fafafa'}"
          v-loading="loading"
          style="width: 100%">
        <el-table-column
            label="排名"
            prop="rank"
            align="center"
            header-align="center"
            width="100">
        </el-table-column>
        <el-table-column
            label="热搜关键词">
          <template slot-scope="scope">
            <div>{{scope.row.keyword}}
              <span v-if="scope.row.status==='UP'"><el-tag size="mini" type="success"><i class="el-icon-top"></i>上升{{scope.row.rank_changed}}位</el-tag></span>
              <span v-if="scope.row.status==='DOWN'"><el-tag size="mini" type="danger"><i class="el-icon-bottom"></i>下降{{scope.row.rank_changed}}位</el-tag></span>
              <span v-if="scope.row.status==='NEW'"><el-tag size="mini">新</el-tag></span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
            label="翻译"
            prop="t_keyword">
        </el-table-column>
        <el-table-column
            label="链接"
            align="center"
            header-align="center"
            width="120">
          <template slot-scope="scope">
            <el-link :underline="false"><i class="el-icon-link" @click="goListing(scope.row.url)"></i></el-link>
          </template>
        </el-table-column>

      </el-table>
    </div>


  </div>
</template>

<script>
export default {
  name: "Categories",
  props: ['siteID'],
  data() {
    return {
      path_from_root: null,
      keywords: null,
      loading: false,
      cate_loading: false,
      defaultProps: {
        children: 'children',
        label: 'name',
        isLeaf: 'has_children'
      }
    }
  },
  mounted() {
    this.getKeywords(this.siteID)
  },
  methods:{
    backToSite(){
      this.path_from_root = null
      this.getKeywords(this.siteID)
    },
    handleNodeClick(data){
      this.path_from_root = data.path_from_root
      this.getKeywords(data.categ_id)
    },
    goListing(url){
      window.open(url, '_blank');
    },
    loadNode(node, resolve) {
      //node.level判断当前是不是第一级
      if (node.level === 0) {
        //如果当前为第一级  则通过参数0请求第一层的数据
        let url = 'api/med_categories/get_categories/?father_id=0&site_id=' + this.siteID
        this.cate_loading = true
        this.getRequest(url).then(resp => {
          this.cate_loading = false
          if (resp.length > 0) {
            //如果不是空的  定义一个叫dataList的变量接收请求的数据是一个对象数组
            let dataList = resp;
            //然后循环遍历数据  将每一条的leaf字段赋为false 这样前面就会出现可以点击的那个小标识
            dataList = dataList.map(item =>{
              item.has_children = !item.has_children;
              return item
            })
            //然后将处理好的数据扔给resolve函数   数据就会自动渲染到树形上
            return resolve(dataList)
          }else{
            //如果数据是空的  直接扔空数组给resolve
            return resolve([])
          }
        })
      }else{
        //如果当前不是最顶级  则node.data拿到被点击的节点本身  通过节点di请求这条数据的子集
        let url = 'api/med_categories/get_categories/?father_id='+ node.data.categ_id +'&site_id=' + this.siteID
        this.getRequest(url).then(resp => {
          if (resp.length > 0) {
            //如果不是空的  定义一个叫dataList的变量接收请求的数据是一个对象数组
            let dataList = resp;
            //然后循环遍历数据  将每一条的leaf字段赋为false 这样前面就会出现可以点击的那个小标识
            dataList = dataList.map(item =>{
              item.has_children = !item.has_children;
              return item
            })
            //然后将处理好的数据扔给resolve函数   数据就会自动渲染到树形上
            return resolve(dataList)
          }else{
            //如果数据是空的  直接扔空数组给resolve
            return resolve([])
          }
        })
      }
    },
    getKeywords(categ_id){
      let url = 'api/med_categories/get_trends/?categ_id=' + categ_id
      if (this.siteID) {
        url += '&site_id=' + this.siteID;
      }
      this.loading = true
      this.getRequest(url).then(resp => {
        this.loading = false
        if (resp) {
          this.keywords = resp;
        }
      })
    }
  }
}
</script>

<style scoped>
.categ{
  width: 500px;
  height:900px;
  overflow-y:auto
}
</style>