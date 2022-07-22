/**
 * 计算xy位置的
 * size 父级的宽高
 * sonSize 当前元素的宽高
 * index 当前元素的位置
 * spacing 两个元素之间的距离（默认6）
 * padding 父元素与子元素的之间的内间距（默认1）
 * type 1是横向 2是竖向 默认等于1
 * change 超出是否换行（默认不换行）
 * */
let calculationPosition = (data = {}) => {
    data = {
        size: data.size || {},
        sonSize: data.sonSize || {},
        index: data.index || 0,
        spacing: data.spacing || 6,
        padding: data.padding || {
            top: 6,
            right: 6,
            bottom: 6,
            left: 6,
        },
        type: data.type || 1,
        change: data.change || false
    };
    let changeNum, leftIndex, topIndex;
    switch (data.type) {
        case 1:
        case '1':
            changeNum = Math.floor((data.size.width - (data.padding.left + data.padding.right)) / (data.sonSize.width + data.spacing));
            leftIndex = data.index % changeNum;
            topIndex = Math.floor(data.index / changeNum);
            break;
        case 2:
        case '2':
            changeNum = Math.floor((data.size.height - (data.padding.top + data.padding.bottom)) / (data.sonSize.height + data.spacing));
            leftIndex = Math.floor(data.index / changeNum);
            topIndex = data.index % changeNum;
            break;
    }
    let size = {};
    switch (data.type) {
        case 1:
        case '1':
            if (data.change) {
                if (leftIndex === 0) {
                    size.x = data.padding.left;
                } else {
                    size.x = calculation(leftIndex, data.sonSize.width, data.spacing, data.padding.left);
                }
                if (topIndex === 0) {
                    size.y = data.padding.top;
                } else {
                    size.y = calculation(topIndex, data.sonSize.height, data.spacing, data.padding.top);
                }
            } else {
                size.y = data.padding.top;
                if (data.index === 0) {
                    size.x = data.padding.left;
                } else {
                    size.x = calculation(data.index, data.sonSize.width, data.spacing, data.padding.left);
                }
            }
            break
        case 2:
        case '2':
            if (data.change) {
                if (leftIndex === 0) {
                    size.x = data.padding.left;
                } else {
                    size.x = calculation(leftIndex, data.sonSize.width, data.spacing, data.padding.left);
                }
                if (topIndex === 0) {
                    size.y = data.padding.top;
                } else {
                    size.y = calculation(topIndex, data.sonSize.height, data.spacing, data.padding.top);
                }
            } else {
                size.x = data.padding.left;
                if (data.index === 0) {
                    size.y = data.padding.top;
                } else {
                    size.y = calculation(data.index, data.sonSize.height, data.spacing, data.padding.top);
                }
            }
            break
    }
    return size;
}
let calculation = (index, value, spacing, padding) => {
    return (index * value + index * spacing) + padding;
}
/**
 * 计算子盒子的宽高的
 * width，height 父级盒子的宽高
 * maxNum 同级元素最大数量
 * spacing 每个盒子的间距
 * padding 父元素与子元素的之间的内间距（默认6）
 * type 1是横向 2是竖向 默认等于1
 * */
let calculationSize = (data) => {
    data = {
        width: data.width || 0,
        height: data.height || 0,
        maxNum: data.maxNum || 2,
        spacing: data.spacing || 6,
        padding: data.padding || {
            top: 6,
            right: 6,
            bottom: 6,
            left: 6,
        },
        type: data.type || 1,
    };
    let size = {
        width: 0,
        height: 0,
    }
    switch (data.type) {
        case 1:
        case '1':
            size.width = (data.width - data.padding.left - data.padding.right - ((data.maxNum * data.spacing) - data.spacing)) / data.maxNum;
            size.height = data.height - data.padding.top - data.padding.bottom;
            break;
        case 2:
        case '2':
            size.width = data.width - data.padding.left - data.padding.right;
            size.height = (data.height - data.padding.top - data.padding.bottom - ((data.maxNum * data.spacing) - data.spacing)) / data.maxNum;
            break;
    }
    if (size.width < 1) {
        size.width = 1;
    }
    if (size.height < 1) {
        size.height = 1;
    }
    return size;
}
/**
 * 动态创建盒子
 * */
let addElement = (width, height) => {
    let itemElement = document.createElement('div');
    itemElement.style.position = 'absolute';
    itemElement.style.left = '';
    itemElement.style.width = `${width}px`;
    itemElement.style.height = `${height}px`;
    // itemElement.style.border = '1px solid green';
    itemElement.style.backgroundColor = 'green';
    return itemElement;
}
/**
 * 动态创建盒子
 * */
