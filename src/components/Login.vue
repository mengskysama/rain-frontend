<template>
  <div>
    <div class="nav">
      <el-menu class="navbar" theme="dark" mode="horizontal">
        <el-menu-item index="/">
          Rain - A BitTorrent cloud solution
        </el-menu-item>
      </el-menu>
    </div>
    <el-card label-position="left" class="box-card" style="width:400px;margin: 100px auto;padding:10px 10px;">
      <el-tabs v-model="activeName" @tab-click="">
        <el-tab-pane label="Login" name="first">
          <el-form :model="loginForm" label-position="right" label-width="80px">
            <el-form-item label="Email">
              <el-input v-model="loginForm.email"></el-input>
            </el-form-item>
            <el-form-item label="Password">
              <el-input type="password" @keyup.enter.native="login" v-model="loginForm.password"></el-input>
            </el-form-item>
            <el-form-item style="text-align:left">
              <el-button type="primary" @click="login">Login</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="Register" name="second">
          <el-form :model="registerForm" label-position="right" label-width="80px">
            <el-form-item label="Email">
              <el-input v-model="registerForm.email" placeholder="@gmail @qq @hotmail"></el-input>
            </el-form-item>
            <el-form-item label="Password">
              <el-input type="password" @keyup.enter.native="register" v-model="registerForm.password"></el-input>
            </el-form-item>
            <el-form-item label="captcha">
            <img :src="captchaUrl" style="width: 120px; height: 40px;"></img>
              <el-input type="text" v-model="registerForm.answered"></el-input>
            </el-form-item>
            <el-form-item style="text-align:left">
              <el-button type="primary" @click="register">Register</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-row :gutter="20" style="margin: 50px" v-show="displayInfo">
      <el-col :span="6"><div class="tips">Current<front style="font-size: 50px;"> {{info.current}}</front></div></el-col>
      <el-col :span="6"><div class="tips">Cached<front style="font-size: 50px;"> {{info.cached}}</front></div></el-col>
      <el-col :span="6"><div class="tips">Nodes<front style="font-size: 50px;"> {{info.nodes}}</front></div></el-col>
      <el-col :span="6"><div class="tips">UpTime<front style="font-size: 50px;"> {{info.upTime}}</front></div></el-col>
    </el-row>

  </div>
</template>
<script>
import api from 'src/service/api'

export default {
  components: {
  },
  data () {
    return {
      displayInfo: true,
      activeName: 'first',
      errMsg: '',
      loginForm: {
        email: '',
        password: ''
      },
      registerForm: {
        email: '',
        password: '',
        answered: ''
      },
      info: {
        current: 0,
        nodes: 0,
        cached: 0,
        upTime: 0
      },
      captchaUrl: `/capi/captcha?r=${new Date().getTime()}`
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.fetchSystemInfo()
    })
  },
  methods: {
    fetchSystemInfo () {
      api.fetchSystemInfo().then(response => {
        if (response.errCode === 0) {
          this.displayInfo = true
          this.info = response.data
        }
      })
    },
    login () {
      api.login(this.loginForm.email, this.loginForm.password).then(response => {
        if (response.errCode !== 0) {
          this.$message.warning(response.errMsg)
        } else {
          this.$message.success(response.errMsg)
          this.$router.push({name: 'dashboard'})
        }
      })
    },
    register () {
      api.register(this.registerForm.email, this.registerForm.password, this.registerForm.answered).then(response => {
        if (response.errCode !== 0) {
          this.$message.warning(response.errMsg)
          this.registerForm.answered = ''
        } else {
          this.$message.success(response.errMsg)
          this.activeName = 'first'
          this.registerForm.password = ''
        }
      })
    }
  }
}
</script>

<style scoped>
.tips {
  color: #5e6d82;
}
</style>
