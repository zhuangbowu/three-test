<template>
  <div class="about">
    <!-- 3D模型容器 -->
    <div id="container"></div>
  </div>
</template>
<script>
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';

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

export default {
  name: "AboutView",
  data() {
    return {}
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      let container = document.querySelector('#container');
      scene = new THREE.Scene();
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
      /**
       * 创建几何体
       * */
      let geometry = new THREE.BoxGeometry(1, 1, 1); //创建一个立方体几何对象Geometry
      let material = new THREE.MeshLambertMaterial({
        color: 0x00ff00
      }); //材质对象Material
      let mesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh
      scene.add(mesh); //网格模型添加到场景中
      this.render();
      camera.position.set(-2, 5, 10); //设置相机位置
      camera.lookAt(scene.position); //设置相机方向(指向的场景对象)
      this.render();
      /**
       * 光源设置
       */
      point = new THREE.PointLight(0xffffff);
      point.position.set(10, 10, 40); //点光源位置
      scene.add(point); //点光源添加到场景中
      this.render();
      /**
       * 环境光设置
       */
      ambient = new THREE.AmbientLight(0x444444);
      scene.add(ambient);

      /**
       * 添加坐标轴，辅助判断位置
       * */
      let axes = new THREE.AxesHelper(1000);
      scene.add(axes);

      this.render();
      /**
       * 控制器设置
       */
      controls = new OrbitControls(camera, renderer.domElement);//创建控件对象
      controls.addEventListener('change', this.render);//监听鼠标、键盘事件
    },

    render(){
      renderer.render(scene, camera);
    },
  }
}
</script>
<style lang="scss" scoped>
.about {
  width: 100%;
  height: 100%;

  #container {
    width: 100%;
    height: 100vh;
  }
}
</style>
