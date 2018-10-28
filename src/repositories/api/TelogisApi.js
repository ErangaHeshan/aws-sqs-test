import fetch from 'node-fetch';

const TELOGIS_AUTHENTICATION_FAILURE = `Telogis authentication failure`;
const TELOGIS_API_INVOCATION_FAILURE = `Telogis API invocation failure`;
const TELOGIS_URL =
  process.env.TELOGIS_URL || `https://sysco.api.telogis.com/execute`;
const TELOGIS_AUTH_URL =
  process.env.TELOGIS_AUTH_URL ||
  'https://sysco.api.telogis.com/rest/login/sysco';
const TELOGIS_REQUEST_TIMEOUT_MS =
  process.env.TELOGIS_REQUEST_TIMEOUT_MS || 100000;

let token = null;

export const invokeTelogisEndpoint = async formattedQueryParams => {
  const url = `${TELOGIS_URL}?${formattedQueryParams}`;

  if (!token) {
    console.log(`Telogis token not found`);
    token = await getTelogisToken();
  } else {
    console.log(`Stored Telogis token [${token}] will be used`);
  }

  let response = await executeTelogisApiRequest(url);

  if (!response.ok) {
    if (response.status === 401) {
      console.log(
        `Authentication token has expired. Endpoint will be retried with a new token.`
      );
      token = await getTelogisToken();
      response = await executeTelogisApiRequest(url);
      if (!response.ok) {
        console.error(
          `Unexpected response returned during retry of Telogis API: [${url}] Status: ${
            response.status
          }`
        );
        throw new Error(TELOGIS_API_INVOCATION_FAILURE);
      }
    } else {
      console.error(
        `Unexpected response returned while executing Telogis API: [${url}] Status: ${
          response.status
        }`
      );
      throw new Error(TELOGIS_API_INVOCATION_FAILURE);
    }
  }

  return response.json();
};

export const getTelogisToken = async () => {
  let authResponse;
  try {
    authResponse = await fetch(
      `${TELOGIS_AUTH_URL}/${process.env.TELOGIS_USERNAME}/${
        process.env.TELOGIS_PASSWORD
      }`
    );
  } catch (e) {
    console.error(`Error occurred while authenticating with Telogis: ${e}`);
    throw new Error(TELOGIS_AUTHENTICATION_FAILURE);
  }

  if (!authResponse.ok) {
    console.error(
      `Unexpected response returned while authenticating with Telogis: ${
        authResponse.status
      }`
    );
    throw new Error(TELOGIS_AUTHENTICATION_FAILURE);
  }

  const authResponseJson = await authResponse.json();
  return authResponseJson.token;
};

export const executeTelogisApiRequest = async url => {
  console.log(`Executing Telogis API: ${url}`);
  let response;
  try {
    response = await fetch(
      url.indexOf('?') === -1 ? `${url}?auth=${token}` : `${url}&auth=${token}`,
      {
        timeout: TELOGIS_REQUEST_TIMEOUT_MS
      }
    );
  } catch (e) {
    console.error(
      `Error occurred while executing Telogis API: [${url}] Error: ${e}`
    );
    throw new Error(TELOGIS_API_INVOCATION_FAILURE);
  }
  return response;
};
