import * as schedule from 'node-schedule';
import { pushAllRoutes } from './src/services/RouteService';

let counter = 1;

const job = async () => {
  const apiCallStartTime = new Date().getTime();
  await pushAllRoutes();
  const apiCallEndTime = new Date().getTime();
  console.log(
    `Time taken for response - iteration ${counter}: ${apiCallEndTime -
      apiCallStartTime}ms`
  );
  counter += 1;
};

// schedule.scheduleJob('*/1 * * * *', async function() {
//   await job();
// });
job();
