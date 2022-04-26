import {getRequest} from "@/utils/api";

export const initProduct = (store) => {
    // 如果vuex中存在产品，直接返回
    if (store.state.products.length > 0) {
        return;
    }

    // 不存在则发请求后端返回简易产品
    getRequest('api/simple_products/').then(data => {
        if (data) {
            // 将数据存到vuex
            store.commit('initProducts', data);
        }
    })
}