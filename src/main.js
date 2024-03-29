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

        // ml用户权限
        if (!window.sessionStorage.getItem('ml_permission')) {
            return getRequest('api/settings/get_ml_permission/').then(resp => {
                if (resp) {
                    let data = {}
                    resp.forEach(item=>{
                        data[item.component] = item.is_active
                    })
                    //存入信息
                    window.sessionStorage.setItem('ml_permission', JSON.stringify(data));
                }
            })
        }

        if (!window.sessionStorage.getItem('user')) {
            //判断用户信息是否存在
            return getRequest('api/settings/users/user_info/').then(resp => {
                if (resp) {
                    //存入用户信息
                    window.sessionStorage.setItem('user', JSON.stringify(resp));
                    next();
                }
            })
        }

        //在登录状态下去登录页，自动跳到home
        if (to.path == '/') {
            next('/home');
        }

        next();
    } else {
        // 未登录则判断用户是否要去登录页
        if (to.path == '/') {
            next();
        } else {
            // 页面跳转
            next('/?redirect=' + to.path);
        }

    }
})


new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')
