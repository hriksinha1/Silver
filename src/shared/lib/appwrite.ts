import { Account, Client, ExecutionMethod, Functions } from 'appwrite';

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const functionId = import.meta.env.VITE_APPWRITE_STORE_FUNCTION_ID;

export const isAppwriteConfigured = Boolean(endpoint && projectId && functionId);
export const isCheckoutEnabled = import.meta.env.VITE_CHECKOUT_ENABLED === 'true';

const client = new Client();

if (endpoint && projectId) {
  client.setEndpoint(endpoint).setProject(projectId);
}

export const account = new Account(client);
const functions = new Functions(client);

export async function callStoreFunction<T>(
  path: string,
  payload: Record<string, unknown>,
  authenticated = false
): Promise<T> {
  if (!isAppwriteConfigured) {
    throw new Error('Checkout is not configured yet. Please contact the store.');
  }
  if (!isCheckoutEnabled) {
    throw new Error('Checkout is not enabled yet. Please contact the store.');
  }

  const headers: Record<string, string> = {};
  if (authenticated) {
    const jwt = await account.createJWT();
    headers['x-appwrite-user-jwt'] = jwt.jwt;
  }

  const execution = await functions.createExecution(
    functionId,
    JSON.stringify(payload),
    false,
    path,
    ExecutionMethod.POST,
    headers
  );

  if (execution.responseStatusCode < 200 || execution.responseStatusCode >= 300) {
    let message = 'The request could not be completed. Please try again.';
    try {
      const response = JSON.parse(execution.responseBody) as { error?: string };
      if (response.error) message = response.error;
    } catch {
      if (execution.responseBody.trim()) message = execution.responseBody;
    }
    throw new Error(message);
  }

  try {
    return JSON.parse(execution.responseBody) as T;
  } catch {
    throw new Error('The store returned an invalid response. Please try again.');
  }
}
