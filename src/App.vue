<template>
  <v-app>
    <v-main>
      <MasteringD3 />
    </v-main>
  </v-app>
</template>

<script>
import MasteringD3 from '@/views/MasteringD3'

export default {
  components: {
    MasteringD3,
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
