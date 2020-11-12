<template>
  <v-container>
    <v-row>
      <v-col>
        <v-radio-group v-model="fruit" @change="toggleFruit()" row>
          <v-radio label="Apples" value="apples" />
          <v-radio label="Oranges" value="oranges" />
          <v-radio label="Lemons" value="lemons" />
        </v-radio-group>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <div id="donut-svg-container"></div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { readData, drawCanvas, updateChart } from '@/d3/donut'

export default {
  data: () => ({
    fruit: 'apples',
    chartData: [],
    chart: null,
  }),

  async mounted() {
    this.chartData = await readData()
    this.chart = drawCanvas()
    updateChart(this.chart, this.chartData, this.fruit)
  },

  methods: {
    toggleFruit() {
      updateChart(this.chart, this.chartData, this.fruit)
    },
  },
}
</script>

<style></style>
