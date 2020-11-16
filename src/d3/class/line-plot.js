import * as d3 from 'd3'

// time parser for x-scale
const parseTime = d3.timeParse('%d/%m/%Y')

// for tooltip
const bisectDate = d3.bisector(d => d.date).left

// key to display name
const metricsMap = {
  price_usd: 'Price',
  market_cap: 'Market Cap',
  '24h_vol': 'Daily Volume',
}

function formatAbbreviation(d) {
  const s = d3.format('.2s')(d)
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
const xAxisFn = d3.axisBottom().ticks(4)
const yAxisFn = d3
  .axisLeft()
  .ticks(6)
  .tickFormat(formatAbbreviation)

export default class LinePlot {
  static async readData(uri) {
    return await d3.json(uri)
  }

  constructor(selector, { width, height, margins }) {
    this.selector = selector
    this.margins = margins
    this.width = width - this.margins.left - this.margins.right
    this.height = height - this.margins.top - this.margins.bottom

    this.drawCanvas()
  }

  drawCanvas() {
    const svg = d3
      .select(this.selector)
      .append('svg')
      .attr('width', this.width + this.margins.left + this.margins.right)
      .attr('height', this.height + this.margins.top + this.margins.bottom)

    this.plot = svg
      .append('g')
      .attr('transform', `translate(${this.margins.left}, ${this.margins.top})`)

    this.path = this.plot
      .append('path')
      .attr('class', 'line')
      .attr('fill', 'none')
      .attr('stroke', 'grey')
      .attr('stroke-width', '3px')

    // axis groups
    this.xAxis = this.plot
      .append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0, ${this.height})`)
    this.yAxis = this.plot.append('g').attr('class', 'y axis')

    // y-axis label
    this.yAxisLabel = this.yAxis
      .append('text')
      .attr('class', 'axis-title')
      .attr('transform', `translate(-50, ${this.height / 2}) rotate(-90)`)
      .attr('font-size', '16px')
      .style('text-anchor', 'middle')
      .attr('fill', '#5D6971')

    // scales
    this.x = d3.scaleTime().range([0, this.width])
    this.y = d3.scaleLinear().range([this.height, 0])
  }

  update(data, metric, dateRange) {
    // clean data
    const cleanData = data
      .filter(d => d.date && d[metric])
      .map(d => ({
        date: parseTime(d.date),
        value: Number(d[metric]),
      }))

    // apply date range
    this.rangedData = cleanData
    if (dateRange) {
      this.rangedData = cleanData.filter(
        d => d.date >= dateRange[0] && d.date <= dateRange[1],
      )
    }

    this.yAxisLabel
      .transition(d3.transition().duration(300))
      .text(`${metricsMap[metric]} ($)`)

    // set scale domains
    this.x.domain(d3.extent(this.rangedData, d => d.date))
    this.y.domain([0, d3.max(this.rangedData, d => d.value) * 1.005])

    // generate axes once scales have been set
    this.xAxis
      .transition(d3.transition().duration(300))
      .call(xAxisFn.scale(this.x))
    this.yAxis
      .transition(d3.transition().duration(300))
      .call(yAxisFn.scale(this.y))

    // add line to chart
    // line path generator
    const line = d3
      .line()
      .x(d => this.x(d.date))
      .y(d => this.y(d.value))

    this.path
      .transition(d3.transition().duration(300))
      .attr('d', line(this.rangedData))

    // tooltip
    this.focus = this.plot
      .append('g')
      .attr('class', 'focus')
      .style('display', 'none')

    this.focus
      .append('line')
      .attr('class', 'x-hover-line hover-line')
      .attr('y1', 0)
      .attr('y2', this.height)

    this.focus
      .append('line')
      .attr('class', 'y-hover-line hover-line')
      .attr('x1', 0)
      .attr('x2', this.width)

    this.focus.append('circle').attr('r', 7.5)

    this.plot
      .append('text')
      .attr('text-anchor', 'end')
      .attr('x', 50)
      .attr('dy', '.31em')
      .attr('class', 'tip-value')

    // overlay
    this.plot
      .append('rect')
      .attr('class', 'overlay')
      .attr('width', this.width)
      .attr('height', this.height)
      .on('mouseover', () => {
        this.focus.style('display', null)
        this.plot.select('text.tip-value').style('display', null)
      })
      .on('mouseout', () => {
        this.focus.style('display', 'none')
        this.plot.select('text.tip-value').style('display', 'none')
      })
      .on('mousemove', e => {
        this.mousemove(e)
      })
  }

  mousemove(event) {
    const x0 = this.x.invert(d3.pointer(event)[0])
    const i = bisectDate(this.rangedData, x0, 1)
    const d0 = this.rangedData[i - 1]
    const d1 = this.rangedData[i]
    const d = x0 - d0.date > d1.date - x0 ? d1 : d0
    this.focus.attr(
      'transform',
      `translate(${this.x(d.date)}, ${this.y(d.value)})`,
    )
    this.plot
      .select('text.tip-value')
      .attr('y', this.y(d.value) - 15)
      .text(formatAbbreviation(d.value))
    this.focus.select('.x-hover-line').attr('y2', this.height - this.y(d.value))
    this.focus.select('.y-hover-line').attr('x2', -this.x(d.date))
  }
}
