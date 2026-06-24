let proxyobj = {}

proxyobj['/'] = {
    // websocket
    ws: false,
    //目标地址
    target: 'http://localhost:8000',
    //发送请求头host会被设置target
    changeOrigin: true,
    //不重写请求地址
    pathRewrite: {
        '^/': '/'
    }
}


module.exports = {
    devServer: {
        host: "0.0.0.0",
        port: 8080,
        // 设置开发接口代理
        proxy: proxyobj
    }
}