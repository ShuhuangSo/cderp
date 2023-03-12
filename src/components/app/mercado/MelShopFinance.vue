<template>
  <div>
    <el-date-picker
        v-model="cus_date"
        :editable="false"
        :clearable="false"
        type="daterange"
        align="right"
        unlink-panels
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="yyyy-MM-dd"
        style="width: 250px; margin-top: 10px;margin-left: 10px"
        @change="changeFilter"
        :picker-options="pickerOptions">
    </el-date-picker>

    <div>
      <el-table
          :header-cell-style="{background:'#eef1f6'}"
          :data="ShopFinance"
          size="mini"
          style="width: 98%; margin-left: 10px;margin-top: 5px;">
        <el-table-column
            label="店铺名称"
            align="center"
            header-align="center"
            width="180">
          <template slot-scope="scope">
            <div>{{ scope.row.shop_name }}</div>
          </template>
        </el-table-column>
        <el-table-column
            label="总支出"
            align="center"
            header-align="center"
            width="180">
          <template slot-scope="scope">
            <div>{{ scope.row.total_pay | currency }}</div>
          </template>
        </el-table-column>
        <el-table-column
            label="总收入"
            align="center"
            header-align="center"
            width="180">
          <template slot-scope="scope">
            <div>{{ scope.row.total_rec | currency }}</div>
          </template>
        </el-table-column>
        <el-table-column
            label="盈亏"
            align="center"
            header-align="center"
            width="180">
          <template slot-scope="scope">
            <div v-if="scope.row.profit>0" class="positive">{{ scope.row.profit | currency }}</div>
            <div v-if="scope.row.profit<0" class="negitive">{{ scope.row.profit | currency }}</div>
          </template>
        </el-table-column>
        <el-table-column
            label="操作"
            align="center"
            header-align="center">
          <template slot-scope="scope">
            <div>查看明细</div>
          </template>
        </el-table-column>


      </el-table>
    </div>

  </div>
</template>

<script>
import moment from "moment/moment";

export default {
  name: "MelShopFinance",
  data(){
    return{
      ShopFinance: [],
      cus_date: '', // 日期筛选
      start_date: '', // 开始日期
      end_date: '', // 接受日期
      loading: false,
      pickerOptions: {
        shortcuts: [{
          text: '昨天',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 1);
            end.setTime(end.getTime() - 3600 * 1000 * 24 * 1);
            picker.$emit('pick', [start, end]);
          }
        },
          {
            text: '最近一周',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit('pick', [start, end]);
            }
          }]
      },
    }
  },
  filters: {
    //rmb金额格式化
    currency: function (value) {
      if (!value) return 0.00;
      return `¥${value.toFixed(2)}`;
    },
  },
  methods:{
    //改变筛选动作
    changeFilter(){
      this.initShopFinance();
    },
    initShopFinance(){
      this.start_date =String(moment(this.cus_date[0]).format("YYYY-MM-DD"))
      this.end_date = String(moment(this.cus_date[1]).format("YYYY-MM-DD"))
      let d = {'start_date': this.start_date, 'end_date': this.end_date}
      this.loading = true
      this.postRequest('api/ml_shops/shop_finance/', d).then(resp => {
        this.loading = false
        if (resp) {
          this.ShopFinance = resp.data
          this.ShopFinance.reverse()
        }
      })
    }
  }
}
</script>

<style scoped>
.positive {
  color: green;
}
.negitive {
  color: #aa0515;
}
</style>