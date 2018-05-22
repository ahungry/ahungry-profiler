const TimeProfile = require('time-profile')
const { AhungryAround } = require('ahungry-around')

class Profiler {
  constructor () {
    this.map = {}
    this.unix = this.unix.bind(this)
    this.start = this.start.bind(this)
    this.end = this.end.bind(this)
  }

  unix () {
    return new Date().getTime()
  }

  start (key) {
    this.map[key] = {
      start: this.unix(),
      end: undefined,
    }
  }

  end (key) {
    this.map[key].end = this.unix()
  }

  toString () {
    return JSON.stringify(this.map)
  }
}

// Profile an entire app with minimal effort.
class AhungryProfiler {
  // handler should be an appropriate Proxy handler.
  constructor (desc) {
    this.desc = desc || 'DefaultAhungryProfiler'
    this.profiler = new TimeProfile()
    // this.profiler = new Profiler()

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
