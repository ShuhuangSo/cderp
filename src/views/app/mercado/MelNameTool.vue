/*
SKU命名工具
*/
<template>
  <div style="display: flex; justify-content: center">
    <div class="pContainer">
      <el-card shadow="hover" style="padding-bottom: 20px">
        <div slot="header" class="clearfix">
          <span>SKU生成工具</span>
        </div>

        <div>
          <el-form ref="shipForm" :rules="rules" :model="ship" label-width="180px">
            <el-form-item label="产品名称前缀">
              <el-input
                  style="width: 300px;"
                  placeholder="请输入"
                  v-model="pre_name">
              </el-input>
            </el-form-item>

            <el-form-item label="SKU编号前缀">
              <el-input
                  style="width: 300px;"
                  placeholder="请输入"
                  v-model="pre_code">
              </el-input>
            </el-form-item>

            <el-form-item label="SKU起始编号">
              <el-input
                  style="width: 300px;"
                  placeholder="请输入"
                  v-model="start_num">
              </el-input>
            </el-form-item>

            <el-form-item label="产品型号">
              <el-input
                  style="width: 300px;"
                  type="textarea"
                  :rows="10"
                  placeholder="请输入型号,多个型号换行录入"
                  v-model="model_group">
              </el-input>
            </el-form-item>

            <el-form-item label="颜色(图案)">
              <el-input
                  style="width: 300px;"
                  type="textarea"
                  :rows="10"
                  placeholder="请输入颜色(图案),多个请换行录入"
                  v-model="color_group">
              </el-input>
            </el-form-item>

            <el-form-item label="主排序">
              <el-radio-group v-model="main_order">
                <el-radio label="1">产品型号</el-radio>
                <el-radio label="2">颜色(图案)</el-radio>
              </el-radio-group>

            </el-form-item>
            <el-form-item label="产品名称追加SKU编码" >
              <el-switch v-model="is_add_sku"></el-switch>
            </el-form-item>

          </el-form>
          <el-button type="primary"
                     style="width: 200px;margin-left: 20px"
                     @click="createList">立即生成
          </el-button>
        </div>

        <div style="margin-top: 50px" v-if="p_list.length">
          <el-button type="success"
                     style="width: 100px;margin-left: 20px"
                     @click="copyList">复制到 Excel
          </el-button>
          <el-table
              :header-cell-style="{background:'#eef1f6'}"
              :data="p_list"
              border
              size="mini"
              style="width: 98%; margin: 10px">
            <el-table-column
                label="序号"
                type="index"
                align="center"
                header-align="center"
                width="80">
            </el-table-column>
            <el-table-column
                label="SKU编码"
                width="200">
              <template slot-scope="scope">
                <div>{{ scope.row.sku }}</div>
              </template>
            </el-table-column>

            <el-table-column
                label="产品名称">
              <template slot-scope="scope">
                <div>{{ scope.row.name }}</div>
              </template>
            </el-table-column>

          </el-table>
        </div>

      </el-card>
    </div>


  </div>
</template>

<script>
export default {
  name: "MelNameTool",
  data(){
    return{
      pre_name: '定制-外4角透明', // 产品名称前缀
      pre_code: 'B', // 编号前缀
      start_num: '10002', // SKU起始编号
      main_order: '1', // 主排序
      model_group: '三星A12\n' +
          '三星A13\n' +
          '三星A14\n' +
          '三星A15\n' +
          '三星A16', // 产品型号列表
      color_group: '红色\n' +
          '蓝色\n' +
          '绿色\n' +
          '黑色\n' +
          '白色', // 颜色(图案)列表
      is_add_sku: false, // 产品名称追加SKU编码
      p_list: []
    }
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
    },
    //复制列表
    copyList(){
      let copy_value = ''
      this.p_list.forEach(item=>{
        copy_value = copy_value + item.sku + '\t' + item.name + '\n'
      })

      this.copyText(copy_value)
      this.$message.success('已复制！')
    },
    createList(){
      this.p_list = []
      this.pre_name = this.pre_name.trim()
      this.pre_code = this.pre_code.trim()

      let model_list = this.model_group.split('\n')
      let color_list = this.color_group.split('\n')

      // 生成数据表
      let n = 0
      if(this.main_order === '1'){
        model_list.forEach(m=>{
          color_list.forEach(c=>{
            let num = parseInt(this.start_num) + n
            let sku = `${this.pre_code}${num}`
            this.p_list.push({
              'sku': sku,
              'name': this.is_add_sku?`${this.pre_name}-${m}-${c}-${sku}`:`${this.pre_name}-${m}-${c}`
            })
            n += 1
          })
        })
      } else {
        color_list.forEach(c=>{
          model_list.forEach(m=>{
            let num = parseInt(this.start_num) + n
            let sku = `${this.pre_code}${num}`
            this.p_list.push({
              'sku': sku,
              'name': this.is_add_sku?`${this.pre_name}-${m}-${c}-${sku}`:`${this.pre_name}-${m}-${c}`
            })
            n += 1
          })
        })
      }


    }
  }
}
</script>

<style scoped>
.pContainer {
  margin-top: 10px;
  width: 1200px;
}
</style>