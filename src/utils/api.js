import axios from 'axios'
import {Message} from 'element-ui';
import router from "@/router";


// 请求拦截器
axios.interceptors.request.use(config => {
    //如果存在token，请求携带这个token
    if (window.localStorage.getItem('tokenStr')) {
        config.headers['Authorization'] = window.localStorage.getItem('tokenStr');
    }
    config.headers['app-ver'] = 162; // 软件版本
    return config;
}, error => {
    console.log(error);
})

// 响应拦截器
axios.interceptors.response.use(success => {
    // 成功调用接口，但业务逻辑错误
    if (success.status && success.status == 200) {
        if (success.data.code == 500 || success.data.code == 401 || success.data.code == 403) {
            Message.error({message: success.data.message});
            return;
        }
        // 成功调用接口
        if (success.data.msg) {
            Message.success({message: success.data.msg});
        }
    }
    // 删除数据成功
    if (success.status && success.status == 204) {
        Message.success({message: '删除成功！'});
    }
    // 库存不足
    if (success.status && success.status == 202) {
        Message.error({message: success.data.msg});
    }
    return success.data;
}, error => {
    if (error.response.status == 504 || error.response.status == 404) {
        Message.error({message: '服务器连接失败！'})
    } else if (error.response.status == 403) {
        Message.error({message: '权限不足，请联系管理员!'});
    } else if (error.response.status == 400) {
        Message.error({message: '用户名或密码错误,请重新登录'});
    } else if (error.response.status == 406) {
        Message.error({message: error.response.data.msg});
    }  else if (error.response.status == 401) {
        Message.error({message: '身份验证过期，请重新登录！'});
        window.localStorage.removeItem('tokenStr');
        router.replace('/');
    }  else if (error.response.status == 503) {
        Message.error({message: '系统升级中...'});
        window.localStorage.removeItem('tokenStr');
        router.replace('/');
    }  else if (error.response.status == 555) {
        Message.error({message: 'app版本过低，请刷新页面更新软件版本'});
        window.localStorage.removeItem('tokenStr');
        router.replace('/');
    }  else {
        if (error.response.data.msg) {
            Message.error({message: error.response.data.msg});
        } else {
            Message.error({message: '未知错误'});
        }
    }
    return;
});


let base = '';

// 传送json格式的post请求
export const postRequest = (url, params) => {
    return axios({
        method: 'post',
        url: `${base}${url}`,
        data: params
    })
}

// 传送json格式的put请求
export const putRequest = (url, params) => {
    return axios({
        method: 'put',
        url: `${base}${url}`,
        data: params
    })
}

// 传送json格式的patch请求
export const patchRequest = (url, params) => {
    return axios({
        method: 'patch',
        url: `${base}${url}`,
        data: params
    })
}

// 传送json格式的get请求
export const getRequest = (url, params) => {
    return axios({
        method: 'get',
        url: `${base}${url}`,
        data: params
    })
}

// 传送json格式的delete请求
export const deleteRequest = (url, params) => {
    return axios({
        method: 'delete',
        url: `${base}${url}`,
        data: params
    })
}