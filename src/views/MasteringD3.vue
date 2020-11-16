<template>
  <v-container>
    <h1>Mastering D3</h1>
    <v-tabs v-model="tab" class="mt-5">
      <v-tab>Cryptocurrency</v-tab>
      <v-tab>Cryptocurrency Brush</v-tab>
      <v-tab>DC Divided</v-tab>
      <v-tab>Fruit Donut</v-tab>
      <v-tab>Gap Minder</v-tab>
    </v-tabs>
    <v-tabs-items v-model="tab">
      <v-tab-item>
        <Cryptocurrency />
      </v-tab-item>
      <v-tab-item>
        <CryptocurrencyBrush />
      </v-tab-item>
      <v-tab-item>
        <DCDivided />
      </v-tab-item>
      <v-tab-item>
        <FruitDonut />
      </v-tab-item>
      <v-tab-item>
        <GapMinder />
      </v-tab-item>
    </v-tabs-items>
  </v-container>
</template>

<script>
import Cryptocurrency from '@/components/Cryptocurrency'
import CryptocurrencyBrush from '@/components/CryptocurrencyBrush'
import DCDivided from '@/components/DCDivided'
import FruitDonut from '@/components/FruitDonut'
import GapMinder from '@/components/GapMinder'

export default {
  components: {
    Cryptocurrency,
    CryptocurrencyBrush,
    DCDivided,
    FruitDonut,
    GapMinder,
  },

  data: () => ({
    tab: 0,
  }),
}
</script>
