const { AhungryProfiler } = require('../index')
const { HelloWorld } = require('./HelloWorld')

void async function main () {
  const ap = new AhungryProfiler('AppProfile')
  ap.init(module)

  const hw = new HelloWorld()
  HelloWorld.blub()
  await hw.flub('Greetings') // make async to simulate a delay
  HelloWorld.blub()
  HelloWorld.blub()
  HelloWorld.blub()
  await hw.flub('Greetings') // make async to simulate a delay
  HelloWorld.blub()
  HelloWorld.blub()

  console.log(ap.fin())
}()
