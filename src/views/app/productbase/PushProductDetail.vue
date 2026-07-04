<template>
  <div>
    <el-skeleton :loading="loading" :rows="16" animated>
      <div class="detail-container">
        <el-tabs type="border-card" v-model="activeTab" @tab-click="onTabClick">
          <!-- ==================== Tab 1: 基本信息 ==================== -->
          <el-tab-pane label="基本信息" name="basic" :lazy="true">
            <el-form ref="productForm" :model="baseProduct" label-position="right" label-width="110px">

              <el-divider content-position="left">产品信息</el-divider>
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="产品类目">
                    <span class="readonly-value">{{ baseProduct.category }}</span>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="来源站点">
                    <span class="readonly-value">{{ baseProduct.from_site_id }}</span>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="产品标签">
                    <div class="variant-tags">
                      <template v-for="(t, idx) in tagList">
                        <el-input
                          v-if="editingTagIdx === idx"
                          :key="'tag-edit-' + idx"
                          v-model="editingTagValue"
                          ref="editTagInput"
                          size="mini"
                          style="width: 100px; margin-right: 6px; margin-bottom: 4px"
                          @keyup.enter.native="commitEditTag(idx)"
                          @blur="commitEditTag(idx)"
                        />
                        <el-tag
                          v-else
                          :key="idx"
                          size="small"
                          closable
                          @close="removeTag(idx)"
                          @click.native="startEditTag(idx, t)"
                          style="margin-right: 6px; margin-bottom: 4px; cursor: pointer"
                        >{{ t }}</el-tag>
                      </template>
                      <el-input
                        v-if="showTagInput"
                        ref="tagInput"
                        v-model="newTagValue"
                        size="mini"
                        style="width: 100px; margin-right: 6px"
                        placeholder="新标签"
                        @keyup.enter.native="addTag"
                        @blur="addTag"
                      />
                      <el-button
                        v-else
                        size="mini"
                        type="primary"
                        icon="el-icon-plus"
                        circle
                        @click="showTagInput = true"
                      />
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="类目ID">
                    <span class="readonly-value">{{ baseProduct.category_id }}</span>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="来源itemID">
                    <span class="readonly-value">{{ baseProduct.from_item_id }}</span>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="创建时间">
                    <span class="readonly-value">{{ baseProduct.create_time | dateFormat }}</span>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="产品主图">
                    <el-image
                      v-if="productMainImage"
                      style="width: 120px; height: 120px"
                      :src="productMainImage"
                      :preview-src-list="[productMainImage]"
                      fit="cover"
                    />
                    <span v-else class="readonly-value">暂无</span>
                  </el-form-item>
                </el-col>
                <el-col :span="16">
                  <el-form-item label="后台备注">
                    <el-input v-model="baseProduct.note" type="textarea" size="small" :rows="2" placeholder="请输入备注" @input="_modified = true" />
                  </el-form-item>
                </el-col>
              </el-row>

              <!-- 产品供应管理 -->
              <el-divider content-position="left">产品供应管理</el-divider>
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="供应商" required>
                    <el-autocomplete v-model="baseProduct.supplier" size="small" placeholder="输入或选择供应商"
                      style="width: 100%" clearable
                      :fetch-suggestions="searchDetailSuppliers"
                      @focus="ensureSupplierOptions"
                      @input="_modified = true"
                      @select="onDetailSupplierChange">
                      <template slot-scope="{ item }">
                        <i v-if="item.favorite" class="el-icon-star-on" style="color: #f7ba2a; margin-right: 4px"></i>
                        <span>{{ item.value }}</span>
                      </template>
                    </el-autocomplete>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="产品系列" required>
                    <el-autocomplete v-model="baseProduct.series" size="small" placeholder="输入或选择产品系列"
                      style="width: 100%" clearable
                      :fetch-suggestions="searchDetailSeries"
                      @input="_modified = true" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="创建人">
                    <span class="readonly-value">{{ baseProduct.creator }}</span>
                  </el-form-item>
                </el-col>
              </el-row>

              <!-- 变体维度 -->
              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item label="变体维度">
                    <div class="variant-tags">
                      <template v-for="(name, idx) in mainVariantNameList">
                        <el-input
                          v-if="editingVariantIdx === idx"
                          :key="'edit-' + idx"
                          v-model="editingVariantValue"
                          ref="editVariantNameInput"
                          size="mini"
                          style="width: 120px; margin-right: 6px; margin-bottom: 4px"
                          @keyup.enter.native="commitEditVariantName(idx)"
                          @blur="commitEditVariantName(idx)"
                        />
                        <el-tag
                          v-else
                          :key="idx"
                          size="small"
                          closable
                          type="warning"
                          @close="removeMainVariantName(idx)"
                          @click.native="startEditVariantName(idx, name)"
                          style="margin-right: 6px; margin-bottom: 4px; cursor: pointer"
                        >{{ name }}</el-tag>
                      </template>
                      <el-input
                        v-if="showVariantNameInput"
                        ref="variantNameInput"
                        v-model="newVariantName"
                        size="mini"
                        style="width: 120px; margin-right: 6px"
                        placeholder="新维度"
                        @keyup.enter.native="addMainVariantName"
                        @blur="addMainVariantName"
                      />
                      <el-button
                        v-else
                        size="mini"
                        type="primary"
                        icon="el-icon-plus"
                        circle
                        @click="showVariantNameInput = true"
                      />
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>

              <!-- 变体值映射编辑 -->
              <el-form-item v-if="mainVariantNameList.length && baseProduct.variant_editor" label="变体映射">
                <div class="variant-editor-container">
                  <div
                    v-for="varName in mainVariantNameList"
                    :key="varName"
                    class="variant-editor-group"
                  >
                    <div class="variant-editor-title">{{ varName }}</div>
                    <el-table
                      :key="'vedit-' + varName + '-' + variantEditorVersion"
                      :data="getVariantEditorRows(varName)"
                      :header-cell-style="{background:'#fafafa'}"
                      border
                      size="mini"
                      style="width: 100%">
                      <el-table-column label="英文值" min-width="180">
                        <template slot-scope="scope">
                          <el-input
                            v-model="scope.row.key"
                            @blur="editVariantValue(varName, scope.row._origKey, scope.row.key)"
                            size="mini"
                            placeholder="英文变体值"
                          />
                        </template>
                      </el-table-column>
                      <el-table-column min-width="180">
                        <template slot="header">
                          <span>中文映射</span>
                          <el-popover placement="bottom" width="260" trigger="click">
                            <div>
                              <el-input v-model="replaceFind" size="mini" placeholder="查找英文文本" style="margin-bottom: 8px" />
                              <el-input v-model="replaceWith" size="mini" placeholder="替换为中文" style="margin-bottom: 8px" />
                              <el-button size="mini" type="primary" @click="applyBulkReplace(varName)">应用替换</el-button>
                            </div>
                            <el-button slot="reference" size="mini" icon="el-icon-sort" circle
                              style="margin-left: 4px; vertical-align: middle"
                              title="批量替换中文映射" />
                          </el-popover>
                        </template>
                        <template slot-scope="scope">
                          <el-input
                            :value="getVarMapping(varName, scope.row.key)"
                            @input="setVarMapping(varName, scope.row.key, $event)"
                            size="mini"
                            placeholder="输入中文映射值"
                          />
                        </template>
                      </el-table-column>
                      <el-table-column label="操作" width="55" align="center">
                        <template slot-scope="scope">
                          <el-popconfirm
                            title="确定删除该变体值？"
                            @confirm="deleteVariantValue(varName, scope.row.key)"
                          >
                            <el-button slot="reference" size="mini" type="default" plain icon="el-icon-delete" circle />
                          </el-popconfirm>
                        </template>
                      </el-table-column>
                    </el-table>
                    <div style="margin-top: 6px">
                      <el-button size="mini" type="primary" icon="el-icon-plus" @click="addVariantValue(varName)">
                        添加变体值
                      </el-button>
                    </div>
                  </div>
                </div>
              </el-form-item>

              <!-- 全局 SKU 表格 -->
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px">
                <span class="section-subtitle">SKU 列表 <el-tag size="mini" type="info">{{ skuCount }}</el-tag></span>
                <el-dropdown trigger="click" @command="toggleColumn">
                  <el-button size="mini" icon="el-icon-s-operation">
                    列设置 <i class="el-icon-arrow-down el-icon--right"></i>
                  </el-button>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="index" :class="{ 'is-checked': columnSettings.index }">
                      <i :class="columnSettings.index ? 'el-icon-check' : 'el-icon-close'" style="margin-right: 6px"></i>序号
                    </el-dropdown-item>
                    <el-dropdown-item command="image" :class="{ 'is-checked': columnSettings.image }">
                      <i :class="columnSettings.image ? 'el-icon-check' : 'el-icon-close'" style="margin-right: 6px"></i>图片
                    </el-dropdown-item>
                    <el-dropdown-item command="upc" :class="{ 'is-checked': columnSettings.upc }">
                      <i :class="columnSettings.upc ? 'el-icon-check' : 'el-icon-close'" style="margin-right: 6px"></i>UPC
                    </el-dropdown-item>
                    <el-dropdown-item command="purchase_url" :class="{ 'is-checked': columnSettings.purchaseUrl }">
                      <i :class="columnSettings.purchaseUrl ? 'el-icon-check' : 'el-icon-close'" style="margin-right: 6px"></i>采购链接
                    </el-dropdown-item>
                    <el-dropdown-item command="warehouse" :class="{ 'is-checked': columnSettings.warehouse }">
                      <i :class="columnSettings.warehouse ? 'el-icon-check' : 'el-icon-close'" style="margin-right: 6px"></i>仓库
                    </el-dropdown-item>
                    <el-dropdown-item command="mb_product_status" :class="{ 'is-checked': columnSettings.mbProductStatus }">
                      <i :class="columnSettings.mbProductStatus ? 'el-icon-check' : 'el-icon-close'" style="margin-right: 6px"></i>MB产品状态
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </div>
              <el-table
                :data="sortedGlobalVariants"
                :header-cell-style="{background:'#fafafa'}"
                border
                size="mini"
                style="width: 100%"
                max-height="400"
                @sort-change="onSkuSortChange">
                <el-table-column v-if="columnSettings.index" type="index" label="#" width="40" align="center" />
                <el-table-column v-if="columnSettings.image" label="图片" width="55" align="center">
                  <template slot-scope="scope">
                    <el-image
                      v-if="scope.row.images && scope.row.images.length"
                      style="width: 38px; height: 38px; cursor: pointer"
                      :src="scope.row.images[0].image_url"
                      fit="cover"
                      @click.native="openSkuImageDialog(scope.row)"
                    />
                    <el-button
                      v-else
                      size="mini"
                      icon="el-icon-picture-outline"
                      @click="openSkuImageDialog(scope.row)"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="SKU" width="110">
                  <template slot-scope="scope">
                    <el-tag size="mini" :type="baseProduct.p_status === 'READY' ? (scope.row.is_synced ? 'success' : 'warning') : 'success'" effect="plain">{{ scope.row.sku }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="中文名" min-width="250">
                  <template slot-scope="scope">
                    <span>{{ scope.row.p_name }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="成本价" width="115">
                  <template slot="header">
                    <span>成本价</span>
                    <el-popover placement="bottom" width="260" trigger="click">
                      <div>
                        <el-input-number v-model="batchCost" size="mini" :precision="2" :min="0"
                          controls-position="right" style="width: 160px; margin-right: 8px" />
                        <el-button size="mini" type="primary" @click="applyBatchCost">应用</el-button>
                      </div>
                      <el-button slot="reference" size="mini" icon="el-icon-edit" circle
                        style="margin-left: 4px; vertical-align: middle" />
                    </el-popover>
                  </template>
                  <template slot-scope="scope">
                    <el-input v-model="scope.row.cost" size="mini" placeholder="成本价" />
                  </template>
                </el-table-column>
                <!-- 全局变体值列 -->
                <el-table-column
                  v-for="(varLabel, varIdx) in mainVariantNameList"
                  :key="'gvar-' + varIdx"
                  :label="varLabel"
                  :prop="'var' + (varIdx + 1)"
                  sortable="custom"
                  min-width="100"
                >
                  <template slot-scope="scope">
                    <span>{{ scope.row['var' + (varIdx + 1)] }}</span>
                  </template>
                </el-table-column>
                <el-table-column v-if="columnSettings.upc" label="UPC" width="100">
                  <template slot-scope="scope">
                    <el-input v-model="scope.row.UPC" size="mini" placeholder="UPC" />
                  </template>
                </el-table-column>
                <el-table-column v-if="columnSettings.warehouse" label="仓库" width="125">
                  <template slot="header">
                    <span>仓库</span>
                    <el-button size="mini" icon="el-icon-edit" circle
                      style="margin-left: 4px; vertical-align: middle"
                      @click="showBatchWarehouseDialog" />
                  </template>
                  <template slot-scope="scope">
                    <el-input v-model="scope.row.warehouse" size="mini" placeholder="仓库" />
                  </template>
                </el-table-column>
                <el-table-column v-if="columnSettings.mbProductStatus" label="MB产品状态" width="130">
                  <template slot-scope="scope">
                    <el-input v-model="scope.row.mb_product_status" size="mini" placeholder="产品状态" />
                  </template>
                </el-table-column>
                <el-table-column v-if="columnSettings.purchaseUrl" label="采购链接" min-width="140">
                  <template slot-scope="scope">
                    <el-input v-model="scope.row.purchase_url" size="mini" placeholder="采购链接" />
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="55" align="center">
                  <template slot-scope="scope">
                    <el-popconfirm
                      title="确定删除该SKU吗？所有店铺将同步删除"
                      @confirm="deleteGlobalSku(scope.$index)"
                    >
                      <el-button slot="reference" size="mini" type="default" plain icon="el-icon-delete" circle />
                    </el-popconfirm>
                  </template>
                </el-table-column>
              </el-table>
              <div v-if="hasMoreGlobalVariants" style="text-align: center; margin-top: 8px">
                <el-button size="small" type="primary" :loading="loadingMore"
                  @click="loadAllVariants">
                  加载全部（{{ globalVariantTotal }} 条）
                </el-button>
              </div>
            </el-form>
          </el-tab-pane>

          <!-- ==================== Tab 2: 店铺管理 ==================== -->
          <el-tab-pane name="shop" :lazy="true">
            <span slot="label">店铺管理 <el-tag size="mini" type="warning">{{ groupCount }}</el-tag></span>
            <!-- 店铺切换 -->
            <el-tabs type="editable-card" v-model="activeShopTabName" class="shop-tabs" @edit="onShopTabEdit">
              <el-tab-pane
                v-for="(shop, idx) in visibleShops"
                :key="getShopKey(shop, idx)"
                :name="'shop-' + idx"
              >
                <span slot="label">
                  <span v-if="baseProduct.p_status === 'READY'" class="shop-sync-dot" :class="shop.is_synced ? 'dot-synced' : 'dot-unsynced'"></span>
                  {{ getShopLabel(shop) }}
                  <el-popconfirm
                    v-if="'shop-' + idx === activeShopTabName && visibleShops.length > 1"
                    title="确定删除该店铺？"
                    @confirm="onShopTabEdit('shop-' + idx, 'remove')"
                  >
                    <i slot="reference" class="el-icon-close" style="margin-left: 6px; cursor: pointer; color: #909399; font-size: 12px" @click.stop></i>
                  </el-popconfirm>
                </span>
              </el-tab-pane>
              <el-tab-pane name="add" disabled>
                <span slot="label">
                  <el-button size="mini" type="text" icon="el-icon-plus" @click="showAddShopDialog">复制店铺</el-button>
                </span>
              </el-tab-pane>
            </el-tabs>

            <!-- 当前店铺表单 -->
            <el-form v-if="currentShop" :model="currentShop" label-position="right" label-width="100px" class="shop-form">
              <el-divider content-position="left">店铺信息</el-divider>
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="平台">
                    <span class="readonly-value">{{ currentShop.platform }}</span>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="站点">
                    <span class="readonly-value">{{ getFlagEmoji(getSiteCode(currentShop.site)) }} {{ getSiteName(currentShop.site) }}</span>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="16">
                  <el-form-item label="店铺标题" required>
                    <el-input v-model="currentShop.title" size="small" maxlength="80" show-word-limit placeholder="店铺展示标题" @input="currentShop._shopDirty = true">
                      <el-button slot="append" icon="el-icon-magic-stick"
                        :loading="optimizing === 'title'"
                        @click="optimizeShopContent('EBAY_TITLE')">AI 优化</el-button>
                      <i v-if="currentShop.title_optimized === true" slot="suffix"
                        class="el-icon-magic-stick" style="color: #67c23a; margin-right: 8px; font-size: 16px"
                        title="AI 已优化" />
                      <span v-if="currentShop.title_optimized === false" slot="suffix"
                        style="color: #e6a23c; margin-right: 8px; font-size: 12px">AI 优化中…</span>
                    </el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item label="产品描述">
                    <div style="margin-bottom: 4px; display: flex; align-items: center; gap: 6px">
                      <el-button size="mini" icon="el-icon-magic-stick"
                        :loading="optimizing === 'desc'"
                        @click="optimizeShopContent('EBAY_DESC')">AI 优化描述</el-button>
                      <i v-if="currentShop.desc_optimized === true"
                        class="el-icon-magic-stick" style="color: #67c23a; font-size: 16px"
                        title="AI 已优化" />
                      <span v-if="currentShop.desc_optimized === false"
                        style="color: #e6a23c; font-size: 12px">AI 优化中…</span>
                    </div>
                    <quill-editor
                      v-model="currentShop.desc"
                      :options="quillOptions"
                      style="background-color: #fff"
                      @change="currentShop._shopDirty = true"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <!-- 刊登配置 -->
              <el-divider content-position="left">刊登配置</el-divider>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="关联配置" required>
                    <el-select v-model="currentShop._listingConfigId" size="small"
                      placeholder="选择刊登配置" style="width: 100%" clearable filterable
                      @focus="refreshListingConfigs"
                      @change="onListingConfigChange">
                      <el-option v-for="opt in listingConfigOptions" :key="opt.id"
                        :label="opt.name" :value="opt.id" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row v-if="currentShop.listing_config_detail" :gutter="20">
                <el-col :span="24">
                  <div class="listing-config-info gray_zi">
                    <div>默认库存: {{ currentShop.listing_config_detail.default_stock }}</div>
                    <div>物品所在地: {{ currentShop.listing_config_detail.item_location || '-' }}</div>
                    <div v-if="currentShop.listing_config_detail.listing_template">
                      通用刊登模板: {{ currentShop.listing_config_detail.listing_template }}
                    </div>
                    <div>
                      PL: {{ currentShop.listing_config_detail.promoted_listing_enabled ? '开启(' + currentShop.listing_config_detail.promoted_listing_ad_rate + '%)' : '关闭' }}
                    </div>
                    <div v-if="currentShop.listing_config_detail.promoted_listing_enabled && currentShop.listing_config_detail.campaign">
                      Campaign: {{ currentShop.listing_config_detail.campaign }}
                    </div>
                  </div>
                </el-col>
              </el-row>

              <!-- 自定义属性 -->
              <el-divider content-position="left">自定义属性</el-divider>
              <div class="custom-attributes">
                <el-table :data="customAttrsList" :header-cell-style="{background:'#fafafa'}" border size="small">
                  <el-table-column label="属性名" width="200">
                    <template slot-scope="scope">
                      <el-input v-model="scope.row.key" size="mini" placeholder="Key"
                        @input="onCustomAttrChanged" />
                    </template>
                  </el-table-column>
                  <el-table-column label="属性值">
                    <template slot-scope="scope">
                      <el-input v-model="scope.row.value" size="mini" placeholder="Value"
                        @input="onCustomAttrChanged" />
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="80" align="center">
                    <template slot-scope="scope">
                      <el-button size="mini" type="default" plain icon="el-icon-delete" circle @click="deleteCustomAttr(scope.$index)" />
                    </template>
                  </el-table-column>
                </el-table>
                <el-button size="small" type="primary" icon="el-icon-plus" style="margin-top: 8px" @click="addCustomAttr">
                  添加属性
                </el-button>
              </div>

              <!-- 店铺图片 -->
              <el-divider content-position="left">店铺图片</el-divider>
              <div class="image-grid-wrapper">
                <draggable
                  v-model="currentShop.images"
                  class="image-grid"
                  ghost-class="image-ghost"
                  :filter="'.image-upload-box'"
                  @end="onShopImageDragEnd"
                >
                  <div
                    v-for="(img, idx) in currentShop.images"
                    :key="img.id || ('img-' + idx)"
                    class="image-item"
                    :class="{ 'is-cover': img.is_cover }"
                  >
                    <div v-if="img._uploading" class="image-loading">
                      <i class="el-icon-loading" style="font-size: 24px; color: #409eff"></i>
                    </div>
                    <template v-else>
                      <el-image
                        ref="shopImages"
                        style="width: 100px; height: 100px"
                        :src="img.image_url"
                        :preview-src-list="currentShop.images.filter(i => !i._uploading).map(i => i.image_url)"
                        fit="cover"
                      />
                      <div class="image-overlay">
                        <el-button
                          size="mini"
                          icon="el-icon-zoom-in"
                          circle
                          title="放大查看"
                          @click="previewShopImage(idx)"
                        />
                        <el-popconfirm title="确定删除该图片？" @confirm="deleteShopImage(idx)">
                          <el-button slot="reference" size="mini" type="default" plain icon="el-icon-delete" circle />
                        </el-popconfirm>
                      </div>
                      <el-tag v-if="img.is_cover" size="mini" type="warning" class="cover-tag">封面</el-tag>
                    </template>
                  </div>
                  <el-upload
                    class="image-upload-box"
                    :key="'shop-upload-' + (currentShop ? currentShop.id || 'new' : 'empty')"
                    :action="imageUploadUrl"
                    :show-file-list="false"
                    name="file"
                    multiple
                    :headers="uploadHeaders"
                    :on-success="onShopImageUploaded"
                    :before-upload="beforeShopImageUpload"
                  >
                    <div class="upload-trigger">
                      <i class="el-icon-plus"></i>
                      <span>上传</span>
                    </div>
                  </el-upload>
                </draggable>
              </div>

              <!-- 店铺 SKU 差异化表格 -->
              <el-divider content-position="left">SKU 售价</el-divider>
              <el-table
                v-if="currentShop"
                :data="currentShop.variants"
                :header-cell-style="{background:'#fafafa'}"
                border
                size="small"
                style="width: 100%"
                max-height="400">
                <el-table-column type="index" label="#" width="50" align="center" />
                <el-table-column label="SKU" width="130">
                  <template slot-scope="scope">
                    <el-tag size="mini" type="success" effect="plain">{{ scope.row.sku }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="售价" width="120">
                  <template slot="header">
                    <span>售价</span>
                    <el-popover placement="bottom" width="260" trigger="click">
                      <div>
                        <el-input v-model="batchShopPrice" size="mini" style="width: 160px; margin-right: 8px" placeholder="售价" />
                        <el-button size="mini" type="primary" @click="applyBatchShopPrice">应用</el-button>
                      </div>
                      <el-button slot="reference" size="mini" icon="el-icon-edit" circle
                        style="margin-left: 4px; vertical-align: middle" />
                    </el-popover>
                  </template>
                  <template slot-scope="scope">
                    <el-input v-model="scope.row.price" size="mini" placeholder="售价" @input="scope.row._priceChanged = true" />
                  </template>
                </el-table-column>
                <el-table-column label="币种" width="80">
                  <template slot-scope="scope">
                    <span>{{ scope.row.currency }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  v-for="(varLabel, varIdx) in variantNameFields"
                  :key="'var-' + varIdx"
                  :label="varLabel"
                  min-width="100"
                >
                  <template slot-scope="scope">
                    <span>{{ scope.row['var' + (varIdx + 1)] }}</span>
                  </template>
                </el-table-column>
              </el-table>
              <div v-if="currentShop && currentShop.variant_has_more" style="text-align: center; margin-top: 8px">
                <el-button size="small" type="primary" :loading="loadingMore"
                  @click="loadAllVariants">
                  加载全部（{{ currentShop.variant_total }} 条）
                </el-button>
              </div>
            </el-form>

            <!-- 没有店铺时的提示 -->
            <el-empty v-if="!currentShop" description="暂无店铺，请先添加店铺" />
          </el-tab-pane>

          <!-- ==================== Tab 3: 操作日志 ==================== -->
          <el-tab-pane label="操作日志" name="log" :lazy="true">
            <PushLog :product-id="productId" />
          </el-tab-pane>
        </el-tabs>

        <!-- 底栏按钮 -->
        <div class="footer-bar">
          <el-button @click="$emit('cancel')">取 消</el-button>
          <el-button type="primary" :loading="saving" @click="updateProduct">保 存</el-button>
        </div>
      </div>
    </el-skeleton>

    <!-- ==================== 添加店铺弹窗 ==================== -->
    <el-dialog
      title="复制店铺"
      :visible.sync="addShopVisible"
      width="480px"
      append-to-body
      destroy-on-close
      :close-on-click-modal="false"
    >
      <div v-if="currentShop" style="margin-bottom: 12px; color: #606266; font-size: 13px">
        从当前店铺「<b>{{ currentShop.shop_account }}</b>」复制
      </div>
      <el-form ref="addShopFormRef" :model="newShopForm" :rules="newShopRules" label-width="80px">
        <el-form-item label="店铺账号" prop="shop_accounts">
          <el-select v-model="newShopForm.shop_accounts" size="small" placeholder="请选择店铺账号（可多选）" style="width: 100%" multiple filterable :loading="loadingAccounts">
            <el-option
              v-for="acc in availableShopAccounts"
              :key="acc"
              :label="acc"
              :value="acc"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="平台" prop="platform">
          <el-select v-model="newShopForm.platform" size="small" style="width: 100%">
            <el-option label="EBAY" value="EBAY" />
            <el-option label="Amazon" value="Amazon" />
            <el-option label="Shopee" value="Shopee" />
            <el-option label="Lazada" value="Lazada" />
          </el-select>
        </el-form-item>
        <el-form-item label="站点" prop="site">
          <el-select v-model="newShopForm.site" size="small" style="width: 100%">
            <el-option
              v-for="s in siteOptions"
              :key="s.value"
              :label="s.label"
              :value="s.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="addShopVisible = false">取消</el-button>
        <el-button type="primary" :loading="copyingShop" @click="confirmAddShop">确定</el-button>
      </div>
    </el-dialog>

    <!-- ==================== SKU 图片管理弹窗 ==================== -->
    <el-dialog
      :title="'SKU 图片管理 - ' + (currentSkuForImage ? currentSkuForImage.sku : '')"
      :visible.sync="skuImageDialogVisible"
      width="650px"
      append-to-body
      :close-on-click-modal="false"
      @closed="onSkuImageDialogClosed">
      <div v-if="currentSkuForImage" class="image-grid-wrapper">
        <draggable
          v-model="currentSkuForImage.images"
          class="image-grid"
          ghost-class="image-ghost"
          :filter="'.image-upload-box'"
          @end="onSkuImageDragEnd"
        >
          <div
            v-for="(img, idx) in currentSkuForImage.images"
            :key="img.id || ('sku-img-' + idx)"
            class="image-item"
            :class="{ 'is-cover': img.is_cover }"
          >
            <div v-if="img._uploading" class="image-loading">
              <i class="el-icon-loading" style="font-size: 24px; color: #409eff"></i>
            </div>
            <template v-else>
              <el-image
                ref="skuImages"
                style="width: 100px; height: 100px"
                :src="img.image_url"
                :preview-src-list="currentSkuForImage.images.filter(i => !i._uploading).map(i => i.image_url)"
                fit="cover"
              />
              <div class="image-overlay">
                <el-button
                  size="mini"
                  icon="el-icon-zoom-in"
                  circle
                  title="放大查看"
                  @click="previewSkuImage(idx)"
                />
                <el-popconfirm title="确定删除该图片？" @confirm="deleteSkuImage(idx)">
                  <el-button slot="reference" size="mini" type="default" plain icon="el-icon-delete" circle />
                </el-popconfirm>
              </div>
              <el-tag v-if="img.is_cover" size="mini" type="warning" class="cover-tag">封面</el-tag>
            </template>
          </div>
          <el-upload
            class="image-upload-box"
            :key="'sku-upload-' + (currentSkuForImage ? currentSkuForImage.id || currentSkuForImage.sku || 'new' : 'empty')"
            :action="imageUploadUrl"
            :show-file-list="false"
            name="file"
            multiple
            :headers="uploadHeaders"
            :on-success="onSkuImageUploaded"
            :before-upload="beforeSkuImageUpload"
          >
            <div class="upload-trigger">
              <i class="el-icon-plus"></i>
              <span>上传</span>
            </div>
          </el-upload>
        </draggable>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import moment from 'moment'
import draggable from 'vuedraggable'
import { quillEditor } from 'vue-quill-editor'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import PushLog from './PushLog.vue'

export default {
  name: 'PushProductDetail',
  components: {
    draggable,
    quillEditor,
    PushLog
  },
  props: {
    productId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      loading: false,
      saving: false,
      _modified: false,
      _watching: false,
      activeTab: 'basic',
      activeShopTabName: 'shop-0',
      // ---------- 产品数据 ----------
      baseProduct: {
        id: null,
        p_status: '',
        category: '',
        supplier: '',
        series: '',
        tag: '',
        note: '',
        creator: '',
        create_time: '',
        from_site_id: '',
        first_product_group_title: '',
        main_variant_name: '',
        variant_name: '',
        main_variant_list: {},
        variant_editor: null,
        var_mappings: {},
        sku_count: 0,
        group_count: 0,
        images: '',
        product_groups: []
      },
      // ---------- SKU 表格列设置 ----------
      columnSettings: {
        index: true,
        image: true,
        upc: false,
        purchaseUrl: false,
        warehouse: false,
        mbProductStatus: false
      },
      // 批量修改
      batchCost: 0,
      batchWarehouse: '',
      batchShopPrice: 0,
      // SKU 排序
      sortProp: '',
      sortOrder: '',
      // 变体编辑器版本号，用于强制表格刷新
      variantEditorVersion: 0,
      // ---------- 产品标签管理 ----------
      showTagInput: false,
      newTagValue: '',
      editingTagIdx: -1,
      editingTagValue: '',
      // ---------- 变体维度管理 ----------
      showVariantNameInput: false,
      newVariantName: '',
      editingVariantIdx: -1,
      editingVariantValue: '',
      // 记录初始供应商/系列名，用于修改时同步更新 SKU 名称
      _origSupplier: '',
      _origSeries: '',
      // 被移除的 SKU（需发送 _delete: true 的 id）
      deletedCoreSkuIds: [],
      deletedShopIds: [],
      // ---------- 待删除图片跟踪 ----------
      pendingImageDeletes: [],
      // ---------- 自定义属性本地数据 ----------
      customAttrsList: [],
      // ---------- 复制店铺 ----------
      addShopVisible: false,
      loadingAccounts: false,
      copyingShop: false,
      _listingConfigsForShop: '',
      loadingMore: false,
      optimizing: null, // 'title' | 'desc' | null
      optimizeUsage: null, // { total_tokens, total_price }
      newShopForm: {
        shop_accounts: [],
        platform: 'EBAY',
        site: ''
      },
      newShopRules: {
        shop_accounts: [{ required: true, type: 'array', min: 1, message: '请选择店铺账号', trigger: 'change' }],
        platform: [{ required: true, message: '请选择平台', trigger: 'change' }],
        site: [{ required: true, message: '请选择站点', trigger: 'change' }]
      },
      availableShopAccounts: [],
      // 供应商/产品系列选项
      detailSuppliers: [],
      detailSeriesAll: [],
      detailSeriesMap: {},
      // 刊登配置选项
      listingConfigOptions: [],
      listingConfigMap: {},
      // 变体映射批量替换
      replaceFind: '',
      replaceWith: '',
      siteOptions: [],
      siteCurrencyMap: { 'EBAY_AT': 'EUR', 'EBAY_AU': 'AUD', 'EBAY_BE': 'EUR', 'EBAY_CA': 'CAD',
        'EBAY_CH': 'CHF', 'EBAY_DE': 'EUR', 'EBAY_ES': 'EUR', 'EBAY_FR': 'EUR', 'EBAY_GB': 'GBP',
        'EBAY_HK': 'HKD', 'EBAY_IE': 'EUR', 'EBAY_IN': 'INR', 'EBAY_IT': 'EUR', 'EBAY_MY': 'MYR',
        'EBAY_NL': 'EUR', 'EBAY_PH': 'PHP', 'EBAY_PL': 'PLN', 'EBAY_SG': 'SGD', 'EBAY_TH': 'THB',
        'EBAY_TW': 'TWD', 'EBAY_US': 'USD', 'EBAY_VN': 'VND' },
      siteCodes: {
        'EBAY_US': 'US', 'EBAY_AU': 'AU', 'EBAY_CA': 'CA', 'EBAY_DE': 'DE',
        'EBAY_ES': 'ES', 'EBAY_FR': 'FR', 'EBAY_GB': 'GB', 'EBAY_IE': 'IE',
        'EBAY_IN': 'IN', 'EBAY_IT': 'IT', 'EBAY_MY': 'MY', 'EBAY_NL': 'NL',
        'EBAY_PH': 'PH', 'EBAY_PL': 'PL', 'EBAY_SG': 'SG', 'EBAY_TH': 'TH',
        'EBAY_VN': 'VN'
      },
      siteNames: {
        'EBAY_US': '美国', 'EBAY_AU': '澳大利亚', 'EBAY_CA': '加拿大', 'EBAY_DE': '德国',
        'EBAY_ES': '西班牙', 'EBAY_FR': '法国', 'EBAY_GB': '英国', 'EBAY_IE': '爱尔兰',
        'EBAY_IN': '印度', 'EBAY_IT': '意大利', 'EBAY_MY': '马来西亚', 'EBAY_NL': '荷兰',
        'EBAY_PH': '菲律宾', 'EBAY_PL': '波兰', 'EBAY_SG': '新加坡', 'EBAY_TH': '泰国',
        'EBAY_VN': '越南'
      },
      // ---------- SKU 图片弹窗 ----------
      skuImageDialogVisible: false,
      currentSkuForImage: null,
      // ---------- 富文本编辑器 ----------
      quillOptions: {
        theme: 'snow',
        placeholder: '请输入产品描述...',
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ header: [1, 2, 3, false] }],
            ['link', 'image'],
            ['clean']
          ]
        }
      }
    }
  },
  computed: {
    activeShopIndex() {
      const parts = this.activeShopTabName.split('-')
      return parseInt(parts[1], 10) || 0
    },
    currentShop() {
      if (!this.visibleShops.length) return null
      return this.visibleShops[this.activeShopIndex] || null
    },
    visibleShops() {
      if (!this.baseProduct.product_groups) return []
      // 按 id 升序排列，id 为 null 的新店铺排到最后
      return this.baseProduct.product_groups.slice().sort((a, b) => {
        if (a.id == null && b.id == null) return 0
        if (a.id == null) return 1
        if (b.id == null) return -1
        return a.id - b.id
      })
    },
    mainVariantNameList() {
      if (!this.baseProduct.main_variant_name) return []
      return this.baseProduct.main_variant_name.split(',').map(s => s.trim()).filter(Boolean)
    },
    globalVariants() {
      if (!this.baseProduct.product_groups || !this.baseProduct.product_groups.length) {
        return []
      }
      return this.baseProduct.product_groups[0].variants || []
    },
    sortedGlobalVariants() {
      const list = this.globalVariants.slice()
      if (!this.sortProp || !this.sortOrder) return list
      return list.sort((a, b) => {
        const va = a[this.sortProp] != null ? String(a[this.sortProp]) : ''
        const vb = b[this.sortProp] != null ? String(b[this.sortProp]) : ''
        const cmp = va.localeCompare(vb, undefined, { numeric: true })
        return this.sortOrder === 'ascending' ? cmp : -cmp
      })
    },
    hasMoreGlobalVariants() {
      if (!this.baseProduct.product_groups) return false
      return this.baseProduct.product_groups.some(g => g.variant_has_more)
    },
    globalVariantTotal() {
      if (!this.baseProduct.product_groups || !this.baseProduct.product_groups.length) return 0
      return this.baseProduct.product_groups[0].variant_total || 0
    },
    groupCount() {
      if (!this.baseProduct.product_groups) return 0
      return this.baseProduct.product_groups.filter(s => s._status !== 'deleted').length
    },
    skuCount() {
      return this.globalVariants.length
    },
    variantNameFields() {
      if (!this.currentShop || !this.currentShop.variant_name) return []
      return this.currentShop.variant_name.split(',').map(s => s.trim()).filter(Boolean)
    },
    productMainImage() {
      return this.baseProduct.images || ''
    },
    uploadHeaders() {
      const token = window.localStorage.getItem('tokenStr')
      return token ? { Authorization: token } : {}
    },
    tagList() {
      const raw = this.baseProduct.tag || ''
      return raw.split(',').map(s => s.trim()).filter(Boolean)
    },

    detailSeriesOptions() {
      const sup = this.detailSuppliers.find(s => s.name === this.baseProduct.supplier)
      return sup ? (this.detailSeriesMap[sup.id] || []) : this.detailSeriesAll
    },
    imageUploadUrl() {
      return 'api/base_product_group/upload_image/'
    }
  },
  watch: {
    currentShop: {
      immediate: true,
      handler(newShop) {
        this.syncCustomAttrsFromShop(newShop)
      }
    },
    'baseProduct.supplier': function (newVal, oldVal) {
      if (this._origSupplier && oldVal !== undefined && oldVal !== newVal) {
        this.updateSkuNamesForField(oldVal, newVal, 'supplier')
        this._origSupplier = newVal
      }
    },
    'baseProduct.series': function (newVal, oldVal) {
      if (this._origSeries && oldVal !== undefined && oldVal !== newVal) {
        this.updateSkuNamesForField(oldVal, newVal, 'series')
        this._origSeries = newVal
      }
    },
    baseProduct: {
      deep: true,
      handler() {
        if (this._watching) {
          this._modified = true
        }
      }
    },
    activeShopTabName() {
      // 只触发，不在此加载数据
    }
  },
  filters: {
    dateFormat(value) {
      if (!value) return ''
      return moment(value).format('YYYY-MM-DD HH:mm')
    }
  },
  mounted() {
    this.buildSiteOptions()
    this.initProduct()
  },
  methods: {
    // ===================== 数据加载 =====================
    loadAllVariants() {
      if (!this.currentShop) return
      this.loadingMore = true
      this.getRequest('api/base_product_group/' + this.productId + '/?variant_page_size=0').then(resp => {
        this.loadingMore = false
        if (resp && resp.product_groups) {
          // 将完整 variant 数据合并回当前 product_groups
          this.baseProduct.product_groups = resp.product_groups.map(g => {
            const old = this.baseProduct.product_groups.find(o => o.id === g.id)
            if (old) {
              return { ...old, variants: g.variants, variant_total: g.variant_total, variant_has_more: g.variant_has_more }
            }
            return g
          })
          // 刷新当前店铺引用
          this.$nextTick(() => { this._watching = true })
        }
      }).catch(() => { this.loadingMore = false })
    },

    initProduct() {
      this._watching = false
      this.loading = true
      this.getRequest('api/base_product_group/' + this.productId + '/').then(resp => {
        this.loading = false
        if (resp) {
          this.baseProduct = resp
          this._origSupplier = resp.supplier || ''
          this._origSeries = resp.series || ''
          this.deletedCoreSkuIds = []
          this.deletedShopIds = []
          this.pendingImageDeletes = []
          this.markAllStatus(this.baseProduct)
          if (this.baseProduct.product_groups && this.baseProduct.product_groups.length) {
            this.activeShopTabName = 'shop-0'
          }
          this.$nextTick(() => {
            this._watching = true
          })
        }
      }).catch(() => {
        this.loading = false
      })
    },

    markAllStatus(product) {
      ;(product.product_groups || []).forEach(shop => {
        shop._status = 'unchanged'
        shop._shopDirty = false
        shop._listingConfigId = (shop.listing_config_detail && shop.listing_config_detail.id) || null
        ;(shop.images || []).forEach(img => { img._status = 'unchanged' })
        ;(shop.variants || []).forEach(v => {
          v._status = 'unchanged'
          v._priceChanged = false
          ;(v.images || []).forEach(img => { img._status = 'unchanged' })
        })
      })
    },

    // ===================== 产品标签管理 =====================
    addTag() {
      this._modified = true
      const tag = this.newTagValue.trim()
      if (!tag) { this.showTagInput = false; return }
      const list = this.tagList.slice()
      if (list.includes(tag)) { this.$message.warning('标签已存在'); this.showTagInput = false; return }
      list.push(tag)
      this.baseProduct.tag = list.join(',')
      this.newTagValue = ''
      this.showTagInput = false
    },

    removeTag(idx) {
      this._modified = true
      const list = this.tagList.slice()
      list.splice(idx, 1)
      this.baseProduct.tag = list.join(',')
    },

    startEditTag(idx, tag) {
      this.editingTagIdx = idx
      this.editingTagValue = tag
      this.$nextTick(() => {
        const inputs = this.$refs.editTagInput
        if (inputs && inputs.length) { inputs[0].focus(); inputs[0].select() }
      })
    },

    commitEditTag(idx) {
      this._modified = true
      const newVal = this.editingTagValue.trim()
      this.editingTagIdx = -1
      if (!newVal) return
      const list = this.tagList.slice()
      if (list.includes(newVal) && newVal !== list[idx]) {
        this.$message.warning('标签已存在')
        return
      }
      list[idx] = newVal
      this.baseProduct.tag = list.join(',')
    },

    // ===================== 变体维度管理 =====================
    addMainVariantName() {
      this._modified = true
      const name = this.newVariantName.trim()
      if (!name) {
        this.showVariantNameInput = false
        return
      }
      const list = this.mainVariantNameList.slice()
      if (list.includes(name)) {
        this.$message.warning('该维度名已存在')
        this.newVariantName = ''
        this.showVariantNameInput = false
        return
      }
      list.push(name)
      this.baseProduct.main_variant_name = list.join(',')
      // 初始化该维度的值
      if (!this.baseProduct.main_variant_list) {
        this.baseProduct.main_variant_list = {}
      }
      if (!this.baseProduct.main_variant_list[name]) {
        this.$set(this.baseProduct.main_variant_list, name, [])
      }
      if (!this.baseProduct.variant_editor) {
        this.$set(this.baseProduct, 'variant_editor', {})
      }
      if (!this.baseProduct.variant_editor[name]) {
        this.$set(this.baseProduct.variant_editor, name, {})
      }
      this.variantEditorVersion++
      this.newVariantName = ''
      this.showVariantNameInput = false
    },

    removeMainVariantName(idx) {
      if (this.hasMoreGlobalVariants) {
        this.$message.warning('请先点击"加载全部"按钮加载完整 SKU 列表，再进行删除操作')
        return
      }
      this._modified = true
      const list = this.mainVariantNameList.slice()
      const removed = list.splice(idx, 1)[0]
      this.baseProduct.main_variant_name = list.join(',')
      // 删除对应的变体值列表
      if (this.baseProduct.main_variant_list && this.baseProduct.main_variant_list[removed]) {
        this.$delete(this.baseProduct.main_variant_list, removed)
      }
      // 删除对应的 variant_editor 和 var_mappings
      if (this.baseProduct.variant_editor && this.baseProduct.variant_editor[removed]) {
        this.$delete(this.baseProduct.variant_editor, removed)
      }
      if (this.baseProduct.var_mappings && this.baseProduct.var_mappings[removed]) {
        this.$delete(this.baseProduct.var_mappings, removed)
      }
      this.variantEditorVersion++
      // 清除 SKU 中对应的 var 字段
      this.globalVariants.forEach(v => {
        for (let i = idx + 1; i <= list.length + 1; i++) {
          if (v['var' + i]) {
            v['var' + (i - 1)] = v['var' + i]
          }
        }
        v['var' + (list.length + 1)] = ''
      })
    },

    startEditVariantName(idx, name) {
      this.editingVariantIdx = idx
      this.editingVariantValue = name
      this.$nextTick(() => {
        const inputs = this.$refs.editVariantNameInput
        if (inputs && inputs.length) {
          inputs[0].focus()
          inputs[0].select()
        }
      })
    },

    commitEditVariantName(idx) {
      const newName = this.editingVariantValue.trim()
      this.editingVariantIdx = -1
      if (!newName) return
      const list = this.mainVariantNameList.slice()
      if (newName === list[idx]) return
      if (list.includes(newName)) {
        this.$message.warning('该维度名已存在')
        return
      }
      const oldName = list[idx]
      list[idx] = newName
      this.baseProduct.main_variant_name = list.join(',')
      // 更新 variant_editor key
      if (this.baseProduct.variant_editor && this.baseProduct.variant_editor[oldName]) {
        const editorData = this.baseProduct.variant_editor[oldName]
        this.$set(this.baseProduct.variant_editor, newName, editorData)
        this.$delete(this.baseProduct.variant_editor, oldName)
      }
      // 更新 var_mappings key
      if (this.baseProduct.var_mappings && this.baseProduct.var_mappings[oldName]) {
        const mappingData = this.baseProduct.var_mappings[oldName]
        this.$set(this.baseProduct.var_mappings, newName, mappingData)
        this.$delete(this.baseProduct.var_mappings, oldName)
      }
      // 更新 main_variant_list key
      if (this.baseProduct.main_variant_list && this.baseProduct.main_variant_list[oldName]) {
        const listData = this.baseProduct.main_variant_list[oldName]
        this.$set(this.baseProduct.main_variant_list, newName, listData)
        this.$delete(this.baseProduct.main_variant_list, oldName)
      }
      this.variantEditorVersion++
    },

    getVariantEditorRows(varName) {
      if (!this.baseProduct.variant_editor || !this.baseProduct.variant_editor[varName]) return []
      const dim = this.baseProduct.variant_editor[varName]
      return Object.keys(dim).map(key => ({ key, _origKey: key, mapping: dim[key] }))
    },

    getVarMapping(dimName, value) {
      if (!this.baseProduct.var_mappings) return ''
      const dim = this.baseProduct.var_mappings[dimName]
      return (dim && dim[value]) ? dim[value] : ''
    },

    setVarMapping(dimName, value, chineseName) {
      this._modified = true
      if (!this.baseProduct.var_mappings) {
        this.$set(this.baseProduct, 'var_mappings', {})
      }
      if (!this.baseProduct.var_mappings[dimName]) {
        this.$set(this.baseProduct.var_mappings, dimName, {})
      }
      if (chineseName) {
        this.$set(this.baseProduct.var_mappings[dimName], value, chineseName)
      } else {
        // 清空则删除该 key，保持 var_mappings 干净
        this.$delete(this.baseProduct.var_mappings[dimName], value)
      }
    },

    applyBulkReplace(dimName) {
      const find = (this.replaceFind || '')
      const replace = (this.replaceWith || '')
      if (!find.trim()) { this.$message.warning('请输入要查找的英文文本'); return }
      if (!replace.trim()) { this.$message.warning('请输入替换后的中文文本'); return }
      const rows = this.getVariantEditorRows(dimName)
      let count = 0
      rows.forEach(row => {
        const enValue = row.key || ''
        if (enValue.includes(find)) {
          const cnValue = enValue.replace(new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replace)
          this.setVarMapping(dimName, enValue, cnValue)
          count++
        }
      })
      this.replaceFind = ''
      this.replaceWith = ''
      this.$message.success('已替换 ' + count + ' 条映射')
    },

    addVariantValue(dimName) {
      if (!this.baseProduct.variant_editor) {
        this.$set(this.baseProduct, 'variant_editor', {})
      }
      if (!this.baseProduct.variant_editor[dimName]) {
        this.$set(this.baseProduct.variant_editor, dimName, {})
      }
      // 生成唯一默认名
      let baseName = 'new_value'
      let idx = 1
      while (this.baseProduct.variant_editor[dimName][baseName] !== undefined) {
        baseName = 'new_value_' + (idx++)
      }
      this.$set(this.baseProduct.variant_editor[dimName], baseName, '')
      // 同步到 main_variant_list
      this.syncVariantEditorToList(dimName)
      this.variantEditorVersion++
      // 同步 SKU 列表
      this.syncSkusAfterVariantAdd(dimName, baseName)
    },

    editVariantValue(dimName, oldKey, newKey) {
      if (!newKey || !newKey.trim()) return
      newKey = newKey.trim()
      if (oldKey === newKey) return
      const dim = this.baseProduct.variant_editor[dimName]
      if (!dim || dim[newKey] !== undefined) {
        this.$message.warning('该值已存在')
        return
      }
      // 保留旧值，写入新 key
      const oldMapping = dim[oldKey]
      this.$set(dim, newKey, oldMapping)
      this.$delete(dim, oldKey)
      // 同步更新 var_mappings
      if (this.baseProduct.var_mappings && this.baseProduct.var_mappings[dimName]) {
        const mapDim = this.baseProduct.var_mappings[dimName]
        if (mapDim[oldKey] !== undefined) {
          this.$set(mapDim, newKey, mapDim[oldKey])
          this.$delete(mapDim, oldKey)
        }
      }
      // 同步到 main_variant_list
      this.syncVariantEditorToList(dimName)
      this.variantEditorVersion++
      // 同步 SKU 中对应的 var 值
      this.syncSkusAfterVariantEdit(dimName, oldKey, newKey)
    },

    deleteVariantValue(dimName, value) {
      if (this.hasMoreGlobalVariants) {
        this.$message.warning('请先点击"加载全部"按钮加载完整 SKU 列表，再进行删除操作')
        return
      }
      if (!this.baseProduct.variant_editor || !this.baseProduct.variant_editor[dimName]) return
      this.$delete(this.baseProduct.variant_editor[dimName], value)
      // 同步删除 var_mappings 中的映射
      if (this.baseProduct.var_mappings && this.baseProduct.var_mappings[dimName]) {
        this.$delete(this.baseProduct.var_mappings[dimName], value)
      }
      // 同步到 main_variant_list
      this.syncVariantEditorToList(dimName)
      this.variantEditorVersion++
      // 同步删除对应 SKU
      this.syncSkusAfterVariantDelete(dimName, value)
    },

    // —— SKU 同步：新增变体值 ——
    syncSkusAfterVariantAdd(dimName, newValue) {
      const varIdx = this.mainVariantNameList.indexOf(dimName)
      if (varIdx < 0) return
      const varField = 'var' + (varIdx + 1)

      // 取一个参考 SKU，用于填充价格等字段
      const refSku = this.globalVariants[0] || null

      // 获取其他维度的所有当前值
      const otherDims = this.mainVariantNameList.filter((_, i) => i !== varIdx)
      if (otherDims.length === 0) {
        // 只有一个维度，直接添加一个 SKU
        this.addSkuToAllShops(this.makeNewSku({ [varField]: newValue }, refSku))
      } else {
        // 多个维度：找出所有其他维度值的组合
        const combos = this.getExistingCombinations(varIdx)
        combos.forEach(combo => {
          const fields = { [varField]: newValue, ...combo }
          this.addSkuToAllShops(this.makeNewSku(fields, refSku))
        })
      }
    },

    // —— SKU 同步：重命名变体值 ——
    syncSkusAfterVariantEdit(dimName, oldKey, newKey) {
      const varIdx = this.mainVariantNameList.indexOf(dimName)
      if (varIdx < 0) return
      const varField = 'var' + (varIdx + 1)
      this.baseProduct.product_groups.forEach(shop => {
        if (shop._status === 'deleted') return
        shop.variants.forEach(v => {
          if (v[varField] === oldKey) {
            v[varField] = newKey
            if (v._status === 'unchanged') v._status = 'modified'
          }
        })
      })
    },

    // —— SKU 同步：删除变体值 ——
    syncSkusAfterVariantDelete(dimName, deletedValue) {
      const varIdx = this.mainVariantNameList.indexOf(dimName)
      if (varIdx < 0) return
      const varField = 'var' + (varIdx + 1)
      this.baseProduct.product_groups.forEach((shop, shopIdx) => {
        if (shop._status === 'deleted') return
        const kept = []
        for (let i = 0; i < shop.variants.length; i++) {
          const v = shop.variants[i]
          if (v[varField] === deletedValue) {
            if (v.id && !this.deletedCoreSkuIds.includes(v.id)) {
              this.deletedCoreSkuIds.push(v.id)
            }
          } else {
            kept.push(v)
          }
        }
        // 用 $set 替换整个数组，保证 Vue 2 响应式
        this.$set(this.baseProduct.product_groups[shopIdx], 'variants', kept)
      })
    },

    // 获取当前 SKU 中除指定维度外的其他维度值的唯一组合
    getExistingCombinations(excludeIdx) {
      const map = {}
      this.globalVariants.forEach(v => {
        const parts = []
        this.mainVariantNameList.forEach((_, i) => {
          if (i !== excludeIdx) {
            parts.push('var' + (i + 1) + '=' + (v['var' + (i + 1)] || ''))
          }
        })
        const key = parts.join('|')
        if (!map[key]) {
          const combo = {}
          this.mainVariantNameList.forEach((_, i) => {
            if (i !== excludeIdx) {
              combo['var' + (i + 1)] = v['var' + (i + 1)] || ''
            }
          })
          map[key] = combo
        }
      })
      return Object.values(map)
    },

    makeNewSku(fields, refSku) {
      return {
        id: null,
        sku: '待分配',
        p_name: refSku ? refSku.p_name : '',
        cost: refSku ? refSku.cost : '0.00',
        UPC: refSku ? refSku.UPC : '',
        purchase_url: refSku ? refSku.purchase_url : '',
        title: '',
        desc: '',
        price: refSku ? refSku.price : '0.00',
        currency: refSku ? refSku.currency : 'USD',
        var1: fields.var1 || '',
        var2: fields.var2 || '',
        var3: fields.var3 || '',
        var4: fields.var4 || '',
        custom_attributes: null,
        images: [],
        _status: 'new'
      }
    },

    addSkuToAllShops(newSku) {
      this.baseProduct.product_groups.forEach(shop => {
        if (shop._status === 'deleted') return
        shop.variants.push({ ...newSku })
        if (shop._status === 'unchanged') shop._status = 'modified'
      })
    },

    // —— 供应商/系列名变更时同步更新 SKU 名称 ——
    updateSkuNamesForField(oldName, newName, fieldType) {
      if (!oldName || oldName === newName) return
      this.baseProduct.product_groups.forEach(shop => {
        if (shop._status === 'deleted') return
        shop.variants.forEach(v => {
          if (v._status === 'deleted') return
          if (v.p_name && v.p_name.includes(oldName)) {
            v.p_name = v.p_name.replace(new RegExp(oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newName)
            if (v._status === 'unchanged') v._status = 'modified'
          }
        })
      })
    },

    syncVariantEditorToList(dimName) {
      const dim = this.baseProduct.variant_editor && this.baseProduct.variant_editor[dimName]
      const keys = dim ? Object.keys(dim) : []
      if (!this.baseProduct.main_variant_list) {
        this.$set(this.baseProduct, 'main_variant_list', {})
      }
      this.$set(this.baseProduct.main_variant_list, dimName, keys)
    },

    // ===================== 排序 =====================
    onSkuSortChange({ prop, order }) {
      this.sortProp = prop
      this.sortOrder = order || ''
    },

    // ===================== 批量修改 =====================
    applyBatchCost() {
      this.baseProduct.product_groups.forEach(shop => {
        if (shop._status === 'deleted') return
        shop.variants.forEach(v => {
          if (v._status === 'deleted') return
          v.cost = String(this.batchCost)
          if (v._status === 'unchanged') v._status = 'modified'
        })
        if (shop._status === 'unchanged') shop._status = 'modified'
      })
    },

    applyBatchShopPrice() {
      if (!this.currentShop) return
      this.currentShop.variants.forEach(v => {
        if (v._status === 'deleted') return
        v.price = String(this.batchShopPrice)
        v._priceChanged = true
        if (v._status === 'unchanged') v._status = 'modified'
      })
    },

    applyBatchWarehouse(val) {
      if (!val && val !== '') return
      this.baseProduct.product_groups.forEach(shop => {
        if (shop._status === 'deleted') return
        shop.variants.forEach(v => {
          if (v._status === 'deleted') return
          v.warehouse = val
          if (v._status === 'unchanged') v._status = 'modified'
        })
        if (shop._status === 'unchanged') shop._status = 'modified'
      })
    },

    showBatchWarehouseDialog() {
      this.$prompt('请输入仓库名称', '批量修改仓库', {
        confirmButtonText: '应用',
        cancelButtonText: '取消',
        inputValue: this.batchWarehouse
      }).then(({ value }) => {
        this.batchWarehouse = value
        this.applyBatchWarehouse(value)
      }).catch(() => {})
    },

    // ===================== 列设置 =====================
    toggleColumn(command) {
      const keyMap = {
        index: 'index',
        image: 'image',
        upc: 'upc',
        purchase_url: 'purchaseUrl',
        warehouse: 'warehouse',
        mb_product_status: 'mbProductStatus'
      }
      const key = keyMap[command]
      if (key) {
        this.columnSettings[key] = !this.columnSettings[key]
      }
    },

    // ===================== 自定义属性 =====================
    syncCustomAttrsFromShop(shop) {
      if (!shop || !shop.custom_attributes || typeof shop.custom_attributes !== 'object') {
        this.customAttrsList = []
        return
      }
      const attrs = shop.custom_attributes
      this.customAttrsList = Object.keys(attrs).map(key => ({ key, value: attrs[key] }))
    },

    onCustomAttrChanged() {
      this._modified = true
      this.writeCustomAttrsBack()
    },

    writeCustomAttrsBack() {
      if (!this.currentShop) return
      const newAttrs = {}
      this.customAttrsList.forEach(row => {
        if (row.key) {
          newAttrs[row.key] = row.value || ''
        }
      })
      this.currentShop.custom_attributes = newAttrs
      this.currentShop._shopDirty = true
      if (this.currentShop._status === 'unchanged') {
        this.currentShop._status = 'modified'
      }
    },

    addCustomAttr() {
      this._modified = true
      this.customAttrsList.push({ key: '', value: '' })
      this.writeCustomAttrsBack()
    },

    deleteCustomAttr(index) {
      this._modified = true
      this.customAttrsList.splice(index, 1)
      this.writeCustomAttrsBack()
    },

    // ===================== 产品主图 =====================
    beforeShopImageUpload(file) {
      if (!this.beforeImageUpload(file)) return false
      if (!this.currentShop) return false
      if (!this.currentShop.images) this.$set(this.currentShop, 'images', [])
      this.currentShop.images.push({ _uploading: true, _tempId: Date.now() })
      return true
    },

    beforeSkuImageUpload(file) {
      if (!this.beforeImageUpload(file)) return false
      if (!this.currentSkuForImage) return false
      if (!this.currentSkuForImage.images) this.$set(this.currentSkuForImage, 'images', [])
      this.currentSkuForImage.images.push({ _uploading: true, _tempId: Date.now() })
      return true
    },

    beforeImageUpload(file) {
      const isImage = file.type.startsWith('image/')
      if (!isImage) {
        this.$message.error('只能上传图片文件！')
        return false
      }
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isLt2M) {
        this.$message.error('图片大小不能超过 2MB！')
        return false
      }
      return true
    },

    onProductImageUploaded(resp) {
      if (resp && resp.url) {
        if (!this.baseProduct.images) {
          this.baseProduct.images = []
        }
        const newImg = {
          id: resp.id || null,
          image_url: resp.url,
          sort: this.baseProduct.images.length,
          is_cover: false,
          _status: 'new'
        }
        this.baseProduct.images.push(newImg)
        this.$message.success('主图上传成功')
      }
    },

    // ===================== 店铺图片 =====================
    onShopImageDragEnd() {
      this._modified = true
      if (!this.currentShop) return
      this.currentShop._shopDirty = true
      this.currentShop.images.forEach((img, i) => {
        img.sort = i
        img.is_cover = i === 0
      })
      if (this.currentShop._status === 'unchanged') {
        this.currentShop._status = 'modified'
      }
    },

    onShopImageUploaded(resp) {
      if (resp && resp.url && this.currentShop) {
        this.currentShop._shopDirty = true
        // 替换占位 loading
        const idx = this.currentShop.images.findIndex(i => i._uploading)
        const newImg = {
          id: resp.id || null,
          image_url: resp.url,
          sort: this.currentShop.images.length - 1,
          is_cover: this.currentShop.images.length === 1,
          _status: 'new'
        }
        if (idx >= 0) {
          this.$set(this.currentShop.images, idx, newImg)
        } else {
          this.currentShop.images.push(newImg)
        }
        if (this.currentShop._status === 'unchanged') {
          this.currentShop._status = 'modified'
        }
        this.$message.success('图片上传成功')
      } else {
        // 上传失败，移除占位
        const idx = this.currentShop ? this.currentShop.images.findIndex(i => i._uploading) : -1
        if (idx >= 0) this.currentShop.images.splice(idx, 1)
      }
    },

    previewShopImage(idx) {
      const images = this.$refs.shopImages
      if (images && images[idx]) {
        images[idx].clickHandler()
      }
    },

    previewSkuImage(idx) {
      const images = this.$refs.skuImages
      if (images && images[idx]) {
        images[idx].clickHandler()
      }
    },
    setShopImageCover(img) {
      if (!this.currentShop) return
      this.currentShop.images.forEach(i => { i.is_cover = false })
      img.is_cover = true
      if (this.currentShop._status === 'unchanged') {
        this.currentShop._status = 'modified'
      }
    },

    deleteShopImage(idx) {
      this._modified = true
      if (!this.currentShop) return
      this.currentShop._shopDirty = true
      const removed = this.currentShop.images.splice(idx, 1)[0]
      if (removed && removed.id) {
        this.pendingImageDeletes.push({ id: removed.id, level: 'shop' })
      }
      if (this.currentShop._status === 'unchanged') {
        this.currentShop._status = 'modified'
      }
    },

    // ===================== SKU 图片 =====================
    openSkuImageDialog(variant) {
      if (!variant.images) this.$set(variant, 'images', [])
      this.currentSkuForImage = variant
      this.skuImageDialogVisible = true
    },

    onSkuImageDialogClosed() {
      this.currentSkuForImage = null
    },

    onSkuImageDragEnd() {
      if (!this.currentSkuForImage) return
      this.currentSkuForImage.images.forEach((img, i) => {
        img.sort = i
        img.is_cover = i === 0
      })
      if (this.currentSkuForImage._status === 'unchanged') {
        this.currentSkuForImage._status = 'modified'
      }
    },

    onSkuImageUploaded(resp) {
      // Element UI el-upload 的 on-success 参数可能是字符串或已解析对象
      const data = typeof resp === 'string' ? JSON.parse(resp) : resp
      const imageUrl = (data && data.url) ? data.url : ''
      if (imageUrl && this.currentSkuForImage) {
        if (!this.currentSkuForImage.images) {
          this.$set(this.currentSkuForImage, 'images', [])
        }
        const images = this.currentSkuForImage.images
        const idx = images.findIndex(i => i._uploading)
        const newImg = {
          id: data.id || null,
          image_url: imageUrl,
          sort: images.length - 1,
          is_cover: images.length === 1,
          _status: 'new'
        }
        if (idx >= 0) {
          this.$set(images, idx, newImg)
        } else {
          images.push(newImg)
        }
        if (this.currentSkuForImage._status === 'unchanged') {
          this.currentSkuForImage._status = 'modified'
        }
        this.$message.success('SKU 图片上传成功')
      } else {
        // 上传失败，移除占位
        const arr = this.currentSkuForImage ? this.currentSkuForImage.images : null
        if (arr) {
          const idx = arr.findIndex(i => i._uploading)
          if (idx >= 0) arr.splice(idx, 1)
        }
        if (!imageUrl) {
          this.$message.error('SKU 图片上传失败：未获取到图片地址')
        }
      }
    },

    setSkuImageCover(img) {
      if (!this.currentSkuForImage) return
      this.currentSkuForImage.images.forEach(i => { i.is_cover = false })
      img.is_cover = true
      if (this.currentSkuForImage._status === 'unchanged') {
        this.currentSkuForImage._status = 'modified'
      }
    },

    deleteSkuImage(idx) {
      if (!this.currentSkuForImage) return
      const removed = this.currentSkuForImage.images.splice(idx, 1)[0]
      if (removed && removed.id) {
        this.pendingImageDeletes.push({ id: removed.id, level: 'sku' })
      }
      if (this.currentSkuForImage._status === 'unchanged') {
        this.currentSkuForImage._status = 'modified'
      }
    },

    // ===================== 全局 SKU 管理 =====================
    addGlobalSku() {
      if (!this.baseProduct.product_groups || !this.baseProduct.product_groups.length) return
      const newSku = {
        id: null,
        sku: '',
        p_name: '',
        cost: '0.00',
        UPC: '',
        purchase_url: '',
        title: '',
        desc: '',
        price: '0.00',
        currency: 'USD',
        var1: '',
        var2: '',
        var3: '',
        var4: '',
        custom_attributes: null,
        images: [],
        _status: 'new'
      }
      // 添加到第一个店铺
      this.baseProduct.product_groups[0].variants.push(newSku)
      // 同步新建到其他所有可见店铺
      for (let i = 1; i < this.baseProduct.product_groups.length; i++) {
        const shop = this.baseProduct.product_groups[i]
        if (shop._status === 'deleted') continue
        shop.variants.push({
          ...newSku,
          _status: 'new'
        })
        if (shop._status === 'unchanged') shop._status = 'modified'
      }
    },

    deleteGlobalSku(index) {
      this._modified = true
      if (!this.globalVariants[index]) return
      const skuCode = this.globalVariants[index].sku
      this.baseProduct.product_groups.forEach((shop, shopIdx) => {
        if (shop._status === 'deleted') return
        const kept = []
        for (let i = 0; i < shop.variants.length; i++) {
          const v = shop.variants[i]
          if (v.sku === skuCode) {
            if (v.id && !this.deletedCoreSkuIds.includes(v.id)) {
              this.deletedCoreSkuIds.push(v.id)
            }
          } else {
            kept.push(v)
          }
        }
        this.$set(this.baseProduct.product_groups[shopIdx], 'variants', kept)
      })
    },

    ensureSupplierOptions() {
      if (this.detailSuppliers.length) return
      this.loadSupplierOptions()
    },

    loadSupplierOptions() {
      this.getRequest('api/base_suppliers/quick_list/').then(resp => {
        if (resp && Array.isArray(resp)) {
          this.detailSuppliers = resp
          const map = {}
          const all = []
          resp.forEach(sup => {
            if (sup.series && sup.series.length) {
              map[sup.id] = sup.series
              all.push(...sup.series)
            }
          })
          this.detailSeriesAll = all
          this.detailSeriesMap = map
        }
      })
    },

    loadListingConfigs(shopAccount, site) {
      // 无参数调用且已加载过就跳过
      if (shopAccount === undefined && site === undefined && Object.keys(this.listingConfigMap).length) return
      let url = 'api/listing_configs/?page_size=100'
      if (shopAccount !== undefined) {
        // 匹配当前店铺账号 或 空值（通用配置）
        url += '&match_shop_account=' + encodeURIComponent(shopAccount) + ',__empty__'
      }
      if (site) {
        url += '&match_site=' + encodeURIComponent(site)
      }
      this.getRequest(url).then(resp => {
        if (resp && resp.results) {
          const map = {}
          const opts = []
          resp.results.forEach(c => {
            map[c.id] = c
            opts.push({ id: c.id, name: c.name })
          })
          this.listingConfigMap = map
          this.listingConfigOptions = opts
        }
      })
    },

    refreshListingConfigs() {
      if (!this.currentShop) return
      if (this._listingConfigsForShop === this.currentShop.shop_account + '|' + this.currentShop.site) return
      this._listingConfigsForShop = this.currentShop.shop_account + '|' + this.currentShop.site
      // 先确保基础刊登配置已加载（用于名称映射）
      this.loadListingConfigs()
      this.loadListingConfigs(this.currentShop.shop_account, this.currentShop.site)
    },

    onListingConfigChange(val) {
      if (!this.currentShop) return
      this.currentShop._shopDirty = true
      if (val && this.listingConfigMap[val]) {
        this.$set(this.currentShop, 'listing_config_detail', this.listingConfigMap[val])
      } else if (!val) {
        this.$set(this.currentShop, 'listing_config_detail', null)
      }
    },

    searchDetailSuppliers(query, cb) {
      const q = (query || '').toLowerCase()
      cb(this.detailSuppliers.filter(s => s.name.toLowerCase().includes(q)).map(s => ({ value: s.name, favorite: !!s.is_favorite })))
    },

    searchDetailSeries(query, cb) {
      const q = (query || '').toLowerCase()
      const options = this.detailSeriesOptions.filter(s => s.name.toLowerCase().includes(q)).map(s => ({ value: s.name }))
      cb(options)
    },

    onDetailSupplierChange() {
      this.baseProduct.series = ''
    },

    buildSiteOptions() {
      this.siteOptions = Object.keys(this.siteCodes).map(value => {
        const code = this.siteCodes[value]
        const flag = this.getFlagEmoji(code)
        return { label: flag + ' ' + this.siteNames[value], value }
      })
    },

    getSiteCode(site) {
      return this.siteCodes[site] || ''
    },

    getSiteName(site) {
      return this.siteNames[site] || site || ''
    },

    getFlagEmoji(code) {
      if (!code || code.length !== 2) return ''
      const cp = code.toUpperCase().split('').map(c => 0x1F1E6 + c.charCodeAt(0) - 65)
      return String.fromCodePoint(...cp)
    },

    getShopLabel(shop) {
      const account = shop.shop_account || '新店铺'
      if (!shop.site) return account
      const code = this.siteCodes[shop.site]
      if (!code) return account
      return this.getFlagEmoji(code) + ' ' + account
    },

    onTabClick(tab) {
      if (tab.name === 'shop') {
        this.loadListingConfigs()
      }
    },

    onShopTabEdit(targetName, action) {
      if (action !== 'remove') return
      if (!this.baseProduct.product_groups) return
      const idx = parseInt(targetName.split('-')[1], 10)
      const shop = this.visibleShops[idx]
      if (!shop) return
      if (this.visibleShops.length <= 1) {
        this.$message.warning('至少保留一个店铺')
        return
      }
      // 从 product_groups 中找到并移除
      const realIdx = this.baseProduct.product_groups.indexOf(shop)
      if (realIdx >= 0) {
        const removed = this.baseProduct.product_groups.splice(realIdx, 1)[0]
        if (removed && removed.id) {
          this.deletedShopIds.push(removed.id)
        }
      }
      this.$nextTick(() => {
        if (this.visibleShops.length) {
          this.activeShopTabName = 'shop-' + Math.min(idx, this.visibleShops.length - 1)
        }
      })
    },

    // ===================== 店铺管理 =====================
    getShopKey(shop, idx) {
      return shop.id ? 'shop-' + shop.id : 'newshop-' + idx
    },

    optimizeShopContent(type) {
      if (!this.currentShop || !this.currentShop.id) {
        this.$message.warning('请先保存店铺后再使用 AI 优化')
        return
      }
      const key = type === 'EBAY_TITLE' ? 'title' : 'desc'
      this.optimizing = key
      this.optimizeUsage = null
      // 标记为优化中
      if (type === 'EBAY_TITLE') {
        this.$set(this.currentShop, 'title_optimized', false)
      } else {
        this.$set(this.currentShop, 'desc_optimized', false)
      }
      this.postRequest('api/product_group/optimize/', {
        id: this.currentShop.id,
        type: type
      }).then(resp => {
        this.optimizing = null
        if (resp) {
          if (type === 'EBAY_TITLE' && resp.title) {
            this.currentShop.title = resp.title
            this.$set(this.currentShop, 'title_optimized', resp.title_optimized != null ? resp.title_optimized : true)
            this.currentShop._shopDirty = true
          } else if (type === 'EBAY_DESC' && resp.desc) {
            this.currentShop.desc = resp.desc.replace(/\n/g, '<br>')
            this.$set(this.currentShop, 'desc_optimized', resp.desc_optimized != null ? resp.desc_optimized : true)
            this.currentShop._shopDirty = true
          }
          if (resp.usage) {
            this.optimizeUsage = resp.usage
          }
          this.$message.success('AI 优化完成')
        }
      }).catch(() => {
        this.optimizing = null
      })
    },

    showAddShopDialog() {
      if (!this.currentShop) {
        this.$message.warning('请先选择一个店铺作为复制源')
        return
      }
      this.newShopForm = { shop_accounts: [], platform: 'EBAY', site: '' }
      if (!this.availableShopAccounts.length) {
        this.loadingAccounts = true
        this.getRequest('api/bo_bonus_accounts/?is_active=true&type=eBay&page_size=1000').then(resp => {
          this.loadingAccounts = false
          if (resp && resp.results) {
            this.availableShopAccounts = resp.results.map(r => r.name)
          }
        }).catch(() => { this.loadingAccounts = false })
      }
      this.addShopVisible = true
    },

    confirmAddShop() {
      this.$refs.addShopFormRef.validate(async valid => {
        if (!valid || !this.currentShop) return
        this.copyingShop = true
        const accounts = this.newShopForm.shop_accounts
        const platform = this.newShopForm.platform
        const site = this.newShopForm.site
        const globalSkus = this.globalVariants
        const siteCurrency = this.siteCurrencyMap[site] || 'USD'
        let addedCount = 0
        const skipped = []
        for (const acc of accounts) {
          // 检查是否已存在相同的店铺
          const dup = this.baseProduct.product_groups.find(s =>
            s.shop_account === acc && s.platform === platform && s.site === site
          )
          if (dup) { skipped.push(acc); continue }
          // 查找店铺配置中的刊登配置
          let listingConfigId = null
          let listingConfigDetail = null
          try {
            const cfgResp = await this.getRequest(
              'api/shop_configs/?platform=' + encodeURIComponent(platform) +
              '&shop_account=' + encodeURIComponent(acc) +
              '&site=' + encodeURIComponent(site) +
              '&page_size=1'
            )
            if (cfgResp && cfgResp.results && cfgResp.results.length) {
              const cfg = cfgResp.results[0]
              if (cfg.listing_config) {
                listingConfigId = cfg.listing_config
                listingConfigDetail = this.listingConfigMap[cfg.listing_config] || null
              }
            }
          } catch (e) { /* ignore */ }
          if (!listingConfigId) { skipped.push(acc + '(无刊登配置)'); continue }
          const newShop = {
            id: null,
            shop_account: acc,
            p_status: 'INIT',
            platform: platform,
            title: this.currentShop.title || '',
            site: site,
            variant_name: this.currentShop.variant_name || '',
            desc: this.currentShop.desc || '',
            _listingConfigId: listingConfigId,
            listing_config_detail: listingConfigDetail,
            custom_attributes: this.currentShop.custom_attributes ? JSON.parse(JSON.stringify(this.currentShop.custom_attributes)) : {},
            images: (this.currentShop.images || []).map(img => ({
              id: null, image_url: img.image_url, sort: img.sort, is_cover: img.is_cover, _status: 'new'
            })),
            variants: globalSkus.map(sku => ({
              id: null,
              core_sku_id: sku.core_sku_id || sku.id || null,
              sku: sku.sku,
              p_name: sku.p_name,
              cost: sku.cost,
              UPC: sku.UPC,
              purchase_url: sku.purchase_url,
              title: '',
              desc: '',
              price: sku.price || '0.00',
              currency: siteCurrency,
              var1: sku.var1 || '',
              var2: sku.var2 || '',
              var3: sku.var3 || '',
              var4: sku.var4 || '',
              custom_attributes: null,
              images: [],
              _status: 'new'
            })),
            _status: 'new'
          }
          this.baseProduct.product_groups.push(newShop)
          addedCount++
        }
        this.addShopVisible = false
        if (addedCount > 0) {
          this.$nextTick(() => {
            this.activeShopTabName = 'shop-' + (this.visibleShops.length - 1)
          })
          this.$message.success('成功复制 ' + addedCount + ' 个店铺' + (skipped.length ? '，跳过 ' + skipped.length + ' 个' : ''))
        } else if (skipped.length) {
          this.$message.warning('所选账号均无法复制：' + skipped.join('、'))
        }
        this.copyingShop = false
      })
    },

    // ===================== 保存 =====================
    async updateProduct() {
      this.writeCustomAttrsBack()
      // 校验必填字段
      if (!this.baseProduct.supplier || !this.baseProduct.supplier.trim()) {
        this.$message.warning('请填写供应商')
        return
      }
      if (!this.baseProduct.series || !this.baseProduct.series.trim()) {
        this.$message.warning('请填写产品系列')
        return
      }
      // 校验 SKU 成本价 > 0
      const invalidCost = this.globalVariants.find(v => !v.cost || parseFloat(v.cost) <= 0)
      if (invalidCost) {
        this.$message.warning('SKU「' + (invalidCost.sku || invalidCost.p_name) + '」成本价必须大于 0')
        return
      }
      // 校验店铺标题
      if (this.baseProduct.product_groups) {
        const emptyTitle = this.baseProduct.product_groups.find(s => s._status !== 'deleted' && (!s.title || !s.title.trim()))
        if (emptyTitle) {
          this.$message.warning('店铺「' + (emptyTitle.shop_account || '未命名') + '」标题不能为空')
          return
        }
        // 校验关联刊登配置
        const noListing = this.baseProduct.product_groups.find(s => s._status !== 'deleted' && !s._listingConfigId)
        if (noListing) {
          this.$message.warning('店铺「' + (noListing.shop_account || '未命名') + '」未关联刊登配置，请选择')
          return
        }
        // 校验店铺 SKU 售价 > 0
        const invalidPrice = this.baseProduct.product_groups.find(shop => {
          if (shop._status === 'deleted') return false
          return (shop.variants || []).find(v => v._status !== 'deleted' && (!v.price || parseFloat(v.price) <= 0))
        })
        if (invalidPrice) {
          this.$message.warning('店铺「' + (invalidPrice.shop_account || '未命名') + '」存在售价不大于 0 的 SKU')
          return
        }
      }
      // 快照店铺差异化数据（重载前保存，避免被覆盖）
      const shopPatches = this.snapshotShopPatches()
      this.saving = true
      try {
        // —— 步骤 1：PATCH 全局 + SKU 数据 ——
        const globalPayload = this.buildGlobalPayload()
        await this.patchRequest('api/base_product_group/' + this.productId + '/', globalPayload)

        // —— 步骤 2：新增店铺 ——
        for (const shop of this.baseProduct.product_groups) {
          if (shop._status === 'new' && shop.id === null) {
            await this.postRequest(
              'api/base_product_group/' + this.productId + '/product_groups/',
              this.buildNewShopPayload(shop)
            )
          }
        }

        // —— 步骤 3：删除店铺 ——
        for (const shopId of this.deletedShopIds) {
          await this.deleteRequest('api/product_group/' + shopId + '/')
        }

        // —— 步骤 4：重载产品数据 ——
        this._watching = false
        const resp = await this.getRequest('api/base_product_group/' + this.productId + '/')
        if (resp) {
          this.baseProduct = resp
          this.deletedCoreSkuIds = []
          this.deletedShopIds = []
          this.markAllStatus(this.baseProduct)
          // 保持当前 tab，如果索引无效则切到最后一个
          this.$nextTick(() => {
            this._watching = true
            this.refreshListingConfigs()
            if (this.visibleShops.length) {
              const activeIdx = parseInt((this.activeShopTabName || '').split('-')[1], 10)
              if (isNaN(activeIdx) || activeIdx >= this.visibleShops.length) {
                this.activeShopTabName = 'shop-' + (this.visibleShops.length - 1)
              }
            }
          })
        }

        // —— 步骤 5：仅对实际有店铺级改动的店铺发 PATCH ——
        const dirtyShopIds = Object.keys(shopPatches)
        for (const shopId of dirtyShopIds) {
          await this.patchRequest('api/product_group/' + shopId + '/', shopPatches[shopId])
        }

        this._modified = false
        this.$message.success('保存成功')
        this.$emit('saved')
      } catch (e) {
        this.$message.error('保存失败：' + (e.message || '未知错误'))
      } finally {
        this.saving = false
      }
    },

    // 构建新增店铺的 POST 载荷
    buildNewShopPayload(shop) {
      return {
        shop_account: shop.shop_account || '',
        platform: shop.platform || 'EBAY',
        site: shop.site || '',
        title: shop.title || '',
        desc: shop.desc || '',
        variant_name: shop.variant_name || '',
        listing_config_id: shop._listingConfigId,
        custom_attributes: shop.custom_attributes || {},
        images: (shop.images || []).map(img => ({
          image_url: img.image_url,
          sort: img.sort || 0,
          is_cover: img.is_cover || false
        })),
        variants: (shop.variants || []).map(v => ({
          core_sku_id: v.core_sku_id || v.id,
          var1: v.var1 || '',
          var2: v.var2 || '',
          var3: v.var3 || '',
          var4: v.var4 || '',
          price: v.price || '0.00',
          currency: v.currency || 'USD'
        }))
      }
    },

    // 收集店铺差异化数据（仅包含有实际改动的店铺和 variant）
    snapshotShopPatches() {
      const patches = {}
      if (!this.baseProduct.product_groups) return patches
      this.baseProduct.product_groups.forEach(shop => {
        if (!shop.id || !shop._shopDirty) return
        const patch = {
          title: shop.title || '',
          desc: shop.desc || '',
          custom_attributes: shop.custom_attributes || {},
          p_status: shop.p_status || 'INIT',
          listing_config_id: shop._listingConfigId,
          images: (shop.images || []).map(img => ({
            image_url: img.image_url,
            sort: img.sort || 0,
            is_cover: img.is_cover || false
          }))
        }
        // 仅收集用户手动改过价格的 variant
        const changedVariants = (shop.variants || []).filter(v => v._priceChanged)
        if (changedVariants.length) {
          patch.variants = changedVariants.map(v => ({
            id: v.id,
            price: v.price || '0.00',
            currency: v.currency || 'USD'
          }))
        }
        patches[shop.id] = patch
      })
      return patches
    },

    // 构建 PATCH base_product_group 全局载荷
    buildGlobalPayload() {
      const coreSkus = this.buildCoreSkusPayload()
      return {
        supplier: this.baseProduct.supplier || '',
        series: this.baseProduct.series || '',
        category: this.baseProduct.category || '',
        tag: this.baseProduct.tag || '',
        note: this.baseProduct.note || '',
        p_status: this.baseProduct.p_status || '',
        variant_name: this.baseProduct.variant_name || this.baseProduct.main_variant_name || '',
        var_mappings: this.baseProduct.var_mappings || {},
        core_skus: coreSkus
      }
    },

    // 构建 core_skus 数组
    buildCoreSkusPayload() {
      if (!this.baseProduct.product_groups || !this.baseProduct.product_groups.length) return []
      const variants = this.baseProduct.product_groups[0].variants || []
      const payload = variants.map(v => {
        const entry = {
          sku: v.sku || '',
          p_name: v.p_name || '',
          cost: v.cost != null ? String(v.cost) : '0.00',
          UPC: v.UPC || '',
          purchase_url: v.purchase_url || '',
          var1: v.var1 || '',
          var2: v.var2 || '',
          var3: v.var3 || '',
          var4: v.var4 || '',
          warehouse: v.warehouse || '',
          mb_product_status: v.mb_product_status || '',
          images: (v.images || []).map(img => ({
            image_url: img.image_url,
            sort: img.sort || 0,
            is_cover: img.is_cover || false
          }))
        }
        if (v.id) entry.id = v.id
        return entry
      })
      this.deletedCoreSkuIds.forEach(id => {
        payload.push({ id, _delete: true })
      })
      return payload
    }
  }
}
</script>

