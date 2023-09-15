/*
美客多FBM--运单信息中心
*/
<template>
  <div style="display: flex; justify-content: center">
    <div class="pContainer">
      <el-card shadow="hover" style="padding-bottom: 20px">
        <div slot="header" class="clearfix">
          <el-page-header @back="cancel" content="变动清单列表">
          </el-page-header>
        </div>


        <div style="margin-left: 10px">
<!--          <h4>变动清单列表</h4>-->
          <el-select v-model="filter_name"
                     @change="changeFilter" placeholder="请选择筛选项">
            <el-option
                v-for="item in filter_group"
                :key="item.name"
                :label="item.name"
                :value="item.value">
            </el-option>
          </el-select>

          <el-badge  :hidden="!multipleSelection.length" :value="multipleSelection.length" class="item_main">
            <el-dropdown type="primary" style="margin-right: 5px" @command="handleBulk">
              <el-button size="small" type="primary" plain :disabled="multipleSelection.length===0">
                批量操作<i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="move">批量迁移</el-dropdown-item>
                <el-dropdown-item command="keep">批量保留</el-dropdown-item>
                <el-dropdown-item command="delete">批量移除</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </el-badge>

        </div>
        <el-table
            ref="productTable"
            :header-cell-style="{background:'#eef1f6'}"
            :data="itemRemoves"
            v-loading="loading"
            :row-key="getRowKeys"
            @selection-change="handleSelectionChange"
            border
            size="mini"
            style="width: 98%; margin: 10px">
          <el-table-column
              :reserve-selection="true"
              :selectable="checkSelectable"
              type="selection"
              width="42">
          </el-table-column>

          <el-table-column
              label="批次 | 目标店铺"
              align="center"
              header-align="center"
              show-overflow-tooltip
              width="150">
            <template slot-scope="scope">
              <div class="m_name">{{ scope.row.batch }}</div>
              <div style="margin-top: 10px">
                <el-tag
                    style="border: none"
                    @click="selectValue(scope.row.shop)"
                    :title="'负责人:' + scope.row.manager"
                    :color="scope.row.shop_color?scope.row.shop_color:'#539acd'"
                    effect="dark" type="info">
                  <span style="font-weight: bold">{{ scope.row.shop}}</span>
                </el-tag>
              </div>
            </template>
          </el-table-column>

          <el-table-column
              label="图片"
              align="center"
              header-align="center"
              width="80">
            <template slot-scope="scope">
              <el-image
                  style="width: 40px; height: 40px"
                  :src="scope.row.image | smpic"
                  fit="fill">
              </el-image>
            </template>
          </el-table-column>
          <el-table-column
              label="产品"
              show-overflow-tooltip
              width="300">
            <template slot-scope="scope">
              <div><span style="font-weight: bold">{{ scope.row.sku }} </span>
                <el-tag type="danger" size="mini" v-if="scope.row.item_type==='REMOVE'">移除</el-tag>
                <el-tag type="warning" size="mini" v-if="scope.row.item_type==='REDUCE'">减量</el-tag>
              </div>

              <div>{{ scope.row.p_name }}</div>
              <div><span class="remove">{{ scope.row.belong_shop }} </span></div>
            </template>
          </el-table-column>



          <el-table-column
              label="计划数量"
              align="center"
              header-align="center"
              width="80">
            <template slot-scope="scope">
              <div style="font-weight: bold">{{ scope.row.plan_qty}}</div>
            </template>
          </el-table-column>


          <el-table-column
              label="发货数量"
              align="center"
              header-align="center"
              width="80">
            <template slot-scope="scope">
              <div style="font-weight: bold">{{ scope.row.send_qty }}</div>
            </template>
          </el-table-column>


          <el-table-column
              label="简要备注">
            <template slot-scope="scope">
              {{scope.row.note}}
            </template>
          </el-table-column>

          <el-table-column
              align="center"
              header-align="center"
              width="130"
              label="状态">
            <template slot-scope="scope">
              <div><i class="el-icon-time" v-if="!scope.row.handle"></i> {{scope.row.handle | status}}</div>
              <div  v-if="scope.row.handle_time">{{scope.row.handle_time | date}}</div>
            </template>
          </el-table-column>

        </el-table>

        <div class="pagination">
          <el-pagination
              background
              :page-sizes="[20, 30, 40, 50, 100]"
              @current-change="currentChange"
              @size-change="sizeChange"
              layout="sizes, prev, pager, next, jumper, ->, total"
              :current-page="page"
              :total="total">
          </el-pagination>
        </div>

      </el-card>

      <!--    迁移弹窗-->
      <el-dialog
          title="迁移产品列表"
          :visible.sync="moveVisible"
          :destroy-on-close="true"
          :close-on-click-modal="false"
          width="1000px"
      >
        <div>
          <div>
            <span style="font-weight: bold">迁移目标运单：</span><br>
            <el-select v-model="ship_id"
                       style="width: 400px;margin-right: 10px"
                       placeholder="请选择迁移运单">
              <el-option
                  v-for="item in ships"
                  :key="item.id"
                  :label="item.shop"
                  :value="item.id">
                <span style="float: left">{{ item.shop }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{ item.batch }} ({{ item.envio_number }})</span>
              </el-option>
            </el-select>
          </div>

          <div style="margin-top: 20px; margin-bottom: 20px">
            <span style="font-weight: bold">迁移方式：</span><br>
            <el-select v-model="move_method"
                       style="width: 400px;margin-right: 10px"
                       placeholder="请选择">
              <el-option
                  v-for="item in move_method_group"
                  :key="item.name"
                  :label="item.name"
                  :value="item.value">
              </el-option>
            </el-select>
          </div>
          <el-table
              ref="fbmTable"
              :data="multipleSelection"
              :header-cell-style="{background:'#fafafa'}"
              style="width: 100%">

            <el-table-column
                label="图片"
                align="center"
                header-align="center"
                width="80">
              <template slot-scope="scope">
                <el-image
                    style="width: 40px; height: 40px"
                    :src="scope.row.image | smpic"
                    fit="fill">
                </el-image>
              </template>
            </el-table-column>
            <el-table-column
                label="产品">
              <template slot-scope="scope">
                <div><span style="font-weight: bold">{{ scope.row.sku }} </span>
                  <el-tag type="danger" size="mini" v-if="scope.row.item_type==='REMOVE'">移除</el-tag>
                  <el-tag type="warning" size="mini" v-if="scope.row.item_type==='REDUCE'">减量</el-tag>
                </div>

                <div>{{ scope.row.p_name }}</div>
                <div><span class="remove">{{ scope.row.belong_shop }} </span></div>
              </template>
            </el-table-column>

            <el-table-column
                label="计划数量"
                align="center"
                header-align="center"
                width="80">
              <template slot-scope="scope">
                <div style="font-weight: bold">{{ scope.row.plan_qty}}</div>
              </template>
            </el-table-column>


            <el-table-column
                label="发货数量"
                align="center"
                header-align="center"
                width="80">
              <template slot-scope="scope">
                <div style="font-weight: bold">{{ scope.row.send_qty }}</div>
              </template>
            </el-table-column>

            <el-table-column
                label="迁移数量"
                align="center"
                header-align="center"
                width="160">
              <template slot-scope="scope">
                <el-input-number v-model="scope.row.move_qty" :min="1"></el-input-number>
              </template>
            </el-table-column>

          </el-table>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="moveVisible=false">取 消</el-button>
          <el-button size="small" :disabled="!ship_id" type="primary" @click="summitMove">确认迁移</el-button>
        </span>
      </el-dialog>

    </div>

  </div>
