// 引入stats.js文件
import * as Stats from './stats.js'
// 通过函数动态创建性能监控标签、并且return出去对象
// addStats()方式生成标签
// 3d重新渲染的时候调用stats.update()方法生成新的
let addStats = () => {
    console.log(22222222222222)
    let stats = new Stats()
    stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
    stats.domElement.style.position = 'fixed'; //相对定位
    stats.domElement.style.top = '0px'; // 置于顶部
    stats.domElement.style.zIndex = '999999'; // 置于所有层级之上
    stats.domElement.style.left = null; // 左侧属性置为空值
    stats.domElement.style.right = '0px'; // 在右侧显示
    document.body.appendChild(stats.domElement)
    return stats;
}

export default addStats;