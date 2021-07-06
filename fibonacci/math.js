exports.fibonacci = n => {
  if (n === 0) {
    return 0;
  } else if (n === 1 || n === 2) {
    return 1;
  }

  return exports.fibonacci(n-1) + exports.fibonacci(n-2);
}

// A faster implementation of fibonacci
exports.fibonacciLoop = n => {
  const fibos = [];

  fibos[0] = 0;
  fibos[1] = 1;
  fibos[2] = 1;

  for (let i = 3; i <= n; i++) {
    fibos[i] = fibos[i-2] + fibos[i-1];
  }

  return fibos[n];
}

module.exports.fibonacciAsync = (n, done) => {
  if (n === 0) {
    done(undefined, 0);
  } else if (n === 1 || n === 2) {
    done(undefined, 1);
  } else {
    setImmediate(() => {
      exports.fibonacciAsync(n-1, (error, value1) =>{
        if (error) {
          done(error);
        } else {
          setImmediate(() => {
            exports.fibonacciAsync(n-2, (error, value2) => {
              if (error) {
                done(error);
              } else {
                done(undefined, value1 + value2);
              }
            })
          })
        }
      })
    })
  }
}
