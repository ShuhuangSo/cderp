<template>
  <div>
    <div style="display: flex;justify-content: center;">
      <el-button type="success"
                 size="mini"
                 v-if="permission.devproduct_price_add"
                 @click="addPriceVisible"
                 style="width: 150px">添加定价</el-button></div>
    <el-table
        :header-cell-style="{background:'#eef1f6'}"
        :data="devPriceList"
        border
        size="mini"
        style="width: 98%; margin: 10px">
      <el-table-column
          prop="platform"
          label="平台"
          align="center"
          header-align="center"
          width="60">
      </el-table-column>
      <el-table-column
          prop="site"
          label="站点"
          align="center"
          header-align="center"
          width="60">
      </el-table-column>
      <el-table-column
          align="center"
          header-align="center"
          width="120"
          label="定价">
        <template slot-scope="scope">
          {{ scope.row.currency + ' '}} {{scope.row.price}}
        </template>
      </el-table-column>
      <el-table-column
          align="center"
          header-align="center"
          width="120"
          label="预估毛利润">
        <template slot-scope="scope">
          {{scope.row.profit | rmb_currency}}
        </template>
      </el-table-column>
      <el-table-column
          align="center"
          header-align="center"
          width="60"
          label="毛利率">
        <template slot-scope="scope">
          {{scope.row.gross_margin | interPercent}}
        </template>
      </el-table-column>
      <el-table-column
          prop="ex_rate"
          align="center"
          header-align="center"
          width="80"
          label="定价汇率">
      </el-table-column>
      <el-table-column
          prop="note"
          align="center"
          header-align="center"
          label="备注">
      </el-table-column>
      <el-table-column
          v-if="permission.devproduct_price_op"
          align="center"
          header-align="center"
          width="250"
          label="操作">
        <template slot-scope="scope">
          <div>
            <div>
              <el-button size="mini" plain type="primary" @click="editDevPrice(scope.row)">调价</el-button>
              <el-button size="mini" plain type="warning" @click="sendNotify(scope.row.id, 2)">暂停</el-button>
              <el-button size="mini" plain type="success" @click="sendNotify(scope.row.id, 4)">恢复</el-button>
            </div>
            <div style="margin-top: 5px">
              <el-button size="mini" plain @click="sendNotify(scope.row.id, 3)">翻新</el-button>
              <el-button size="mini" plain type="info" @click="sendNotify(scope.row.id, 5)">下架</el-button>
              <el-button size="mini" plain type="danger" @click="deleteDevPrice(scope.row.id)">删除</el-button>
            </div>

          </div>

        </template>
      </el-table-column>
    </el-table>

    <!--    新增添加定价弹窗-->
    <el-dialog
        title="产品定价"
        :visible.sync="createPriceVisible"
        :destroy-on-close="true"
        :close-on-click-modal="false"
        append-to-body
        width="800px"
    >
      <el-form ref="priceForm" label-width="180px">
        <el-form-item  label="平台" prop="platform">
          <el-select v-model="devPrice.platform" :disabled="devPrice.id" placeholder="请选择" class="inputwidth">
            <el-option
                v-for="item in platforms"
                :key="item.value"
                :label="item.name"
                :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item  label="站点" prop="site">
          <el-select v-model="devPrice.site"
                     :disabled="devPrice.id"
                     @change="changeSite" placeholder="请选择" class="inputwidth">
            <el-option
                v-for="item in sites"
                :disabled="item.disabled"
                :key="item.value"
                :label="item.name"
                :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item
            :label="'定价 '+devPrice.currency" prop="price">
          <el-input-number v-model="devPrice.price"
                           controls-position="right" class="inputwidth"
                           :precision="2" :min="0" :step="1"></el-input-number>
          <span class="note" >产品的销售额</span>
        </el-form-item>
        <el-form-item
            label="汇率" prop="ex_rate">
          <el-input-number v-model="devPrice.ex_rate"
                           controls-position="right" class="inputwidth"
                           :precision="3" :min="0" :step="1"></el-input-number>
          <span class="note" >定价时使用的汇率</span>
        </el-form-item>
        <el-form-item
            label="利润" prop="profit">
          <el-input-number v-model="devPrice.profit"
                           controls-position="right" class="inputwidth"
                           :precision="2" :min="0" :step="1"></el-input-number>
          <span class="note" >预估毛利润 (人民币)</span>
        </el-form-item>
        <el-form-item  label="备注" prop="note">
          <el-input type="textarea" v-model="devPrice.note" class="inputwidth"></el-input>
        </el-form-item>

      </el-form>

      <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="createPriceVisible = false">取 消</el-button>
          <el-button size="small" type="primary"
                     :disabled="!isCreatePriceCorrect"
                     v-if="!devPrice.id"
                     @click="createDevPrice">确 定</el-button>
           <el-button size="small" type="primary"
                      :disabled="!isCreatePriceCorrect"
                      v-if="devPrice.id"
                      @click="updateDevPrice">更 新</el-button>
        </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "DevPrice",
  props: ['productID'],
  data(){
    return{
      permission: JSON.parse(window.sessionStorage.getItem('ml_permission')),
      devPriceList: [],
      devPrice: {
        dev_p_id: this.productID,
        platform: 'eBay',
        site: '',
        price: null,
        ex_rate: null,
        profit: null,
        id: null,
        currency: '',
        note: ''
      },
      loading: false,
      createPriceVisible: false,
      platforms: [
        {name: 'eBay', value: 'eBay'},
      ],
      sites: [
        {name: '澳洲', value: 'AU'},
        {name: '英国', value: 'UK'},
      ],
    }
  },
  filters:{
    //人民币金额格式化
    rmb_currency: function (value) {
      if (!value) return 0.00;
      if (value > 0) {
        return `¥${value.toFixed(2)}`;
      } else {
        return `-¥${Math.abs(value).toFixed(2)}`;
      }
    },
    //整百分比
    interPercent: function (value) {
      if (!value) return '';
      value = value * 100
      return `${value.toFixed(0)}%`;
    },
  },
  computed: {
    // 产品定价是否正确填写
    isCreatePriceCorrect() {
      if (this.devPrice.platform && this.devPrice.site && this.devPrice.price && this.devPrice.ex_rate && this.devPrice.profit){
        return true
      } else {
        return false
      }
    },
  },
  mounted() {
    this.initDevPrice()
  },
  methods:{
    //发送暂停通知
    sendNotify(id, notify){
      let msg = ''
      if (notify===2) msg = '是否发布暂停通知？'
      if (notify===3) msg = '是否发布翻新通知？'
      if (notify===4) msg = '是否发布恢复通知？'
      if (notify===5) msg = '是否发布下架通知？'
      this.$confirm(msg, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        let url = 'api/dev_product_price/send_notify/'
        this.postRequest(url, {'id': id, 'notify': notify}).then(resp => {
          this.loading = false
          if (resp.status === 'success') {
            this.initDevPrice();
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        });
      });
    },
    //删除定价
    deleteDevPrice(id){
      this.$confirm('是否删除该定价？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        let url = 'api/dev_product_price/delete_price/'
        this.postRequest(url, {'id': id}).then(resp => {
          this.loading = false
          if (resp.status === 'success') {
            this.initDevPrice();
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        });
      });
    },
    //打开定价弹窗
    addPriceVisible(){
      this.devPrice.site = ''
      this.devPrice.note = ''
      this.devPrice.price = null
      this.devPrice.ex_rate = null
      this.devPrice.profit = null
      this.devPrice.id = null
      //将已添加的站点设未不可选
      this.sites.forEach(item=>{
        item['disabled'] = false
        this.devPriceList.forEach(i=>{
          if (item.value === i.site) item['disabled'] = true
        })
      })
      this.createPriceVisible = true
    },
    //打开更新定价弹窗
    editDevPrice(row){
      this.devPrice.id = row.id
      this.devPrice.platform = row.platform
      this.devPrice.site = row.site
      this.devPrice.price = row.price
      this.devPrice.ex_rate = row.ex_rate
      this.devPrice.profit = row.profit
      this.devPrice.note = row.note
      this.createPriceVisible = true
    },
    //修改定价
    updateDevPrice(){
      this.loading = true
      let url = 'api/dev_product_price/update_price/'
      this.postRequest(url, this.devPrice).then(resp => {
        this.loading = false
        if (resp) {
          this.initDevPrice();
          this.createPriceVisible = false;
        }
      })
    },
    //添加定价
    createDevPrice(){
      this.loading = true
      let url = 'api/dev_product_price/create_price/'
      this.postRequest(url, this.devPrice).then(resp => {
        this.loading = false
        if (resp) {
          this.initDevPrice();
          this.createPriceVisible = false;
        }
      })

    },
    //修改站点
    changeSite(){
      if (this.devPrice.site === 'AU'){
        this.devPrice.currency = 'AUD'
      }
      if (this.devPrice.site === 'UK'){
        this.devPrice.currency = 'GBP'
      }
    },
    initDevPrice(){
      this.loading = true;
      // 获取产品定价数据
      this.getRequest('api/dev_product_price/?page_size=1000&dev_p__id=' + this.productID).then(resp => {
        this.loading = false;
        if (resp) {
          this.devPriceList = resp.results
        }
      })
    }
  }
}
</script>

<style scoped>
.inputwidth {
  width: 200px;
}
.note{
  margin-left: 10px;
  color: #919398;
  font-size: 12px;
}
</style>