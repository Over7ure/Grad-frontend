<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <!-- 示例内容 -->
    <p>
      Vue项目示例组件，用于展示基本功能和文档链接
    </p>
    <!-- 主要链接 -->
    <h3>Vue生态系统</h3>
    <ul>
      <li><a href="https://router.vuejs.org" rel="noopener" target="_blank">vue-router</a></li>
      <li><a href="https://vuex.vuejs.org" rel="noopener" target="_blank">vuex</a></li>
      <li><a href="https://github.com/vuejs/vue-devtools#vue-devtools" rel="noopener" target="_blank">vue-devtools</a>
      </li>
      <li><a href="https://vue-loader.vuejs.org" rel="noopener" target="_blank">vue-loader</a></li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  // 接收父组件传入的消息
  props: {
    msg: String,
  },
};
</script>

<style scoped>
div {
  margin: 60px;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

h3 {
  margin: 40px 0 0;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
