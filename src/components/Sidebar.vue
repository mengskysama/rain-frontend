<template>
  <div class="col">
    <el-menu theme="dark" default-active="1" class="el-menu-demo" mode="horizontal">
      <el-menu-item index="1">Rain - A BitTorrent cloud solution</el-menu-item>
      <el-menu-item index="2" @click="logout" style="float: right">Logout</el-menu-item>
    </el-menu>
  </div>
</template>

<script>
import api from 'src/service/api'

export default {
  props: [],
  methods: {
    logout () {
      api.logout().then(response => {
        // this.displayMagnetUrl = true
        if (response.errCode !== 0) {
          this.$message.warning(response.errMsg)
        } else {
          this.$router.push({name: 'login'})
        }
      })
    }
  }
}
</script>

<style scoped>
</style>