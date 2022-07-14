<template>
  <div class="home">
    <button class="bnt" @click="addGlb('4dc15f621edd7945acba4d38796a32e8')">加载1</button>
    <button class="bnt" @click="addGlb('x16card')">加载2</button>
    <button class="bnt" @click="addRectangle">增加</button>
    <button class="bnt" @click="setRectangle">修改</button>
    <button class="bnt" @click="deleteRectangle">删除</button>
    <button class="bnt" @click="render">更新</button>
    <!-- 3D模型容器 -->
    <div id="container"></div>
  </div>
</template>

<script>
// @ is an alias to /src
import * as THREE from 'three'
import * as Stats from 'stats.js'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {DragControls} from "three/examples/jsm/controls/DragControls"; //拖拽控件
import {TransformControls} from "three/examples/jsm/controls/TransformControls"; //可视化平移控件
import addStats from '@/utils/stats'

import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader.js'
import {LoadingManager} from 'three'

// 场景对象Scene
let scene = null;
// 光源对象
let point = null;
// 环境光
let ambient = null;
// 相机对象
let camera = null;
// 渲染器对象
let renderer = null;
// 控制器对象
let controls = null;


function Throttle(fn, delay) {
  let open = true;
  return function (...data) {
    console.log(222)
    if (!open) {
      //休息时间 暂不接客
      return false
    }
    // 工作时间，执行函数并且在间隔期内把状态位设为无效
    open = false
    setTimeout(() => {
      fn(...data)
      open = true;
    }, delay)
  }
}

