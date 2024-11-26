<template>
  <div class="prodetail">
    <van-cell icon="share-o" title="分享" @click="showShare = true" />
    <van-share-sheet v-model="showShare" title="立即分享给好友" :options="options" />

    <van-nav-bar fixed title="商品详情页" left-arrow @click-left="$router.go(-1)" />

    <van-swipe :autoplay="3000" @change="onChange">
      <van-swipe-item v-for="(image, index) in images" :key="index">
        <img @click="bigImage(index)" :src="image.external_url" />
      </van-swipe-item>

      <template #indicator>
        <div class="custom-indicator">{{ current + 1 }} / {{ images.length }}</div>
      </template>
    </van-swipe>

    <!-- 商品说明 -->
    <div class="info">
      <div class="title">
        <div class="price">
          <span class="now">￥{{ detail.goods_price_min }}</span>
          <span class="oldprice">￥{{ detail.goods_price_max }}</span>
        </div>
        <div class="sellcount">已售{{ detail.goods_sales}}件</div>
      </div>
      <div class="msg text-ellipsis-2">
        {{ detail.goods_name}}
      </div>
      <div>
        <!-- 优惠券单元格 -->
        <van-coupon-cell :coupons="coupons" :chosen-coupon="chosenCoupon" @click="show = true" />

        <van-popup v-model="show" round position="bottom" style="height:90%; padding-top: 4px;">
          <van-coupon-list :show-close-button="true" :disabled-coupons="disabledCoupons" :coupons="coupons"
            :chosen-coupon="chosenCoupon" @change="onChanges" @exchange="onExchange" />
        </van-popup>
      </div>
      <div class="service">
        <div class="left-words">
          <span><van-icon name="passed" />七天无理由退货</span>
          <span><van-icon name="passed" />48小时发货</span>
        </div>
        <div class="right-icon">
          <van-icon name="arrow" />
        </div>
      </div>
    </div>

    <!-- 商品评价 -->
    <div class="comment">
      <div class="comment-title">
        <div class="left">商品评价 ({{total}}条)</div>
        <div class="right">查看更多 <van-icon name="arrow" /> </div>
      </div>
      <div class="comment-list">
        <div class="comment-item" v-for="item in commentList" :key="item.comment_id">
          <div class="top">
            <img :src="item.avatar_url || defaultImg" alt="">
            <div class="name">{{ item.user.nick_name}}</div>
            <van-rate :size="16" :value="item.score/2" color="#ffd21e" void-icon="star" void-color="#eee" />
          </div>
          <div v-if="item.content.length<=16" class="content">
            {{item.content}}
          </div>
          <div class="time">
            {{item.create_time}}
          </div>
        </div>
      </div>
    </div>

    <!-- 商品描述 -->
    <div class="desc" v-html="detail.content">

    </div>

    <!-- 底部 -->
    <div class="footer">
      <div @click="$router.push('/')" class="icon-home">
        <van-icon name="wap-home-o" />
        <span>首页</span>
      </div>
      <div @click="$router.push('/cart')" class=" icon-cart">
        <van-icon name="shopping-cart-o" :badge="this.cartTotal" />
        <span>购物车</span>
      </div>
      <div @click="addFn" class="btn-add">加入购物车</div>
      <div @click="buyFn" class="btn-buy">立刻购买</div>
    </div>

    <van-action-sheet v-model="showPannel" :title="mode === 'cart' ? '加入购物车' : '立刻购买'">

      <div class="product">
        <div class="product-title">
          <div class="left">
            <img :src="detail.goods_image" alt="">
          </div>
          <div class="right">
            <div class="price">
              <span>¥</span>
              <span class="nowprice">{{ detail.goods_price_min}}</span>
            </div>
            <div class="count">
              <span>库存</span>
              <span>{{ detail.stock_total}}</span>
            </div>
          </div>
        </div>
        <div class="num-box">
          <span>数量</span>
          <CountBox v-model="addCount"></CountBox>
        </div>

        <div class="showbtn" v-if="detail.stock_total">
          <div class="btn" @click="addCart" v-if="mode==='cart'">加入购物车</div>
          <div class="btn now" @click="goBuyNow" v-else>立刻购买</div>
        </div>
        <div class="btn-none" v-else>该商品已抢完</div>
      </div>

      <div>

      </div>
    </van-action-sheet>

  </div>
