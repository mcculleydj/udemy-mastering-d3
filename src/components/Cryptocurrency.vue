<template>
  <v-container>
    <v-row align="center">
      <v-col cols="auto">
        <v-select
          label="Currency"
          v-model="coin"
          :items="coinItems"
          outlined
          hide-details
          dense
          style="max-width: 200px"
          @change="updateCoinOrMetric()"
        />
      </v-col>
      <v-col cols="auto">
        <v-select
          label="Metric"
          v-model="metric"
          :items="metricItems"
          outlined
          hide-details
          dense
          style="max-width: 200px"
          @change="updateCoinOrMetric()"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col class="pb-0">
        <div id="crypto-svg-container"></div>
      </v-col>
    </v-row>
    <v-row>
      <v-col class="py-0">
        <div id="timeline-svg-container"></div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import LinePlot from '@/d3/class/line'
import Timeline from '@/d3/class/timeline'

const linePlotSize = {
  width: 800,
  height: 400,
  margins: {
    left: 70,
    right: 30,
    top: 10,
    bottom: 30,
  },
}

const timelineSize = {
  width: 800,
  height: 150,
  margins: {
    left: 70,
    right: 30,
    top: 10,
    bottom: 30,
  },
}

function cleanData(data, property) {
  return data
    .filter(d => d.date && d[property])
    .map(d => ({
      date: Timeline.parseDate('%d/%m/%Y', d.date),
      value: Number(d[property]),
    }))
}

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
    hasRange: false,
  }),

  async mounted() {
    this.rawData = await LinePlot.readData('crypto.json')

    this.linePlot = new LinePlot('#crypto-svg-container', linePlotSize)
    const data = cleanData(this.rawData[this.coin], this.metric)
    this.linePlot.update(data, this.metric)

    const callbacks = {
      onBrush: this.onBrush,
    }
    this.timeline = new Timeline(
      '#timeline-svg-container',
      timelineSize,
      callbacks,
    )
    this.timeline.update(data, this.metric)
  },

  methods: {
    updateCoinOrMetric() {
      const data = cleanData(this.rawData[this.coin], this.metric)
      this.linePlot.update(data, this.metric)
      this.timeline.update(data, this.metric)
      this.timeline.resetBrush()
    },

    onBrush(dateRange) {
      const data = cleanData(this.rawData[this.coin], this.metric)
      this.linePlot.update(data, this.metric, dateRange)
      this.hasRange = !!dateRange
    },
  },
}
</script>