export default {
  name: 'HomeView',
  data() {
    return {
      // 网口列表
      port: [
        {
          id: '9527',
          type: '5-02',
          state: 1,
          sort: 1
        },
        {
          id: '9528',
          type: '5-04',
          state: 0,
          sort: 2
        },
        {
          id: '9529',
          type: '5-03',
          state: 1,
          sort: 3
        },
        {
          id: '9529',
          type: '5-03',
          state: 1,
          sort: 8
        },
      ],
      network: {
        id: 'sdasdasdawadsa5da',
        type: '102-4-5'
      }
    }
  },
  created() {
    const dracoLoader = new DRACOLoader();  //
    dracoLoader.setDecoderPath('static/glb/');//设置解压库文件路径
    dracoLoader.setDecoderConfig({type: 'js'})  //使用js方式解压
    dracoLoader.preload()  //初始化_initDecoder 解码器
    this.dracoLoader = dracoLoader;
    // const dracoLoader = new DRACOLoader()
    // dracoLoader.setDecoderPath('static/glb/')
  },
  mounted() {
    // 创建三维
    this.init();
    // 添加性能检测器
    this.stats = addStats()
  },
  methods: {
    init() {
      let container = document.querySelector('#container');
      /**
       * 创建场景对象Scene
       */
      scene = new THREE.Scene();
      /**
       * 添加坐标轴，辅助判断位置
       * */
      let axes = new THREE.AxesHelper(1000);
      scene.add(axes);
      /**
       * 光源设置
       */
      point = new THREE.PointLight(0xffffff);
      point.position.set(10, 10, 40); //点光源位置
      scene.add(point); //点光源添加到场景中
      //环境光
      ambient = new THREE.AmbientLight(0x444444);
      scene.add(ambient);
      /**
       * 相机设置
       */
      let width = container.offsetWidth; //当前元素宽度
      let height = container.offsetHeight; //当前元素高度
      let k = width / height; //窗口宽高比
      let s = 200; //三维场景显示范围控制系数，系数越大，显示的范围越大
      //创建相机对象
      // 正投影相机
      // camera = new THREE.OrthographicCamera(-s * k, s * k, s, -s, 1, 1000);
      // 透视投影相机（人眼模式、近大远小）
      camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 1000);
      camera.position.set(0, 0, 10); //设置相机位置
      camera.lookAt(scene.position); //设置相机方向(指向的场景对象)
      /**
       * 创建渲染器对象
       */
      renderer = new THREE.WebGLRenderer();
      renderer.setSize(width, height);//设置渲染区域尺寸
      renderer.setClearColor(0xb9d3ff, 1); //设置背景颜色
      container.appendChild(renderer.domElement); //body元素中插入canvas对象


      // let mesh = this.addRectangle({
      //   x: 50,
      //   y: 10,
      //   z: 10
      // }, {
      //   color: 0x0000ff
      // })
      // this.port.forEach(item => {
      //   let color = 0xff0000;
      //   if (item.state) {
      //     color = 0x00ff00;
      //   }
      //   let mesh2 = this.addRectangle({
      //     x: 2,
      //     y: 2,
      //     z: 2
      //   }, {
      //     color: color
      //   }, mesh)
      //   mesh2.position.set((item.sort) * 3, 0, 4.1)
      // })
      // mesh.position.set(5, 0, 0)
      setTimeout(() => {
        this.addGlb('4dc15f621edd7945acba4d38796a32e8');
      }, 2000)
      this.render();
      controls = new OrbitControls(camera, renderer.domElement);//创建控件对象
      controls.addEventListener('change', this.render);//监听鼠标、键盘事件
    },
    render() {
      console.log(2222)
      //执行渲染操作   指定场景、相机作为参数
      Throttle(() => {
        console.log(66666)
        renderer.render(scene, camera);
      }, 200)
      if (this.stats) {
        this.stats.update();
      }
    },
    // 调用方法创建形状
    /**
     * 第一个参数xyz
     * 第二个参数材质对象
     * 第三个参数是否有父对象
     * */
    // 第二个
    addRectangle(xyz, parameters, parent) {
      let geometry = new THREE.BoxGeometry(xyz.x, xyz.y, xyz.z); //创建一个立方体几何对象Geometry
      let material = new THREE.MeshLambertMaterial(parameters); //材质对象Material
      let mesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh
      // 改变定点位置从左前下角开始计算坐标值的位置
      if (parent) {
        parent.add(mesh); //网格模型添加到场景中
      } else {
        // 修改中心点的位置，方便放入子节点进行排序
        mesh.geometry.translate(xyz.x / 2, 0, 0);
        scene.add(mesh); //网格模型添加到场景中
      }
      // 添加完成模型之后调用render方法重新加载
      this.render();
      return mesh;
    },
    getRandomNum(m, n) {
      return Math.floor(Math.random() * (m - n) + n);
    },
    // 调用方法删除形状
    deleteRectangle() {
      for (let i = this.mesh.children.length - 1; i >= 0; i--) {
        this.mesh.remove(this.mesh.children[i]);
      }
      this.render();
    },
    // 调用方法删除形状
    setRectangle() {
      this.mesh.position.set(++this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);
      this.render();
    },
    // 添加拖拽控件
    initDragControls() {
      // 添加平移控件
      // let transformControls = new TransformControls(camera, renderer.domElement);
      // scene.add(transformControls);

      // 过滤不是 Mesh 的物体,例如辅助网格
      let objects = [];


      objects.push(this.mesh)


      console.log(objects, 'objects')
      // 初始化拖拽控件
      let dragControls = new DragControls(objects, camera, renderer.domElement);

      // 鼠标略过事件
      dragControls.addEventListener('hoveron', (event) => {
        // 让变换控件对象和选中的对象绑定
        // transformControls.attach(event.object);
      });
      // 开始拖拽
      dragControls.addEventListener('dragstart', (event) => {
        console.log('dragstart', event)
        controls.enabled = false;
      });
      // 拖拽结束
      dragControls.addEventListener('dragend', (event) => {
        console.log('dragend', event)
        controls.enabled = true;
        console.log('结束', this.mesh)
        this.render();
      });
    },
    // 加载glb模型
    addGlb(text) {
      const gltfLoader = new GLTFLoader(new LoadingManager());
      // GLTF loader
      gltfLoader.setDRACOLoader(this.dracoLoader);   //gltfloader使用dracoLoader
      console.time();
      gltfLoader.load(
          `static/glb/${text}.glb`,
          (gltf) => {
            console.log(gltf);
            //可以设置每个mash的纹理
            let i = 0;
            gltf.scene.traverse(obj => {
              i++;
            })
            gltf.scene.rotateY(Math.PI / 1)
            scene.add(gltf.scene)
            console.timeEnd();
            this.render();
          }, (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded'), xhr;
          }, (e) => {
            console.error('啊出错了', e)
          }
      )
    }

  }
}
</script>
<style lang="scss" scoped>
.home {
  width: 100%;

  .bnt {
    line-height: 32px;
    width: 120px;
    color: #fff;
    text-align: center;
    cursor: pointer;
    padding: 0;
    margin: 0 12px 0 0;
    background-color: #409EFF;
  }

  #container {
    width: 100%;
    height: calc(100vh - 40px);
  }
}
</style>