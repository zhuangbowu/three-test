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
            size.width = (data.width - data.padding.left - data.padding.right) / data.maxNum - data.spacing;
            size.height = data.height - data.padding.top - data.padding.bottom;
            break;
        case 2:
        case '2':
            size.width = data.width - data.padding.left - data.padding.right;
            size.height = (data.height - data.padding.top - data.padding.bottom) / data.maxNum - data.spacing;
            break;
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
    itemElement.style.border = '1px solid green';
    return itemElement;
}

// export default {
//     calculationPosition
// }