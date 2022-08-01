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
      chassis: {},
      size: '',
      slotList: [],
      // 用于遍历然后存储已加载的glb文件
      glbList: []
    }
  },
  mounted() {
    this.init();
    bus.$on('setSlotList', async (obj) => {
      // 先找到新增加的
      this.chassis = {
        size: obj.size,
        type: obj.type,
      };
      await this.addGlbList([...obj.arr, this.chassis]);
      // 加载glb模型
      if (this.slotList.length === 0) {
        this.slotList = obj.arr;
        await this.sceneLoad();
      } else {
        if (this.chassis.size !== obj.size) {
          let newSize = {
            width: parseInt(obj.size.split(',')[0]),
            height: parseInt(obj.size.split(',')[1]),
            depth: parseInt(obj.size.split(',')[2]),
          };
          scene.children.forEach(item => {
            if (item.userData.data) {
              let usedSize = {
                width: item.userData.originalBox.max.x - item.userData.originalBox.min.x,
                height: item.userData.originalBox.max.y - item.userData.originalBox.min.y,
                depth: item.userData.originalBox.max.z - item.userData.originalBox.min.z,
              };
              const group = new THREE.Group();
              for (let i = item.children.length - 1; i >= 0; i--) {
                if (item.children[i].userData.data) {
                  group.attach(item.children[i]);
                }
              }
              item.scale.set(newSize.width / usedSize.width, newSize.height / usedSize.height, newSize.depth / usedSize.depth);
              for (let i = group.children.length - 1; i >= 0; i--) {
                item.attach(group.children[i]);
              }
              this.chassis.size = obj.size;
            }
          })
        }
        switch (true) {
          case this.slotList.length > obj.arr.length:
            let arr = this.slotList.filter(item => !obj.arr.some(ele => ele.id === item.id));
            console.log(arr)
            scene.children.forEach(item => {
              if (item.userData.data) {
                for (let i = item.children.length - 1; i >= 0; i--) {
                  const sonItem = item.children[i];
                  let find = arr.findIndex(findItem => findItem.id === sonItem.userData?.data?.id);
                  if (find !== -1) {
                    item.remove(sonItem);
                  }
                }
              }
            })
            break;
          case this.slotList.length < obj.arr.length:
            let arr2 = obj.arr.filter(item => !this.slotList.some(ele => ele.id === item.id));
            arr2.forEach(item => {
              let find = this.glbList.find(findItem => findItem.userData.type === item.type);
              let cardElement = find.clone(true);
              cardElement.userData.data = JSON.parse(JSON.stringify(item));
              let chassisElement = scene.children.find(filterItem => filterItem.userData.data);
              chassisElement.attach(cardElement);

              let cardPosition = {
                x: item.position.split(',')[1] || 0,
                y: item.position.split(',')[0] || 0,
                z: 10
              }
              this.$nextTick(() => {
                cardElement.position.set(parseInt(cardPosition.x), -parseInt(cardPosition.y), cardPosition.z);
                this.render();
              })
            })
            break;
        }
        // 没有增加也没有减少
        // 这个地方需要对比每个模型的的大小、位置、型号如果发生改变的话进行重新绘制
        obj.arr.forEach(item => {
          let chassisElement = scene.children.find(findItem => findItem.userData.data);
          let currentElement = chassisElement.children.find(findItem => findItem.userData?.data?.id === item.id);
          console.log(currentElement, item)
          if (currentElement) {
            if (currentElement?.userData?.data?.size !== item.size) {
              let newSize = {
                width: item.size.split(',')[0],
                height: item.size.split(',')[1],
                depth: item.size.split(',')[2],
              };
              let usedSize = {
                width: currentElement.userData.originalBox.max.x - currentElement.userData.originalBox.min.x,
                height: currentElement.userData.originalBox.max.y - currentElement.userData.originalBox.min.y,
                depth: currentElement.userData.originalBox.max.z - currentElement.userData.originalBox.min.z,
              };
              currentElement.scale.set(newSize.width / usedSize.width, newSize.height / usedSize.height, newSize.depth / usedSize.depth);
              currentElement.userData.data.size = item.size;
            }
            if (currentElement?.userData?.data?.position !== item.position) {
              let cardPosition = {
                x: item.position.split(',')[1] || 0,
                y: item.position.split(',')[0] || 0,
                z: 10
              }
              currentElement.position.set(parseInt(cardPosition.x), -parseInt(cardPosition.y), cardPosition.z);
              currentElement.userData.data.position = item.position;
            }
            if (currentElement?.userData?.data?.type !== item.type) {
              chassisElement.remove(currentElement);
              let find = this.glbList.find(findItem => findItem.userData.type === item.type);
              let cardElement = find.clone(true);
              // 使用深拷贝防止和之前的数据还有关联
              cardElement.userData.data = JSON.parse(JSON.stringify(item));
              chassisElement.attach(cardElement);
              let cardPosition = {
                x: item.position.split(',')[1] || 0,
                y: item.position.split(',')[0] || 0,
                z: 10
              }
              cardElement.position.set(parseInt(cardPosition.x), -parseInt(cardPosition.y), cardPosition.z);
            }
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
      scene.add(chassisElement);
      list.forEach(item => {
        let find2 = this.glbList.find(findItem => findItem.userData.type === item.type);
        let cardElement = find2.clone(true);
        console.log(cardElement)
        // 使用深拷贝防止和之前的数据还有关联
        cardElement.userData.data = JSON.parse(JSON.stringify(item));
        chassisElement.attach(cardElement);

        let cardPosition = {
          x: item.position.split(',')[1] || 0,
          y: item.position.split(',')[0] || 0,
          z: 0
        }

        this.$nextTick(() => {
          cardElement.position.set(parseInt(cardPosition.x), -parseInt(cardPosition.y), cardPosition.z);
          this.render();
        });
      })
      console.log(scene)
      this.render();

      // scene.remove.apply(scene, scene.children.filter(child => child.isMesh))
      // let list = this.slotList;
      // let size = {
      //   width: this.size.split(',')[0],
      //   height: this.size.split(',')[1],
      //   depth: this.size.split(',')[2],
      // };
      // let chassisElement = utils.addElement(size.width, size.height, size.depth, '#409EFF');
      // scene.add(chassisElement);
      // list.forEach(item => {
      //   let cardSize = {
      //     width: item.size.split(',')[0],
      //     height: item.size.split(',')[1],
      //     depth: size.depth,
      //   }
      //   let cardPosition = {
      //     x: item.position.split(',')[1] || 0,
      //     y: item.position.split(',')[0] || 0,
      //     z: 10
      //   }
      //   let cardElement = utils.addElement(cardSize.width, cardSize.height, cardSize.depth, '#F56C6C');
      //   cardElement.name = item.id;
      //   chassisElement.add(cardElement);
      //   this.$nextTick(() => {
      //     cardElement.position.set(parseInt(cardPosition.x), -parseInt(cardPosition.y), cardPosition.z);
      //     this.render();
      //   });
      // })
      // this.render();
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
      this.glbList = [...this.glbList, ...glbArr];
    },
    // 增加
    async addGlb(item) {
      let size = {
        width: item.size.split(',')[0],
        height: item.size.split(',')[1],
        depth: item.size.split(',')[2],
      };
      let element = await utils.addElement(parseInt(size.width), parseInt(size.height), parseInt(size.depth), '#409EFF');
      element.userData.type = item.type;
      return element;
    },

    exportGlb() {
      const exporter = new GLTFExporter();
      let item = scene.children.find(item => item.userData.data);
      exporter.parse(item, (glb) => {
        console.log(glb)
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
      camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 10000);
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
      point.position.set(10, 10, 5000); //点光源位置
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