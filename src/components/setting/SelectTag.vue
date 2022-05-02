<template>
  <el-tabs type="border-card" v-model="obj.tag_type">
    <el-tab-pane :label="obj.tag_type | labelFormat" :name="obj.tag_type">
      <el-table
          :data="tags"
          size="mini"
          style="width: 100%;">
        <el-table-column
            label="标签">
          <template slot-scope="scope">
            <el-tag :color="scope.row.color"
                    size="mini" effect="dark" style="border: none">{{ scope.row.tag_name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
            width="80"
            label="选择">
          <template slot-scope="scope">
            <el-button v-if="scope.row.status" size="mini" type="text" @click="chooseTag(scope.row.id)">选择</el-button>
            <span v-if="!scope.row.status">已添加</span>
          </template>
        </el-table-column>

      </el-table>
      <el-pagination
          small
          background
          :hide-on-single-page="true"
          @current-change="currentChange"
          layout="prev, next,total"
          :total="total">
      </el-pagination>

    </el-tab-pane>
  </el-tabs>
</template>

<script>

export default {
  name: "SelectTag",
  props: ['obj'],
  data() {
    return {
      tagType: '',
      tags: [],
      page: 1,
      size: 10,
      total:0,
      productTag:{
        product: this.obj.id,
        tag: null
      }
    }
  },
  filters: {
    //格式化
    labelFormat: function (value) {
      if (value === 'PRODUCT') return '产品标签';
      if (value === 'ORDER') return '订单标签';
      if (value === 'PURCHASE') return '采购标签';
      if (value === 'CUSTOMER') return '客户标签';
    }
  },
  mounted() {
    this.initTags();
  },
  methods: {

    // 页码
    currentChange(page) {
      this.page = page;
      this.initTags();
    },

    //选择标签
    chooseTag(id){
      //产品标签
      if(this.obj.tag_type==='PRODUCT'){
        this.productTag.tag = id;
        this.postRequest('api/product_tags/', this.productTag).then(resp => {
          if (resp) {
            this.$emit('selectedTag', 'test')
          }
        })
      }
      //采购标签
      if(this.obj.tag_type==='PURCHASE'){
        let purchaseTag = {
          purchase_order: this.obj.id,
          tag: id
        }
        this.postRequest('api/purchase_order_tags/', purchaseTag).then(resp => {
          if (resp) {
            this.$emit('selectedTag', 'test')
          }
        })
      }

    },

    //初始化产品标签
    initTags() {
      this.tags = []
      this.getRequest('api/settings/tags/?type=' + this.obj.tag_type+'&page=' + this.page + '&page_size=' + this.size).then(resp => {
        if (resp.results) {
          this.tags = resp.results;
          this.total = resp.count
          this.tags.forEach(item=>{
            let t = this.obj.existTag.find(i=>{
              return i.tag === item.id
            })
            if (t) {
              item['status'] = false
            }else {
              item['status'] = true
            }
          })
        }
      })
    }
  }
}
</script>

<style scoped>

</style>