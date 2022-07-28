<template>
  <div class="drag-view">
    <el-container>
      <el-main>
        <!-- 3D拖拽容器 -->
        <div class="drag-main">
          <div class="container" :style="setContainerSize(this.form.size)" @mousedown.stop="boxMove">
            <div class="item"
                 @click="choiceCLick(item)"
                 @mousedown.stop="draggableFun(item,$event)"
                 v-for="(item,index) in elementList"
                 :style="[setContainerSize(item.size),setContainerPosition(item.position)]"
                 :key="item.id">
              板卡{{ item.id }}
            </div>
          </div>
        </div>
        <DisorderThree></DisorderThree>
      </el-main>
      <el-aside width="500px">
        <!-- 编辑区域 -->
        <div class="edit">
          <el-form ref="form" :model="form" label-width="120px" @submit.native.prevent>
            <el-form-item label="机框尺寸(宽高深)">
              <el-input type="text" v-model="form.size" @blur="addElement" aria-placeholder="填写数字中间以逗号隔开"></el-input>
            </el-form-item>
            <template v-for="item in form.card">
              <el-form-item label="板卡尺寸(宽高深)">
                <el-input type="text" v-model="item.size" @blur="addElement" aria-placeholder="填写数字中间以逗号隔开"></el-input>
              </el-form-item>
              <el-form-item label="板卡数量">
                <el-input type="text" v-model="item.num" @blur="addElement" aria-placeholder="填写数字"></el-input>
              </el-form-item>
            </template>
            <el-button type="primary" @click="addCard">增加板卡类型</el-button>
            <el-button type="primary" native-type="submit" @click="addElement">创建</el-button>
            <el-button type="primary" @click="sceneLoad">立即渲染</el-button>
            <el-button type="primary" @click="exportClick">导出</el-button>
          </el-form>
        </div>
      </el-aside>
    </el-container>
  </div>
</template>

<script>
import DisorderThree from "@/components/three/disorder-three";
import utils from "@/utils/utils";
import bus from "@/utils/bus";

