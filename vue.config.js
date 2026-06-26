const webpack = require('webpack')

let proxyobj = {}

proxyobj['/'] = {
    ws: false,
    target: 'http://localhost:8000',
    changeOrigin: true,
    pathRewrite: { '^/': '/' }
}

module.exports = {
    devServer: {
        host: '0.0.0.0',
        port: 8080,
        proxy: proxyobj
    },

    configureWebpack: config => {
        // ---- Moment locale 剥离 ----
        config.plugins.push(
            new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /zh-cn/)
        )

        // ---- Production splitChunks ----
        if (process.env.NODE_ENV === 'production') {
            config.optimization = {
                ...config.optimization,
                splitChunks: {
                    chunks: 'all',
                    cacheGroups: {
                        // Vue 核心
                        vue: {
                            test: /[\\/]node_modules[\\/](vue|vue-router|vuex)[\\/]/,
                            name: 'chunk-vue',
                            priority: 20
                        },
                        // Element UI
                        element: {
                            test: /[\\/]node_modules[\\/]element-ui[\\/]/,
                            name: 'chunk-element',
                            priority: 20
                        },
                        // ECharts
                        echarts: {
                            test: /[\\/]node_modules[\\/](echarts|zrender)[\\/]/,
                            name: 'chunk-echarts',
                            priority: 20
                        },
                        // Moment
                        moment: {
                            test: /[\\/]node_modules[\\/]moment[\\/]/,
                            name: 'chunk-moment',
                            priority: 20
                        },
                        // Quill
                        quill: {
                            test: /[\\/]node_modules[\\/](quill|vue-quill-editor)[\\/]/,
                            name: 'chunk-quill',
                            priority: 20
                        },
                        // 其他 node_modules
                        vendors: {
                            test: /[\\/]node_modules[\\/]/,
                            name: 'chunk-vendors',
                            priority: 10
                        },
                        // 公共业务代码
                        common: {
                            minChunks: 2,
                            name: 'chunk-common',
                            priority: 5,
                            reuseExistingChunk: true
                        }
                    }
                }
            }
        }
    }
}