<style scoped>
.detail-container {
  padding: 0;
}

.footer-bar {
  display: flex;
  justify-content: flex-end;
  padding: 15px 0 0 0;
  border-top: 1px solid #ebeef5;
  margin-top: 15px;
}

.readonly-value {
  color: #606266;
  font-size: 13px;
}

/* ==================== 产品主图 ==================== */
.product-main-image {
  display: flex;
  align-items: flex-start;
}

/* ==================== 店铺 Tabs ==================== */
.shop-tabs {
  margin-bottom: 10px;
}

::v-deep .shop-tabs .el-tabs__item {
  border-radius: 8px;
  margin-right: 4px;
  background: #f0f2f5;
  border: 1px solid #e4e7ed;
}

::v-deep .shop-tabs .el-tabs__item.is-active {
  background: #fff;
  border-color: #409eff;
  color: #409eff;
}

.shop-form {
  margin-top: 5px;
}

/* ==================== 图片网格 ==================== */
.image-grid-wrapper {
  /* wrapper — draggable children flow inline */
}

.image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.image-item {
  position: relative;
  width: 100px;
  height: 100px;
  border: 2px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
  cursor: grab;
}

.image-item.is-cover {
  border-color: #e6a23c;
}

.image-item:active {
  cursor: grabbing;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  background: rgba(0, 0, 0, 0.4);
  opacity: 0;
  transition: opacity 0.2s;
}

