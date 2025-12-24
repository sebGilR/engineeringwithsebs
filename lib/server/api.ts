const BAAS_API_URL = process.env.BAAS_API_URL;

if (!BAAS_API_URL) {
  throw new Error('BAAS_API_URL is not set');
}

type FetchOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  accessToken?: string;
};

export async function fetchFromBaasAPI(
  path: string,
  options: FetchOptions = {}
) {
  const { method = 'GET', headers = {}, body, accessToken } = options;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/vnd.api+json',
    Accept: 'application/vnd.api+json',
  };

  if (accessToken) {
    defaultHeaders['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${BAAS_API_URL}${path}`, {
    method,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    body: body ? JSON.stringify(body) : null,
  });

  if (!response.ok) {
    // TODO: Handle errors more gracefully
    console.error('API Error:', await response.text());
    throw new Error(`BaaS API request failed: ${response.statusText}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}
