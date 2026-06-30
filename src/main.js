import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './storage'

// ---- Element UI 按需引入 ----
import {
  Container, Header, Aside, Main,
  Button, ButtonGroup,
  Table, TableColumn,
  Form, FormItem,
  Input, InputNumber,
  Select, Option,
  Dialog,
  Tabs, TabPane,
  Menu, Submenu, MenuItem,
  Tag,
  Divider,
  Tooltip,
  Popover, Popconfirm,
  Switch,
  Radio, RadioButton, RadioGroup,
  Checkbox,
  DatePicker,
  Upload,
  Image,
  Pagination,
  Dropdown, DropdownMenu, DropdownItem,
  Breadcrumb, BreadcrumbItem,
  Card,
  Row, Col,
  Alert,
  Badge,
  Progress,
  Tree,
  Steps, Step,
  Timeline, TimelineItem,
  PageHeader,
  Link,
  ColorPicker,
  Descriptions, DescriptionsItem,
  Collapse, CollapseItem,
  Skeleton, SkeletonItem,
  Empty,
  Slider,
  Rate,
  Result,
  Autocomplete,
  Backtop
} from 'element-ui'
import 'element-ui/lib/theme-chalk/base.css'
import 'element-ui/lib/theme-chalk/icon.css'
import lang from 'element-ui/lib/locale/lang/zh-CN'
import locale from 'element-ui/lib/locale'

// 配置中文语言
locale.use(lang)

// 逐个注册组件
const components = [
  Container, Header, Aside, Main,
  Button, ButtonGroup,
  Table, TableColumn,
  Form, FormItem,
  Input, InputNumber,
  Select, Option,
  Dialog,
  Tabs, TabPane,
  Menu, Submenu, MenuItem,
  Tag,
  Divider,
  Tooltip,
  Popover, Popconfirm,
  Switch,
  Radio, RadioButton, RadioGroup,
  Checkbox,
  DatePicker,
  Upload,
  Image,
  Pagination,
  Dropdown, DropdownMenu, DropdownItem,
  Breadcrumb, BreadcrumbItem,
  Card,
  Row, Col,
  Alert,
  Badge,
  Progress,
  Tree,
  Steps, Step,
  Timeline, TimelineItem,
  PageHeader,
  Link,
  ColorPicker,
  Descriptions, DescriptionsItem,
  Collapse, CollapseItem,
  Skeleton, SkeletonItem,
  Empty,
  Slider,
  Rate,
  Result,
  Autocomplete,
  Backtop
]
components.forEach(c => Vue.use(c))

// ---- Element UI 指令和服务 ----
import { Loading } from 'element-ui'
Vue.use(Loading.directive)

import { Message, MessageBox } from 'element-ui'
Vue.prototype.$message = Message
Vue.prototype.$confirm = MessageBox.confirm
Vue.prototype.$alert = MessageBox.alert
Vue.prototype.$prompt = MessageBox.prompt
Vue.prototype.$prompt = MessageBox.prompt

// ---- API 工具挂载 ----
import {postRequest} from "@/utils/api";
import {getRequest} from "@/utils/api";
import {putRequest} from "@/utils/api";
import {deleteRequest} from "@/utils/api";
import {patchRequest} from "@/utils/api";

// ---- 动态菜单初始化 ----
import {initMenu} from "@/utils/menus";
import {initProduct} from "@/utils/skus";

// ---- ECharts 按需引入 ----
import * as echarts from 'echarts/core'
import { LineChart, BarChart, PieChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent, DataZoomComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([LineChart, BarChart, PieChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent, DataZoomComponent, CanvasRenderer])

// ---- 动画计数器 ----
import VueAnimateNumber from 'vue-animate-number'

Vue.config.productionTip = false

// Element UI 全局默认尺寸（size 必须设置为 'mini' 或 'small'）
Vue.prototype.$ELEMENT = { size: 'small' }

Vue.use(VueAnimateNumber)

Vue.prototype.postRequest = postRequest;
Vue.prototype.getRequest = getRequest;
Vue.prototype.putRequest = putRequest;
Vue.prototype.deleteRequest = deleteRequest;
Vue.prototype.patchRequest = patchRequest;
Vue.prototype.$echarts = echarts



router.beforeEach((to, from, next) => {
    // 判断用户是否登录，登录则初始化导航菜单、保存用户信息
    if (window.localStorage.getItem('tokenStr')) {
        initMenu(router, store); // 初始化菜单
        initProduct(store); // 初始化简易产品

        const tasks = []

        // ml用户权限
        if (!window.sessionStorage.getItem('ml_permission')) {
            tasks.push(
                getRequest('api/settings/get_ml_permission/').then(resp => {
                    if (resp) {
                        const data = {}
                        resp.forEach(item => {
                            data[item.component] = item.is_active
                        })
                        window.sessionStorage.setItem('ml_permission', JSON.stringify(data))
                    }
                })
            )
        }

        // 用户信息
        if (!window.sessionStorage.getItem('user')) {
            tasks.push(
                getRequest('api/settings/users/user_info/').then(resp => {
                    if (resp) {
                        window.sessionStorage.setItem('user', JSON.stringify(resp))
                    }
                })
            )
        }

        if (tasks.length) {
            return Promise.all(tasks).then(() => {
                if (to.path === '/') {
                    next('/home')
                } else {
                    next()
                }
            })
        }

        // 在登录状态下去登录页，自动跳到home
        if (to.path === '/') {
            next('/home')
        } else {
            next()
        }
    } else {
        // 未登录则判断用户是否要去登录页
        if (to.path === '/') {
            next()
        } else {
            next('/?redirect=' + to.path)
        }
    }
})


new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')
