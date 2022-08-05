import * as THREE from 'three'
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { LoadingManager } from "three";
import fa from "element-ui/src/locale/lang/fa";

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

function setName(KEY_LEN = 10, KEY_COUNT = 20) {
    const CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let arr = [];
    for (let i = 0; i < KEY_COUNT; i++) {
        let key = '';
        for (let j = 0; j < KEY_LEN; j++) {
            key += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
        arr.push(key);
    }
    return arr.join('').toString();
}

let formatArray = (arr) => {
    let list = [];
    for (let i = 0; i < arr.length; i++) {
        let column = arr[i].index.split('-');
        if (column.length === 1) {
            let index = parseInt(column[0]) - 1;
            list[index] = arr[i];
        } else {
            let front = parseInt(column[0]) - 1, after = parseInt(column[1]) - 1;
            if (!list[front]) {
                list.push({});
            }
            if (!list[front].column) {
                list[front].column = [];
            }
            list[front].column[after] = arr[i];
        }
    }
    return list;
}

/**
 * 获取其中每个模型的大小和坐标的通用class类
 * width,height 父级的宽高
 * spacing 两个元素之间的距离（默认6）
 * padding 父元素与子元素的之间的内间距（默认6）
 * type 1是横向 2是竖向 默认等于1
 * change 超出是否换行（默认不换行）
 * */
class calculationPositionSize {
    constructor(data) {
        data = {
            width: data.width,
            height: data.height,
            padding: data.padding || {
                top: 6,
                bottom: 6,
                left: 6,
                right: 6,
            },
            numMax: data.numMax || 12,
            spacing: data.spacing || 6,
            type: data.type,
            change: data.change
        }
        this.width = data.width;
        this.height = data.height;
        this.padding = data.padding;
        this.numMax = data.numMax;
        this.spacing = data.spacing;
        this.type = data.type;
        this.change = data.change;
        this.currentWidth = undefined;
        this.currentHeight = undefined;
    }

    // 获取位置
    getPosition(index) {
        try {
            let changeNum, leftIndex, topIndex, position = {};
            switch (this.type) {
                case 1:
                case '1':
                    changeNum = Math.floor((this.width - (this.padding.left + this.padding.right) - ((this.numMax * this.spacing) - this.spacing)) / this.currentWidth);
                    leftIndex = index % changeNum;
                    topIndex = Math.floor(index / changeNum);
                    break;
                case 2:
                case '2':
                    changeNum = Math.floor((this.height - (this.padding.top + this.padding.bottom) - ((this.numMax * this.spacing) - this.spacing)) / this.currentHeight);
                    leftIndex = Math.floor(index / changeNum);
                    topIndex = index % changeNum;
                    break;
            }
            switch (this.change) {
                case true:
                    if (leftIndex === 0) {
                        position.x = this.padding.left;
                    } else {
                        position.x = this.#calculation(leftIndex, this.currentWidth, this.spacing, this.padding.left);
                    }
                    if (topIndex === 0) {
                        position.y = this.padding.top;
                    } else {
                        position.y = this.#calculation(topIndex, this.currentHeight, this.spacing, this.padding.top);
                    }
                    break;
                default:
                    switch (this.type) {
                        case 1:
                        case '1':
                            position.y = this.padding.top;
                            if (index === 0) {
                                position.x = this.padding.left;
                            } else {
                                position.x = this.#calculation(index, this.currentWidth, this.spacing, this.padding.left);
                            }
                            break;
                        case 2:
                        case '2':
                            position.x = this.padding.left;
                            if (index === 0) {
                                position.y = this.padding.top;
                            } else {
                                position.y = this.#calculation(index, this.currentHeight, this.spacing, this.padding.top);
                            }
                            break;
                    }
                    break;
            }
            return position;
        } catch (e) {
            throw Error(e);
        }
    }

    // 获取大小
    getSize() {
        try {
            let size = {
                width: 0,
                height: 0,
            }
            switch (this.type) {
                case 1:
                case '1':
                    size.width = (this.width - this.padding.left - this.padding.right - ((this.numMax * this.spacing) - this.spacing)) / this.numMax;
                    size.height = this.height - this.padding.top - this.padding.bottom;
                    break;
                case 2:
                case '2':
                    size.width = this.width - this.padding.left - this.padding.right;
                    size.height = (this.height - this.padding.top - this.padding.bottom - ((this.numMax * this.spacing) - this.spacing)) / this.numMax;
                    break;
            }
            if (size.width < 1) {
                size.width = 1;
            }
            if (size.height < 1) {
                size.height = 1;
            }

            this.currentWidth = size.width;
            this.currentHeight = size.height;
            return size;
        } catch (e) {
            throw Error(e);
        }
    }

    #calculation = (index, size, spacing, padding) => {
        // 当前坐标*宽/高+当前坐标*行间距+内边距=当前x/y轴的数值
        return (index * size + index * spacing) + padding;
    }
}

