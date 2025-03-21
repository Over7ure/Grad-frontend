<template>
  <body class="background">
  <el-form :model="registerForm" class="login-container" label-position="left" label-width="0"
           @submit.prevent="handleRegister">
    <h3 class="login-title">Register</h3>
    <el-form-item>
      <el-input v-model="registerForm.email" placeholder="Email"></el-input>
    </el-form-item>
    <el-form-item>
      <el-input v-model="registerForm.username" placeholder="Username"></el-input>
    </el-form-item>
    <el-form-item>
      <el-input v-model="registerForm.password" placeholder="Password" type="password"></el-input>
    </el-form-item>
    <el-form-item>
      <el-input v-model="registerForm.confirmPassword" placeholder="Confirm Password" type="password"></el-input>
    </el-form-item>
    <el-form-item style="width: 100%">
      <el-button style="width: 100%" type="primary" @click="handleRegister">Register</el-button>
    </el-form-item>
  </el-form>
  </body>
</template>

<script>
import axios from 'axios';
import {ElMessage} from 'element-plus';

export default {
  name: 'UserRegister',
  data() {
    return {
      registerForm: {
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
      }
    };
  },
  methods: {
    async handleRegister() {
      if (this.registerForm.password !== this.registerForm.confirmPassword) {
        ElMessage.error('Passwords do not match');
        return;
      }
      try {
        const response = await axios.post('http://localhost:9090/api/register', null, {
          params: {
            email: this.registerForm.email,
            username: this.registerForm.username,
            password: this.registerForm.password
          }
        });
        if (response.data.code === 200) {
          ElMessage.success(response.data.message);
          this.$router.push('/login');
        } else {
          ElMessage.error(response.data.code + ": " + response.data.message);
          this.clearForm();
        }
      } catch (error) {
        ElMessage.error('Error during registration:' + error);
        this.clearForm();
      }
    },
    clearForm() {
      this.registerForm.email = '';
      this.registerForm.username = '';
      this.registerForm.password = '';
      this.registerForm.confirmPassword = '';
    },
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
  background-color: #f0f0f0; /* Fallback background color */
  background-image: url('@/assets/background.png');
}

.login-container {
  border-radius: 15px;
  margin: 100px auto;
  width: 350px;
  padding: 35px 35px 15px 35px;
  background: rgba(255, 255, 255, 0.9); /* Make background slightly transparent */
  border: 1px solid #eaeaea;
  box-shadow: 0 0 25px #cac6c6;
}

.login-title {
  margin: 0 auto 40px auto;
  text-align: center;
  color: #505458;
}

</style>
