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

Vue.config.productionTip = false

Vue.use(ElementUI, {size: 'small'});

Vue.prototype.postRequest = postRequest;
Vue.prototype.getRequest = getRequest;
Vue.prototype.putRequest = putRequest;
Vue.prototype.deleteRequest = deleteRequest;
Vue.prototype.patchRequest = patchRequest;


router.beforeEach((to, from, next) => {
    // 判断用户是否登录，登录则初始化导航菜单、保存用户信息
    if (window.sessionStorage.getItem('tokenStr')) {
        initMenu(router, store); // 初始化菜单
        initProduct(store); // 初始化简易产品
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
