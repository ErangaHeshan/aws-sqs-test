import { forEach, groupBy, map, get } from 'lodash';
import { getAllJobs } from '../repositories/TelogisRepository';
import {
  pushRoutes,
  receiveMessageBatch,
  deleteMessageBatch
} from '../repositories/AWSRepository';
import { WHITELIST_OPCO_IDS, ROUTE_STATUS } from '../utils/constants';
const fromDate = '2018-08-23';
const routeStatus = `${ROUTE_STATUS.NOT_STARTED},${ROUTE_STATUS.IN_PROGRESS},${
  ROUTE_STATUS.COMPLETE
}`;

export const pushAllRoutes = async () => {
  let responsePromises = [];
  forEach(WHITELIST_OPCO_IDS, opcoId => {
    responsePromises.push(pushRoutesOfSingleOpco(opcoId));
  });
  await Promise.all(responsePromises);
};

export const pushRoutesOfSingleOpco = async opcoId => {
  return getAllJobs({ opcoId, fromDate, routeStatus })
    .then(async jobs => {
      return generateRoutes(jobs);
    })
    .then(async routes => {
      return pushRoutes(routes);
    });
};

export const generateRoutes = async jobs => {
  const groupedRouteObject = groupBy(jobs, job => job.RouteId);
  const groupedRouteArray = map(groupedRouteObject, (value, key) => {
    // TODO
    // remove random property from route object
    return { routeId: key, jobs: value, random: Math.random() };
  });
  return groupedRouteArray;
};

export const consumeThenDeleteRoutes = async () => {
  const receiveResponse = await receiveMessageBatch();
  console.log(
    `consumeThenDeleteRoutes: Received messages response: ${JSON.stringify(
      receiveResponse
    )}`
  );
  const receiptHandleBatch = [];
  forEach(get(receiveResponse, 'Messages'), message => {
    receiptHandleBatch.push(message.ReceiptHandle);
  });
  console.log(
    `consumeThenDeleteRoutes: Deleting messages related to receiptHandleBatch: ${receiptHandleBatch}`
  );
  try {
    await deleteMessageBatch(receiptHandleBatch, 1);
    console.log(
      `consumeThenDeleteRoutes: Deleted messages related to receiptHandleBatch: ${receiptHandleBatch}`
    );
  } catch (error) {
    console.error(`consumeThenDeleteRoutes: ${error.stack}`);
  }
};
