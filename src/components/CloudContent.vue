<template>
  <div class="content">
    <div class="bg"></div>
    <sidebar></sidebar>
    <router-view></router-view>
  </div>
</template>

<script>
import Sidebar from 'components/Sidebar'
export default {
  name: 'app',
  components: {
    Sidebar
  },
  data () {
    return {
    }
  }
}
</script>

<style scoped>
.bg {
    z-index: -1;
    background: #000;
    position: fixed;
    opacity: 0.85;
    -webkit-transition: all .2s ease-in;
    transition: all .2s ease-in;
    height: 100%;
    width: 100%;
    background-attachment: fixed;
    background-repeat: no-repeat;
    background-size: cover;
    -moz-background-size: cover;
    -webkit-background-size: cover;
}
</style>
