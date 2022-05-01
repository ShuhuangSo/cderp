<template>
  <el-tabs type="border-card" v-model="obj.tag_type" @tab-click="handleClick">
    <el-tab-pane :label="obj.tag_type | labelFormat" :name="obj.tag_type">
      <el-table
          :data="tags"
          size="mini"
          style="width: 100%;">
        <el-table-column
            label="标签"
            width="180">
          <template slot-scope="scope">
            <el-tag :color="scope.row.color"
                    size="medium" effect="dark" style="border: none">{{ scope.row.tag_name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
            label="选择">
        </el-table-column>
      </el-table>

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
    //初始化产品标签
    initTags() {
      this.tags = []
      this.getRequest('api/settings/tags/?page_size=1000&type=' + this.obj.tag_type).then(resp => {
        if (resp.results) {
          this.tags = resp.results;
        }
      })
    }
  }
}
</script>

<style scoped>

</style>