export default {
  name: "DragView",
  components: {
    DisorderThree
  },
  data() {
    return {
      // 选中需要单独做移动的多条数据
      choiceList: [],
      // 创建出来的
      elementList: [
        {
          "id": "0-0",
          "position": "0,0",
          "size": "40,600,20"
        },
        {
          "id": "0-1",
          "position": "0,50",
          "size": "40,600,20"
        },
        {
          "id": "0-2",
          "position": "0,103",
          "size": "40,600,20"
        },
        {
          "id": "0-3",
          "position": "0,250",
          "size": "40,600,20"
        },
        {
          "id": "0-4",
          "position": "0,300",
          "size": "40,600,20"
        },
        {
          "id": "0-5",
          "position": "0,351",
          "size": "40,600,20"
        },
        {
          "id": "0-6",
          "position": "0,400",
          "size": "40,600,20"
        },
        {
          "id": "0-7",
          "position": "818,0",
          "size": "40,600,20"
        },
        {
          "id": "0-8",
          "position": "818,56",
          "size": "40,600,20"
        },
        {
          "id": "0-9",
          "position": "818,104",
          "size": "40,600,20"
        },
        {
          "id": "0-10",
          "position": "818,155",
          "size": "40,600,20"
        },
        {
          "id": "0-11",
          "position": "818,205",
          "size": "40,600,20"
        },
        {
          "id": "0-12",
          "position": "818,253",
          "size": "40,600,20"
        },
        {
          "id": "0-13",
          "position": "818,302",
          "size": "40,600,20"
        },
        {
          "id": "0-14",
          "position": "818,351",
          "size": "40,600,20"
        },
        {
          "id": "0-15",
          "position": "818,400",
          "size": "40,600,20"
        },
        {
          "id": "0-16",
          "position": "0,150",
          "size": "40,600,20"
        },
        {
          "id": "0-17",
          "position": "0,198",
          "size": "40,600,20"
        },
        {
          "id": "1-0",
          "position": "765,0",
          "size": "420,48,20"
        },
        {
          "id": "1-1",
          "position": "712,0",
          "size": "420,48,20"
        },
        {
          "id": "1-2",
          "position": "660,0",
          "size": "420,48,20"
        },
        {
          "id": "1-3",
          "position": "606,0",
          "size": "420,48,20"
        }
      ],
      form: {
        size: '442,1420,650',
        type: utils.setName(2, 6),
        card: [
          {
            type: utils.setName(2, 6),
            size: '36,580,20',
            num: 18
          },
          {
            type: utils.setName(2, 6),
            size: '420,48,20',
            num: 4
          },
        ]
      }
    }
  },
  // watch: {
  //   form: {
  //     handler() {
  //       setTimeout(()=>{
  //         this.addElement();
  //       },1000)
  //     },
  //     deep: true
  //   }
  // },
  computed: {
    setContainerSize() {
      return (size) => {
        return {
          width: size.split(',')[0] + 'px',
          height: size.split(',')[1] + 'px',
        }
      }
    },
    setContainerPosition() {
      return (position) => {
        return {
          top: (position.split(',')[0] || 0) + 'px',
          left: (position.split(',')[1] || 0) + 'px',
        }
      }
    }
  },
  mounted() {
    // document.onkeydown = (e) => {
    //   switch (e.code) {
    //       // 点击向上移动
    //     case 'ArrowUp':
    //       break;
    //       // 点击向下移动
    //     case 'ArrowDown':
    //       break;
    //       // 点击向左移动
    //     case 'ArrowLeft':
    //       break;
    //       // 点击向右移动
    //     case 'ArrowRight':
    //       break;
    //   }
    //   console.log(e);
    // }
    this.addElement();
  },
  methods: {
    choiceCLick(item) {
      console.log(item);
    },
    // 鼠标拖拽
    draggableFun(item, event) {
      let div = event.target;
      // 触发事件之后修改鼠标为移动状态
      div.style.cursor = 'move';
      // 获取父级元素的宽高
      let docWidth = div.parentNode.clientWidth;
      let docHeight = div.parentNode.clientHeight;
      // 通过鼠标当前在页面的位置和当前元素距离父级的距离计算差值
      let disX = event.pageX - div.offsetLeft;
      let disY = event.pageY - div.offsetTop;
      let left = '';
      let top = '';
      // 鼠标按下改为true开始监听鼠标移动
      let isDrag = true;

      // 根据鼠标位置，当前元素，父级元素，计算当前div应该在什么位置
      let calculationPosition = (e) => {
        left = e.clientX - disX;
        // top的值如果大于父级的高-当前div的高那么就取最小值
        top = Math.min(e.clientY - disY, docHeight - div.offsetHeight);
        // top和0之间取最大值
        top = Math.max(top, 0);
        // left的值如果大于父级的宽-当前div的宽那么就取最小值
        left = Math.min(e.clientX - disX, docWidth - div.offsetWidth);
        // left和0之间取最大值
        left = Math.max(left, 0);
        // 通过对象的存储机制直接修改事件传递进来的对象就会修改data里面的数据
        // 计算属性检测到position的属性发生改变就会动态改变当前盒子的坐标值
        item.position = `${top},${left}`
      }

      div.onmousemove = (e) => {
        if (isDrag) {
          calculationPosition(e);
        }
      };
      // 鼠标抬起事件
      div.onmouseup = (e) => {
        div.style.cursor = 'default';
        isDrag = false;
      };
      //demo自定义右键窗口
      div.oncontextmenu = (e) => {
        e.preventDefault()//阻止默认行为
        // console.log('右键了');
      }
      //当前窗口失去焦点。
      window.onblur = function () {
        isDrag = false
      }
      //鼠标移动事件
      window.onmousemove = (e) => {
        e.preventDefault(); //阻止默认行为
        if (isDrag) {
          calculationPosition(e);
        }
      }
      // 鼠标抬起事件
      window.onmouseup = (e) => {
        div.style.cursor = 'default';
        isDrag = false;
      };
    },
    addCard() {
      this.form.card.push({
        size: '0,0,0',
        position: '0,0',
        type: utils.setName(2, 6),
        num: 0
      })
    },
    addElement() {
      let arr = [];
      this.form.card.forEach((item, index) => {
        for (let i = 0; i < item.num; i++) {
          arr.push({
            id: `${index}-${i}`,
            type: item.type,
            position: '',
            size: item.size,
          })
        }
      })
      arr.forEach(item => {
        let findIndex = this.elementList.findIndex(findItem => findItem.id === item.id);
        if (findIndex !== -1) {
          item.position = this.elementList[findIndex].position;
        }
      })
      this.elementList = arr;
    },
    sceneLoad() {
      let obj = {
        size: this.form.size,
        type: this.form.type,
        arr: this.elementList
      }
      bus.$emit('setSlotList', obj);
    },
    exportClick() {
      bus.$emit('operationExportGlb');
    }
  },
  beforeDestroy() {

  }
}
</script>

<style lang="scss" scoped>
.drag-view {
  width: 100%;
  height: 100%;

  .el-container {
    height: 100%;

    .edit {
      padding: 60px 20px 20px 20px;
    }

    .drag-main {
      height: 50%;
      overflow: auto;

      .container {
        //box-sizing: border-box;
        height: 50%;
        border: 1px solid red;
        position: relative;
        overflow: auto;

        > div {
          cursor: default;
          //box-sizing: border-box;
          position: absolute;
          border: 1px solid green;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: bold;
        }
      }
    }

    .disorder-three {
      height: 50%;
    }
  }
}
</style>