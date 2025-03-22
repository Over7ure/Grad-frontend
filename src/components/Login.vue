<template>
  <body class="background">
  <el-form :model="loginForm" class="login-container" label-position="left" label-width="0"
           @submit.prevent="handleLogin">
    <h3 class="login-title">Login</h3>
    <!-- 用户名输入框 -->
    <el-form-item>
      <el-input v-model="loginForm.username" placeholder="Username"></el-input>
    </el-form-item>
    <!-- 密码输入框 -->
    <el-form-item>
      <el-input v-model="loginForm.password" placeholder="Password" type="password"></el-input>
    </el-form-item>
    <!-- 登录按钮 -->
    <el-form-item style="width: 100%">
      <el-button style="width: 100%" type="primary" @click="handleLogin">Login</el-button>
    </el-form-item>
    <!-- 注册链接 -->
    <el-form-item style="width: 100%; text-align: center;">
      <span class="register-link" @click="navigateToRegister">Don't have an account? <span class="register-text">Register</span></span>
    </el-form-item>
  </el-form>
  </body>
</template>

<script>
import axios from 'axios';
import {ElMessage} from 'element-plus';

export default {
  name: 'UserLogin',
  data() {
    return {
      // 登录表单数据
      loginForm: {
        username: '',
        password: ''
      }
    };
  },
  methods: {
    // 处理登录请求
    async handleLogin() {
      try {
        // 发送登录请求到后端API
        const response = await axios.post('http://localhost:9090/api/login', null, {
          params: {
            username: this.loginForm.username,
            password: this.loginForm.password
          }
        });
        
        if (response.data.code === 200) {
          // 登录成功
          ElMessage.success(response.data.message);
          // 保存用户信息到状态管理器
          this.$store.commit('login', this.loginForm);
          // 获取重定向地址并跳转
          const path = this.$route.query.redirect;
          this.$router.push({path: path === '/' || path === undefined ? '/index' : path});
        } else {
          // 登录失败
          ElMessage.error(response.data.code + ": " + response.data.message);
          this.clearForm();
        }
      } catch (error) {
        // 处理请求异常
        ElMessage.error('Error during login:' + error);
        this.clearForm();
      }
    },
    // 清空登录表单
    clearForm() {
      this.loginForm.username = '';
      this.loginForm.password = '';
    },
    // 导航到注册页面
    navigateToRegister() {
      this.$router.push('/register');
    }
  }
};
</script>

<style scoped>
.background {
  margin: 0;
  height: 100%;
  width: 100%;
  background-size: cover;
  position: fixed;
  background-color: #f0f0f0; /* 回退背景色 */
  background-image: url('@/assets/background.png');
}

.login-container {
  border-radius: 15px;
  margin: 100px auto;
  width: 350px;
  padding: 35px 35px 15px 35px;
  background: rgba(255, 255, 255, 0.9); /* 半透明背景 */
  border: 1px solid #eaeaea;
  box-shadow: 0 0 25px #cac6c6;
}

.login-title {
  margin: 0 auto 40px auto;
  text-align: center;
  color: #505458;
}

.register-link {
  cursor: pointer;
  color: black;
}

.register-text {
  color: black;
}

.register-text:hover {
  color: #409EFF;
}
</style>
