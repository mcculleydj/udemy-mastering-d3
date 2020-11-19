import * as d3 from 'd3'

const parseDate = d3.timeParse('%d/%m/%Y')

export function cleanData(data, metric, keys) {
  return data.map(d => ({
    date: parseDate(d.date),
    value: keys.reduce((sum, k) => sum + d[k][metric], 0),
  }))
}

export function findMaxSums(data, keys) {
  const maxSums = {
    call_revenue: 0,
    call_duration: 0,
    units_sold: 0,
  }
  data.forEach(d => {
    const sums = {
      call_revenue: 0,
      call_duration: 0,
      units_sold: 0,
    }

    keys.forEach(k => {
      sums.call_revenue += d[k].call_revenue
      sums.call_duration += d[k].call_duration
      sums.units_sold += d[k].units_sold
    })

    Object.keys(sums).forEach(k => {
      if (maxSums[k] < sums[k]) maxSums[k] = sums[k]
    })
  })
  return maxSums
}

export function determineAverages(data, dateRange) {
  const parseDate = d3.timeParse('%d/%m/%Y')
  let rangedData = data
  if (dateRange) {
    rangedData = data.filter(
      d =>
        parseDate(d.date) >= dateRange[0] && parseDate(d.date) <= dateRange[1],
    )
  }
  // electronics, furniture, appliances, materials
  const acc = {
    units: {
      electronics: {
        total: 0,
        count: 0,
      },
      furniture: {
        total: 0,
        count: 0,
      },
      appliances: {
        total: 0,
        count: 0,
      },
      materials: {
        total: 0,
        count: 0,
      },
    },
    duration: {
      electronics: {
        total: 0,
        count: 0,
      },
      furniture: {
        total: 0,
        count: 0,
      },
      appliances: {
        total: 0,
        count: 0,
      },
      materials: {
        total: 0,
        count: 0,
      },
    },
    revenue: {
      electronics: {
        total: 0,
        count: 0,
      },
      furniture: {
        total: 0,
        count: 0,
      },
      appliances: {
        total: 0,
        count: 0,
      },
      materials: {
        total: 0,
        count: 0,
      },
    },
  }
  rangedData.forEach(d => {
    acc.units[d.category].total += d.units_sold
    acc.units[d.category].count++
    acc.duration[d.category].total += d.call_duration
    acc.duration[d.category].count++
    acc.revenue[d.category].total += d.call_revenue
    acc.revenue[d.category].count++
  })
  const averages = {
    units: [],
    duration: [],
    revenue: [],
  }
  Object.keys(acc).forEach(metric => {
    Object.keys(acc[metric]).forEach(category => {
      averages[metric].push({
        category: category[0].toUpperCase() + category.slice(1),
        value: acc[metric][category].count
          ? acc[metric][category].total / acc[metric][category].count
          : 0,
      })
    })
  })
  return averages
}

export function aggregateOnDate(data) {
  const map = d3.rollup(
    data,
    values =>
      values.reduce(
        (acc, v) => ({
          call_revenue: acc.call_revenue + v.call_revenue,
          call_duration: acc.call_duration + v.call_duration,
          units_sold: acc.units_sold + v.units_sold,
        }),
        {
          call_revenue: 0,
          call_duration: 0,
          units_sold: 0,
        },
      ),
    d => d.date,
    d => d.team,
  )
  const ret = []
  for (let [date, values] of map) {
    const obj = { date }
    for (let [team, metricValues] of values) {
      obj[team] = metricValues
    }
    ret.push(obj)
  }
  return ret
}

export function aggregateOnCompanySize(data, dateRange) {
  const parseDate = d3.timeParse('%d/%m/%Y')
  let rangedData = data
  if (dateRange) {
    rangedData = data.filter(
      d =>
        parseDate(d.date) >= dateRange[0] && parseDate(d.date) <= dateRange[1],
    )
  }
  const counts = {
    small: 0,
    medium: 0,
    large: 0,
  }
  rangedData.forEach(d => {
    if (d.company_size === 'small') {
      counts.small++
    } else if (d.company_size === 'medium') {
      counts.medium++
    } else {
      counts.large++
    }
  })
  return [
    { size: 'small', count: counts.small },
    { size: 'medium', count: counts.medium },
    { size: 'large', count: counts.large },
  ]
}
