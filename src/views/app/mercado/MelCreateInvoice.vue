<!--生成发票-->
<template>
  <div style="display: flex; justify-content: center">
    <div class="pContainer">
      <el-card shadow="hover" style="padding-bottom: 20px">
        <div slot="header" class="clearfix">
          <span>订单截图识别生成发票</span>
        </div>
        <div style="padding: 30px; display: flex">

          <div class="left_side">
            <!-- 上传组件 + 隐藏的原生 input 辅助 -->
            <el-upload
                class="upload-zone"
                drag
                ref="uploadRef"
                :action="uploadApi"
                :headers="headers"
                :show-file-list="false"
                :on-success="handleUploadSuccess"
                :on-error="handleUploadError"
                :before-upload="handleBeforeUpload"
                accept="image/png,image/jpeg,image/jpg"
            >
              <i v-if="!uploadLoading" class="el-icon-upload"></i>
              <i v-else class="el-icon-loading" style="font-size: 30px;"></i>
              <div v-if="!uploadLoading" class="el-upload__text">将文件拖到此处，或<em>点击上传</em> / 粘贴截图(Ctrl+V)</div>
              <div v-else class="el-upload__text" style="color:#67C23A;">上传识别中，请稍候...</div>
              <div class="el-upload__tip" slot="tip">只能上传jpg/png文件</div>
            </el-upload>

            <el-button  @click="openManualDialog"
                        type="primary"
                        :disabled="uploadLoading"
                        style="margin-top: 15px">手动录入</el-button>
          </div>
          <div class="right_side">
            <div>截图示例</div>
            <el-image
                style="width: 300px;"
                :src="require('@/assets/invoice_screenshot.jpg')"
                :preview-src-list="[require('@/assets/invoice_screenshot.jpg')]"
                fit="cover"
            ></el-image>
          </div>

        </div>
      </el-card>
    </div>

    <!-- 编辑确认弹窗 -->
    <el-dialog title="发票信息确认编辑" width="850px"
               :close-on-click-modal="false"
               :visible.sync="showDialog">
      <el-form :model="form" label-width="140px" label-position="right">
        <el-form-item label="订单号">
          <el-input v-model="form.order_no" />
        </el-form-item>
        <el-form-item label="发票抬头">
          <el-input v-model="form.buyer" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="form.address" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="订单时间">
          <el-input v-model="form.order_time" />
        </el-form-item>
        <el-form-item label="产品总价">
          <el-input v-model="form.product_price" />
        </el-form-item>
        <el-form-item label="RFC">
          <el-input v-model="form.RFC" />
        </el-form-item>
        <el-form-item label="邮编">
          <el-input v-model="form.postcode" />
        </el-form-item>
        <el-form-item label="Régimen fiscal">
          <el-input v-model="form.tax_regime" />
        </el-form-item>
        <el-form-item label="CFDI">
          <el-input v-model="form.CFDI" />
        </el-form-item>
        <el-form-item label="Forma de pago">
          <el-input v-model="form.forma_pago"/>
        </el-form-item>
        <el-form-item label="Email">
          <el-input v-model="form.email" />
        </el-form-item>

        <!-- 商品列表 -->
        <div style="font-weight:bold; margin:15px 0;">商品列表</div>
        <div v-for="(item, idx) in form.items" :key="idx"
             style="display: flex; gap: 10px; margin-bottom: 10px; align-items:center;">
          <el-input v-model="item.title" placeholder="商品" style="width:380px" />
          <el-input v-model.number="item.qty" placeholder="数量" style="width:80px" />
          <el-input v-model.number="item.item_price" placeholder="单价" style="width:100px" />
          <el-button type="text" icon="el-icon-delete" @click="deleteItem(idx)"></el-button>
        </div>
        <el-button type="primary" size="mini" @click="addItem" icon="el-icon-plus">新增商品</el-button>
      </el-form>

      <div slot="footer">
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="createInvoice">确认生成发票</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "MelCreateInvoice",
  data() {
    return {
      uploadApi: "/api/screenshot_recognize/",
      uploadLoading: false,
      showDialog: false,
      form: {
        order_no: "",
        buyer: "",
        address: "",
        order_time: "",
        product_price: "",
        RFC: "",
        postcode: "",
        tax_regime: "",
        CFDI: "Gastos en General",
        forma_pago: "Tarjeta de crédito",
        email: "",
        items: []
      },
      headers: { Authorization: window.localStorage.getItem('tokenStr') },
    };
  },
  mounted() {
    window.addEventListener("paste", this.handlePaste);
  },
  beforeDestroy() {
    window.removeEventListener("paste", this.handlePaste);
  },
  methods: {
    // ============================
    // 粘贴图片 → 模拟手动上传（100% 触发原有逻辑）
    // ============================
    handlePaste(e) {
      if (this.uploadLoading) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      let file = null;
      for (let item of items) {
        if (item.type.indexOf("image") > -1) {
          file = item.getAsFile();
          break;
        }
      }
      if (!file) return;

      // ✅ 模拟用户手动选择文件，完全走原生流程
      const input = this.$refs.uploadRef.$el.querySelector('input[type="file"]');
      const dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;

      // 触发原生 change 事件
      input.dispatchEvent(new Event('change'));
    },

    // 以下所有方法 100% 保持你原来的代码，完全不变
    handleBeforeUpload() { this.uploadLoading = true; },
    openManualDialog() {
      this.form = {
        order_no: "", buyer: "", address: "", order_time: "", product_price: "",
        RFC: "", postcode: "", tax_regime: "", CFDI: "Gastos en General",
        forma_pago: "Tarjeta de crédito", email: "", items: []
      };
      this.addItem();
      this.showDialog = true;
    },
    async handleUploadSuccess(res) {
      this.uploadLoading = false;
      if (res.status === "success") {
        this.form = res.data;
        this.form.forma_pago = 'Tarjeta de crédito'
        if (!this.form.items?.length) this.form.items = [{ title: "", qty: 1, item_price: 0 }];
        this.showDialog = true;
      } else {
        this.$message.error(res.msg || "识别失败");
      }
    },
    handleUploadError() {
      this.uploadLoading = false;
      this.$message.error("上传失败，请重试");
    },
    addItem() { this.form.items.push({ title: "", qty: 1, item_price: 0 }); },
    deleteItem(idx) { this.form.items.splice(idx, 1); },
    createInvoice() {
      let submitData = JSON.parse(JSON.stringify(this.form));
      submitData.items = submitData.items.map(i => ({
        title: i.title || "", qty: Number(i.qty) || 0, item_price: Number(i.item_price) || 0
      }));
      submitData.product_price = Number(submitData.product_price) || 0;

      this.postRequest("/api/create_invoice/", submitData).then(resp => {
        if (resp.status === 'success') {
          window.open(resp.invoice_url, '_blank');
          this.showDialog = false;
        }
      });
    }
  }
};
</script>

<style scoped>
.pContainer { margin-top: 10px; width: 1200px; }
.left_side{
  width: 50%;
  margin-right: 10px;
}
.right_side{
  width: 50%;
}
</style>