class meshChange {
    constructor(mesh) {
        this.mesh = mesh;
        this.usedSize = {
            width: mesh.userData.originalBox.max.x - mesh.userData.originalBox.min.x,
            height: mesh.userData.originalBox.max.y - mesh.userData.originalBox.min.y,
            depth: mesh.userData.originalBox.max.z - mesh.userData.originalBox.min.z,
        }
    }

    operationSize(size) {
        for (const sizeKey in size) {
            size[sizeKey] = this.#formatNumber(size[sizeKey]);
        }
        // 是否需要修改
        let changeType = false;
        for (const usedSizeKey in this.usedSize) {
            // 宽高深，任何一项不一致都会触发修改
            if (this.usedSize[usedSizeKey] !== size[usedSizeKey]) {
                changeType = true;
            }
        }
        if (changeType) {
            const group = new THREE.Group();
            for (let i = this.mesh.children.length - 1; i >= 0; i--) {
                if (this.mesh.children[i].userData.data) {
                    group.attach(this.mesh.children[i]);
                }
            }
            this.mesh.scale.set(size.width / this.usedSize.width, size.height / this.usedSize.height, size.depth / this.usedSize.depth);
            for (let i = group.children.length - 1; i >= 0; i--) {
                this.mesh.attach(group.children[i]);
            }
        }
    }

    operationPosition(position, chassisElement) {

        let box = new THREE.Box3().expandByObject(this.mesh)
        let usedSize = {
            width: box.max.x - box.min.x,
            height: box.max.y - box.min.y,
            depth: box.max.z - box.min.z,
        }
        for (const sizeKey in position) {
            position[sizeKey] = this.#formatNumber(position[sizeKey]);
        }
        let usedPosition = this.mesh.position;
        console.log('新旧对比',usedPosition,position)
        let changeType = false;
        for (const usedPositionKey in usedPosition) {
            // 宽高深，任何一项不一致都会触发修改
            if (Math.abs(usedPosition[usedPositionKey]) !== Math.abs(position[usedPositionKey])) {
                changeType = true;
            }
        }
        if (changeType) {
            let box = new THREE.Box3().expandByObject(chassisElement)
            let boxSize = {
                width: box.max.x - box.min.x,
                height: box.max.y - box.min.y,
                depth: box.max.z - box.min.z,
            }
            let newPosition = {
                x: ((usedSize.width / 2) - (boxSize.width / 2)) + position.x,
                y: ((usedSize.height / 2) - (boxSize.height / 2)) + position.y,
                z: ((usedSize.depth / 2) - (boxSize.depth / 2)) + position.z,
            }
            console.log(usedSize,newPosition, position)
            this.mesh.position.set(-newPosition.x, -newPosition.y, newPosition.z);
        }
    }

    #formatNumber(num) {
        if (typeof num === 'string') {
            num = parseInt(num)
        }
        return num;
    }
}


