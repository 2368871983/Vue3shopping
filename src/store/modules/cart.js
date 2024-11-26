import { getCartList, changeCount, delSelect } from '@/api/cart'
import { Toast } from 'vant'

export default {
  namespaced: true,
  state () {
    return {
      cartList: []
    }
  },
  mutations: {
    setCartList (state, newList) {
      state.cartList = newList
    },
    toggleCheck (state, id) {
      const goods = state.cartList.find(item => item.goods_id === id)
      goods.isChecked = !goods.isChecked
    },
    handleAllCheck (state, flag) {
      return state.cartList.forEach(item => { item.isChecked = flag })
    },
    changeCount (state, { goodsId, goodsNum }) {
      const goods = state.cartList.find(item => item.goods_id === goodsId)
      if (isNaN(goodsNum) || goodsNum < 1 || goodsNum > 999) {
        goodsNum = goods.goods_num
      }
      goods.goods_num = goodsNum
    }

  },
  actions: {
    async getCartAction (context) {
      const { data } = await getCartList()
      // console.log(data.list)
      data.list.forEach(item => {
        item.isChecked = true
      })
      context.commit('setCartList', data.list)
    },

    async changeCountAction (context, { goodsId, goodsNum, goodsSkuId }) {
      // console.log(res)
      const goods = context.state.cartList.find(item => item.goods_id === goodsId)
      if (isNaN(goodsNum) || goodsNum < 1 || goodsNum > 999) {
        goodsNum = goods.goods_num
      }
      context.commit('changeCount', { goodsId, goodsNum })
      await changeCount(goodsId, goodsNum, goodsSkuId)
    },
    async delSelect (context) {
      const selCartList = context.getters.selCartList
      const cartIds = selCartList.map(item => item.id)
      // console.log(cartIds)
      await delSelect(cartIds)
      Toast('删除成功！')
      context.dispatch('getCartAction')
    }

  },

  getters: {
    cartTotal (state) {
      return state.cartList.reduce((sum, item) => sum + item.goods_num, 0)
    },
    selCartList (state) {
      return state.cartList.filter(item => item.isChecked)
    },
    selCount (state, getters) {
      return getters.selCartList.reduce((sum, item) => sum + item.goods_num, 0)
    },
    selPrice (state, getters) {
      return getters.selCartList.reduce((sum, item) => sum + item.goods_num * item.goods.goods_price_min, 0)
    },
    isAllCheck (state) {
      return state.cartList.every(item => item.isChecked === true)
    }

  }
}
