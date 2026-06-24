import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import store from './storage';

import {postRequest} from "@/utils/api";
import {getRequest} from "@/utils/api";
import {putRequest} from "@/utils/api";
import {deleteRequest} from "@/utils/api";
import {patchRequest} from "@/utils/api";
import {initMenu} from "@/utils/menus";
import el from "element-ui/src/locale/lang/el";
import {initProduct} from "@/utils/skus";
import * as echarts from 'echarts'
import VueAnimateNumber from 'vue-animate-number'

Vue.config.productionTip = false

Vue.use(ElementUI, {size: 'small'});

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
