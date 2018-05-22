# Ahungry Profiler

Project page:

https://github.com/ahungry/ahungry-profiler

A nodejs library for easily and recursively wrapping an entire
codebase in a profiler to measure function execution time, without
requiring complicated instrumenting using nodejs --prof or nodejs
--prof-process (or manually instrumenting each function call).

Makes use of ahungry-around for easily binding the profile function to
each module/function recursively.

# Goal

To achieve useful (beginner readable) profiling in a few seconds for
an entire codebase.

# Usage

See a sample in tests/test.js:

```js
const { AhungryProfiler } = require('../index')
const { HelloWorld } = require('./HelloWorld')

void async function main () {
  const ap = new AhungryProfiler('AppProfile')
  ap.init(module)

  const hw = new HelloWorld()
  await hw.flub('Greetings') // make async to simulate a delay
  HelloWorld.blub()

  console.log(ap.fin())
}()
```

Which will produce output as such:

```sh
$ node ./tests/test.js
Sleeping for a half of a second...
Sleeping for a third of a second...
Greetings
blub
AppProfile
▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇  [844ms] - AppProfile
▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇  [844ms] - flub ["Greetings"]
                              ▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇  [335ms] - slowLog ["Greetings"]
                                                  ▇  [0ms] - blub []
                                                  ▇  [0ms] - log ["blub"]
                                                  ▇  [NOT_END] - fin []

```


# License

GPLv3
