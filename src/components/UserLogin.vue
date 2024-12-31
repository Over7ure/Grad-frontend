<template>
  <div class="login-container">
    <el-form :model="loginForm" @submit.prevent="handleLogin">
      <el-form-item>
        <el-input v-model="loginForm.username" placeholder="Username"></el-input>
      </el-form-item>
      <el-form-item>
        <el-input v-model="loginForm.password" placeholder="Password" type="password"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleLogin">Login</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import axios from 'axios';
import {ElMessage} from 'element-plus';

export default {
  name: 'UserLogin',
  data() {
    return {
      loginForm: {
        username: '',
        password: ''
      }
    };
  },
  methods: {
    async handleLogin() {
      try {
        const response = await axios.post('http://localhost:9090/api/login', null, {
          params: {
            username: this.loginForm.username,
            password: this.loginForm.password
          }
        });
        if (response.data) {
          console.log('Login successful');
          localStorage.setItem('loginUser', this.loginForm.username);
          this.$router.push({name: 'UserList'});
        } else {
          ElMessage.error('Invalid username or password');
          this.clearForm();
        }
      } catch (error) {
        ElMessage.error('Error during login:' + error);
        this.clearForm();
      }
    },
    clearForm() {
      this.loginForm.username = '';
      this.loginForm.password = '';
    }
  }
};
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 100px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
</style>