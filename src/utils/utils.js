function Throttle(fn, delay = 200) {
    let open = true;
    return function (...data) {
        if (!open) {
            //休息时间 暂不接客
            return false
        }
        // 工作时间，执行函数并且在间隔期内把状态位设为无效
        open = false
        setTimeout(() => {
            open = true;
            fn(...data)
        }, delay)
    }
}
function getRandomNum(m, n) {
    return Math.floor(Math.random() * (m - n) + n);
}
export default {
    Throttle,
    getRandomNum
};