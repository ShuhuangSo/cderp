let proxyobj = {}

proxyobj['/'] = {
    // websocket
    ws: false,
    //目标地址
    target: 'http://10.211.55.11:8000',
    //发送请求头host会被设置target
    changeOrigin: true,
    //不重写请求地址
    pathRewrite: {
        '^/': '/'
    }
}


module.exports = {
    devServer: {
        host: "localhost",
        port: 8080,
        // 设置开发接口代理
        proxy: proxyobj
    }
}