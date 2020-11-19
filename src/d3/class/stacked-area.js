import * as d3 from 'd3'

export default class StackedArea {
  static async readData(uri) {
    return await d3.json(uri)
  }

  constructor(selector, { width, height, margins }, colorMap) {
    this.selector = selector
    this.margins = margins
    this.width = width
    this.height = height
    this.plotWidth = width - this.margins.left - this.margins.right
    this.plotHeight = height - this.margins.top - this.margins.bottom
    this.colorMap = colorMap
    this.parseDate = d3.timeParse('%d/%m/%Y')
    this.stack = d3.stack().keys(colorMap.keys())

    this.drawCanvas()
  }

  drawCanvas() {
    this.svg = d3
      .select(this.selector)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)

    this.plot = this.svg
      .append('g')
      .attr('width', this.plotWidth)
      .attr('height', this.plotHeight)
      .attr('transform', `translate(${this.margins.left}, ${this.margins.top})`)

    // scales
    this.x = d3.scaleTime().range([0, this.plotWidth])
    this.y = d3.scaleLinear().range([this.plotHeight, 0])

    // path generator
    // scales will be evaluated on the fly
    this.area = d3
      .area()
      .x(d => this.x(this.parseDate(d.data.date)))
      .y0(d => this.y(d[0]))
      .y1(d => this.y(d[1]))

    // x-axis
    this.xAxisFn = d3.axisBottom().ticks(4)
    this.xAxis = this.plot
      .append('g')
      .attr('transform', `translate(0, ${this.plotHeight})`)

    // y-axis
    this.yAxisFn = d3.axisLeft().ticks(5)
    this.yAxis = this.plot.append('g')

    // plot
    this.areaPath = this.plot.append('path').attr('fill', 'gray')
  }

  update(data, metric, yMax, dateRange) {
    // apply date range
    let rangedData = data
    if (dateRange) {
      rangedData = data.filter(
        d =>
          this.parseDate(d.date) >= dateRange[0] &&
          this.parseDate(d.date) <= dateRange[1],
      )
    }

    // update domains
    this.x.domain(d3.extent(rangedData, d => this.parseDate(d.date)))
    this.y.domain([0, yMax])

    // update axes
    this.xAxisFn.scale(this.x)
    this.xAxis.call(this.xAxisFn)
    this.yAxisFn.scale(this.y)
    this.yAxis.call(this.yAxisFn)

    // update stack
    this.stack.value((d, key) => d[key][metric])

    // this.teams is a D3 selection
    this.teams = this.plot.selectAll('.team').data(this.stack(rangedData))

    // update the path for each team
    this.teams.select('.area').attr('d', this.area)

    this.teams
      .enter()
      .append('g')
      .attr('class', d => `team ${d.key}`)
      .append('path')
      .attr('class', 'area')
      .attr('d', this.area)
      .attr('fill', d => this.colorMap.get(d.key))
      .attr('fill-opacity', 0.5)
  }
}