</template>

<script>
import defaultImg from '@/assets/default-avatar.png'
import { getProDetail, getProComments } from '@/api/product'
import { ImagePreview, Toast } from 'vant'
import CountBox from '@/components/CountBox.vue'
import { addCart } from '@/api/cart'

const coupon = {
  available: 1,
  condition: '无使用门槛\n最多优惠12元',
  reason: '',
  value: 150,
  name: '双11优惠券',
  startAt: 2489104000,
  endAt: 2514592000,
  valueDesc: '1.5',
  unitDesc: '元'
}
export default {
  name: 'ProDetail',
  components: {
    CountBox
  },
  data () {
    return {
      images: [],
      current: 0,
      detail: {},
      showShare: false,
      show: false,

      options: [
        { name: '微信', icon: 'wechat' },
        { name: '微博', icon: 'weibo' },
        { name: '复制链接', icon: 'link' },
        { name: '分享海报', icon: 'poster' },
        { name: '二维码', icon: 'qrcode' }
      ],
      total: 0,
      commentList: [],
      defaultImg,
      showPannel: false,
      mode: 'cart',
      chosenCoupon: -1,
      coupons: [coupon],
      disabledCoupons: [coupon],
      showCoupon: false,
      addCount: 1,
      cartTotal: 10

    }
  },
  computed: {
    goodsId () {
      return this.$route.params.id
    }
  },
  created () {
    this.getDetail()
    this.getComments()
  },
  methods: {
    showList () {
      this.show = true
    },
    onChange (index) {
      this.current = index
    },
    onSelect (option) {
      Toast(option.name)
      this.showShare = false
    },
    async getDetail () {
      const { data: { detail } } = await getProDetail(this.goodsId)
      this.detail = detail
      // console.log({ data: { detail } })
      this.images = detail.goods_images
    },
    bigImage (index) {
      const imgUrlArry = this.detail.goods_images
      console.log(imgUrlArry)
      const imgUrl = imgUrlArry.map(item => item.external_url)
      const flag = index
      ImagePreview({
        images: imgUrl,
        startPosition: flag
      })
      index = flag
      // console.log(imgUrl)
    },
    async getComments () {
      const { data: { list, total } } = await getProComments(this.goodsId, 3)
      this.commentList = list
      this.total = total
    },
    addFn () {
      this.mode = 'cart'
      this.showPannel = true
    },
    buyFn () {
      this.mode = 'buy'
      this.showPannel = true
    },
    onChanges (index) {
      this.show = false
      this.chosenCoupon = index
    },
    onExchange (code) {
      this.coupons.push(coupon)
    },
    async addCart () {
      if (!this.$store.getters.token) {
        this.$dialog.confirm({
          title: '温馨提示',
          message: '此时需要先登录才能继续操作哦',
          confirmButtonText: '去登陆',
          cancelButtonText: '再逛逛'
        }).then(() => {
          this.$router.replace({
            path: '/login',
            query: {
              backUrl: this.$route.fullPath
            }
          })
        }).catch(() => {

        })
      }

      const { data: { cartTotal } } = await addCart(this.goodsId, this.addCount, this.detail.skuList[0].goods_sku_id)
      // console.log({ data: { cartTotal } })
      this.cartTotal = cartTotal
      this.$toast('成功加入购物车！')
      this.showPannel = false
    },
    goBuyNow () {
      if (!this.$store.getters.token) {
        this.$dialog.confirm({
          title: '温馨提示',
          message: '此时需要先登录才能继续操作哦',
          confirmButtonText: '去登陆',
          cancelButtonText: '再逛逛'
        }).then(() => {
          this.$router.replace({
            path: '/login',
            query: {
              backUrl: this.$route.fullPath
            }
          })
        }).catch(() => {

        })
      }
      this.$router.push({
        path: '/pay',
        query: {
          mode: 'buyNow',
          goodsId: this.goodsId,
          goodsSkuId: this.detail.skuList[0].goods_sku_id,
          goodsNum: this.addCount
        }
      })
    }

  }
}
</script>

