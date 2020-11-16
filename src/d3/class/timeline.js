import * as d3 from 'd3'

const parseTime = d3.timeParse('%d/%m/%Y')

export default class TimeLine {
  static async readData(uri) {
    return await d3.json(uri)
  }

  constructor(selector, { width, height, margins }, callbacks) {
    this.selector = selector
    this.margins = margins
    this.width = width - this.margins.left - this.margins.right
    this.height = height - this.margins.top - this.margins.bottom
    this.callbacks = callbacks

    this.drawCanvas()
  }

  drawCanvas() {
    this.svg = d3
      .select(this.selector)
      .append('svg')
      .attr('width', this.width + this.margins.left + this.margins.right)
      .attr('height', this.height + this.margins.top + this.margins.bottom)

    this.plot = this.svg
      .append('g')
      .attr('transform', `translate(${this.margins.left}, ${this.margins.top})`)

    // scales
    this.x = d3.scaleTime().range([0, this.width])
    this.y = d3.scaleLinear().range([this.height, 0])

    // x-axis
    this.xAxisFn = d3.axisBottom().ticks(4)
    this.xAxis = this.plot
      .append('g')
      .attr('transform', `translate(0, ${this.height})`)

    // brush
    this.brushFn = d3
      .brushX()
      .handleSize(10)
      .extent([
        [0, 0],
        [this.width, this.height],
      ])
      .on('brush', e => {
        this.onBrush(e)
      })
    this.brush = this.plot.append('g').call(this.brushFn)

    // area plot
    this.areaPath = this.plot.append('path').attr('fill', 'gray')
  }

  resetBrush() {
    this.brush.remove()
    this.brush = this.plot.append('g').call(this.brushFn)
  }

  update(data, property) {
    const cleanData = data
      .filter(d => d.date && d[property])
      .map(d => ({
        date: parseTime(d.date),
        value: Number(d[property]),
      }))

    // update scales
    this.x.domain(d3.extent(cleanData, d => d.date))
    this.y.domain([0, d3.max(cleanData, d => d.value) * 1.005])

    // update x-axis
    this.xAxisFn.scale(this.x)
    this.xAxis.transition(d3.transition().duration(300)).call(this.xAxisFn)

    // update area plot
    const area = d3
      .area()
      .x(d => this.x(d.date))
      .y0(this.height)
      .y1(d => this.y(d.value))

    this.areaPath
      .data([cleanData])
      .transition(d3.transition().duration(300))
      .attr('d', area)
  }

  onBrush(evt) {
    const startDate = this.x.invert(evt.selection[0])
    const endDate = this.x.invert(evt.selection[1])
    this.callbacks.onBrush([startDate, endDate])
  }
}
