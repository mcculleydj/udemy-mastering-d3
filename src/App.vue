<template>
  <v-app>
    <v-main>
      <v-container style="max-width: 800px">
        <v-row justify="center">
          <v-col cols="auto">
            <v-btn @click="play ? pauseFn() : playFn()" color="primary">
              <v-icon>{{ play ? 'mdi-pause' : 'mdi-play' }}</v-icon>
              {{ play ? 'Pause' : 'Play' }}
            </v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn @click="reset()" color="primary">
              <v-icon>mdi-refresh</v-icon>
              Reset
            </v-btn>
          </v-col>
          <v-spacer />
          <v-col cols="auto">
            <v-select
              v-model="selectedContinent"
              :items="continentItems"
              @change="applyContinentFilter()"
              dense
              outlined
              label="Continent"
              style="width: 200px"
            />
          </v-col>
        </v-row>
        <v-row justify="center">
          <v-col>
            <v-slider
              v-model="year"
              thumb-label="always"
              min="1800"
              max="2015"
              @mousedown="pauseFn()"
              @end="setYear($event)"
            />
          </v-col>
        </v-row>
        <v-row justify="center">
          <svg width="400" height="60" class="svg-plot" />
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { readData, drawCanvas, updatePlot, updateInfo } from '@/d3/scatter-plot'

export default {
  name: 'App',

  data: () => ({
    interval: null,
    plotData: null,
    plot: null,
    continentItems: [
      { text: 'All', value: 'all' },
      { text: 'Africa', value: 'africa' },
      { text: 'Americas', value: 'americas' },
      { text: 'Asia', value: 'asia' },
      { text: 'Europe', value: 'europe' },
    ],
    play: true,
    index: 0,
    year: 1800,
    selectedCountry: null,
    selectedCountryEl: null,
    selectedContinent: 'all',
  }),

  async mounted() {
    this.plotData = await readData()
    this.plot = drawCanvas()
    // updatePlot(
    //   this.plot,
    //   this.plotData[this.index++],
    //   this.selectedCountry,
    //   this.selectedContinent,
    //   { selectCountry: this.selectCountry },
    // )
    this.playFn()
  },

  beforeDestroy() {
    clearInterval(this.interval)
  },

  methods: {
    selectCountry(country, el, previousColor) {
      this.selectedCountry = country

      if (!this.play) {
        // set fill and update incase visualization is paused
        if (this.selectedCountryEl) {
          this.selectedCountryEl.el.setAttribute(
            'fill',
            this.selectedCountryEl.previousColor,
          )
        }
        el.setAttribute('fill', 'gold')
        this.selectedCountryEl = { el, previousColor }

        updateInfo(
          this.plot,
          this.plotData[this.index].countries,
          this.selectedCountry,
        )
      }
    },

    playFn() {
      this.interval = setInterval(() => {
        // restart at 1800
        if (this.index >= this.plotData.length - 1) {
          this.index = 0
        }

        updatePlot(
          this.plot,
          this.plotData[this.index++],
          this.selectedCountry,
          this.selectedContinent,
          { selectCountry: this.selectCountry },
        )

        updateInfo(
          this.plot,
          this.plotData[this.index].countries,
          this.selectedCountry,
        )

        this.year = 1800 + this.index - 1
      }, 300)

      this.play = true
    },

    pauseFn() {
      clearInterval(this.interval)
      this.play = false
    },

    reset() {
      clearInterval(this.interval)
      this.index = 0
      this.selectedContinent = 'all'
      this.selectedCountry = null
      this.playFn()
    },

    applyContinentFilter() {
      // determine if selected country is still visible after the filter
      if (this.selectedCountry) {
        const country = this.plotData[this.index].countries.find(
          c => c.country === this.selectedCountry,
        )
        if (
          this.selectedContinent !== 'all' &&
          country.continent !== this.selectedContinent
        ) {
          this.selectedCountry = null
        }
      }

      // handle update if visualization is paused
      if (!this.play) {
        updatePlot(
          this.plot,
          this.plotData[this.index],
          this.selectedCountry,
          this.selectedContinent,
          { selectCountry: this.selectCountry },
        )

        updateInfo(
          this.plot,
          this.plotData[this.index].countries,
          this.selectedCountry,
        )
      }
    },

    setYear() {
      this.index = this.year - 1800
      updatePlot(
        this.plot,
        this.plotData[this.index],
        this.selectedCountry,
        this.selectedContinent,
        { selectCountry: this.selectCountry },
      )

      updateInfo(
        this.plot,
        this.plotData[this.index].countries,
        this.selectedCountry,
      )
    },
  },

  //   handleSlide(evt) {
  //     this.index = evt - 1800
  //     this.allCountries = this.data[this.index].countries
  //       .filter(
  //         c => c.population && c.life_exp && c.income && c.population >= 2000,
  //       )
  //       .sort((c1, c2) => c2.population - c1.population)
  //     this.updateFn(this.allCountries, String(evt))
  //   },
  // },
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

<style scoped>
.svg-plot {
  border: 1px solid gray;
  border-radius: 4px;
}
</style>
