<template>
  <body class="background">
  <el-form :model="registerForm" class="login-container" label-position="left" label-width="0"
           @submit.prevent="handleRegister">
    <h3 class="login-title">Register</h3>
    <!-- 邮箱输入框 -->
    <el-form-item>
      <!-- 修改邮箱输入为自动补全 -->
      <el-autocomplete v-model="registerForm.email" placeholder="Email" :fetch-suggestions="querySearch"></el-autocomplete>
    </el-form-item>
    <!-- 用户名输入框 -->
    <el-form-item>
      <el-input v-model="registerForm.username" placeholder="Username"></el-input>
    </el-form-item>
    <!-- 密码输入框 -->
    <el-form-item>
      <el-input v-model="registerForm.password" placeholder="Password" type="password"></el-input>
    </el-form-item>
    <!-- 确认密码输入框 -->
    <el-form-item>
      <el-input v-model="registerForm.confirmPassword" placeholder="Confirm Password" type="password"></el-input>
    </el-form-item>
    <!-- 注册按钮 -->
    <el-form-item style="width: 100%">
      <el-button style="width: 100%" type="primary" @click="handleRegister">Register</el-button>
    </el-form-item>
    <!-- 登录链接 -->
    <el-form-item style="width: 100%; text-align: center;">
      <span class="login-text">Already have an account? <span class="login-link" @click="navigateToLogin">Login</span></span>
    </el-form-item>
  </el-form>
  </body>
</template>

<script>
import axios from 'axios';
import {ElMessage} from 'element-plus';

// noinspection GrazieInspection
export default {
  name: 'UserRegister',
  data() {
    return {
      // 注册表单数据
      registerForm: {
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
      },
      // 新增常用邮箱域名列表
      emailDomains: ['gmail.com', 'outlook.com', 'qq.com', '163.com']
    };
  },
  methods: {
    // 处理注册请求
    async handleRegister() {
      // 验证两次输入的密码是否一致
      if (this.registerForm.password !== this.registerForm.confirmPassword) {
        ElMessage.error('Passwords do not match');
        return;
      }
      // 验证邮箱格式
      if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(this.registerForm.email)) {
        ElMessage.error('Invalid email format');
        return;
      }
      // 验证密码长度
      if (this.registerForm.password.length < 6) {
        ElMessage.error('Password must be at least 6 characters long');
        return;
      }
      
      try {
        // 发送注册请求到后端API
        const response = await axios.post('http://localhost:9090/api/register', null, {
          params: {
            email: this.registerForm.email,
            username: this.registerForm.username,
            password: this.registerForm.password
          }
        });
        
        if (response.data.code === 200) {
          // 注册成功
          ElMessage.success(response.data.message);
          // 跳转到登录页面
          this.$router.push('/login');
        } else {
          // 注册失败
          ElMessage.error(response.data.code + ": " + response.data.message);
          this.clearForm();
        }
      } catch (error) {
        // 处理请求异常
        ElMessage.error('Error during registration:' + error);
        this.clearForm();
      }
    },
    // 新增邮箱自动补全方法
    querySearch(queryString, cb) {
      if (!queryString || queryString.indexOf('@') !== -1) {
        cb([]);
      } else {
        const results = this.emailDomains.map(domain => {
          return { value: queryString + '@' + domain }
        });
        cb(results);
      }
    },
    // 清空注册表单
    clearForm() {
      this.registerForm.email = '';
      this.registerForm.username = '';
      this.registerForm.password = '';
      this.registerForm.confirmPassword = '';
    },
    navigateToLogin() {
      this.$router.push('/login');
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

.login-text {
  color: black;
}

.login-link {
  cursor: pointer;
  color: #409EFF;
}

.login-link:hover {
  text-decoration: underline;
}
</style>
