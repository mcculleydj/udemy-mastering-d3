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
          @change="updateCoinOrMetric()"
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
          @change="updateCoinOrMetric()"
        />
      </v-col>
    </v-row>
    <v-row justify="center" class="mr-10">
      <v-col>
        <div id="crypto-svg-container"></div>
      </v-col>
    </v-row>
    <v-row justify="center" class="mr-10">
      <v-col>
        <v-btn
          small
          outlined
          color="primary"
          class="date-reset-button"
          @click="resetBrush()"
        >
          <v-icon>mdi-refresh</v-icon>
          Reset Date Range
        </v-btn>
        <div id="timeline-svg-container"></div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import LinePlot from '@/d3/class/line-plot'
import Timeline from '@/d3/class/timeline'

export default {
  data: () => ({
    rawData: null,
    linePlot: null,
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
    timeline: null,
  }),

  async mounted() {
    this.rawData = await LinePlot.readData('crypto.json')
    const margins = {
      left: 100,
      right: 30,
      top: 30,
      bottom: 30,
    }
    const linePlotSize = {
      width: 800,
      height: 500,
      margins,
    }
    this.linePlot = new LinePlot('#crypto-svg-container', linePlotSize)
    this.linePlot.update(this.rawData[this.coin], this.metric)
    const timelineSize = {
      width: 800,
      height: 200,
      margins,
    }
    const callbacks = {
      onBrush: this.onBrush,
    }
    this.timeline = new Timeline(
      '#timeline-svg-container',
      timelineSize,
      callbacks,
    )
    this.timeline.update(this.rawData[this.coin], this.metric)
  },

  methods: {
    updateCoinOrMetric() {
      this.linePlot.update(this.rawData[this.coin], this.metric)
      this.timeline.update(this.rawData[this.coin], this.metric)
      this.timeline.resetBrush()
    },

    resetBrush() {
      this.linePlot.update(this.rawData[this.coin], this.metric)
      this.timeline.resetBrush()
    },

    onBrush(dateRange) {
      this.linePlot.update(this.rawData[this.coin], this.metric, dateRange)
    },
  },
}
</script>

<style scoped>
.date-reset-button {
  left: 100px;
}
</style>

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
