import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        routes: [],
        products: [] // 简易产品
    },

    mutations: {
        initRoutes(state, data) {
            state.routes = data;
        },
        // 初始化简易产品
        initProducts(state, data) {
            state.products = data;
        }
    },

    actions: {}
})