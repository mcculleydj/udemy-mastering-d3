import * as d3 from 'd3'

// data constants
const regions = ['North', 'South', 'East', 'West', 'Central']

// size
const width = 540
const height = 540
const radius = Math.min(width, height) / 2

// color scale
const color = d3.scaleOrdinal([
  '#66c2a5',
  '#fc8d62',
  '#8da0cb',
  '#e78ac3',
  '#a6d854',
  '#ffd92f',
])

// layout transform
// - .pie() will update a set of data that has a category and an associated value
//   by appending the necessary information for the arc function to draw the path
// - .value(d => d.count) only works because "53245" can be coerced to a numeric value
// - .sort(null) overrides the default comparator which would
//   organize the data in descending value and break the transitions when toggling
//   between fruit since those transitions rely on regions remaining in a certain order
const pie = d3
  .pie()
  .value(d => d.count)
  .sort(null)

// path function
// defining inner and outer radius as constants to provide the donut chart's params
// startAngle and endAngle are the other arguments arc expects to draw a proper path
// these arguments come from the d3.pie() layout transformation above based on the
// percentage of the whole that each region's value represents
const arc = d3
  .arc()
  .innerRadius(radius - 80)
  .outerRadius(radius)

export async function readData() {
  return await d3.json('fruit.json')
}

export function drawCanvas() {
  const svg = d3
    .select('#donut-svg-container')
    .append('svg')
    .attr('width', width)
    .attr('height', height)

  // TODO: build a legend

  return svg
    .append('g')
    .attr('transform', `translate(${width / 2}, ${height / 2})`)
}

// will pass in a string to the fruit argument matching one of the keys in the data
// radio buttons and bound state will live in the parent Vue component
export function updateChart(chart, data, fruit) {
  // the easiest way to handle missing regions as we transition from one fruit to another
  // is to simply set the values for those regions to 0
  const processedFruit = [...data[fruit]]

  regions.forEach((region, i) => {
    if (processedFruit.length > i) {
      if (processedFruit[i].region !== region) {
        processedFruit.splice(i, 0, { region, count: 0 })
      }
    } else {
      processedFruit.push({ region, count: 0 })
    }
  })

  // arcTween is a higher-order function that takes the destination state (data point)
  // and relies on a private _current variable stored on the this context (?) to provide
  // the current state (data point).

  // in the context of this visualation when toggling from one fruit to another
  // the argument d represents the new fruit's data for a given region and _current
  // represents the previous fruit's data for the same region

  // the function returned takes a single argument t which is a number between 0 and 1
  // consider t to be the percentage complete through the transition animation
  function arcTween(d) {
    // d3.interpolate is a generic wrapper around more specific interpolation methods
    // because d is an object (i.e. one of our data points with keys:
    // data, index, value, startAngle, and endAngle)
    // interpolate will pass these arguments to interpolateObject which will attempt
    // to produce objects where the values are interpolated on a per key basis
    const i = d3.interpolate(this._current, d)
    // update this._current to the destination object to serve as the starting point
    // for the next transition
    this._current = d
    // return a function that takes a transition percentage and returns the current
    // arc path
    return t => arc(i(t))
  }

  // join new data
  const path = chart.selectAll('path').data(pie(processedFruit))

  // update existing arcs
  // if the data changes as a result of toggling to a different fruit
  // arcTween will see a new data point for this region triggering a transition
  // from the previous arc to the new arc
  path
    .transition()
    .duration(200)
    .attrTween('d', arcTween)

  // enter new arcs
  path
    .enter()
    .append('path')
    .attr('fill', (_, i) => color(i))
    .attr('d', arc)
    .attr('stroke', 'white')
    .attr('stroke-width', '6px')
    .each(function(d) {
      // the keyword this is an object corresponding to the path element itself
      // setting _current stores the current data point as additional state
      // for use later in the arcTween function after the data has updated

      // NOTE: the use of ES6 arrow notation for functions (() => {})
      //       cannot be used with this method of preserving state
      //       because the keyword this does not have the same context
      this._current = d
    })
}