let addBox = (width, height) => {
    let itemElement = document.createElement('div');
    itemElement.style.position = 'absolute';
    itemElement.style.left = '';
    itemElement.style.width = `${width}px`;
    itemElement.style.height = `${height}px`;
    return itemElement;
}

/**
 * 数据重新处理 处理一行多个板卡的情况
 * */
let setData = (arr) => {
    let list = [];
    for (let i = 0; i < arr.length; i++) {
        let column = arr[i].index.split('-');
        if (column.length === 1) {
            let index = parseInt(column[0]) - 1;
            list[index] = arr[i];
        } else {
            let front = parseInt(column[0]) - 1, after = parseInt(column[1]) - 1;
            if (!list[front]) {
                list.push({});
            }
            if (!list[front].column) {
                list[front].column = [];
            }
            list[front].column[after] = arr[i];
        }
    }
    return list;
}

// export default {
//     calculationPosition
// }

/**
 * 获取其中每个模型的大小和坐标的通用class类
 *
 * */


class calculationPositionSize {
    /*
     * width,height 父级的宽高
     * spacing 两个元素之间的距离（默认6）
     * padding 父元素与子元素的之间的内间距（默认6）
     * type 1是横向 2是竖向 默认等于1
     * change 超出是否换行（默认不换行）
     * */
    constructor(data) {
        data = {
            width: data.width,
            height: data.height,
            padding: data.padding || {
                top: 6,
                bottom: 6,
                left: 6,
                right: 6,
            },
            numMax: data.numMax || 12,
            spacing: data.spacing || 6,
            type: data.type,
            change: data.change
        }
        this.width = data.width;
        this.height = data.height;
        this.padding = data.padding;
        this.numMax = data.numMax;
        this.spacing = data.spacing;
        this.type = data.type;
        this.change = data.change;
        this.currentWidth = undefined;
        this.currentHeight = undefined;
    }

    // 获取位置
    getPosition(index) {
        try {
            let changeNum, leftIndex, topIndex, position = {};
            switch (this.type) {
                case 1:
                case '1':
                    changeNum = Math.floor((this.width - (this.padding.left + this.padding.right) - ((this.numMax * this.spacing) - this.spacing)) / this.currentWidth);
                    leftIndex = index % changeNum;
                    topIndex = Math.floor(index / changeNum);
                    break;
                case 2:
                case '2':
                    changeNum = Math.floor((this.height - (this.padding.top + this.padding.bottom) - ((this.numMax * this.spacing) - this.spacing)) / this.currentHeight);
                    leftIndex = Math.floor(index / changeNum);
                    topIndex = index % changeNum;
                    break;
            }
            switch (this.change) {
                case true:
                    if (leftIndex === 0) {
                        position.x = this.padding.left;
                    } else {
                        position.x = this.#calculation(leftIndex, this.currentWidth, this.spacing, this.padding.left);
                    }
                    if (topIndex === 0) {
                        position.y = this.padding.top;
                    } else {
                        position.y = this.#calculation(topIndex, this.currentHeight, this.spacing, this.padding.top);
                    }
                    break;
                default:
                    switch (this.type) {
                        case 1:
                        case '1':
                            position.y = this.padding.top;
                            if (index === 0) {
                                position.x = this.padding.left;
                            } else {
                                position.x = this.#calculation(index, this.currentWidth, this.spacing, this.padding.left);
                            }
                            break;
                        case 2:
                        case '2':
                            position.x = this.padding.left;
                            if (index === 0) {
                                position.y = this.padding.top;
                            } else {
                                position.y = this.#calculation(index, this.currentHeight, this.spacing, this.padding.top);
                            }
                            break;
                    }
                    break;
            }
            return position;
        } catch (e) {
            throw Error(e);
        }
    }

    // 获取大小
    getSize() {
        try {
            let size = {
                width: 0,
                height: 0,
            }
            switch (this.type) {
                case 1:
                case '1':
                    size.width = (this.width - this.padding.left - this.padding.right - ((this.numMax * this.spacing) - this.spacing)) / this.numMax;
                    size.height = this.height - this.padding.top - this.padding.bottom;
                    break;
                case 2:
                case '2':
                    size.width = this.width - this.padding.left - this.padding.right;
                    size.height = (this.height - this.padding.top - this.padding.bottom - ((this.numMax * this.spacing) - this.spacing)) / this.numMax;
                    break;
            }
            if (size.width < 1) {
                size.width = 1;
            }
            if (size.height < 1) {
                size.height = 1;
            }

            this.currentWidth = size.width;
            this.currentHeight = size.height;
            return size;
        } catch (e) {
            throw Error(e);
        }
    }

    #calculation = (index, size, spacing, padding) => {
        // 当前坐标*宽/高+当前坐标*行间距+内边距=当前x/y轴的数值
        return (index * size + index * spacing) + padding;
    }
}