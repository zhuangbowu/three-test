<template>
  <div class="edit-view">
    <el-container>
      <el-main>
        <!-- 3D模型容器 -->
        <div id="container"></div>

      </el-main>
      <el-aside width="400px">
        <!-- 编辑区域 -->
        <div class="edit">
          <el-form ref="form" :model="mesh" label-width="120px">
            <el-form-item label="机框尺寸(宽高长)">
              <el-input type="text" min="1" v-model="mesh.size" aria-placeholder="填写数字中间以逗号隔开"></el-input>
            </el-form-item>
            <!--            <el-form-item label="槽位列数">-->
            <!--              <el-input type="number" min="1" v-model="mesh.slotNum"></el-input>-->
            <!--            </el-form-item>-->
            <!--            <el-form-item label="槽位尺寸(宽高长)">-->
            <!--              <el-input type="text" min="1" v-model="mesh.slotSize" placeholder="填写数字中间以逗号隔开"></el-input>-->
            <!--            </el-form-item>-->
            <el-form-item label="排列规则">
              <el-select v-model="mesh.arrayRule" placeholder="请选择排列规则">
                <el-option label="横向" value="1"></el-option>
                <el-option label="竖向" value="2"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="meshRender">立即渲染</el-button>
              <el-button @click="exportGlb">导出</el-button>
            </el-form-item>
          </el-form>
          <el-button @click="setSize">缩放</el-button>
        </div>
      </el-aside>
    </el-container>
  </div>
</template>

<script>
import * as THREE from 'three'
import * as Stats from 'stats.js'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTFExporter} from 'three/examples/jsm/exporters/GLTFExporter'
import utils from "@/utils/utils";
import addStats from "@/utils/stats";
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
export default {
  name: "EditView",
  data() {
    return {
      mesh: {
        size: '765,444,622',
        slotList: [
          {
            sort: 1,
            size: '450,430,50',
            name: '第1个板卡',
            children: [
              {
                name: '第1个板卡的第2个子板卡',
                sort: 1,
              },
              {
                name: '第1个板卡的第2个子板卡',
                sort: 2,
              },
            ]
          },
          {
            sort: 2,
            size: '450,430,50',
            name: '第二2个板卡',
          },
          {
            sort: 3,
            size: '450,430,50',
            name: '第三个板卡',
          },
          {
            sort: 4,
            size: '450,430,50',
            name: '第4个板卡',
          },
          {
            sort: 5,
            size: '450,430,50',
            name: '第5个板卡',
          },
          {
            sort: 6,
            size: '450,430,50',
            name: '第6个板卡',
          },
          {
            sort: 7,
            size: '450,430,50',
            name: '第7个板卡',
          },
          {
            sort: 8,
            size: '450,430,50',
            name: '第8个板卡',
          },
          {
            sort: 9,
            size: '450,430,50',
            name: '第9个板卡',
          },
          {
            sort: 10,
            size: '450,430,50',
            name: '第10个板卡',
          },
          {
            sort: 11,
            size: '450,430,50',
            name: '第11个板卡',
          },
          {
            sort: 12,
            size: '450,430,50',
            name: '第12个板卡',
          },
        ],
        slotNum: '12',
        arrayRule: '1',
      }
    }
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
    // 缩放
    setSize() {
      scene.children.forEach(item => {
        if (item.isMesh) {
          const group = new THREE.Group();
          for (let i = item.children.length - 1; i >= 0; i--) {
            group.attach(item.children[i]);
          }
          let box = new THREE.Box3().expandByObject(item);
          if (!item.originalBox) {
            item.originalBox = box;
          }
          item.scale.set(item.scale.x, item.scale.y, 200 / (item.originalBox.max.z - item.originalBox.min.z));
          for (let i = group.children.length - 1; i >= 0; i--) {
            item.attach(group.children[i]);
          }
          this.render();
        }
      })
    },
    // 导出模型并下载
    exportGlb() {
      console.log(utils.setName())
      const exporter = new GLTFExporter();
      exporter.parse(scene.children.filter(item => item.isMesh), (glb) => {
        this.download(`${utils.setName()}.glb`, glb, 'application/octet-stream')
      }, (err) => {
        console.log(err)
      }, {
        binary: true,
        trishape: true,
      })
    },
    // 点击根据参数生成模型
    meshRender() {
      scene.remove.apply(scene, scene.children.filter(child => child.isMesh))
      let {size} = this.mesh;
      let meshSize = size.split(',');
      let parameters = {
        color: '#409EFF'
      }
      // 765×444×622
      let mesh = this.addRectangle(meshSize[2], meshSize[1], meshSize[0], parameters);
      mesh.name = '机箱';
      console.log(mesh)
      for (let i = 0; i < this.mesh.slotList.length; i++) {
        let sonMeshSize = this.mesh.slotList[i].size.split(',');
        let colorArr = ['#67C23A', '#E6A23C', '#F56C6C', '#909399']
        let parameters = {
          color: colorArr[utils.getRandomNum(0, 3)]
        }
        let sonMesh = this.addRectangle(sonMeshSize[2], sonMeshSize[1], sonMeshSize[0], parameters, mesh);
        sonMesh.position.set(((meshSize[2] - (sonMeshSize[2] * (i + 1))) - ((i + 1) * 1.69)), -((meshSize[1] - sonMeshSize[1]) / 2), 5);
        if (this.mesh.slotList[i].children) {
          for (let j = 0; j < this.mesh.slotList[i].children.length; j++) {
            let colorArr2 = ['#9d4edd', '#3d348b', '#073b4c', '#c1121f']
            let parameters = {
              color: colorArr2[utils.getRandomNum(0, 3)]
            }
            let sonMesh2 = this.addRectangle(sonMeshSize[2]-3, ((sonMeshSize[1] - 9) / this.mesh.slotList[i].children.length), sonMeshSize[0] , parameters, sonMesh);
            sonMesh2.position.set(1.5, -(j * ((sonMeshSize[1] / this.mesh.slotList[i].children.length)) + 3), 5);
          }
        }
      }
      // mesh.rotateY(Math.PI / 2);
      // camera.lookAt(scene.position); //设置相机方向(指向的场景对象)
      // camera.trace.x
      this.render();
    },
    /**
     * meshSize 父级的宽高
     * sonMeshSize 当前元素的宽高
     * index 当前元素的位置
     * num 当前元素同级的数量
     * type 1是横向 2是竖向 默认等于1
     * */
    calculationPosition(meshSize, sonMeshSize, index, num, type = 1) {
      /**
       * 如果type = 1 那就是修改x的值
       * 如果type = 2 那就是修改y的值
       * x * index + 3
       * */
    },
    // 创建几何体
    addRectangle(width, height, depth, parameters, parent) {
      let geometry = new THREE.BoxGeometry(width, height, depth); //创建一个立方体几何对象Geometry
      let material = new THREE.MeshLambertMaterial({
        ...parameters,
        // opacity: 0.5,
        // transparent: true
      }); //材质对象Material
      let mesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh
      // 改变定点位置从右上前开始计算坐标值的位置
      mesh.geometry.translate(width / 2, -(height / 2), -(depth / 2));
      if (parent) {
        parent.attach(mesh); //网格模型添加到场景中
      } else {
        // 修改中心点的位置，方便放入子节点进行排序
        scene.add(mesh); //网格模型添加到场景中
      }
      return mesh;
    },
    render: utils.Throttle(function () {
      //执行渲染操作   指定场景、相机作为参数
      renderer.render(scene, camera);
      if (stats) {
        stats.update();
      }
    }, 20),
  }
}
</script>

<style lang="scss" scoped>
.edit-view {
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