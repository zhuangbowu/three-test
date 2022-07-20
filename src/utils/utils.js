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
function setName() {
    const KEY_LEN=10;
    const KEY_COUNT=20;
    const CHARS='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let arr=[];
    for(let i=0;i<KEY_COUNT;i++){
        let key='';
        for(let j=0;j<KEY_LEN;j++){
            key+=CHARS[Math.floor(Math.random()*CHARS.length)];
        }
        arr.push(key);
    }
    return arr.join('').toString();
}
export default {
    Throttle,
    getRandomNum,
    setName
};