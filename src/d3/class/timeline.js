import * as d3 from 'd3'
export default class TimeLine {
  static async readData(uri) {
    return await d3.json(uri)
  }

  static parseDate(format, date) {
    return d3.timeParse(format)(date)
  }

  constructor(
    selector,
    { width, height, margins, brushMin, brushMax },
    callbacks,
  ) {
    this.selector = selector
    this.margins = margins
    this.width = width - this.margins.left - this.margins.right
    this.height = height - this.margins.top - this.margins.bottom
    this.brushMin = brushMin
    this.brushMax = brushMax
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

    // area plot
    this.areaPath = this.plot.append('path').attr('fill', 'gray')

    // brush -- necessary to append AFTER the path for proper overlay behavior
    this.brushFn = d3
      .brushX()
      .handleSize(10)
      .extent([
        [0, 0],
        [this.width, this.height],
      ])
      .on('end', e => {
        if (!e.selection) {
          this.callbacks.onBrush(null)
          return
        }

        // enforce min and max brush widths
        const brushCenter =
          e.selection[0] + 0.5 * (e.selection[1] - e.selection[0])
        if (e.selection[1] - e.selection[0] < this.brushMin) {
          this.brush
            .transition()
            .duration(400)
            .call(this.brushFn.move, [
              brushCenter - 0.49 * this.brushMin,
              brushCenter + 0.49 * this.brushMin,
            ])
        } else if (e.selection[1] - e.selection[0] > this.brushMax) {
          this.brush
            .transition()
            .duration(400)
            .call(this.brushFn.move, [
              brushCenter - 0.49 * this.brushMax,
              brushCenter + 0.49 * this.brushMax,
            ])
        }
        this.onBrush(e)
      })
    this.brush = this.plot.append('g').call(this.brushFn)
  }

  resetBrush() {
    this.brush.remove()
    this.brush = this.plot.append('g').call(this.brushFn)
  }

  update(data) {
    // update scales
    this.x.domain(d3.extent(data, d => d.date))
    this.y.domain([0, d3.max(data, d => d.value)])

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
      .data([data])
      .transition(d3.transition().duration(300))
      .attr('d', area)
  }

  onBrush(evt) {
    const startDate = this.x.invert(evt.selection[0])
    const endDate = this.x.invert(evt.selection[1])
    this.callbacks.onBrush([startDate, endDate])
  }
}