<style lang="less" scoped>
.prodetail {
  padding-top: 46px;

  ::v-deep .van-icon-arrow-left {
    color: #333;
  }

  img {
    display: block;
    width: 100%;
  }

  .custom-indicator {
    position: absolute;
    right: 10px;
    bottom: 10px;
    padding: 5px 10px;
    font-size: 12px;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 15px;
  }

  .desc {
    width: 100%;
    overflow: scroll;

    ::v-deep img {
      display: block;
      width: 100% !important;
    }
  }

  .info {
    padding: 10px;
  }

  .title {
    display: flex;
    justify-content: space-between;

    .now {
      color: #fa2209;
      font-size: 20px;
    }

    .oldprice {
      color: #959595;
      font-size: 16px;
      text-decoration: line-through;
      margin-left: 5px;
    }

    .sellcount {
      color: #959595;
      font-size: 16px;
      position: relative;
      top: 4px;
    }
  }

  .msg {
    font-size: 16px;
    line-height: 24px;
    margin-top: 5px;
  }

  .service {
    display: flex;
    justify-content: space-between;
    line-height: 40px;
    margin-top: 10px;
    font-size: 16px;
    background-color: #fafafa;

    .left-words {
      span {
        margin-right: 10px;
      }

      .van-icon {
        margin-right: 4px;
        color: #fa2209;
      }
    }
  }

  .comment {
    padding: 10px;
  }

  .comment-title {
    display: flex;
    justify-content: space-between;

    .right {
      color: #959595;
    }
  }

  .comment-item {
    font-size: 16px;
    line-height: 30px;

    .top {
      height: 30px;
      display: flex;
      align-items: center;
      margin-top: 20px;

      img {
        width: 20px;
        height: 20px;
      }

      .name {
        margin: 0 10px;
      }
    }

    .time {
      color: #999;
    }
  }

  .footer {
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 55px;
    background-color: #fff;
    border-top: 1px solid #ccc;
    display: flex;
    justify-content: space-evenly;
    align-items: center;

    .icon-home,
    .icon-cart {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 14px;

      .van-icon {
        font-size: 24px;
      }
    }

    .btn-add,
    .btn-buy {
      height: 36px;
      line-height: 36px;
      width: 120px;
      border-radius: 18px;
      background-color: #ffa900;
      text-align: center;
      color: #fff;
      font-size: 14px;
    }

    .btn-buy {
      background-color: #fe5630;
    }
  }
}

.tips {
  padding: 10px;
}
.product {
  .product-title {
    display: flex;

    .left {
      img {
        width: 90px;
        height: 90px;
      }

      margin: 10px;
    }

    .right {
      flex: 1;
      padding: 10px;

      .price {
        font-size: 14px;
        color: #fe560a;

        .nowprice {
          font-size: 24px;
          margin: 0 5px;
        }
      }
    }
  }

  .num-box {
    display: flex;
    justify-content: space-between;
    padding: 10px;
    align-items: center;
  }

  .btn,
  .btn-none {
    height: 40px;
    line-height: 40px;
    margin: 20px;
    border-radius: 20px;
    text-align: center;
    color: rgb(255, 255, 255);
    background-color: rgb(255, 148, 2);
  }

  .btn.now {
    background-color: #fe5630;
  }

  .btn-none {
    background-color: #cccccc;
  }

}
</style>
