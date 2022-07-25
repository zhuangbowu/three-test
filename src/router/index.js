import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'home',
        component: () => import(/* webpackChunkName: "home" */ '../views/HomeView.vue'),
        meta: {
            title: '导入模型修改宽高'
        }
    },
    {
        path: '/about',
        name: 'about',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue'),
        meta: {
            title: '简单的three创建和移动'
        }
    },
    {
        path: '/edit',
        name: 'edit',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ '../views/EditView.vue'),
        meta: {
            title: '渲染多个盒子以及缩放互不干扰的实现'
        }
    },
    {
        path: '/combination',
        name: 'combination',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ '../views/CombinationThree.vue'),
        meta: {
            title: '基于已有数据渲染出来机箱组件'
        }
    },
    {
        path: '/drag',
        name: 'drag',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ '../views/DragView.vue'),
        meta: {
            title: '拖拽实现'
        }
    },


]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
})
router.beforeEach((to, from, next) => {
    if (to?.meta?.title) {
        //判断是否有标题
        document.title = to.meta.title
    } else {
        document.title = '默认title'
    }
    next();
})

export default router
