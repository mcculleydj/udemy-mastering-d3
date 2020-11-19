<template>
  <v-container>
    <h1>Mastering D3</h1>
    <v-tabs v-model="tab" class="mt-5">
      <v-tab>Cryptocurrency</v-tab>
      <v-tab>Gap Minder</v-tab>
      <v-tab>Fruit Donut</v-tab>
      <v-tab>DC Divided</v-tab>
      <v-tab>Dashboard</v-tab>
    </v-tabs>
    <v-tabs-items v-model="tab">
      <v-tab-item>
        <Cryptocurrency />
      </v-tab-item>
      <v-tab-item>
        <GapMinder />
      </v-tab-item>
      <v-tab-item>
        <FruitDonut />
      </v-tab-item>
      <v-tab-item>
        <DCDivided />
      </v-tab-item>
      <v-tab-item>
        <Dashboard />
      </v-tab-item>
    </v-tabs-items>
  </v-container>
</template>

<script>
import Cryptocurrency from '@/components/Cryptocurrency'
import GapMinder from '@/components/GapMinder'
import FruitDonut from '@/components/FruitDonut'
import DCDivided from '@/components/DCDivided'
import Dashboard from '@/components/Dashboard'

export default {
  components: {
    Cryptocurrency,
    GapMinder,
    FruitDonut,
    DCDivided,
    Dashboard,
  },

  data: () => ({
    tab: 0,
  }),
}
</script>
