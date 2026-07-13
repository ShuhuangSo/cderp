<template>
  <div id="app" style="height: 100%">
    <router-view/>
  </div>
</template>

<style>
/* 全局 Element UI 边框圆角 */
.el-input__inner,
.el-textarea__inner,
.el-button,
.el-select .el-input__inner,
.el-table,
.el-table th,
.el-table td,
.el-dialog,
.el-card,
.el-tag,
.el-pagination button,
.el-pagination .el-pager li,
.el-tabs__nav,
.el-tabs__item,
.el-dropdown-menu,
.el-dropdown-menu__item,
.el-popover,
.el-tooltip__popper,
.el-message-box,
.el-alert,
.el-input-number .el-input__inner,
.el-form-item__content .el-input__inner,
.el-cascader .el-input__inner {
  border-radius: 4px;
}

/* el-table 外层圆角 */
.el-table {
  border-radius: 4px;
  overflow: hidden;
}

/* NProgress 顶部进度条颜色 */
#nprogress .bar {
  background: #409eff;
}
#nprogress .peg {
  box-shadow: 0 0 10px #409eff, 0 0 5px #409eff;
}
</style>