.image-item:hover .image-overlay {
  opacity: 1;
}

.image-loading {
  width: 100px;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f7fa;
  border: 2px dashed #dcdfe6;
  border-radius: 4px;
}

.image-ghost {
  opacity: 0.5;
  background: #c8ebfb;
}

.cover-tag {
  position: absolute;
  top: 2px;
  left: 2px;
}

.image-ghost {
  opacity: 0.5;
  background: #c8ebfb;
}

.image-upload-box {
  display: inline-flex;
}

.upload-trigger {
  width: 100px;
  height: 100px;
  border: 2px dashed #dcdfe6;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: #c0c4cc;
  transition: border-color 0.2s;
}

.upload-trigger:hover {
  border-color: #409eff;
  color: #409eff;
}

.upload-trigger i {
  font-size: 24px;
  margin-bottom: 4px;
}

.upload-trigger span {
  font-size: 12px;
}

.main-image-uploader {
  display: inline-flex;
}

/* ==================== 自定义属性 ==================== */
.custom-attributes {
  margin-bottom: 10px;
}

/* ==================== 富文本编辑器 ==================== */
::v-deep .quill-editor {
  height: 300px;
}

::v-deep .ql-container {
  height: calc(100% - 42px);
}

::v-deep .ql-editor {
  height: 100%;
  overflow-y: auto;
}

