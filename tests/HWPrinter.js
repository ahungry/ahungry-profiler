class Printer {
  async slowLog (msg) {
    const p = new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log('Sleeping for a third of a second...')
        resolve()
      }, 333)
    })

    await p

    return console.log(msg)
  }

  log (msg) {
    return console.log(msg)
  }
}

module.exports = { Printer }
