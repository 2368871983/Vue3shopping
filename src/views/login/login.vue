<template>
  <div class="login">
    <van-nav-bar title="会员登录" left-arrow @click-left="$router.go(-1)" />
    <div class="container">
      <div class="title">
        <h3>手机号登录</h3>
        <p>未注册的手机号登录后将自动注册</p>
      </div>

      <div class="form">
        <div class="form-item">
          <input v-model="mobile" class="inp" maxlength="11" placeholder="请输入手机号码" type="text">
        </div>
        <div class="form-item">
          <input v-model="picCode" class="inp" maxlength="5" placeholder="请输入图形验证码" type="text">
          <img @click="getPicCode" v-if="picUrl" :src="picUrl" alt="">
        </div>
        <div class="form-item">
          <input v-model="smsCode" class="inp" placeholder="请输入短信验证码" type="text">
          <button @click="getCode">{{ second === totalSecond? '获取验证码': second +'秒后重新发送'}}</button>
        </div>
      </div>

      <div @click="login" class="login-btn">登录</div>
    </div>
  </div>
</template>

<script>
import { getPicCode, getMsgCode, codeLogin } from '@/api/login'

export default {
  name: 'LoginPage',
  data () {
    return {
      picCode: '',
      picKey: '',
      picUrl: '',
      totalSecond: 5,
      second: 5,
      mobile: '',
      smsCode: '',
      isGetCode: false

    }
  },
  async created () {
    this.getPicCode()
  },
  methods: {
    async getPicCode () {
      const { data: { base64, key } } = await getPicCode()

      this.picUrl = base64
      this.picKey = key
    },
    vaildFn () {
      if (!/^1[3-9]\d{9}$/.test(this.mobile)) {
        this.$toast('请输入正确的手机号！')
        return false
      }
      if (!/^[a-zA-Z0-9]{4}$/.test(this.picCode)) {
        this.$toast('请输入正确的图形验证码！')
        return false
      }
      return true
    },
    async getCode () {
      if (this.vaildFn()) {
        if (!this.timer && this.second === this.totalSecond) {
          const res = await getMsgCode(this.picCode, this.picKey, this.mobile)
          // console.log(res)
          this.$toast(res.message)
          this.smsCode = ''
          this.isGetCode = true
          this.timer = setInterval(() => {
            this.second--
            if (this.second <= 0) {
              clearInterval(this.timer)
              this.second = this.totalSecond
              this.timer = null
            }
          }, 1000)
        }
      }
    },

    async login () {
      if (this.vaildFn()) {
        if (this.isGetCode === true) {
          if (/^1[3-9]\d{9}$/.test(this.mobile)) {
            const res = await codeLogin(this.mobile, this.smsCode)
            // console.log(res)
            this.$store.commit('user/setUserInfo', res.data)
            this.$toast(res.message)

            const url = this.$route.query.backUrl || '/'
            this.$router.replace(url)
          }
        } else this.$toast('请先获取短信验证码！')
      }
    }

  },
  destroyed () {
    clearInterval(this.timer)
  }
}
</script>

<style lang="less" scoped>
.container {
  padding: 49px 29px;

  .title {
    margin-bottom: 20px;

    h3 {
      font-size: 26px;
      font-weight: normal;
    }

    p {
      line-height: 40px;
      font-size: 14px;
      color: #b8b8b8;
    }
  }

  .form-item {
    border-bottom: 1px solid #f3f1f2;
    padding: 8px;
    margin-bottom: 14px;
    display: flex;
    align-items: center;

    .inp {
      display: block;
      border: none;
      outline: none;
      height: 32px;
      font-size: 14px;
      flex: 1;
    }

    img {
      width: 94px;
      height: 31px;
    }

    button {
      height: 31px;
      border: none;
      font-size: 13px;
      color: #cea26a;
      background-color: transparent;
      padding-right: 9px;
    }
  }

  .login-btn {
    width: 100%;
    height: 42px;
    margin-top: 39px;
    background: linear-gradient(90deg, #ecb53c, #ff9211);
    color: #fff;
    border-radius: 39px;
    box-shadow: 0 10px 20px 0 rgba(0, 0, 0, .1);
    letter-spacing: 2px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
