const {defineConfig} = require('@vue/cli-service')
module.exports = defineConfig({
    transpileDependencies: true,
    //根据开发模式禅师公共路径：这个是必须的
    publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
    // 根目录内的文件夹名，里面可能含有css img  js等文件夹 由用户来自定义
    assetsDir: 'static',
})
