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

  const requestBody = body ? JSON.stringify(body) : null;

  // Debug logging
  console.log('BaaS API Request:', {
    url: `${BAAS_API_URL}${path}`,
    method,
    body: requestBody,
  });

  const response = await fetch(`${BAAS_API_URL}${path}`, {
    method,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    body: requestBody,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error:', errorText);
    throw new Error(`BaaS API request failed: ${response.statusText}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}
