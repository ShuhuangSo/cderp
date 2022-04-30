import Vue from 'vue'
import VueRouter from 'vue-router'

import Home from "@/views/Home";
import Login from "@/views/Login";
import Dashboard from "@/views/Dashboard";
import StockInoutDetail from "@/views/product/StockInoutDetail";
import StockInoutView from "@/views/product/StockInoutView";
import CreatePurchase from "@/views/purchase/CreatePurchase";
import PurchaseDetail from "@/views/purchase/PurchaseDetail";
import SupplierHome from "@/views/supplier/SupplierHome";
import SupplierOrderDetail from "@/views/supplier/SupplierOrderDetail";
import SupplierIndex from "@/views/supplier/SupplierIndex";
import CreateSupplier from "@/views/purchase/CreateSupplier";
import CreateCustomer from "@/views/order/CreateCustomer";
import CreateOrder from "@/views/order/CreateOrder";
import OrderDetail from "@/views/order/OrderDetail";
import UserPermission from "@/views/setting/UserPermission";



Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'Login',
        component: Login
    },
    {
        path: '/supplierHome',
        name: 'SupplierHome',
        component: SupplierHome,
        redirect: '/supplierIndex',
        children: [
            {
                path: '/supplierOrderDetail',
                name: 'SupplierOrderDetail',
                component: SupplierOrderDetail
            },
            {
                path: '/supplierIndex',
                name: 'SupplierIndex',
                component: SupplierIndex
            }
        ]
    },
    {
        path: '/home',
        name: 'Home',
        component: Home,
        redirect: '/dashboard',
        children:[
            {
                path: '/dashboard',
                name: 'Dashboard',
                component: Dashboard
            },
            {
                path: '/stockInoutDetail',
                name: '手工出入库',
                component: StockInoutDetail
            },
            {
                path: '/stockInoutView',
                name: '手工出入库详情',
                component: StockInoutView
            },
            {
                path: '/createPurchase',
                name: '采购单',
                component: CreatePurchase
            },
            {
                path: '/purchaseDetail',
                name: '采购单详情',
                component: PurchaseDetail
            },
            {
                path: '/createSupplier',
                name: '新增供应商',
                component: CreateSupplier
            },
            {
                path: '/createCustomer',
                name: '新增客户',
                component: CreateCustomer
            },
            {
                path: '/createOrder',
                name: '创建订单',
                component: CreateOrder
            },
            {
                path: '/orderDetail',
                name: '订单详情',
                component: OrderDetail
            },
            {
                path: '/userPermission',
                name: '用户权限',
                component: UserPermission
            },
        ]
    },
]

const router = new VueRouter({
    routes
})

export default router
