import * as d3 from 'd3'

export default class Donut {
  constructor(selector, { width, height, innerRadius, outerRadius }, colorMap) {
    const svg = d3
      .select(selector)
      .append('svg')
      .attr('width', width)
      .attr('height', height)

    this.plot = svg
      .append('g')
      .attr('transform', `translate(${outerRadius * 1.005}, ${height / 2})`)

    this.innerRadius = innerRadius
    this.outerRadius = outerRadius
    this.parseDate = d3.timeParse('%d/%m/%Y')
    this.colorMap = colorMap

    // legend
    const legend = this.plot
      .append('g')
      .attr('transform', `translate(${outerRadius * 1.005 + 15}, -35)`)

    Array.from(colorMap.keys()).forEach((k, i) => {
      const legendRow = legend.append('g')

      legendRow
        .append('rect')
        .attr('x', 0)
        .attr('y', 30 * i)
        .attr('width', 10)
        .attr('height', 10)
        .attr('fill', colorMap.get(k))

      legendRow
        .append('text')
        .attr('font-size', '15px')
        .attr('x', 15)
        .attr('y', 30 * i + 10)
        .style('text-transform', 'capitalize')
        .text(k)
    })
  }

  update(data, metric) {
    const arc = d3
      .arc()
      .innerRadius(this.innerRadius)
      .outerRadius(this.outerRadius)

    const pie = d3
      .pie()
      .value(d => d[metric])
      .sort(null)

    const path = this.plot.selectAll('path').data(pie(data))

    function arcTween(d) {
      const i = d3.interpolate(this._current, d)
      this._current = d
      return t => arc(i(t))
    }

    path
      .transition()
      .duration(200)
      .attrTween('d', arcTween)

    path
      .enter()
      .append('path')
      .attr('fill', d => this.colorMap.get(d.data.size))
      .attr('d', arc)
      .attr('stroke', 'white')
      .attr('stroke-width', '6px')
      .each(function(d) {
        this._current = d
      })
  }
}
