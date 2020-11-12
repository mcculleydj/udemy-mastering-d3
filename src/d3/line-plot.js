import * as d3 from 'd3'

const margin = { left: 100, right: 30, top: 30, bottom: 30 }
const width = 800 - margin.left - margin.right
const height = 500 - margin.top - margin.bottom

// time parser for x-scale
const parseTime = d3.timeParse('%d/%m/%Y')

// for tooltip
const bisectDate = d3.bisector(d => d.date).left

// scales
const x = d3.scaleTime().range([0, width])
const y = d3.scaleLinear().range([height, 0])

const metricsMap = {
  price_usd: 'Price',
  market_cap: 'Market Cap',
  '24h_vol': 'Daily Volume',
}

const formatSi = d3.format('.2s')

function formatAbbreviation(d) {
  const s = formatSi(d)
  switch (s[s.length - 1]) {
    case 'G':
      return '$' + s.slice(0, -1) + 'B'
    case 'k':
      return '$' + s.slice(0, -1) + 'K'
    case 'm':
      return '$' + d3.format('.2')(s.slice(0, -1) / 1000)
  }
  return `$${s}`
}

// axis generators
const xAxisCall = d3.axisBottom().ticks(4)
const yAxisCall = d3
  .axisLeft()
  .ticks(6)
  .tickFormat(formatAbbreviation)

export async function readData() {
  return await d3.json('cryptoData.json')
}

export function drawCanvas() {
  const svg = d3
    .select('#crpyto-svg-container')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)

  const plot = svg
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)

  const path = plot
    .append('path')
    .attr('class', 'line')
    .attr('fill', 'none')
    .attr('stroke', 'grey')
    .attr('stroke-width', '3px')

  // axis groups
  const xAxis = plot
    .append('g')
    .attr('class', 'x axis')
    .attr('transform', `translate(0, ${height})`)
  const yAxis = plot.append('g').attr('class', 'y axis')

  // y-axis label
  const yAxisLabel = yAxis
    .append('text')
    .attr('class', 'axis-title')
    .attr('transform', `translate(-50, ${height / 2}) rotate(-90)`)
    .attr('font-size', '16px')
    .style('text-anchor', 'middle')
    .attr('fill', '#5D6971')

  return { plot, path, xAxis, yAxis, yAxisLabel }
}

export function updatePlot(
  { plot, path, xAxis, yAxis, yAxisLabel },
  data,
  metric,
  dateRange,
) {
  yAxisLabel
    .transition(d3.transition().duration(300))
    .text(`${metricsMap[metric]} ($)`)

  // clean data
  const cleanData = data
    .filter(d => d.date && d[metric])
    .map(d => ({
      date: parseTime(d.date),
      value: Number(d[metric]),
    }))

  let rangedData = cleanData

  if (dateRange) {
    rangedData = cleanData.filter(
      d => d.date >= dateRange[0] && d.date <= dateRange[1],
    )
  }

  // set scale domains
  x.domain(d3.extent(rangedData, d => d.date))
  y.domain([0, d3.max(rangedData, d => d.value) * 1.005])

  // generate axes once scales have been set
  xAxis.transition(d3.transition().duration(300)).call(xAxisCall.scale(x))
  yAxis.transition(d3.transition().duration(300)).call(yAxisCall.scale(y))

  // add line to chart
  // line path generator
  const line = d3
    .line()
    .x(d => x(d.date))
    .y(d => y(d.value))

  path.transition(d3.transition().duration(300)).attr('d', line(rangedData))

  // tooltip
  const focus = plot
    .append('g')
    .attr('class', 'focus')
    .style('display', 'none')

  focus
    .append('line')
    .attr('class', 'x-hover-line hover-line')
    .attr('y1', 0)
    .attr('y2', height)

  focus
    .append('line')
    .attr('class', 'y-hover-line hover-line')
    .attr('x1', 0)
    .attr('x2', width)

  focus.append('circle').attr('r', 7.5)

  plot
    .append('text')
    .attr('text-anchor', 'end')
    .attr('x', 50)
    .attr('dy', '.31em')
    .attr('class', 'tip-value')

  // overlay
  plot
    .append('rect')
    .attr('class', 'overlay')
    .attr('width', width)
    .attr('height', height)
    .on('mouseover', () => {
      focus.style('display', null)
      plot.select('text.tip-value').style('display', null)
    })
    .on('mouseout', () => {
      focus.style('display', 'none')
      plot.select('text.tip-value').style('display', 'none')
    })
    .on('mousemove', mousemove)

  function mousemove(event) {
    const x0 = x.invert(d3.pointer(event)[0])
    const i = bisectDate(rangedData, x0, 1)
    const d0 = rangedData[i - 1]
    const d1 = rangedData[i]
    const d = x0 - d0.date > d1.date - x0 ? d1 : d0
    focus.attr('transform', `translate(${x(d.date)}, ${y(d.value)})`)
    plot
      .select('text.tip-value')
      .attr('y', y(d.value) - 15)
      .text(formatAbbreviation(d.value))
    focus.select('.x-hover-line').attr('y2', height - y(d.value))
    focus.select('.y-hover-line').attr('x2', -x(d.date))
  }

  return d3.extent(cleanData, d => d.date)
}
