import { Capacitor, CapacitorHttp } from '@capacitor/core';

export async function appFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const isNative = Capacitor.isNativePlatform && Capacitor.isNativePlatform();
  if (!isNative) {
    return fetch(input, init);
  }

  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
  const method = (init?.method || 'GET').toUpperCase();

  const headers = new Headers(init?.headers || undefined);
  const contentType = headers.get('Content-Type') || headers.get('content-type') || '';

  let data: any = undefined;
  if (init?.body != null) {
    if (typeof init.body === 'string') {
      if (contentType.includes('application/json')) {
        try {
          data = JSON.parse(init.body);
        } catch {
          data = init.body;
        }
      } else {
        data = init.body;
      }
    } else {
      data = init.body as any;
    }
  }

  const capRes = await CapacitorHttp.request({
    url,
    method,
    headers: Object.fromEntries(headers.entries()),
    data,
  });

  const resHeaders = new Headers();
  if (capRes.headers) {
    for (const [k, v] of Object.entries(capRes.headers)) {
      if (Array.isArray(v)) {
        resHeaders.set(k, v.join(', '));
      } else if (typeof v === 'string') {
        resHeaders.set(k, v);
      }
    }
  }

  const bodyText = typeof capRes.data === 'string' ? capRes.data : JSON.stringify(capRes.data ?? null);
  return new Response(bodyText, {
    status: capRes.status,
    headers: resHeaders,
  });
}

