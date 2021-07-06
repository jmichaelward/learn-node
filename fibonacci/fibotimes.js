const math = require('./math');

// Previous loop example...
// for ( let num = 1; num < 8000; num++) {
//   let now = new Date().toISOString();
//   console.log(`${now} Fibonacci for ${num} = ${math.fibonacciLoop(num)}`);
// }

// New async example
(async () => {
  for (let num = 1; num < 8000; num++) {
    await new Promise((resolve, reject) => {
      math.fibonacciAsync(num, (error, fibonacci) => {
        if (error) {
          reject(error)
        } else {
          let now = new Date().toISOString()
          console.log(`${now} Fibonacci for ${num} = ${fibonacci}`)
          resolve()
        }
      })
    })
  }
});
