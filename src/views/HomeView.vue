<template>
  <div class="home">
    <el-button @click="addGlb(1,'4dc15f621edd7945acba4d38796a32e8')">加载1</el-button>
    <el-button @click="addGlb(1,'x16card')">加载2</el-button>
    <el-button @click="initDragControls">可拖拽</el-button>
    <el-button @click="addRectangle">增加</el-button>
    <el-button @click="setRectangle">修改</el-button>
    <el-button @click="deleteRectangle">删除</el-button>
    <el-button @click="getSize">查询模型的宽高深的值</el-button>
    <el-input type="text" v-model="modelVal"></el-input>
    <el-button @click="setSize">修改模型的宽高深</el-button>
    <el-button @click="render">更新</el-button>
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
import utils from "@/utils/utils";

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
// 添加性能检测器
let stats = addStats()


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
      },
      modelVal: ''
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
      point.position.set(0, 0, 3000); //点光源位置
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
      camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 28000);
      camera.position.set(0, 0, 3000); //设置相机位置
      camera.lookAt(scene.position); //设置相机方向(指向的场景对象)
      /**
       * 创建渲染器对象
       */
      renderer = new THREE.WebGLRenderer();
      renderer.setSize(width, height);//设置渲染区域尺寸
      renderer.setClearColor(0xb9d3ff, 1); //设置背景颜色
      container.appendChild(renderer.domElement); //body元素中插入canvas对象


      // let mesh = this.addRectangle({
      //   x: 1,
      //   y: 1,
      //   z: 1
      // }, {
      //   color: 0xff0000
      // })
      // mesh.position.set(-1, -1, -1)
      // scene.add(mesh);
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
        // this.addGlb('4dc15f621edd7945acba4d38796a32e8');
        // this.addGlb('demo');
        this.addGlb(0, 'QM9ISwNNdzB8UAoOZpF8A3AXSJz3QQIdM9O2lacSsnjlN9YsNt1JXuXl5fa2JnWqgch2Vo4SmGDDVDyAhV5nDmTeKlFDhQc2QuYSE6pkuhgPLoFnVBoWf23W7n6JuuFucPCMqiOv5tkMzOqrjc1opzp3eu5NYImVlPwVJG2JCyuCWieW86D9KleO57kLQTsExkbViGH3');

      }, 2000)
      this.render();
      controls = new OrbitControls(camera, renderer.domElement);//创建控件对象
      controls.addEventListener('change', this.render);//监听鼠标、键盘事件
    },
    render: utils.Throttle(function () {
      //执行渲染操作   指定场景、相机作为参数
      renderer.render(scene, camera);
      if (stats) {
        stats.update();
      }
    }),
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
      scene.children.forEach(item => {
        if (item.isGroup) {
          scene.remove(item)
          this.render();
        }
      })


      for (let i = this.mesh.children.length - 1; i >= 0; i--) {
        this.mesh.remove(this.mesh.children[i]);
      }
      this.render();
    },
    // 调用方法删除形状
    setRectangle() {
      scene.children.forEach(item => {
        if (item.isGroup) {
          // item.scale.set(++item.scale.x, 1, 1);
          // item.scale.set(++item.scale.x, 1, 1);
          // this.render();
          // console.log(item)
          //mesh:模型
          let box = new THREE.Box3().expandByObject(item);
          console.log('box', box.max.x - box.min.x)
          // let size = box.getSize();
          // console.log('size', size)
          let geometry = new THREE.BoxGeometry(box.max.x - box.min.x, box.max.y - box.min.y, box.max.z - box.min.z); //创建一个立方体几何对象Geometry
          let material = new THREE.MeshLambertMaterial({
            color: 0xff0000,
            opacity: 0.5,
            transparent: true
          }); //材质对象Material
          let mesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh
          scene.add(mesh);
          this.render();
        }
      })
      // this.mesh.position.set(++this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);
      // this.render();
    },
    getSize() {
      scene.children.forEach(item => {
        if (item.isGroup) {
          let box = new THREE.Box3().expandByObject(item);
          console.log(item, box)
        }
      })
    },
    setSize() {
      scene.children.forEach(item => {
        if (item.isGroup) {
          let box = new THREE.Box3().expandByObject(item);
          if (!item.originalBox) {
            item.originalBox = box;
          }
          item.scale.set(this.modelVal / (item.originalBox.max.x - item.originalBox.min.x), item.scale.y, item.scale.z);
          this.render();
        }
      })
    },
    // 添加拖拽控件
    initDragControls() {
      // 添加平移控件
      // let transformControls = new TransformControls(camera, renderer.domElement);
      // scene.add(transformControls);

      // 过滤不是 Mesh 的物体,例如辅助网格
      let objects = [];
      scene.children.forEach(item => {
        if (item.type === 'Group') {
          objects.push(item)
        }
      })

      console.log(objects, 'objects')
      // 初始化拖拽控件
      let dragControls = new DragControls(objects, camera, renderer.domElement);


      // 鼠标略过事件
      dragControls.addEventListener('hoveron', (event) => {
        // dragControls.transformGroup = true
        // console.log(event)
        // 让变换控件对象和选中的对象绑定
        // transformControls.attach(event.object);
      });
      dragControls.addEventListener('hoveroff', (event) => {
        // dragControls.transformGroup = false
      })
      // 开始拖拽
      dragControls.addEventListener('dragstart', (event) => {
        console.log('dragstart', event)
        controls.enabled = false;
      });
      // 拖拽过程
      dragControls.addEventListener('drag', (event) => {

        let parent = this.recursionId(event.object);
        let name = event.object.name; // event.object即为外部模型，在这里可以通过外层模型的name属性找到内部模型
        let x = event.object.position.x
        let y = event.object.position.y
        let z = event.object.position.z
        parent.position.x = x // 给内部模型位置赋值
        parent.position.y = y
        parent.position.z = z
      });

      // 拖拽结束
      dragControls.addEventListener('dragend', (event) => {
        console.log('dragend', event)
        controls.enabled = true;
        console.log('结束', this.mesh)
        this.render();
      });
    },
    // 通过递归对比id找到group然后移动整个group
    recursionId(data) {
      let parent = null;
      if (!data.parent.isScene) {
        parent = this.recursionId(data.parent)
      } else {
        console.log(1111111, data)
        return data;
      }
      return parent;
    },
    // 加载glb模型
    addGlb(type, text) {
      const gltfLoader = new GLTFLoader(new LoadingManager());
      // GLTF loader
      gltfLoader.setDRACOLoader(this.dracoLoader);   //gltfloader使用dracoLoader
      console.time();
      gltfLoader.load(
          `static/glb/${text}.glb`,
          (gltf) => {
            //可以设置每个mash的纹理
            let i = 0;
            gltf.scene.traverse(obj => {
              // console.log(obj)
              i++;
            })

            if (type === 1) {
              scene.children.forEach(item => {
                if (item.isGroup) {
                  item.attach(gltf.scene)
                }
              })
            } else {
              scene.add(gltf.scene);
            }

            console.timeEnd();
            this.render();
            console.log(scene)
            // gltf.scene.rotateY(Math.PI / 4)
            // scene.add(gltf.scene)
            // console.log(scene, i);
            // console.timeEnd();
            // this.initDragControls();
            // this.render();
          }, (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
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