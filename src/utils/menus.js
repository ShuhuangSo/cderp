import {getRequest} from "@/utils/api";

export const initMenu = (router, store) => {
    if (store.state.routes.length > 0) {
        return;
    }

    getRequest('api/settings/menu/').then(data => {
        if (data) {
            // 格式化Router
            let fmtRoutes = formatRoutes(data);
            // 添加到router
            router.addRoutes(fmtRoutes);
            // 将数据存到vuex
            store.commit('initRoutes', fmtRoutes);
        }
    })
}


export const formatRoutes = (routes) => {
    let fmtRoutes = [];
    routes.forEach(router => {
        let {
            path,
            component,
            name,
            icon,
            children,
        } = router;

        if (children && children instanceof Array) {
            // 递归
            children = formatRoutes(children);
        }
        let fmRouter = {
            path: path,
            name: name,
            icon: icon,
            children: children,
            component(resolve) {
                if (component.startsWith('Home')) {
                    require(['../views/' + component + '.vue'], resolve);
                } else if (component.startsWith('Product')) {
                    require(['../views/product/' + component + '.vue'], resolve);
                } else if (component.startsWith('Purchase')) {
                    require(['../views/purchase/' + component + '.vue'], resolve);
                } else if (component.startsWith('Order')) {
                    require(['../views/order/' + component + '.vue'], resolve);
                } else if (component.startsWith('Setting')) {
                    require(['../views/setting/' + component + '.vue'], resolve);
                } else if (component.startsWith('Bonus')) {
                    require(['../views/app/bonus/' + component + '.vue'], resolve);
                } else if (component.startsWith('Mel')) {
                    require(['../views/app/mercado/' + component + '.vue'], resolve);
                } else if (component.startsWith('Dev')) {
                    require(['../views/app/devproduct/' + component + '.vue'], resolve);
                }
            }
        }
        fmtRoutes.push(fmRouter)
    });
    return fmtRoutes;
}