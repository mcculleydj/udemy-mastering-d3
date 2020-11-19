<template>
  <v-container>
    <v-row>
      <!-- left column -->
      <v-col cols="12" lg="6">
        <v-row>
          <v-col>
            <v-select
              v-model="metric"
              :items="metrics"
              outlined
              dense
              style="max-width: 200px"
              @change="updateMetric()"
              class="metric-select"
            />
            <div id="stacked-area-container"></div>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <div id="timeline-container"></div>
          </v-col>
        </v-row>
      </v-col>
      <!-- right column -->
      <v-col cols="12" lg="6">
        <v-row>
          <v-col cols="6" lg="12">
            <h4>Company Size</h4>
            <div id="donut-container"></div>
          </v-col>
          <v-col cols="6" lg="12">
            <h4>Average Units Sold</h4>
            <div id="average-units-container"></div>
          </v-col>
          <v-col cols="6" lg="12">
            <h4>Average Revenue Per Call</h4>
            <div id="average-revenue-container"></div>
          </v-col>
          <v-col cols="6" lg="12">
            <h4>Average Duration Per Call</h4>
            <div id="average-duration-container"></div>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import StackedArea from '@/d3/class/stacked-area'
import Timeline from '@/d3/class/timeline'
import Donut from '@/d3/class/donut'
import Bar from '@/d3/class/bar'
import {
  cleanData,
  findMaxSums,
  determineAverages,
  aggregateOnDate,
  aggregateOnCompanySize,
} from '@/d3/data-processing'

const colorMap = new Map([
  ['west', 'bisque'],
  ['south', 'coral'],
  ['northeast', 'cadetblue'],
  ['midwest', 'aquamarine'],
])

const donutColorMap = new Map([
  ['small', 'coral'],
  ['medium', 'cadetblue'],
  ['large', 'aquamarine'],
])

const stackedAreaSize = {
  width: 550,
  height: 445,
  margins: {
    left: 50,
    right: 30,
    top: 0,
    bottom: 20,
  },
}

const timelineSize = {
  width: 550,
  height: 150,
  margins: {
    left: 50,
    right: 30,
    top: 0,
    bottom: 50,
  },
  brushMin: 50,
}

const donutSize = {
  width: 300,
  height: 110,
  innerRadius: 25,
  outerRadius: 50,
}

const barSize = {
  width: 300,
  height: 110,
  margins: {
    left: 50,
    right: 0,
    top: 10,
    bottom: 30,
  },
}

export default {
  data: () => ({
    rawData: [],
    aggregatedData: [],
    maxSums: null,
    stackedArea: null,
    timeline: null,
    donut: null,
    unitsBar: null,
    metric: 'call_revenue',
    metrics: [
      { text: 'Revenue', value: 'call_revenue' },
      { text: 'Duration', value: 'call_duration' },
      { text: 'Units Sold', value: 'units_sold' },
    ],
    hasRange: false,
  }),

  async mounted() {
    this.rawData = await StackedArea.readData('calls.json')
    this.aggregatedData = aggregateOnDate(this.rawData)
    this.maxSums = findMaxSums(this.aggregatedData, Array.from(colorMap.keys()))

    this.stackedArea = new StackedArea(
      '#stacked-area-container',
      stackedAreaSize,
      colorMap,
    )
    this.stackedArea.update(
      this.aggregatedData,
      this.metric,
      this.maxSums[this.metric] * 1.2,
    )

    this.timeline = new Timeline('#timeline-container', timelineSize, {
      onBrush: this.onBrush,
    })
    this.timeline.update(
      cleanData(this.aggregatedData, this.metric, Array.from(colorMap.keys())),
    )

    this.donut = new Donut('#donut-container', donutSize, donutColorMap)
    this.donut.update(aggregateOnCompanySize(this.rawData), 'count')

    this.unitsBar = new Bar('#average-units-container', barSize)
    this.unitsBar.update(determineAverages(this.rawData).units, 'category')

    this.durationBar = new Bar('#average-duration-container', barSize)
    this.durationBar.update(
      determineAverages(this.rawData).duration,
      'category',
    )

    this.revenueBar = new Bar('#average-revenue-container', barSize)
    this.revenueBar.update(determineAverages(this.rawData).revenue, 'category')
  },

  methods: {
    updateMetric() {
      this.stackedArea.update(
        this.aggregatedData,
        this.metric,
        this.maxSums[this.metric] * 1.2,
      )
      this.timeline.update(
        cleanData(
          this.aggregatedData,
          this.metric,
          Array.from(colorMap.keys()),
        ),
      )
    },

    onBrush(dateRange) {
      this.stackedArea.update(
        this.aggregatedData,
        this.metric,
        this.maxSums[this.metric] * 1.2,
        dateRange,
      )
      this.donut.update(
        aggregateOnCompanySize(this.rawData, dateRange),
        'count',
      )
      this.unitsBar.update(
        determineAverages(this.rawData, dateRange).units,
        'category',
      )
      this.durationBar.update(
        determineAverages(this.rawData, dateRange).duration,
        'category',
      )
      this.revenueBar.update(
        determineAverages(this.rawData, dateRange).revenue,
        'category',
      )
      this.hasRange = !!dateRange
    },
  },
}
</script>

<style scoped>
.metric-select {
  position: absolute;
  left: 330px;
}
</style>