/* ==================== 变体维度 ==================== */
.variant-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

/* ==================== 变体映射编辑器 ==================== */
.variant-editor-container {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 10px 15px;
  background: #fafafa;
  max-height: 500px;
  overflow-y: auto;
  display: flex;
  gap: 16px;
}

.variant-editor-group {
  flex: 1;
  min-width: 280px;
  max-width: 500px;
}

.variant-editor-title {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 6px;
}

.variant-eng-value {
  font-size: 12px;
  color: #606266;
}

/* ==================== 列设置 ==================== */
.section-subtitle {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
}

::v-deep .el-dropdown-menu__item.is-checked {
  color: #409eff;
  font-weight: 500;
}

/* ==================== 全局 ==================== */
::v-deep .el-divider__text {
  font-weight: 600;
  font-size: 14px;
}

::v-deep .el-tabs--border-card > .el-tabs__content {
  padding: 20px;
}

.gray_zi {
  color: #99a9bf;
  font-size: 13px;
}

.listing-config-info {
  line-height: 1.8;
  padding: 8px 12px;
  background: #fafafa;
  border-radius: 6px;
}

/* 店铺同步状态圆点 */
.shop-sync-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 4px;
  vertical-align: middle;
}
.dot-synced {
  background-color: #67c23a;
}
.dot-unsynced {
  background-color: #e6a23c;
}
</style>
