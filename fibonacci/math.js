exports.fibonacci = n => {
  if (n === 0) {
    return 0;
  } else if (n === 1 || n === 2) {
    return 1;
  }

  return exports.fibonacci(n-1) + exports.fibonacci(n-2);
}
