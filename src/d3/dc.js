import * as d3 from 'd3'
import * as d3GeoProjection from 'd3-geo-projection'

const width = 800
const height = 800

const colors = {
  Black: 'purple',
  White: 'green',
  'Asian / Pacific Islander': 'red',
  Other: 'pink',
  Hispanic: 'orange',
}

let svg
let projection

export async function drawCanvas() {
  const mapData = await d3.json('dc-wards.json')
  svg = d3
    .select('#dc-svg-container')
    .append('svg')
    .attr('width', width)
    .attr('height', height)

  projection = d3
    .geoMercator()
    .translate([width / 2, height / 2])
    .center([-77.0369, 38.9072])
    .scale(130000)
    .fitSize([width, height], mapData)

  svg
    .datum(mapData)
    .append('path')
    .attr('d', d3.geoPath().projection(projection))
    .attr('fill', 'white')
    .attr('stroke', 'gray')

  // legend
  const legend = svg
    .append('g')
    .attr('transform', `translate(${width - 200}, 10)`)

  Object.keys(colors).forEach((r, i) => {
    const legendRow = legend.append('g')

    legendRow
      .append('rect')
      .attr('x', 0)
      .attr('y', 20 * i)
      .attr('width', 10)
      .attr('height', 10)
      .attr('fill', colors[r])

    legendRow
      .append('text')
      .attr('font-size', '15px')
      .attr('x', 20)
      .attr('y', 20 * i + 10)
      .text(r)
  })
}

export async function updateMap(year, race) {
  let censusData = await d3.json(`dc-points-${year}.json`)

  if (race !== 'All Races') {
    censusData = censusData.filter(d => d.properties.race === race)
  }

  const projectedData = censusData.map(d =>
    d3GeoProjection.geoProject(d, projection),
  )

  // join
  const points = svg.selectAll('circle').data(projectedData)

  // exit
  points.exit().remove()

  // enter and update
  points
    .enter()
    .append('circle')
    .attr('r', 0.25)
    .merge(points)
    .attr('cx', d => d.geometry.coordinates[0])
    .attr('cy', d => d.geometry.coordinates[1])
    .attr('fill', d => colors[d.properties.race])
    .attr('fill-opacity', 0.8)
}
