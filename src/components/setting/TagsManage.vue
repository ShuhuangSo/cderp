<template>
  <div style="padding-left: 30px; padding-right: 30px">
    <el-tag
        style="margin-right: 5px;border: none"
        :key="tag.tag_name"
        :color="tag.color"
        v-for="tag in tags"
        closable
        size="medium"
        effect="dark"
        @close="deleteTag(tag.id)"
        :disable-transitions="false">
      {{ tag.tag_name }}
    </el-tag>
    <el-button class="button-new-tag" size="mini"
               @click="dialogVisible=true"
               style="margin-left: 10px">+ 添加标签
    </el-button>

    <el-dialog
        title="添加标签"
        :visible.sync="dialogVisible"
        width="400px">
      <div style="display: flex">
        <el-color-picker v-model="tag.color" :predefine="predefineColors" style="margin-right: 5px"></el-color-picker>
        <el-input v-model="tag.tag_name" maxlength="8" placeholder="请输入标签名称"></el-input>

      </div>
      <div>
        <p>预览</p>
        <el-tag :color="tag.color"
                v-if="tag.tag_name"
                size="medium" effect="dark" style="border: none">{{ tag.tag_name }}</el-tag>
      </div>
      <span slot="footer" class="dialog-footer">
    <el-button @click="dialogVisible = false">取 消</el-button>
    <el-button :disabled="tag.tag_name.trim()===''" type="primary" @click="createTag">确 定</el-button>
  </span>
    </el-dialog>
  </div>

</template>

<script>
export default {
  name: "TagsManage",
  props: ['tagType'],
  data() {
    return {
      tags: [],
      tag: {
        type: this.tagType,
        color: '#409EFF',
        tag_name: '',
      },
      predefineColors: [
        '#ff4500',
        '#ff8c00',
        '#ffd700',
        '#90ee90',
        '#00ced1',
        '#1e90ff',
        '#c71585',
        '#c71585',
        '#8526F1',
        '#E475EE'
      ],
      dialogVisible: false,
    }
  },
  mounted() {
    this.initTags();
  },
  methods: {
    //删除标签
    deleteTag(id){
      this.$confirm('是否确认删除该标签?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deleteRequest('api/settings/tags/'+ id).then(resp => {
          this.initTags();
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        });
      });
    },

    //创建标签
    createTag(){
      this.postRequest('api/settings/tags/create_tag/', this.tag).then(resp => {
        if (resp) {
          this.tag = {
            type: this.tagType,
            color: '#409EFF',
            tag_name: '',
          };
          this.initTags();
          this.dialogVisible = false;
        }
      })
    },

    //初始化产品标签
    initTags() {
      this.tags = []
      this.getRequest('api/settings/tags/?page_size=1000&type=' + this.tagType).then(resp => {
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