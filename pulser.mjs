import EventEmitter from 'events';

export class Pulser extends EventEmitter {
  start() {
    setInterval(() => {
      const startPulse = `${new Date().toISOString()} >>>> pulse started.`;
      // "this"refers to the Pulser object because of the arrow function. Pre-ES2015, it would have referred to setInterval.
      this.emit('pulse', startPulse);
      console.log(`${new Date().toISOString()} <<<< pulse`);
    }, 1000);
  }
}
