const { Printer } = require('./HWPrinter')
const myPrinter = new Printer()

class HelloWorld {
  static blub () {
    myPrinter.log('blub')
  }

  async flub (msg) {
    const p = new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log('Sleeping for a half of a second...')
        resolve()
      }, 500)
    })

    await p

    await myPrinter.slowLog(msg)
  }
}

module.exports = { HelloWorld }