// 创建一个空板卡
let addElement = (width = 1, height = 1, depth = 1, color = '#409EFF') => {
    return new Promise((resolve, reject) => {
        const dracoLoader = new DRACOLoader();  //
        dracoLoader.setDecoderPath('static/glb/');//设置解压库文件路径
        dracoLoader.setDecoderConfig({ type: 'js' })  //使用js方式解压
        dracoLoader.preload()  //初始化_initDecoder 解码器
        const gltfLoader = new GLTFLoader(new LoadingManager());
        // GLTF loader
        gltfLoader.setDRACOLoader(dracoLoader);   //gltfloader使用dracoLoader
        gltfLoader.load(`static/glb/demo.glb`, (gltf) => {
                console.log(gltf)
                //创建一个立方体几何对象Geometry
                let geometry = new THREE.BoxGeometry(width, height, depth);
                // 添加一个透明的材质
                let material = new THREE.MeshLambertMaterial({
                    color: color,
                    opacity: 0.3,
                    transparent: true
                });
                // 放到网格模型对象Mesh
                // let mesh = new THREE.Mesh(geometry, material);
                let mesh = new THREE.Group();
                // 改变定点位置从右上前开始计算坐标值的位置
                // mesh.geometry.translate(width / 2, -(height / 2), -(depth / 2));
                // 创建一个新的组对象
                let scene = gltf.scene;
                scene.name = '子模型';
                mesh.name = '父模型';
                let group = scene;
                // console.log(group)
                // console.log(new THREE.Box3().expandByObject(group))
                // let arr = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 25, 26, 27, 28 ];
                // 把模型文件里面的东西依次从后向前剪切到组对象里面
                // for (let i = scene.children.length - 1; i >= 0; i--) {
                //     const item = scene.children[i];
                //     if (!arr.includes(i)) {
                //         scene.remove(item);
                //     } else {
                //         // group.attach(item);
                //     }
                // }

                mesh.attach(group);
                mesh.userData.originalBox = new THREE.Box3().expandByObject(mesh);
                // group.userData.originalBox = new THREE.Box3().expandByObject(group);
                let changeGroup = new meshChange(mesh);
                changeGroup.operationSize({
                    width: width,
                    height: height,
                    depth: depth,
                });
                // console.log(group)
                // 把模型的原始宽高深数据存起来、以后的缩放都需要这个数据进行
                // console.log(mesh.userData.originalBox)
                resolve(mesh)
            }, (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            }, (e) => {
                reject(e)
            }
        )
    })
}

// 创建一个占位符
let addGroupElement = (width = 1, height = 1, depth = 1) => {
    let parameters = {
        color: '#ffffff'
    }
    let geometry = new THREE.BoxGeometry(width, height, depth); //创建一个立方体几何对象Geometry
    let material = new THREE.MeshLambertMaterial({
        ...parameters,
        opacity: 0,
        transparent: true
    }); //材质对象Material
    let mesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh
    // 改变定点位置从右上前开始计算坐标值的位置
    mesh.geometry.translate(width / 2, -(height / 2), -(depth / 2));
    return mesh;
}

class setBoxFormLimit {
    constructor(father, son) {
        this.father = father;
        this.son = son;
    }

    setSizeWidthLimit(width) {
        return Math.min(width, this.father.width)
    }

    setSizeHeightLimit(height) {
        return Math.min(height, this.father.height)
    }

    setSizeDepthLimit(depth) {
        return Math.min(depth, this.father.depth)
    }

    setPositionXLimit(x) {
        // top的值如果大于父级的高-当前div的高那么就取最小值
        x = Math.min(x, this.father.width - this.son.width);
        // top和0之间取最大值
        x = Math.max(x, 0);
        return x;
    }

    setPositionYLimit(y) {
        // top的值如果大于父级的高-当前div的高那么就取最小值
        y = Math.min(y, this.father.height - this.son.height);
        // top和0之间取最大值
        y = Math.max(y, 0);
        return y;
    }
}

const contrastArr = (newArr, usedArr) => {
    let arr = [];
    newArr.forEach(item => {
        let findIndex = usedArr.findIndex(findItem => findItem.index === item.index);
        if (findIndex === -1) {
            arr.push({
                ...item,
                state: 'add'
            })
        } else {
            arr.push({
                ...item,
                state: 'set'
            })
        }
    })
    usedArr.forEach(item => {
        let findIndex = newArr.findIndex(findItem => findItem.index === item.index);
        if (findIndex === -1) {
            arr.push({
                ...item,
                state: 'delete'
            })
        }
    })
    console.log(arr)
}
export default {
    Throttle,
    getRandomNum,
    setName,
    calculationPositionSize,
    formatArray,
    addElement,
    addGroupElement,
    setBoxFormLimit,
    meshChange,
    contrastArr
}