import * as d3 from 'd3'

export default class Bar {
  constructor(selector, { width, height, margins }) {
    const svg = d3
      .select(selector)
      .append('svg')
      .attr('width', width)
      .attr('height', height)

    this.plotWidth = width - margins.left - margins.right
    this.plotHeight = height - margins.top - margins.bottom

    this.plot = svg
      .append('g')
      .attr('width', this.plotWidth)
      .attr('height', this.plotHeight)
      .attr('transform', `translate(${margins.left}, ${margins.top})`)

    // scales
    this.x = d3
      .scaleBand()
      .range([0, this.plotWidth])
      .paddingInner(0.3)
      .paddingOuter(0.3)
    this.y = d3.scaleLinear().range([this.plotHeight, 0])

    // x-axis
    this.xAxisFn = d3.axisBottom()
    this.xAxis = this.plot
      .append('g')
      .attr('transform', `translate(0, ${this.plotHeight})`)

    // y-axis
    this.yAxisFn = d3.axisLeft().ticks(3)
    this.yAxis = this.plot.append('g')
  }

  // data shape:
  // [{ [key]: string, value: number }]
  update(data, key) {
    // update scales
    this.x.domain(data.map(d => d[key]))
    this.y.domain([0, d3.max(data, d => d.value) * 1.1])

    // update axes
    this.xAxisFn.scale(this.x)
    this.yAxisFn.scale(this.y)
    this.xAxis.call(this.xAxisFn)
    this.yAxis.call(this.yAxisFn)

    // join
    const bars = this.plot.selectAll('rect').data(data)

    // exit
    bars.exit().remove()

    // enter / update
    bars
      .enter()
      .append('rect')
      .attr('fill', 'cadetblue')
      .merge(bars)
      .attr('x', d => this.x(d[key]))
      .attr('y', d => this.plotHeight - this.y(d.value))
      .attr('width', this.x.bandwidth())
      .attr('height', d => this.y(d.value))
  }
}
