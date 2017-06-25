<template>
  <video controls="controls" autoplay="autoplay">
    <source :src="url" />
  </video>
</template>

<script>
export default {
  data () {
    return {
      url: ''
    }
  },
  watch: {
    '$route': 'routerChange'
  },
  mounted () {
    this.$nextTick(() => {
      this.url = this.$route.query.url
    })
  },
  methods: {
    routerChange () {
      this.url = ''
    }
  }
}
</script>
