/*
美客多FBM--盛德物流交运
*/
<template>
  <div v-loading="loading">

    <el-card>
      <div slot="header" class="clearfix">
        <span style="font-weight: bold"><i class="el-icon-s-home"></i>运单检查</span>
      </div>
      <div style="text-align: left">
        <el-form label-width="180px">

          <el-form-item label="批次号">
            <div>{{this.ship_obj.batch}}</div>
          </el-form-item>
          <el-form-item label="目标店铺">
            <div>{{this.ship_obj.shop}}</div>
          </el-form-item>

          <el-form-item label="运单打包">
            <div v-if="check_loading"><i class="el-icon-loading"></i>正在检查...</div>
            <div v-if="!check_loading">
              <span v-if="check_data.is_packed"><i class="el-icon-success" style="color: green"></i> 已打包</span>
              <span v-if="!check_data.is_packed"><i class="el-icon-error" style="color: red"></i> 未打包</span>
            </div>
          </el-form-item>
          <el-form-item label="箱唛附件(pdf)">
            <div v-if="check_loading"><i class="el-icon-loading"></i>正在检查...</div>
            <div v-if="!check_loading">
              <span v-if="check_data.is_file"><i class="el-icon-success" style="color: green"></i> 已上传</span>
              <span v-if="!check_data.is_file"><i class="el-icon-error" style="color: red"></i> 未上传</span>
            </div>
          </el-form-item>
          <el-form-item label="货品申报信息">
            <div v-if="check_loading"><i class="el-icon-loading"></i>正在检查...</div>
            <div v-if="!check_loading">
              <span v-if="check_data.is_declare"><i class="el-icon-success" style="color: green"></i> 申报信息正常</span>
              <span v-if="!check_data.is_declare"><i class="el-icon-error" style="color: red"></i> 申报信息异常</span>
            </div>
          </el-form-item>

        </el-form>
      </div>
    </el-card>

    <el-card style="margin-top: 20px">
      <div slot="header" class="clearfix">
        <span style="font-weight: bold"><i class="el-icon-s-home"></i>承运信息</span>
      </div>
      <div style="text-align: left">
        <el-form ref="carrierForm" :rules="carrier_rules" :model="ship_data" label-width="180px">

          <el-form-item label="头程类型" prop="EntrustType">
            <el-select v-model="ship_data.EntrustType"
                       style="width: 300px;"
                       placeholder="请选择头程类型">
              <el-option
                  v-for="item in first_ship_types"
                  :key="item.name"
                  :label="item.name"
                  :value="item.name">
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="送货仓库" prop="warehouseid">
            <el-select v-model="ship_data.warehouseid"
                       style="width: 300px;"
                       placeholder="请选择送货仓库">
              <el-option
                  v-for="item in warehouse_list"
                  :key="item.value"
                  :label="item.name"
                  :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="预约日期" prop="apptdate">
            <el-date-picker
                v-model="ship_data.apptdate"
                @change="getReserveTime"
                value-format="yyyy-MM-dd"
                type="date"
                placeholder="选择日期">
            </el-date-picker>
          </el-form-item>

          <el-form-item label="预约时间" prop="reserveid">
            <el-select v-model="ship_data.reserveid"
                       @change="get_time_value"
                       remote
                       :loading="reserve_loading"
                       style="width: 300px;"
                       placeholder="请选择时间">
              <el-option
                  v-for="item in reserve_time_list"
                  :key="ship_data.reserveid"
                  :label="item.time"
                  :value="item.reserveid">
                <span style="float: left">{{ item.time }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">剩余：{{ item.reservesum }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          
        </el-form>
      </div>
    </el-card>

    <el-card style="margin-top: 20px">
      <div slot="header" class="clearfix">
        <span style="font-weight: bold"><i class="el-icon-s-home"></i>FBM信息</span>
      </div>
      <div style="text-align: left">
        <el-form ref="fbmForm" :rules="fbm_rules" :model="ship_data" label-width="180px">

          <el-form-item label="国家" prop="country_code">
            <el-select v-model="ship_data.country_code"
                       style="width: 300px;"
                       placeholder="请选择国家">
              <el-option
                  v-for="item in country_list"
                  :key="item.name"
                  :label="item.name"
                  :value="item.name">
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="FBM仓库" prop="d_code">
            <el-select v-model="ship_data.d_code"
                       style="width: 300px;"
                       placeholder="请选择FBM仓库">
              <el-option
                  v-for="item in fbm_warehouse_list"
                  :key="item.d_code"
                  :label="item.d_code"
                  :value="item.d_code">
                <span style="float: left">{{ item.d_code }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px" v-if="item.zip">邮编：{{ item.zip }}</span>
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="Seller ID" prop="sellerid">
            <el-input v-model="ship_data.sellerid"
                      style="width: 300px;"
                      maxlength="50"></el-input>
          </el-form-item>

          <el-form-item label="Envio号" prop="envio">
            <el-input v-model="ship_data.envio"
                      style="width: 300px;"
                      maxlength="50"></el-input>
          </el-form-item>

        </el-form>
      </div>
    </el-card>

    <el-card style="margin-top: 20px">
      <div slot="header" class="clearfix">
        <span style="font-weight: bold"><i class="el-icon-s-home"></i>货物报关</span>
      </div>
      <div style="text-align: left">
        <el-form ref="customForm" :rules="custom_rules" :model="ship_data" label-width="180px">

          <el-form-item label="品名" prop="product">
            <el-input v-model="ship_data.product"
                      style="width: 300px;"
                      maxlength="50"></el-input>
          </el-form-item>

          <el-form-item label="产品性质"  prop="ProductNature">
            <el-select v-model="ship_data.ProductNature"
                       multiple
                       style="width: 300px;"
                       placeholder="请选择产品性质">
              <el-option
                  v-for="item in nature_list"
                  :key="item.name"
                  :label="item.name"
                  :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>

        </el-form>
      </div>
    </el-card>

  </div>
</template>

<script>
export default {
  name: "ShengDeCreateOrder",
  props: ['ship_obj'],
  data(){
    return{
      ship_data:{
        ship_id: this.ship_obj.id,
        EntrustType: '空运',
        warehouseid: '0200',
        apptdate: '',
        DeliveryTime: '',
        reserveid: '',
        country_code: '墨西哥',
        d_code: this.ship_obj.fbm_warehouse, //fbm仓库代码
        address1: '', //fbm仓库地址
        zip_code: '', //fbm仓库邮编
        sellerid: '本土号', //sellerid
        envio: this.ship_obj.envio_number, //envio
        product: '手机壳', //品名
        ProductNature: ['普货'], //产品性质
      },
      loading: false,
      reserve_loading: false,
      check_loading: false,
      check_data:{
        is_packed: null,
        is_declare: null,
        is_file: null,
        all_status: null,
      },
      first_ship_types: [
        {
          name: '空运',
          value: '空运'
        },
      ], //头程类型
      warehouse_list: [
        {
          name: '深圳石岩仓(需预约)',
          value: '0200'
        },
      ], //收货仓库
      country_list: [
        {
          name: '墨西哥',
          value: '墨西哥'
        },
      ], //入仓国家
      nature_list: [
        {
          name: '普货',
          value: '普货'
        },
        {
          name: '带电',
          value: '带电'
        },
        {
          name: '带磁',
          value: '带磁'
        },
        {
          name: '木制品',
          value: '木制品'
        },
        {
          name: '纺织品',
          value: '纺织品'
        },
        {
          name: '粉末',
          value: '粉末'
        },
        {
          name: '液体',
          value: '液体'
        },
      ], //产品性质
      fbm_warehouse_list: [], //入仓fbm仓库列表
      reserve_time_list: [], //预约时间列表
      custom_rules: {
        product: [
          {required: true, message: '请填写品名', trigger: 'blur'},
        ],
        ProductNature: [
          {required: true, message: '请选择产品性质', trigger: 'blur'},
        ]
      },
      fbm_rules: {
        d_code: [
          {required: true, message: '请选择FBM仓库', trigger: 'blur'},
        ],
        sellerid: [
          {required: true, message: '请填写用户ID', trigger: 'blur'},
        ],
        envio: [
          {required: true, message: '请填写Envio号', trigger: 'blur'},
        ]
      },
      carrier_rules: {
        apptdate: [
          {required: true, message: '请选择预约日期', trigger: 'blur'},
        ],
        reserveid: [
          {required: true, message: '请选择预约时间', trigger: 'blur'},
        ]
      },
    }
  },
  mounted() {
    this.get_fbm_warehouse()
    this.check_ship()
  },
  methods:{
    //检查运单状态
    check_ship(){
      this.check_loading = true
      this.postRequest('api/ml_ship/check_before_place_order/', {'ship_id': this.ship_obj.id}).then(resp => {
        this.check_loading = false
        if (resp) {
          this.check_data.is_packed = resp.is_packed
          this.check_data.is_declare = resp.is_declare
          this.check_data.is_file = resp.is_file
          this.check_data.all_status = resp.all_status
        }
      })
    },
    //获取预约时间
    getReserveTime(){
      this.reserve_time_list = []
      this.ship_data.DeliveryTime = ''
      this.ship_data.reserveid = ''
      this.reserve_loading = true
      this.postRequest('api/ml_carriers/get_sd_reserve/', {'apptdate': this.ship_data.apptdate}).then(resp => {
        this.reserve_loading = false
        if (resp.status === 'success') {
          this.reserve_time_list = resp.data
          this.reserve_time_list.forEach(item=>{
            item['time'] = item['reservestart'] + '~' + item['reserveend']
          })

        }
      })
    },

    // 获取预约时间
    get_time_value(){
      let reserve = this.reserve_time_list.find(item => item.reserveid === this.ship_data.reserveid)
      this.ship_data.DeliveryTime = this.ship_data.apptdate + ' ' + reserve['reservestart'] + '~' + reserve['reserveend']
    },

    //获取盛德fbm仓库列表
    get_fbm_warehouse(){
      this.getRequest('api/ml_carriers/get_fbm_warehouse/').then(resp => {
        if (resp.status === 'success') {
          this.fbm_warehouse_list = JSON.parse(resp.data)

        }
      })
    },

    //确认交运
    submitOrder(){
      let formStatus = true
      this.$refs.carrierForm.validate((valid) => {
        if (!valid) formStatus = false
      });

      this.$refs.fbmForm.validate((valid) => {
        if (!valid) formStatus = false
      });

      this.$refs.customForm.validate((valid) => {
        if (!valid) formStatus = false
      });

      if (!this.check_data.all_status) {
        this.$message.error('运单检查不通过!')
      }

      if (this.check_data.all_status && formStatus) {
        this.ship_data.ProductNature = this.ship_data.ProductNature.join(',')

        this.$emit('placeOrderLoadingTrue');
        this.loading = true
        this.postRequest('api/ml_ship/carrier_place_order/', this.ship_data).then(resp => {
          this.$emit('placeOrderLoadingFalse');
          this.loading = false
          if (resp.status === 'success') {
            // 调用父组件的关闭窗口方法
            this.$emit('closePlaceOrderWindow');

          }
        })
      }

    }

  }
}
</script>

<style scoped>

</style>