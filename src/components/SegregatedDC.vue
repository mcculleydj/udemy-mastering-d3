<template>
  <v-container class="mt-5">
    <v-row>
      <v-col cols="auto">
        <v-select
          v-model="year"
          :items="yearItems"
          @change="update()"
          outlined
          :hint="loading ? 'Loading...' : ''"
          persistent-hint
          style="width: 250px"
        />
      </v-col>
      <v-col cols="auto">
        <v-select
          v-model="race"
          :items="raceItems"
          @change="update()"
          outlined
          :hint="loading ? 'Loading...' : ''"
          persistent-hint
          style="width: 250px"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <div id="dc-svg-container"></div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { drawCanvas, updateMap } from '@/d3/dc'

export default {
  data: () => ({
    loading: false,
    year: '90',
    yearItems: [
      { text: '1990 Census', value: '90' },
      { text: '2000 Census', value: '00' },
      { text: '2010 Census', value: '10' },
      { text: '2012-2016 ACS Census', value: 'ACS' },
    ],
    race: 'all',
    raceItems: [
      { text: 'All Races', value: 'all' },
      { text: 'Black', value: 'black1nh' },
      { text: 'Hispanic', value: 'hisp' },
      { text: 'White', value: 'white1nh' },
      { text: 'Asian / Pacific Islander', value: 'asianpi1nh' },
      { text: 'Native', value: 'native1nh' },
      { text: 'Other', value: 'other1nh' },
    ],
  }),

  async mounted() {
    this.loading = true
    await drawCanvas()
    await updateMap(this.year, this.race)
    this.loading = false
  },

  methods: {
    async update() {
      this.loading = true
      await updateMap(this.year, this.race)
      this.loading = false
    },
  },
}
</script>
