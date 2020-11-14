<template>
  <v-container>
    <h1>Mastering D3</h1>
    <v-tabs v-model="tab" class="mt-5">
      <v-tab>Segregated DC</v-tab>
      <v-tab>Fruit Donut</v-tab>
      <v-tab>Cryptocurrency</v-tab>
      <v-tab>Gap Minder</v-tab>
    </v-tabs>
    <v-tabs-items v-model="tab">
      <v-tab-item>
        <SegregatedDC />
      </v-tab-item>
      <v-tab-item>
        <FruitDonut />
      </v-tab-item>
      <v-tab-item>
        <Cryptocurrency />
      </v-tab-item>
      <v-tab-item>
        <GapMinder />
      </v-tab-item>
    </v-tabs-items>
  </v-container>
</template>

<script>
import SegregatedDC from '@/components/SegregatedDC'
import FruitDonut from '@/components/FruitDonut'
import Cryptocurrency from '@/components/Cryptocurrency'
import GapMinder from '@/components/GapMinder'

export default {
  components: {
    SegregatedDC,
    FruitDonut,
    Cryptocurrency,
    GapMinder,
  },

  data: () => ({
    tab: 0,
  }),
}
</script>

<style></style>
