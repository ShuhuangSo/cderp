<template>
  <el-tabs v-model="activeTab" tabPosition="left">
    <el-tab-pane :lazy="true" label="店铺配置" name="shop">
      <ShopConfig />
    </el-tab-pane>
    <el-tab-pane :lazy="true" label="刊登配置" name="listing">
      <ListingConfig />
    </el-tab-pane>
    <el-tab-pane :lazy="true" label="抓取配置" name="fetch">
      <FetchConfig />
    </el-tab-pane>
    <el-tab-pane :lazy="true" label="定价规则" name="pricing">
      <PricingRule />
    </el-tab-pane>
    <el-tab-pane :lazy="true" label="图片清理" name="cleanup">
      <ImageCleanup />
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import ShopConfig from './ShopConfig.vue'
import ListingConfig from './ListingConfig.vue'
import FetchConfig from './FetchConfig.vue'
import PricingRule from './PricingRule.vue'
import ImageCleanup from './ImageCleanup.vue'

export default {
  name: 'Settings',
  components: { ShopConfig, ListingConfig, FetchConfig, PricingRule, ImageCleanup },
  data() {
    return {
      activeTab: 'shop'
    }
  }
}
</script>
