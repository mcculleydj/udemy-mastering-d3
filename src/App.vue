<template>
  <v-app>
    <v-main>
      <v-container>
        <h1>Mastering D3</h1>
        <v-tabs v-model="tab" class="mt-5">
          <v-tab>Cryptocurrency</v-tab>
          <v-tab>Gap Minder</v-tab>
        </v-tabs>
        <v-tabs-items v-model="tab">
          <v-tab-item>
            <Cryptocurrency />
          </v-tab-item>
          <v-tab-item>
            <GapMinder />
          </v-tab-item>
        </v-tabs-items>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import Cryptocurrency from '@/components/Cryptocurrency'
import GapMinder from '@/components/GapMinder'

export default {
  components: {
    Cryptocurrency,
    GapMinder,
  },

  data: () => ({
    tab: 0,
  }),
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
