module.exports = {
    publicPath: process.env.NODE_ENV === 'production'
    ? './'
    : '/',
    outputDir: "wechat_test", // 输出文件目录
    assetsDir: "static", //静态资源文件名称
    lintOnSave: false,
    chainWebpack: (config) => {
        // 因为是多页面，所以取消 chunks，每个页面只对应一个单独的 JS / CSS
        config.optimization
            .splitChunks({
                cacheGroups: {}
            });

        // 'src/lib' 目录下为外部库文件，不参与 eslint 检测
        config.module
            .rule('eslint')
            .exclude
            .add('/')
            .end()
    }, 
    devServer: {
        proxy: {
            '/api': {
                target: 'http://localhost:8033',
                // 允许跨域
                changeOrigin: true,
                ws: true,
                pathRewrite: {
                    '^/api': '/'
                }
            }
        }
    }
}