</template>

<script>
import moment from "moment";

export default {
  name: "MelShipInfo",
  data(){
    return{
      user: JSON.parse(window.sessionStorage.getItem('user')),
      permission: JSON.parse(window.sessionStorage.getItem('ml_permission')),
      itemRemoves: null,
      loading: false,
      moveVisible: false, //迁移弹窗
      move_method: 'DEL', //产品存在迁移方法
      belong_shop: '', //当前用户管理的店铺
      total: 0, // 总条数
      page: 1,  // 当前页
      size: 20,  // 页大小
      searchValue: '',
      multipleSelection: [], // 选中行
      filter_name: '&handle=0', // 库存筛选
      filter_group: [
        {
          name: '全部变动清单',
          value: ''
        },
        {
          name: '待处理变动',
          value: '&handle=0'
        },
        {
          name: '已迁移',
          value: '&handle=1'
        },
        {
          name: '已保留',
          value: '&handle=3'
        },
        {
          name: '已移除',
          value: '&handle=2'
        },
      ],
      ship_id: '', // 选择运单id
      ships: null, // 运单
      move_method_group: [
        {
          name: '如果产品存在，放弃迁移并移除数量',
          value: 'DEL'
        },
        {
          name: '如果产品存在，叠加迁移数量',
          value: 'ADD'
        },

      ],
    }
  },
  filters: {
    //时间日期格式化
    date: function (value) {
      return moment(value).format("YYYY-MM-DD HH:mm");
    },
    //图片地址格式化
    smpic: function (value) {
      if (!value) return '';
      let url = value.slice(0, value.length-4)
      return url + '_100x100.jpg/?' + Math.random()
    },
    //状态格式化
    status: function (value) {
      if (value === 1) return '已迁移';
      if (value === 2) return '已移除';
      if (value === 3) return '已保留';
      if (!value) return '待处理';
    },
  },
  mounted() {
    this.inintShops()
    this.initItemRemoves()
    this.inintBatchList()
  },
  methods:{
    // 取消并返回
    cancel() {
      this.$router.push({
        path: '/melManage',
        query: {
          activeName: 'ship',
          partName: 'PREPARING'
        }
      });
    },
    // 返回该行是否可以被勾选
    checkSelectable(row,index){
      let flag = true;
      if(row.handle === 1){
        flag = false
      }
      return flag
    },
    // 打开批量操作对话框
    handleBulk(command) {
      if (command === 'move') {
        this.getShips() //获取可迁移运单
        this.ship_id = '';
        this.multipleSelection.forEach(item => {
          item['move_qty'] = item.plan_qty - item.send_qty
        })
        this.moveVisible = true;
      }

      if (command === 'delete') {
        this.$confirm('是否确认移除选择产品数量?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          //调用提交确认收货
          this.postRequest('api/ml_ship_item_remove/del_items/', this.multipleSelection).then(resp => {
            if(resp.status === 'success') {
              this.multipleSelection = []
              this.$refs.productTable.clearSelection() //清除选中的数据
              this.initItemRemoves();
            }

          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消'
            });
          });
        })
      }

      if (command === 'keep') {
        this.$confirm('是否确认保留选择产品数量?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          //调用提交确认收货
          this.postRequest('api/ml_ship_item_remove/keep_items/', this.multipleSelection).then(resp => {
            if(resp.status === 'success') {
              this.multipleSelection = []
              this.$refs.productTable.clearSelection() //清除选中的数据
              this.initItemRemoves();
            }

          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消'
            });
          });
        })
      }

    },
    getRowKeys(row){
      return row.id
    },
    // 处理多选
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    // 重置搜索内容
    clearSearchValue() {
      this.searchValue = '';
      this.initItemRemoves();
    },
    // 搜索
    doSearch() {
      this.page = 1;
      this.$refs.productTable.clearFilter();
      this.initItemRemoves();
    },
    // 分页大小
    sizeChange(size) {
      this.page = 1;
      this.size = size;
      this.initItemRemoves();
    },
    // 页码
    currentChange(page) {
      this.page = page;
      this.initItemRemoves();
    },
    //改变筛选动作
    changeFilter(){
      this.page = 1;
      this.multipleSelection = []
      this.$refs.productTable.clearSelection() //清除选中的数据
      this.initItemRemoves();
    },
    //提交下单迁移
    summitMove(){
      this.postRequest('api/ml_ship_item_remove/move_items/', {'product_list':this.multipleSelection, 'ship_id': this.ship_id, 'move_method': this.move_method}).then(resp => {
        if (resp.status === 'success') {
          this.moveVisible = false
          this.multipleSelection = []
          this.$refs.productTable.clearSelection() //清除选中的数据
          this.initItemRemoves();
        }
      })
    },
    //获取所有可迁移运单
    getShips(){
      let url = 'api/ml_ship/?s_status=PREPARING&page_size=1000&ordering=-create_time'
      if (!this.permission.ship_allShopCheck) {
        url += '&user_id__in=0,' + this.user.id;
      }

      this.getRequest(url).then(resp => {
        if (resp.results) {
          this.ships = resp.results;
        }
      })

    },

    //获取所有可选店铺
    inintShops(){
      let shops = JSON.parse(window.sessionStorage.getItem('ml_shops'));
      let shop_set = []
      shops.forEach(item=>{
        shop_set.push(item['name'])
      })
      this.belong_shop = shop_set.join(',')
    },
    initItemRemoves(){
      let url = '/api/ml_ship_item_remove/?page=' + this.page + '&page_size=' + this.size
      if (this.searchValue) {
        url += '&search=' + this.searchValue;
      }
      if (this.filter_name) {
        url += this.filter_name;
      }
      url += '&belong_shop__in=' + this.belong_shop; //获取所有管理店铺产品

      url += '&ordering=-ship__id'

      this.loading = true
      this.getRequest(url).then(resp => {
        this.loading = false
        if (resp.results) {
          this.itemRemoves = resp.results;
          this.total = resp.count;
        }
      })
    }
  }
}
</script>

<style scoped>
.pContainer {
  margin-top: 10px;
  width: 1200px;
}
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}
.total {
  display: flex;
  justify-content: flex-end;
  margin-right: 50px;
  margin-bottom: 20px;
}
.m_name{
  font-weight: bold;
  font-size: 18px;
}

.remove{
  color: #cac6c6;
}
.item_main{
  margin-left: 20px;
}
</style>