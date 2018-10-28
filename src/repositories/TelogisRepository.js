import { invokeTelogisEndpoint } from './api/TelogisApi';
import { stringify } from '../utils/textParser';

export const getAllJobs = async ({ opcoId, fromDate, routeStatus }) => {
  const jobResponse = await invokeTelogisEndpoint(
    `template=Job_Retrieve_All_CX_SD&opco=${opcoId}&from=${fromDate}&routeStatuses=${routeStatus}`
  );
  console.log(
    `TelogisRepositoy { opcoId: ${opcoId}, fromDate: ${fromDate}, routeStatus: ${routeStatus} } getAllJobs: ${stringify(
      jobResponse.Job_Retrieve_All_CX_SD.TableEntry
    )}`
  );
  return jobResponse.Job_Retrieve_All_CX_SD.TableEntry;
};
