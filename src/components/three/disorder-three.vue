<template>
  <div class="disorder-three">
    <div id="disorder"></div>
  </div>
</template>

<script>
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import utils from "@/utils/utils";
import bus from "@/utils/bus";
import {GLTFExporter} from "three/examples/jsm/exporters/GLTFExporter";

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
  name: "disorder-three",
  data() {
    return {
      size: '',
      slotList: []
    }
  },
  mounted() {
    this.init();
    bus.$on('setSlotList', (slotList, size) => {
      this.size = size;
      this.slotList = slotList;
      this.sceneLoad();
    })
    bus.$on('operationExportGlb', () => {
      this.exportGlb();
    })

    window.addEventListener('resize', () => {
      let container = document.querySelector('#disorder');
      let width = container.offsetWidth; //当前元素宽度
      let height = container.offsetHeight; //当前元素高度
      // 重置渲染器输出画布canvas尺寸
      renderer.setSize(width, height);
      // 全屏情况下：设置观察范围长宽比aspect为窗口宽高比
      camera.aspect = width / height;
      // 渲染器执行render方法的时候会读取相机对象的投影矩阵属性projectionMatrix
      // 但是不会每渲染一帧，就通过相机的属性计算投影矩阵(节约计算资源)
      // 如果相机的一些属性发生了变化，需要执行updateProjectionMatrix ()方法更新相机的投影矩阵
      camera.updateProjectionMatrix();
      //执行渲染操作   指定场景、相机作为参数
      renderer.render(scene, camera);
    })
  },
  methods: {
    exportGlb() {
      const exporter = new GLTFExporter();
      exporter.parse(scene.children.filter(item => item.isMesh), (glb) => {
        // console.log(glb)
        this.download(`${utils.setName()}.glb`, glb, 'application/octet-stream')
      }, (err) => {
        console.log(err)
      }, {
        binary: true,
        trishape: true,
      })
    },
    download(filename, text, type = "text/plain") {
      // Create an invisible A element
      const a = document.createElement("a");
      a.style.display = "none";
      document.body.appendChild(a);

      // Set the HREF to a Blob representation of the data to be downloaded
      a.href = window.URL.createObjectURL(
          new Blob([text], {type})
      );

      // Use download attribute to set set desired file name
      a.setAttribute("download", filename);

      // Trigger the download by simulating click
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(a.href);
      document.body.removeChild(a);
    },
    sceneLoad() {
      scene.remove.apply(scene, scene.children.filter(child => child.isMesh))
      let list = this.slotList;
      let size = {
        width: this.size.split(',')[0],
        height: this.size.split(',')[1],
        depth: this.size.split(',')[2],
      };
      let chassisElement = utils.addElement(size.width, size.height, size.depth, '#409EFF');
      scene.add(chassisElement);
      list.forEach(item => {
        let cardSize = {
          width: item.size.split(',')[0],
          height: item.size.split(',')[1],
          depth: size.depth,
        }
        let cardPosition = {
          x: item.position.split(',')[1] || 0,
          y: item.position.split(',')[0] || 0,
          z: 10
        }
        let cardElement = utils.addElement(cardSize.width, cardSize.height, cardSize.depth, '#F56C6C');
        cardElement.name = item.id;
        chassisElement.add(cardElement);
        this.$nextTick(() => {
          cardElement.position.set(parseInt(cardPosition.x), -parseInt(cardPosition.y), cardPosition.z);
          this.render();
        });
      })
      this.render();
    },
    init() {
      let container = document.querySelector('#disorder');
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
      camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 5000);
      camera.position.set(0, 0, 3000); //设置相机位置
      camera.lookAt(scene.position); //设置相机方向(指向的场景对象)
      /**
       * 创建渲染器对象
       */
      renderer = new THREE.WebGLRenderer();
      renderer.setSize(width, height);//设置渲染区域尺寸
      renderer.setClearColor(0xb9d3ff, 1); //设置背景颜色
      container.appendChild(renderer.domElement); //body元素中插入canvas对象
      /**
       * 光源设置
       */
      point = new THREE.PointLight(0xffffff);
      point.position.set(10, 10, 40); //点光源位置
      scene.add(point); //点光源添加到场景中
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
    render: utils.Throttle(function () {
      //执行渲染操作   指定场景、相机作为参数
      renderer.render(scene, camera);
    }, 200),
  }
}
</script>

<style lang="scss" scoped>
.disorder-three {
  width: 100%;
  height: 100%;

  #disorder {
    width: 100%;
    height: 100%;
  }
}

</style>