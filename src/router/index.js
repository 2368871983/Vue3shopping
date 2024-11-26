import Vue from 'vue'
import VueRouter from 'vue-router'

import Layout from '@/views/layout/index.vue'
import Cart from '@/views/layout/cart.vue'
import Home from '@/views/layout/home.vue'
import Category from '@/views/layout/category.vue'
import User from '@/views/layout/user.vue'

import store from '@/store'

const Login = () => import('@/views/login/login.vue')
const Search = () => import('@/views/search/search.vue')
const SearchList = () => import('@/views/search/list.vue')
const Pay = () => import('@/views/pay/pay.vue')
const MyOrder = () => import('@/views/myorder/myorder.vue')
const Prodetail = () => import('@/views/prodetail/prodetail.vue')
Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    { path: '/login', component: Login },
    {
      path: '/',
      component: Layout,
      redirect: '/home',
      children: [
        { path: '/home', component: Home },
        { path: '/category', component: Category },
        { path: '/cart', component: Cart },
        { path: '/user', component: User }
      ]
    },
    { path: '/search', component: Search },
    { path: '/searchlist', component: SearchList },
    { path: '/pay', component: Pay },
    { path: '/myorder', component: MyOrder },
    { path: '/prodetail/:id', component: Prodetail }
  ]
})
const authUrls = ['/pay', './myorder']

router.beforeEach((to, from, next) => {
  // console.log(to, from, next)
  if (authUrls.includes(to.path)) {
    const token = store.getters.token
    if (token) {
      next()
    } else {
      next('/login')
    }
  } else { next() }
})
export default router
