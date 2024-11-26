<template>
  <div class="count-box">
    <button :disabled="this.value <= 1" @click="handleSub" class="minus">-</button>
    <input @change="handleChange" :value="value" class="inp" type="text">
    <button @click="handleAdd" class="add">+</button>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Number,
      default: 1
    }
  },
  methods: {
    handleSub () {
      this.$emit('input', this.value - 1)
    },
    handleAdd () {
      this.$emit('input', this.value + 1)
    },
    handleChange (e) {
      const num = +e.target.value
      if (isNaN(num) || num < 1 || num > 999) {
        e.target.value = this.value
      }
      this.$emit('input', num)
    }
  }

}
</script>

<style lang="less" scoped>
.count-box{
  width: 110px;
  .inp{
    width: 40px;
    height: 30px;
    border: none;
    outline: none;
    margin: 0 5px;
    background-color: #efefef;
    text-align: center;
    border-radius: 5px;
    font-size: 14px;

  }
 .add,.minus{
    height: 30px;
    width:30px;
    border: none;
    outline: none;
    background-color: #efefef;
    text-align: center;
    border-radius: 5px;
    font-size: 16px;
  }

}

</style>
