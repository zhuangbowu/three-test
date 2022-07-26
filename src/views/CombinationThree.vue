<template>
  <div class="combination-three">
    <el-container>
      <el-main>
        <!-- 3D模型容器 -->
        <div id="container"></div>

      </el-main>
      <el-aside width="400px">
        <!-- 编辑区域 -->
        <div class="edit">
          <el-form ref="form" :model="form" label-width="120px">
            <el-form-item label="机框尺寸(宽高深)">
              <el-input type="text" v-model="form.size" aria-placeholder="填写数字中间以逗号隔开"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="sceneLoad">立即渲染</el-button>
              <el-button @click="exportGlb">导出</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-aside>
    </el-container>
  </div>
</template>

<script>
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTFExporter} from 'three/examples/jsm/exporters/GLTFExporter'
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
export default {
  name: "combination-three",
  data() {
    return {
      form: {
        size: '765,444,622',
      },
      list: [
        {
          index: '1',
          name: '1',
          children: [
            {
              index: '1',
              name: '1',
            },
            {
              index: '2',
              name: '2',
            },
            {
              index: '3',
              name: '3',
            },
          ]
        },
        {
          index: '2-1',
          name: '2-1'
        },
        {
          index: '2-2',
          name: '2-2'
        },
        {
          index: '3',
          name: '3',
          children: [
            {
              index: '1',
              name: '1',
            },
            {
              index: '2',
              name: '2',
            },
          ]
        },
        {
          index: '4',
          name: '4'
        },
        {
          index: '5-1',
          name: '5-1',
          children: [
            {
              index: '1',
              name: '1',
            },
            {
              index: '2',
              name: '2',
            },
          ]
        },
        {
          index: '5-2',
          name: '5-2',
          children: [
            {
              index: '1',
              name: '1',
            },
            {
              index: '2',
              name: '2',
            },
          ]
        },
        {
          index: '6',
          name: '6'
        },
        {
          index: '7',
          name: '7'
        },
        {
          index: '8',
          name: '8',
          children: [
            {
              index: '1',
              name: '1',
            },
            {
              index: '2',
              name: '2',
            },
          ]
        },
      ]
    }
  },
  mounted() {
    this.init();
    this.sceneLoad();
    window.addEventListener('resize', () => {
      let container = document.querySelector('#container');
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
    sceneLoad() {
      scene.remove.apply(scene, scene.children.filter(child => child.isMesh))
      let list = utils.formatArray(this.list);
      let size = {
        width: this.form.size.split(',')[2],
        height: this.form.size.split(',')[1],
        depth: this.form.size.split(',')[0],
      };
      let chassisElement = this.addElement(size.width, size.height, size.depth, '#409EFF');
      scene.add(chassisElement);

      let cardClass = new utils.calculationPositionSize({
        width: size.width,
        height: size.height,
        padding: {
          top: 4,
          bottom: 4,
          left: 4,
          right: 4,
        },
        numMax: list.length,
        spacing: 6,
        type: 1,
        change: false
      });
      let cardSize = cardClass.getSize();
      cardSize.depth = size.depth;
      list.forEach((item, index) => {
        let cardPosition = cardClass.getPosition(index);
        let cardElement;
        if (item.column) {
          cardElement = this.addGroupElement(cardSize.width, cardSize.height, cardSize.depth / 2);
        } else {
          cardElement = this.addElement(cardSize.width, cardSize.height, cardSize.depth / 2, '#67C23A');
        }
        cardElement.name = item.name;
        cardElement.position.set(cardPosition.x, -cardPosition.y, 10)
        chassisElement.attach(cardElement);
        if (item.column) {
          this.addColumnList(cardSize, item.column, cardElement);
        }
        if (item.children) {
          this.addChildrenList(cardSize, item.children, cardElement);
        }
        this.render();
      })
    },
    addChildrenList(size, list, element) {
      let childrenClass = new utils.calculationPositionSize({
        width: size.width,
        height: size.height,
        padding: {
          top: 4,
          bottom: 4,
          left: 4,
          right: 4,
        },
        numMax: list.length,
        spacing: 4,
        type: 2,
        change: false
      });
      let childrenSize = childrenClass.getSize();
      childrenSize.depth = size.depth;
      list.forEach((item, index) => {
        let childrenPosition = childrenClass.getPosition(index);
        let childrenElement = this.addElement(childrenSize.width, childrenSize.height, childrenSize.depth / 2, '#F56C6C');
        childrenElement.name = item.name;
        element.attach(childrenElement);
        // 必须渲染完成之后才能修改坐标不然坐标会出现问题
        this.$nextTick(() => {
          childrenElement.position.set(childrenPosition.x, -childrenPosition.y, 10)
        })
      })
    },
    addColumnList(size, list, element) {
      let columnClass = new utils.calculationPositionSize({
        width: size.width,
        height: size.height,
        padding: {
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
        },
        numMax: list.length,
        spacing: 8,
        type: 2,
        change: false
      });
      let columnSize = columnClass.getSize();
      columnSize.depth = size.depth;
      list.forEach((item, index) => {
        let columnPosition = columnClass.getPosition(index);
        let columnElement = this.addElement(columnSize.width, columnSize.height, columnSize.depth / 2, '#E6A23C');
        columnElement.name = item.name;
        element.attach(columnElement);
        // 必须渲染完成之后才能修改坐标不然坐标会出现问题
        this.$nextTick(() => {
          columnElement.position.set(columnPosition.x, -columnPosition.y, 0)
        })
        if (item.children) {
          this.addChildrenList(columnSize, item.children, columnElement);
        }
      })
    },
    // 创建一个空板卡
    addElement(width = 1, height = 1, depth = 1, color = '#409EFF') {
      let parameters = {
        color: color
      }
      let geometry = new THREE.BoxGeometry(width, height, depth); //创建一个立方体几何对象Geometry
      let material = new THREE.MeshLambertMaterial({
        ...parameters,
        // opacity: 0.5,
        // transparent: true
      }); //材质对象Material
      let mesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh
      // 改变定点位置从右上前开始计算坐标值的位置
      mesh.geometry.translate(width / 2, -(height / 2), -(depth / 2));
      return mesh;
    },
    // 创建一个占位符
    addGroupElement(width = 1, height = 1, depth = 1) {
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
    },

    // 导出模型并下载
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
      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 28000);
      camera.position.set(0, 500, 2400); //设置相机位置
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
      point.position.set(0, 0, 1200); //点光源位置
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
    }, 20),
  }
}
</script>

<style lang="scss" scoped>
.combination-three {
  width: 100%;
  height: 100%;

  .el-container {
    height: 100%;

    .edit {
      padding: 60px 20px 20px 20px;
    }

    #container {
      height: 100%;
    }
  }
}
</style>