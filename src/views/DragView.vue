<template>
  <div class="drag-view">
    <el-container>
      <el-main>
        <!-- 3D模型容器 -->
        <div id="container" :style="setContainerSize">
          <div class="item"
               v-for="(item,index) in elementList"
               :style="{width:item.width+'px',height:item.height+'px'}"
               :key="item.id"></div>
        </div>
      </el-main>
      <el-aside width="500px">
        <!-- 编辑区域 -->
        <div class="edit">
          <el-form ref="form" :model="form" label-width="120px">
            <el-form-item label="机框尺寸(宽高深)">
              <el-input type="text" v-model="form.size" aria-placeholder="填写数字中间以逗号隔开"></el-input>
            </el-form-item>
            <template v-for="item in form.card">
              <el-form-item label="板卡尺寸(宽高深)">
                <el-input type="text" v-model="item.size" aria-placeholder="填写数字中间以逗号隔开"></el-input>
              </el-form-item>
              <el-form-item label="板卡数量">
                <el-input type="text" v-model="item.num" aria-placeholder="填写数字"></el-input>
              </el-form-item>
            </template>
            <el-form-item>
              <el-button type="primary" @click="addCard">增加板卡类型</el-button>
              <el-button type="primary" @click="addElement">创建</el-button>
              <el-button type="primary" @click="sceneLoad">立即渲染</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-aside>
    </el-container>
  </div>
</template>

<script>
export default {
  name: "DragView",
  data() {
    return {
      elementList: [],
      form: {
        size: '20,20,20',
        card: [
          {
            size: '20,20,20',
            num: 0
          }
        ]
      }
    }
  },
  computed:{
    setContainerSize(){
      let size = {
        width: this.form.size.split(',')[0]+'px',
        height: this.form.size.split(',')[1]+'px',
      }
      return size;
    }
  },
  mounted() {
  },
  methods: {
    addCard() {
      this.form.card.push({
        size: '20,20,20',
        num: 0
      })
    },
    addElement() {
      // let container = document.querySelector('#container');
      // elementList
      let arr = [];
      this.form.card.forEach((item, index) => {
        for (let i = 0; i < item.num; i++) {
          arr.push({
            id: `${index}-${i}`,
            width: item.size.split(',')[0],
            height: item.size.split(',')[1],
          })
        }
      })
      this.elementList = arr;
      console.log(arr)
    },
    sceneLoad() {

    }
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

    #container {
      box-sizing: border-box;
      height: 100%;
      border: 1px solid red;

      > div {
        border: 1px solid green;
      }
    }
  }
}
</style>