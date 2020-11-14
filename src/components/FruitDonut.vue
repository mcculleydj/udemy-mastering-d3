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
      <v-col cols="auto mr-10">
        <div id="donut-svg-container"></div>
      </v-col>
      <v-col style="border-left: 1px solid lightgray" class="pl-10">
        <h4 class="mb-3">SOURCE DATA</h4>
        <pre>{{ chartData[fruit] }}</pre>
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
