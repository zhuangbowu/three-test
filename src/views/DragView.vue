<template>
  <div class="drag-view" @click="resetBoxForm">
    <el-container>
      <el-main>
        <!-- 3D拖拽容器 -->
        <div class="drag-main">
          <div class="container" :class="{'is-active':form.index===boxForm.index}"
               @click.stop="choiceCLick(form)" :style="setContainerSize(form.width,form.height)">
            <div class="item"
                 :class="{'is-active':item.index===boxForm.index}"
                 @click.stop="choiceCLick(item)"
                 @mousedown.stop="draggableFun(item,$event)"
                 v-for="(item,index) in elementList"
                 :style="[setContainerSize(item.width,item.height),setContainerPosition(item.x,item.y)]"
                 :key="item.id">
              板卡{{ item.index }}
            </div>
          </div>
        </div>
        <DisorderThree></DisorderThree>
      </el-main>
      <el-aside width="500px">
        <!-- 编辑区域 -->
        <div class="edit" @click.stop="">
          <el-form ref="form" :model="form" label-width="120px" @submit.native.prevent v-if="elementList.length===0">
            <el-form-item label="机框宽度">
              <el-input type="number" min="1" v-model="form.width" @blur="addElement"
                        aria-placeholder="填写数字中间以逗号隔开"></el-input>
            </el-form-item>
            <el-form-item label="机框高度">
              <el-input type="number" min="1" v-model="form.height" @blur="addElement"
                        aria-placeholder="填写数字中间以逗号隔开"></el-input>
            </el-form-item>
            <el-form-item label="机框深度">
              <el-input type="number" min="1" v-model="form.depth" @blur="addElement"
                        aria-placeholder="填写数字中间以逗号隔开"></el-input>
            </el-form-item>
            <div class="two" v-for="(item,index) in form.card" :key="index">
              <hr>
              <el-form-item label="板卡宽度">
                <el-input type="number" min="1" v-model="item.width" @blur="addElement"
                          aria-placeholder="填写数字中间以逗号隔开"></el-input>
              </el-form-item>
              <el-form-item label="板卡高度">
                <el-input type="number" min="1" v-model="item.height" @blur="addElement"
                          aria-placeholder="填写数字中间以逗号隔开"></el-input>
              </el-form-item>
              <el-form-item label="板卡深度">
                <el-input type="number" min="1" v-model="item.depth" @blur="addElement"
                          aria-placeholder="填写数字中间以逗号隔开"></el-input>
              </el-form-item>
              <el-form-item label="板卡x轴">
                <el-input type="number" min="0" v-model="item.x" @blur="addElement"
                          aria-placeholder="填写数字中间以逗号隔开"></el-input>
              </el-form-item>
              <el-form-item label="板卡y轴">
                <el-input type="number" min="0" v-model="item.y" @blur="addElement"
                          aria-placeholder="填写数字中间以逗号隔开"></el-input>
              </el-form-item>
              <el-form-item label="板卡类型">
                <el-input type="text" v-model="item.type" @blur="addElement" aria-placeholder="填写数字"></el-input>
              </el-form-item>
              <el-form-item label="板卡数量">
                <el-input type="text" v-model="item.num" @blur="addElement" aria-placeholder="填写数字"></el-input>
              </el-form-item>
            </div>
            <el-button type="primary" @click.stop="addCard">增加板卡类型</el-button>
            <el-button type="primary" native-type="submit" @click.stop="addElement">创建</el-button>
          </el-form>


          <el-form ref="form" :model="boxForm" label-width="120px" @submit.native.prevent v-else>
            <el-form-item label="宽度">
              <el-input type="number" min="1" v-model="boxForm.width"
                        aria-placeholder="填写数字中间以逗号隔开"></el-input>
            </el-form-item>
            <el-form-item label="高度">
              <el-input type="number" min="1" v-model="boxForm.height"
                        aria-placeholder="填写数字中间以逗号隔开"></el-input>
            </el-form-item>
            <el-form-item label="深度">
              <el-input type="number" min="1" v-model="boxForm.depth"
                        aria-placeholder="填写数字中间以逗号隔开"></el-input>
            </el-form-item>
            <template v-if="boxForm.index!==-1">
              <el-form-item label="x轴">
                <el-input type="number" min="0" v-model="boxForm.x"
                          aria-placeholder="填写数字中间以逗号隔开"></el-input>
              </el-form-item>
              <el-form-item label="y轴">
                <el-input type="number" min="0" v-model="boxForm.y"
                          aria-placeholder="填写数字中间以逗号隔开"></el-input>
              </el-form-item>
              <el-form-item label="序列">
                <el-input type="text" v-model="boxForm.index"
                          aria-placeholder="填写数字中间以逗号隔开"></el-input>
              </el-form-item>
            </template>

            <el-form-item label="类型">
              <el-input type="text" v-model="boxForm.type"
                        aria-placeholder="填写数字中间以逗号隔开"></el-input>
            </el-form-item>
            <el-button type="primary" @click.stop="addCardOne">新增板卡</el-button>
            <el-button type="primary" @click.stop="deleteCardOne">删除板卡</el-button>
          </el-form>
          <hr>
          <el-button type="primary" @click.stop="sceneLoad">立即渲染</el-button>
          <el-button type="primary" @click.stop="exportClick">导出</el-button>
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
      elementList: [],
      form: {
        width: 442,
        height: 1420,
        depth: 650,
        type: utils.setName(2, 6),
        index: -1,
        card: [
          {
            type: utils.setName(2, 6),
            width: 36,
            height: 580,
            depth: 20,
            x: 0,
            y: 0,
            num: 18,
          },
          {
            type: utils.setName(2, 6),
            width: 420,
            height: 48,
            depth: 20,
            x: 0,
            y: 0,
            num: 4
          },
        ]
      },
      boxForm: {}
    }
  },
  watch: {
    // form: {
    //   handler() {
    //     setTimeout(() => {
    //       this.addElement();
    //     }, 1000)
    //   },
    //   deep: true
    // }
  },
  computed: {
    setContainerSize() {
      return (width, height) => {
        return {
          width: width + 'px',
          height: height + 'px',
        }
      }
    },
    setContainerPosition() {
      return (x, y) => {
        return {
          top: y + 'px',
          left: x + 'px',
        }
      }
    }
  },
  mounted() {
    // document.onkeydown = (event) => {
    //   if (this.boxForm.id !== '') {
    //     let limit = new utils.setBoxFormLimit(this.form, this.boxForm);
    //     switch (event.code) {
    //         // 点击向上移动
    //       case 'ArrowUp':
    //         event.preventDefault();
    //         this.boxForm.x = limit.setPositionXLimit(--this.boxForm.x);
    //         break;
    //         // 点击向下移动
    //       case 'ArrowDown':
    //         event.preventDefault();
    //         this.boxForm.x = limit.setPositionXLimit(++this.boxForm.x);
    //         break;
    //         // 点击向左移动
    //       case 'ArrowLeft':
    //         event.preventDefault();
    //         this.boxForm.y = limit.setPositionYLimit(--this.boxForm.y);
    //         break;
    //         // 点击向右移动
    //       case 'ArrowRight':
    //         event.preventDefault();
    //         this.boxForm.y = limit.setPositionYLimit(++this.boxForm.y);
    //         break;
    //     }
    //   }
    // }
  },
  methods: {
    addCardOne() {
      let index = this.elementList.reduce((a, b) => {
        return Math.max(a, b.index);
      }, 0) + 1;
      this.elementList.push({
        width: 50,
        height: 50,
        depth: 50,
        x: 0,
        y: 0,
        type: utils.setName(2, 6),
        id: `index-${index}`,
        index: index
      })
      this.boxForm = this.elementList[this.elementList.length - 1];
    },
    deleteCardOne() {
      let findIndex = this.elementList.findIndex(item => item.index === this.boxForm.index);
      this.elementList.splice(findIndex, 1);
    },
    resetBoxForm() {
      let index = this.elementList.reduce((a, b) => {
        return Math.max(a, b.index);
      }, 0) + 1;
      this.boxForm = {
        width: 0,
        height: 0,
        depth: 0,
        x: 0,
        y: 0,
        id: '',
        index: index
      }
    },
    choiceCLick(item) {
      this.boxForm = item;
    },
    addCard() {
      this.form.card.push({
        type: utils.setName(2, 6),
        width: 420,
        height: 48,
        depth: 20,
        x: 0,
        y: 0,
        num: 4
      })
    },
    addElement() {
      let arr = [];
      this.form.card.forEach((item, index) => {
        for (let i = 0; i < item.num; i++) {
          arr.push({
            id: `index-${arr.length + 1}`,
            type: item.type,
            x: item.x,
            y: item.y,
            width: item.width,
            height: item.height,
            depth: item.depth,
            index: arr.length + 1
          })
        }
      })
      arr.forEach(item => {
        let findIndex = this.elementList.findIndex(findItem => findItem.id === item.id);
        if (findIndex !== -1) {
          item.x = this.elementList[findIndex].x;
          item.y = this.elementList[findIndex].y;
        }
      })
      this.elementList = arr;
      this.resetBoxForm();
    },
    // 渲染三维视图
    sceneLoad() {
      let boxObj = {};
      for (const objKey in this.form) {
        if (typeof this.form[objKey] !== 'object') {
          boxObj[objKey] = this.form[objKey]
        }
      }
      boxObj.arr = JSON.parse(JSON.stringify(this.elementList));
      console.log(boxObj)
      // 防止浅拷贝出现的内容同步修改问题
      bus.$emit('setSlotList', JSON.parse(JSON.stringify(boxObj)));
    },
    // 导出模型
    exportClick() {
      bus.$emit('operationExportGlb');
    },
    // 鼠标拖拽
    draggableFun(item, event) {
      let div = event.target;
      // 触发事件之后修改鼠标为移动状态
      div.style.cursor = 'move';
      // 通过鼠标当前在页面的位置和当前元素距离父级的距离计算差值
      let disX = event.pageX - div.offsetLeft;
      let disY = event.pageY - div.offsetTop;
      // 鼠标按下改为true开始监听鼠标移动
      let isDrag = true;

      let limit = new utils.setBoxFormLimit(this.form, {
        width: div.offsetWidth,
        height: div.offsetHeight,
      });

      // 根据鼠标位置，当前元素，父级元素，计算当前div应该在什么位置
      let calculationPosition = (e) => {
        // 通过对象的存储机制直接修改事件传递进来的对象就会修改data里面的数据
        // 计算属性检测到position的属性发生改变就会动态改变当前盒子的坐标值
        item.x = limit.setPositionXLimit(e.clientX - disX);
        item.y = limit.setPositionYLimit(e.clientY - disY);
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
      padding: 20px;

      .two {
        padding: 20px;
      }
    }

    .el-main {
      display: flex;
    }

    .drag-main {
      height: 100%;
      width: 50%;
      overflow: auto;

      .container {
        //box-sizing: border-box;
        height: 100%;
        border: 1px solid #409EFF;
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
        .is-active {
          border-color: #ff0000;
        }
      }

      .is-active {
        border-color: #ff0000;
      }
    }


    .disorder-three {
      width: 50%;
      height: 100%;
    }
  }
}
</style>