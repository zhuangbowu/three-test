<template>
  <div class="disorder-three">
    <div id="disorder"></div>
  </div>
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import utils from "@/utils/utils";
import bus from "@/utils/bus";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";

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
      chassis: {},
      size: '',
      slotList: [],
      // 用于遍历然后存储已加载的glb文件
      glbList: [],
      num: 0
    }
  },
  mounted() {
    this.init();
    bus.$on('setSlotList', async (obj) => {
      console.log(obj)
      // 先找到新增加的
      for (const objKey in obj) {
        if (typeof obj[objKey] !== 'object') {
          this.chassis[objKey] = obj[objKey]
        }
      }
      await this.addGlbList([ ...obj.arr, this.chassis ]);
      // 加载glb模型
      if (this.num === 0) {
        this.num++;
        this.slotList = obj.arr;
        await this.sceneLoad();
      } else {
        let chassisElement = scene.children.find(item => item.userData.data);
        let changeChassis = new utils.meshChange(chassisElement);
        changeChassis.operationSize({
          width: obj.width,
          height: obj.height,
          depth: obj.depth,
        })

        // let arr = utils.contrastArr(obj.arr, this.slotList);
        // console.log(arr);
        switch (true) {
          case this.slotList.length > obj.arr.length:
            let removeArr = this.slotList.filter(item => !obj.arr.some(ele => ele.id === item.id));
            for (let i = chassisElement.children.length - 1; i >= 0; i--) {
              const sonItem = chassisElement.children[i];
              let find = removeArr.findIndex(findItem => findItem.id === sonItem.userData?.data?.id);
              if (find !== -1) {
                chassisElement.remove(sonItem);
              }
            }
            break;
          case this.slotList.length < obj.arr.length:
            let addArr = obj.arr.filter(item => !this.slotList.some(ele => ele.id === item.id));
            addArr.forEach(item => {
              let find = this.glbList.find(findItem => findItem.userData.type === item.type);
              let cardElement = find.clone(true);
              cardElement.userData.data = JSON.parse(JSON.stringify(item));
              chassisElement.attach(cardElement);
              let changeCard = new utils.meshChange(cardElement);
              this.$nextTick(() => {
                changeCard.operationPosition({
                  x: item.x,
                  y: item.y,
                  z: -10,
                },chassisElement)
                this.render();
              })
            })
            break;
        }
        console.log(333333333333333)
        console.log(obj.arr)
        console.log(chassisElement)
        // 没有增加也没有减少
        // 这个地方需要对比每个模型的的大小、位置、型号如果发生改变的话进行重新绘制
        obj.arr.forEach(item => {
          let currentElement = scene.children.find(findItem => findItem.userData?.data?.id === item.id);
          if (currentElement) {
            let changeCurrent = new utils.meshChange(currentElement);
            let newSize = {
              width: item.width,
              height: item.height,
              depth: item.depth,
            };
            changeCurrent.operationSize(newSize);
            changeCurrent.operationPosition({
              x: item.x,
              y: item.y,
              z: -10,
            },chassisElement)


            // if (currentElement?.userData?.data?.type !== item.type) {
            //   chassisElement.remove(currentElement);
            //   let find = this.glbList.find(findItem => findItem.userData.type === item.type);
            //   let cardElement = find.clone(true);
            //   // 使用深拷贝防止和之前的数据还有关联
            //   cardElement.userData.data = JSON.parse(JSON.stringify(item));
            //   chassisElement.attach(cardElement);
            //   let cardPosition = {
            //     x: item.position.split(',')[1] || 0,
            //     y: item.position.split(',')[0] || 0,
            //     z: 10
            //   }
            //   cardElement.position.set(parseInt(cardPosition.x), -parseInt(cardPosition.y), cardPosition.z);
            // }
          }

        })
        this.slotList = obj.arr;
        this.render();
      }
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
    sceneLoad() {
      let list = this.slotList;
      let find = this.glbList.find(findItem => findItem.userData.type === this.chassis.type);
      let chassisElement = find.clone(true);
      // 使用深拷贝防止和之前的数据还有关联
      chassisElement.userData.data = JSON.parse(JSON.stringify(this.chassis));
      // chassisElement.visible = false;
      scene.add(chassisElement);
      list.forEach(item => {
        let find2 = this.glbList.find(findItem => findItem.userData.type === item.type);
        let cardElement = find2.clone(true);
        console.log('cardElement',cardElement)
        // 使用深拷贝防止和之前的数据还有关联
        cardElement.userData.data = JSON.parse(JSON.stringify(item));
        scene.attach(cardElement);

        let changeCard = new utils.meshChange(cardElement);
        changeCard.operationPosition({
          x: item.x,
          y: item.y,
          z: -200,
        }, chassisElement)
      })

      console.log(scene)
      this.render();
    },
    // 加载glb文件模型，暂时无glb文件模型，所以改用动态创建的立方体代替
    // 传入数据列表然后提取出来类型进行去重
    async addGlbList(list) {
      let mapArr = [], glbArr = [];
      list.forEach(item => {
        // 判断新数组是否存在这个类型
        let mapItem = mapArr.find(findItem => findItem.type === item.type);
        // 判断glb已经存储的列表里面是否存在这个类型的文件
        let glbItem = this.glbList.find(findItem => findItem.userData.type === item.type);
        if (!mapItem && !glbItem) {
          mapArr.push(item);
        }
      })
      console.time()
      for (let i = 0; i < mapArr.length; i++) {
        const item = mapArr[i];
        let element = await this.addGlb(item);
        glbArr.push(element);
      }
      console.timeEnd()
      this.glbList = [ ...this.glbList, ...glbArr ];
    },
    // 增加
    async addGlb(item) {
      let color = '#ff0000';
      switch (item.type) {
        case "up66ReoiDeSn":
          break;
        case "YYydV0x5Rrwt":
          color = '#ff0000';
          break;
        case "YhqeaVCrvLzJ":
          color = '#ff0000';
          break;
      }
      let element = await utils.addElement(item.width, item.height, item.depth, color);
      element.userData.type = item.type;
      return element;
    },

    exportGlb() {
      const exporter = new GLTFExporter();
      let item = scene.children.filter(item => item.userData.data);
      exporter.parse(item, (glb) => {
        console.log(glb)
        this.download(`${ utils.setName() }.glb`, glb, 'application/octet-stream')
      }, (err) => {
        console.log(err)
      }, {
        binary: true,
        trs: true
      })
    },
    download(filename, text, type = "text/plain") {
      // Create an invisible A element
      const a = document.createElement("a");
      a.style.display = "none";
      document.body.appendChild(a);

      // Set the HREF to a Blob representation of the data to be downloaded
      a.href = window.URL.createObjectURL(
          new Blob([ text ], { type })
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
      camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 10000000);
      camera.position.set(0, 0, -3000); //设置相机位置
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
      let point = new THREE.PointLight(0xffffff);
      point.position.set(20, 20, -1000); //点光源位置
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
    }, 100),
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