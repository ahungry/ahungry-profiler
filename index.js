const { AhungryAround } = require('ahungry-around')

class Profiler {
  constructor () {
    this.metric = {} // object of arrays of time metric objects
    this.unix = this.unix.bind(this)
    this.start = this.start.bind(this)
    this.end = this.end.bind(this)
  }

  unix () {
    return new Date().getTime()
  }

  start (key) {
    if (this.metric[key] === undefined) {
      this.metric[key] = []
    }

    this.metric[key].push({
      start: this.unix(),
      end: undefined,
    })
  }

  end (key) {
    // Snag last one and update the end time.
    this.metric[key].slice(-1)[0].end = this.unix()
  }

  report (sortKey = 'percent') {
    let stats = []

    // Iterate our items.
    Object.keys(this.metric).map((key) => {
      const measures = this.metric[key]
      // Close out any loose ends (if we're running the report, we can assume at point-in-time the things are done)
      measures.map(m => m.end = m.end || this.unix())
      measures.map(m => m.diff = m.end - m.start)

      const total = measures.length
      const fastest = measures[0].diff
      const slowest = measures[0].diff
      const sum = measures.map(m => m.diff).reduce((acc, cur) => acc + cur)
      const average = sum / total

      stats.push({ key, total, fastest, slowest, sum, average })
    })

    // Build some overall metrics (we don't want 0th, as that is usually our entire app wrapper).
    const overall = stats.slice(1).map(s => s.sum).reduce((acc, cur) => acc + cur)
    const percent = stats.map(s => s.percent = s.sum / overall * 100)
    stats[0].percent = 100

    // Now, sort the stats by time spent in each area,
    // after popping off first and last (AppProfile + fin).
    stats = stats.slice(1, -1)
    stats = stats.sort((a, b) => a[sortKey] > b[sortKey] ? -1 : 1)

    return stats
  }

  toString () {
    return JSON.stringify(this.report(), null, 2)
  }
}

// Profile an entire app with minimal effort.
class AhungryProfiler {
  // handler should be an appropriate Proxy handler.
  constructor (desc) {
    this.desc = desc || 'DefaultAhungryProfiler'
    this.profiler = new Profiler()

    // Ensure all maps/callbacks work with proper binding.
    this.handler = this.handler.bind(this)
    this.init = this.init.bind(this)
  }

  handler () {
    return {
      apply: (target, thisArg, argumentsList) => {
        const key = `${target.name} ${JSON.stringify(argumentsList)}`

        this.profiler.start(key)
        const result = target.apply(thisArg, argumentsList)

        // Have to handle how promises will work, joy.
        if (typeof result === 'object' && typeof result.then === 'function') {
          return result.then((response) => {
            this.profiler.end(key)

            return response
          })
        }

        this.profiler.end(key)

        return result
      }
    }
  }

  init (module) {
    const aa = new AhungryAround(this.handler(), 'AP::ProfilerHandler')
    this.profiler.start(this.desc)
    aa.handleModule(module)
  }

  fin () {
    this.profiler.end(this.desc)

    return this.profiler.toString(this.desc)
  }
}

module.exports.AhungryProfiler = AhungryProfiler
