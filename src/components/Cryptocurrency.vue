<template>
  <v-container style="max-width: 800px" class="mt-5">
    <v-row justify="center" class="mx-12">
      <v-col>
        <v-select
          label="Currency"
          v-model="coin"
          :items="coinItems"
          outlined
          hide-details
          dense
          @change="update()"
        />
      </v-col>
      <v-col>
        <v-select
          label="Metric"
          v-model="metric"
          :items="metricItems"
          outlined
          hide-details
          dense
          @change="update()"
        />
      </v-col>
    </v-row>
    <v-row
      justify="center"
      align="center"
      class="mx-12 mt-5"
      v-if="dateTicks.length > 1"
    >
      <span style="width: 100px" class="text-center">
        {{ dateTicks[dateRange[0]].display }}
      </span>
      <v-col>
        <v-range-slider
          v-model="dateRange"
          min="0"
          :max="dateTicks.length > 0 ? dateTicks.length - 1 : 1"
          hide-details
          @end="handleRange()"
        />
      </v-col>
      <span style="width: 100px" class="text-center">
        {{ dateTicks[dateRange[1]].display }}
      </span>
    </v-row>
    <v-row justify="center" class="mr-10">
      <div id="crpyto-svg-container"></div>
    </v-row>
  </v-container>
</template>

<script>
import { readData, drawCanvas, updatePlot } from '@/d3/line-plot'

const monthMap = {
  '1': 'Jan',
  '2': 'Feb',
  '3': 'Mar',
  '4': 'Apr',
  '5': 'May',
  '6': 'Jun',
  '7': 'Jul',
  '8': 'Aug',
  '9': 'Sep',
  '10': 'Oct',
  '11': 'Nov',
  '12': 'Dec',
}

export default {
  computed: {
    dateTicks() {
      if (this.extent.length < 2) return []
      let month = this.extent[0].getMonth() + 1
      let year = this.extent[0].getFullYear()
      const endMonth = this.extent[1].getMonth() + 1
      const endYear = this.extent[1].getFullYear()
      const labels = []
      while (month !== endMonth || year !== endYear) {
        labels.push({
          date: new Date(Date.parse(`${month} 01 ${year}`)),
          display: `${monthMap[month++]} ${year}`,
        })
        if (month === 13) {
          month = 1
          year++
        }
      }
      labels.push({
        date: new Date(Date.parse(`${endMonth} 01 ${endYear}`)),
        display: `${monthMap[endMonth]} ${endYear}`,
      })
      return labels
    },
  },

  data: () => ({
    plotData: [],
    svgGroups: null,
    coin: 'bitcoin',
    coinItems: [
      { text: 'Bitcoin', value: 'bitcoin' },
      { text: 'Bitcoin Cash', value: 'bitcoin_cash' },
      { text: 'Ethereum', value: 'ethereum' },
      { text: 'Litecoin', value: 'litecoin' },
      { text: 'Ripple', value: 'ripple' },
    ],
    metric: 'price_usd',
    metricItems: [
      { text: 'Price', value: 'price_usd' },
      { text: 'Market Cap', value: 'market_cap' },
      { text: 'Daily Volume', value: '24h_vol' },
    ],
    dateRange: [0, 1],
    extent: [],
  }),

  async mounted() {
    this.plotData = await readData()
    this.svgGroups = drawCanvas()
    this.extent = updatePlot(
      this.svgGroups,
      this.plotData[this.coin],
      this.metric,
    )
  },

  methods: {
    update() {
      this.extent = updatePlot(
        this.svgGroups,
        this.plotData[this.coin],
        this.metric,
      )
    },

    handleRange() {
      const dateRange = [
        this.dateTicks[this.dateRange[0]].date,
        this.dateTicks[this.dateRange[1]].date,
      ]
      updatePlot(
        this.svgGroups,
        this.plotData[this.coin],
        this.metric,
        dateRange,
      )
    },
  },

  watch: {
    dateTicks() {
      this.dateRange = [0, this.dateTicks.length - 1]
    },
  },
}
</script>

<style>
#chart-area svg {
  margin-left: auto;
  margin-right: auto;
  display: block;
}

#logo {
  height: 50px;
}

.navbar-brand {
  height: 60px;
  padding: 5px 0px;
}

.axis {
  font: 10px sans-serif;
}

.axis path,
.axis line {
  fill: none;
  stroke: #d4d8da;
  stroke-width: 2px;
  shape-rendering: crispEdges;
}

.line {
  fill: none;
  stroke-width: 2px;
}

.overlay {
  fill: none;
  pointer-events: all;
}

.focus circle {
  fill: #f1f3f3;
  stroke: #777;
  stroke-width: 3px;
}

.hover-line {
  stroke: #777;
  stroke-width: 2px;
  stroke-dasharray: 3, 3;
}

#selections .col-md-4 {
  padding-top: 10px;
  padding-bottom: 10px;
}

.line {
  fill: none;
  stroke-width: 3px;
  stroke: grey;
}
</style>
