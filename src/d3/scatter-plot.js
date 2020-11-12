import * as d3 from 'd3'

// data
const continents = ['africa', 'americas', 'asia', 'europe']

// format
const commas = d3.format(',')
const currency = d3.format('$,')

// size
const margin = { left: 70, right: 40, top: 40, bottom: 70 }
const width = 800 - margin.left - margin.right
const height = 600 - margin.top - margin.bottom

// scale
const y = d3
  .scaleLinear()
  .domain([0, 90])
  .range([height, 0])

const x = d3
  .scaleLog()
  .domain([100, 150000])
  .range([0, width])

const color = d3
  .scaleOrdinal()
  .domain(continents)
  .range(d3.schemeSet1)

const area = d3
  .scaleLinear()
  .domain([2000, 1400000000])
  .range([25 * Math.PI, 1500 * Math.PI])

export async function readData() {
  return await d3.json('gapMinderData.json')
}

export function drawCanvas() {
  const svg = d3
    .select('#gap-minder-svg-container')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)

  const plot = svg
    .append('g')
    .attr('width', width)
    .attr('height', height)
    .attr('transform', `translate(${margin.left}, ${margin.top})`)

  // legend
  const legend = plot.append('g').attr(
    'transform',
    `translate(
        ${width - margin.right - 40},
        ${height - margin.bottom - 10}
      )`,
  )

  continents.forEach((c, i) => {
    const legendRow = legend.append('g')

    legendRow
      .append('circle')
      .attr('cx', 0)
      .attr('cy', 20 * i)
      .attr('r', 5)
      .attr('fill', color(c))

    legendRow
      .append('text')
      .attr('font-size', '15px')
      .attr('x', 15)
      .attr('y', 20 * i + 5)
      .style('text-transform', 'capitalize')
      .text(c)
  })

  // x-axis
  plot
    .append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(
      d3
        .axisBottom(x)
        .tickValues([400, 4000, 40000])
        .tickFormat(t => `$${t}`),
    )

  // x-axis label
  plot
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('font-size', '20px')
    .attr(
      'transform',
      `translate(${width / 2}, ${height + margin.bottom - 20})`,
    )
    .text('GDP Per Capita - Logrithmic ($)')

  // y-axis
  plot.append('g').call(d3.axisLeft(y))

  // y-axis label
  plot
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('font-size', '20px')
    .attr('transform', `translate(-35, ${height / 2}) rotate(-90)`)
    .text('Life Expectancy (Years)')

  return plot
}

export function updatePlot(
  plot,
  countryData,
  selectedCountry,
  selectedContinent,
  callbacks,
) {
  let hoverCountryGroup
  let filteredCountries = countryData.countries
    .filter(c => c.population && c.income && c.life_exp)
    .sort((c1, c2) => c2.population - c1.population)

  // handle continent filter
  if (selectedContinent !== 'all') {
    filteredCountries = filteredCountries.filter(
      c => c.continent === selectedContinent,
    )
  }

  // points

  // join
  const points = plot
    .selectAll('circle.point')
    .data(filteredCountries, d => d.country)

  // remove
  points
    .exit()
    .transition(d3.transition().duration(100))
    .remove()

  // render and update
  points
    .enter()
    .append('circle')
    .on('mouseover', (_, d) => {
      hoverCountryGroup = plot
        .append('g')
        .attr('transform', `translate(${width / 2}, 450)`)
        .append('text')
        .attr('text-anchor', 'middle')
        .text(d.country)
        .attr('font-size', '36px')
        .attr('fill', 'gray')
    })
    .on('mouseleave', () => {
      hoverCountryGroup.remove()
    })
    .on('click', (e, d) => {
      callbacks.selectCountry(d.country, e.target, color(d.continent))
    })
    .merge(points)
    .transition(d3.transition().duration(100))
    .attr('cx', d => x(d.income))
    .attr('cy', d => y(d.life_exp))
    .attr('r', d => Math.sqrt(area(d.population) / Math.PI))
    .attr('fill', d =>
      d.country === selectedCountry ? 'gold' : color(d.continent),
    )
    .attr('class', 'point')
    .style('cursor', 'pointer')

  // year

  // join
  const yearEl = plot
    .selectAll('.year-svg-group')
    .data([countryData.year], d => d)

  // remove
  yearEl.exit().remove()

  // render and update
  yearEl
    .enter()
    .append('text')
    .attr('font-size', '36px')
    .attr('fill', 'gray')
    .attr('text-anchor', 'middle')
    .attr('transform', `translate(${width / 2}, 30)`)
    .attr('class', 'year-svg-group')
    .text(d => d)
}

export function updateInfo(plot, countries, selectedCountry) {
  // remove the existing group on any call to updateInfo
  if (d3.select('.info-svg-group')) {
    d3.select('.info-svg-group').remove()
  }

  const country = countries.find(c => c.country === selectedCountry)

  // render nothing if the country is not part of the data set for this year (check this)
  if (!country) {
    return
  }

  // render and update
  const infoGroup = plot
    .append('g')
    .attr('transform', `translate(20, 18)`)
    .attr('class', 'info-svg-group')

  infoGroup
    .append('text')
    .attr('font-weight', 'bold')
    .transition(d3.transition().duration(100))
    .text(country.country)
  infoGroup
    .append('text')
    .attr('y', 20)
    .transition(d3.transition().duration(100))
    .text(`Population: ${commas(country.population)}`)
  infoGroup
    .append('text')
    .attr('y', 40)
    .transition(d3.transition().duration(100))
    .text(`Life Expectancy: ${country.life_exp}`)
  infoGroup
    .append('text')
    .attr('y', 60)
    .transition(d3.transition().duration(100))
    .text(`Income: ${currency(country.income)}`)
}
