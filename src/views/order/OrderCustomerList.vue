<template>
  <div class="customerList">

    <div class="operate">
      <div>
        <el-input size="small" placeholder="请输入客户名称/编号搜索"
                  clearable
                  @clear="clearSearchValue"
                  @keyup.enter.native="doSearch"
                  tooltip-effect="dark"
                  v-model="searchValue"
                  style="width: 350px; margin-right: 5px">
          <el-button slot="append" icon="el-icon-search" @click="doSearch">搜索</el-button>
        </el-input>
      </div>
      <div>
        <el-button type="success" icon="el-icon-plus" @click="createCustomer">新增客户</el-button>
      </div>
    </div>

    <!--    供应商列表-->
    <div style="margin-top: 5px">
      <el-table
          ref="customerTable"
          :data="customers"
          @filter-change="filterChange"
          :header-cell-style="{background:'#fafafa'}"
          v-loading="loading"
          style="width: 100%">
        <el-table-column
            prop="company_name"
            label="公司名称"
            min-width="250">
        </el-table-column>
        <el-table-column
            prop="customer_code"
            label="客户编号"
            width="180">
        </el-table-column>
        <el-table-column
            align="center"
            header-align="center"
            label="结算方式"
            width="180">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_way=='PAY_NOW'">{{ scope.row.pay_way | payWay }}</el-tag>
            <el-tag type="" v-if="scope.row.pay_way=='CONTRACT'">{{ scope.row.pay_way | payWay }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
            prop="contact_name"
            label="联系人"
            width="180">
        </el-table-column>
        <el-table-column
            :filter-multiple="false"
            :filters="levelFilters"
            column-key="filterLevel"
            label="客户评级">
          <template slot-scope="scope">
            <el-rate disabled v-model="scope.row.level"></el-rate>
          </template>
        </el-table-column>
        <el-table-column
            :filter-multiple="false"
            :filters="tagFilters"
            column-key="filterTag"
            label="标签">
          <template slot-scope="scope">
            <el-tag
                v-for="item in scope.row.customer_tag"
                :key="item.tag_name"
                :color="item.color"
                :closable="editTag"
                @close="removeTag(item.id)"
                size="mini"
                effect="dark"
                style="margin-right: 5px;border: none">
              {{ item.tag_name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
            label="操作"
            width="120"
            align="center"
            header-align="center"
        >
          <template slot-scope="scope">
            <el-button
                @click="checkCustomer(scope.row.id)"
                type="text"
                size="small">
              查看
            </el-button>
            <el-divider direction="vertical"></el-divider>
            <el-dropdown @command="handleOp">
              <el-button type="text">
                操作<i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :command="{type:'addTag', obj:scope.row}">添加标签</el-dropdown-item>
                <el-dropdown-item v-if="!editTag" :command="{type:'editTag', obj:scope.row}">编辑标签</el-dropdown-item>
                <el-dropdown-item v-if="editTag" :command="{type:'editTag', obj:scope.row}">取消标签编辑</el-dropdown-item>
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
    <!--    客户标签弹窗-->
    <el-dialog
        title="添加标签"
        :visible.sync="tagVisible"
        width="500px"
    >
      <SelectTag @selectedTag="initTag"
                 v-if="isShow"
                 :key="timer"
                 :obj="{'id':customerID,'tag_type':'CUSTOMER','existTag':currentTag}"></SelectTag>

    </el-dialog>
  </div>
</template>

<script>

import SelectTag from "@/components/setting/SelectTag";

export default {
  name: "OrderCustomerList",
  data(){
    return{
      customers:[],
      tagFilters: [],  // 标签过滤项
      customerTag: '', // 标签筛选
      level: null,
      total: 0,
      page: 1,
      size: 20,
      loading: false,
      searchValue: '',
      editTag: false,
      tagVisible: false,
      isShow: false,
      timer: '',
      customerID: null,
      currentTag:[],
      levelFilters:[
        {text: '1星', value: '1'},
        {text: '2星', value: '2'},
        {text: '3星', value: '3'},
        {text: '4星', value: '4'},
        {text: '5星', value: '5'},
      ]
    }
  },
  filters: {
    //结算方式信息格式化
    payWay: function (value) {
      if (value === 'PAY_NOW') {
        return '现结'
      }
      if (value === 'CONTRACT') {
        return '约定付款'
      }
      return '';
    },

  },
  mounted() {
    this.initCustomers();
    this.initSettings();
  },
  components:{
    SelectTag
  },
  methods:{
    // 删除标签操作
    removeTag(id){
      this.deleteRequest('api/customer_tags/'+id+'/').then(resp => {
        this.initCustomers()
      })
    },

    //重新加载标签
    initTag(test){
      this.initCustomers()
      this.tagVisible = false
    },

    //更多操作
    handleOp(command) {
      //添加标签
      if (command['type'] == 'addTag') {
        this.isShow = false
        this.timer = new Date().getTime();
        this.customerID=command['obj'].id
        this.currentTag=command['obj'].customer_tag
        this.isShow = true
        this.tagVisible = true
      }
      //编辑标签
      if (command['type'] == 'editTag') {
        this.editTag = !this.editTag
      }
    },

    // 监听筛选项的变化
    filterChange(filterObj) {
      // 监听标签字段
      if (filterObj.filterTag) {
        this.customerTag = filterObj.filterTag[0];
      }
      // 监听客户等级字段
      if (filterObj.filterLevel) {
        this.level = filterObj.filterLevel[0];
      }
      this.initCustomers();
    },

    //查看编辑客户
    checkCustomer(id){
      this.$router.push({
        path: '/createCustomer',
        query: {
          id: id
        }
      });
    },

    //创建客户
    createCustomer(){
      this.$router.push('/createCustomer');
    },

    // 分页大小
    sizeChange(size) {
      this.size = size;
      this.initCustomers();
    },
    // 页码
    currentChange(page) {
      this.page = page;
      this.initCustomers();
    },

    // 搜索
    doSearch() {
      this.$refs.customerTable.clearFilter();
      this.initCustomers();
    },
    // 重置搜索内容
    clearSearchValue() {
      this.searchValue = '';
      this.initCustomers();
    },

    initSettings(){
      // 获取所有客户标签
      this.getRequest('api/settings/tags/?type=CUSTOMER').then(resp => {
        if (resp) {
          resp.results.forEach(i => {
            this.tagFilters.push({text: i.tag_name, value: i.tag_name, tagID: i.id})
          })
        }
      })
    },

    //初始化客户列表
    initCustomers(){
      this.loading = true;
      let url = 'api/customers/?page=' + this.page + '&page_size=' + this.size;

      if (this.searchValue) {
        url += '&search=' + this.searchValue;
      }
      if (this.level) {
        url += '&level=' + this.level;
      }

      if (this.customerTag) {
        url += '&customer_tag__tag__tag_name=' + this.customerTag;
      }
      this.getRequest(url).then(resp => {
        if (resp.results) {
          this.customers = resp.results;
          this.total = resp.count;
          this.loading = false;
        }
      })
    }

  }

}
</script>

<style scoped>
.customerList {
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
</style>