(async function() {
  const simple2 = await import('./simple2.mjs');

  function simpleFn() {
    console.log(simple2.hello());
    console.log(simple2.next());
    console.log(simple2.next());
    console.log(`count = ${simple2.default()}`);
    console.log(`Meaning: ${simple2.meaning}`);
  }

  simpleFn();
})()
  .catch(err => { console.error(err); });


