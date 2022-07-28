import * as THREE from 'three'
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {LoadingManager} from "three";

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


// 创建一个空板卡
let addElement = (width = 1, height = 1, depth = 1, color = '#409EFF') => {
    return new Promise((resolve, reject) => {
        const dracoLoader = new DRACOLoader();  //
        dracoLoader.setDecoderPath('static/glb/');//设置解压库文件路径
        dracoLoader.setDecoderConfig({type: 'js'})  //使用js方式解压
        dracoLoader.preload()  //初始化_initDecoder 解码器
        const gltfLoader = new GLTFLoader(new LoadingManager());
        // GLTF loader
        gltfLoader.setDRACOLoader(dracoLoader);   //gltfloader使用dracoLoader
        gltfLoader.load(`static/glb/demo.glb`, (gltf) => {
                let geometry = new THREE.BoxGeometry(width, height, depth); //创建一个立方体几何对象Geometry
                let material = new THREE.MeshLambertMaterial({
                    color: '#ff0000',
                    opacity: 0,
                    transparent: true
                }); //材质对象Material
                let mesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh
                // 改变定点位置从右上前开始计算坐标值的位置
                mesh.geometry.translate(width / 2, -(height / 2), -(depth / 2));
                let box = new THREE.Box3().expandByObject(mesh);
                mesh.userData.originalBox = box;

                let scene = gltf.scene;
                let newSize = {
                    width: width,
                    height: height,
                    depth: depth,
                };
                let sceneBox = new THREE.Box3().expandByObject(scene);
                let usedSize = {
                    width: sceneBox.max.x - sceneBox.min.x,
                    height: sceneBox.max.y - sceneBox.min.y,
                    depth: sceneBox.max.z - sceneBox.min.z,
                };

                scene.scale.set(newSize.width / usedSize.width, newSize.height / usedSize.height, newSize.depth / usedSize.depth);
                gltf.scene.position.set(width / 2, -(height / 2), -(depth / 2))
                mesh.attach(scene);
                resolve(mesh)
            }, (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            }, (e) => {
                reject(e)
            }
        )
    })


    // let parameters = {
    //     color: color
    // }
    // let geometry = new THREE.BoxGeometry(width, height, depth); //创建一个立方体几何对象Geometry
    // let material = new THREE.MeshLambertMaterial({
    //     ...parameters,
    //     // opacity: 0.5,
    //     // transparent: true
    // }); //材质对象Material
    // let mesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh
    // // 改变定点位置从右上前开始计算坐标值的位置
    // mesh.geometry.translate(width / 2, -(height / 2), -(depth / 2));
    // return mesh;
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

export default {
    Throttle,
    getRandomNum,
    setName,
    calculationPositionSize,
    formatArray,
    addElement,
    addGroupElement,
}