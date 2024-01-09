const app = Vue.createApp({
  data() {
    return {
      isLoading: true,
      markets: [],
    }
  },
  async created() {
    const seedMarketIDs = [
      '', // start at most recent
      'HL2ncOlncStKpMh4RvBU',
      'SaeiwWA1c1b1ZD4DGCW2',
      'v3i75DTO82LpSmYX76Cf',
      '41evHCs2qboaXrrEYcN5',
      'MaJn8s35oLUzPbBCnTku',
      'dVADaskLqiuxAbGrlTt9',
      '8uW0BgJ6eLp0DNIggDCT',
      'tyYOZZbIbdHO3RCvWJY2',
      '5P7ZB1l6t73KnfK9PTCE',
      'FPPStEknzKb5p8V3kaJH',
      'N4eUdgv9ehX0vJe8Ezb2',
      'kqoSWKz5lvI9BLI4MvRC',
      'vEhYIiVFN2QfiCPp1fuN',
      'S6Bkd36SiuJLmiGlabNM',
      'z8ZkNpO5vt1MXesWYswj',
      'l530LFF4pKcALoOUhPSb',
      'b1YWmC9fGgcI6qvLMgJ3',
      'FdvMYnAxQv91HZ5J9EVE',
      'tWQ6DLrSaFQ8ifC1GIOj',
      'hbAuuidegoSTzOL4fI0W',
      'F7t2yRXjj0eppyFYZlsx',
      'JuyNd2nfklsBMJ8mNk1c',
      'NvVFeycOxrMBs0yVE21S',
      'rbDkCeihaEgHXdRkSS35',
      'Z75VogyccaNEWjPv1HTN',
      'Od3KCIJ0XTr7OSYGrgP3',
      'EHgzuVfLToheME9JBfOo',
      'KOY3ASOYIxc0fUgEYAxc',
      'GqZsZElfZTxQJKnmoPlm',
      'tk347URJoQTKVIiQod0C',
      'ZmvDj5L43MCjL22l9PId',
      'TbJ60QQohdwKGO37UTbZ',
      'dxv2Ia6KdokQUA6qgOIY',
      'BBoQYJAC4ZF7FpCx9nKk',
      'vZqFuHmfB0OZNmRLUER6',
      'AQPTqQbQYfYBFaiheZL4',
      'NofQeYA68lKNtnfarQ0Z',
      'yM3aZSLQp7k4ndOx5Nxt',
      'AaxXisvz4B5YCJdJMtIk',
      'tdSrsnLoNplYfUFY9Hb7',
      'C7oCKVS1Zh3Uy08awYe7',
      'sB4UQsDyGvlPjlceE65l',
      'exzKVxShLjBx7JHWyCKi',
      'FtV6c6iK81MCvbiFoIs2',
      'lbNo5hb08rTDCjIbxrmM',
      'kbQd8Qa5z8Ij9owzbmzS',
      '', // go to the end
    ]
    limit = 1000

    const getMarkets = async (before = '') => {
      const url = `https://api.manifold.markets/v0/markets?limit=${limit}&before=${before}`
      const response = await fetch(url)
      const data = await response.json()
      return data
    }

    // Helper function to remove duplicates based on ID
    const removeDuplicates = (markets) => {
      const uniqueMarkets = []
      const marketIDs = new Map()
      markets.forEach((market) => {
        if (!marketIDs.has(market.id)) {
          uniqueMarkets.push(market)
          marketIDs.set(market.id, true)
        }
      })
      return uniqueMarkets
    }

    const fetchMarkets = async (start = '', end = '') => {
      let before = start || ''
      let proceed = true

      while (proceed) {
        const data = await getMarkets(before)
        const newMarkets = data.map((market) => {
          return { ...market }
        })

        this.markets = this.markets.concat(newMarkets)
        if (newMarkets.length > 0) {
          before = newMarkets[newMarkets.length - 1].id
        }
        if (end && newMarkets.some((market) => market.id === end)) {
          // end if we've reached the end ID
          proceed = false
        }
        if (newMarkets.length !== limit) {
          // end if the reponse is shorter than the limit
          proceed = false
        }
      }
    }

    const promises = []
    for (let i = 0; i < seedMarketIDs.length - 1; i++) {
      promises.push(fetchMarkets(seedMarketIDs[i], seedMarketIDs[i + 1]))
    }
    await Promise.all(promises)
    this.markets = removeDuplicates(this.markets)

    this.markets = this.markets.map((market) => {
      const createdTime = new Date(market.createdTime)
      const closeTime = new Date(market.closeTime)
      const resolutionTime = new Date(market.resolutionTime)
      const lastUpdatedTime = new Date(market.lastUpdatedTime)
      return {
        id: market.id,
        // creator
        creatorId: market.creatorId,
        creatorUsername: market.creatorUsername,
        creatorName: market.creatorName,
        creatorAvatarUrl: market.creatorAvatarUrl,
        // times
        createdTime: createdTime,
        closeTime: closeTime,
        openDays: (closeTime - createdTime) / (1000 * 60 * 60 * 24),
        resolutionTime: resolutionTime,
        resolveDays: (resolutionTime - closeTime) / (1000 * 60 * 60 * 24),
        lastUpdatedTime: lastUpdatedTime,
        // numbers
        pool: market.pool,
        probability: market.probability,
        p: market.p,
        totalLiquidity: market.totalLiquidity,
        volume: market.volume,
        volume24Hours: market.volume24Hours,
        // other
        question: market.question,
        tags: market.tags,
        url: market.url,
        outcomeType: market.outcomeType,
        mechanism: market.mechanism,
        // resolution
        isResolved: market.isResolved,
        resolution: market.resolution,
        resolutionProbability: market.resolutionProbability,
      }
    })
    this.endOfMarketCalibrationPlot()
    this.probabilityHistogram()
    this.mechanismPie()
    this.outcomeTypePie()
    this.resolutionPie()
    this.volumeHistogram()
    this.totalLiquidityHistogram()
    this.openTimeHistogram()
    this.marketsCreatedPerUserHistogram()
  },
  methods: {
    endOfMarketCalibrationPlot() {
      const probabilities = Array.from({ length: 101 }, (_, i) => i / 100)
      const resolutions = probabilities.map((probability) => {
        const filteredMarkets = this.markets.filter(
          (market) =>
            Math.round(market.probability * 100) / 100 === probability &&
            (market.resolution === 'YES' || market.resolution === 'NO')
        )
        const averageResolution =
          filteredMarkets.reduce(
            (sum, market) => sum + (market.resolution === 'YES' ? 1 : 0),
            0
          ) / filteredMarkets.length
        return isNaN(averageResolution) ? null : averageResolution // Return null for probabilities without corresponding resolutions
      })
      const trace = {
        x: probabilities,
        y: resolutions,
        name: 'Actual Calibration',
        type: 'scatter',
        mode: 'markers',
        marker: {
          color: 'rgb(227, 119, 194)',
          size: 10,
        },
      }
      const annotation = {
        x: [0, 1],
        y: [0, 1],
        name: 'Perfect Calibration',
        type: 'lines',
        mode: 'line',
        line: {
          color: 'rgb(127, 127, 127)',
          width: 1,
        },
      }
      const layout = {
        title: 'End of Market Calibration Plot',
        xaxis: {
          title: 'Probability at Close',
          range: [0, 1],
          tickformat: ',.0%',
        },
        yaxis: {
          title: 'Average Resolution',
          range: [0, 1],
          tickformat: ',.0%',
        },
        height: 500,
        margin: { l: 60, r: 40, t: 60, b: 40 },
        showlegend: false,
      }
      const config = { responsive: true }
      Plotly.newPlot(
        'endOfMarketCalibrationPlot',
        [trace, annotation],
        layout,
        config
      )
      this.isLoading = false
    },
    probabilityHistogram() {
      const trace = {
        x: this.markets.map((market) => market.probability),
        type: 'histogram',
        xbins: { size: 0.02 },
        marker: {
          color: 'rgb(44, 160, 44)',
        },
        opacity: 0.9,
      }
      const layout = {
        title: 'Current Market Probabilities',
        xaxis: { title: 'Probability', tickformat: ',.0%' },
        yaxis: { title: 'Count' },
        height: 300,
        margin: { l: 60, r: 40, t: 60, b: 40 },
      }
      var config = { responsive: true }
      Plotly.newPlot('probabilityHistogram', [trace], layout, config)
    },
    mechanismPie() {
      var counts = {}
      for (var i = 0; i < this.markets.length; i++) {
        var mechanism = this.markets[i].mechanism.toUpperCase()
        counts[mechanism] = counts[mechanism] ? counts[mechanism] + 1 : 1
      }
      const trace = {
        labels: Object.keys(counts),
        values: Object.values(counts),
        type: 'pie',
        opacity: 0.9,
      }
      const layout = {
        title: 'Mechanisms',
        height: 300,
        margin: { l: 30, r: 30, t: 50, b: 30 },
      }
      var config = { responsive: true }
      Plotly.newPlot('mechanismPie', [trace], layout, config)
    },
    outcomeTypePie() {
      var counts = {}
      for (var i = 0; i < this.markets.length; i++) {
        var outcomeType = this.markets[i].outcomeType
        counts[outcomeType] = counts[outcomeType] ? counts[outcomeType] + 1 : 1
      }
      const trace = {
        labels: Object.keys(counts),
        values: Object.values(counts),
        type: 'pie',
        opacity: 0.9,
      }
      const layout = {
        title: 'Outcome Types',
        height: 300,
        margin: { l: 30, r: 30, t: 50, b: 30 },
      }
      var config = { responsive: true }
      Plotly.newPlot('outcomeTypePie', [trace], layout, config)
    },
    resolutionPie() {
      var counts = {}
      for (var i = 0; i < this.markets.length; i++) {
        var resolution = this.markets[i].resolution
        if (['YES', 'NO', 'CANCEL', 'MKT'].includes(resolution)) {
          counts[resolution] = counts[resolution] ? counts[resolution] + 1 : 1
        }
      }
      const trace = {
        labels: Object.keys(counts),
        values: Object.values(counts),
        type: 'pie',
        opacity: 0.9,
      }
      const layout = {
        title: 'Resolutions',
        height: 300,
        margin: { l: 30, r: 30, t: 50, b: 30 },
      }
      var config = { responsive: true }
      Plotly.newPlot('resolutionPie', [trace], layout, config)
    },
    volumeHistogram() {
      const trace = {
        x: this.markets
          .map((market) => market.volume)
          .filter((volume) => volume < 1000000),
        type: 'histogram',
        xbins: { size: 100 },
        marker: {
          color: 'rgb(148, 103, 189)',
        },
        opacity: 0.9,
      }
      const layout = {
        title: 'Current Market Volume',
        xaxis: { title: 'Volume', range: [0, 10000] },
        yaxis: { title: 'Count' },
        height: 300,
        margin: { l: 60, r: 40, t: 60, b: 40 },
      }
      var config = { responsive: true }
      Plotly.newPlot('volumeHistogram', [trace], layout, config)
    },
    totalLiquidityHistogram() {
      const trace = {
        x: this.markets.map((market) => market.totalLiquidity),
        type: 'histogram',
        xbins: { size: 20 },
        marker: {
          color: 'rgb(214, 39, 40)',
        },
        opacity: 0.9,
      }
      const layout = {
        title: 'Current Market Liquidities',
        xaxis: { title: 'Liquidity', range: [0, 2500] },
        yaxis: { title: 'Count' },
        height: 300,
        margin: { l: 60, r: 40, t: 60, b: 40 },
      }
      var config = { responsive: true }
      Plotly.newPlot('totalLiquidityHistogram', [trace], layout, config)
    },
    openTimeHistogram() {
      const trace = {
        x: this.markets
          .map((market) => market.openDays)
          .filter((openDays) => openDays < 200 * 365)
          .filter((openDays) => openDays >= 0),
        type: 'histogram',
        xbins: { size: 15 },
        marker: {
          color: 'rgb(140, 86, 75)',
        },
        opacity: 0.9,
      }
      const layout = {
        title: 'Market Open Lengths',
        xaxis: { title: 'Days', range: [0, 365 * 5] },
        yaxis: { title: 'Count' },
        height: 300,
        margin: { l: 60, r: 40, t: 60, b: 40 },
      }
      var config = { responsive: true }
      Plotly.newPlot('openTimeHistogram', [trace], layout, config)
    },
    marketsCreatedPerUserHistogram() {
      const counts = {}
      this.markets.forEach((market) => {
        const creatorId = market.creatorId
        counts[creatorId] = counts[creatorId] ? counts[creatorId] + 1 : 1
      })
      const trace = {
        x: Object.values(counts),
        type: 'histogram',
        xbins: { size: 2 },
        marker: {
          color: 'rgb(227, 119, 194)',
        },
        opacity: 0.9,
      }
      const layout = {
        title: 'Markets Created per User',
        xaxis: { title: 'Markets', range: [0, 400] },
        yaxis: { title: 'Count' },
        height: 300,
        margin: { l: 60, r: 40, t: 60, b: 40 },
      }
      var config = { responsive: true }
      Plotly.newPlot('marketsCreatedPerUserHistogram', [trace], layout, config)
    },
  },
})
app.mount('#app')

/*
COLORS:
  blue    rgb(31, 119, 180)
  orange  rgb(255, 127, 14)
  green   rgb(44, 160, 44)
  red     rgb(214, 39, 40)
  purple  rgb(148, 103, 189)
  brown   rgb(140, 86, 75)
  pink    rgb(227, 119, 194)
  gray    rgb(127, 127, 127)
  puke    rgb(188, 189, 34)
  teal    rgb(23, 190, 207)
*/
