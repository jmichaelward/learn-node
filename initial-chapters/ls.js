#!/usr/bin/env node

const fs = require('fs').promises;

(async () => {
  var dir = '.';
  if (process.argv[2]) dir = process.argv[2];
  const files = await fs.readdir(dir);
  for (let filename of files) {
    console.log(filename);
  }
})().catch(err => { console.error(err); });
