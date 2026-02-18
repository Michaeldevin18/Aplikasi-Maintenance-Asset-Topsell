import { createClient } from '@supabase/supabase-js';
import { Capacitor, CapacitorHttp } from '@capacitor/core';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key');
}

async function nativeFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
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

function isBinaryBody(body: unknown): boolean {
  if (!body) return false;
  if (typeof FormData !== 'undefined' && body instanceof FormData) return true;
  if (typeof Blob !== 'undefined' && body instanceof Blob) return true;
  if (typeof ArrayBuffer !== 'undefined' && body instanceof ArrayBuffer) return true;
  if (typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView(body as any)) return true;
  return false;
}

const fetchImpl: typeof fetch = (input: any, init?: any) => {
  if (Capacitor.isNativePlatform && Capacitor.isNativePlatform()) {
    if (!isBinaryBody(init?.body)) {
      return nativeFetch(input, init);
    }
  }
  return fetch(input, init);
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: fetchImpl,
  },
});
