import { Pulser } from './pulser.mjs';

// Instantiate a Pulser object
const pulser = new Pulser();

// Event handler function
pulser.on('pulse', (pulseStarted) => {
  console.log(pulseStarted)
  console.log(`${new Date().toISOString()} pulse received`);
});

pulser.start();
