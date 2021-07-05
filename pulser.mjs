import EventEmitter from 'events';

export class Pulser extends EventEmitter {
  start() {
    setInterval(() => {
      console.log(`${new Date().toISOString()} >>>> pulse`);
      // "this" refers to the Pulser object because of the arrow function. Pre-ES2015, it would have referred to setInterval.
      this.emit('pulse');
      console.log(`${new Date().toISOString()} <<<< pulse`);
    }, 1000);
  }
}
