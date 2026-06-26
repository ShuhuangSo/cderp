import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'Login',
        component: () => import(/* webpackChunkName: "login" */ '@/views/Login')
    },
    {
        path: '/supplierHome',
        name: 'SupplierHome',
        component: () => import(/* webpackChunkName: "supplier" */ '@/views/supplier/SupplierHome'),
        redirect: '/supplierIndex',
        children: [
            {
                path: '/supplierOrderDetail',
                name: 'SupplierOrderDetail',
                component: () => import(/* webpackChunkName: "supplier" */ '@/views/supplier/SupplierOrderDetail')
            },
            {
                path: '/supplierIndex',
                name: 'SupplierIndex',
                component: () => import(/* webpackChunkName: "supplier" */ '@/views/supplier/SupplierIndex')
            }
        ]
    },
    {
        path: '/home',
        name: 'Home',
        component: () => import(/* webpackChunkName: "home" */ '@/views/Home'),
        redirect: '/mel_dashboard',
        children: [
            {
                path: '/dashboard',
                name: 'Dashboard',
                component: () => import(/* webpackChunkName: "dashboard" */ '@/views/Dashboard')
            },
            {
                path: '/mel_dashboard',
                name: '美客多FBM',
                component: () => import(/* webpackChunkName: "mel-dashboard" */ '@/views/app/mercado/MelDashboard')
            },
            {
                path: '/stockInoutDetail',
                name: '手工出入库',
                component: () => import(/* webpackChunkName: "product" */ '@/views/product/StockInoutDetail')
            },
            {
                path: '/stockInoutView',
                name: '手工出入库详情',
                component: () => import(/* webpackChunkName: "product" */ '@/views/product/StockInoutView')
            },
            {
                path: '/createPurchase',
                name: '采购单',
                component: () => import(/* webpackChunkName: "purchase" */ '@/views/purchase/CreatePurchase')
            },
            {
                path: '/purchaseDetail',
                name: '采购单详情',
                component: () => import(/* webpackChunkName: "purchase" */ '@/views/purchase/PurchaseDetail')
            },
            {
                path: '/createSupplier',
                name: '新增供应商',
                component: () => import(/* webpackChunkName: "purchase" */ '@/views/purchase/CreateSupplier')
            },
            {
                path: '/createCustomer',
                name: '新增客户',
                component: () => import(/* webpackChunkName: "order" */ '@/views/order/CreateCustomer')
            },
            {
                path: '/createOrder',
                name: '创建订单',
                component: () => import(/* webpackChunkName: "order" */ '@/views/order/CreateOrder')
            },
            {
                path: '/orderDetail',
                name: '订单详情',
                component: () => import(/* webpackChunkName: "order" */ '@/views/order/OrderDetail')
            },
            {
                path: '/userPermission',
                name: '用户权限',
                component: () => import(/* webpackChunkName: "setting" */ '@/views/setting/UserPermission')
            },
            {
                path: '/mlPermission',
                name: '美客多权限',
                component: () => import(/* webpackChunkName: "setting" */ '@/views/setting/MLPermission')
            },
            {
                path: '/monthDetail',
                name: '月份业绩详情',
                component: () => import(/* webpackChunkName: "bonus" */ '@/views/app/bonus/MonthDetail')
            },
            {
                path: '/createShip',
                name: '创建运单',
                component: () => import(/* webpackChunkName: "mercado-ship" */ '@/views/app/mercado/MelCreateShip')
            },
            {
                path: '/editShip',
                name: '编辑运单',
                component: () => import(/* webpackChunkName: "mercado-ship" */ '@/views/app/mercado/MelEditShip')
            },
            {
                path: '/shipDetail',
                name: '运单详情',
                component: () => import(/* webpackChunkName: "mercado-ship" */ '@/views/app/mercado/MelShipDetail')
            },
            {
                path: '/shipInfo',
                name: '运单通知',
                component: () => import(/* webpackChunkName: "mercado-ship" */ '@/views/app/mercado/MelShipInfo')
            },
            {
                path: '/devListingManage',
                name: '产品开发 > 账号刊登管理',
                component: () => import(/* webpackChunkName: "devproduct" */ '@/views/app/devproduct/DevListingManage')
            },
            {
                path: '/devOrder',
                name: '产品开发 > 订单管理',
                component: () => import(/* webpackChunkName: "devproduct" */ '@/views/app/devproduct/DevOrder')
            }
        ]
    }
]

const router = new VueRouter({
    routes
})

export default router
